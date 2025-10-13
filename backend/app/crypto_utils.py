# app/crypto_utils.py
import os
from cryptography.fernet import Fernet

FERNET_KEY = os.getenv("ENCRYPTION_KEY")
if not FERNET_KEY:
    # generate a key for demo if none provided (print to logs in production avoid)
    FERNET_KEY = Fernet.generate_key().decode()

fernet = Fernet(FERNET_KEY.encode() if isinstance(FERNET_KEY, str) else FERNET_KEY)

def encrypt_bytes(b: bytes) -> str:
    return fernet.encrypt(b).decode()

def decrypt_bytes(token: str) -> bytes:
    return fernet.decrypt(token.encode())
