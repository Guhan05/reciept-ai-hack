# app/ai_helpers.py
from typing import List, Dict

def ask_ai(transactions: List[Dict], user_question: str) -> str:
    """
    Simulates an AI response by checking for keywords in the user's question
    and providing a predefined or dynamically calculated answer.
    """
    
    question = user_question.lower()

    # --- Data-Driven Question 1: Spending on a Category ---
    if 'food' in question or 'dining' in question or 'groceries' in question:
        food_total = 0
        food_categories = ['food', 'dining', 'groceries']
        for t in transactions:
            if t.get('category', '').lower() in food_categories and t.get('amount', 0) < 0:
                food_total += abs(t.get('amount', 0))
        
        if food_total > 0:
            return f"Based on your recent transactions, you have spent ₹{food_total:,.2f} on food and dining."
        else:
            return "I couldn't find any recent spending on food in your transactions."

    # --- Data-Driven Question 2: Biggest Expense ---
    if 'biggest expense' in question or 'largest purchase' in question or 'most expensive' in question:
        expenses = [t for t in transactions if t.get('amount', 0) < 0]
        if not expenses:
            return "I couldn't find any expenses in your recent transactions."
        
        biggest_expense = min(expenses, key=lambda x: x['amount'])
        merchant = biggest_expense.get('merchant')
        amount = abs(biggest_expense.get('amount', 0))
        date = biggest_expense.get('date')
        
        return f"Your biggest expense seems to be a purchase at {merchant} for ₹{amount:,.2f} on {date}."

    # --- Generic Question 3: Saving Tips ---
    if 'tips' in question or 'save money' in question:
        return (
            "Of course! Here are a few popular tips for saving money:\n"
            "1. **Create a Budget:** Track your income and expenses to see where your money is going.\n"
            "2. **Automate Savings:** Set up automatic transfers to a savings account each payday.\n"
            "3. **Review Subscriptions:** Cancel any subscriptions you don't use regularly."
        )
        
    # --- Fallback Answer for any other question ---
    return (
        "For this demo, I have a limited set of responses. Please try asking one of the following:\n"
        "- 'How much did I spend on food?'\n"
        "- 'What was my biggest expense?'\n"
        "- 'Give me some tips to save money'"
    )