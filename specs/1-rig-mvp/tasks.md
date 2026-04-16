# Task Breakdown: RIG MVP

> **Branch:** `1-rig-mvp`
> **Date:** 2026-04-15
> **Spec:** `specs/1-rig-mvp/spec.md`
> **Plan:** `specs/1-rig-mvp/design.md`
> **Role:** Staff Engineer

---

## Execution Rules

- **TDD-first:** Tests section comes before Implementation in every story
- **[P]** = parallelizable (affects different files, no blocking deps)
- **[US-N]** = linked to User Story N from spec
- **Phase order is strict:** Setup > Foundation > Stories (P1 > P2 > P3) > Polish
- **Checkpoint:** verify each story works independently before starting the next
- **File paths are exact** -- no ambiguity about where code goes
- **Agent types:** `general-purpose` for infra/CLI/config, `python-dev` N/A, `frontend-react` N/A (pure TS/Node project)
- **Content authoring tasks** are separated from code tasks -- writing agent definitions, rules, and hooks is product work, not engineering

---

## Phase 0: Pre-flight

- [ ] T001 [P] Create PROGRESS.md from template at `specs/1-rig-mvp/PROGRESS.md`
- [ ] T002 [P] Create DECISIONS.md from template at `specs/1-rig-mvp/DECISIONS.md` -- already exists (D-001 to D-017), skip if present

---

## Phase 1: Monorepo Setup

> CRITICAL: All foundation tasks are BLOCKING. Nothing else starts until Phase 1 is green.

### T003: Monorepo scaffold + workspace config
**Story:** US-1
**ACs:** (foundation -- enables all ACs)
**Agent:** general-purpose
**Depends on:** none
**Files:**
- Create: `package.json` (workspace root)
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.base.json`
- Create: `.gitignore`
- Create: `.npmrc`
- Create: `packages/create-rig/package.json`
- Create: `packages/rig-cli/package.json`
- Create: `packages/core/package.json`

**Description:**
Initialize pnpm workspace monorepo with 3 packages. Root `package.json` defines workspace scripts (`lint`, `typecheck`, `test`, `build`). Each package gets its own `package.json` with correct `name` (`create-rig`, `rig-cli`, `@rig/core`), `type: "module"`, and `engines: { node: ">=18" }`. `@rig/core` is `private: true`. Both CLIs declare `bin` entries. `.npmrc` sets `ignore-scripts=true`. `.gitignore` covers `node_modules/`, `dist/`, `.rig/`, `*.tgz`.

**Pre-flight:** Check npm registry for `create-rig` and `rig-cli` name availability. If taken, flag as blocker (Risk #3 from design.md).

**Tests (TDD):**
- No code tests yet -- verify via `pnpm install` succeeds with zero deps

**Done when:**
- [ ] `pnpm install` runs clean
- [ ] `pnpm -r list` shows 3 packages
- [ ] Workspace linking works (`@rig/core` resolvable from other packages)

---

### T004: TypeScript + build + test config
**Story:** US-1
**ACs:** (foundation)
**Agent:** general-purpose
**Depends on:** T003
**Files:**
- Create: `packages/create-rig/tsconfig.json`
- Create: `packages/rig-cli/tsconfig.json`
- Create: `packages/core/tsconfig.json`
- Create: `packages/create-rig/tsup.config.ts`
- Create: `packages/rig-cli/tsup.config.ts`
- Create: `vitest.workspace.ts`

**Description:**
Each package's `tsconfig.json` extends `tsconfig.base.json`. Enable strict mode, ESM output, path aliases. `tsup.config.ts` for `create-rig` bundles all deps (standalone npx). `tsup.config.ts` for `rig-cli` bundles for global install. Both use ESM format, include shebang (`#!/usr/bin/env node`). Vitest workspace config includes all 3 packages + `tests/` root.

**Tests (TDD):**
- Create minimal `packages/core/src/index.ts` (export empty object)
- Create minimal `packages/create-rig/src/index.ts` (console.log placeholder)
- Create minimal `packages/rig-cli/src/index.ts` (console.log placeholder)
- Verify: `pnpm build` produces `dist/` in each publishable package
- Verify: `pnpm test` runs (0 tests, no errors)
- Verify: `pnpm typecheck` passes

**Done when:**
- [ ] `pnpm build` succeeds for all packages
- [ ] `pnpm typecheck` clean
- [ ] `pnpm test` runs Vitest (0 tests found, no crash)
- [ ] `node packages/create-rig/dist/index.js` executes without error

---

### T005: Install runtime dependencies
**Story:** US-1
**ACs:** (foundation)
**Agent:** general-purpose
**Depends on:** T003
**Files:**
- Modify: `packages/core/package.json` (add deps)
- Modify: `packages/create-rig/package.json` (add deps)
- Modify: `packages/rig-cli/package.json` (add deps)
- Modify: root `package.json` (add devDeps)

**Description:**
Install all dependencies per design.md section 2:
- **@rig/core:** `zod`, `handlebars`, `@iarna/toml`, `yaml`, `chalk`, `log-symbols`
- **create-rig:** `commander`, `@inquirer/prompts`, `@rig/core` (workspace:*)
- **rig-cli:** `commander`, `@rig/core` (workspace:*)
- **root devDeps:** `typescript`, `tsup`, `vitest`, `eslint`, `@types/node`

Run `pnpm audit` after install. Flag any critical/high vulnerabilities.

**Tests (TDD):**
- Verify: `pnpm install` clean
- Verify: `pnpm audit` shows no critical issues

**Done when:**
- [ ] `pnpm install` succeeds
- [ ] `pnpm audit` clean (or only low-severity)
- [ ] `pnpm-lock.yaml` committed
- [ ] All imports resolve in minimal source files

---

## Phase 2: Foundation (Schemas + Content Registry + Engine)

> These are the core building blocks. Every command depends on them.

### T006: Zod schemas for rig.toml, manifest, agent frontmatter
**Story:** US-1, US-3, US-4
**ACs:** AC-RIG-004, AC-RIG-007, AC-RIG-011
**Agent:** general-purpose
**Depends on:** T004, T005
**Files:**
- Create: `packages/core/src/schemas/rig-toml.ts`
- Create: `packages/core/src/schemas/manifest.ts`
- Create: `packages/core/src/schemas/agent.ts`
- Create: `packages/core/src/schemas/index.ts`

**Description:**
Implement Zod schemas exactly as defined in design.md section 5. `RigConfigSchema` validates rig.toml structure (project.name, project.preset, project.stack + optional sections). `ManifestSchema` validates `.rig/manifest.yaml`. `AgentFrontmatterSchema` validates agent file frontmatter. Export types via `z.infer`. Barrel export from `schemas/index.ts`.

**Tests (TDD):**
- Create: `packages/core/src/schemas/__tests__/rig-toml.test.ts`
  - Valid minimal config parses (name + preset + stack only)
  - Valid full config parses (all optional sections)
  - Invalid preset rejected
  - Invalid stack rejected
  - Missing required fields rejected
  - Defaults applied for optional sections
- Create: `packages/core/src/schemas/__tests__/manifest.test.ts`
  - Valid manifest parses
  - Missing required fields rejected
- Create: `packages/core/src/schemas/__tests__/agent.test.ts`
  - Valid frontmatter parses
  - Invalid model value rejected

**Done when:**
- [ ] All schema tests pass (target: 12+ tests)
- [ ] `pnpm typecheck` clean
- [ ] Schemas match design.md section 5 exactly

---

### T007: Utility modules (fs, git, logger, hash)
**Story:** US-1, US-3
**ACs:** AC-RIG-007, AC-RIG-021
**Agent:** general-purpose
**Depends on:** T005
**Files:**
- Create: `packages/core/src/utils/fs.ts`
- Create: `packages/core/src/utils/git.ts`
- Create: `packages/core/src/utils/logger.ts`
- Create: `packages/core/src/utils/hash.ts`
- Create: `packages/core/src/utils/index.ts`

**Description:**
- `fs.ts`: `ensureDir(path)`, `writeFileAtomic(path, content)`, `readFileSafe(path)` -- thin wrappers over node:fs with error handling
- `git.ts`: `isGitRepo(dir)`, `createBackupBranch(name)`, `getCurrentBranch()` -- shell out to `git` with fallback
- `logger.ts`: chalk + log-symbols wrapper. `Logger.success(msg)`, `Logger.warn(msg)`, `Logger.error(msg)`, `Logger.info(msg)`. Respects `NO_COLOR` env var and non-TTY detection
- `hash.ts`: `computeHash(content: string): string` -- SHA-256 hex digest via `node:crypto`

**Tests (TDD):**
- Create: `packages/core/src/utils/__tests__/hash.test.ts`
  - Known input produces expected SHA-256 hash
  - Empty string hashes consistently
  - Different inputs produce different hashes
- Create: `packages/core/src/utils/__tests__/fs.test.ts`
  - `ensureDir` creates nested directories
  - `writeFileAtomic` writes content correctly
  - `readFileSafe` returns null for missing file

**Done when:**
- [ ] Utility tests pass (target: 8+ tests)
- [ ] Logger respects NO_COLOR
- [ ] `pnpm typecheck` clean

---

### T008: Content registry -- preset + stack resolution
**Story:** US-1, US-2
**ACs:** AC-RIG-005, AC-RIG-006
**Agent:** general-purpose
**Depends on:** T006
**Files:**
- Create: `packages/core/src/registry/index.ts`
- Create: `packages/core/src/registry/presets.ts`
- Create: `packages/core/src/registry/stacks.ts`
- Create: `packages/core/src/registry/types.ts`

**Description:**
Implement `getContentSet(preset, stack) -> ContentSet` as described in design.md section 7.2. The registry composes content in 3 layers: shared core + preset delta + stack overlay. `ContentSet` interface includes: `agents`, `rules`, `hooks`, `templates`, `workflows`, `claudeMdContext`, `agentsMdContext`. For now, return content paths/IDs -- actual content loading happens in T010 (content authoring).

Preset definitions in `presets.ts`:
- `pm`: agents = [planner, builder, reviewer] + shared, rules = [pm-guardrails] + shared, workflows = [discovery]
- `small-team`: agents = [tech-lead, spec-writer, ...] + shared, rules = [agent-orchestration, tool-gate] + shared
- `solo-dev`: agents = shared only, rules = shared only

Stack definitions in `stacks.ts`:
- `nextjs`: hooks = [pre-commit-guard.sh for npm/tsc], stack-rules
- `python-fastapi`: hooks = [pre-commit-guard.sh for ruff/mypy], stack-rules

**Tests (TDD):**
- Create: `packages/core/src/registry/__tests__/registry.test.ts`
  - All 6 preset+stack combos return non-empty ContentSet
  - Shared core agents (code-reviewer, verification) appear in ALL content sets
  - PM preset includes planner, builder, reviewer agents
  - Small-team preset includes tech-lead, spec-writer agents
  - Solo-dev includes only shared core agents (no extras)
  - NextJS stack returns npm-based hook
  - Python stack returns ruff-based hook
  - Invalid preset throws Zod error

**Done when:**
- [ ] Registry tests pass (target: 10+ tests)
- [ ] Every preset+stack combination covered
- [ ] `pnpm typecheck` clean

---

### T009: Handlebars template engine setup
**Story:** US-1, US-5
**ACs:** AC-RIG-003, AC-RIG-033, AC-RIG-034, AC-RIG-035, AC-RIG-037
**Agent:** general-purpose
**Depends on:** T005
**Files:**
- Create: `packages/core/src/generator/engine.ts`
- Create: `packages/core/src/generator/types.ts`

**Description:**
Set up Handlebars with custom helpers and partial registration. Implement `TemplateEngine` class:
- Constructor registers custom helpers: `is`, `unless-is`, `includes` (per design.md section 8.1)
- `registerPartials(partialsDir)` -- loads `.hbs` files from a directory as partials
- `render(templateName, context) -> string` -- compiles and renders a template
- Template compilation is cached for performance
- Deterministic output: sorted object keys in context, no timestamps

**Tests (TDD):**
- Create: `packages/core/src/generator/__tests__/engine.test.ts`
  - `is` helper: renders correct block for matching value
  - `is` helper: renders inverse block for non-matching
  - `unless-is` helper: inverse of `is`
  - `includes` helper: works with arrays
  - Template caching: second render uses cached compilation
  - Determinism: same input produces same output across 2 calls

**Done when:**
- [ ] Engine tests pass (target: 6+ tests)
- [ ] All 3 custom helpers work
- [ ] `pnpm typecheck` clean

---

### T010: Content authoring -- shared core + all presets + all stacks
**Story:** US-1, US-2, US-6
**ACs:** AC-RIG-005, AC-RIG-006, AC-RIG-010, AC-RIG-011, AC-RIG-012, AC-RIG-013, AC-RIG-014, AC-RIG-015, AC-RIG-016, AC-RIG-017, AC-RIG-038, AC-RIG-039, AC-RIG-040, AC-RIG-041, AC-RIG-048
**Agent:** general-purpose
**Depends on:** T006 (schemas for frontmatter validation)
**Files:**
- Create: `content/presets/shared/rules/context-discipline.md`
- Create: `content/presets/shared/rules/security.md`
- Create: `content/presets/shared/agents/code-reviewer.md`
- Create: `content/presets/shared/agents/verification.md`
- Create: `content/presets/shared/templates/progress-template.md`
- Create: `content/presets/shared/templates/decisions-template.md`
- Create: `content/presets/shared/templates/spec-template.md`
- Create: `content/presets/pm/rules/pm-guardrails.md`
- Create: `content/presets/pm/agents/planner.md`
- Create: `content/presets/pm/agents/builder.md`
- Create: `content/presets/pm/agents/reviewer.md`
- Create: `content/presets/pm/workflows/discovery.md`
- Create: `content/presets/small-team/rules/agent-orchestration.md`
- Create: `content/presets/small-team/rules/tool-gate.md`
- Create: `content/presets/small-team/agents/tech-lead.md`
- Create: `content/presets/small-team/agents/spec-writer.md`
- Create: `content/presets/small-team/agents/spec-planner.md`
- Create: `content/presets/small-team/agents/task-breakdown.md`
- Create: `content/presets/small-team/agents/frontend-react.md`
- Create: `content/presets/small-team/agents/python-dev.md`
- Create: `content/presets/small-team/agents/debugger.md`
- Create: `content/presets/small-team/protocols/checkpoint-commits.md`
- Create: `content/presets/small-team/protocols/team-coordination.md`
- Create: `content/stacks/nextjs/hooks/pre-commit-guard.sh`
- Create: `content/stacks/nextjs/stack-rules.md`
- Create: `content/stacks/python-fastapi/hooks/pre-commit-guard.sh`
- Create: `content/stacks/python-fastapi/stack-rules.md`

**Description:**
This is THE PRODUCT. Every file is hand-crafted markdown/shell content that will be deployed to users' projects. Quality bar is high -- these must work in real Claude Code / Cursor sessions.

Content sources: adapt from the existing workspace setup at `/Users/oktsh/ai-dev/.claude/` (agents, rules, hooks) which are battle-tested. Adapt to each preset's tone and complexity level.

Key differentiators per preset (from spec's Preset Content Matrix):
- **PM (primary validation segment per D-014):** Highest content quality. Simplified vocabulary, discovery workflow, guardrails ("always branch", "never push main"), 3 agents (planner/builder/reviewer). PM preset must be the most polished -- it's the first segment to validate.
- **Small-team:** Full technical vocabulary, 5-tier agent system (7 agents), orchestration protocol, team coordination, checkpoint commits
- **Solo-dev:** Minimal -- shared core only (2 agents: code-reviewer, verification)

Agent files use YAML frontmatter per `AgentFrontmatterSchema` (name, description, model, file_ownership, tools, memory).

Hook scripts are bash, auto-detect stack (check for package.json vs pyproject.toml), run lint + typecheck.

**Tests (TDD):**
- Create: `packages/core/src/registry/__tests__/content-validation.test.ts`
  - Every agent file has valid YAML frontmatter (parse with AgentFrontmatterSchema)
  - Every agent file has non-empty body
  - Every rule file is non-empty markdown
  - Every hook file starts with `#!/bin/bash` or `#!/usr/bin/env bash`
  - PM preset has exactly 3+2 agents (planner, builder, reviewer + shared code-reviewer, verification)
  - Small-team preset has exactly 7+2 agents
  - Solo-dev has exactly 2 agents (shared only)
  - All 3 template files exist and are non-empty

**Done when:**
- [ ] Content validation tests pass (target: 10+ tests)
- [ ] All content files created per design.md section 4.2
- [ ] Agent frontmatter validates against schema
- [ ] Hook scripts are executable (`chmod +x`)
- [ ] **MANUAL QA REQUIRED:** Test at least 1 agent definition in real Claude Code session

---

### T011: Handlebars templates for output generation
**Story:** US-1, US-2, US-5
**ACs:** AC-RIG-003, AC-RIG-004, AC-RIG-033, AC-RIG-034, AC-RIG-035, AC-RIG-048
**Agent:** general-purpose
**Depends on:** T009, T010
**Files:**
- Create: `content/templates/rig-toml.hbs`
- Create: `content/templates/claude-md.hbs`
- Create: `content/templates/agents-md.hbs`
- Create: `content/templates/cursor-mdc.hbs`
- Create: `content/templates/partials/role-mindset.hbs`
- Create: `content/templates/partials/workflow.hbs`
- Create: `content/templates/partials/shared-state.hbs`
- Create: `content/templates/partials/commands.hbs`
- Create: `content/templates/partials/git-workflow.hbs`
- Create: `content/templates/partials/agent-list.hbs`
- Create: `content/templates/partials/about-rig.hbs`
- Create: `content/templates/partials/feedback.hbs`

**Description:**
Create Handlebars templates per design.md section 8. Main templates compose partials for each CLAUDE.md section. Templates use custom helpers (`is`, `unless-is`, `includes`) for preset-conditional content.

`claude-md.hbs` is the most complex -- produces different output per preset (see design.md section 8.3 for PM/small-team/solo-dev CLAUDE.md structures). Key additions per design.md sections 14-15 and 19:

- **`[RIG-MANAGED]` section markers**: Every RIG-owned section in generated CLAUDE.md starts with `## [RIG-MANAGED] Section Name`. This enables partial merge during `rig update` (design.md section 14). User-added sections (without this prefix) are preserved.
- **`about-rig.hbs` partial (AC-RIG-048, D-015)**: Renders the `[RIG-MANAGED] About RIG` section from rig.toml values. Includes preset/stack info, agent list, usage instructions. Preset-specific onboarding tone (PM: "Start by telling me what you want to build", solo-dev: "Just code", small-team: "Shared state files coordinate your team").
- **`feedback.hbs` partial (design.md section 19.1)**: Renders the `[RIG-MANAGED] Feedback` section. Instructs LLM to capture user feedback and format as GitHub issue body.

`rig-toml.hbs` renders a valid TOML config from RigConfig input.

`agents-md.hbs` renders AGENTS.md in the industry-standard directory-scoped format.

`cursor-mdc.hbs` converts rule content to Cursor's MDC format with frontmatter (description, globs, alwaysApply).

**Tests (TDD):**
- Create: `packages/core/src/generator/__tests__/templates.test.ts`
  - `rig-toml.hbs` renders valid TOML (parse result back with @iarna/toml)
  - `claude-md.hbs` with PM context includes "Discovery Workflow" section
  - `claude-md.hbs` with small-team context includes "Agent Orchestration" section
  - `claude-md.hbs` with solo-dev context does NOT include orchestration
  - `claude-md.hbs` output contains `[RIG-MANAGED]` markers on RIG-owned sections
  - `claude-md.hbs` includes "About RIG" section with preset-specific onboarding (AC-RIG-048)
  - `claude-md.hbs` includes "Feedback" section (design.md section 19.1)
  - `agents-md.hbs` renders valid markdown
  - `cursor-mdc.hbs` renders valid MDC with frontmatter

**Done when:**
- [ ] Template tests pass (target: 9+ tests)
- [ ] All 6 template files + 8 partials created
- [ ] Templates render without Handlebars errors for all 3 presets
- [ ] Generated CLAUDE.md contains `[RIG-MANAGED]` markers
- [ ] Generated CLAUDE.md contains About RIG onboarding section
- [ ] `pnpm typecheck` clean

---

### T012: Generation engine -- `generateProject()` + manifest creation
**Story:** US-1
**ACs:** AC-RIG-003, AC-RIG-004, AC-RIG-007, AC-RIG-008
**Agent:** general-purpose
**Depends on:** T008, T009, T011, T007
**Files:**
- Create: `packages/core/src/generator/index.ts`
- Create: `packages/core/src/generator/claude-md.ts`
- Create: `packages/core/src/generator/agents-md.ts`
- Create: `packages/core/src/generator/cursor-mdc.ts`
- Create: `packages/core/src/generator/agents.ts`
- Create: `packages/core/src/generator/rules.ts`
- Create: `packages/core/src/generator/hooks.ts`
- Create: `packages/core/src/generator/templates.ts`
- Create: `packages/core/src/manifest/index.ts`
- Create: `packages/core/src/manifest/hash.ts`
- Modify: `packages/core/src/index.ts` (barrel exports)

**Description:**
Implement `generateProject(config: RigConfig, outputDir: string) -> GenerationResult` exactly as in design.md section 8.2. Orchestrates: registry lookup -> template rendering -> file writing -> manifest creation.

Each generator module (`claude-md.ts`, `agents-md.ts`, etc.) handles one file type. They receive content from the registry and use the template engine.

`manifest/index.ts`: `readManifest(dir)`, `writeManifest(dir, manifest)`, `buildManifest(config, files)` -- creates `.rig/manifest.yaml` with SHA-256 hashes of all generated files.

File write order is alphabetical (determinism per NFR-004). No timestamps in generated content.

**Tests (TDD):**
- Create: `packages/core/src/generator/__tests__/generate.test.ts`
  - `generateProject` with solo-dev/nextjs produces all expected files
  - Generated `rig.toml` is valid TOML
  - Generated `.rig/manifest.yaml` contains hashes for all generated files
  - Generated `.claude/agents/*.md` have valid frontmatter
  - Determinism: generate twice with same config, byte-identical output
  - File count matches expected for each preset (solo-dev < small-team)

**Snapshot tests:**
- Create: `packages/core/src/generator/__tests__/snapshots/` directory
  - Snapshot for each of the 6 preset+stack combinations
  - Snapshots capture file list + key sections of CLAUDE.md

**Done when:**
- [ ] Generation tests pass (target: 8+ tests)
- [ ] Snapshot tests pass for all 6 combinations
- [ ] Determinism test passes (byte-identical on double run)
- [ ] `pnpm typecheck` clean
- [ ] Performance: generation completes in <10s (NFR-001)

---

## Phase 3: US-1 + US-2 -- create-rig CLI (P1)

> Goal: `npx create-rig` works end-to-end.

### T013: create-rig CLI -- interactive prompts + arg parsing
**Story:** US-1
**ACs:** AC-RIG-001, AC-RIG-002, AC-RIG-009
**Agent:** general-purpose
**Depends on:** T012
**Files:**
- Create: `packages/create-rig/src/cli.ts`
- Create: `packages/create-rig/src/prompts.ts`
- Modify: `packages/create-rig/src/index.ts`

**Description:**
Implement Commander.js CLI with two modes:

**Interactive mode** (`npx create-rig`):
- Inquirer prompts: preset selection (select), stack selection (select), project name (input), team size (input, only if small-team)
- Prompt copy matches spec section 6 exactly ("Welcome to RIG - Managed AI Dev Practice")
- Only `nextjs` and `python-fastapi` shown as stack options (AC-RIG-006)

**Non-interactive mode** (`npx create-rig --preset=X --stack=Y --name=Z`):
- All 3 args required in non-interactive mode
- `--team-size` optional, only relevant for small-team
- Validate with Zod schema, exit 1 on invalid input

**Overwrite protection** (AC-RIG-009):
- Check for existing `rig.toml` in target directory
- If found, prompt "Overwrite? (y/N)" -- default No
- In non-interactive mode with existing rig.toml, add `--force` flag

After input collection, delegate to `generateProject()` from @rig/core.
Print summary of generated files + "Next steps" message (per spec section 6).

**Tests (TDD):**
- Create: `packages/create-rig/src/__tests__/cli.test.ts`
  - Non-interactive mode with valid args succeeds
  - Non-interactive mode with missing args exits 1
  - Invalid preset value exits 1
  - Invalid stack value exits 1
  - `--help` prints usage
  - `--version` prints version

**Done when:**
- [ ] CLI tests pass (target: 6+ tests)
- [ ] `node dist/index.js --preset=solo-dev --stack=nextjs --name=test` generates files
- [ ] `node dist/index.js --help` shows correct usage
- [ ] `pnpm typecheck` clean

---

### T014: E2E test -- full create-rig flow
**Story:** US-1, US-2
**ACs:** AC-RIG-001 through AC-RIG-017, AC-RIG-048 (all Phase 1 ACs)
**Agent:** general-purpose
**Depends on:** T013
**Files:**
- Create: `tests/e2e/create-rig.test.ts`
- Create: `tests/fixtures/` (directory)

**Description:**
End-to-end integration test that runs create-rig CLI in a temp directory and validates ALL generated output. This is the comprehensive quality gate for Phase 1.

Test cases:
1. **Solo-dev + nextjs:** Run CLI non-interactively, verify all files exist, verify file contents match expectations
2. **Small-team + python-fastapi:** Same, verify team-specific agents present
3. **PM + nextjs:** Same, verify PM-specific guardrails and discovery workflow
4. **Overwrite protection:** Run create-rig in dir with existing rig.toml, verify prompt/behavior
5. **All agent files parse:** Every `.claude/agents/*.md` has valid YAML frontmatter
6. **All hooks are executable:** File mode check on `.claude/hooks/*.sh`
7. **Manifest integrity:** Every file listed in manifest exists and hash matches
8. **AGENTS.md exists and non-empty:** Basic format validation
9. **Cursor MDC files exist:** `.cursor/rules/` contains `.mdc` files
10. **LLM-native onboarding:** Generated CLAUDE.md contains `[RIG-MANAGED] About RIG` section with preset-specific content (AC-RIG-048)
11. **RIG-MANAGED markers:** All RIG-owned sections in CLAUDE.md have `[RIG-MANAGED]` prefix

**Done when:**
- [ ] E2E tests pass (target: 11+ test cases)
- [ ] All 6 preset+stack combos generate without error
- [ ] Manifest hashes match actual file contents
- [ ] CLAUDE.md contains About RIG onboarding section
- [ ] `pnpm typecheck` clean

---

### Checkpoint: US-1 + US-2

- [ ] T015 All Phase 1-3 tests pass (schemas, registry, engine, CLI, E2E)
- [ ] T015 `pnpm build` produces working `create-rig` binary
- [ ] T015 `pnpm typecheck` clean across all packages
- [ ] T015 `pnpm lint` clean
- [ ] T015 **MANUAL QA:** Run `npx create-rig` (via local build) in empty dir, open Claude Code, verify agents load
- [ ] T015 **MANUAL QA:** Ask Claude Code "What is RIG?" -- verify LLM-native onboarding works (AC-RIG-048)
- [ ] T015 Checkpoint commit: `feat: create-rig scaffolding CLI with 3 presets and 2 stacks`

---

## Phase 4: US-5 -- rig generate (P2)

### T016: rig-cli scaffold + generate command
**Story:** US-5
**ACs:** AC-RIG-032, AC-RIG-033, AC-RIG-034, AC-RIG-035, AC-RIG-036, AC-RIG-037
**Agent:** general-purpose
**Depends on:** T015 (checkpoint)
**Files:**
- Create: `packages/rig-cli/src/cli.ts`
- Create: `packages/rig-cli/src/commands/generate.ts`
- Modify: `packages/rig-cli/src/index.ts`
- Create: `packages/core/src/generator/generate-target.ts`

**Description:**
Implement rig-cli with Commander.js. First command: `rig generate [target]`.

- `rig generate` -- reads `rig.toml` from cwd, regenerates all format targets
- `rig generate claude_md` -- regenerates only CLAUDE.md
- `rig generate agents_md` -- only AGENTS.md
- `rig generate cursor_mdc` -- only .cursor/rules/

Uses `generateProject()` or new `generateTarget()` from @rig/core.
After generation, updates `.rig/manifest.yaml` with new file hashes.
Prints summary of generated/updated files.

Error states: missing `rig.toml` -> clear error + suggestion to run `create-rig`.

**Tests (TDD):**
- Create: `packages/rig-cli/src/__tests__/generate.test.ts`
  - `rig generate` in dir with rig.toml regenerates all files
  - `rig generate claude_md` only modifies CLAUDE.md
  - `rig generate` with invalid target exits 1
  - Missing rig.toml exits 1 with helpful message
  - Determinism: run twice, output identical (AC-RIG-037)
- Create: `tests/e2e/generate.test.ts`
  - Full E2E: create-rig -> modify rig.toml preset -> rig generate -> verify CLAUDE.md changed

**Done when:**
- [ ] Generate tests pass (target: 6+ tests)
- [ ] `rig generate` produces same output as `create-rig` for same config
- [ ] Selective target generation works
- [ ] Determinism verified
- [ ] `pnpm typecheck` clean

---

### Checkpoint: US-5

- [ ] T017 All US-1 + US-5 tests pass (no regression)
- [ ] T017 Checkpoint commit: `feat: rig generate command for multi-tool output`

---

## Phase 5: US-3 -- rig update (P1)

### T018: Update mechanism -- diff, backup, apply, managed/unmanaged boundary
**Story:** US-3
**ACs:** AC-RIG-018, AC-RIG-019, AC-RIG-020, AC-RIG-021, AC-RIG-022, AC-RIG-023, AC-RIG-024, AC-RIG-025, AC-RIG-045, AC-RIG-046, AC-RIG-047
**Agent:** general-purpose
**Depends on:** T017 (checkpoint)
**Files:**
- Create: `packages/core/src/updater/index.ts`
- Create: `packages/core/src/updater/diff.ts`
- Create: `packages/core/src/updater/backup.ts`
- Create: `packages/core/src/updater/apply.ts`
- Create: `packages/core/src/updater/claude-md-merge.ts`
- Create: `packages/core/src/updater/safety.ts`
- Create: `content/CHANGELOG.md`
- Modify: `packages/core/src/index.ts` (add updater exports)

**Description:**
Implement update pipeline per design.md sections 9 and 14:

1. **diff.ts:** `compareVersions(manifest, bundledVersions) -> UpdatePlan` -- compares installed content versions (from manifest) against bundled content versions (from rig-cli package). Produces list of components with version bumps.

2. **backup.ts:** `createBackup(dir) -> BackupResult` -- if git repo, create branch `rig/backup-{timestamp}`. If not git, copy managed files to `.rig/backups/{timestamp}/`.

3. **safety.ts (AC-RIG-045, D-016):** `getManagedFiles(manifest) -> Set<string>` and `isUnmanagedFile(path, manifest) -> boolean`. Enforces the managed vs unmanaged boundary:
   - Only files listed in `.rig/manifest.yaml` are candidates for update
   - PROGRESS.md, DECISIONS.md, memory/, specs/, and any file NOT in manifest are NEVER touched
   - Before any write, verify target path is in the managed set

4. **claude-md-merge.ts (AC-RIG-046, design.md section 14):** `mergeClaudeMd(existingContent, newRigContent) -> string`. Parses CLAUDE.md into sections. Sections starting with `[RIG-MANAGED]` are replaced with new RIG content. All other sections (user-added) are preserved in-place. This enables partial CLAUDE.md updates without losing project-specific references.

5. **apply.ts:** `applyUpdates(plan, dir, manifest) -> UpdateResult` -- for each changed component:
   - Generate new file content
   - Compare disk file hash vs manifest hash (customization detection)
   - If hash matches manifest: overwrite (safe)
   - If hash differs: skip, add to "manual review" list with diff
   - Special case for CLAUDE.md: use `mergeClaudeMd()` instead of full overwrite (AC-RIG-046)

6. **Changelog reading:** Parse `content/CHANGELOG.md` for per-component entries (what changed, impact, patch) per AC-RIG-019.

7. **index.ts:** `checkForUpdates(dir) -> UpdatePlan`, `applyUpdates(plan, dir) -> UpdateResult`. UpdateResult includes structured summary: "What's new", "What changed", "What to review", "Migration notes" (AC-RIG-047).

**Tests (TDD):**
- Create: `packages/core/src/updater/__tests__/diff.test.ts`
  - Detects version bump in agents component
  - Returns empty plan when versions match
  - Filters to single component when specified
- Create: `packages/core/src/updater/__tests__/backup.test.ts`
  - Creates directory backup in non-git dir
  - Backup contains all managed files
- Create: `packages/core/src/updater/__tests__/safety.test.ts`
  - `getManagedFiles` returns only files from manifest
  - `isUnmanagedFile` returns true for PROGRESS.md, DECISIONS.md, memory/*, specs/*
  - `isUnmanagedFile` returns true for files not in manifest
  - `isUnmanagedFile` returns false for manifest-tracked files
- Create: `packages/core/src/updater/__tests__/claude-md-merge.test.ts`
  - `[RIG-MANAGED]` sections are replaced with new content
  - User-added sections (no `[RIG-MANAGED]` prefix) are preserved
  - Section order is maintained
  - New `[RIG-MANAGED]` sections added to existing CLAUDE.md appear at end of RIG section block
- Create: `packages/core/src/updater/__tests__/apply.test.ts`
  - Unmodified file is updated
  - Modified file is preserved (not overwritten)
  - Modified file appears in "manual review" list
  - CLAUDE.md uses merge strategy (RIG sections updated, user sections preserved)
  - Manifest is updated after apply
- Create: `packages/core/src/updater/__tests__/update-integration.test.ts`
  - Full flow: create project -> modify a file -> update -> verify modified file preserved + others updated
  - Full flow: create project -> add PROGRESS.md + memory/ -> update -> verify PROGRESS.md and memory/ untouched (AC-RIG-045)
  - Full flow: create project -> add user section to CLAUDE.md -> update -> verify user section preserved + RIG sections updated (AC-RIG-046)
  - UpdateResult contains structured summary with all 4 sections (AC-RIG-047)

**Done when:**
- [ ] Update tests pass (target: 18+ tests)
- [ ] Customization detection works correctly
- [ ] Managed/unmanaged boundary enforced (AC-RIG-045)
- [ ] CLAUDE.md partial merge works (AC-RIG-046)
- [ ] UpdateResult includes structured summary (AC-RIG-047)
- [ ] Backup creation works (directory fallback)
- [ ] Manifest updated after apply
- [ ] `pnpm typecheck` clean

---

### T019: rig update command (CLI)
**Story:** US-3
**ACs:** AC-RIG-018, AC-RIG-020, AC-RIG-024, AC-RIG-047
**Agent:** general-purpose
**Depends on:** T018
**Files:**
- Create: `packages/rig-cli/src/commands/update.ts`
- Modify: `packages/rig-cli/src/cli.ts` (add update subcommand)

**Description:**
Wire up `rig update` CLI command:
- `rig update` -- apply all available updates
- `rig update --dry-run` -- show proposed changes, modify nothing (AC-RIG-018)
- `rig update --component agents` -- update only agents (AC-RIG-020)

Output format matches spec section US-3 scenarios:
- Version info, per-component changelog (what changed, impact, patch)
- List of applied changes
- "Manual review needed" section with file paths

**Post-update summary (AC-RIG-047):** After a successful update, print structured summary with 4 sections:
1. "What's new" -- new capabilities added
2. "What changed" -- behavioral differences in agents/rules
3. "What to review" -- files with user customizations that need manual merge
4. "Migration notes" -- if agent behavior changed, explains before/after

Error handling: missing rig.toml -> error. Missing manifest -> error (run create-rig first).

**Tests (TDD):**
- Create: `packages/rig-cli/src/__tests__/update.test.ts`
  - `--dry-run` modifies no files
  - `--component agents` only touches agents
  - Missing rig.toml exits 1
  - Output includes changelog entries
  - Post-update output contains "What's new", "What changed", "Migration notes" sections (AC-RIG-047)

**Done when:**
- [ ] Update CLI tests pass (target: 5+ tests)
- [ ] Dry-run verified (no file changes)
- [ ] Component filtering works
- [ ] Post-update summary printed with all 4 sections
- [ ] `pnpm typecheck` clean

---

### Checkpoint: US-3

- [ ] T020 All US-1 + US-3 + US-5 tests pass (no regression)
- [ ] T020 Checkpoint commit: `feat: rig update with backup, customization detection, managed/unmanaged boundary, and CLAUDE.md merge`

---

## Phase 6: US-4 -- rig doctor (P2)

### T021: Doctor check framework + 8 checks
**Story:** US-4
**ACs:** AC-RIG-026, AC-RIG-027, AC-RIG-028, AC-RIG-029, AC-RIG-030, AC-RIG-031
**Agent:** general-purpose
**Depends on:** T020 (checkpoint)
**Files:**
- Create: `packages/core/src/doctor/index.ts`
- Create: `packages/core/src/doctor/types.ts`
- Create: `packages/core/src/doctor/checks/schema-freshness.ts`
- Create: `packages/core/src/doctor/checks/format-sync.ts`
- Create: `packages/core/src/doctor/checks/hook-coverage.ts`
- Create: `packages/core/src/doctor/checks/dead-references.ts`
- Create: `packages/core/src/doctor/checks/rule-contradictions.ts`
- Create: `packages/core/src/doctor/checks/template-drift.ts`
- Create: `packages/core/src/doctor/checks/deprecation-scan.ts`
- Create: `packages/core/src/doctor/checks/security-baseline.ts`
- Modify: `packages/core/src/index.ts` (add doctor exports)

**Description:**
Implement `runChecks(dir) -> CheckResult[]` and all 8 diagnostic checks per design.md section 6.4.

`types.ts`: `CheckStatus = 'pass' | 'warn' | 'fail'`, `CheckResult = { check_name, status, message, remediation }`.

Each check is a function `(dir: string, config: RigConfig, manifest: Manifest) -> CheckResult`:
1. **schema-freshness:** Compare agent frontmatter against latest known fields
2. **format-sync:** Regenerate in memory, compare hash against disk
3. **hook-coverage:** Check .claude/hooks/ exists + .git/hooks/pre-commit
4. **dead-references:** Parse CLAUDE.md + agent files for file paths, verify exist
5. **rule-contradictions:** Known contradiction pattern matching
6. **template-drift:** Compare _hub/templates/ against bundled versions
7. **deprecation-scan:** Grep for deprecated patterns
8. **security-baseline:** Check .gitignore covers secrets, gitleaks mention

All checks are offline (AC-RIG-031).

**Tests (TDD):**
- Create: `packages/core/src/doctor/__tests__/doctor.test.ts`
  - Fresh project -> all 8 checks PASS
  - Delete agent file -> dead-references FAIL
  - Modify CLAUDE.md -> format-sync WARN
  - Remove .claude/hooks/ -> hook-coverage FAIL
  - Remove .gitignore -> security-baseline FAIL
  - Aggregation: worst status = overall status
  - JSON output format correct

**Done when:**
- [ ] Doctor tests pass (target: 8+ tests)
- [ ] All 8 checks implemented
- [ ] Each check produces actionable remediation
- [ ] `pnpm typecheck` clean

---

### T022: rig doctor command (CLI)
**Story:** US-4
**ACs:** AC-RIG-027, AC-RIG-029, AC-RIG-030
**Agent:** general-purpose
**Depends on:** T021
**Files:**
- Create: `packages/rig-cli/src/commands/doctor.ts`
- Modify: `packages/rig-cli/src/cli.ts` (add doctor subcommand)

**Description:**
Wire up `rig doctor` CLI:
- Default: human-readable output with colored status (PASS/WARN/FAIL) + remediation (AC-RIG-027, AC-RIG-028)
- `--json`: JSON array output (AC-RIG-029)
- Exit codes: 0 (all pass), 1 (any warn), 2 (any fail) (AC-RIG-030)

Uses log-symbols for semantic markers. Respects NO_COLOR.

**Tests (TDD):**
- Create: `packages/rig-cli/src/__tests__/doctor.test.ts`
  - Fresh project exits 0
  - Broken project exits 2
  - `--json` outputs valid JSON array
  - Each result has required fields (check_name, status, message, remediation)
- Create: `tests/e2e/doctor.test.ts`
  - E2E: create-rig -> rig doctor -> exit 0

**Done when:**
- [ ] Doctor CLI tests pass (target: 5+ tests)
- [ ] Traffic light output works in terminal
- [ ] JSON mode outputs valid JSON
- [ ] Exit codes correct
- [ ] `pnpm typecheck` clean

---

### Checkpoint: US-4

- [ ] T023 All tests pass (US-1 + US-3 + US-4 + US-5 -- no regression)
- [ ] T023 Checkpoint commit: `feat: rig doctor with 8 health checks`

---

## Phase 7: US-7 -- Autonomous Agent Compatibility (P3)

### T024: Autonomous compat -- content adjustments + CI-safe hooks
**Story:** US-7
**ACs:** AC-RIG-042, AC-RIG-043, AC-RIG-044
**Agent:** general-purpose
**Depends on:** T023 (checkpoint)
**Files:**
- Modify: `content/templates/claude-md.hbs` (add autonomous qualifiers)
- Modify: `content/stacks/nextjs/hooks/pre-commit-guard.sh` (CI-safe: no TTY prompts, clean exit codes)
- Modify: `content/stacks/python-fastapi/hooks/pre-commit-guard.sh` (same)
- Modify: `content/presets/shared/rules/context-discipline.md` (add non-interactive fallbacks)
- Modify: `content/presets/shared/rules/security.md` (add non-interactive fallbacks)

**Description:**
Ensure generated content works for factory-style autonomous agents (AC-RIG-042, AC-RIG-043):
- CLAUDE.md includes convention completeness: code style, naming, file structure, testing, commit format, review checklist
- Rules qualify "ask the user" with "if running interactively; otherwise, choose the conservative default"
- Hooks work in CI: no TTY prompts, clear exit codes, no ANSI colors when not a TTY (AC-RIG-044)

**Tests (TDD):**
- Create: `tests/e2e/autonomous.test.ts`
  - Generated CLAUDE.md contains commit message format section
  - Generated rules contain "if running interactively" qualifiers
  - Hook scripts detect non-TTY and skip prompts
  - Hook scripts exit with clean codes (0 or non-zero, no other output)

**Done when:**
- [ ] Autonomous compat tests pass (target: 4+ tests)
- [ ] Hooks work without TTY
- [ ] No "ask the user" without interactive qualifier in any rule
- [ ] `pnpm typecheck` clean

---

### Checkpoint: US-7

- [ ] T025 All tests pass (full regression)
- [ ] T025 Checkpoint commit: `feat: autonomous agent compatibility for factory-style pipelines`

---

## Phase 8: Polish

### T026: [P] Update project CLAUDE.md for CLI product
**Story:** (meta)
**Agent:** general-purpose
**Depends on:** T025
**Files:**
- Modify: `CLAUDE.md` (rewrite from web platform to CLI product description)

**Description:**
The existing `CLAUDE.md` describes the OLD web platform (Next.js + FastAPI). Rewrite to describe the CLI product: monorepo structure, pnpm workspace, TypeScript CLI, content architecture. Keep the agent workflow section but update commands and project structure.

**Done when:**
- [ ] CLAUDE.md accurately describes current project

---

### T027: [P] README.md + LICENSE
**Story:** (meta)
**Agent:** general-purpose
**Depends on:** T025
**Files:**
- Create: `README.md`
- Create: `LICENSE`

**Description:**
README with: product pitch (1 paragraph), quick start (`npx create-rig`), command reference, preset descriptions, contributing link. LICENSE: MIT (per spec OQ #3).

**Done when:**
- [ ] README covers all CLI commands
- [ ] MIT LICENSE present

---

### T028: CI workflow (GitHub Actions)
**Story:** (meta)
**Agent:** general-purpose
**Depends on:** T025
**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `.github/workflows/release.yml`

**Description:**
CI per design.md section 10.3:
- `ci.yml`: on PR -- `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`
- `release.yml`: on tag `v*` -- build + `pnpm -r publish` to npm

**Done when:**
- [ ] CI workflow runs all quality gates
- [ ] Release workflow publishes both packages

---

### T029: Package size verification + final cleanup
**Story:** (meta)
**ACs:** NFR-006
**Agent:** general-purpose
**Depends on:** T026, T027, T028
**Files:**
- Modify: various (cleanup dead code, unused imports)

**Description:**
- Run `pnpm pack` for both publishable packages, verify sizes (create-rig < 2MB, rig-cli < 5MB)
- Remove any dead code, unused imports, TODO comments
- Run full test suite one final time
- Run typecheck one final time
- Verify all E2E tests pass

**Done when:**
- [ ] `pnpm pack` sizes within limits
- [ ] `pnpm test` -- all green
- [ ] `pnpm typecheck` -- clean
- [ ] `pnpm lint` -- clean
- [ ] No dead imports or unused code
- [ ] Final commit: `chore: cleanup and package size verification`

---

## Delivery Strategy

- [x] **Incremental:** Ship after each phase checkpoint
  - Phase 3 checkpoint (US-1 + US-2): `npx create-rig` works -> **MVP shippable**
  - Phase 4 checkpoint (US-5): `rig generate` works -> publish `rig-cli` v0.1.0
  - Phase 5 checkpoint (US-3): `rig update` works -> `rig-cli` v0.2.0
  - Phase 6 checkpoint (US-4): `rig doctor` works -> `rig-cli` v0.3.0
  - Phase 7 checkpoint (US-7): autonomous compat -> `rig-cli` v0.4.0
  - Phase 8: polish -> v1.0.0

---

## AC Coverage Matrix

| AC ID | Description | Task(s) |
|-------|-------------|---------|
| AC-RIG-001 | Interactive init flow | T013 |
| AC-RIG-002 | Non-interactive mode | T013 |
| AC-RIG-003 | Generated file structure | T011, T012 |
| AC-RIG-004 | rig.toml as source of truth | T006, T011, T012 |
| AC-RIG-005 | Preset-appropriate content | T008, T010 |
| AC-RIG-006 | Stack-appropriate content | T008, T010 |
| AC-RIG-007 | Version manifest | T007, T012 |
| AC-RIG-008 | Completion time (<10s) | T012 |
| AC-RIG-009 | Idempotent in empty dir | T013 |
| AC-RIG-010 | Pre-commit hooks execute | T010 |
| AC-RIG-011 | Agent definitions parseable | T006, T010 |
| AC-RIG-012 | Rules are loaded | T010 |
| AC-RIG-013 | AGENTS.md tool-compatible | T011 |
| AC-RIG-014 | Shared state templates | T010 |
| AC-RIG-015 | Quality gates enforced | T010 |
| AC-RIG-016 | Security rules active | T010 |
| AC-RIG-017 | PM preset guardrails | T010 |
| AC-RIG-018 | Dry-run mode | T019 |
| AC-RIG-019 | Curated changelog | T018 |
| AC-RIG-020 | Selective updates | T018, T019 |
| AC-RIG-021 | Backup before update | T018 |
| AC-RIG-022 | User customizations preserved | T018 |
| AC-RIG-023 | Manifest updated | T018 |
| AC-RIG-024 | Offline graceful failure | T019 |
| AC-RIG-025 | Update source (npm) | T018 |
| AC-RIG-026 | Eight diagnostic checks | T021 |
| AC-RIG-027 | Traffic light output | T022 |
| AC-RIG-028 | Remediation commands | T021 |
| AC-RIG-029 | Machine-readable output | T022 |
| AC-RIG-030 | Exit codes | T022 |
| AC-RIG-031 | No network required | T021 |
| AC-RIG-032 | Generate command | T016 |
| AC-RIG-033 | CLAUDE.md generation | T011, T016 |
| AC-RIG-034 | AGENTS.md generation | T011, T016 |
| AC-RIG-035 | Cursor MDC generation | T011, T016 |
| AC-RIG-036 | Format consistency | T016 |
| AC-RIG-037 | Diff-friendly regeneration | T016 |
| AC-RIG-038 | Discovery workflow | T010 |
| AC-RIG-039 | Simplified agent tier | T010 |
| AC-RIG-040 | Safety guardrails | T010 |
| AC-RIG-041 | Simplified CLI vocabulary | T010 |
| AC-RIG-042 | Convention completeness | T024 |
| AC-RIG-043 | No interactive assumptions | T024 |
| AC-RIG-044 | Quality gate CI compat | T024 |
| AC-RIG-045 | Agent memory preserved | T018 |
| AC-RIG-046 | Project references preserved | T018 |
| AC-RIG-047 | Post-update summary | T018, T019 |
| AC-RIG-048 | LLM-native onboarding | T010, T011, T014 |

---

## Summary

| Metric | Value |
|--------|-------|
| Total tasks | 29 |
| Parallelizable | 4 (T001/T002, T026/T027) |
| Phases | 8 (Phase 0-8) |
| Checkpoints | 5 (after US-1+2, US-5, US-3, US-4, US-7) |
| Stories covered | US-1 (P1), US-2 (P1), US-3 (P1), US-4 (P2), US-5 (P2), US-6 (P2), US-7 (P3) |
| ACs covered | 48/48 |
| Estimated test count | ~120+ across unit, snapshot, and E2E |
| Manual QA gates | 3 (T010 content in real Claude Code, T015 full create-rig flow, T015 LLM-native onboarding) |
