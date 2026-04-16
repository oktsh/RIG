# Safety Guardrails

Rules that keep your project safe while building with AI agents.

## The Key Insight

**Hooks = deterministic (always enforced). Rules = advisory (followed ~80% of the time).**

Anything that MUST happen → goes in a hook (pre-commit, pre-push).
Guidance and preferences → goes in CLAUDE.md or rules files.

Your pre-commit hook already runs lint + typecheck before every commit. You don't need to remember to do it — it's automatic.

## Always Branch First

Before making any code changes:
```
git checkout -b feature/your-feature-name
```

This is your safety net. If something breaks, you can always go back to main.

## Never Push to Main Directly

All changes go through a branch first:
1. Build on a feature branch
2. Run the reviewer to check your code
3. Merge the branch into main
4. Delete the feature branch

If you accidentally commit to main: create a branch from your current state, then reset main to the remote version.

## Always Review Before Merge

Before merging any branch:
```
Use code-reviewer agent to check my changes
```

The reviewer flags problems using three hostile personas. Fix CRITICAL and WARN findings before merging.

## Commit Often (Save Game)

Commit after every completed task — not at end of day. Each commit is a save point you can roll back to.

- One logical change per commit
- If your commit message needs "and," split it into two commits
- Use conventional format: `feat:`, `fix:`, `refactor:`, `chore:`

## Never Delete Without Checking

Before deleting a file:
- Is it imported anywhere? Check with grep.
- Is it referenced in config? Check package.json, tsconfig, etc.
- When in doubt, rename with `.bak` instead of deleting.

## The Whole Workflow

```
Plan → Branch → Build → Review → Merge → Done
```

That's it. No complicated setups needed.
