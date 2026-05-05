# Load-Bearing Rules Protocol

Every rule in this project is a **testable assumption** — not a vague guideline.

## The Principle

A rule is load-bearing when something breaks if you remove it. If you can delete a rule and nothing changes, it's not a rule — it's decoration.

```
Bad rule:  "Write clean code"
Good rule: "Every async function MUST have error handling — unhandled rejections crash the process"
```

The bad rule is unfalsifiable. The good rule makes a specific claim you can verify.

## How to Write Load-Bearing Rules

Every rule should answer three questions:

| Question | Example |
|----------|---------|
| **What exactly to do?** | "Use `import type` for type-only imports" |
| **When does this apply?** | "In ALL TypeScript files in this project" |
| **What breaks if you don't?** | "Build fails with verbatimModuleSyntax errors" |

If you can't answer "what breaks?" — the rule might not be needed.

## How Rules Decay

Rules decay when their assumptions change:

| Event | Effect on rules |
|-------|----------------|
| Model update (Claude 4.7 → 4.8) | Model may now handle things the rule was compensating for |
| Tool update (Cursor 4.0) | Format or behavior changes may invalidate rules |
| Codebase growth | Rules that worked for 10 files may not scale to 100 |
| Team change | Rules for solo dev may be wrong for team of 3 |

## The Update Signal

When `gyrd update --check` shows rules need updating, it's because:

1. A **source** (Claude release, tool changelog) published a change
2. The change **invalidates an assumption** a rule depends on
3. GYRD maps source → affected rules → shows you the diff

Example:
```
Claude 4.8 released — built-in progress tracking improved

Affected rules:
  - agent-orchestration.md: "Workers MUST update PROGRESS.md before starting"
    → Claude 4.8 does this natively. Rule may be redundant.
    → Recommendation: remove scaffolding, keep as fallback for non-Claude agents
```

## Living Rules vs Dead Rules

| Living rule | Dead rule |
|-------------|-----------|
| Has a clear "what breaks" | "Be mindful of performance" |
| Tied to a specific tool/version | "Use best practices" |
| Has been tested (someone violated it and something broke) | Copied from a blog post, never validated |
| Updated when the ecosystem changes | Written once, forgotten |

## Your Job

When you add a rule to this project:
1. State the assumption it depends on
2. State what breaks without it
3. Tag it with the ecosystem version it was written for

When the ecosystem changes:
1. `gyrd update --check` shows affected rules
2. Review each one — is the assumption still valid?
3. Update, remove, or confirm
