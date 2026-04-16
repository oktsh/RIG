# Progress -- RIG MVP

> Workers update tasks. Tech Lead adds checkpoint verdicts.

## Current Phase: Phase 2 -- Foundation → Phase 3

## Completed
- [x] T001 Create PROGRESS.md (pre-existing)
- [x] T002 Create DECISIONS.md (pre-existing)
- [x] T003 Monorepo scaffold (claude-sonnet, 15 min) — typecheck: clean
- [x] T004 TypeScript + build + test config (claude-sonnet, 10 min) — typecheck: clean, build: 3/3
- [x] T005 Install runtime dependencies (claude-sonnet, 8 min) — install: clean
- [x] T006 Zod schemas (claude-opus, 12 min) — tests: 20/20, typecheck: clean
- [x] T007 Utility modules (claude-opus, 8 min) — tests: 8/8, typecheck: clean
- [x] T008 Content registry (claude-opus, 10 min) — tests: 12/12, typecheck: clean
- [x] T009 Template engine (claude-opus, 8 min) — tests: 10/10, typecheck: clean
- [x] T010 Content authoring (claude-opus, 20 min) — tests: 17/17, 27 content files, typecheck: clean
  Evidence:
  - AC-005/006: 3 presets (pm/small-team/solo-dev) + 2 stacks → PASS — all content dirs populated
  - AC-010-017: Agent/rule/hook/workflow/protocol files → PASS — frontmatter validates, bodies non-empty
  - AC-038-041: PM has 5 agents, small-team has 9 agents, solo-dev has 2 → PASS
  - AC-048: About RIG + onboarding in templates → PASS
- [x] T011 Handlebars templates (claude-sonnet, 15 min) — tests: 11/11, 12 template files, typecheck: clean
- [x] T012 Generation engine (claude-opus, 25 min) — tests: 15/15, typecheck: clean
  Evidence:
  - AC-003: generateProject creates rig.toml, CLAUDE.md, AGENTS.md → PASS
  - AC-004: rig.toml valid TOML → PASS — round-trip with @iarna/toml
  - AC-007: .rig/manifest.yaml with SHA-256 hashes → PASS — all file hashes verified
  - AC-008: determinism — two identical runs produce byte-identical output → PASS
  - NFR-004: file write order alphabetical → PASS

- [x] T013 create-rig CLI (claude-opus, 20 min) — tests: 8/8, typecheck: clean
  Evidence:
  - AC-001: npx create-rig interactive + non-interactive modes → PASS
  - AC-002: preset/stack selection → PASS
  - AC-009: overwrite protection → PASS — --force flag + confirmation prompt
  - Bundling fix: commander.js CJS in ESM bundle → createRequire shim
- [x] T014 E2E tests (claude-opus, 15 min) — tests: 22/22, typecheck: clean
  Evidence:
  - AC-001-017: all Phase 1 ACs verified → PASS
  - AC-048: LLM-native onboarding in CLAUDE.md → PASS
  - Manifest integrity: SHA-256 hashes match → PASS
  - Bug found + fixed: hooks missing execute bit → chmod 755

### D-018 Refactor: Unified preset capabilities
- [x] All presets now get same 9 agents, 5 rules, 2 workflows, 2 protocols
- [x] PM agents (planner, builder, reviewer) deleted — superseded by full suite
- [x] pm-guardrails → safety-guardrails (now for all presets)
- [x] Templates updated — workflow/shared-state no longer branch by preset
- [x] 123 tests passing after refactor

- [x] T016 rig generate command (claude-opus, 20 min) — tests: 9/9, typecheck: clean
  Evidence:
  - AC-032-037: rig generate [target] with full + selective modes → PASS
  - Determinism verified → PASS
- [x] T017 Checkpoint US-5 — all tests pass, no regression
- [x] T018 Update mechanism (claude-opus, 25 min) — tests: 35/35, typecheck: clean
  Evidence:
  - AC-018-025: diff, backup, apply, managed/unmanaged boundary → PASS
  - AC-045: PROGRESS.md/DECISIONS.md/memory/ never touched → PASS
  - AC-046: CLAUDE.md section-level merge (RIG-MANAGED replaced, user preserved) → PASS
  - AC-047: UpdateResult with 4-section summary → PASS
- [x] T019 rig update CLI (claude-opus, 15 min) — tests: 7/7, typecheck: clean
  Evidence:
  - AC-018: --dry-run → PASS
  - AC-020: --component filter → PASS
  - AC-047: post-update summary printed → PASS
- [x] T020 Checkpoint US-3 — all tests pass, no regression
- [x] T021 Doctor framework + 8 checks (claude-opus, 20 min) — tests: 10/10, typecheck: clean
  Evidence:
  - AC-026: 8 diagnostic checks implemented → PASS
  - AC-031: all checks offline → PASS
- [x] T022 rig doctor CLI (claude-opus, 10 min) — tests: 6/6 + 3 E2E, typecheck: clean
  Evidence:
  - AC-027: traffic light output → PASS
  - AC-029: --json mode → PASS
  - AC-030: exit codes (0/1/2) → PASS
- [x] T023 Checkpoint US-4 — all tests pass, no regression
- [x] Fix: vitest globalSetup to eliminate build race condition (7 test files cleaned)

- [x] T024 Autonomous compat (claude-opus, 10 min) — tests: 6/6, typecheck: clean
  Evidence:
  - AC-042: CLAUDE.md convention completeness (commit format, testing) → PASS
  - AC-043: rules have "if running interactively" qualifiers → PASS
  - AC-044: hooks CI-safe (NO_COLOR, clean exit codes, no prompts) → PASS
- [x] T025 Checkpoint US-7 — all tests pass, no regression
- [x] T026 Project CLAUDE.md rewritten for CLI product
- [x] T027 README.md + MIT LICENSE created
- [x] T028 CI workflows (.github/workflows/ci.yml + release.yml)
- [x] T029 Package size verification — create-rig: 664KB, rig-cli: 14KB, typecheck clean, 0 dead imports

## In Progress

## Blocked

## Blocked

## Stats
- Total: 29 | Done: 29 | Active: 0 | Blocked: 0
- ACs covered: 48/48
- Tests: 203 passing (26 test files)
- All phases complete: Pre-flight → Foundation → create-rig → rig generate → rig update → rig doctor → Autonomous compat → Polish

## Checkpoints
<!-- ### Checkpoint N: [Story] -- [date]
Verdict: PASS/WARN/FAIL
Actions: [what] | Resolved: [what fixed] -->
