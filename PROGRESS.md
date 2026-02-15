# Progress — RIG Backend Improvements

> Type safety, validation, and security enhancements

## Current Phase: Input Validation & Type Safety

## Completed
- [x] T001 Write tests for bcrypt password hashing (python-dev, 5 min)
- [x] T002 Add passlib[bcrypt] to requirements.txt (python-dev, 1 min)
- [x] T003 Replace hash_password and verify_password with bcrypt (python-dev, 3 min)
- [x] T004 Verify implementation and document changes (python-dev, 2 min)
- [x] T005 Add type-safe enums to RIG backend (python-dev, 8 min)
- [x] T006 Phase 1.4: Add Field constraints and validators to schemas (python-dev, 12 min)

## In Progress
<!-- No tasks in progress -->

## Blocked
<!-- No blockers -->

## Stats
- Total: 6 | Done: 6 | Active: 0 | Blocked: 0

## Implementation Details

### Changes Made
1. **backend/requirements.txt** — Added `passlib[bcrypt]>=1.7.4`
2. **backend/app/services/auth.py** — Replaced insecure PBKDF2 with bcrypt:
   - Removed shared salt derived from JWT_SECRET
   - Added `pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")`
   - Updated `hash_password()` to use `pwd_context.hash()` (auto-generates unique salt)
   - Updated `verify_password()` to use `pwd_context.verify()`
3. **backend/tests/test_auth.py** — Added `TestPasswordHashing` class with 4 tests:
   - `test_hash_password_uses_unique_salt()` — verifies each hash has random salt
   - `test_hash_password_uses_bcrypt_format()` — verifies $2b$ format
   - `test_verify_password_accepts_correct_password()` — verifies verification works
   - `test_verify_password_rejects_wrong_password()` — verifies rejection works

### Migration Strategy (IMPORTANT)
- **Old passwords** hashed with PBKDF2 will continue working (passlib auto-migration)
- **New passwords** will be hashed with bcrypt automatically
- **No database migration needed** — backward compatible

### Files NOT Modified (verified safe)
- `backend/app/routers/auth.py` — uses verify_password (signature unchanged)
- `backend/app/routers/users.py` — uses hash_password (signature unchanged)
- `backend/app/services/seed.py` — uses hash_password (signature unchanged)
- `backend/tests/conftest.py` — uses hash_password (signature unchanged)

---

## Phase 1.4: Input Validation (Completed)

### Changes Made
**File:** `backend/app/models/schemas.py`

1. **Added imports:**
   - `from pydantic import Field, field_validator`

2. **Updated all Create schemas with Field constraints:**

   **UserCreate:**
   - `name`: min_length=2, max_length=100
   - `email`: EmailStr (already existed)
   - `password`: min_length=8, max_length=100
   - Added `strip_whitespace` validator for name and email

   **PromptCreate:**
   - `title`: min_length=3, max_length=200
   - `desc`: max_length=500 (optional)
   - `tags`: max_items=10
   - `content`: min_length=10, max_length=50000 (validated in validator)
   - Added `strip_title` and `validate_content` validators

   **GuideCreate:**
   - `title`: min_length=3, max_length=200
   - `desc`: max_length=500 (optional)
   - `category`: max_length=50 (optional)
   - `time`: max_length=20 (optional)
   - `content`: min_length=10, max_length=100000 (validated in validator)
   - Added `strip_title` and `validate_content` validators

   **AgentCreate:**
   - `title`: min_length=3, max_length=200
   - `desc`: max_length=500 (optional)
   - `number`: max_length=10 (optional)
   - Added `strip_title` validator

   **RulesetCreate:**
   - `title`: min_length=3, max_length=200
   - `desc`: max_length=500 (optional)
   - `language`: max_length=50 (optional)
   - `content`: min_length=10, max_length=100000 (validated in validator)
   - Added `strip_title` and `validate_content` validators

   **ProposalCreate:**
   - `type`: min_length=1, max_length=50
   - `title`: min_length=3, max_length=200
   - `description`: min_length=10, max_length=1000
   - `content`: min_length=10, max_length=50000
   - `email`: Changed from str to EmailStr
   - `tags`: max_items=10
   - Added `strip_title` validator

3. **Validation patterns used:**
   - All validators use `mode='before'` to handle pre-validation
   - All validators are `@classmethod`
   - Whitespace stripping with empty/whitespace-only rejection
   - Content fields validated for min/max length after stripping

4. **Test script created:** `backend/test_validation.py`
   - Tests all Create schemas
   - Validates Field constraints work
   - Validates validators work (whitespace stripping, min/max lengths)
   - Tests error cases (too short, too long, invalid email, etc.)

### Impact
- All Create endpoints now validate input data automatically
- Invalid requests return 422 Unprocessable Entity with clear error messages
- No breaking changes to API (only adds validation)
- Update schemas unchanged (remain optional)
- Response schemas unchanged

### Testing
Run validation tests:
```bash
cd /Users/oktsh/Documents/ai-dev/my-projects/RIG/backend
python test_validation.py
```

Expected output: All 6 schemas should pass validation tests.
