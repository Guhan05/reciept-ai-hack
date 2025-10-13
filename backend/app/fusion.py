# app/fusion.py
from datetime import datetime
from fuzzywuzzy import fuzz

def normalize_merchant(name: str) -> str:
    if not name:
        return ""
    import re
    name = name.lower()
    name = re.sub(r'[^a-z0-9 ]', '', name)
    return name.strip()

def match_receipt_to_transactions(receipt_fields: dict, transactions: list):
    if not receipt_fields:
        return None

    r_merchant = normalize_merchant(receipt_fields.get("merchant", ""))
    r_date = receipt_fields.get("date") or None
    r_amount_raw = receipt_fields.get("total") or receipt_fields.get("amount")

    try:
        r_amount = float(str(r_amount_raw).replace(",", "")) if r_amount_raw else None
    except Exception:
        r_amount = None

    try:
        r_date_obj = datetime.strptime(r_date, "%Y-%m-%d") if r_date else None
    except Exception:
        r_date_obj = None

    best = None
    for txn in transactions:
        t_amount = txn.get("amount")
        if t_amount is None or r_amount is None:
            continue

        amount_diff = abs(t_amount - r_amount)
        if r_amount:
            amount_ok = amount_diff <= max(1.0, 0.02 * r_amount)
        else:
            amount_ok = False

        if not amount_ok:
            continue

        try:
            t_date_obj = datetime.strptime(txn.get("date"), "%Y-%m-%d")
        except Exception:
            t_date_obj = None

        date_ok = True
        date_diff = None
        if t_date_obj and r_date_obj:
            date_diff = abs((t_date_obj - r_date_obj).days)
            date_ok = date_diff <= 2

        score = fuzz.token_set_ratio(r_merchant, normalize_merchant(txn.get("merchant", "")))

        if amount_ok and date_ok:
            confidence = (score / 100) * 0.7 + (1 - (amount_diff / (r_amount + 1))) * 0.3
            confidence = round(confidence, 2)
            if not best or confidence > best["confidence"]:
                best = {
                    "txn": txn,
                    "confidence": confidence,
                    "merchant_score": score,
                    "amount_diff": round(amount_diff, 2),
                    "date_diff_days": date_diff,
                }

    return best
