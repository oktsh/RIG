"""Test soft delete functionality."""
from datetime import datetime
from app.database import SessionLocal
from app.models.db import Prompt
from app.models.enums import ContentStatus
from app.services.prompt_service import prompt_service

db = SessionLocal()

try:
    # Create a test prompt
    test_prompt = Prompt(
        title="Test Soft Delete",
        desc="Testing soft delete functionality",
        content="This is a test",
        status=ContentStatus.DRAFT,
        author_name="Test User",
    )
    db.add(test_prompt)
    db.commit()
    db.refresh(test_prompt)
    prompt_id = test_prompt.id
    print(f"✅ Created prompt with ID: {prompt_id}")

    # Verify it's in the list (not deleted)
    prompts = prompt_service.get_multi(db, include_deleted=False)
    assert any(p.id == prompt_id for p in prompts), "Prompt should be in list"
    print(f"✅ Prompt {prompt_id} is visible in normal list")

    # Soft delete it
    deleted = prompt_service.delete(db, prompt_id, soft=True)
    assert deleted is not None, "Delete should return the prompt"
    assert deleted.deleted_at is not None, "deleted_at should be set"
    print(f"✅ Soft deleted prompt {prompt_id}, deleted_at: {deleted.deleted_at}")

    # Verify it's NOT in the normal list (deleted)
    prompts = prompt_service.get_multi(db, include_deleted=False)
    assert not any(p.id == prompt_id for p in prompts), "Prompt should be hidden from normal list"
    print(f"✅ Prompt {prompt_id} is hidden from normal list")

    # Verify it IS in the list when include_deleted=True
    prompts = prompt_service.get_multi(db, include_deleted=True)
    assert any(p.id == prompt_id for p in prompts), "Prompt should be in list with include_deleted=True"
    print(f"✅ Prompt {prompt_id} is visible when include_deleted=True")

    # Restore it
    restored = prompt_service.restore(db, prompt_id)
    assert restored is not None, "Restore should return the prompt"
    assert restored.deleted_at is None, "deleted_at should be None after restore"
    print(f"✅ Restored prompt {prompt_id}, deleted_at is now None")

    # Verify it's back in the normal list
    prompts = prompt_service.get_multi(db, include_deleted=False)
    assert any(p.id == prompt_id for p in prompts), "Prompt should be back in normal list"
    print(f"✅ Prompt {prompt_id} is back in normal list after restore")

    # Clean up: hard delete the test prompt
    prompt_service.delete(db, prompt_id, soft=False)
    print(f"✅ Hard deleted test prompt {prompt_id}")

    print("\n🎉 All soft delete tests PASSED!")

finally:
    db.close()
