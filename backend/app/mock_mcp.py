# app/mock_mcp.py
def get_account_data(user_id="demo"):
    SAMPLE_TXNS = [
        {"id": "t1", "date": "2025-09-01", "merchant": "Starbucks", "amount": 220.0, "category": "Food", "mode": "Card"},
        {"id": "t2", "date": "2025-09-02", "merchant": "Zomato", "amount": 800.0, "category": "Food", "mode": "Card"},
        {"id": "t3", "date": "2025-09-03", "merchant": "Amazon", "amount": 2500.0, "category": "Shopping", "mode": "Card"},
    ]
    return {"user_id": user_id, "balance": 45000.0, "transactions": SAMPLE_TXNS}
