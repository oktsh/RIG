# GYRD Changelog

## v0.3.0 (Living Updates + Code Review)

> Living updates proof: sources registry + `--check` command. Code reviewer rewritten for vibe-coders.
> Load-bearing assumptions philosophy — rules are testable claims, not vague guidelines.

### Living Updates (Module 3)

- **Sources registry** (`content/sources/registry.json`) — curated list of ecosystem sources (Claude releases, Claude Code updates, Cursor, Codex, OWASP, Anthropic blog) with mapping to affected rules and their assumptions
- **`gyrd update --check`** — shows what needs updating and WHY. Maps sources → rules → assumptions at risk. Human-readable output: "3 rules affected by ecosystem changes"
- **`[sources]` in gyrd.toml schema** — optional section for declaring update sources with type, URL, and affected rules
- **Load-bearing rules protocol** — philosophy document: every rule is a testable assumption. When assumptions break → rule needs update. Connects to update mechanism.

### Agents — Upgraded

- **code-reviewer**: Complete rewrite. Three-persona review (Saboteur, New Hire, Security Auditor) with plain-language output, concrete fix suggestions, and 8-step systematic checklist. Works for devs AND non-devs.
- **verification**: Restructured with explicit verification steps (7-step mechanical check), adversarial probes, and strict evidence standard.
- **All agents**: Added `triggers` (when to spawn) and `effort` level (xhigh/high) per Claude 4.7 literal following requirements.

### Content

- **New protocol**: `load-bearing-rules.md` — explains the philosophy behind living updates. Rules = testable assumptions → decay when ecosystem changes → `gyrd update --check` shows which ones.
- **Claude 4.7 full adaptation**: All 9 agents now have explicit triggers, effort levels, and scoped instructions.

### Why This Update Matters

This version proves the living updates differentiator. `gyrd update --check` connects ecosystem changes to your specific rules — showing not just WHAT changed but WHY your setup needs attention. No competitor does this.

---

## v0.2.0 (Claude 4.7 Adaptation)

> Adapts all GYRD content for Claude Opus 4.7's literal instruction following behavior.
> Models that follow instructions literally need rules that ARE literal.

### Rules — Updated
- **agent-orchestration**: Added explicit subagent spawn triggers (when to spawn vs write directly). Added effort level per tier (`xhigh` for oversight/planning, `high` for implementation). Added explicit tool-usage requirement for workers.
- **context-discipline**: Added explicit tool usage rules (Read/Grep/Glob/Edit vs Bash). Applies to ALL files in the project.
- **role-mindset**: Replaced vague instructions ("be supportive", "treat as expert") with explicit output format rules and priority ordering.

### Why This Update Matters
Claude 4.7 follows instructions more literally than 4.6. Rules that relied on the model "reading between the lines" — like "keep code clean" or "be helpful" — no longer produce consistent behavior. Every rule now states exactly what to do, in what order, for which files.

---

## v0.1.0 (Initial Release)

### Agents
- Initial agent suite: 9 agents covering oversight, planning, workers, quality

### Rules
- context-discipline: Targeted search, never scan large directories
- security: Secrets protection, supply chain security, .env.example pattern
- agent-orchestration: Sequential pipeline, worker completion checklist
- tool-gate: Check skills/agents before manual work
- safety-guardrails: Branch-first workflow, review before merge

### Hooks
- pre-commit-guard: Auto-detect stack, lint + typecheck

### Templates
- progress-template, decisions-template, spec-template
