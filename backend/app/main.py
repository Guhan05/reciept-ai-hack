import os
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from io import BytesIO
from typing import Dict, Optional
from datetime import datetime

load_dotenv()

# We removed the debug print statements for clarity
# print("="*50)
# print(f"[DEBUG from main.py] Is the API Key loaded at startup? -> '{os.getenv('OPENAI_API_KEY')}'")
# print("="*50)

from app.ocr import perform_ocr
from app.mock_mcp import get_account_data
from app.ai_helpers import ask_ai
from app.fusion import match_receipt_to_transactions
from app.auth import create_token, verify_token, get_password_hash, verify_password
from app.crypto_utils import encrypt_bytes, decrypt_bytes, encrypt_json, decrypt_json

app = FastAPI(title="ReceiptAI — Backend")

# ==============================================================================
# VVVV THIS BLOCK WAS MISSING AND IS NOW ADDED BACK VVVV
# This is required for the frontend to be able to log in.
# ==============================================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ==============================================================================


DB = {"users": {},"data": {}}

def get_user_data(username: str) -> Dict:
    if username not in DB["data"]:
        DB["data"][username] = {"receipts": [], "transactions": get_account_data(username)["transactions"].copy()}
    return DB["data"][username]

@app.get("/healthz")
def health():
    return {"status": "ok"}

@app.post("/auth/register")
def register_user(username: str = Body(...), password: str = Body(...)):
    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password are required")
    if len(password.encode('utf-8')) > 72:
        raise HTTPException(status_code=400, detail="Password is too long. Please use a password 72 characters or fewer.")
    if username in DB["users"]:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = get_password_hash(password)
    DB["users"][username] = {"hashed_password": hashed_password}
    get_user_data(username)
    return {"ok": True, "message": "User registered successfully"}

@app.post("/auth/login")
def login_user(username: str = Body(...), password: str = Body(...)):
    user = DB["users"].get(username)
    if not user or not verify_password(password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    token = create_token(user_id=username)
    return {"token": token}

@app.post("/upload")
async def upload_receipt(
    file: UploadFile = File(...), 
    category: str = Form(...),
    token: dict = Depends(verify_token)
):
    username = token.get("sub")
    user_data = get_user_data(username)
    contents = await file.read()
    
    ocr_res = perform_ocr(contents)
    ocr_fields = ocr_res.get("fields", {})

    enc_image = encrypt_bytes(contents)
    enc_text = encrypt_bytes(ocr_res.get("text", "").encode())
    enc_fields = encrypt_json(ocr_fields)
    rec_id = len(user_data["receipts"]) + 1
    rec = { "id": rec_id, "filename": file.filename, "image_encrypted": enc_image, "text_encrypted": enc_text, "fields_encrypted": enc_fields, "reconciliation": None }
    
    best_match = match_receipt_to_transactions(ocr_fields, user_data["transactions"])
    new_txn_created = None

    if best_match and best_match.get("confidence", 0) > 0.8:
        rec["reconciliation"] = best_match
    else:
        amount = None
        try:
            total_field = ocr_fields.get("total")
            if total_field is not None: amount = float(str(total_field).replace(",", ""))
        except Exception:
            amount = None
        
        if amount is not None: amount = -abs(amount)

        new_txn_created = { 
            "id": f"r{rec_id}", 
            "date": ocr_fields.get("date") or datetime.now().strftime("%Y-%m-%d"), 
            "merchant": ocr_fields.get("merchant") or "Scanned Item", 
            "amount": amount, 
            "category": category,
            "mode": "Card" 
        }
        user_data["transactions"].append(new_txn_created)

    user_data["receipts"].append(rec)

    return {
        "ok": True,
        "ocr_fields": ocr_fields,
        "match": best_match,
        "new_txn_created": new_txn_created,
        "receipt_id": rec_id
    }

@app.post("/transactions/manual")
def add_manual_transaction(payload: dict, token: dict = Depends(verify_token)):
    username = token.get("sub")
    user_data = get_user_data(username)
    merchant = payload.get("merchant")
    amount = payload.get("amount")
    category = payload.get("category", "Manual Entry")
    if not all([merchant, amount]): raise HTTPException(status_code=400, detail="Merchant and amount are required")
    try:
        amount_float = -abs(float(amount))
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid amount")
    txn_id = f"m{len(user_data['transactions']) + 1}"
    new_txn = { "id": txn_id, "date": datetime.now().strftime("%Y-%m-%d"), "merchant": merchant, "amount": amount_float, "category": category, "mode": "Manual" }
    user_data["transactions"].append(new_txn)
    return {"ok": True, "transaction": new_txn}

@app.get("/dashboard-data")
def get_dashboard_data(token: dict = Depends(verify_token)):
    username = token.get("sub")
    user_data = get_user_data(username)
    return { "transactions": sorted(user_data["transactions"], key=lambda x: x['date'], reverse=True), "receipts": [{"id": r["id"], "filename": r["filename"]} for r in user_data["receipts"]] }

@app.post("/chat")
def chat(payload: dict, token: dict = Depends(verify_token)):
    username = token.get("sub")
    user_data = get_user_data(username)
    q = payload.get("question")
    if not q:
        raise HTTPException(status_code=400, detail="Missing question")
    txns = user_data["transactions"][-20:]
    answer = ask_ai(txns, q)
    return {"answer": answer}

# The rest of the endpoints are omitted for brevity but should be present in your file
# from the previous versions I sent.