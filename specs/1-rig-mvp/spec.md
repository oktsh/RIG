# Product Specification: RIG MVP

> **Branch:** `1-rig-mvp`
> **Date:** 2026-04-14
> **Author:** spec-writer
> **Status:** Approved

---

## 1. Problem Statement

Developers and PM-builders who use AI coding tools (Claude Code, Cursor, Copilot) spend hours manually configuring agents, rules, hooks, and workflows -- then watch that setup degrade as tools evolve every 3-6 months. There is no opinionated, maintained framework that delivers a working AI dev practice out of the box, keeps it current, and adapts to team size and role.

Enterprise solutions (JetBrains Central, Anthropic Cowork) require procurement, SCIM/IdP, and months of rollout. Individual skills marketplaces offer 2,400+ items with no curation for "which skills work together for YOUR team." The 2-5 developer team and the solo PM-builder are unserved.

**RIG fills this gap:** `npm install`, 5 minutes, working AI dev practice. Opinionated defaults. Segment-specific presets. Living updates when the ecosystem changes.

### Value Proposition

"More autonomy requires more constraints." As AI agents do more, the harness around them matters more. RIG is that harness -- curated, maintained, and sized to your team.

### Target Segments (MVP)

> **Validation priority:** PM-builder first (on Claude Code). Validate demand before expanding.

| # | Segment | Who | Primary JTBD | Validation Priority |
|---|---------|-----|-------------|---------------------|
| 1 | **PM-builder** | Product managers, analysts in enterprise buying AI tools personally | Ship working prototypes with guardrails, not vibe-code garbage | **PRIMARY** — validate first |
| 2 | **Solo dev** | Individual developer | Quality setup without config overhead, fastest path to working | Secondary |
| 3 | **Small dev team** | 2-5 developers, startup or enterprise unit | Calibrated AI dev setup that doesn't degrade over time | Secondary |

**Primary validation channel:** PM colleagues using Claude Code. Dogfood → gather feedback → iterate.

### Three Usage Scenarios

1. **Human + AI** -- PM-builder or solo dev using Claude Code/Cursor interactively. RIG provides guardrails and workflow.
2. **Team + AI** -- Small dev team with shared repos. RIG provides coordination, shared state, and role-based conventions.
3. **Agent autonomously** -- Factory-style agents (Linear issue to PR) that read CLAUDE.md/AGENTS.md for conventions. RIG provides the quality of the rules these agents follow.

---

## 2. User Scenarios & Testing

### US-1 (P1): Initialize Project with `create-rig`

**As** a developer or PM-builder,
**I want** to run a single command that asks me my role, stack, and team size, then generates a complete AI dev setup,
**So that** I have a working AI-assisted development environment in under 5 minutes without manually configuring agents, rules, hooks, or workflows.

#### Acceptance Criteria

| ID | Criterion | Details |
|----|-----------|---------|
| AC-RIG-001 | Interactive init flow | Running `npx create-rig` starts an interactive prompt sequence: preset selection (pm / small-team / solo-dev), stack selection (nextjs / python-fastapi), project name, and optional team size (for small-team preset) |
| AC-RIG-002 | Non-interactive mode | Running `npx create-rig --preset=small-team --stack=nextjs --name=myapp` skips all prompts and generates output directly |
| AC-RIG-003 | Generated file structure | Output contains: `rig.toml`, `CLAUDE.md`, `AGENTS.md`, `.cursor/rules/` directory with MDC files, `.claude/agents/`, `.claude/hooks/`, `.claude/rules/`, and `_hub/templates/` |
| AC-RIG-004 | rig.toml as source of truth | A `rig.toml` file is created containing project name, preset, stack, agent configuration, hook configuration, and format generation targets. All other generated files are derived from this config |
| AC-RIG-005 | Preset-appropriate content | Generated agent definitions, rules, and hooks differ by preset (see FR-004 for deltas). A `pm` preset includes discovery workflow and guardrails; `small-team` includes cross-human coordination and role-based conventions; `solo-dev` includes minimal-footprint fast-start content |
| AC-RIG-006 | Stack-appropriate content | Generated hooks, lint commands, and typecheck commands match the selected stack. `nextjs` preset references `npm run lint`, `tsc --noEmit`; `python-fastapi` references `ruff check`, `mypy` |
| AC-RIG-007 | Version manifest | A `.rig/manifest.yaml` is created recording rig version, generation timestamp, component versions, and tool compatibility ranges |
| AC-RIG-008 | Completion time | Full generation completes in under 10 seconds on a machine with Node.js 18+ and npm available (excluding npm package download time) |
| AC-RIG-009 | Idempotent in empty directory | Running `create-rig` in a non-empty directory that already contains a `rig.toml` prompts for confirmation before overwriting. In an empty directory, no confirmation is needed |

#### Scenarios

```gherkin
Scenario: Interactive initialization -- solo dev, Next.js
  Given the user has Node.js 18+ and npm installed
  And the current directory is empty
  When the user runs "npx create-rig"
  And selects preset "solo-dev"
  And selects stack "nextjs"
  And enters project name "my-app"
  Then a rig.toml is created with preset="solo-dev", stack="nextjs", name="my-app"
  And CLAUDE.md is generated with solo-dev content (minimal agents, fast-start rules)
  And AGENTS.md is generated with instructions for Cursor/Copilot/Codex
  And .cursor/rules/ contains MDC files matching the solo-dev preset
  And .claude/agents/ contains agent definitions for oversight and quality tiers
  And .claude/hooks/ contains a pre-commit-guard script configured for npm lint + tsc
  And .claude/rules/ contains context-discipline and security rules
  And .rig/manifest.yaml records the generation metadata
  And the CLI prints a summary of generated files and a "next steps" message

Scenario: Non-interactive initialization -- small team, Python
  Given the user has Node.js 18+ and npm installed
  When the user runs "npx create-rig --preset=small-team --stack=python-fastapi --name=backend-svc"
  Then all files are generated without any interactive prompts
  And rig.toml contains preset="small-team", stack="python-fastapi"
  And .claude/hooks/ contains a pre-commit-guard script configured for ruff + mypy
  And CLAUDE.md includes team coordination sections (PROGRESS.md protocol, DECISIONS.md protocol, checkpoint commits)
  And agent definitions include role-based conventions for multiple developers

Scenario: PM-builder preset includes discovery workflow
  Given the user runs create-rig with preset "pm"
  When generation completes
  Then CLAUDE.md includes a spec-driven discovery workflow (problem statement, user stories, prototype plan)
  And rules include explicit guardrails: "don't modify production code without review", "always create a branch"
  And agent definitions include a planning agent and a code-reviewer but NO direct-deploy agent
  And the generated content uses simplified CLI terminology (no references to "orchestrator" or "agent tiers")

Scenario: Existing rig.toml blocks accidental overwrite
  Given the current directory contains a rig.toml file
  When the user runs "npx create-rig"
  Then the CLI displays "Existing rig.toml found. Overwrite? (y/N)"
  And if the user enters "N" or presses Enter, no files are modified
  And if the user enters "y", files are regenerated from the new selections

Scenario: Unsupported stack selection
  Given the user runs create-rig interactively
  When the stack selection prompt appears
  Then only "nextjs" and "python-fastapi" are shown as options
  And a note says "More stacks coming soon. Request at [repo-url]/issues"
```

---

### US-2 (P1): Preset Content Delivers Working AI Dev Practice

**As** a developer who just ran `create-rig`,
**I want** the generated agents, rules, hooks, and workflows to actually work when I start using my AI tool,
**So that** I get immediate value without debugging configuration files.

#### Acceptance Criteria

| ID | Criterion | Details |
|----|-----------|---------|
| AC-RIG-010 | Pre-commit hooks execute | Running `git commit` in a project initialized with RIG triggers the pre-commit hook, which runs the stack-appropriate linter and typechecker. If either fails, the commit is blocked with a clear error message |
| AC-RIG-011 | Agent definitions are parseable | Every `.claude/agents/*.md` file has valid frontmatter (name, description, model, file ownership) and is recognized by Claude Code when the user starts a session in the project directory |
| AC-RIG-012 | Rules are loaded | Every `.claude/rules/*.md` file is loaded by Claude Code on session start. Context-discipline and security rules constrain agent behavior (no scanning node_modules, no reading .env files) |
| AC-RIG-013 | AGENTS.md is tool-compatible | The generated AGENTS.md follows the industry-standard format (directory-scoped, compatible with Cursor, Copilot, Codex, and other AGENTS.md-supporting tools) |
| AC-RIG-014 | Shared state templates exist | `_hub/templates/` contains `progress-template.md`, `decisions-template.md`, and `spec-template.md`. These templates are referenced in the generated CLAUDE.md |
| AC-RIG-015 | Quality gates are enforced | The generated setup includes a quality pipeline: lint, typecheck, test, and code review. For the `small-team` and `solo-dev` presets, a verification agent definition is included that performs adversarial testing (checks for named LLM failure patterns, not just "tests pass") |
| AC-RIG-016 | Security rules are active | Generated rules include: secrets protection (.env, .pem, .key files), supply chain audit guidance (npm audit, lockfile discipline), and context-discipline (targeted search, size limits) |
| AC-RIG-017 | PM preset guardrails work | For the `pm` preset, the generated CLAUDE.md includes explicit guardrails: mandatory branch creation before changes, mandatory code-reviewer before merge, simplified workflow (no direct orchestrator commands) |
| AC-RIG-048 | LLM-native onboarding | Generated CLAUDE.md includes an "About RIG" section that instructs the LLM to explain RIG to the user when asked ("what is RIG?", "how does this work?", "help me get started"). The LLM uses this section + generated file structure to provide contextual onboarding without the user reading any docs |

#### Scenarios

```gherkin
Scenario: Pre-commit hook blocks bad commit (Next.js)
  Given a project initialized with create-rig (preset=solo-dev, stack=nextjs)
  And the user has run "bash .claude/hooks/install-git-hooks.sh ."
  And the user has a TypeScript file with a type error
  When the user runs "git add . && git commit -m 'test'"
  Then the pre-commit hook runs "npm run lint" and "npx tsc --noEmit"
  And the commit is blocked with the TypeScript error message displayed
  And no commit is created

Scenario: Pre-commit hook blocks bad commit (Python)
  Given a project initialized with create-rig (preset=small-team, stack=python-fastapi)
  And the user has a Python file with a ruff violation
  When the user runs "git add . && git commit -m 'test'"
  Then the pre-commit hook runs "ruff check" and "mypy"
  And the commit is blocked with the ruff error message displayed

Scenario: Agent definitions work in Claude Code
  Given a project initialized with create-rig (preset=small-team, stack=nextjs)
  When the user opens Claude Code in the project directory
  Then Claude Code detects and lists available agents from .claude/agents/
  And the user can invoke agents by name (e.g., "use code-reviewer agent")
  And agent file ownership constraints are respected (code-reviewer cannot write to source files)

Scenario: Verification agent catches "tests pass but not shippable" code
  Given a project initialized with create-rig (preset=solo-dev)
  And the user invokes the verification agent on a code change
  When the verification agent runs
  Then it checks for named LLM failure patterns (hallucinated imports, orphan files, missing error handling, untested edge cases)
  And it reports structured findings, not just "tests pass"

Scenario: LLM explains RIG to new user
  Given a project initialized with create-rig (any preset)
  When the user opens Claude Code and asks "What is RIG?" or "How does this setup work?"
  Then the AI reads the "About RIG" section in CLAUDE.md
  And explains: what RIG is, what files were generated, how to use agents, how to update
  And adapts the explanation to the preset (PM gets simplified version, dev gets technical version)
  And suggests next steps relevant to the user's preset

Scenario: Security rules prevent secrets exposure
  Given a project initialized with create-rig (any preset)
  When an AI agent attempts to read a .env file
  Then the security rule in .claude/rules/security.md instructs the agent to refuse
  And the agent suggests using .env.example or environment variable names instead
```

---

### US-3 (P1): Living Updates with `rig update`

**As** a developer using RIG,
**I want** to run `rig update` and receive a curated changelog explaining what changed in the AI dev ecosystem, how it affects my setup, and have patches applied,
**So that** my AI dev practice stays current without me tracking every tool changelog.

#### Acceptance Criteria

| ID | Criterion | Details |
|----|-----------|---------|
| AC-RIG-018 | Dry-run mode | `rig update --dry-run` shows a list of proposed changes grouped by component (agents, hooks, rules, formats) with explanations, but modifies no files |
| AC-RIG-019 | Curated changelog | Each update includes a human-readable changelog section: "What changed" (ecosystem event), "Impact on you" (what it means for this project's preset/stack), "Patch" (what rig update will do). Minimum 1 sentence per section per change |
| AC-RIG-020 | Selective updates | `rig update --component agents` updates only agent definitions. Valid components: agents, hooks, rules, formats, templates |
| AC-RIG-021 | Backup before update | Before applying changes, `rig update` creates a git-trackable backup: either a branch (`rig/backup-{timestamp}`) if in a git repo, or a `.rig/backups/{timestamp}/` directory copy if not |
| AC-RIG-022 | User customizations preserved | Files that the user has modified (detected by comparing against the last-generated hash stored in `.rig/manifest.yaml`) are not overwritten. Instead, they appear in a "Manual review needed" section of the update output with a diff showing what RIG wants to change |
| AC-RIG-023 | Manifest updated | After a successful update, `.rig/manifest.yaml` is updated with the new component versions, generation timestamp, and file hashes |
| AC-RIG-024 | Offline graceful failure | If the update registry is unreachable (no internet, registry down), `rig update` exits with a clear message: "Cannot reach update registry. Your current setup continues to work. Try again later." No files are modified |
| AC-RIG-025 | Update source | Updates are fetched from the npm registry (new version of rig-cli package contains updated templates, agent definitions, rules, and format generators) |
| AC-RIG-045 | Agent memory preserved | `rig update` NEVER modifies or deletes user/agent-generated files: `PROGRESS.md`, `DECISIONS.md`, `memory/`, `specs/`, or any file NOT tracked in `.rig/manifest.yaml`. Only RIG-managed files (listed in manifest) are candidates for update |
| AC-RIG-046 | Project references preserved | When CLAUDE.md is regenerated during update, project-specific references (file paths, commands, structure descriptions added by the user or agents) are detected via hash comparison and preserved. Updated CLAUDE.md merges new RIG content with existing project-specific sections |
| AC-RIG-047 | Post-update summary | After update, CLI prints a structured summary: (1) "What's new" — new capabilities added, (2) "What changed" — behavioral differences in agents/rules, (3) "What to review" — files with user customizations that need manual merge, (4) "Migration notes" — if agent behavior changed, explains before/after |

#### Scenarios

```gherkin
Scenario: Dry-run shows proposed changes
  Given a project initialized with RIG v0.1.0
  And RIG v0.2.0 is available with updated agent definitions and a new hook event
  When the user runs "rig update --dry-run"
  Then the output shows:
    """
    RIG v0.2.0 available (current: v0.1.0)

    agents (v1.0 -> v2.0):
      What changed: Claude Code added named sub-agents support
      Impact: Your agent definitions can now reference sub-agents by name
      Patch: Add sub-agent field to 3 agent files

    hooks (v1.0 -> v1.1):
      What changed: New SubagentStart event available
      Impact: Pre-commit can now also gate sub-agent spawns
      Patch: Update pre-commit-guard.sh with new event handler

    1 file has local modifications (manual review needed):
      .claude/agents/code-reviewer.md

    Run 'rig update' to apply.
    """
  And no files are modified

Scenario: Update applies changes and creates backup
  Given a project initialized with RIG v0.1.0 in a git repository
  When the user runs "rig update"
  Then a git branch "rig/backup-{timestamp}" is created from current HEAD
  And agent definitions are updated to v2.0
  And hooks are updated to v1.1
  And .rig/manifest.yaml is updated with new versions
  And the CLI prints a summary of applied changes
  And user-modified files are listed under "Manual review needed" with diffs

Scenario: User customizations are not overwritten
  Given a project initialized with RIG
  And the user has manually edited .claude/agents/code-reviewer.md (hash differs from manifest)
  When the user runs "rig update"
  Then .claude/agents/code-reviewer.md is NOT modified
  And the update output shows a diff between the user's version and the new RIG version
  And a message says "Review and merge manually: .claude/agents/code-reviewer.md"

Scenario: Selective component update
  Given a project initialized with RIG
  When the user runs "rig update --component hooks"
  Then only files in .claude/hooks/ are evaluated for updates
  And agents, rules, formats, and templates are not touched
  And manifest.yaml updates only the hooks component version

Scenario: Offline graceful failure
  Given the npm registry is unreachable
  When the user runs "rig update"
  Then the CLI prints "Cannot reach update registry. Your current setup continues to work. Try again later."
  And exit code is 1
  And no files are modified

Scenario: Agent memory and shared state preserved during update
  Given a project initialized with RIG
  And agents have generated PROGRESS.md, DECISIONS.md, and memory/ files
  And the user has added project-specific sections to CLAUDE.md
  When the user runs "rig update"
  Then PROGRESS.md, DECISIONS.md, and memory/ are NOT modified
  And specs/ directory is NOT modified
  And any file NOT listed in .rig/manifest.yaml is NOT touched
  And project-specific sections in CLAUDE.md are preserved
  And the post-update summary shows "What's new", "What changed", and "Migration notes"

Scenario: Behavioral change communicated after update
  Given RIG v0.2.0 changes code-reviewer agent to use adversarial review instead of checklist review
  When the user runs "rig update"
  Then the post-update summary includes a Migration Note:
    "code-reviewer: Now uses adversarial review pattern (3 hostile personas). Previous behavior: checklist-based review. Impact: Reviews may surface more issues. No action needed."
```

---

### US-4 (P2): Health Check with `rig doctor`

**As** a developer using RIG,
**I want** to run `rig doctor` and get a diagnostic report of my AI dev setup,
**So that** I can identify broken references, stale rules, missing hooks, and contradictions before they cause agent failures.

#### Acceptance Criteria

| ID | Criterion | Details |
|----|-----------|---------|
| AC-RIG-026 | Eight diagnostic checks | `rig doctor` runs the following checks: (1) schema freshness -- agent frontmatter uses latest known fields, (2) format sync -- CLAUDE.md and AGENTS.md are consistent with rig.toml, (3) hook coverage -- all recommended hooks are registered, (4) dead references -- all file paths referenced in CLAUDE.md and agent definitions point to existing files, (5) rule contradictions -- no two rules give opposing instructions, (6) template drift -- project templates match RIG template versions, (7) deprecation scan -- no deprecated patterns in use, (8) security baseline -- gitleaks hook present, .gitignore covers secrets |
| AC-RIG-027 | Traffic light output | Each check outputs one of: PASS (green), WARN (yellow), or FAIL (red). Overall status is the worst individual status |
| AC-RIG-028 | Remediation commands | Every WARN or FAIL includes a suggested remediation: either a `rig` command to run or a manual action to take |
| AC-RIG-029 | Machine-readable output | `rig doctor --json` outputs results as JSON with fields: check_name, status (pass/warn/fail), message, remediation |
| AC-RIG-030 | Exit codes | Exit code 0 if all checks PASS. Exit code 1 if any WARN. Exit code 2 if any FAIL |
| AC-RIG-031 | No network required | `rig doctor` runs entirely offline using locally available information. It does not fetch remote data |

#### Scenarios

```gherkin
Scenario: Clean project passes all checks
  Given a project freshly initialized with create-rig
  When the user runs "rig doctor"
  Then all 8 checks show PASS
  And exit code is 0
  And the output ends with "All checks passed. Your RIG setup is healthy."

Scenario: Dead reference detected
  Given a project initialized with RIG
  And the user has deleted .claude/agents/code-reviewer.md
  But CLAUDE.md still references "code-reviewer" agent
  When the user runs "rig doctor"
  Then the "dead references" check shows FAIL
  And the message says "CLAUDE.md references agent 'code-reviewer' but .claude/agents/code-reviewer.md does not exist"
  And remediation says "Regenerate with 'rig generate' or restore the missing file"
  And exit code is 2

Scenario: Stale agent frontmatter
  Given a project initialized with RIG v0.1.0
  And RIG v0.2.0 added a "context" field to agent frontmatter
  When the user runs "rig doctor"
  Then the "schema freshness" check shows WARN
  And the message says "3 agent files missing 'context' field (available since v0.2.0)"
  And remediation says "Run 'rig update --component agents' to add new fields"

Scenario: Missing pre-commit hook
  Given a project initialized with RIG
  And .git/hooks/pre-commit does not exist or is not executable
  When the user runs "rig doctor"
  Then the "hook coverage" check shows WARN
  And remediation says "Run 'bash .claude/hooks/install-git-hooks.sh .' to install git hooks"

Scenario: JSON output for CI integration
  Given a project initialized with RIG
  When the user runs "rig doctor --json"
  Then the output is valid JSON
  And it contains an array of objects with keys: check_name, status, message, remediation
  And the exit code matches the worst status (0 for all pass, 1 for warn, 2 for fail)
```

---

### US-5 (P2): Multi-Tool Output from Single Config

**As** a developer who uses both Claude Code and Cursor (or other AGENTS.md-compatible tools),
**I want** my `rig.toml` to generate correct configuration files for all my tools from a single source,
**So that** I don't maintain duplicate configs that drift apart.

#### Acceptance Criteria

| ID | Criterion | Details |
|----|-----------|---------|
| AC-RIG-032 | Generate command | `rig generate` reads rig.toml and generates all configured format targets. `rig generate claude_md` generates only CLAUDE.md. Valid targets: claude_md, agents_md, cursor_mdc |
| AC-RIG-033 | CLAUDE.md generation | Generated CLAUDE.md includes: project metadata, role/mindset section, stack-specific commands, agent workflow section, shared state protocol, development rules, and all content from the active preset |
| AC-RIG-034 | AGENTS.md generation | Generated AGENTS.md follows the industry-standard format (directory-scoped). Content is derived from the same agent definitions used for .claude/agents/ but formatted for multi-tool consumption |
| AC-RIG-035 | Cursor MDC generation | Generated .cursor/rules/*.mdc files contain the same rule content as .claude/rules/ but in Cursor's MDC format with appropriate frontmatter (description, globs, alwaysApply) |
| AC-RIG-036 | Format consistency | After running `rig generate`, the core behavioral instructions in CLAUDE.md, AGENTS.md, and .cursor/rules/ are semantically equivalent (same rules, same agent behaviors, adapted to each tool's syntax) |
| AC-RIG-037 | Diff-friendly regeneration | Running `rig generate` twice with no rig.toml changes produces identical output (deterministic generation). Changes show clean diffs |

#### Scenarios

```gherkin
Scenario: Generate all formats from rig.toml
  Given a rig.toml with formats.generate = ["claude_md", "agents_md", "cursor_mdc"]
  When the user runs "rig generate"
  Then CLAUDE.md is generated in the project root
  And AGENTS.md is generated in the project root
  And .cursor/rules/ directory is created with MDC files
  And each file contains content appropriate to its format

Scenario: Generate single format
  Given a rig.toml exists
  When the user runs "rig generate agents_md"
  Then only AGENTS.md is regenerated
  And CLAUDE.md and .cursor/rules/ are not modified

Scenario: Deterministic output
  Given a rig.toml exists
  When the user runs "rig generate" twice
  Then the output files are byte-identical between runs

Scenario: rig.toml change reflects in all formats
  Given a project with generated files
  When the user changes the preset in rig.toml from "solo-dev" to "small-team"
  And runs "rig generate"
  Then CLAUDE.md now includes team coordination sections
  And AGENTS.md now includes team-oriented agent instructions
  And .cursor/rules/ now includes team coordination MDC files
```

---

### US-6 (P2): PM-Builder Discovery Workflow

**As** a PM-builder using RIG with the `pm` preset,
**I want** a structured discovery-to-prototype workflow built into my AI dev setup,
**So that** I can go from problem statement to working prototype with guardrails that prevent me from shipping broken code.

#### Acceptance Criteria

| ID | Criterion | Details |
|----|-----------|---------|
| AC-RIG-038 | Discovery workflow in CLAUDE.md | The PM preset's CLAUDE.md includes a step-by-step workflow: (1) problem statement, (2) user stories, (3) acceptance criteria, (4) prototype plan, (5) implementation with guardrails, (6) review before merge |
| AC-RIG-039 | Simplified agent tier | PM preset includes only 3 agent types: planner (creates spec), builder (implements), reviewer (validates). No orchestrator, no specialist, no tech-lead terminology |
| AC-RIG-040 | Safety guardrails | PM preset rules enforce: always create a branch before making changes, never push to main directly, always run code-reviewer before merge, never delete files without confirmation |
| AC-RIG-041 | Simplified CLI vocabulary | PM preset CLAUDE.md avoids jargon: no "orchestrator", no "worktree", no "agent tiers". Uses: "plan", "build", "review", "ship" |

#### Scenarios

```gherkin
Scenario: PM-builder starts a new feature
  Given a project initialized with create-rig (preset=pm, stack=nextjs)
  When the PM opens Claude Code and says "I want to add a user dashboard"
  Then the AI follows the discovery workflow: asks for problem statement, helps define user stories, creates acceptance criteria, and proposes a prototype plan before writing code
  And the AI creates a feature branch before making any file changes
  And the workflow is guided by the PM preset's CLAUDE.md instructions

Scenario: PM-builder tries to push to main
  Given a project initialized with PM preset
  And the pre-commit hook is installed
  When the PM attempts to commit directly to main
  Then the hook warns: "PM preset requires working on a feature branch. Create one with: git checkout -b feature/your-feature-name"
```

---

### US-7 (P3): Autonomous Agent Compatibility

**As** a developer running factory-style autonomous agents (e.g., Linear issue to PR pipeline),
**I want** my RIG-generated CLAUDE.md and AGENTS.md to serve as reliable convention sources for autonomous agents,
**So that** agents produce code consistent with my team's standards without human supervision per task.

#### Acceptance Criteria

| ID | Criterion | Details |
|----|-----------|---------|
| AC-RIG-042 | Convention completeness | Generated CLAUDE.md includes all information an autonomous agent needs to produce a conforming PR: code style, naming conventions, file structure, testing requirements, commit message format, and review checklist |
| AC-RIG-043 | No interactive assumptions | Generated rules do not assume a human is present. Instructions like "ask the user" are qualified with "if running interactively; otherwise, choose the conservative default" |
| AC-RIG-044 | Quality gate compatibility | Pre-commit hooks work in CI/headless environments (no TTY prompts, clear exit codes, machine-parseable error output) |

#### Scenarios

```gherkin
Scenario: Factory agent reads CLAUDE.md and produces conforming code
  Given a project initialized with RIG (preset=small-team, stack=nextjs)
  And a factory agent pipeline (e.g., Linear issue -> Claude Managed Agent -> sandbox)
  When the factory agent reads CLAUDE.md from the repo
  Then CLAUDE.md contains sufficient context for the agent to: understand project structure, follow code style rules, create appropriate tests, format commit messages correctly, and not trigger security rule violations

Scenario: Pre-commit hook works in CI without TTY
  Given RIG hooks are installed in a CI pipeline
  When a commit is triggered by an automated process
  Then hooks run without prompting for input
  And exit codes are 0 (pass) or non-zero (fail)
  And error output is machine-parseable (no ANSI color codes in non-TTY mode)
```

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Linked US |
|----|-------------|----------|-----------|
| FR-001 | CLI scaffolding tool (`create-rig`) with interactive and non-interactive modes | P1 | US-1 |
| FR-002 | Three segment presets: `pm`, `small-team`, `solo-dev` with shared core + segment-specific deltas | P1 | US-1, US-2 |
| FR-003 | Two stack templates: `nextjs` (TypeScript, npm/pnpm) and `python-fastapi` (Python, ruff, mypy) | P1 | US-1, US-2 |
| FR-004 | Preset content deltas (see Preset Content Matrix below) | P1 | US-2 |
| FR-005 | Pre-commit hook generation matching selected stack (lint + typecheck) | P1 | US-2 |
| FR-006 | Agent definition generation with valid frontmatter per preset tier | P1 | US-2 |
| FR-007 | Security rules generation (secrets protection, supply chain, context discipline) | P1 | US-2 |
| FR-008 | Verification agent definition with adversarial testing patterns | P1 | US-2 |
| FR-009 | `rig update` with dry-run, selective component update, and backup | P1 | US-3 |
| FR-010 | Curated changelog generation (what changed, impact, patch) per update | P1 | US-3 |
| FR-011 | User customization detection via file hashing in manifest | P1 | US-3 |
| FR-012 | `rig doctor` with 8 diagnostic checks, traffic light output, and remediation | P2 | US-4 |
| FR-013 | JSON output mode for `rig doctor` | P2 | US-4 |
| FR-014 | `rig generate` for multi-tool output (CLAUDE.md, AGENTS.md, .cursor/rules/) from rig.toml | P2 | US-5 |
| FR-015 | PM discovery workflow content (problem -> stories -> AC -> prototype -> review) | P2 | US-6 |
| FR-016 | Autonomous agent compatibility (no-interactive fallbacks, CI-safe hooks) | P3 | US-7 |
| FR-017 | Shared state templates (PROGRESS.md, DECISIONS.md, spec-template.md) included in all presets | P1 | US-2 |
| FR-018 | Version manifest (.rig/manifest.yaml) tracking all component versions and file hashes | P1 | US-1, US-3, US-4 |
| FR-019 | Update safety: agent memory and shared state files never modified by `rig update` | P1 | US-3 |
| FR-020 | Update safety: project-specific references in CLAUDE.md preserved during regeneration | P1 | US-3 |
| FR-021 | Post-update summary with "What's new", "What changed", "Migration notes" sections | P1 | US-3 |
| FR-022 | LLM-native onboarding section in generated CLAUDE.md (explains RIG to user via LLM) | P1 | US-2 |

### Preset Content Matrix (FR-004)

| Component | Shared Core (all presets) | PM delta | Small-Team delta | Solo-Dev delta |
|-----------|--------------------------|----------|-----------------|----------------|
| **Quality gates** | Lint + typecheck hooks, code-reviewer agent | Simplified: "review before ship" | Full pipeline: lint -> typecheck -> test -> fresh code-reviewer -> max 3 iterations | Same as shared core |
| **Security** | Secrets protection, supply chain audit, context discipline | Same + "never deploy directly" | Same + lockfile discipline enforcement | Same as shared core |
| **Agents** | code-reviewer, verification | planner, builder, reviewer (3 agents, simplified names) | oversight, planning, workers, quality, specialists (5-tier) | code-reviewer, verification (2 agents) |
| **Orchestration** | Sequential pipeline | Not exposed (hidden behind "plan -> build -> review") | Full sequential pipeline with fresh-session verify | Simplified: direct agent invocation |
| **Shared state** | PROGRESS.md, DECISIONS.md templates | Included, simplified headers | Included + checkpoint commit protocol + team coordination | Included, minimal |
| **Spec-driven workflow** | Spec template available | Full discovery workflow (problem -> stories -> AC -> prototype) | Full spec pipeline (spec -> plan -> tasks -> implement -> review -> ship) | Available but optional |
| **Rules** | context-discipline, security | + "always branch", "never push main", simplified vocabulary | + agent-orchestration, tool-gate, full vocabulary | context-discipline, security only |
| **Memory** | Project memory template | Simplified: "what I learned" notes | 3-layer: team + agent + personal | Project memory only |
| **CLAUDE.md tone** | n/a | Simplified, no jargon, encouraging | Technical, terse, expert-level | Technical, minimal |

### 3.2 Key Entities

| Entity | Fields | Description |
|--------|--------|-------------|
| **Project Configuration** (rig.toml) | name, preset, stack, team_size, agents (tiers, default_memory, worker_model, oversight_model), hooks (pre_commit list), formats (generate list), updates (channel, auto_check) | Single source of truth for the entire AI dev setup. Human-editable. Drives all generation |
| **Version Manifest** (.rig/manifest.yaml) | rig_version, generated_at, components (agents, hooks, rules, formats, templates -- each with version + count + schema), compatibility (tool version ranges), file_hashes (path -> hash mapping) | Tracks what was generated, when, and at what version. Used by `rig update` and `rig doctor` |
| **Agent Definition** (.claude/agents/*.md) | name, description, model, file_ownership (read/write paths), tools (allowed tool list), memory (scope) | Defines a single agent's identity, capabilities, and constraints. Frontmatter + markdown body |
| **Rule** (.claude/rules/*.md) | Content only (always-loaded markdown) | Behavioral instruction loaded on every session. No frontmatter |
| **Hook** (.claude/hooks/*.sh) | Executable shell script | Pre-commit or other git hook. Stack-aware (detects package.json vs pyproject.toml) |
| **Preset** (internal to rig-cli) | id, display_name, description, agent_set, rule_set, hook_config, template_set, claude_md_template, agents_md_template | Bundled definition of a complete AI dev setup for a specific segment |
| **Update Package** (internal to rig-cli) | from_version, to_version, changelog_entries (what_changed, impact, patch), component_patches, migration_scripts | Describes what changed between versions and how to apply the update |

### 3.3 Non-Functional Requirements

| ID | Category | Requirement |
|----|----------|-------------|
| NFR-001 | Performance | `create-rig` generates all files in under 10 seconds (excluding npm download). `rig doctor` completes all 8 checks in under 5 seconds. `rig generate` completes in under 3 seconds |
| NFR-002 | Portability | CLI runs on macOS, Linux, and Windows (WSL). Node.js 18+ required. No native dependencies |
| NFR-003 | Offline capability | `create-rig` works offline after initial npm install (templates bundled in package). `rig doctor` works entirely offline. Only `rig update` requires network |
| NFR-004 | Determinism | `rig generate` produces byte-identical output for identical inputs. No timestamps, random values, or environment-dependent content in generated files |
| NFR-005 | Backward compatibility | `rig update` never breaks a working setup. If update fails mid-process, the backup allows full rollback |
| NFR-006 | File size | Total generated files per project are under 500KB. Individual agent definitions under 10KB. CLAUDE.md under 50KB |
| NFR-007 | Zero runtime dependencies | Generated files (CLAUDE.md, AGENTS.md, agents, rules, hooks) have no dependency on rig-cli being installed. Uninstalling rig-cli does not break the generated setup |
| NFR-008 | Accessibility | CLI output uses semantic formatting (headers, lists, indentation). Color is optional and disabled when NO_COLOR env var is set or stdout is not a TTY |

### 3.4 Constraints

- **npm ecosystem only:** Distribution via npm registry. Users must have Node.js 18+ and npm (or compatible package manager) installed
- **Two stacks at launch:** Only Next.js (TypeScript) and Python (FastAPI) stack templates. Additional stacks are post-MVP
- **Three presets at launch:** Only `pm`, `small-team`, and `solo-dev`. Enterprise preset is post-MVP
- **No backend service:** RIG is a CLI tool. No API, no database, no hosted service. All data is local files in the user's project
- **No authentication:** No user accounts, no telemetry, no license keys in MVP
- **Content quality bar:** Every generated agent definition, rule, and hook must be tested against real AI tool usage before shipping. No placeholder content

### 3.5 Out of Scope

- **Enterprise preset** (SCIM, IdP, RBAC, audit logs, SSO) -- deferred to post-MVP
- **APM integration** (`apm install rig-preset-*`) -- deferred; RIG ships its own CLI
- **SGR governance layer** (Pydantic schema validation for agent prompts) -- deferred; hooks are sufficient for MVP
- **Custom preset creation** (user defines their own preset from scratch) -- users can edit generated files, but no `rig preset create` command
- **Web UI / dashboard** -- RIG is CLI-only
- **Telemetry / analytics** -- no usage tracking
- **Paid features / licensing** -- open-source core, monetization decided post-MVP
- **Stack templates beyond Next.js and Python** -- React (non-Next), Vue, Go, Rust, etc. are post-MVP
- **MCP server configuration** -- `.mcp.json` generation deferred; users configure MCP manually
- **IDE plugins** -- no VS Code extension, no JetBrains plugin. RIG generates files that IDEs read natively
- **Migration from existing setups** -- no `rig import` command to convert existing .claude/ configs to rig.toml. Users start fresh or manually edit rig.toml
- **Team/org registry** -- no shared preset registry for organizations. Teams share via git
- **Ecosystem monitoring module** -- automated parsing of AI tool changelogs, blogs, Telegram channels for content updates. Post-MVP: adapt telegram-channel-parser pattern for ecosystem intelligence
- **Claude Skills Marketplace / SourceCraft distribution** -- publishing RIG presets as Claude Code skills. Post-MVP distribution channel alongside npm
- **`rig learn` interactive guide** -- guided tutorial beyond LLM-native onboarding. Post-MVP
- **`rig feedback` command** -- structured feedback collection to GitHub Issues. Post-MVP
- **Landing page** -- marketing site for RIG (repurpose existing Next.js codebase). Separate workstream, not blocking CLI MVP
- **Opt-in anonymous usage analytics** -- aggregate preset/stack/update stats for product decisions. Post-MVP

---

## 4. Success Criteria

| # | Metric | Target | Measurement |
|---|--------|--------|-------------|
| 1 | Time from `npx create-rig` to working AI dev session | Under 5 minutes for all presets and stacks | Timed test: run create-rig, open Claude Code, invoke an agent, verify it works |
| 2 | Generated hook execution success rate | 100% of pre-commit hooks execute without error on a clean project with the selected stack's toolchain installed | Automated test: init project, create a file with a lint error, attempt commit, verify hook blocks it |
| 3 | Agent definition parse success rate | 100% of generated agent files are recognized by Claude Code | Automated test: init project, start Claude Code session, verify all agents are listed |
| 4 | `rig doctor` accuracy | Zero false positives on a freshly generated project (all checks PASS). At least 1 true positive detection for each of the 8 check categories when the corresponding issue is introduced | Test matrix: for each check, introduce the specific issue and verify detection |
| 5 | `rig update` safety | Zero data loss across 100 update cycles (backup always created, user customizations never silently overwritten) | Automated test: modify files, run update, verify originals in backup and customizations preserved |
| 6 | Multi-tool consistency | CLAUDE.md, AGENTS.md, and .cursor/rules/ contain semantically equivalent instructions after `rig generate` | Manual review: compare behavioral instructions across generated formats for each preset |
| 7 | Preset differentiation | A reviewer can identify the target segment (PM, small-team, solo-dev) from the generated CLAUDE.md alone within 30 seconds of reading | Blind test: show 3 generated CLAUDE.md files to 3 people unfamiliar with RIG, ask them to match preset to segment |
| 8 | npm package size | `create-rig` package under 2MB. `rig-cli` package under 5MB | Check published package size on npm |
| 9 | CLI response time | All commands respond within 10 seconds (create-rig generation, rig doctor, rig generate). No command hangs or requires a loading spinner longer than 10 seconds for local operations | Timed test on reference hardware (M1 Mac, 8GB RAM) |
| 10 | Competitive positioning | RIG is published on npm and has a working README before JetBrains Central exits EAP | Ship date tracking against JetBrains Central timeline |

---

## 5. Open Questions / Clarifications

| # | Question | Status | Resolution |
|---|----------|--------|------------|
| 1 | npm package scope | Resolved | Unscoped: `create-rig` + `rig-cli`. Simpler, no npm org setup needed |
| 2 | Update mechanism | Resolved | npm package versioning. Templates bundled in rig-cli releases. No dedicated registry |
| 3 | License model | Resolved | MIT for everything (code + content). No dual licensing |
| 4 | PM "never push main" enforcement | Resolved | Soft warning with branch creation instructions. Not a hard block |

---

## 6. CLI UX Notes

### Command Reference

```
npx create-rig                          # Interactive project initialization
npx create-rig --preset=X --stack=Y     # Non-interactive initialization
rig generate                            # Regenerate all format files from rig.toml
rig generate <target>                   # Regenerate specific format (claude_md, agents_md, cursor_mdc)
rig update                              # Apply available updates
rig update --dry-run                    # Preview available updates
rig update --component <name>           # Update specific component
rig doctor                              # Run health checks
rig doctor --json                       # Health checks with JSON output
rig --version                           # Print rig-cli version
rig --help                              # Print help
```

### Output Style

- Use color when stdout is a TTY and NO_COLOR is not set
- Use semantic markers: checkmark for PASS, warning triangle for WARN, X for FAIL
- Group output by component (agents, hooks, rules, formats)
- Always end with a clear "next step" suggestion
- Error messages include the specific file path and line number when applicable
- Progress indicators for operations longer than 1 second (e.g., `rig update` fetching)

### Interactive Prompts (create-rig)

```
Welcome to RIG - Managed AI Dev Practice

? Select your preset:
  > solo-dev     Quick quality setup, minimal config
    small-team   Team coordination, shared state, 5-tier agents
    pm           Discovery workflow, guardrails, simplified CLI

? Select your stack:
  > nextjs          Next.js + TypeScript
    python-fastapi  Python + FastAPI

? Project name: my-app

Generating RIG setup for solo-dev / nextjs...

  Created: rig.toml
  Created: CLAUDE.md
  Created: AGENTS.md
  Created: .cursor/rules/ (3 files)
  Created: .claude/agents/ (2 files)
  Created: .claude/hooks/ (1 file)
  Created: .claude/rules/ (2 files)
  Created: _hub/templates/ (3 files)
  Created: .rig/manifest.yaml

Done in 1.2s

Next steps:
  1. Install git hooks:  bash .claude/hooks/install-git-hooks.sh .
  2. Open your AI tool:  claude  (or open in Cursor)
  3. Check setup health: rig doctor
```

### Error States

```
Error: Node.js 18+ required. Found: v16.14.0
  Fix: Update Node.js at https://nodejs.org

Error: rig.toml not found in current directory
  Fix: Run 'npx create-rig' to initialize, or cd to your project root

Error: Cannot parse rig.toml: invalid TOML at line 12
  Fix: Check rig.toml syntax at line 12. Expected: key = "value"
```

---

## Handoff

- [x] All AC IDs assigned (AC-RIG-001 through AC-RIG-048)
- [x] All [NEEDS CLARIFICATION] resolved (4 questions answered)
- [x] Success criteria are measurable (10 quantified metrics)
- [x] Each US is independently testable (US-1 alone produces a working project setup)
- [x] Out of scope explicitly defined (13 items)
- [x] Ready for `/spec-planner`
