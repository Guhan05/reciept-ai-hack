# app/main.py
import os
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
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
from app.crypto_utils import encrypt_bytes, decrypt_bytes, encrypt_json, decrypt_json

app = FastAPI(title="Receipt AI — Backend (Demo)")

# CORS for local dev (frontend at 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory demo store
STORE = {
    "receipts": [],   # each receipt: id, filename, uploader, image_encrypted, fields_encrypted, text_encrypted, reconciliation
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
async def upload_receipt(file: UploadFile = File(...), token: dict = Depends(verify_token)):
    """
    Upload receipt image:
    - store encrypted image and encrypted OCR fields/text
    - create a demo transaction (synthetic) based on OCR total (if found)
    - run reconciliation with existing transactions and attach result
    """
    contents = await file.read()

    # OCR (use local or Google Vision per env)
    ocr_res = perform_ocr(contents)

    # encrypt and store
    enc_image = encrypt_bytes(contents)
    enc_text = encrypt_bytes(ocr_res.get("text", "").encode())
    enc_fields = encrypt_json(ocr_res.get("fields", {}))

    rec_id = len(STORE["receipts"]) + 1
    rec = {
        "id": rec_id,
        "filename": file.filename,
        "uploader": token.get("sub"),
        "image_encrypted": enc_image,
        "text_encrypted": enc_text,
        "fields_encrypted": enc_fields,
        "reconciliation": None
    }
    STORE["receipts"].append(rec)

    # synthetic transaction (demo)
    amount = None
    try:
        total_field = ocr_res.get("fields", {}).get("total")
        if total_field is not None:
            amount = float(str(total_field))
    except Exception:
        amount = None

    txn = {
        "id": f"r{rec_id}",
        "date": ocr_res.get("fields", {}).get("date") or "2025-09-05",
        "merchant": ocr_res.get("fields", {}).get("merchant") or "Unknown",
        "amount": amount,
        "category": "Uncategorized",
        "mode": "Card"
    }
    STORE["transactions"].append(txn)

    # attempt reconciliation
    try:
        fields_plain = ocr_res.get("fields", {})
        best = match_receipt_to_transactions(fields_plain, STORE["transactions"])
        if best:
            rec["reconciliation"] = best
    except Exception:
        rec["reconciliation"] = None

    # return safe metadata (no encrypted blobs)
    return {"ok": True, "receipt": {"id": rec_id, "filename": rec["filename"], "reconciliation": rec.get("reconciliation")}, "new_txn": txn}

@app.get("/receipts")
def list_receipts(token: dict = Depends(verify_token)):
    """
    Return list of receipts metadata for the authenticated user.
    """
    user = token.get("sub")
    items = []
    for r in STORE["receipts"]:
        if r.get("uploader") != user:
            continue
        items.append({
            "id": r["id"],
            "filename": r["filename"],
            "has_reconciliation": r.get("reconciliation") is not None
        })
    return items

@app.get("/receipts/{rid}")
def get_receipt(rid: int, token: dict = Depends(verify_token)):
    r = next((x for x in STORE["receipts"] if x["id"] == rid), None)
    if not r:
        raise HTTPException(status_code=404, detail="Receipt not found")
    if r.get("uploader") != token.get("sub"):
        raise HTTPException(status_code=403, detail="Forbidden")
    # decrypt structured fields and text
    fields = decrypt_json(r["fields_encrypted"])
    text = decrypt_bytes(r["text_encrypted"]).decode()
    return {"id": r["id"], "filename": r["filename"], "ocr_fields": fields, "ocr_text": text, "reconciliation": r.get("reconciliation")}

@app.get("/receipts/{rid}/image")
def get_receipt_image(rid: int, token: dict = Depends(verify_token)):
    r = next((x for x in STORE["receipts"] if x["id"] == rid), None)
    if not r:
        raise HTTPException(status_code=404, detail="Receipt not found")
    if r.get("uploader") != token.get("sub"):
        raise HTTPException(status_code=403, detail="Forbidden")
    img_bytes = decrypt_bytes(r["image_encrypted"])
    return StreamingResponse(BytesIO(img_bytes), media_type="image/jpeg")

@app.delete("/receipts/{rid}")
def delete_receipt(rid: int, token: dict = Depends(verify_token)):
    idx = next((i for i, x in enumerate(STORE["receipts"]) if x["id"] == rid), None)
    if idx is None:
        raise HTTPException(status_code=404, detail="Receipt not found")
    if STORE["receipts"][idx].get("uploader") != token.get("sub"):
        raise HTTPException(status_code=403, detail="Forbidden")
    STORE["receipts"].pop(idx)
    return {"ok": True, "deleted": rid}

@app.post("/reconcile/{rid}")
def reconcile_receipt(rid: int, token: dict = Depends(verify_token)):
    r = next((x for x in STORE["receipts"] if x["id"] == rid), None)
    if not r:
        raise HTTPException(status_code=404, detail="Receipt not found")
    if r.get("uploader") != token.get("sub"):
        raise HTTPException(status_code=403, detail="Forbidden")
    fields = decrypt_json(r["fields_encrypted"])
    best = match_receipt_to_transactions(fields, STORE["transactions"])
    r["reconciliation"] = best
    return {"ok": True, "reconciliation": best}

@app.get("/transactions")
def get_transactions(token: dict = Depends(verify_token)):
    # Return mock + synthetic txns for the owner
    return {"transactions": STORE["transactions"]}

@app.post("/chat")
def chat(payload: dict, token: dict = Depends(verify_token)):
    q = payload.get("question")
    if not q:
        raise HTTPException(status_code=400, detail="Missing question")
    txns = STORE["transactions"][-20:]
    answer = ask_gpt(txns, q)
    return {"answer": answer}
