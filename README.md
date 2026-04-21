# GYRD

**Managed AI dev practice. Rules, hooks, workflows — installed via npm, kept current via `gyrd update`.**

> Your agents. Our structure.

GYRD gives your project an opinionated setup for AI-assisted development: agent definitions, quality rules, pre-commit hooks, and workflow guidance — all configured for your stack and team size.

Think of it as Django for AI dev practices — you get a working setup out of the box, not a blank canvas.

## Quick Start

```bash
npx @gyrd/cli init
```

The wizard asks your stack and preset, then generates everything into your project:

```
your-project/
├── CLAUDE.md              # AI instructions (Claude Code, Claude Desktop)
├── AGENTS.md              # Cross-tool instructions (Cursor, Copilot, Codex)
├── gyrd.toml              # GYRD configuration
├── .claude/
│   ├── agents/            # Agent definitions (code-reviewer, tech-lead, etc.)
│   ├── rules/             # Always-loaded rules (security, context discipline)
│   └── hooks/             # Pre-commit quality gates (lint + typecheck)
└── .cursor/rules/         # Cursor IDE rules (MDC format)
```

## Commands

| Command | What it does |
|---------|-------------|
| `gyrd init` | Interactive setup wizard — creates complete AI dev practice config |
| `gyrd update` | Pull latest rules, agents, templates. `[GYRD-MANAGED]` sections update; your customizations stay |
| `gyrd generate` | Regenerate all managed files from `gyrd.toml` |
| `gyrd doctor` | Check setup health: missing files, outdated versions, broken references |

## How It Works

1. **Install** — `gyrd init` scaffolds CLAUDE.md, agents, rules, hooks for your stack
2. **Develop** — Your AI agents (Claude, Cursor, Copilot) follow the rules GYRD installed
3. **Update** — `gyrd update` ships new rules when models change (e.g., Claude 4.7 adaptation)
4. **Customize** — Edit anything outside `[GYRD-MANAGED]` markers — those sections are yours

### Managed vs Custom

```markdown
## [GYRD-MANAGED] Git & Safety          ← GYRD updates this
- Review git status before commit
- Stage specific files (not git add .)

## My Custom Rules                      ← GYRD never touches this
- Use Jira ticket IDs in commit messages
- Always deploy to staging first
```

## Presets

| Preset | For | Defaults |
|--------|-----|----------|
| **pm** | Product managers building with AI | Spec-driven workflow, review gates, product-focused language |
| **small-team** | Teams of 2-5 devs | Shared state protocols, agent pipeline, collaboration rules |
| **solo-dev** | Individual developers | Minimal ceremony, direct workflow, lean setup |

Same agents and capabilities in all presets. Different onboarding tone and process structure.

## Stacks

| Stack | Pre-commit hooks | Stack-specific rules |
|-------|-------------------|---------------------|
| **nextjs** | ESLint + tsc | App Router, Server Components, import aliases |
| **python-fastapi** | ruff + mypy | FastAPI patterns, Pydantic, async conventions |

## Why GYRD?

- **Out of the box** — Working setup in 30 seconds, not 3 hours of CLAUDE.md tuning
- **Living updates** — When Claude 4.7 drops, `gyrd update` ships adapted rules within days
- **Pre-commit gates** — Lint + typecheck before every commit (human and agent)
- **Team memory** — Shared state files (PROGRESS.md, DECISIONS.md) survive context compaction [Coming]

## Requirements

- Node.js >= 18
- pnpm, npm, or yarn

## Development

```bash
git clone https://github.com/oktsh/gyrd.git
cd gyrd
pnpm install
pnpm build
pnpm test          # 203 tests
pnpm typecheck
```

### Project Structure

```
GYRD/
├── packages/
│   ├── core/           # @gyrd/core — schemas, registry, generator, updater, doctor
│   └── gyrd-cli/       # gyrd — init / update / generate / doctor
├── content/
│   ├── presets/         # Agent/rule/workflow content by preset
│   ├── stacks/         # Stack-specific hooks and rules
│   └── templates/      # Handlebars templates for output generation
├── tests/e2e/          # End-to-end tests
└── landing/            # Landing page (gyrd.dev)
```

### Content-as-Data

The `content/` directory IS the product. Agents, rules, hooks, templates live there as structured data — not hardcoded in source. When you run `gyrd update`, this is what gets refreshed.

## Contributing

1. Fork and clone
2. `pnpm install && pnpm build`
3. Create a feature branch
4. Make changes, run `pnpm test && pnpm typecheck`
5. Open a PR

Content contributions (agents, rules, presets) → `content/`. Code changes → `packages/`.

## See Also

- [codbash](https://github.com/vakovalskii/codbash) — Dashboard + CLI for AI coding agent sessions (view, search, analyze costs)

## License

MIT
