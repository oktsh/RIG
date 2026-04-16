# RIG

**Managed AI dev practice, installed via npm.**

RIG gives your project an opinionated setup for AI-assisted development: agent definitions, quality rules, pre-commit hooks, and workflow guidance -- all configured for your stack and team size. Install once with `npx create-rig`, keep current with `rig update`.

Think of it as "Django for AI dev practices" -- you get a working setup out of the box, not a blank canvas.

## Quick Start

```bash
npx create-rig
```

The wizard asks for your stack (Next.js, Python/FastAPI) and team preset (PM, small team, solo dev), then generates everything into your project.

## What You Get

```
your-project/
├── .claude/
│   ├── agents/          # Agent definitions (code-reviewer, tech-lead, etc.)
│   └── rules/           # Always-loaded rules (security, context discipline)
├── .cursor/rules/       # Cursor IDE rules (MDC format)
├── .claude/hooks/       # Pre-commit quality gates (lint + typecheck)
├── CLAUDE.md            # AI instructions for your project
├── AGENTS.md            # Cross-tool AI instructions (Cursor, Copilot)
└── rig.toml             # RIG configuration
```

## Commands

### `npx create-rig`

Interactive setup wizard. Creates a complete AI dev practice config in your project.

### `rig generate`

Regenerate all managed files from `rig.toml`. Useful after editing config or resolving conflicts.

### `rig update`

Pull latest agent definitions, rules, and templates. Sections marked `[RIG-MANAGED]` get updated; your customizations outside those markers are preserved.

### `rig doctor`

Check your setup health: missing files, outdated versions, broken references.

## Presets

| Preset | For | What's Different |
|--------|-----|------------------|
| **pm** | Product managers working with AI | Product-focused language, spec-driven workflow, review gates |
| **small-team** | Teams of 2-5 developers | Collaboration rules, shared state protocols, agent pipeline |
| **solo-dev** | Individual developers | Minimal setup, direct workflow, fewer ceremony |

All presets include the same agents and capabilities. The difference is onboarding tone, default workflows, and how much process structure is baked in.

## Stacks

| Stack | Hooks | Rules |
|-------|-------|-------|
| **nextjs** | ESLint + tsc | App Router, Server Components, import aliases |
| **python-fastapi** | ruff + mypy | FastAPI patterns, Pydantic, async conventions |

## Requirements

- Node.js >= 18
- pnpm, npm, or yarn

## Development

```bash
git clone https://github.com/oktsh/rig.git
cd rig
pnpm install
pnpm build
pnpm test
```

### Project Structure

```
RIG/
├── packages/
│   ├── core/           # @rig/core -- schemas, registry, generator, updater, doctor
│   ├── create-rig/     # npx create-rig -- interactive project setup
│   └── rig-cli/        # rig generate/update/doctor commands
├── content/
│   ├── presets/         # Content by preset (pm, small-team, solo-dev)
│   ├── stacks/          # Stack-specific hooks and rules
│   └── templates/       # Handlebars templates for output generation
└── tests/e2e/           # End-to-end tests
```

## Contributing

1. Fork and clone
2. `pnpm install && pnpm build`
3. Create a feature branch
4. Make changes, run `pnpm test && pnpm typecheck`
5. Open a PR

Content contributions (new agents, rules, presets) go in `content/`. Code changes go in `packages/`.

## License

MIT
