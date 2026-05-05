# GYRD

**Stop re-explaining your standards to every new agent session.**

> One config. Every coding agent follows your team's playbook. Rules adapt when models change.

```bash
npx @gyrd/cli init
```

---

## Why GYRD?

- **30 seconds to production setup** — Not 3 hours of CLAUDE.md tuning. Working agents, rules, hooks — immediately.
- **Living updates** — Claude 4.8 drops? `gyrd update` ships adapted rules. Your setup never rots.
- **Automatic code review** — Three-angle review (break it, understand it, secure it) runs before every merge. Zero manual invocation.
- **Cross-agent portability** — One `gyrd.toml` → Claude Code + Cursor + Codex + Cline follow the same rules.
- **Pre-commit gates** — Lint + typecheck before every commit. Deterministic. Can't be skipped.
- **Sources → rules mapping** — `gyrd update --check` tells you WHICH rules need updating and WHY.

---

## Quick Start

```bash
# Install and configure
npx @gyrd/cli init

# What you get:
# ├── CLAUDE.md              → AI instructions (Claude Code)
# ├── AGENTS.md              → Cross-tool instructions (Cursor, Copilot, Codex)
# ├── gyrd.toml              → Single source of truth
# ├── .claude/agents/        → code-reviewer, tech-lead, spec-writer...
# ├── .claude/rules/         → security, context-discipline, orchestration
# ├── .claude/hooks/         → pre-commit quality gates
# └── .cursor/rules/         → Cursor MDC rules (auto-generated)
```

---

## Commands

| Command | What it does |
|---------|-------------|
| `gyrd init` | Interactive setup — creates your AI dev practice in 30 seconds |
| `gyrd update` | Pull latest rules and agents. Your customizations stay untouched |
| `gyrd update --check` | Show what needs updating and WHY (ecosystem → rules → assumptions) |
| `gyrd generate` | Regenerate managed files from `gyrd.toml` |
| `gyrd doctor` | Health check: missing files, outdated rules, broken references |

---

## How It Works

```
gyrd.toml (you own this)
    ↓ generators
    ├── CLAUDE.md           ← Claude Code reads this
    ├── AGENTS.md           ← Codex, Copilot read this
    ├── .claude/agents/     ← Agent definitions
    ├── .claude/rules/      ← Always-loaded rules
    ├── .claude/hooks/      ← Pre-commit gates
    └── .cursor/rules/      ← Cursor rules
```

**Managed vs Custom:**
- `[GYRD-MANAGED]` sections → GYRD updates when ecosystem changes
- Everything else → yours, never touched

---

## Living Updates

GYRD tracks ecosystem sources (model releases, tool updates, security advisories) and maps them to your rules:

```bash
$ gyrd update --check

ℹ Update available: 0.3.0 → 0.4.0

ℹ 3 rules affected by ecosystem changes.

⚠ agent-orchestration (.claude/rules/agent-orchestration.md)
    Reason: Updated based on changes from: Claude Model Releases
    Assumptions to verify:
      • Sequential pipeline is optimal for current model capabilities
      • Model-per-tier mapping (opus=oversight, sonnet=workers) is cost-effective

⚠ code-reviewer (.claude/agents/code-reviewer.md)
    Reason: Updated based on changes from: Claude Model Releases, OWASP Security Updates
    Assumptions to verify:
      • Three-angle review covers all risk categories
      • 80% confidence threshold prevents false positives
```

Every rule is a **testable assumption**. When the assumption breaks → the rule needs updating → GYRD tells you.

---

## Code Review (Built-in)

GYRD's generated setup includes an automatic code reviewer that runs before every merge:

- **Three angles**: Saboteur (break it), New Hire (understand it), Security Auditor (secure it)
- **Plain language**: Findings explained clearly with concrete fix suggestions
- **No manual trigger**: Rule in CLAUDE.md makes the agent review automatically before push/merge
- **Project-aware**: Reads your DECISIONS.md and team memory — won't flag intentional choices

---

## Stacks

| Stack | Pre-commit hooks | Stack rules |
|-------|-----------------|-------------|
| **nextjs** | ESLint + tsc | App Router, Server Components, import aliases |
| **python-fastapi** | ruff + mypy | FastAPI patterns, Pydantic, async conventions |
| *(more coming)* | Auto-detect | Community-contributed stack packs |

Stack is optional. GYRD works for any language — hooks auto-detect from lockfile.

---

## What GYRD is NOT

- **Not a coding agent** — Claude Code, Cursor, Codex do the work. GYRD makes them do it YOUR way.
- **Not enterprise governance** — No SCIM, no procurement. `npm install`, working in 30 seconds.
- **Not a prompt library** — 2,400+ skills exist. GYRD tells you which 12 work for your team.
- **Not vendor-locked** — Works across every tool that reads CLAUDE.md, AGENTS.md, or .cursor/rules.

---

## Development

```bash
git clone https://github.com/oktsh/GYRD.git
cd GYRD && pnpm install && pnpm build
pnpm test          # 202 tests
pnpm typecheck     # strict mode
```

**Architecture:** `content/` = the product (agents, rules, hooks as data). `packages/` = infra (CLI, generator, updater).

---

## Contributing

Content (agents, rules, stacks) → `content/`. Code → `packages/`. PRs welcome.

## See Also

- [codbash](https://github.com/vakovalskii/codbash) — Session dashboard for AI coding agents

## License

MIT
