# mock_mcp.py
import datetime
# sample transactions
SAMPLE_TXNS = [
    {"id":"t1","date":"2025-09-01","merchant":"Starbucks","amount":220,"category":"Food"},
    {"id":"t2","date":"2025-09-02","merchant":"Zomato","amount":800,"category":"Food"},
    {"id":"t3","date":"2025-09-03","merchant":"Amazon","amount":2500,"category":"Shopping"}
]

def get_account_data(user_id="demo"):
    return {"user_id": user_id, "balance": 45000, "transactions": SAMPLE_TXNS}
def add_transaction(user_id, merchant, amount, category="Misc"):
    new_txn = {
        "id": f"t{len(SAMPLE_TXNS)+1}",
        "date": datetime.date.today().isoformat(),
        "merchant": merchant,
        "amount": amount,
        "category": category
    }
    SAMPLE_TXNS.append(new_txn)
    return new_txn