# app/main.py
import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from io import BytesIO

load_dotenv()

from app.ocr import perform_ocr
from app.mock_mcp import get_account_data
from app.gpt_helpers import ask_gpt
from app.fusion import match_receipt_to_transactions
from app.auth import create_token, verify_token
from app.crypto_utils import encrypt_bytes, decrypt_bytes

app = FastAPI(title="Receipt AI Hackathon API")

# CORS - allow local frontend during hackathon
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# stores
STORE = {
    "receipts": [],   # will store encrypted image/text for demo
    "transactions": get_account_data()["transactions"].copy()
}

@app.get("/healthz")
def health():
    return {"status": "ok"}

@app.post("/auth/login-demo")
def login_demo():
    token = create_token(user_id="demo_user")
    return {"token": token}

@app.post("/upload")
async def upload_receipt(file: UploadFile = File(...), auth=Depends(lambda: None)):
    # Note: we accept uploads without auth for hackathon demo. For production, require verify_token.
    contents = await file.read()
    # For demo store encrypted image bytes
    enc_image = encrypt_bytes(contents)
    # perform OCR (on raw bytes)
    ocr_res = perform_ocr(contents)

    rec_id = len(STORE["receipts"]) + 1
    rec = {
        "id": rec_id,
        "filename": file.filename,
        "ocr_encrypted_text": encrypt_bytes(ocr_res.get("text", "").encode()),
        "ocr_encrypted_fields": encrypt_bytes(str(ocr_res.get("fields", {})).encode()),
        "image_encrypted": enc_image,
        "reconciliation": None,
        "uploader": "demo_user"
    }
    STORE["receipts"].append(rec)

    # create demo transaction
    amount = None
    try:
        total_field = ocr_res.get("fields", {}).get("total")
        if total_field:
            amount = float(str(total_field))
    except Exception:
        amount = None

    txn = {
        "id": f"r{rec_id}",
        "date": ocr_res.get("fields", {}).get("date") or "2025-09-05",
        "merchant": ocr_res.get("fields", {}).get("merchant") or "Unknown",
        "amount": amount,
        "category": "Uncategorized"
    }
    STORE["transactions"].append(txn)

    # attempt reconciliation using visible transactions
    decrypted_fields = ocr_res.get("fields", {})
    best_match = match_receipt_to_transactions(decrypted_fields, STORE["transactions"])
    if best_match:
        rec["reconciliation"] = best_match

    # Return safe metadata (not raw encrypted blobs)
    return {"ok": True, "receipt": {"id": rec["id"], "filename": rec["filename"], "reconciliation": rec["reconciliation"]}, "new_txn": txn}

@app.get("/receipts")
def list_receipts(token: str = None):
    # Return metadata; do not return encrypted content
    return [
        {"id": r["id"], "filename": r["filename"], "uploader": r.get("uploader"), "has_reconciliation": r.get("reconciliation") is not None}
        for r in STORE["receipts"]
    ]

@app.get("/receipts/{rid}")
def get_receipt(rid: int):
    rec = next((r for r in STORE["receipts"] if r["id"] == rid), None)
    if not rec:
        raise HTTPException(status_code=404, detail="Receipt not found")
    text = decrypt_bytes(rec["ocr_encrypted_text"]).decode()
    fields = eval(decrypt_bytes(rec["ocr_encrypted_fields"]).decode())
    return {"id": rec["id"], "filename": rec["filename"], "ocr_fields": fields, "ocr_text": text, "reconciliation": rec.get("reconciliation")}

@app.get("/receipts/{rid}/image")
def get_receipt_image(rid: int):
    rec = next((r for r in STORE["receipts"] if r["id"] == rid), None)
    if not rec:
        raise HTTPException(status_code=404, detail="Receipt not found")
    img_bytes = decrypt_bytes(rec["image_encrypted"])
    return StreamingResponse(BytesIO(img_bytes), media_type="image/jpeg")

@app.delete("/receipts/{rid}")
def delete_receipt(rid: int):
    idx = next((i for i, r in enumerate(STORE["receipts"]) if r["id"] == rid), None)
    if idx is None:
        raise HTTPException(status_code=404, detail="Receipt not found")
    STORE["receipts"].pop(idx)
    return {"ok": True, "deleted": rid}

@app.post("/reconcile/{rid}")
def reconcile_receipt(rid: int):
    rec = next((r for r in STORE["receipts"] if r["id"] == rid), None)
    if not rec:
        raise HTTPException(status_code=404, detail="Receipt not found")
    fields = eval(decrypt_bytes(rec["ocr_encrypted_fields"]).decode())
    best = match_receipt_to_transactions(fields, STORE["transactions"])
    rec["reconciliation"] = best
    return {"ok": True, "reconciliation": best}

@app.get("/transactions")
def get_transactions():
    return {"transactions": STORE["transactions"]}

from fastapi import Depends
@app.post("/chat")
async def chat(question: dict, token: dict = Depends(lambda: None)):
    q = question.get("question")
    if not q:
        raise HTTPException(status_code=400, detail="Missing question")
    txns = STORE["transactions"][-20:]
    answer = ask_gpt(txns, q)
    return {"answer": answer}
