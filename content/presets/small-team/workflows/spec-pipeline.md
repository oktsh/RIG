# Spec Pipeline

Full specification-driven development. "Waterfall in 15 minutes" — write a spec, plan, decompose, implement, review, ship.

Why bother? Spec-first catches security gaps, missed edge cases, and scope creep BEFORE you write code. 15 minutes of spec prevents hours of rework.

## Pipeline

```
spec-writer → spec-planner → task-breakdown → workers (TDD) → code-reviewer → tech-lead → commit
```

## Stages

### 1. Specify (spec-writer, opus)

Create a feature specification:
- Problem statement: who has the pain, what the pain is, why now
- User stories with acceptance criteria (testable, unique IDs)
- Scope boundaries: what's in, what's explicitly out
- Open questions: anything ambiguous gets flagged, not assumed

**Interview first**: if requirements are ambiguous, ask 3-5 clarifying questions before writing. Better input = dramatically better output.

Output: `specs/[N]-[feature-name]/spec.md`

### 2. Plan (spec-planner, opus)

Create the implementation plan:
- Architecture decisions with rationale + rejected alternatives
- Data model with validation rules
- API contracts (request/response schemas)
- File-level change list, ordered by dependency
- Risk assessment with mitigations

Every decision goes in DECISIONS.md with: context → decision → rationale → alternatives.

Output: `specs/[N]-[feature-name]/design.md`

### 3. Decompose (task-breakdown, sonnet)

Break plan into ordered tasks:
- DAG ordering (dependencies explicit, no cycles)
- Each task: 15-60 min, single agent, specific files, testable AC
- TDD ordering: test infrastructure first, then features
- Completion criteria per task (not just "implement X")

Output: `specs/[N]-[feature-name]/tasks.md` + initialized PROGRESS.md

### 4. Implement (workers, sonnet)

Workers implement tasks sequentially:
- ONE agent writes code at a time
- Tests before implementation (TDD)
- Each task follows the Worker Completion Checklist (8 steps)
- Evidence per acceptance criterion in PROGRESS.md

### 5. Review (code-reviewer, opus)

Fresh agent validates each task:
- NOT the implementer's session — always a fresh spawn
- Three adversarial personas: Saboteur, New Hire, Security Auditor
- Reviews against spec + acceptance criteria
- Max 3 review iterations → escalate to tech-lead

### 6. Checkpoint (tech-lead, opus)

Validates before commit:
- All tasks complete with evidence
- Tests pass, lint clean, typecheck clean
- Spec acceptance criteria satisfied
- Architecture matches plan
- PROGRESS.md and DECISIONS.md up to date

## Rules

- Never skip stages — each builds on the previous.
- Spec approved before planning. Plan approved before implementation.
- One task per conversation for workers — fresh context per task.
- All output files (spec.md, design.md, tasks.md, PROGRESS.md, DECISIONS.md) survive context compaction.
- Human approves at stage gates (spec → plan → tasks → final merge).
