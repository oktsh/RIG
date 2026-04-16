# Agent Orchestration

> How agents coordinate. Always-loaded. Referenced by all agents — do NOT duplicate inline.

## The Core Mental Model

**Hooks are deterministic (100% enforcement). CLAUDE.md is advisory (~80% adherence).**

Anything that MUST happen → put in a hook. Guidance and preferences → put in rules/CLAUDE.md.

| Mechanism | Enforcement | Use for |
|-----------|-------------|---------|
| **Hooks** (PreToolUse, PostToolUse, Stop) | Hard gate — blocks execution | Security gates, formatting, lint, typecheck, destructive command prevention |
| **Rules** (CLAUDE.md, .claude/rules/) | Advisory — model follows ~80% | Coding style, architecture patterns, workflow preferences |
| **Agent definitions** (.claude/agents/) | Structural — defines capabilities | Role, model, tools, file ownership |

## Model-Per-Tier

| Tier | Model | Role | Why |
|------|-------|------|-----|
| **Oversight** | opus | tech-lead, code-reviewer, verification | Quality matters most — these are the safety net |
| **Planning** | opus | spec-writer, spec-planner | Architectural decisions compound — worth the cost |
| **Implementation** | sonnet | frontend-react, python-dev, task-breakdown | Speed + cost efficiency — review catches errors |
| **Diagnostics** | sonnet | debugger | Speed for iteration — escalate if stuck |

## Sequential Pipeline

ONE agent writes at a time. No parallel writers on the same tree.

```
1. Agent writes code
2. Orchestrator: lint
3. Orchestrator: typecheck
4. Orchestrator: tests
5. Fresh code-reviewer (read-only): review against AC
6. Fix if needed — repeat 2-5 (max 3 iterations)
7. Orchestrator: commit
```

- Orchestrator handles all shell commands (lint, test, commit)
- code-reviewer is always a FRESH spawn (never the implementer)
- Read-only agents (code-reviewer, tech-lead, verification) = no Write/Edit tools
- Complex multi-file → spawn worker. Single file → orchestrator writes directly.

## Worker Completion Checklist

Before reporting "done", every worker completes ALL steps. Skip = incomplete.

| # | Step | Action |
|---|------|--------|
| 1 | INSTALL | If package.json / pyproject.toml changed → run install |
| 2 | LINT | Run project linter. Fix all errors. |
| 3 | TYPECHECK | `tsc --noEmit` (TS) or `mypy` (Python). Fix all errors. |
| 4 | TESTS | Run test suite for affected area. All must pass. |
| 5 | CLEANUP | Delete replaced files. Grep old imports → fix or remove. |
| 6 | WIRING | Register in routes/DI/registries/barrel exports. |
| 7 | IMPORTS | No broken imports. No orphan files. No stale re-exports. |
| 8 | EVIDENCE | Structured evidence per acceptance criterion. |

After 3 failures on the same step → mark BLOCKED, report to tech-lead (if running interactively; otherwise, log the blocker and move to the next task).

## Review Flow

```
worker → fresh code-reviewer → SAME worker (fixes) → fresh code-reviewer → ... (max 3) → tech-lead
```

- Reviewer is always a fresh session — never the implementer
- The SAME worker who wrote the code fixes issues (preserves context)
- Max 3 review iterations per task → escalate to tech-lead

## Evidence Protocol

Every completed task reports evidence per acceptance criterion in PROGRESS.md:

```markdown
- [x] T{id} Task name ({agent}, {duration} min)
  Evidence:
  - AC1: {criterion} → PASS — {file path, test name, command output}
  - AC2: {criterion} → FAIL — {what failed, expected vs actual}
  Totals: tests X/Y, lint clean, typecheck clean
```

Rules:
- Every AC gets PASS / FAIL / UNKNOWN — no skipping
- Proof = concrete artifact (file path, command + output) — not "it works"
- Honest FAIL > fake PASS
- Evidence is INPUT for the code-reviewer, not a substitute for review

## PROGRESS.md Protocol

- **Before task**: read PROGRESS.md → move to "In Progress" → `- [ ] T{id} name (started: HH:MM)`
- **After task**: read fresh → move to "Completed" → include test counts, lint status, evidence
- **If blocked**: move to "Blocked" → add: what failed, what tried, escalation level (LOW/MEDIUM/HIGH)

## Fresh Start Recovery

On context start or after compaction:

1. Read project CLAUDE.md → conventions, stack, rules
2. Read PROGRESS.md → what's done, in progress, blocked
3. Read DECISIONS.md → architectural decisions + rationale
4. Read tasks.md → task order, dependencies, phase
5. Resume from last "In Progress" or first "Pending"

Never ask "where were we?" — shared state files have the answer.
