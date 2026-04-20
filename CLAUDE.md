# GYRD

> Managed AI dev practice. npm CLI tooling.

## Project

- **Name:** GYRD (create-gyrd + @gyrd/cli)
- **Type:** npm CLI monorepo (pnpm workspace)
- **Packages:** `@gyrd/core` (private), `create-gyrd`, `@gyrd/cli`
- **Node:** >=18.0.0 (target: 22 LTS)

## Stack

- TypeScript (strict), ESM-only (`type: "module"`)
- Commander.js (CLI parsing), @inquirer/prompts (interactive flows)
- Handlebars (template rendering), Zod (schema validation)
- @iarna/toml + yaml (config parsing), chalk + log-symbols (output)
- Vitest (testing), tsup (bundling)
- pnpm 9.x (workspace manager)

## Commands

```bash
pnpm install          # Install deps
pnpm build            # Build all packages (tsup)
pnpm test             # Run all tests (203 tests, vitest)
pnpm typecheck        # TypeScript check (pnpm -r typecheck)
pnpm lint             # ESLint across packages
```

## Project Structure

```
GYRD/
├── packages/
│   ├── core/           # @gyrd/core — schemas, registry, generator, updater, doctor
│   ├── create-gyrd/    # npx create-gyrd — interactive project setup wizard
│   └── gyrd-cli/       # gyrd generate/update/doctor commands
├── content/
│   ├── presets/         # Agent/rule/workflow content by preset (pm, small-team, solo-dev)
│   ├── stacks/          # Stack-specific hooks and rules (nextjs, python-fastapi)
│   └── templates/       # Handlebars templates (.hbs) for output generation
├── tests/e2e/           # End-to-end tests
└── specs/1-rig-mvp/     # Spec, design, tasks, progress, decisions
```

## Key Concepts

- **Content-as-data:** `content/` directory IS the product. Agents, rules, hooks, templates live there as structured data, not code.
- **Three presets:** `pm`, `small-team`, `solo-dev` — same capabilities, different onboarding tone and defaults.
- **Two stacks:** `nextjs`, `python-fastapi` — different pre-commit hooks and stack-specific rules.
- **[GYRD-MANAGED] markers:** Sections in generated CLAUDE.md that `gyrd update` can safely overwrite without touching user customizations.
- **gyrd.toml:** Project config file — preset, stack, version, custom overrides.

## [GYRD-MANAGED] Role & Mindset

**Output:** Code first, talk later. Minimal explanations unless asked.
**Priorities:** Working code, minimal diff, security.

## [GYRD-MANAGED] About GYRD

> This project uses GYRD (Managed AI Dev Practice). If the user asks what GYRD is,
> how it works, or needs help getting started, use this section to explain.

**What is GYRD:** An opinionated AI dev setup — agents, rules, hooks, workflows —
installed via `npx create-gyrd` and kept current via `gyrd update`.

**Useful commands:**
- `gyrd update` — Get latest agent definitions and rules
- `gyrd doctor` — Check setup health
- `gyrd generate` — Regenerate files from gyrd.toml

## [GYRD-MANAGED] Workflow

### Development Workflow

| Risk | Do |
|------|----|
| **Low** (typo, rename) | Do it, show result |
| **Medium** (new feature, 1 module) | Plan 3-5 bullets, implement, verify |
| **High** (cross-module, API contract) | Spec pipeline: spec, plan, tasks, implement, review, ship |

### Agent Pipeline

```
worker (implements) → fresh code-reviewer → SAME worker (fixes) → fresh code-reviewer → ... (max 3) → tech-lead
```

- ONE agent writes code at a time
- code-reviewer is always a FRESH session (never the implementer)
- If blocked after 3 attempts → escalate to tech-lead

## [GYRD-MANAGED] Git & Safety

### Commit Messages
```
feat: add user dashboard
fix: resolve auth token expiration
refactor: extract validation helpers
chore: update dependencies
```

### Safety
- Review `git status` and `git diff` before commit
- Stage specific files (not `git add .`)
- Pre-commit hooks run automatically (lint + typecheck)
- Never push to main directly — branch first

## Development Rules

### DO
- Use `import type` for type-only imports (verbatimModuleSyntax)
- Explicit return types on exported functions
- Keep content/ and packages/ concerns separate — content is product, packages is infra
- Test content generation with snapshot tests in e2e
- Run `pnpm build` before testing CLI end-to-end (CLIs need dist/)

### DON'T
- No `any` unless documented with a comment explaining why
- No unused locals (`noUnusedLocals`)
- No hardcoded content in packages/ — all text belongs in content/
- No synchronous file I/O in CLI hot paths
- Don't modify [GYRD-MANAGED] sections in generated output by hand — they get overwritten

## Code Style

- ESM-only: `import`/`export`, no `require()`
- Path aliasing: none (relative imports within packages)
- Error handling: throw typed errors, catch at CLI boundary with user-friendly messages
- Logging: chalk for colors, log-symbols for status icons (success/error/warning/info)
- Config parsing: Zod schemas validate all external input (gyrd.toml, user answers)

## [GYRD-MANAGED] Shared State

Agents maintain shared files that survive context compaction:

| File | Purpose |
|------|---------|
| `PROGRESS.md` | Task status, checkpoints, blockers |
| `DECISIONS.md` | Architectural decisions with rationale |

Location: `specs/1-rig-mvp/` for current spec-driven work.

## [GYRD-MANAGED] Feedback

> If the user mentions problems with the setup, suggests improvements,
> or says something isn't working — offer to capture their feedback.

When capturing feedback:
1. Ask what's working and what isn't
2. Note the preset and stack
3. Format as a GitHub issue body with: **Problem**, **Expected**, **Actual**, **Preset/Stack**
4. Help the user submit it (open browser or create via `gh issue create`)
