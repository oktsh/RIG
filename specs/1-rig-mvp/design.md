# System Design: RIG MVP

> **Branch:** `1-rig-mvp`
> **Date:** 2026-04-14
> **Author:** spec-planner
> **Status:** Draft
> **Spec:** specs/1-rig-mvp/spec.md

---

## 1. Summary

RIG is a CLI tool distributed as two npm packages: `create-rig` (scaffolding via `npx create-rig`) and `rig-cli` (management via `rig generate`, `rig update`, `rig doctor`). The product is opinionated AI dev practice content — agent definitions, rules, hooks, workflows — organized by preset (pm / small-team / solo-dev) and stack (nextjs / python-fastapi), generated from a single `rig.toml` config into multi-tool output (CLAUDE.md, AGENTS.md, .cursor/rules/).

The architecture is a monorepo with three packages: `create-rig`, `rig-cli`, and a shared private `@rig/core` containing the generation engine, content registry, and schemas. Content is bundled into the npm packages at build time — no runtime network dependencies.

---

## 2. Technical Context

| Parameter | Value |
|-----------|-------|
| Language | TypeScript 5.7 |
| Runtime | Node.js 22 LTS (minimum: 18) |
| Package manager | pnpm 9.x (workspace monorepo) |
| Build | tsup (esbuild-based) |
| Testing | Vitest 3.x |
| CLI framework | Commander.js |
| Interactive prompts | @inquirer/prompts v2 |
| Template engine | Handlebars 4.x |
| TOML parser | @iarna/toml |
| YAML parser | yaml (YAML 1.2) |
| Terminal styling | chalk 5, log-symbols |
| Target platform | macOS, Linux, Windows (WSL). CLI only |
| Performance targets | Generation <10s, doctor <5s, generate <3s (NFR-001) |
| Constraints | No native deps (NFR-002). Offline after install (NFR-003). Deterministic output (NFR-004) |

### Stack Decision Rationale

TypeScript is the natural choice: npm-native distribution, same ecosystem as target audience, type safety for schema validation and template composition. Node.js 22 LTS provides stable ESM support and modern APIs. pnpm monorepo keeps shared code DRY across two published packages without publishing a third.

All library choices prioritize: (1) zero native dependencies, (2) battle-tested stability, (3) small footprint, (4) ESM-native. Full rationale for each library in DECISIONS.md (D-001 through D-013).

---

## 3. Constitution Check

> Validated against workspace CLAUDE.md (universal rules) and project CLAUDE.md (RIG-specific).
> NOTE: Project CLAUDE.md describes the OLD web platform. RIG is now a CLI tool. Web-specific rules (Next.js frontend, FastAPI backend, design system) are N/A.

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| 1 | One module = one task | Pass | Each package has single responsibility: create-rig = scaffold, rig-cli = manage, @rig/core = shared engine |
| 2 | Minimal diff | Pass | Generation engine is additive (new presets/stacks add files, don't modify engine core) |
| 3 | Scale rigor with risk | Pass | Plan covers full architecture because this is a new product (high risk by definition) |
| 4 | Read code before changing | Pass | N/A for new project, but plan establishes this as a generated-content rule |
| 5 | After changes: typecheck + test + grep broken imports | Pass | Vitest + tsc --noEmit in CI. Pre-commit hooks for contributors |
| 6 | Checkpoint commit before risky changes | Pass | Standard git workflow for contributors |
| 7 | Security: no secrets in code | Pass | No .env needed. No auth. No telemetry. MIT license |
| 8 | Working code > perfect code | Pass | MVP scope is 2 stacks, 3 presets. Ship fast, iterate |
| 9 | Minimal diff > refactoring everything | Pass | Content architecture supports additive changes only |

**Gate:** All applicable principles Pass.

---

## 4. Architecture Overview

### 4.1 High-Level Design

```
User runs: npx create-rig
                │
                ▼
        ┌──────────────┐
        │  create-rig  │  (npm package, standalone binary)
        │  CLI layer   │
        └──────┬───────┘
               │ delegates to
               ▼
        ┌──────────────┐
        │  @rig/core   │  (private, shared package)
        │              │
        │ ┌──────────┐ │
        │ │ Prompter │ │  Interactive/CLI arg collection
        │ └────┬─────┘ │
        │      ▼       │
        │ ┌──────────┐ │
        │ │ Registry │ │  Maps preset+stack → content set
        │ └────┬─────┘ │
        │      ▼       │
        │ ┌──────────┐ │
        │ │Generator │ │  Handlebars templates → output files
        │ └────┬─────┘ │
        │      ▼       │
        │ ┌──────────┐ │
        │ │ Manifest │ │  Creates .rig/manifest.yaml
        │ └──────────┘ │
        └──────────────┘
               │ writes to disk
               ▼
        ┌──────────────────────────────────┐
        │  Project directory               │
        │  rig.toml                        │
        │  CLAUDE.md                       │
        │  AGENTS.md                       │
        │  .cursor/rules/*.mdc            │
        │  .claude/agents/*.md            │
        │  .claude/hooks/*.sh             │
        │  .claude/rules/*.md             │
        │  _hub/templates/*.md            │
        │  .rig/manifest.yaml             │
        └──────────────────────────────────┘

User runs: rig update / rig generate / rig doctor
                │
                ▼
        ┌──────────────┐
        │   rig-cli    │  (npm package, global or npx)
        │   CLI layer  │
        └──────┬───────┘
               │ delegates to
               ▼
        ┌──────────────┐
        │  @rig/core   │  (same shared package)
        │              │
        │ ┌──────────┐ │
        │ │ Updater  │ │  Version compare, backup, apply patches
        │ │ Doctor   │ │  8 diagnostic checks
        │ │Generator │ │  Regenerate from rig.toml
        │ │ Manifest │ │  Read/write manifest
        │ └──────────┘ │
        └──────────────┘
```

### 4.2 Package Structure

```
rig/                              # Monorepo root
├── package.json                  # pnpm workspace config
├── pnpm-workspace.yaml           # workspace: packages/*
├── pnpm-lock.yaml
├── tsconfig.base.json            # Shared TS config
├── vitest.workspace.ts           # Vitest workspace config
├── .github/
│   └── workflows/
│       ├── ci.yml                # lint + typecheck + test on PR
│       └── release.yml           # npm publish on tag
│
├── packages/
│   ├── create-rig/               # npx create-rig
│   │   ├── package.json          # name: "create-rig", bin: "create-rig"
│   │   ├── tsconfig.json
│   │   ├── tsup.config.ts        # Bundle deps for standalone npx
│   │   └── src/
│   │       ├── index.ts          # Entry point (bin)
│   │       ├── cli.ts            # Commander setup, arg parsing
│   │       └── prompts.ts        # Interactive prompt flow
│   │
│   ├── rig-cli/                  # rig generate | update | doctor
│   │   ├── package.json          # name: "rig-cli", bin: "rig"
│   │   ├── tsconfig.json
│   │   ├── tsup.config.ts
│   │   └── src/
│   │       ├── index.ts          # Entry point (bin)
│   │       ├── cli.ts            # Commander setup, subcommands
│   │       └── commands/
│   │           ├── generate.ts   # rig generate [target]
│   │           ├── update.ts     # rig update [--dry-run] [--component]
│   │           └── doctor.ts     # rig doctor [--json]
│   │
│   └── core/                     # @rig/core (private, never published)
│       ├── package.json          # name: "@rig/core", private: true
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts          # Public API barrel export
│           │
│           ├── schemas/          # TypeScript types + Zod validation
│           │   ├── rig-toml.ts   # RigConfig schema
│           │   ├── manifest.ts   # Manifest schema
│           │   └── agent.ts      # Agent frontmatter schema
│           │
│           ├── registry/         # Content registry
│           │   ├── index.ts      # getContentSet(preset, stack)
│           │   ├── presets.ts    # Preset definitions
│           │   └── stacks.ts    # Stack definitions
│           │
│           ├── generator/        # Generation engine
│           │   ├── index.ts      # generateProject(config, outputDir)
│           │   ├── engine.ts     # Handlebars setup, helpers, partials
│           │   ├── claude-md.ts  # CLAUDE.md generator
│           │   ├── agents-md.ts  # AGENTS.md generator
│           │   ├── cursor-mdc.ts # .cursor/rules/*.mdc generator
│           │   ├── agents.ts     # .claude/agents/*.md generator
│           │   ├── rules.ts      # .claude/rules/*.md generator
│           │   ├── hooks.ts      # .claude/hooks/*.sh generator
│           │   └── templates.ts  # _hub/templates/*.md generator
│           │
│           ├── manifest/         # Manifest management
│           │   ├── index.ts      # readManifest, writeManifest
│           │   └── hash.ts       # SHA-256 file hashing
│           │
│           ├── updater/          # Update mechanism
│           │   ├── index.ts      # update(options)
│           │   ├── diff.ts       # Compare current vs new version
│           │   ├── backup.ts     # Git branch or directory backup
│           │   └── apply.ts      # Apply patches, skip customized
│           │
│           ├── doctor/           # Health checks
│           │   ├── index.ts      # runChecks() → CheckResult[]
│           │   ├── checks/       # One file per check
│           │   │   ├── schema-freshness.ts
│           │   │   ├── format-sync.ts
│           │   │   ├── hook-coverage.ts
│           │   │   ├── dead-references.ts
│           │   │   ├── rule-contradictions.ts
│           │   │   ├── template-drift.ts
│           │   │   ├── deprecation-scan.ts
│           │   │   └── security-baseline.ts
│           │   └── types.ts      # CheckResult, CheckStatus
│           │
│           └── utils/
│               ├── fs.ts         # File system helpers (write, ensure dir)
│               ├── git.ts        # Git detection, branch creation
│               └── logger.ts     # chalk + log-symbols wrapper
│
├── content/                      # THE PRODUCT — all generated content lives here
│   ├── README.md                 # Content authoring guide
│   │
│   ├── presets/                  # Preset-specific content fragments
│   │   ├── shared/               # Shared core (all presets include this)
│   │   │   ├── rules/
│   │   │   │   ├── context-discipline.md
│   │   │   │   └── security.md
│   │   │   ├── agents/
│   │   │   │   ├── code-reviewer.md
│   │   │   │   └── verification.md
│   │   │   └── templates/
│   │   │       ├── progress-template.md
│   │   │       ├── decisions-template.md
│   │   │       └── spec-template.md
│   │   │
│   │   ├── pm/                   # PM-builder delta
│   │   │   ├── rules/
│   │   │   │   └── pm-guardrails.md
│   │   │   ├── agents/
│   │   │   │   ├── planner.md
│   │   │   │   ├── builder.md
│   │   │   │   └── reviewer.md
│   │   │   └── workflows/
│   │   │       └── discovery.md
│   │   │
│   │   ├── small-team/           # Small team delta
│   │   │   ├── rules/
│   │   │   │   ├── agent-orchestration.md
│   │   │   │   └── tool-gate.md
│   │   │   ├── agents/
│   │   │   │   ├── tech-lead.md
│   │   │   │   ├── spec-writer.md
│   │   │   │   ├── spec-planner.md
│   │   │   │   ├── task-breakdown.md
│   │   │   │   ├── frontend-react.md
│   │   │   │   ├── python-dev.md
│   │   │   │   └── debugger.md
│   │   │   └── protocols/
│   │   │       ├── checkpoint-commits.md
│   │   │       └── team-coordination.md
│   │   │
│   │   └── solo-dev/             # Solo dev delta (minimal — mostly shared core)
│   │       └── agents/
│   │           # Solo-dev uses shared core agents only (code-reviewer, verification)
│   │           # No additional agents
│   │
│   ├── stacks/                   # Stack-specific content fragments
│   │   ├── nextjs/
│   │   │   ├── hooks/
│   │   │   │   └── pre-commit-guard.sh
│   │   │   └── stack-rules.md    # npm lint, tsc --noEmit, etc.
│   │   │
│   │   └── python-fastapi/
│   │       ├── hooks/
│   │       │   └── pre-commit-guard.sh
│   │       └── stack-rules.md    # ruff check, mypy, etc.
│   │
│   └── templates/                # Handlebars templates for generated files
│       ├── claude-md.hbs         # CLAUDE.md template
│       ├── agents-md.hbs         # AGENTS.md template
│       ├── cursor-mdc.hbs        # .cursor/rules/*.mdc template
│       ├── rig-toml.hbs          # rig.toml template
│       └── partials/             # Reusable template fragments
│           ├── role-mindset.hbs  # Role & mindset section
│           ├── workflow.hbs      # Workflow section
│           ├── shared-state.hbs  # Shared state protocol
│           ├── commands.hbs      # Stack-specific commands
│           ├── git-workflow.hbs  # Git rules
│           └── agent-list.hbs   # Agent reference table
│
├── tests/                        # Integration tests (cross-package)
│   ├── e2e/
│   │   ├── create-rig.test.ts    # Full scaffold test
│   │   ├── generate.test.ts      # Regeneration test
│   │   ├── update.test.ts        # Update flow test
│   │   └── doctor.test.ts        # Health check test
│   └── fixtures/                 # Test fixtures
│       ├── minimal-project/      # Minimal rig.toml + generated files
│       └── customized-project/   # Project with user modifications
│
└── CLAUDE.md                     # Updated project CLAUDE.md (CLI, not web)
```

### 4.3 Key Decisions Summary

| # | Decision | Rationale | Reference |
|---|----------|-----------|-----------|
| 1 | pnpm monorepo | Shared code between 2 packages without publishing 3rd | D-002 |
| 2 | Handlebars templates | Logic-less, partials for composition, content-authorable | D-003 |
| 3 | Content-as-data in content/ | Separates product (content) from infrastructure (code) | D-009 |
| 4 | SHA-256 hash for customization detection | Simple, no git dependency, no false positives | D-010 |
| 5 | Zero runtime deps in generated files | Users can uninstall rig-cli, generated setup keeps working | D-013 |

---

## 5. Data Model

### 5.1 rig.toml Schema

```toml
[project]
name = "my-app"                     # Required. Project name
preset = "small-team"               # Required. pm | small-team | solo-dev
stack = "nextjs"                    # Required. nextjs | python-fastapi

[team]
size = 3                            # Optional. Team size (relevant for small-team)

[agents]
tiers = ["oversight", "planning", "workers", "quality", "specialists"]
default_memory = "project"          # project | team | personal
worker_model = "sonnet"             # Model for worker agents
oversight_model = "opus"            # Model for oversight/review agents

[hooks]
pre_commit = ["lint", "typecheck"]  # Semantic names resolved per stack

[formats]
generate = ["claude_md", "agents_md", "cursor_mdc"]  # Output targets

[updates]
channel = "stable"                  # stable | latest
auto_check = false                  # Check for updates on rig commands
```

TypeScript schema (Zod):

```typescript
import { z } from 'zod';

export const PresetSchema = z.enum(['pm', 'small-team', 'solo-dev']);
export const StackSchema = z.enum(['nextjs', 'python-fastapi']);
export const FormatTargetSchema = z.enum(['claude_md', 'agents_md', 'cursor_mdc']);
export const UpdateChannelSchema = z.enum(['stable', 'latest']);

export const RigConfigSchema = z.object({
  project: z.object({
    name: z.string().min(1),
    preset: PresetSchema,
    stack: StackSchema,
  }),
  team: z.object({
    size: z.number().int().positive().optional(),
  }).optional(),
  agents: z.object({
    tiers: z.array(z.string()).default(['oversight', 'planning', 'workers', 'quality', 'specialists']),
    default_memory: z.enum(['project', 'team', 'personal']).default('project'),
    worker_model: z.string().default('sonnet'),
    oversight_model: z.string().default('opus'),
  }).optional(),
  hooks: z.object({
    pre_commit: z.array(z.string()).default(['lint', 'typecheck']),
  }).optional(),
  formats: z.object({
    generate: z.array(FormatTargetSchema).default(['claude_md', 'agents_md', 'cursor_mdc']),
  }).optional(),
  updates: z.object({
    channel: UpdateChannelSchema.default('stable'),
    auto_check: z.boolean().default(false),
  }).optional(),
});

export type RigConfig = z.infer<typeof RigConfigSchema>;
```

### 5.2 manifest.yaml Schema

```yaml
rig_version: "0.1.0"
generated_at: "2026-04-14T10:00:00Z"

config_hash: "sha256:abc123..."           # Hash of rig.toml at generation time

components:
  agents:
    version: "1.0"
    count: 4
    schema: "claude-code-2026-04"
  hooks:
    version: "1.0"
    count: 1
  rules:
    version: "1.0"
    count: 2
  formats:
    claude_md: "1.0"
    agents_md: "1.0"
    cursor_mdc: "1.0"
  templates:
    version: "1.0"
    count: 3

compatibility:
  node: ">=18.0.0"
  claude_code: ">=2.1.0"
  cursor: ">=0.45"

files:
  "CLAUDE.md": "sha256:def456..."
  "AGENTS.md": "sha256:ghi789..."
  ".claude/agents/code-reviewer.md": "sha256:jkl012..."
  ".claude/agents/verification.md": "sha256:mno345..."
  ".claude/hooks/pre-commit-guard.sh": "sha256:pqr678..."
  ".claude/rules/context-discipline.md": "sha256:stu901..."
  ".claude/rules/security.md": "sha256:vwx234..."
  ".cursor/rules/context-discipline.mdc": "sha256:yza567..."
  # ... all generated files
```

TypeScript schema (Zod):

```typescript
export const ManifestSchema = z.object({
  rig_version: z.string(),
  generated_at: z.string().datetime(),
  config_hash: z.string(),
  components: z.object({
    agents: z.object({ version: z.string(), count: z.number(), schema: z.string() }),
    hooks: z.object({ version: z.string(), count: z.number() }),
    rules: z.object({ version: z.string(), count: z.number() }),
    formats: z.record(z.string()),
    templates: z.object({ version: z.string(), count: z.number() }),
  }),
  compatibility: z.record(z.string()),
  files: z.record(z.string()),  // path -> sha256 hash
});

export type Manifest = z.infer<typeof ManifestSchema>;
```

### 5.3 Agent Definition Schema

Agent files are Markdown with YAML frontmatter:

```markdown
---
name: code-reviewer
description: Reviews code changes against spec, conventions, and security rules
model: opus
file_ownership:
  read: ["**/*"]
  write: []
tools:
  - Bash(read-only)
  - Read
  - Grep
  - Glob
memory: project
---

# Code Reviewer

You are a code reviewer. You are NOT the implementer...

[Full agent prompt body]
```

TypeScript schema:

```typescript
export const AgentFrontmatterSchema = z.object({
  name: z.string(),
  description: z.string(),
  model: z.enum(['opus', 'sonnet', 'haiku']),
  file_ownership: z.object({
    read: z.array(z.string()),
    write: z.array(z.string()),
  }),
  tools: z.array(z.string()).optional(),
  memory: z.enum(['project', 'team', 'personal']).optional(),
});
```

---

## 6. Command Implementation

### 6.1 `create-rig` (US-1)

**Entry:** `npx create-rig` or `npx create-rig --preset=X --stack=Y --name=Z`

```
Input collection (interactive or CLI args)
    │
    ▼
Validate: Node.js >= 18, target dir writable
    │
    ▼
Check existing rig.toml → confirm overwrite if exists (AC-RIG-009)
    │
    ▼
Resolve content set: Registry.getContentSet(preset, stack)
    │
    ▼
Generate rig.toml from input
    │
    ▼
Generate all format targets (CLAUDE.md, AGENTS.md, .cursor/rules/)
    │
    ▼
Generate agents, rules, hooks, templates
    │
    ▼
Create .rig/manifest.yaml with file hashes
    │
    ▼
Print summary + next steps
```

**Error states:**
- Node.js < 18 → exit with version requirement message
- Non-empty dir with rig.toml + user declines overwrite → exit cleanly
- Invalid preset/stack in CLI args → show valid options, exit 1
- Disk full / permission error → show path + error, exit 1

### 6.2 `rig generate` (US-5)

**Entry:** `rig generate` or `rig generate <target>`

```
Read rig.toml from cwd (error if not found)
    │
    ▼
Validate rig.toml against schema
    │
    ▼
Determine targets: all from rig.toml or single from CLI arg (AC-RIG-032)
    │
    ▼
For each target:
    │
    ├── claude_md: load template + partials → render with config → write CLAUDE.md
    ├── agents_md: load template → render → write AGENTS.md
    ├── cursor_mdc: load rules → convert to MDC format → write .cursor/rules/*.mdc
    └── (agents, rules, hooks, templates: always regenerated)
    │
    ▼
Update .rig/manifest.yaml with new hashes
    │
    ▼
Print summary of generated/updated files
```

**Determinism guarantee (NFR-004, AC-RIG-037):**
- No timestamps in generated content (only in manifest.yaml)
- Template rendering is deterministic (Handlebars with sorted object keys)
- File write order is alphabetical
- No random values anywhere

### 6.3 `rig update` (US-3)

**Entry:** `rig update` or `rig update --dry-run` or `rig update --component agents`

```
Read rig.toml + .rig/manifest.yaml
    │
    ▼
Determine current rig-cli version (from package.json)
    │
    ▼
Compare bundled content versions vs manifest component versions
    │   (No network call — versions come from the installed rig-cli package)
    │
    ▼
If no updates available → "Already up to date" + exit 0
    │
    ▼
Build changelist: which components have new versions
    │
    ▼
For each component in changelist:
    │
    ├── Generate new version of files
    ├── Compare against current files on disk
    ├── Check file hash against manifest (customization detection)
    │   ├── Hash matches manifest → file was NOT customized → safe to update
    │   └── Hash differs from manifest → file WAS customized → mark for manual review
    └── Build changelog entry (what changed, impact, patch)
    │
    ▼
If --dry-run → print changelist + changelog → exit 0 (AC-RIG-018)
    │
    ▼
If --component → filter changelist to requested component (AC-RIG-020)
    │
    ▼
Create backup (AC-RIG-021):
    ├── In git repo → create branch rig/backup-{timestamp}
    └── Not in git → copy to .rig/backups/{timestamp}/
    │
    ▼
Apply changes:
    ├── Safe files (not customized) → overwrite
    └── Customized files → skip, add to "manual review" list
    │
    ▼
Update .rig/manifest.yaml with new versions + hashes (AC-RIG-023)
    │
    ▼
Print summary: applied changes + manual review list with diffs
```

**Update source (AC-RIG-025):** Updates come from the rig-cli npm package itself. When a user runs `npm update rig-cli`, the new version contains updated content. `rig update` then compares the bundled content against what's on disk.

**Offline handling (AC-RIG-024):** `rig update` itself is offline — it compares bundled vs disk. The "network" part is `npm update rig-cli` which the user runs separately. If rig-cli is already up to date, `rig update` says "Already up to date."

**Changelog generation (AC-RIG-019):** Each content version bump includes a `CHANGELOG.md` entry bundled in the rig-cli package. The updater reads these entries and formats them per-component.

### 6.4 `rig doctor` (US-4)

**Entry:** `rig doctor` or `rig doctor --json`

```
Read rig.toml + .rig/manifest.yaml
    │
    ▼
Run 8 checks (all offline, AC-RIG-031):
    │
    ├── 1. Schema freshness
    │   Compare agent frontmatter fields against known schema version
    │   PASS: all agents use latest fields
    │   WARN: missing optional new fields
    │   FAIL: missing required fields
    │
    ├── 2. Format sync
    │   Regenerate CLAUDE.md/AGENTS.md in memory, compare hash against disk
    │   PASS: disk matches generated
    │   WARN: disk differs (rig.toml changed but rig generate not run)
    │   FAIL: N/A (warn is sufficient)
    │
    ├── 3. Hook coverage
    │   Check .claude/hooks/ exists, pre-commit-guard.sh present + executable
    │   Check .git/hooks/pre-commit exists and references rig hook
    │   PASS: hooks installed and executable
    │   WARN: hooks exist but git hook not installed
    │   FAIL: hooks directory missing
    │
    ├── 4. Dead references
    │   Parse CLAUDE.md + agent files for file paths, verify each exists
    │   PASS: all references resolve
    │   FAIL: broken reference found (with path + line)
    │
    ├── 5. Rule contradictions
    │   Check for known contradiction patterns between rules
    │   (e.g., one rule says "always X", another says "never X")
    │   PASS: no contradictions detected
    │   WARN: potential contradiction found
    │
    ├── 6. Template drift
    │   Compare _hub/templates/ against current RIG template versions
    │   PASS: templates match
    │   WARN: templates outdated
    │
    ├── 7. Deprecation scan
    │   Grep for known deprecated patterns in all managed files
    │   PASS: no deprecated patterns
    │   WARN: deprecated patterns found
    │
    └── 8. Security baseline
        Check: gitleaks hook present, .gitignore covers *.env, *.key, *.pem
        PASS: security baseline met
        WARN: partial coverage
        FAIL: critical gap (e.g., no .gitignore)
    │
    ▼
Aggregate results → worst status = overall status
    │
    ▼
Output:
    ├── Default → human-readable with colors/symbols (AC-RIG-027, AC-RIG-028)
    └── --json → JSON array of {check_name, status, message, remediation} (AC-RIG-029)
    │
    ▼
Exit code: 0 (all pass) / 1 (any warn) / 2 (any fail) (AC-RIG-030)
```

---

## 7. Content Architecture

### 7.1 Content Composition Model

Content is composed in layers. Each layer adds or overrides content from the previous layer:

```
Layer 1: Shared Core (all presets)
    └── rules/context-discipline.md
    └── rules/security.md
    └── agents/code-reviewer.md
    └── agents/verification.md
    └── templates/progress-template.md
    └── templates/decisions-template.md
    └── templates/spec-template.md

Layer 2: Preset Delta (additive)
    └── [pm] agents/planner.md, builder.md, reviewer.md
    └── [pm] rules/pm-guardrails.md
    └── [pm] workflows/discovery.md
    └── [small-team] agents/tech-lead.md, spec-writer.md, ...
    └── [small-team] rules/agent-orchestration.md, tool-gate.md
    └── [solo-dev] (no additional files — shared core is sufficient)

Layer 3: Stack Overlay (additive)
    └── [nextjs] hooks/pre-commit-guard.sh (npm lint + tsc)
    └── [nextjs] stack-rules.md (TypeScript commands)
    └── [python-fastapi] hooks/pre-commit-guard.sh (ruff + mypy)
    └── [python-fastapi] stack-rules.md (Python commands)
```

### 7.2 Content Registry

The registry resolves a preset+stack combination into a complete content set:

```typescript
interface ContentSet {
  agents: AgentDefinition[];      // Shared core + preset delta
  rules: RuleDefinition[];        // Shared core + preset delta
  hooks: HookDefinition[];        // Stack-specific
  templates: TemplateDefinition[];// Shared core
  workflows: WorkflowDefinition[];// Preset-specific (pm only in MVP)
  claudeMdContext: ClaudeMdContext; // Variables for CLAUDE.md template
  agentsMdContext: AgentsMdContext; // Variables for AGENTS.md template
}

function getContentSet(preset: Preset, stack: Stack): ContentSet {
  const shared = loadSharedCore();
  const presetDelta = loadPresetDelta(preset);
  const stackOverlay = loadStackOverlay(stack);

  return {
    agents: [...shared.agents, ...presetDelta.agents],
    rules: [...shared.rules, ...presetDelta.rules],
    hooks: stackOverlay.hooks,
    templates: shared.templates,
    workflows: presetDelta.workflows,
    claudeMdContext: buildClaudeMdContext(preset, stack, /* merged content */),
    agentsMdContext: buildAgentsMdContext(preset, stack, /* merged content */),
  };
}
```

### 7.3 Content Authoring Guide

Adding a new agent definition:

1. Create `content/presets/{preset}/agents/{name}.md` with YAML frontmatter + prompt body
2. Register in `packages/core/src/registry/presets.ts` (add to preset's agent list)
3. Run `pnpm test` — content validation tests verify frontmatter schema, file existence, all presets covered
4. Handlebars templates auto-discover agents from the content set (no template changes needed)

Adding a new stack:

1. Create `content/stacks/{stack-name}/` with hooks + stack-rules.md
2. Add to `StackSchema` enum in `packages/core/src/schemas/rig-toml.ts`
3. Register in `packages/core/src/registry/stacks.ts`
4. Add Handlebars partial for stack-specific commands
5. Run full test suite — integration tests verify all preset+stack combos

---

## 8. Generation Engine

### 8.1 Template System

Handlebars templates with partials for composition:

```
content/templates/claude-md.hbs (main template)
    {{> role-mindset preset=preset }}
    {{> commands stack=stack }}
    {{#each rules}}
      {{this.content}}
    {{/each}}
    {{> workflow preset=preset }}
    {{> shared-state preset=preset }}
    {{> git-workflow }}
    {{> agent-list agents=agents }}
```

Custom Handlebars helpers:

```typescript
// {{#is preset "pm"}} ... {{/is}}
Handlebars.registerHelper('is', (a, b, options) =>
  a === b ? options.fn(this) : options.inverse(this)
);

// {{#unless-is preset "solo-dev"}} ... {{/unless-is}}
Handlebars.registerHelper('unless-is', (a, b, options) =>
  a !== b ? options.fn(this) : options.inverse(this)
);

// {{#includes array "item"}} ... {{/includes}}
Handlebars.registerHelper('includes', (arr, item, options) =>
  arr.includes(item) ? options.fn(this) : options.inverse(this)
);
```

### 8.2 Generation Flow

```typescript
async function generateProject(config: RigConfig, outputDir: string): Promise<GenerationResult> {
  // 1. Resolve content
  const contentSet = registry.getContentSet(config.project.preset, config.project.stack);

  // 2. Compile templates (cached across calls for performance)
  const engine = new TemplateEngine();

  // 3. Generate each file category
  const files: GeneratedFile[] = [];

  // rig.toml
  files.push({ path: 'rig.toml', content: engine.render('rig-toml', config) });

  // CLAUDE.md
  files.push({ path: 'CLAUDE.md', content: engine.render('claude-md', contentSet.claudeMdContext) });

  // AGENTS.md
  files.push({ path: 'AGENTS.md', content: engine.render('agents-md', contentSet.agentsMdContext) });

  // .cursor/rules/*.mdc
  for (const rule of contentSet.rules) {
    files.push({
      path: `.cursor/rules/${rule.name}.mdc`,
      content: engine.render('cursor-mdc', rule),
    });
  }

  // .claude/agents/*.md (direct copy — agent files ARE the content)
  for (const agent of contentSet.agents) {
    files.push({
      path: `.claude/agents/${agent.name}.md`,
      content: agent.rawContent,  // Frontmatter + body, no templating
    });
  }

  // .claude/rules/*.md (direct copy)
  for (const rule of contentSet.rules) {
    files.push({
      path: `.claude/rules/${rule.name}.md`,
      content: rule.rawContent,
    });
  }

  // .claude/hooks/*.sh (from stack overlay)
  for (const hook of contentSet.hooks) {
    files.push({
      path: `.claude/hooks/${hook.name}`,
      content: hook.rawContent,
    });
  }

  // _hub/templates/*.md (direct copy)
  for (const template of contentSet.templates) {
    files.push({
      path: `_hub/templates/${template.name}`,
      content: template.rawContent,
    });
  }

  // 4. Write files (sorted alphabetically for determinism)
  files.sort((a, b) => a.path.localeCompare(b.path));
  for (const file of files) {
    await writeFile(join(outputDir, file.path), file.content);
  }

  // 5. Create manifest
  const manifest = buildManifest(config, files);
  await writeFile(join(outputDir, '.rig/manifest.yaml'), serializeManifest(manifest));

  return { files, manifest };
}
```

### 8.3 CLAUDE.md Structure Per Preset

**PM preset CLAUDE.md:**
```markdown
# [Project Name] — AI Development Setup

> RIG-managed. Regenerate with `rig generate`.

## Role & Mindset
[Simplified, encouraging. "You are a helpful assistant..."]

## How We Work
[Plan → Build → Review → Ship. No jargon.]

## Discovery Workflow
[Problem statement → User stories → AC → Prototype → Review]

## Safety Rules
- Always create a branch before making changes
- Always run the reviewer before merging
- Never push directly to main
- Never delete files without asking

## Commands
[Stack-specific: npm run lint, etc.]

## Shared State
[Simplified PROGRESS.md and DECISIONS.md references]
```

**Small-team preset CLAUDE.md:**
```markdown
# [Project Name]

> RIG-managed. Regenerate with `rig generate`.

## Role & Mindset
[Technical, terse, expert-level]

## Core Principles
| # | Rule |
|---|------|
| 1 | One module = one task |
| 2 | Minimal diff |
| 3 | Scale rigor with risk |

## Workflow
[Full pipeline: Low/Medium/High risk. Spec-driven development]

## Agent Orchestration
[Sequential pipeline, fresh-session verify, 5-tier agent system]

## Shared State
[Full PROGRESS.md + DECISIONS.md protocols]

## Commands
[Stack-specific commands]

## Testing
[Full quality pipeline]
```

**Solo-dev preset CLAUDE.md:**
```markdown
# [Project Name]

> RIG-managed. Regenerate with `rig generate`.

## Role & Mindset
[Technical, minimal]

## Rules
[Context-discipline, security — minimal set]

## Commands
[Stack-specific commands]

## Quality
[Lint + typecheck + code-reviewer. No orchestration overhead]
```

---

## 9. Update Mechanism

### 9.1 Version Strategy

Content versions are embedded in the rig-cli package. Each rig-cli release bundles a specific content version:

```
rig-cli@0.1.0 → content v1.0 (agents v1.0, hooks v1.0, rules v1.0)
rig-cli@0.2.0 → content v1.1 (agents v1.1, hooks v1.0, rules v1.0)
rig-cli@0.3.0 → content v2.0 (agents v2.0, hooks v1.1, rules v1.0)
```

### 9.2 Changelog Bundling

Each content version bump includes a changelog entry in `content/CHANGELOG.md`:

```markdown
## v1.1 (2026-05-01)

### agents (v1.0 → v1.1)
- **What changed:** Claude Code added sub-agent naming support
- **Impact:** Agent definitions can reference sub-agents by name for clearer orchestration
- **Patch:** Added `sub_agents` field to tech-lead and spec-writer agent frontmatter

### hooks (no change)

### rules (no change)
```

The updater reads this file and formats it for terminal output.

### 9.3 Update Safety Model

```
rig update flow:

1. Read .rig/manifest.yaml → get installed content versions
2. Read bundled content versions → get available content versions
3. For each component with a version bump:
   a. Generate new file content in memory
   b. Read current file from disk
   c. Compare disk file hash vs manifest hash:
      - MATCH → file is unmodified → safe to overwrite
      - MISMATCH → file was customized → skip, add to review list
4. If --dry-run → print report → exit
5. Create backup (git branch or .rig/backups/)
6. Write safe files
7. Update manifest with new versions + hashes
8. Print report with:
   - Applied changes (component, version, file count)
   - Manual review needed (customized files with diff)
```

---

## 10. Testing Strategy

### 10.1 Test Categories

| Category | What | Framework | Location |
|----------|------|-----------|----------|
| Unit tests | Schema validation, content registry, template helpers, hash calculation | Vitest | packages/*/src/**/*.test.ts |
| Content tests | Frontmatter schema compliance, preset completeness, all preset+stack combos covered | Vitest | packages/core/src/registry/*.test.ts |
| Snapshot tests | Generated CLAUDE.md, AGENTS.md, .cursor/rules/ for each preset+stack | Vitest | packages/core/src/generator/*.test.ts |
| Integration tests | create-rig E2E (run CLI, verify output), rig doctor E2E | Vitest | tests/e2e/*.test.ts |
| Determinism tests | Run generate twice, assert byte-identical output | Vitest | tests/e2e/generate.test.ts |

### 10.2 Key Test Cases

**Content registry:**
- Every preset+stack combination returns a non-empty content set
- Shared core agents appear in every content set
- Preset-specific agents appear only in their preset
- Stack-specific hooks match the stack

**Generation engine:**
- Snapshot tests for all 6 combinations (3 presets x 2 stacks)
- Generated CLAUDE.md is valid markdown
- Generated agent files have valid frontmatter
- Generated hooks are executable (file mode check)
- rig.toml round-trip: parse → generate → parse → identical

**Update mechanism:**
- Unmodified files are updated
- Modified files are preserved
- Backup is created (git branch or directory)
- Manifest is updated correctly
- Dry-run modifies no files

**Doctor checks:**
- Freshly generated project → all PASS
- Delete an agent file → dead reference FAIL
- Modify a file → format sync WARN
- Remove hook → hook coverage WARN

### 10.3 CI Pipeline

```yaml
# .github/workflows/ci.yml
- pnpm install --frozen-lockfile
- pnpm lint          # eslint across all packages
- pnpm typecheck     # tsc --noEmit across all packages
- pnpm test          # vitest run across all packages
- pnpm build         # tsup build for both publishable packages
# On release tag:
- pnpm -r publish    # publish create-rig + rig-cli to npm
```

---

## 11. Development Phases

### Phase 1: Foundation (P1 — ship first)

**Goal:** `npx create-rig` works. User gets a working AI dev setup.

Tasks:
1. Monorepo scaffold (pnpm workspace, tsconfig, vitest, tsup)
2. Zod schemas for rig.toml, manifest, agent frontmatter
3. Content authoring: shared core (rules, agents, templates)
4. Content authoring: 3 presets x 2 stacks (6 content sets)
5. Content registry implementation
6. Generation engine (Handlebars templates + partials)
7. create-rig CLI (interactive prompts + non-interactive mode)
8. Manifest creation
9. Snapshot tests for all 6 preset+stack combinations
10. E2E test: npx create-rig → verify all files exist + valid

**Linked user stories:** US-1, US-2
**AC coverage:** AC-RIG-001 through AC-RIG-017, AC-RIG-048

### Phase 2: Regeneration (P2)

**Goal:** `rig generate` works. User can change rig.toml and regenerate.

Tasks:
1. rig-cli scaffold (Commander subcommands)
2. `rig generate` command implementation
3. `rig generate <target>` single-target mode
4. Determinism tests (run twice, assert identical)

**Linked user stories:** US-5
**AC coverage:** AC-RIG-032 through AC-RIG-037

### Phase 3: Update (P1)

**Goal:** `rig update` works. User can update content when rig-cli is updated.

Tasks:
1. Content version tracking in bundled package
2. Changelog bundling
3. Customization detection (hash comparison)
4. Backup mechanism (git branch + directory fallback)
5. `rig update` command (apply)
6. `rig update --dry-run` command (preview)
7. `rig update --component` command (selective)
8. Update safety tests

**Linked user stories:** US-3
**AC coverage:** AC-RIG-018 through AC-RIG-025, AC-RIG-045 through AC-RIG-047

### Phase 4: Health Check (P2)

**Goal:** `rig doctor` works. User can validate their setup.

Tasks:
1. Check framework (runner, types, aggregation)
2. Implement 8 checks (one file each)
3. Human-readable output with remediation
4. `rig doctor --json` output
5. Exit code logic
6. Tests: fresh project passes, each issue type detected

**Linked user stories:** US-4
**AC coverage:** AC-RIG-026 through AC-RIG-031

### Phase 5: Polish (P2-P3)

**Goal:** PM workflow, autonomous agent compat, publish.

Tasks:
1. PM discovery workflow content (AC-RIG-038 through AC-RIG-041)
2. Autonomous agent compatibility (AC-RIG-042 through AC-RIG-044)
3. README, LICENSE, contributing guide
4. npm publish workflow
5. Package size verification (<2MB create-rig, <5MB rig-cli)

**Linked user stories:** US-6, US-7

---

## 12. Interfaces Between Components

### 12.1 Core Public API

```typescript
// packages/core/src/index.ts — barrel export

// Schemas
export { RigConfigSchema, type RigConfig } from './schemas/rig-toml';
export { ManifestSchema, type Manifest } from './schemas/manifest';
export { AgentFrontmatterSchema, type AgentFrontmatter } from './schemas/agent';

// Registry
export { getContentSet, type ContentSet } from './registry';

// Generator
export { generateProject, type GenerationResult } from './generator';
export { generateTarget, type FormatTarget } from './generator';

// Manifest
export { readManifest, writeManifest, computeFileHash } from './manifest';

// Updater
export { checkForUpdates, applyUpdates, type UpdatePlan } from './updater';

// Doctor
export { runChecks, type CheckResult, type CheckStatus } from './doctor';

// Utils
export { Logger } from './utils/logger';
```

### 12.2 create-rig → @rig/core

```typescript
// packages/create-rig/src/cli.ts
import { RigConfigSchema, generateProject, Logger } from '@rig/core';

async function run(options: CreateOptions) {
  const config = RigConfigSchema.parse({
    project: { name: options.name, preset: options.preset, stack: options.stack },
    team: options.teamSize ? { size: options.teamSize } : undefined,
  });

  const result = await generateProject(config, process.cwd());
  Logger.summary(result);
}
```

### 12.3 rig-cli → @rig/core

```typescript
// packages/rig-cli/src/commands/generate.ts
import { readManifest, generateTarget, RigConfigSchema } from '@rig/core';

async function generate(target?: string) {
  const config = RigConfigSchema.parse(readToml('rig.toml'));
  if (target) {
    await generateTarget(config, target, process.cwd());
  } else {
    await generateProject(config, process.cwd());
  }
}
```

---

## 13. Risk Assessment

| # | Risk | Severity | Likelihood | Mitigation |
|---|------|----------|------------|------------|
| 1 | **Content quality is low** — generated agents/rules don't actually work in Claude Code/Cursor | HIGH | MEDIUM | Test every agent definition in a real Claude Code session before shipping. Snapshot tests verify structure but not behavior. Manual QA pass required for Phase 1 |
| 2 | **Handlebars too limiting** — complex CLAUDE.md composition needs logic that Handlebars can't express | MEDIUM | LOW | Custom helpers cover conditionals. If truly blocked, Handlebars can be replaced (D-003 is reversible). Start simple, add helpers as needed |
| 3 | **npm package name squatting** — `create-rig` or `rig-cli` already taken on npm | HIGH | MEDIUM | Check npm registry immediately. Fallback names: `create-rigdev`, `rig-dev-cli`. Reserve names by publishing placeholder packages early |
| 4 | **Determinism broken** — timestamps, OS-dependent line endings, or non-deterministic template rendering | MEDIUM | MEDIUM | Explicit tests: generate twice, compare byte-by-byte. Use `\n` everywhere (no `os.EOL`). No `Date.now()` in generated content |
| 5 | **Update mechanism too complex for MVP** — hash comparison, backup, diff display | MEDIUM | LOW | Phase 3 has a clean scope. Hash comparison is straightforward (SHA-256). Start with git-branch backup only, add directory fallback later |
| 6 | **create-rig bundling issues** — standalone npx needs all deps bundled, version conflicts | MEDIUM | MEDIUM | tsup can bundle deps. Test `npx create-rig` in clean environment (no global installs). CI test in Docker |
| 7 | **Competitive window closes** — JetBrains Central or similar ships while we're building | HIGH | HIGH | Phase 1 is the priority. Ship `npx create-rig` working within 2-3 weeks. Everything else is incremental. First-mover in npm CLI space matters more than completeness |
| 8 | **Content bloat** — package exceeds size limits (NFR-006: create-rig <2MB, rig-cli <5MB) | LOW | LOW | Content is plain text (markdown + shell). Total content for 6 combinations is likely <500KB. Monitor in CI |
| 9 | **Rule contradictions across presets** — shared core rule contradicts preset-specific rule | MEDIUM | MEDIUM | Doctor check #5 (rule contradictions) catches this. Content review process. Shared core is authoritative — preset deltas are additive, not override |
| 10 | **AGENTS.md format changes** — industry standard is still evolving | MEDIUM | HIGH | AGENTS.md generator is isolated (one file). When format changes, update generator, bump format version. Existing projects unaffected until they run `rig update` |
| 11 | **BUSINESS: No market fit** — nobody pays for AI dev harness when free alternatives exist | HIGH | HIGH | Validate with PM-builders first (lowest barrier, highest pain). Open-source core removes payment barrier. Revenue model decided post-validation. If PMs don't adopt → product thesis is wrong |
| 12 | **BUSINESS: PM-builders can't use CLI** — target segment doesn't know terminal, npx, npm | HIGH | MEDIUM | LLM-native onboarding (§15.2): user asks LLM "what is RIG?" and LLM guides them. `create-rig` prompt UX is as simple as possible. Landing page with video walkthrough. Long-term: Claude Skills marketplace distribution (zero CLI) |
| 13 | **BUSINESS: Content is the only real value** — CLI is commodity, content is differentiator. If content is generic/untested → zero value | **CRITICAL** | MEDIUM | Content sourced from real dogfood (thermocalc, equipment-tracker), not theory. Every agent tested in real Claude Code session. Post-MVP: ecosystem monitoring module for continuous content improvement |
| 14 | **BUSINESS: Wrong primary segment** — we optimized for PMs but devs are the actual buyers | MEDIUM | MEDIUM | Presets make pivot cheap. If PM validation fails, shift focus to solo-dev (same core, different delta). Monitor which preset gets traction |
| 15 | **BUSINESS: Claude Code absorbs our features** — CC adds native presets, team governance, skills curation | HIGH | MEDIUM | RIG is multi-tool (CC + Cursor + any AGENTS.md tool). CC-native features are CC-only. Also: CC growing features validates the space, not kills it |

---

## 14. Managed vs Unmanaged Files

`rig update` operates ONLY on managed files. This distinction is critical for update safety (AC-RIG-045, AC-RIG-046).

### Managed Files (tracked in `.rig/manifest.yaml`, updated by RIG)

```
CLAUDE.md                    # regenerated, but project-specific sections preserved
AGENTS.md                    # regenerated
.claude/agents/*.md          # updated
.claude/rules/*.md           # updated
.claude/hooks/*.sh           # updated
.cursor/rules/*.mdc          # updated
_hub/templates/*.md          # updated
rig.toml                     # NEVER overwritten (user's config)
.rig/manifest.yaml           # always updated
```

### Unmanaged Files (NEVER touched by `rig update`)

```
PROGRESS.md                  # agent-generated shared state
DECISIONS.md                 # agent-generated shared state
memory/                      # agent/user memory (survives across sessions)
specs/                       # spec-driven workflow artifacts
*.ts, *.py, *.tsx            # user's actual code
.env, .env.local             # secrets
package.json, pyproject.toml # user's dependencies
ANY file not in manifest     # anything RIG didn't create
```

### CLAUDE.md Merge Strategy

CLAUDE.md is special — it has RIG-managed sections AND user/agent-added sections.

```
## [RIG-MANAGED] Role & Mindset        ← regenerated by rig update
## [RIG-MANAGED] Agents                 ← regenerated
## [RIG-MANAGED] Quality Gates          ← regenerated
## [RIG-MANAGED] About RIG              ← regenerated (onboarding)
## Project Structure                    ← user-added, hash differs → PRESERVED
## Custom Workflows                     ← user-added → PRESERVED
```

Detection: sections starting with `[RIG-MANAGED]` marker are owned by RIG. All other sections are user-owned. Update regenerates RIG sections, preserves user sections in-place.

---

## 15. LLM-Native Onboarding

### 15.1 Problem

PM-builders don't read docs. They open Claude Code and start talking. RIG must explain itself through the LLM, not through README or landing page.

### 15.2 Implementation

Generated CLAUDE.md includes an `[RIG-MANAGED] About RIG` section:

```markdown
## [RIG-MANAGED] About RIG

> This project uses RIG (Managed AI Dev Practice). If the user asks what RIG is,
> how it works, or needs help getting started, use this section.

**What is RIG:** An opinionated AI dev setup — agents, rules, hooks, workflows —
installed via `npx create-rig` and kept current via `rig update`.

**This project's setup:**
- Preset: {{preset}} ({{preset_description}})
- Stack: {{stack}}
- Agents: {{agent_count}} ({{agent_names}})
- Rules: {{rule_count}} active rules
- Hooks: pre-commit ({{hook_checks}})

**How to use:**
- Just work normally. Agents, rules, and hooks are already active.
- Quality gates run automatically on commit.
- Ask me to "use code-reviewer" or "run verification" to invoke agents.

**How to update:** Run `rig update` to get latest agent definitions and rules.
**How to check health:** Run `rig doctor` to validate your setup.
**Need help?** Ask me anything about how this project is configured.
```

This is rendered by Handlebars from rig.toml values. The LLM reads it on session start and can explain RIG to the user conversationally.

### 15.3 Preset-Specific Onboarding Tone

- **PM preset:** "You have a discovery workflow. Start by telling me what you want to build."
- **Solo-dev preset:** "Your setup is minimal. Agents handle quality. Just code."
- **Small-team preset:** "Shared state files coordinate your team. PROGRESS.md tracks work."

---

## 16. Operations: Content Authoring Pipeline

### 16.1 MVP (Manual)

```
Us (manual monitoring)
  → "Claude Code shipped sub-agents" / "Cursor added AGENTS.md v2"
  → We write updated agent definition / rule / hook
  → Test on real project (dogfood on thermocalc / equipment-tracker)
  → Update content/ in monorepo
  → Write CHANGELOG entry (what changed, impact, patch)
  → npm version bump + publish
  → Users: npm update rig-cli && rig update
```

### 16.2 Post-MVP: Ecosystem Monitoring Module

Adapted from [polyakov-claude-skills/telegram-channel-parser](https://github.com/artwist-polyakov/polyakov-claude-skills):

```
Ecosystem monitor (RIG skill or standalone)
  Sources:
  - Telegram AI channels (t.me/s/ scraping, zero API keys)
  - GitHub releases (Claude Code, Cursor, AGENTS.md spec repos)
  - RSS feeds (Anthropic blog, OpenAI blog, major AI dev blogs)
  - Changelog files (raw.githubusercontent.com)

  Pipeline:
  curl → parser (awk/jq per source) → JSON digest → React feed artifact

  Output:
  - Daily/weekly digest: what changed in AI dev ecosystem
  - Filtered by relevance to RIG (agent tooling, dev workflows, IDE updates)
  - Actionable items tagged: "content update needed" / "FYI" / "competitive move"
```

Architecture: fork polyakov's `common.sh` + `digest_json.sh` pattern. Add source adapters for GitHub API + RSS. Telegram parser reusable as-is. Zero dependencies (curl + awk + jq).

### 16.3 Content Quality Gate

Before any content ships in a rig-cli release:
1. Agent definitions tested in real Claude Code session (manual QA)
2. Rules verified: no contradictions with existing rules (`rig doctor` check #5)
3. Hooks tested: pre-commit blocks bad code in both stacks
4. Snapshot tests pass (structure validation)
5. CHANGELOG entry written with what/impact/patch format

---

## 17. Landing Page

Repurpose existing RIG Next.js codebase (`my-projects/RIG/frontend/`) as marketing site.

**Keep:** Next.js 15, Tailwind CSS, neo-brutalist design system, fonts (Space Grotesk, Manrope, IBM Plex Mono)
**Remove:** FastAPI backend, SQLite, auth, admin panel, all CRUD functionality
**Add:** Static marketing content, interactive demo (animated terminal showing `npx create-rig`), preset comparison, "Get Started" CTA

**Separate workstream.** Not blocking CLI MVP. Can ship landing page while CLI is in Phase 1-2.

**Pages:**
- `/` — Hero + value prop + animated terminal demo
- `/presets` — PM vs Solo-Dev vs Small-Team comparison
- `/docs` — Getting started guide, command reference
- `/updates` — Living changelog (what's new in each version)

---

## 18. Distribution Channels

### 18.1 Day 1: npm (primary)

```bash
npx create-rig          # scaffolding
npm i -g rig-cli         # management
```

### 18.2 Post-MVP: Claude Skills Marketplace

RIG presets publishable as Claude Code skills via marketplace format:

```json
// .claude-plugin/marketplace.json
{
  "$schema": "https://anthropic.com/claude-code/marketplace.schema.json",
  "plugins": [{
    "name": "rig-pm-preset",
    "description": "RIG PM-builder preset: discovery workflow + guardrails",
    "source": "plugins/rig-pm/",
    "category": "development"
  }]
}
```

Install: `/plugin marketplace add rig-dev/rig-presets`

This gives us distribution to Claude Code users who don't know npm. The skill contains the same content as the npm package but installed through CC's native UI.

### 18.3 Post-MVP: SourceCraft Sites

For markets where GitHub Pages is restricted (e.g., Russia). Landing page + digest artifacts hosted on sourcecraft.site.

---

## 19. Feedback Collection

### 19.1 LLM-native feedback (P1, MVP)

In generated CLAUDE.md:
```markdown
## [RIG-MANAGED] Feedback

> If the user mentions problems with the setup, suggests improvements,
> or says something isn't working, offer to capture their feedback.
> Format it as a GitHub issue body and help them submit it.
```

The LLM itself becomes the feedback collection mechanism. User says "this agent sucks" → LLM formats it → opens browser to pre-filled GitHub issue.

### 19.2 `rig feedback` command (post-MVP)

```bash
rig feedback                    # interactive: what's good, what's bad, preset, stack
rig feedback --issue "X broken" # quick issue creation via gh CLI
```

### 19.3 Dogfood channel (MVP, manual)

Direct feedback from PM colleagues using RIG on real projects. No tooling needed.

---

## 20. Complexity Justification

| # | Complexity Added | Why Simple Isn't Enough |
|---|-----------------|------------------------|
| 1 | Monorepo (3 packages) | `create-rig` must be separate npm package for `npx` convention. Shared code prevents duplication of schemas, registry, generation engine |
| 2 | Handlebars templates | String concatenation works for 1 preset. With 3 presets x 2 stacks x 3 output formats = 18 combinations, templates are necessary for maintainability |
| 3 | Content registry | Without a registry, preset+stack resolution would be ad-hoc if/else chains. Registry makes it declarative and testable |
| 4 | SHA-256 file hashing | Could skip customization detection entirely (always overwrite on update). But spec requires preservation (AC-RIG-022) and this is what makes updates safe |
| 5 | 8 doctor checks | Could ship with 3-4 checks. But the full 8 are specified (AC-RIG-026) and each is a simple, isolated function. No check is complex individually |

---

## Handoff

- [x] Stack chosen and justified (TypeScript + Node.js, all libs in DECISIONS.md)
- [x] Constitution check passed (all principles Pass)
- [x] Architecture documented (component diagram, package structure, generation flow)
- [x] All [NEEDS CLARIFICATION] from spec resolved (spec has 0 open questions)
- [x] Data model defined (rig.toml schema, manifest schema, agent frontmatter schema)
- [x] API contracts defined (core public API, CLI → core interfaces)
- [x] 13 decisions logged in DECISIONS.md (D-001 through D-013)
- [x] Business risks assessed (market fit, PM usability, content value, segment risk, platform risk)
- [x] Managed vs unmanaged files defined (§14)
- [x] LLM-native onboarding designed (§15)
- [x] Content authoring pipeline documented (§16)
- [x] Landing page strategy (§17)
- [x] Distribution channels (§18: npm + Claude Skills + SourceCraft)
- [x] Feedback collection mechanism (§19)
- [x] Ready for `/task-breakdown` (re-run with updated spec/design)
