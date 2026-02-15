"""Test Pydantic Settings v2 validation."""
import os
from pydantic import ValidationError

# Temporarily set a short JWT_SECRET to test validation
os.environ["JWT_SECRET"] = "short"  # Less than 32 chars

try:
    from app.config import Settings
    settings = Settings()
    print("❌ FAILED: Should have raised ValidationError for short JWT_SECRET")
except ValidationError as e:
    print("✅ SUCCESS: Validation caught short JWT_SECRET")
    print(f"   Error: {e.errors()[0]['msg']}")

# Test with valid JWT_SECRET
os.environ["JWT_SECRET"] = "a" * 32  # Exactly 32 chars
try:
    from app.config import Settings
    settings = Settings(_env_file=None)  # Reload settings
    print(f"✅ SUCCESS: Valid JWT_SECRET accepted (length: {len(settings.JWT_SECRET)})")
except ValidationError as e:
    print(f"❌ FAILED: Valid JWT_SECRET rejected: {e}")

# Test CORS parsing
os.environ["CORS_ORIGINS"] = "http://localhost:3000,https://rig.ai,https://app.rig.ai"
settings = Settings(_env_file=None)
print(f"✅ SUCCESS: CORS origins parsed: {settings.cors_origins_list}")
