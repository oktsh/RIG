# Decisions Log — RIG MVP

> Planners write during spec/plan. Tech Lead audits at checkpoints.
> This file SURVIVES context compaction — agents read it on fresh starts.

## D-001: TypeScript + Node.js for CLI (spec-planner)
**Date**: 2026-04-14
**Context**: RIG is distributed via npm as two packages. Need to choose implementation language.
**Decision**: TypeScript 5.x with Node.js 22 LTS. Compile to ESM with tsup.
**Rationale**: npm-native distribution. TypeScript provides type safety for schema validation, template composition, and CLI argument parsing. Same language as the primary target audience (Next.js devs). Node.js 22 is current LTS.
**Alternatives rejected**: (1) Rust — fast but heavy build infra, no benefit for <10s generation tasks, barrier for contributors. (2) Python — awkward npm distribution, separate runtime requirement. (3) Plain JavaScript — loses type safety for schema work.
**Reversible**: No (foundational choice)

## D-002: pnpm monorepo for package management (spec-planner)
**Date**: 2026-04-14
**Context**: Two npm packages (create-rig, rig-cli) share content templates, schema definitions, and utilities. Need a repo structure.
**Decision**: pnpm workspace monorepo with packages/ directory. Shared code in a private `@rig/core` package (never published).
**Rationale**: pnpm workspaces provide zero-install linking between packages. Shared code stays DRY without publishing a third package. Lockfile discipline is strict by default. Workspace protocol (`workspace:*`) prevents accidental publish of local refs.
**Alternatives rejected**: (1) Separate repos — duplication of content, schema drift between packages. (2) npm workspaces — slower, less strict. (3) Turborepo/Nx — overkill for 2 packages, adds build complexity. (4) Single package with bin aliases — `create-rig` convention requires separate package for `npx create-rig`.
**Reversible**: Yes (can split later, but painful)

## D-003: Handlebars for template engine (spec-planner)
**Date**: 2026-04-14
**Context**: Generation engine needs to compose markdown files from preset/stack/role fragments. Need a template system.
**Decision**: Handlebars (handlebars npm package). Templates are `.hbs` files bundled in the npm package.
**Rationale**: Logic-less templates prevent complex control flow in templates (keeps content authorable by non-devs). Built-in partials for composition (preset fragments = partials). Helpers for simple conditionals (`{{#if}}`, `{{#each}}`). Well-known, stable (v4, no breaking changes in years). Zero native dependencies. Small footprint (~70KB).
**Alternatives rejected**: (1) EJS — allows arbitrary JS in templates, too powerful, content authors could break things. (2) Mustache — too limited (no helpers, no inline conditionals). (3) Liquid — Ruby-ism, less npm ecosystem support. (4) Custom string interpolation — fine for v0.1 but won't scale to preset composition with conditionals. (5) Nunjucks — good but heavier, less community activity.
**Reversible**: Yes (templates are data; engine is swappable)

## D-004: @iarna/toml for TOML parsing (spec-planner)
**Date**: 2026-04-14
**Context**: rig.toml is the source of truth. Need a TOML parser/serializer for Node.js.
**Decision**: `@iarna/toml` — pure JS, TOML v1.0 compliant, read + write support.
**Rationale**: TOML v1.0 spec compliant. Pure JS (no native deps, works on all platforms). Supports both parse and stringify (needed for rig.toml generation). Small, maintained. 1.5M weekly downloads.
**Alternatives rejected**: (1) `smol-toml` — newer, smaller, but write support is limited. (2) `toml` (npm) — TOML v0.4 only, outdated spec. (3) `js-yaml` + YAML format — YAML is error-prone (indentation), TOML is safer for human editing.
**Reversible**: Yes (parser is isolated behind a module)

## D-005: Commander.js for CLI framework (spec-planner)
**Date**: 2026-04-14
**Context**: Need CLI argument parsing, subcommands, help generation for both create-rig and rig-cli.
**Decision**: Commander.js (commander npm package).
**Rationale**: De facto standard for Node.js CLIs. Subcommand support, auto-generated help, type coercion, option validation. Used by create-vite, create-next-app, and hundreds of major CLIs. Tiny footprint. TypeScript types included.
**Alternatives rejected**: (1) yargs — heavier, more config-oriented, verbose API. (2) oclif — framework-level (Salesforce), too heavy for 4 commands. (3) citty/unbuild (unjs) — newer, less proven, smaller community. (4) meow — too minimal, no subcommand support. (5) clipanion (yarn) — good but niche.
**Reversible**: Yes (CLI layer is thin)

## D-006: Inquirer.js for interactive prompts (spec-planner)
**Date**: 2026-04-14
**Context**: create-rig needs interactive prompt flow (preset, stack, name selection).
**Decision**: `@inquirer/prompts` (v2, ESM-native, modular).
**Rationale**: Industry standard for Node.js interactive CLIs. Modular v2 API (import only what you need). Select, input, confirm prompts cover all create-rig needs. Works in all terminals. Graceful Ctrl+C handling.
**Alternatives rejected**: (1) prompts (npm) — lighter but less maintained. (2) enquirer — good but inactive. (3) clack — beautiful but newer, less battle-tested. (4) Custom readline — unnecessary when Inquirer exists.
**Reversible**: Yes (prompt layer is isolated)

## D-007: Vitest for testing (spec-planner)
**Date**: 2026-04-14
**Context**: Need a test framework for unit and integration tests of CLI commands, generation engine, and update mechanism.
**Decision**: Vitest 3.x with Node.js test runner for integration tests.
**Rationale**: Fast, TypeScript-native, ESM-native. Compatible with the project's TS setup (no separate Jest config). Snapshot testing for generated file output (determinism verification). Workspace-aware (can test both packages). Built-in coverage.
**Alternatives rejected**: (1) Jest — slower, ESM support still awkward. (2) Node.js built-in test runner — fine for unit tests but lacks snapshot testing. (3) ava — good but smaller ecosystem.
**Reversible**: Yes

## D-008: tsup for build/bundle (spec-planner)
**Date**: 2026-04-14
**Context**: Need to compile TypeScript to publishable npm packages. Both packages need bin entries.
**Decision**: tsup (esbuild-based bundler). Output ESM + CJS dual format. Bundle dependencies for create-rig (standalone npx experience).
**Rationale**: Zero-config for most cases. esbuild speed (~100ms builds). Handles bin shebang insertion. Can bundle deps into single file (important for npx create-rig — no install step). DTS generation for @rig/core types.
**Alternatives rejected**: (1) tsc only — no bundling, users would need to install all deps. (2) esbuild directly — needs manual config for DTS, shebangs. (3) rollup — slower, more config. (4) unbuild — good but less used for CLIs.
**Reversible**: Yes (build is separate from source)

## D-009: Content-as-data architecture (spec-planner)
**Date**: 2026-04-14
**Context**: Agent definitions, rules, hooks, and templates are the core product. Need to decide how content is organized in the source repo vs how it's delivered.
**Decision**: Content lives in `content/` directory as structured data files (YAML frontmatter + Markdown body for agents/rules, plain shell for hooks, Handlebars for templates). Content is bundled into npm packages at build time. A content registry (`content/registry.ts`) maps preset+stack combinations to content sets.
**Rationale**: Content authors work in a familiar format (markdown + frontmatter). Registry provides compile-time validation that all preset/stack combos are covered. Build step catches missing content before publish. Content is the product — it deserves its own directory, not buried in src/.
**Alternatives rejected**: (1) Content in src/ alongside code — mixes concerns, harder for content-focused contributors. (2) Content as JSON — less authorable than markdown. (3) External content repo — adds deploy complexity, versioning headaches. (4) Content fetched at runtime — breaks offline requirement (NFR-003).
**Reversible**: Partially (content format is hard to change once authors are contributing)

## D-010: File-hash based customization detection (spec-planner)
**Date**: 2026-04-14
**Context**: `rig update` must preserve user customizations (AC-RIG-022). Need to detect which files the user has modified.
**Decision**: SHA-256 hash of each generated file stored in `.rig/manifest.yaml`. On update, compare current file hash against stored hash. If different, file was modified by user — skip it and show diff.
**Rationale**: Simple, reliable, no git dependency (works in non-git dirs). SHA-256 is fast for small files (<50KB per NFR-006). Manifest already exists for version tracking. No false positives (hash match = identical content). No false negatives (any byte change = hash mismatch).
**Alternatives rejected**: (1) Git diff detection — requires git, doesn't work in fresh clones. (2) Comment markers in generated files — fragile, users delete them. (3) Separate user-override directory — too complex for MVP.
**Reversible**: Yes

## D-011: chalk for terminal styling (spec-planner)
**Date**: 2026-04-14
**Context**: CLI output needs color, semantic markers (checkmark, warning, X), and NO_COLOR support (NFR-008).
**Decision**: chalk v5 (ESM-native). Combined with `log-symbols` for semantic markers.
**Rationale**: Auto-detects color support. Respects NO_COLOR and FORCE_COLOR env vars. ESM-native v5. Tiny. Industry standard.
**Alternatives rejected**: (1) kleur — lighter but less feature-rich (no auto-detection). (2) picocolors — minimal, no auto NO_COLOR. (3) ansis — good but newer. (4) No color library — would need manual ANSI codes and env detection.
**Reversible**: Yes

## D-012: yaml (js-yaml) for manifest format (spec-planner)
**Date**: 2026-04-14
**Context**: .rig/manifest.yaml stores version info, file hashes, and generation metadata. Need a YAML library.
**Decision**: `yaml` package (YAML 1.2, formerly `js-yaml` successor by the same author). Used for manifest read/write only.
**Rationale**: YAML is human-readable (users may inspect manifest). YAML 1.2 is the current standard. The `yaml` package handles both parse and stringify. Manifest is not user-edited (just inspectable), so YAML's indentation risk is acceptable.
**Alternatives rejected**: (1) JSON for manifest — less readable. (2) TOML for manifest — would confuse with rig.toml (different purpose). (3) Custom format — unnecessary.
**Reversible**: Yes

## D-013: No runtime dependencies in generated output (spec-planner)
**Date**: 2026-04-14
**Context**: NFR-007 requires generated files work without rig-cli installed. Need to ensure independence.
**Decision**: All generated files (CLAUDE.md, AGENTS.md, agents, rules, hooks, templates) are self-contained plain text. No imports, no runtime references to rig-cli. Hooks use only bash + project toolchain (npm/ruff/mypy).
**Rationale**: Users must be able to uninstall rig-cli and keep working. Generated files ARE the product once deployed. This also means rig.toml is the only file that "knows about RIG" — everything else is standard Claude Code / Cursor format.
**Alternatives rejected**: (1) Generated files that import rig-cli helpers — creates hard dependency. (2) Wrapper scripts that call rig — breaks if rig uninstalled.
**Reversible**: No (fundamental design principle)

## D-014: PM-builder as primary validation segment (orchestrator)
**Date**: 2026-04-15
**Context**: Three segments defined (PM, solo-dev, small-team). Need to decide which to validate first.
**Decision**: PM-builder on Claude Code is primary validation segment. Solo-dev and small-team are secondary.
**Rationale**: PMs buying AI tools with personal money = highest pain, lowest barrier. Direct dogfood channel through team colleagues. If PMs don't adopt → product thesis is wrong, and we learn fast. PM preset must be the most polished.
**Alternatives rejected**: (1) All segments equally — spreads effort too thin. (2) Solo-dev first — less differentiated, more competition. (3) Small-team first — harder to find initial users.
**Reversible**: Yes (presets make pivot cheap)

## D-015: LLM-native onboarding via CLAUDE.md (orchestrator)
**Date**: 2026-04-15
**Context**: PM-builders don't read docs or READMEs. They talk to the LLM. Need an onboarding mechanism.
**Decision**: Generated CLAUDE.md includes `[RIG-MANAGED] About RIG` section that instructs the LLM to explain RIG conversationally when asked. No separate UI, no tutorial, no docs page. The LLM IS the onboarding.
**Rationale**: Zero additional code. Native to how PMs already work. The LLM can adapt explanation to context. Works in any LLM tool that reads CLAUDE.md/AGENTS.md.
**Alternatives rejected**: (1) CLI `rig learn` command — PMs don't use terminal for learning. (2) Web-based tutorial — adds infrastructure. (3) Video-only — doesn't adapt to context.
**Reversible**: Yes (it's just content)

## D-016: Managed vs unmanaged file boundary (orchestrator)
**Date**: 2026-04-15
**Context**: `rig update` must be safe — never delete user work, agent memory, or project-specific config. Need explicit boundary.
**Decision**: Only files listed in `.rig/manifest.yaml` are managed (candidates for update). Everything else is unmanaged and NEVER touched. CLAUDE.md uses `[RIG-MANAGED]` section markers to allow partial updates. PROGRESS.md, DECISIONS.md, memory/, specs/ are always unmanaged.
**Rationale**: Manifest-based boundary is explicit and auditable. Section markers in CLAUDE.md enable granular merge. Users can always check manifest to see what RIG owns.
**Alternatives rejected**: (1) Pattern-based (update everything in .claude/) — too aggressive, users customize agents. (2) Always overwrite + backup — loses customizations silently. (3) Never update CLAUDE.md — loses the "living" value.
**Reversible**: No (breaking this trust = users stop updating)

## D-017: Ecosystem monitoring via adapted telegram-parser pattern (orchestrator)
**Date**: 2026-04-15
**Context**: "Living updates" promise requires us to know what changed in AI ecosystem. Need a monitoring mechanism.
**Decision**: Post-MVP. Fork polyakov-claude-skills telegram-channel-parser pattern. Add source adapters for GitHub releases API + RSS feeds. Architecture: `curl → parser (awk/jq) → JSON digest → React artifact`. Zero dependencies. Deployable as RIG skill.
**Rationale**: Proven pattern (zero deps, works today). Telegram channels cover Russian AI community. GitHub API covers tool releases. RSS covers blogs. Combined = comprehensive ecosystem view. Skill format = distributable through Claude marketplace.
**Alternatives rejected**: (1) Build from scratch — unnecessary when proven pattern exists. (2) Use SaaS aggregator (Feedly API) — adds dependency + cost. (3) Manual-only forever — doesn't scale.
**Reversible**: Yes

## D-018: Unified capabilities across presets (orchestrator + user)
**Date**: 2026-04-15
**Context**: Original design had different agent sets per preset (PM=5, small-team=9, solo-dev=2). User feedback: "PM should get same power as small team. Claude Code handles complexity, not the user."
**Decision**: All presets get identical capabilities: 9 agents, 5 rules, 2 workflows, 2 protocols. Presets control ONLY onboarding tone (role-mindset, about-rig sections in CLAUDE.md). The `preset` field is now an "onboarding profile", not a capability filter.
**Rationale**: (1) Claude Code orchestrates agents — PM doesn't need to know agent names. (2) PM + 2 devs = same team, same tools. (3) Less content to maintain (one set vs three). (4) Simpler codebase (no conditional logic). (5) PM buying for team shouldn't get crippled version.
**Alternatives rejected**: (1) Keep differentiated presets — artificial limitation, more maintenance. (2) Remove presets entirely — lose onboarding differentiation. (3) "Lite" + "Full" modes — complexity for no user value.
**Reversible**: Yes (can always add preset-specific content later)
