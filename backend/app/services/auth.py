import hashlib
import hmac
import json
import base64
from datetime import datetime, timedelta, timezone

from passlib.context import CryptContext

from app.config import settings


# Password hashing context using bcrypt with automatic salt generation
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a password using bcrypt with a unique random salt."""
    return pwd_context.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    """Verify a password against a bcrypt hash."""
    return pwd_context.verify(password, hashed)


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
