# Discovery Workflow

How to go from "I have an idea" to "it's shipped." Works for PMs building with AI, solo devs, or anyone starting a feature.

## Phase 1: Explore (Read-Only)

Before writing anything, understand the landscape. No edits in this phase.

**Ask before you build:**
- What problem are we solving? For whom? Why now?
- What already exists in the codebase that relates to this?
- What are the constraints (time, tech, team)?

If the requirement is ambiguous, **interview first**: ask 3-5 clarifying questions before proceeding. AI agents produce dramatically better output when they start from clear requirements.

**Output:** A crisp problem statement (2 sentences max) + understanding of existing code.

## Phase 2: Plan (Spec Before Code)

Write a lightweight spec before any implementation. Even 15 minutes of spec prevents hours of rework.

### User Stories
> As [role], I want [action], so that [value].

Keep stories small — each buildable independently. If it takes more than a day, break it down.

### Acceptance Criteria
- Start with "A user can..." not "The system should..."
- Include happy path AND at least one edge case
- Make them testable — you should be able to verify each one
- Give each criterion a unique ID (AC-001, AC-002...)

### Build Order
- Which existing files change?
- What new files are needed?
- What order minimizes risk? (Foundation first, UI last)
- Dependencies or blockers?

Save to `specs/[feature-name]/spec.md`.

## Phase 3: Build (One Task at a Time)

```
git checkout -b feature/[feature-name]
```

Build incrementally:
1. Get the smallest version working first
2. Verify it works (run tests, check manually)
3. Commit with a clear message: `feat: add user profile endpoint`
4. Add the next piece
5. Repeat

**Commit after every task** — this is your save game. If something goes wrong, you can always roll back to the last working state.

**One task per conversation** when using AI agents. Fresh context = better output. Don't let a conversation drag past the point of diminishing returns.

## Phase 4: Review

Before merging, run the code reviewer:
```
Use code-reviewer agent to check my changes
```

The reviewer uses three hostile personas (Saboteur, New Hire, Security Auditor) — each must find at least one issue. Fix any CRITICAL or WARN findings. Re-run until approved.

## Phase 5: Ship

After review passes:
```
git checkout main
git merge feature/[feature-name]
git branch -d feature/[feature-name]
```

## The Mental Model

```
Explore (read-only) → Plan (spec) → Build (incremental) → Review (adversarial) → Ship (merge)
```

Each phase has a clear output. Don't skip phases — the cost of going back is always higher than the cost of doing it right.
