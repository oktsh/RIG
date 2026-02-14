import hashlib
import hmac
import json
import base64
from datetime import datetime, timedelta, timezone

from app.config import settings


def hash_password(password: str) -> str:
    salt = hashlib.sha256(settings.JWT_SECRET.encode()).hexdigest()[:16]
    return hashlib.pbkdf2_hmac(
        "sha256", password.encode(), salt.encode(), 100000
    ).hex()


def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed


def _b64encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def _b64decode(s: str) -> bytes:
    padding = 4 - len(s) % 4
    if padding != 4:
        s += "=" * padding
    return base64.urlsafe_b64decode(s)


def create_access_token(user_id: int, role: str) -> str:
    header = _b64encode(json.dumps({"alg": "HS256", "typ": "JWT"}).encode())
    payload_data = {
        "sub": str(user_id),
        "role": role,
        "exp": int(
            (datetime.now(timezone.utc) + timedelta(hours=settings.JWT_EXPIRATION_HOURS)).timestamp()
        ),
    }
    payload = _b64encode(json.dumps(payload_data).encode())
    signature = hmac.new(
        settings.JWT_SECRET.encode(), f"{header}.{payload}".encode(), hashlib.sha256
    ).digest()
    sig = _b64encode(signature)
    return f"{header}.{payload}.{sig}"


def decode_access_token(token: str) -> dict | None:
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None

        header, payload, sig = parts
        expected_sig = _b64encode(
            hmac.new(
                settings.JWT_SECRET.encode(),
                f"{header}.{payload}".encode(),
                hashlib.sha256,
            ).digest()
        )
        if not hmac.compare_digest(sig, expected_sig):
            return None

        payload_data = json.loads(_b64decode(payload))
        if payload_data.get("exp", 0) < datetime.now(timezone.utc).timestamp():
            return None

        return payload_data
    except Exception:
        return None
