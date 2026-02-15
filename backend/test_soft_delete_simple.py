"""Simple test for soft delete functionality."""
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

    # Test 1: Get the prompt (should work)
    found = prompt_service.get(db, prompt_id, include_deleted=False)
    assert found is not None, "Prompt should be found"
    assert found.deleted_at is None, "deleted_at should be None"
    print(f"✅ Prompt {prompt_id} is retrievable (deleted_at is None)")

    # Test 2: Soft delete it
    deleted = prompt_service.delete(db, prompt_id, soft=True)
    assert deleted is not None, "Delete should return the prompt"
    assert deleted.deleted_at is not None, "deleted_at should be set after delete"
    print(f"✅ Soft deleted prompt {prompt_id}, deleted_at: {deleted.deleted_at}")

    # Test 3: Try to get it without include_deleted (should fail)
    not_found = prompt_service.get(db, prompt_id, include_deleted=False)
    assert not_found is None, "Prompt should NOT be found when deleted_at is set"
    print(f"✅ Prompt {prompt_id} is hidden from normal queries")

    # Test 4: Get it with include_deleted=True (should work)
    found_deleted = prompt_service.get(db, prompt_id, include_deleted=True)
    assert found_deleted is not None, "Prompt should be found with include_deleted=True"
    assert found_deleted.deleted_at is not None, "deleted_at should still be set"
    print(f"✅ Prompt {prompt_id} is retrievable with include_deleted=True")

    # Test 5: Restore it
    restored = prompt_service.restore(db, prompt_id)
    assert restored is not None, "Restore should return the prompt"
    assert restored.deleted_at is None, "deleted_at should be None after restore"
    print(f"✅ Restored prompt {prompt_id}, deleted_at is now None")

    # Test 6: Verify it's accessible again
    found_again = prompt_service.get(db, prompt_id, include_deleted=False)
    assert found_again is not None, "Prompt should be found after restore"
    print(f"✅ Prompt {prompt_id} is accessible again after restore")

    # Clean up: hard delete the test prompt
    hard_deleted = prompt_service.delete(db, prompt_id, soft=False)
    assert hard_deleted is not None, "Hard delete should work"
    print(f"✅ Hard deleted test prompt {prompt_id}")

    # Verify it's gone forever
    really_gone = prompt_service.get(db, prompt_id, include_deleted=True)
    assert really_gone is None, "Prompt should be completely gone after hard delete"
    print(f"✅ Prompt {prompt_id} is completely deleted (hard delete)")

    print("\n🎉 All soft delete tests PASSED!")

finally:
    db.close()
