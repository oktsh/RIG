# GYRD Roadmap

> The practice layer for coding agents.
> Last updated: 2026-04-19

---

## 1. Status Quo — What's Built

Everything below is shipped and working. This is the foundation, not a plan.

| Asset | Status | Proof |
|-------|--------|-------|
| CLI (`create-rig` + `rig-cli`) | DONE | 203 tests, 48 ACs, all passing |
| Content v0.2.0 (Claude 4.7 adaptation) | SHIPPED | Explicit scopes, effort levels, subagent triggers, tool usage |
| 3 presets (pm, small-team, solo-dev) | DONE | Unified capabilities, onboarding-tone-only differentiation (D-018) |
| 2 stacks (nextjs, python-fastapi) | DONE | Auto-detect hooks, stack-specific rules |
| Content-as-data architecture | DONE | `content/` = product, `packages/` = infra (D-009) |
| `rig update` with hash-based customization detection | DONE | SHA-256 manifest, skip modified files (D-010) |
| `rig doctor` health check | DONE | Validates setup integrity |
| 3-layer stack architecture | DESIGNED | Universal core + auto-detect hooks + optional stack packs (D-019) |
| Landing v7 → v8 (GYRD rebrand) | LIVE | g3 brand identity, Syne + Space Grotesk + JetBrains Mono, kinetic monogram |
| npm publish | READY | Packages built, not yet published — pending rebrand |

**What v0.2.0 proved:** When Claude 4.7 shipped and broke vague rules, we adapted content in hours. Users without a practice layer had to manually audit every rule file. This is the living-updates moat in action.

---

## 2. Competitive Positioning — Where GYRD Fits

### The market map (from deep research, April 2026)

The AI coding tool space has three populated zones and one gap:

| Zone | Players | What they do |
|------|---------|-------------|
| **Coding agents** | Claude Code (114k stars), Codex CLI (76k), OpenHands (65k), Cline (60k), Aider (43k), Goose (42k), OpenCode (146k), Roo Code (23k) | Do the coding work — in terminal, IDE, or GUI |
| **Orchestrators / runtimes** | LangGraph (29k), CrewAI (49k), Mastra (23k), Deep Agents | Build stateful multi-agent systems |
| **Practice / governance** | AI DevKit (~1.1k), Continue (32k) | Closest to our space — but neither is a cross-agent discipline layer |

### The gap GYRD fills

Nobody owns the **cross-agent practice layer**. AI DevKit is templates and commands without enforcement. Continue is CI checks after the PR, not discipline during execution. Every coding agent has its own config format (`.clinerules`, `.roomodes`, `CLAUDE.md`, `.cursorrules`) but none of them want to be neutral across competitors.

**GYRD's position:** Not another coding agent. The neutral layer that makes any coding agent follow your team's playbook. We don't compete with Claude Code or Cursor — we make them better.

### Why this position is defensible

1. **Agent vendors can't be neutral.** Anthropic won't optimize for Cursor users. Cursor won't optimize for Claude Code users. We can.
2. **Living updates compound.** Every model release (4.7, 4.8, ...) that changes behavior is a tailwind — teams need their rules adapted, and we do it for them.
3. **Network effects in team memory.** Once a team's architectural decisions, testing conventions, and security red flags live in GYRD's shared memory, switching costs are real.

### One Product, Three Entry Points

> Not three products. One product that speaks differently to each audience.

```
PM:     "I know WHAT to build, but not HOW to code safely"
        → GYRD gives: agents, hooks, safety gates → PM ships working code

Dev:    "I know HOW to code, but not WHAT to build"
        → GYRD gives: discovery workflow, spec pipeline → Dev discovers like PM

Team:   "Everyone does their own thing, chaos"
        → GYRD gives: unified rules, shared state → Team works consistently
```

---

## 3. Six-Month Roadmap

### Month 1 (May 2026): Rebrand + Publish + Demo

The product is built. This month is about getting it into hands under the new name.

| # | Task | Deliverable | Success metric |
|---|------|-------------|----------------|
| 1.1 | Rebrand RIG to GYRD | CLI: `create-gyrd` / `gyrd`. Packages: `@gyrd/cli`, `@gyrd/core`. Config: `gyrd.toml`. All references updated. | `pnpm test` passes, all 203 tests green |
| 1.2 | npm publish | `npx create-gyrd` works from a cold machine | Package live on npmjs.com, install < 10s |
| 1.3 | Demo repo | Public repo showing: rules + plan + edit + memory + CI hook in action. Two scenarios: solo PM, small team. | External dev understands value in under 3 minutes (test with 5 people) |
| 1.4 | Landing update | New H1: "The practice layer for coding agents". New copy, GYRD branding, demo link. | Deploy to `gyrd.ai` or `gyrd-landing.pages.dev` |
| 1.5 | Domain + handles | Buy `.ai` domain. Lock GitHub org, npm scope `@gyrd`, social handles. | All handles reserved day-one |
| 1.6 | Pronunciation fix | Every mention: "GYRD (pronounced 'gird')". In CLI banner, landing, README, npm page. | Zero confusion in user calls |

**Proof point:** Someone runs `npx create-gyrd`, gets a working AI dev setup, and their coding agent immediately follows the generated rules.

### Month 2 (June 2026): Cross-Agent Adapters

This is the biggest differentiator. Today we generate `CLAUDE.md` + `.cursorrules`. Expand to every major agent.

| # | Task | Deliverable | Success metric |
|---|------|-------------|----------------|
| 2.1 | Adapter architecture | Plugin system: one policy source (gyrd.toml + content), multiple output formats. Each adapter is a module. | Adapter interface defined, tested with 2 adapters |
| 2.2 | Cursor adapter | Generate `.cursor/rules/*.mdc` from GYRD content. Match Cursor 3's agent workspace format. | Cursor picks up rules, tested manually |
| 2.3 | Cline adapter | Generate `.clinerules` and custom mode configs from GYRD content | Cline respects rules in VS Code |
| 2.4 | Roo Code adapter | Generate `.roomodes` + `.rooignore` + rules from GYRD content | Roo Code loads modes correctly |
| 2.5 | OpenCode adapter | Generate OpenCode-compatible config from GYRD content | OpenCode reads generated config |
| 2.6 | Codex CLI adapter | Generate Codex-compatible instructions from GYRD content | Codex CLI follows generated rules |
| 2.7 | `gyrd generate --target` | `gyrd generate --target claude,cursor,cline` — selective generation | User picks which agents to target |

**Proof point:** One `gyrd.toml`, one `gyrd generate`, and Claude Code + Cursor + Cline all follow the same team rules in the same repo.

### Month 3 (July 2026): Shared Memory MVP

Not chat history dumps. Curated team knowledge that persists across sessions and agents.

| # | Task | Deliverable | Success metric |
|---|------|-------------|----------------|
| 3.1 | Memory schema | Structured memory types: architectural decisions, coding conventions, security red flags, known gotchas, testing patterns, release habits. Zod schemas. | Schema covers 80% of what teams re-explain to agents |
| 3.2 | `gyrd remember` | CLI command to add curated memory entries. Interactive or inline: `gyrd remember "We use date-fns, never moment.js"` | Memory stored in `.gyrd/memory/` as structured YAML |
| 3.3 | Memory injection | `gyrd generate` injects relevant memory into agent config files (CLAUDE.md, .cursorrules, etc.) | Agent knows team conventions without being told each session |
| 3.4 | Memory categories | `decisions`, `conventions`, `gotchas`, `security`, `testing`, `dependencies` — each with its own template | `gyrd remember --type gotcha "React 19 breaks recharts v3"` |
| 3.5 | Memory sync (local) | `gyrd memory export` / `gyrd memory import` — JSON format for team sharing via git | Two developers share memory through git push/pull |

**Proof point:** New team member runs `gyrd generate`, and their coding agent already knows "we use pnpm, not npm", "never use `any` without a comment", and "the auth module has a known race condition in token refresh".

### Month 4 (August 2026): CI Enforcement + Policy Trace

Move from "agent should follow rules" to "CI verifies agent did follow rules".

| # | Task | Deliverable | Success metric |
|---|------|-------------|----------------|
| 4.1 | `gyrd check` | CLI command that validates a PR/commit against team policies. Exit code 0/1 for CI. | Runs in GitHub Actions, blocks non-compliant PRs |
| 4.2 | Policy definitions | Declarative policy files in `.gyrd/policies/`. Examples: "all new files must have tests", "no direct DB queries outside repository layer", "security review required for auth changes" | Policies are code, not prose |
| 4.3 | Policy trace | `gyrd trace` — show which policies applied to a given change and whether they passed. Structured output (JSON + human-readable). | "Why did CI fail?" has a clear, auditable answer |
| 4.4 | GitHub Action | `@gyrd/action` — drop-in GitHub Action that runs `gyrd check` on PRs | One YAML line to add GYRD enforcement to any repo |
| 4.5 | Pre-commit enforcement | `gyrd hook install` — installs git hooks that run policy checks before commit | Catches violations before push, not after PR |

**Proof point:** A team adds `gyrd/action@v1` to their CI. An agent-written PR that skips tests gets blocked with a clear policy trace explaining why.

### Months 5-6 (Sep-Oct 2026): Team Workspace + Monetization

| # | Task | Deliverable | Success metric |
|---|------|-------------|----------------|
| 5.1 | Team workspace | `gyrd init --team` — shared config repo that other repos reference. Central policy + memory source. | 3+ repos sharing one policy source |
| 5.2 | Memory sync (hosted) | Cloud sync for team memory. Real-time, not git-based. CF Workers + D1. | Memory updates propagate to team in < 30s |
| 5.3 | Audit trail | Log of all policy checks, agent runs, and memory changes. Stored, queryable, exportable. | "What did agents do last week?" has a dashboard answer |
| 5.4 | Pricing experiments | Free: local CLI + local memory + 2 adapters. Team: shared memory + cloud sync + audit + all adapters. Enterprise: SSO + RBAC + self-host + custom policies. | 10 teams willing to pay for Team tier |
| 5.5 | Onboarding packs | Pre-built policy + memory bundles: "TypeScript strict", "Python FastAPI", "Security-first", "SOC2 compliance" | Packs reduce setup time from 30 min to 2 min |
| 5.6 | `gyrd add agent` | Wizard to create custom agent definitions that work across all supported coding agents | User creates one agent, it works in Claude Code + Cursor + Cline |

**Proof point:** A 5-person team uses GYRD Team. Three developers use Claude Code, one uses Cursor, one uses Cline. All agents follow the same rules. The team lead sees an audit trail of what agents did. They pay for it.

---

## 4. Key Differentiators to Build

Five layers from the competitive research, mapped to what exists and what's next.

### Layer 1: Execution Discipline (hooks at key points)

**What exists:** Pre-commit hooks (lint + typecheck). Agent pipeline with sequential workers and fresh code-reviewer. Safety guardrails (branch-first, review-before-merge).

**What to build:**
- Before-plan hooks: verify requirements exist before agent starts planning
- Before-edit hooks: check file ownership / lock status
- After-failure hooks: capture failure context for memory
- Before-PR hooks: policy compliance check
- Hook composition: combine multiple hooks per trigger point

**Why it matters:** This turns GYRD from a config generator into a runtime behavior layer. Rules without hooks are suggestions. Rules with hooks are enforcement.

### Layer 2: Shared Memory (curated, not conversation logs)

**What exists:** PROGRESS.md and DECISIONS.md protocols. Memory concept in roadmap.

**What to build:**
- Structured memory types (conventions, decisions, gotchas, security, testing)
- `gyrd remember` CLI for adding entries
- Memory injection into generated agent configs
- Team memory sync (git-based first, hosted later)
- Memory decay: flag stale entries, prompt review

**Why it matters:** Every competitor dumps chat history or session logs. That's noise, not memory. GYRD memory is curated knowledge: "we chose PostgreSQL over MongoDB because X", "the payments module has a known edge case with refunds". This is what a senior engineer would tell a new hire on day one.

### Layer 3: Workflow Artifacts (requirements → design → plan → implementation → checks)

**What exists:** Spec pipeline (spec-writer → spec-planner → task-breakdown → workers → code-reviewer → tech-lead). PROGRESS.md, DECISIONS.md, tasks.md protocols.

**What to build:**
- Artifact linking: requirement traces through design, plan, implementation, test
- Artifact templates in `gyrd.toml`: customize workflow stages per project
- Artifact validation: "this implementation doesn't trace to any requirement" = warning
- Exportable artifact graph for compliance / audit

**Why it matters:** AI DevKit has templates. GYRD has **linked artifacts with enforcement**. The difference is traceability — knowing not just that work was done, but that it connects to a requirement and was verified.

### Layer 4: Portability (cross-agent config generation)

**What exists:** CLAUDE.md + AGENTS.md + .cursorrules generation.

**What to build:**
- Adapter plugin system (Month 2)
- Adapters for: Cursor, Cline, Roo Code, OpenCode, Codex CLI, Copilot (.agent.md)
- `gyrd generate --target` for selective generation
- Adapter community contributions (open adapter API)
- Config drift detection: "your .cursorrules is out of sync with gyrd.toml"

**Why it matters:** This is the wedge that no agent vendor can replicate. Anthropic will never generate `.cursorrules`. Cursor will never generate `CLAUDE.md`. GYRD does both from one source of truth. Teams that use multiple agents (increasingly common) need this.

### Layer 5: Trust / Audit (policy trace, governance)

**What exists:** Pre-commit verification gates. Evidence protocol in agent workflow.

**What to build:**
- Declarative policy files (`.gyrd/policies/`)
- `gyrd check` for CI enforcement
- Policy trace: which policies applied, pass/fail, why
- Audit trail: what agents did, which policies were checked, outcomes
- Compliance packs: SOC2, GDPR, HIPAA starter policies

**Why it matters:** This is the enterprise upsell. Teams using agents in production need to answer "what did the agent do and was it safe?" GYRD provides the answer without being tied to any specific agent.

---

## 5. What NOT to Build — Anti-Goals

These are explicit decisions about what GYRD will never be, based on competitive analysis.

| Anti-goal | Why | Who already does this |
|-----------|-----|----------------------|
| **A coding agent** | Entering the agent market means competing with $B-funded companies (Anthropic, OpenAI, Cursor). We have zero advantage in model quality, IDE integration, or inference infrastructure. | Claude Code, Codex, Cline, Roo Code, OpenCode, Aider, Goose, OpenHands |
| **An orchestration framework** | Building a general multi-agent runtime is a different product for a different buyer (ML engineers, not dev teams). | LangGraph, CrewAI, Mastra, Deep Agents |
| **A session viewer / analytics dashboard** | Post-hoc session analytics is complementary but not our core value. Link to codbash instead. | Codbash |
| **A prompt library / marketplace** | Commoditized. Anyone can copy prompts. Our value is structured, enforced, living practice — not static text. | PromptBase, various GitHub repos |
| **A vendor-specific plugin** | Building only for Claude Code or only for Cursor defeats the portability thesis. Always support 2+ agents minimum. | Each agent's own extension ecosystem |
| **A "no-code AI" platform** | GYRD targets developers and technical PMs who use coding agents. Not the "build an app without code" audience. | Bolt, v0, Lovable, Replit Agent |
| **An enterprise-first product** | Start with individual developers and small teams. Enterprise features (SSO, RBAC, audit) come later as upsell, not as primary GTM. | Continue (leans enterprise), various compliance tools |

---

## 6. Milestones with Proof Points

Each milestone has a concrete, falsifiable proof that the phase worked.

### M1: Product Exists (Month 1)

| Proof | How to verify | Fail signal |
|-------|--------------|-------------|
| `npx create-gyrd` works on a cold machine | Run on fresh macOS + Linux | Install fails or takes > 30s |
| Demo repo makes sense to outsiders | 5 people run through it, 4+ understand the value | "I don't get what this does" |
| Landing converts visitors to signups | > 5% email conversion rate | < 2% = messaging is wrong |

### M2: Portability is Real (Month 2)

| Proof | How to verify | Fail signal |
|-------|--------------|-------------|
| Same `gyrd.toml` generates valid configs for 3+ agents | Run `gyrd generate --target claude,cursor,cline` in demo repo | Any adapter generates broken config |
| Agents actually follow the generated rules | Manual testing: give each agent the same task, check adherence | Agent ignores generated rules |
| Community interest in adding adapters | At least 1 external PR or issue requesting a new adapter | Zero external engagement |

### M3: Memory Changes Behavior (Month 3)

| Proof | How to verify | Fail signal |
|-------|--------------|-------------|
| Agent avoids known gotchas from memory | Add gotcha to memory, verify agent respects it in next session | Agent repeats the mistake despite memory |
| New team member's agent is productive faster | Compare time-to-first-useful-PR with and without GYRD memory | No measurable difference |
| Memory stays curated (not bloated) | < 50 entries covers 80% of team context after 1 month | Memory grows to 500+ entries = noise, not signal |

### M4: CI Catches Violations (Month 4)

| Proof | How to verify | Fail signal |
|-------|--------------|-------------|
| `gyrd check` blocks a non-compliant PR | Create agent-written PR that violates a policy, verify CI blocks it | Policy violation passes CI |
| Policy trace explains the failure clearly | Read trace output without context, understand what went wrong | Trace is cryptic or incomplete |
| Teams actually enable CI checks | 3+ repos using `gyrd/action` in CI | Zero adoption = policies are too noisy |

### M5-6: Teams Pay (Months 5-6)

| Proof | How to verify | Fail signal |
|-------|--------------|-------------|
| 3+ teams actively using Team tier | Real usage data (syncs, checks, memory entries) | Signups but no usage = wrong value prop |
| Team lead uses audit trail weekly | Check query frequency | Audit trail exists but nobody looks at it |
| NPS > 40 from paying teams | Survey after 2 weeks of usage | NPS < 20 = product doesn't deliver |
| MRR > $500 by month 6 | Payment data | $0 = pricing or value problem |

---

## 7. Open Questions

| # | Question | Impact | Deadline |
|---|----------|--------|----------|
| OQ-1 | Is `gyrd.ai` available? If not, what's the fallback domain? | Blocks M1 launch | Before publish |
| OQ-2 | Should adapters generate exact format or "best effort"? Cline and Roo Code formats change frequently. | Affects M2 scope — exact = more maintenance, best effort = less reliable | Before M2 start |
| OQ-3 | Memory sync: git-based forever (free) or hosted service (paid)? Both? | Affects M5 pricing model | Before M3 start |
| OQ-4 | How to handle adapter breakage when agents update their config format? | Affects maintenance burden — need a format-change detection strategy | Before M2 start |
| OQ-5 | Package naming: `create-gyrd` + `gyrd` or `@gyrd/create` + `@gyrd/cli`? Scoped vs unscoped. | Scoped is cleaner but `npx create-gyrd` convention expects unscoped | Before M1 publish |

---

## 8. Key Metrics (post-launch)

| Metric | Source | Target (6 months) |
|--------|--------|--------------------|
| npm weekly downloads | npmjs.com | 500+ |
| Active repos with `gyrd.toml` | opt-in telemetry | 100+ |
| Adapters shipped | release count | 6+ (Claude, Cursor, Cline, Roo, OpenCode, Codex) |
| Memory entries per team (median) | telemetry | 20-50 |
| CI checks per week (all teams) | telemetry | 200+ |
| Paying teams | payment provider | 10+ |
| GitHub stars | github.com | 1000+ |

---

## 9. Claude 4.7 Adaptation Plan

> Research done 2026-04-17. Ship as `gyrd update` — validates the living updates moat.

### HIGH priority (rules/content changes)

| Change | Why | Action |
|--------|-----|--------|
| Explicit scope in every rule | 4.7 literal following — won't generalize across files | Audit all rules, add explicit scope ("Apply to ALL...") |
| Remove progress-update scaffolding | 4.7 does this natively | Remove "summarize every N steps" instructions |
| Explicit subagent triggers | 4.7 spawns fewer subagents by default | Add "spawn when..." conditions to orchestration rules |
| Effort level guidance | `xhigh` is new sweet spot for coding | Add effort recommendations to gyrd.toml / CLAUDE.md |
| Remove "double-check" scaffolding | 4.7 self-verifies better | Remove redundant verification instructions |

### MEDIUM priority (agent definitions)

| Change | Why | Action |
|--------|-----|--------|
| Tool usage instructions | 4.7 uses fewer tools by default | Explicitly state when tools MUST be used |
| Tone recalibration | 4.7 is more direct/opinionated | Adjust any "be warm" tone instructions |
| Response length | 4.7 auto-calibrates length | Remove fixed verbosity instructions |

### LOW priority (technical)

| Change | Why | Action |
|--------|-----|--------|
| Tokenizer awareness | New tokenizer: +35% tokens for same text | Note in docs, adjust any token-budget advice |
| Model ID references | 4.7 model ID changed | Update templates referencing model IDs |
| `xhigh` effort config | New effort level available | Add as option in gyrd.toml |

---

## 10. Codbash Integration Opportunities

> Source: github.com/vakovalskii/codbash (MIT). Complementary product, not competitor.
> Codbash = session viewer/analytics. GYRD = workflow governance. Different jobs.

| Idea | Phase | Effort | Notes |
|------|-------|--------|-------|
| Cost analytics (`gyrd doctor --costs`) | Month 2 | Medium | Read Claude/Codex token usage, show spend. Codbash has pricing tables + cache token math |
| Session detection (`gyrd doctor`) | Month 3 | Low | Detect active AI sessions (Claude PID files, ps aux). Health check enhancement |
| Handoff document generation | Month 3 | Medium | Generate context markdown for agent-to-agent handoff. Feeds team memory feature |
| Zero-deps architecture study | Done | — | Their approach: Node stdlib only, no build step. Validates our lightweight CLI approach |
| Recommend codbash in docs | Month 1 | Trivial | "For session analytics, try codbash" — community goodwill, not competition |

---

## 11. Research Queue

| Topic | Source | Priority | Status | Notes |
|-------|--------|----------|--------|-------|
| Codbash repo | github.com/vakovalskii/codbash | HIGH | DONE | Not competitor. Session viewer. Integration opportunities in Appendix B |
| Claude Opus 4.7 | Anthropic release (2026-04-16) | HIGH | DONE | Adaptation plan in Appendix A. Literal following = our rules matter MORE |
| Polyakov telegram-parser | github.com/artwist-polyakov/polyakov-claude-skills | MEDIUM | TODO | Base for ecosystem monitor |
| Copilot `.agent.md` format | GitHub Copilot April 2026 | MEDIUM | TODO | Copilot converging on repo-level agent files. GYRD should generate these too |
| Cursor 3 agent workspace | cursor.com/blog/cursor-3 | LOW | TODO | Agent-first UX. Impact on .cursorrules generation |

---

## 12. Stack Architecture — 3-Layer Model

> Decision: Stack is NOT a gate. GYRD works for ANY language out of the box.

```
Layer 1: Universal Core (any language, always installed)
  → agents, workflows, rules, templates, shared state

Layer 2: Auto-detect hooks (zero-config)
  → package.json → ESLint + tsc
  → pyproject.toml → ruff + mypy
  → pubspec.yaml → dart analyze
  → go.mod → golangci-lint
  → Cargo.toml → clippy
  → nothing → skip hooks, core still works

Layer 3: Stack Packs (optional, community-driven)
  → nextjs: App Router, Server Components, import aliases
  → python-fastapi: Pydantic, async patterns, FastAPI conventions
  → react-typescript: hooks, state management, component patterns
  → (community contributes more via PR)
```

**Wizard change:** Stack selection becomes optional. Auto-detect first, offer pack if available.

**Day 1 stack packs:** nextjs, python-fastapi (already exist), react-typescript (extract from nextjs)

---

## Decisions Referenced

- D-009: Content-as-data architecture — foundation for adapter system
- D-010: Hash-based customization detection — enables safe `gyrd update`
- D-013: No runtime dependencies in generated output — adapters must produce standalone files
- D-018: Unified capabilities across presets — adapters generate same quality for all presets
- D-019: 3-layer stack architecture — adapters respect this layering
- D-020: Claude 4.7 adaptation — proved the living-updates moat
- D-021: Codbash is complementary — we don't build analytics
- D-022: One product, three entry points — landing messaging for M1
