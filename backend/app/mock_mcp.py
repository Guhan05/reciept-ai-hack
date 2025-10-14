# app/mock_mcp.py

def get_account_data(user_id="demo"):
    """
    Provides initial sample transactions for a new user.
    Expenses must have negative amounts.
    """
    SAMPLE_TXNS = [
        # NOTE: Expenses are now correctly listed with negative amounts
        {"id": "t1", "date": "2025-09-25", "merchant": "Starbucks", "amount": -220.0, "category": "Dining", "mode": "Card"},
        {"id": "t2", "date": "2025-10-02", "merchant": "Zomato", "amount": -800.0, "category": "Food", "mode": "Card"},
        {"id": "t3", "date": "2025-10-05", "merchant": "Amazon", "amount": -2500.0, "category": "Shopping", "mode": "Card"},
        {"id": "t4", "date": "2025-10-10", "merchant": "Uber", "amount": -150.0, "category": "Transport", "mode": "Card"},
        {"id": "t5", "date": "2025-10-12", "merchant": "Salary", "amount": 45000.0, "category": "Income", "mode": "Bank Transfer"},
    ]
    # The balance will be calculated on the frontend now, so this is just for reference.
    return {"user_id": user_id, "balance": 41330.0, "transactions": SAMPLE_TXNS}