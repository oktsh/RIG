# Checkpoint Commits Protocol

Checkpoint commits protect against context loss and provide rollback points.

## When to Checkpoint

- Before any risky change (DB migration, auth flow, dependency upgrade)
- After completing a logical unit of work (one task, one feature, one bug fix)
- Before switching between unrelated areas of the codebase
- When context window is getting large (long session, many files touched)

## Commit Rules

### One Logical Change Per Commit

Each commit should be about ONE thing. If your commit message needs "and", split it into two commits.

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

### Commit Message Format

```
<type>: <short imperative description>
```

Types:
- `feat:` — new feature or capability
- `fix:` — bug fix
- `refactor:` — code restructuring without behavior change
- `chore:` — tooling, deps, config, CI
- `test:` — adding or fixing tests
- `docs:` — documentation only

### Before Committing

1. `git status` — review what's staged
2. `git diff --cached` — review the actual changes
3. Stage specific files, not `git add .`
4. Never commit `.env`, secrets, or generated files

## Risky Change Protocol

For changes that could break existing functionality:

1. **Checkpoint commit** current working state
2. **Create a branch** if not already on one
3. Make the risky change
4. Test thoroughly
5. If it works: commit and continue
6. If it breaks: `git checkout .` to revert, investigate from checkpoint
