# app/gpt_helpers.py
import os
import openai
from typing import List, Dict

openai.api_key = os.getenv("OPENAI_API_KEY")

SYSTEM_PROMPT = """You are a concise personal finance assistant. Use only the provided recent transaction data to answer the user's question. If required data is missing, reply: "I don't have enough data to answer that." Be succinct and provide one actionable suggestion if possible."""

def format_transactions_for_context(txns: List[Dict]) -> str:
    # Create a small textual context summary
    lines = []
    for t in txns:
        lines.append(f"{t.get('date')} | {t.get('merchant')} | {t.get('amount')}")
    return "\n".join(lines)

def ask_gpt(transactions: List[Dict], user_question: str, max_tokens: int = 200) -> str:
    # Build context and call OpenAI Chat API (use gpt-3.5-turbo as reliable)
    context = format_transactions_for_context(transactions)
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": f"Recent transactions:\n{context}\n\nQuestion: {user_question}"}
    ]
    model = "gpt-3.5-turbo"
    resp = openai.ChatCompletion.create(model=model, messages=messages, max_tokens=max_tokens, temperature=0.2)
    return resp["choices"][0]["message"]["content"].strip()
