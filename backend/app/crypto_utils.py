# app/crypto_utils.py
import os
import base64
from cryptography.fernet import Fernet

# Read key from env or generate temporary for demo (do NOT auto-generate in production)
FERNET_KEY = os.getenv("ENCRYPTION_KEY")
if not FERNET_KEY:
    # generate and show a base64 key (demo). In production, provide stable key via .env and KMS.
    FERNET_KEY = Fernet.generate_key().decode()
    # Warning: If you restart the app without a stable ENCRYPTION_KEY, old data cannot be decrypted.

fernet = Fernet(FERNET_KEY.encode() if isinstance(FERNET_KEY, str) else FERNET_KEY)

def encrypt_bytes(b: bytes) -> str:
    return fernet.encrypt(b).decode()

def decrypt_bytes(token: str) -> bytes:
    return fernet.decrypt(token.encode())

def encrypt_json(obj) -> str:
    import json
    return encrypt_bytes(json.dumps(obj).encode())

def decrypt_json(token: str):
    import json
    raw = decrypt_bytes(token)
    return json.loads(raw.decode())
