# app/ocr.py
import os
from io import BytesIO
from PIL import Image, ImageOps
import pytesseract
import re
import json

USE_GOOGLE = os.getenv("USE_GOOGLE_VISION", "false").lower() == "true"

if USE_GOOGLE:
    from google.cloud import vision

def preprocess_image_bytes(image_bytes: bytes) -> bytes:
    img = Image.open(BytesIO(image_bytes)).convert("RGB")
    img = ImageOps.autocontrast(img)
    buf = BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()

def ocr_local(image_bytes: bytes) -> dict:
    img = Image.open(BytesIO(image_bytes))
    text = pytesseract.image_to_string(img)
    return {"text": text}

def ocr_google(image_bytes: bytes) -> dict:
    client = vision.ImageAnnotatorClient()
    image = vision.Image(content=image_bytes)
    response = client.document_text_detection(image=image)
    if response.error.message:
        raise Exception(response.error.message)
    return {"text": response.full_text_annotation.text}

def extract_fields_from_text(text: str) -> dict:
    # Heuristic extraction - basic for hackathon
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    merchant = lines[0] if lines else "Unknown"
    total = None
    date = None
    # find a total-like line
    for l in reversed(lines):
        low = l.lower()
        if "total" in low or "amount" in low or "balance" in low:
            nums = re.findall(r"[\d\.,]+", l)
            if nums:
                total = nums[-1].replace(",", "")
                break
    # find date in YYYY-MM-DD or common formats
    date_match = re.search(r"(\d{4}-\d{2}-\d{2})", text)
    if date_match:
        date = date_match.group(1)
    else:
        # fallback: try DD/MM/YYYY
        dm = re.search(r"(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})", text)
        if dm:
            date = dm.group(1)
    return {"merchant": merchant, "total": total, "date": date, "raw_lines": lines}

def perform_ocr(image_bytes: bytes) -> dict:
    clean = preprocess_image_bytes(image_bytes)
    if USE_GOOGLE:
        res = ocr_google(clean)
    else:
        res = ocr_local(clean)
    fields = extract_fields_from_text(res["text"])
    # ensure JSON-serializable
    return {"text": res["text"], "fields": fields}
