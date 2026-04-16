# Agent Orchestration Rules

> Canonical source for agent coordination, completion standards, and shared state protocols.
> Always-loaded. Referenced by all agents — do NOT duplicate inline.

---

## Agent Execution Model

**Sequential pipeline — one agent writes at a time.**

```
1. Agent writes code (component / endpoint / test)
2. Orchestrator: lint
3. Orchestrator: typecheck
4. Orchestrator: tests
5. Fresh code-reviewer agent (read-only): review against AC + spec
6. Fix if needed — repeat 2-5 (max 3 iterations)
7. Orchestrator: commit + push
```

Key rules:
- ONE agent writes code at a time — no parallel workers on the same tree
- Orchestrator (main Claude session) handles all shell commands (lint, test, commit)
- code-reviewer is always a FRESH agent spawn (never the implementer)
- Read-only agents (code-reviewer, tech-lead, verification) = no edits

When to use agents vs write directly:
- Complex multi-file feature — spawn a worker agent
- Single file / small change — orchestrator writes directly
- Research / exploration — spawn a read-only agent

---

## Worker Completion Checklist

Before reporting "done", every worker MUST complete ALL steps. Skip = incomplete.

| # | Step | Action |
|---|------|--------|
| 1 | **INSTALL** | If `package.json` or `pyproject.toml` changed — run install |
| 2 | **LINT** | Run project linter. Fix all errors. |
| 3 | **TYPECHECK** | Run `tsc --noEmit` (TS) or `mypy` (Python). Fix all errors. |
| 4 | **TESTS** | Run test suite for affected area. All must pass. |
| 5 | **CLEANUP** | Delete replaced/renamed files. Grep old imports — fix or remove. |
| 6 | **WIRING** | New components registered in routes/DI/registries/barrel exports. |
| 7 | **IMPORTS** | No broken imports. No orphan files. No stale re-exports. |
| 8 | **EVIDENCE** | Report structured evidence per acceptance criterion. |

On failure: fix and re-run. After 3 failures on the same step — mark task BLOCKED, report to tech-lead.

---

## PROGRESS.md Update Protocol

### Before Starting a Task

1. Read current PROGRESS.md
2. Move task from "Pending" to "In Progress"
3. Format: `- [ ] T{id} Task name (started: HH:MM)`

### After Completing a Task

1. Read current PROGRESS.md (fresh — may have been updated)
2. Move task from "In Progress" to "Completed"
3. Format: `- [x] T{id} Task name ({agent}, {duration} min) — tests: X/Y passed, lint: clean`
4. Update Stats section
5. Include ACTUAL test output (pass/fail counts, not estimates)

### If Blocked (after 3 attempts or 15 min)

1. Move task to "Blocked" section
2. Add blocker: what failed, what was tried, error messages
3. Escalation level: `LOW` (workaround exists) / `MEDIUM` (blocks 1-2 tasks) / `HIGH` (blocks story)
4. Report to tech-lead or human

---

## Fresh Start Recovery

On context start or after compaction, reconstruct state:

1. **Read project CLAUDE.md** — conventions, stack, rules
2. **Read PROGRESS.md** — what's done, what's in progress, what's blocked
3. **Read DECISIONS.md** — architectural decisions and rationale
4. **Read tasks.md** (if exists) — task order, dependencies, current phase
5. **Resume** from last "In Progress" task or first "Pending" task

Never ask "where were we?" — shared state files have the answer.

---

## Code Review Flow

### Reviewer = Fresh Session

- code-reviewer MUST be a fresh spawn — never the same session that wrote the code
- Reviewer prompt includes: "You are not the implementer."
- Reviewer reads project CLAUDE.md + spec + issue AC for full context

### Fix = Same Worker

When reviewer finds issues:
1. The SAME worker who wrote the code fixes it (preserves context)
2. Worker re-runs completion checklist
3. Fresh reviewer re-reviews

### Iteration Limit

- Max **3 review iterations** per task
- If still failing after 3 — escalate to tech-lead
- tech-lead decides: fix approach, reassign, or descope

### Flow

```
worker (implements) → fresh code-reviewer → SAME worker (fixes) → fresh code-reviewer → ... (max 3) → tech-lead
```

---

## Evidence Protocol

Workers report structured evidence when completing a task.

### Format (in PROGRESS.md)

```markdown
- [x] T{id} Task name ({agent}, {duration} min)
  Evidence:
  - AC1: {criterion text} — PASS — {proof: file path, test name, command output}
  - AC2: {criterion text} — PASS — {proof}
  - AC3: {criterion text} — FAIL — {what failed, expected vs actual}
  Totals: tests {X}/{Y} passed, lint clean, typecheck clean
```

### Rules

1. Every AC gets explicit PASS / FAIL / UNKNOWN
2. Proof = concrete artifact — file path, test name, command + exit code. Not "it works"
3. Raw outputs captured — lint, typecheck, test output (summary, not full dump)
4. FAIL is OK — honest FAIL is better than fake PASS
5. No self-verification — evidence is INPUT for the fresh code-reviewer
