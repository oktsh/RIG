# RIG

**Managed AI dev practice. Rules, hooks, workflows — installed via npm, kept current via `rig update`.**

> Your agents. Our structure.

RIG gives your project an opinionated setup for AI-assisted development: agent definitions, quality rules, pre-commit hooks, and workflow guidance — all configured for your stack and team size.

Think of it as Django for AI dev practices — you get a working setup out of the box, not a blank canvas.

## Quick Start

```bash
npx create-rig@latest
```

The wizard asks your stack and preset, then generates everything into your project:

```
your-project/
├── CLAUDE.md              # AI instructions (Claude Code, Claude Desktop)
├── AGENTS.md              # Cross-tool instructions (Cursor, Copilot, Codex)
├── rig.toml               # RIG configuration
├── .claude/
│   ├── agents/            # Agent definitions (code-reviewer, tech-lead, etc.)
│   ├── rules/             # Always-loaded rules (security, context discipline)
│   └── hooks/             # Pre-commit quality gates (lint + typecheck)
└── .cursor/rules/         # Cursor IDE rules (MDC format)
```

## Commands

| Command | What it does |
|---------|-------------|
| `npx create-rig` | Interactive setup wizard — creates complete AI dev practice config |
| `rig update` | Pull latest rules, agents, templates. `[RIG-MANAGED]` sections update; your customizations stay |
| `rig generate` | Regenerate all managed files from `rig.toml` |
| `rig doctor` | Check setup health: missing files, outdated versions, broken references |

## How It Works

1. **Install** — `npx create-rig` scaffolds CLAUDE.md, agents, rules, hooks for your stack
2. **Develop** — Your AI agents (Claude, Cursor, Copilot) follow the rules RIG installed
3. **Update** — `rig update` ships new rules when models change (e.g., Claude 4.7 adaptation)
4. **Customize** — Edit anything outside `[RIG-MANAGED]` markers — those sections are yours

### Managed vs Custom

```markdown
## [RIG-MANAGED] Git & Safety          ← RIG updates this
- Review git status before commit
- Stage specific files (not git add .)

## My Custom Rules                      ← RIG never touches this
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

## Why RIG?

- **Out of the box** — Working setup in 30 seconds, not 3 hours of CLAUDE.md tuning
- **Living updates** — When Claude 4.7 drops, `rig update` ships adapted rules within days
- **Pre-commit gates** — Lint + typecheck before every commit (human and agent)
- **Team memory** — Shared state files (PROGRESS.md, DECISIONS.md) survive context compaction [Coming]

## Requirements

- Node.js >= 18
- pnpm, npm, or yarn

## Development

```bash
git clone https://github.com/oktsh/rig.git
cd rig
pnpm install
pnpm build
pnpm test          # 197 tests
pnpm typecheck
```

### Project Structure

```
RIG/
├── packages/
│   ├── core/           # @rig/core — schemas, registry, generator, updater, doctor
│   ├── create-rig/     # npx create-rig — interactive setup wizard
│   └── rig-cli/        # rig update / generate / doctor
├── content/
│   ├── presets/         # Agent/rule/workflow content by preset
│   ├── stacks/         # Stack-specific hooks and rules
│   └── templates/      # Handlebars templates for output generation
├── tests/e2e/          # End-to-end tests
└── landing/            # Landing page (rig.dev)
```

### Content-as-Data

The `content/` directory IS the product. Agents, rules, hooks, templates live there as structured data — not hardcoded in source. When you run `rig update`, this is what gets refreshed.

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
