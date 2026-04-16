# Team Coordination Protocol

How multiple developers (and their AI agents) work on the same codebase without stepping on each other.

## Shared State Files

These files coordinate work across sessions and team members. They survive context compaction — when AI context is refreshed, these files restore the full picture.

| File | Purpose | Who Updates |
|------|---------|-------------|
| `PROGRESS.md` | Task status, evidence, blockers | Workers (on task change), tech-lead (on checkpoint) |
| `DECISIONS.md` | Architecture decisions + rationale | Planners (during spec/plan), tech-lead (on review) |
| `specs/*/tasks.md` | Task breakdown + dependencies | task-breakdown agent (initial), orchestrator (reorder) |

## PROGRESS.md Discipline

- **Read before starting** — someone else may have changed it.
- **Update after every task change** (started, completed, blocked).
- Include actual evidence: test counts, lint status, file paths. Not "it works."
- If you see a conflict (two tasks "In Progress" by different agents) — flag it immediately.

## DECISIONS.md Discipline

- Every non-obvious technical decision gets an entry.
- Format: context (why needed) → decision (what) → rationale (why) → alternatives (what else was considered).
- Mark each decision as reversible or irreversible.
- Read DECISIONS.md on fresh start to avoid re-debating settled decisions.

## Memory Patterns

### What to Remember (Save to Project Memory)

- User corrections and confirmed preferences ("always use bun", "never auto-commit")
- Who does what on the team (roles, responsibilities, expertise)
- Ongoing work context (current sprint goal, active feature branch)
- Pointers to external systems (Jira board URL, Grafana dashboard, staging environment)

### What NOT to Remember

- Anything derivable from code (file paths, architecture, git history) — read the source
- Session-specific context (current task details, in-progress debugging state)
- Speculative or unverified conclusions from reading a single file
- Information that duplicates CLAUDE.md, PROGRESS.md, or DECISIONS.md

### The Rule

Don't save what you can grep. Memory is for context that code doesn't express.

## Code Review Protocol

- Reviewer is always a **fresh session** — never review your own code.
- Reviewer reads: project CLAUDE.md, relevant spec, acceptance criteria.
- If reviewer finds issues → the **original worker** fixes them (preserves context).
- Max 3 review iterations per task → escalate to tech-lead.

## Conflict Prevention

- **Claim tasks** in PROGRESS.md before starting. If a task is "In Progress," don't touch it.
- **Communicate blockers immediately** — don't sit on a blocked task hoping it resolves.
- **One agent writes at a time** — no parallel writers on the same tree.
- When in doubt about ownership, check PROGRESS.md for the assigned agent.

## Fresh Start Recovery

When context is lost (new session, compaction, crash):

1. Read CLAUDE.md → conventions, stack, rules
2. Read PROGRESS.md → what's done, in progress, blocked
3. Read DECISIONS.md → architectural decisions + rationale
4. Read tasks.md → task order, dependencies, current phase
5. Resume from last "In Progress" or first "Pending" task

Never ask "where were we?" — the shared state files have the answer.
