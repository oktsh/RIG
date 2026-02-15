#!/usr/bin/env python3
"""
Quick validation test for Phase 1.4: Input Validation
Tests that all Create schemas have proper Field constraints and validators.
"""

from pydantic import ValidationError
from app.models.schemas import (
    UserCreate,
    PromptCreate,
    GuideCreate,
    AgentCreate,
    RulesetCreate,
    ProposalCreate,
)


def test_user_create():
    print("\n=== Testing UserCreate ===")

    # Valid data
    try:
        user = UserCreate(
            name="John Doe",
            email="john@example.com",
            password="password123"
        )
        print("✓ Valid user created:", user.name, user.email)
    except ValidationError as e:
        print("✗ Valid data failed:", e)
        return False

    # Test name too short
    try:
        UserCreate(name="A", email="john@example.com", password="password123")
        print("✗ Should reject name too short")
        return False
    except ValidationError:
        print("✓ Rejected name too short")

    # Test password too short
    try:
        UserCreate(name="John Doe", email="john@example.com", password="pass")
        print("✗ Should reject password too short")
        return False
    except ValidationError:
        print("✓ Rejected password too short")

    # Test whitespace stripping
    try:
        user = UserCreate(
            name="  John Doe  ",
            email="  john@example.com  ",
            password="password123"
        )
        assert user.name == "John Doe", "Name not stripped"
        assert user.email == "john@example.com", "Email not stripped"
        print("✓ Whitespace stripped correctly")
    except Exception as e:
        print("✗ Whitespace stripping failed:", e)
        return False

    return True


def test_prompt_create():
    print("\n=== Testing PromptCreate ===")

    # Valid data
    try:
        prompt = PromptCreate(
            title="Test Prompt",
            desc="A test description",
            tags=["test", "demo"],
            content="This is valid content with enough characters."
        )
        print("✓ Valid prompt created:", prompt.title)
    except ValidationError as e:
        print("✗ Valid data failed:", e)
        return False

    # Test title too short
    try:
        PromptCreate(title="AB", content="Valid content here.")
        print("✗ Should reject title too short")
        return False
    except ValidationError:
        print("✓ Rejected title too short")

    # Test content too short
    try:
        PromptCreate(title="Valid Title", content="Short")
        print("✗ Should reject content too short")
        return False
    except ValidationError:
        print("✓ Rejected content too short")

    # Test too many tags
    try:
        PromptCreate(
            title="Valid Title",
            tags=["tag" + str(i) for i in range(11)]
        )
        print("✗ Should reject too many tags")
        return False
    except ValidationError:
        print("✓ Rejected too many tags")

    return True


def test_guide_create():
    print("\n=== Testing GuideCreate ===")

    # Valid data
    try:
        guide = GuideCreate(
            title="Test Guide",
            desc="A test description",
            category="tutorial",
            time="10 min",
            content="This is valid guide content with enough characters."
        )
        print("✓ Valid guide created:", guide.title)
    except ValidationError as e:
        print("✗ Valid data failed:", e)
        return False

    # Test title too short
    try:
        GuideCreate(title="AB")
        print("✗ Should reject title too short")
        return False
    except ValidationError:
        print("✓ Rejected title too short")

    return True


def test_agent_create():
    print("\n=== Testing AgentCreate ===")

    # Valid data
    try:
        agent = AgentCreate(
            title="Test Agent",
            desc="A test description",
            number="001"
        )
        print("✓ Valid agent created:", agent.title)
    except ValidationError as e:
        print("✗ Valid data failed:", e)
        return False

    # Test title whitespace stripping
    try:
        agent = AgentCreate(title="  Test Agent  ")
        assert agent.title == "Test Agent", "Title not stripped"
        print("✓ Title whitespace stripped")
    except Exception as e:
        print("✗ Title stripping failed:", e)
        return False

    return True


def test_ruleset_create():
    print("\n=== Testing RulesetCreate ===")

    # Valid data
    try:
        ruleset = RulesetCreate(
            title="Test Ruleset",
            desc="A test description",
            language="python",
            content="This is valid ruleset content with enough characters."
        )
        print("✓ Valid ruleset created:", ruleset.title)
    except ValidationError as e:
        print("✗ Valid data failed:", e)
        return False

    # Test content too short
    try:
        RulesetCreate(title="Valid Title", content="Short")
        print("✗ Should reject content too short")
        return False
    except ValidationError:
        print("✓ Rejected content too short")

    return True


def test_proposal_create():
    print("\n=== Testing ProposalCreate ===")

    # Valid data
    try:
        proposal = ProposalCreate(
            type="prompt",
            title="Test Proposal",
            description="This is a valid description with enough characters.",
            content="This is valid proposal content with enough characters.",
            email="user@example.com",
            tags=["test"]
        )
        print("✓ Valid proposal created:", proposal.title)
    except ValidationError as e:
        print("✗ Valid data failed:", e)
        return False

    # Test description too short
    try:
        ProposalCreate(
            type="prompt",
            title="Test",
            description="Short",
            content="Valid content here with enough characters.",
            email="user@example.com"
        )
        print("✗ Should reject description too short")
        return False
    except ValidationError:
        print("✓ Rejected description too short")

    # Test invalid email
    try:
        ProposalCreate(
            type="prompt",
            title="Test Proposal",
            description="Valid description here with enough characters.",
            content="Valid content here with enough characters.",
            email="not-an-email"
        )
        print("✗ Should reject invalid email")
        return False
    except ValidationError:
        print("✓ Rejected invalid email")

    return True


def main():
    print("=" * 60)
    print("Phase 1.4: Input Validation Tests")
    print("=" * 60)

    tests = [
        ("UserCreate", test_user_create),
        ("PromptCreate", test_prompt_create),
        ("GuideCreate", test_guide_create),
        ("AgentCreate", test_agent_create),
        ("RulesetCreate", test_ruleset_create),
        ("ProposalCreate", test_proposal_create),
    ]

    results = []
    for name, test_func in tests:
        try:
            result = test_func()
            results.append((name, result))
        except Exception as e:
            print(f"\n✗ {name} test crashed: {e}")
            results.append((name, False))

    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status}: {name}")

    print(f"\nTotal: {passed}/{total} tests passed")
    print("=" * 60)

    return passed == total


if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
