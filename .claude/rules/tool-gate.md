# Tool Gate

STOP before ANY task. Before doing work manually, check what's already available:

1. **Skills** — listed in the system prompt under "available skills". Invoke via Skill tool.
2. **Agents** — listed in the agent descriptions. Spawn via Agent tool.
3. **Custom skills** — check `.claude/skills/` for project-specific skills.

If a skill or agent matches the task — use it.
Only do the work yourself if nothing fits. But check first. Every time.

## Why This Matters

- Agents have specialized context and constraints. A code-reviewer agent knows what to look for. You doing an ad-hoc review will miss things.
- Skills encode proven workflows. The spec-pipeline skill runs a full spec → plan → tasks → implement → review cycle.
- Using the right tool means consistent output. Manual work varies by context window and session state.

## Decision Tree

```
Task arrives
  │
  ├─ Does an agent match? → Spawn it
  │
  ├─ Does a skill match? → Invoke it
  │
  ├─ Is it a single-file, small change? → Do it directly
  │
  └─ Is it multi-file or complex? → Plan first, then spawn agent
```
