# GYRD

**your AI agent is fast. make it safe.**

> auto-review before every merge. dangerous ops blocked. plan first, code second.
> one command — full safety harness for any coding agent.

```bash
$ npx @gyrd/cli init
```

---

## why

vibe coding creates [9× more vulnerabilities](https://arxiv.org/abs/2604.20779) than manual coding. 56% of AI-generated code gets thrown away. agents ask for clarification in only 1.1% of interactions.

GYRD fixes this with rules that actually work — not vibes.

---

## what you get

```
your-project/
├── CLAUDE.md              # ai instructions (claude code)
├── AGENTS.md              # cross-tool (cursor, copilot, codex)
├── gyrd.toml              # single source of truth
├── .claude/
│   ├── agents/            # code-reviewer, tech-lead, spec-writer...
│   ├── rules/             # security, context-discipline, never-guess
│   └── hooks/             # pre-commit quality gates
└── .cursor/rules/         # cursor MDC rules (auto-generated)
```

| feature | what it does |
|---------|-------------|
| **automatic code review** | three-angle review before every merge — break it, understand it, secure it. zero manual trigger |
| **dangerous ops blocked** | DROP TABLE, rm -rf, shell=True, force push — explicitly banned. 10 CWE patterns with safe alternatives |
| **plan first, code second** | agent discusses plan before coding. 3× cheaper, 3× less waste |
| **living updates** | `gyrd update --check` shows which rules need updating and why |
| **cross-agent** | one config → claude code + cursor + codex + cline follow the same rules |

---

## commands

| command | what |
|---------|------|
| `gyrd init` | setup — creates safety harness in 30 seconds |
| `gyrd update` | pull latest rules. your customizations stay |
| `gyrd update --check` | show what needs updating and why |
| `gyrd generate` | regenerate from `gyrd.toml` |
| `gyrd doctor` | health check |

---

## how it works

```
gyrd.toml (you own this)
    ↓ generators
    ├── CLAUDE.md
    ├── AGENTS.md
    ├── .claude/agents/
    ├── .claude/rules/
    ├── .claude/hooks/
    └── .cursor/rules/
```

`[GYRD-MANAGED]` sections update. everything else is yours.

---

## development

```bash
git clone https://github.com/oktsh/GYRD.git
cd GYRD && pnpm install && pnpm build
pnpm test          # 202 tests
pnpm typecheck     # strict
```

content (agents, rules, stacks) → `content/`. code → `packages/`.

## license

MIT
