# RIG Content Directory

This directory IS the product. Everything RIG installs into user projects comes from here — agents, rules, hooks, templates, workflows. Code in `packages/` reads this directory and renders it into user-facing files.

## Directory Structure

```
content/
├── CHANGELOG.md                # What changed between versions
├── presets/
│   ├── shared/                 # Content included in ALL presets
│   │   ├── agents/             # code-reviewer, verification
│   │   ├── rules/              # context-discipline, security
│   │   └── templates/          # progress, decisions, spec templates
│   ├── pm/                     # PM-builder preset additions
│   │   ├── rules/              # pm-guardrails
│   │   └── workflows/          # discovery workflow
│   ├── small-team/             # Small team preset additions
│   │   ├── agents/             # debugger, frontend-react, python-dev, spec-*, tech-lead
│   │   ├── protocols/          # checkpoint-commits, team-coordination
│   │   ├── rules/              # agent-orchestration, tool-gate
│   │   └── workflows/          # spec-pipeline
│   └── solo-dev/               # Solo dev preset (minimal — uses shared only)
├── stacks/
│   ├── nextjs/                 # Next.js stack-specific rules + hooks
│   └── python-fastapi/         # Python/FastAPI stack-specific rules + hooks
└── templates/                  # Handlebars templates (.hbs)
    ├── claude-md.hbs           # Main CLAUDE.md template
    ├── agents-md.hbs           # AGENTS.md template
    ├── cursor-mdc.hbs          # .cursor/rules/ template
    ├── rig-toml.hbs            # rig.toml template
    └── partials/               # Reusable template sections
        ├── about-rig.hbs
        ├── agent-list.hbs
        ├── commands.hbs
        ├── feedback.hbs
        ├── git-workflow.hbs
        ├── role-mindset.hbs
        ├── shared-state.hbs
        └── workflow.hbs
```

## How Content Flows

```
content/ → @rig/core (generator) → user's project
         ↓
  presets/shared/ + presets/{preset}/ + stacks/{stack}/
         ↓
  Handlebars templates render with preset/stack context
         ↓
  CLAUDE.md, AGENTS.md, .claude/agents/, .claude/rules/, .cursor/rules/
```

## Content-as-Data Principle

- All text belongs in `content/`, never hardcoded in `packages/`
- Rules and agents are Markdown files, not code
- Templates use Handlebars for conditional rendering per preset/stack
- `[RIG-MANAGED]` markers in output define what `rig update` can overwrite

## Versioning

Content is versioned in `CHANGELOG.md`. Each `rig update` pulls the latest content and applies changes to `[RIG-MANAGED]` sections only.

## Contributing

1. Pick the right directory: `presets/shared/` for universal content, `presets/{preset}/` for preset-specific
2. Write Markdown — keep it explicit and actionable (Claude 4.7 follows instructions literally)
3. Test with `pnpm build && pnpm test` — e2e tests verify content generation
4. Submit a PR
