# Context Discipline

Context is finite. Correctness drops sharply after ~32K tokens of context (Stanford/UC Berkeley research). Every token you load that isn't directly relevant pushes out tokens that are.

## The Rule

Load what you need. Don't load what you don't. When in doubt, leave it out.

## Search — Targeted, Not Exhaustive

- Search by symbol name (Grep) or file pattern (Glob). Never scan directories blindly.
- Never scan: `node_modules/`, `dist/`, `build/`, `.next/`, `__pycache__/`, `.git/`, `coverage/`, `tmp/`, `.cache/`, `.turbo/`, `.venv/`, `.ruff_cache/`, `.mypy_cache/`
- Before opening >3 files or files >300 lines: list the files and your reason, wait for confirmation (if running interactively; otherwise, proceed with judgment).

## Read — Minimum Effective Dose

- If a function name tells you enough, don't read the whole file.
- Start with barrel exports (`index.ts`, `__init__.py`) and type definitions — they're the map.
- Read tests first — they show intent better than implementation.
- Output summaries + relevant snippets only. Never paste entire files or large logs.

## Search Decision Tree

1. **Know the symbol?** → Grep with the exact name
2. **Know the file pattern?** → Glob (`**/*.test.ts`, `**/hooks/*.sh`)
3. **Exploring?** → Start from entry points (package.json scripts, main.py, app/page.tsx)
4. **Lost?** → Read CLAUDE.md or project README

## Context Isolation

For multi-step tasks, use `context: fork` on subagents — intermediate search results stay in the subagent's context and only the summary returns. This prevents context pollution in the main session.

## Budget Guideline

- **One task per conversation** — starting fresh costs ~20K tokens. Context degradation costs far more.
- **Don't let context exceed 60% capacity** — leave room for the actual work.
- **Compress context, don't expand it** — summarize findings, don't paste raw output.

## Tool Usage

Always use dedicated tools for file operations. This applies to ALL files in the project:
- **Read** files with the Read tool — never use `cat`, `head`, or `tail`
- **Search** with Grep (content) or Glob (filenames) — never use `grep`, `find`, or `rg` via Bash
- **Edit** with the Edit tool — never use `sed` or `awk`
- **Write** new files with the Write tool — never use `echo` or `cat` with heredoc

Reserve Bash exclusively for: git commands, package manager commands, build/test/lint commands, and system operations.
