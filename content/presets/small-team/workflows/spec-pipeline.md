# Spec Pipeline

Full specification-driven development workflow for small teams.

## Pipeline Stages

### 1. Specification

Use the `spec-writer` agent to create a feature specification:
- Problem statement and user stories
- Acceptance criteria (testable conditions)
- Scope boundaries (what's in, what's out)

Output: `specs/[N]-[feature-name]/spec.md`

### 2. Technical Plan

Use the `spec-planner` agent to create the implementation plan:
- Architecture decisions and rationale
- File-level change list
- Risk assessment and mitigations
- Dependencies and blockers

Output: `specs/[N]-[feature-name]/plan.md`

### 3. Task Breakdown

Use the `task-breakdown` agent to decompose into tasks:
- Ordered task list with dependencies
- Estimated complexity per task
- Acceptance criteria per task (derived from spec)

Output: `specs/[N]-[feature-name]/tasks.md`

### 4. Implementation

Workers implement tasks sequentially:
- ONE agent writes code at a time
- Each task follows the Worker Completion Checklist
- Evidence protocol for each acceptance criterion

### 5. Review

Fresh `code-reviewer` agent validates each task:
- Not the same session that wrote the code
- Reviews against spec + acceptance criteria
- Max 3 review iterations per task

### 6. Checkpoint

`tech-lead` agent validates before commit:
- All tasks complete with evidence
- All tests pass, lint clean, typecheck clean
- Spec acceptance criteria satisfied

## Rules

- Never skip stages — each builds on the previous
- Spec must be approved before planning starts
- Plan must be approved before implementation starts
- All output files survive context compaction
