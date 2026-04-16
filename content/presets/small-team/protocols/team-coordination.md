# Team Coordination Protocol

How multiple developers (and their AI agents) work on the same codebase without stepping on each other.

## Shared State Files

These files coordinate work across sessions and team members:

| File | Purpose | Who Updates |
|------|---------|-------------|
| `PROGRESS.md` | Task status, blockers, evidence | Workers (on task change), tech-lead (on checkpoint) |
| `DECISIONS.md` | Architecture decisions with rationale | Planners (during spec/plan), tech-lead (on review) |
| `specs/*/tasks.md` | Task breakdown with dependencies | task-breakdown agent (initial), orchestrator (reorder) |

## PROGRESS.md Discipline

- Read PROGRESS.md BEFORE starting work (someone else may have changed it).
- Update PROGRESS.md AFTER every task state change (started, completed, blocked).
- Include actual evidence: test counts, lint status, file paths. Not "it works."
- If you see a conflict (two tasks marked "In Progress" by different agents), flag it.

## DECISIONS.md Discipline

- Every non-obvious technical decision gets an entry.
- Format: context (why needed), decision (what), rationale (why), alternatives (what else).
- Mark decisions as reversible or irreversible.
- Read DECISIONS.md on fresh start to avoid re-debating settled decisions.

## Code Review Protocol

- Reviewer is always a FRESH session. Never review your own code.
- Reviewer reads: project CLAUDE.md, relevant spec, acceptance criteria.
- If reviewer finds issues: the ORIGINAL worker fixes them (preserves context).
- Max 3 review iterations per task. After 3: escalate to tech-lead.

## Checkpoint Commits

- Commit after each completed task (not at end of day).
- One logical change per commit.
- Use conventional commit messages: `feat:`, `fix:`, `refactor:`, `chore:`.
- Risky changes: checkpoint BEFORE, branch, implement, test, merge.

## Conflict Prevention

- Claim tasks in PROGRESS.md before starting. If a task is "In Progress," don't start it.
- Communicate blockers immediately. Don't sit on a blocked task hoping it resolves.
- When in doubt about ownership, check PROGRESS.md for the assigned agent/developer.
