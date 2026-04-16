# Checkpoint Commits Protocol

Commits are save points. Each one is a state you can roll back to if something goes wrong.

## The Save Game Pattern

Think of commits like video game saves:
- **Save before a boss fight** → commit before a risky change
- **Save after clearing a level** → commit after completing a task
- **Don't play for 3 hours without saving** → don't let a long session accumulate uncommitted changes

## When to Commit

- After completing each task (not at end of day)
- Before any risky change (DB migration, auth flow, dependency upgrade)
- Before switching between unrelated areas of the codebase
- When a long session has accumulated significant changes

## Commit Format

### One Logical Change Per Commit

Each commit is about ONE thing. If your commit message needs "and," split it.

Good:
```
feat: add user profile endpoint
feat: add user profile page
fix: resolve profile avatar upload
```

Bad:
```
feat: add user profile page and fix avatar upload and update types
```

### Message Format

```
<type>: <short imperative description>
```

Types: `feat:` (new), `fix:` (bug fix), `refactor:` (restructure), `chore:` (tooling/deps), `test:` (tests), `docs:` (documentation)

### Before Committing

1. `git status` — review what's staged
2. `git diff --cached` — review the actual diff
3. Stage specific files (`git add file1 file2`) — never `git add .`
4. Never commit `.env`, secrets, or generated files

## Risky Change Protocol

For changes that could break existing functionality:

1. **Commit** current working state (save game)
2. **Branch** if not already on one
3. Make the risky change
4. Test thoroughly (run the full test suite, not just the new test)
5. If it works → commit and continue
6. If it breaks → `git checkout .` to revert, investigate from your save point

## Why This Matters

- AI agents can make sweeping changes. Commits let you undo them surgically.
- Context windows degrade over time. Committing early means less work to redo if context is refreshed.
- Small commits with clear messages make `git log` useful — you can find when any change was introduced.
