# app/gpt_helpers.py
import os
import openai
from typing import List, Dict

openai.api_key = os.getenv("OPENAI_API_KEY")

SYSTEM_PROMPT = """You are a concise personal finance assistant. Use only the provided transaction data to answer the user's question. If required data is missing, reply: "I don't have enough data to answer that." Keep answers short and actionable."""

def format_transactions_for_context(txns: List[Dict]) -> str:
    lines = []
    for t in txns:
        lines.append(f"{t.get('date')} | {t.get('merchant')} | {t.get('amount')}")
    return "\n".join(lines)

def ask_gpt(transactions: List[Dict], user_question: str, max_tokens: int = 200) -> str:
    if not openai.api_key:
        return "OpenAI API key not configured in backend."
    context = format_transactions_for_context(transactions)
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": f"Recent transactions:\n{context}\n\nQuestion: {user_question}"}
    ]
    # Use a reliably-available model; change if needed
    model = "gpt-3.5-turbo"
    try:
        resp = openai.ChatCompletion.create(model=model, messages=messages, max_tokens=max_tokens, temperature=0.2)
        return resp["choices"][0]["message"]["content"].strip()
    except Exception as e:
        return f"LLM error: {str(e)}"
