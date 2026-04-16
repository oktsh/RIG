# RIG Changelog

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
