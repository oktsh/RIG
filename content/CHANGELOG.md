# RIG Changelog

## v0.2.0 (Claude 4.7 Adaptation)

> Adapts all RIG content for Claude Opus 4.7's literal instruction following behavior.
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
