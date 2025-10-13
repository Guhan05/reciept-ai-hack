# ocr.py
import os
from io import BytesIO
from PIL import Image, ImageOps
import pytesseract
import base64
import json

USE_GOOGLE = os.getenv("USE_GOOGLE_VISION", "false").lower() == "true"

if USE_GOOGLE:
    from google.cloud import vision

def preprocess_image_bytes(image_bytes):
    img = Image.open(BytesIO(image_bytes)).convert("RGB")
    # simple deskew/contrast steps if needed
    img = ImageOps.autocontrast(img)
    buf = BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()

def ocr_local(image_bytes):
    from PIL import Image
    img = Image.open(BytesIO(image_bytes))
    text = pytesseract.image_to_string(img)
    return {"text": text}

def ocr_google(image_bytes):
    client = vision.ImageAnnotatorClient()
    image = vision.Image(content=image_bytes)
    response = client.document_text_detection(image=image)
    if response.error.message:
        raise Exception(response.error.message)
    return {"text": response.full_text_annotation.text}

def extract_fields_from_text(text):
    # VERY simple heuristics - extend for your hackathon
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    total = None
    date = None
    merchant = lines[0] if lines else "Unknown"
    for l in reversed(lines):
        l_lower = l.lower()
        if "total" in l_lower or "amount" in l_lower or "balance" in l_lower:
            # pick numbers in line
            import re
            nums = re.findall(r"[\d,.]+", l)
            if nums:
                total = nums[-1]
                break
    return {"merchant": merchant, "total": total, "raw_lines": lines}

def perform_ocr(image_bytes):
    clean = preprocess_image_bytes(image_bytes)
    if USE_GOOGLE:
        res = ocr_google(clean)
    else:
        res = ocr_local(clean)
    fields = extract_fields_from_text(res["text"])
    return {"text": res["text"], "fields": fields}
# app/ocr.py
import os
from io import BytesIO
from PIL import Image, ImageOps
import pytesseract

USE_GOOGLE = os.getenv("USE_GOOGLE_VISION", "false").lower() == "true"

if USE_GOOGLE:
    from google.cloud import vision

def preprocess_image_bytes(image_bytes):
    img = Image.open(BytesIO(image_bytes)).convert("RGB")
    img = ImageOps.autocontrast(img)
    buf = BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()

def ocr_local(image_bytes):
    img = Image.open(BytesIO(image_bytes))
    text = pytesseract.image_to_string(img)
    return {"text": text}

def ocr_google(image_bytes):
    client = vision.ImageAnnotatorClient()
    image = vision.Image(content=image_bytes)
    response = client.document_text_detection(image=image)
    if response.error.message:
        raise Exception(response.error.message)
    return {"text": response.full_text_annotation.text}

def extract_fields_from_text(text):
    # Very simple heuristics for hackathon. Improve later.
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    total = None
    date = None
    merchant = lines[0] if lines else "Unknown"
    import re
    for l in reversed(lines):
        l_lower = l.lower()
        if "total" in l_lower or "amount" in l_lower or "balance" in l_lower:
            nums = re.findall(r"[\d\.,]+", l)
            if nums:
                total = nums[-1].replace(",", "")
                break
    # simple date extraction (first found YYYY-MM-DD)
    for l in lines:
        m = re.search(r"(\d{4}-\d{2}-\d{2})", l)
        if m:
            date = m.group(1)
            break
    return {"merchant": merchant, "total": total, "date": date, "raw_lines": lines}

def perform_ocr(image_bytes):
    clean = preprocess_image_bytes(image_bytes)
    if USE_GOOGLE:
        res = ocr_google(clean)
    else:
        res = ocr_local(clean)
    fields = extract_fields_from_text(res["text"])
    return {"text": res["text"], "fields": fields}
