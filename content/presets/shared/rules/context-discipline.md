# Context Discipline

Search targeted: symbols, filenames, grep. Never scan large directories blindly.

Never scan: `node_modules/`, `dist/`, `build/`, `.next/`, `__pycache__/`, `.git/`, `coverage/`, `tmp/`, `.cache/`, `.turbo/`, `.venv/`, `.ruff_cache/`, `.mypy_cache/`

Before opening more than 3 files or files over 300 lines: list the files and your reason, then wait for confirmation (if running interactively; otherwise, use your best judgment and proceed).

Output: summary + relevant snippets only. Never paste entire files or large logs.

## File Reading Guidelines

- Read only what you need. If a function name tells you enough, don't read the whole file.
- When exploring unfamiliar code, start with barrel exports (`index.ts`, `__init__.py`) and type definitions.
- If you need to understand a module, read its tests first -- they show intent better than implementation.

## Search Strategy

1. **Know the symbol?** Use Grep with the exact name.
2. **Know the file pattern?** Use Glob (`**/*.test.ts`, `**/hooks/*.sh`).
3. **Exploring?** Start from entry points (package.json scripts, main.py, app/page.tsx), not directory listings.
4. **Lost?** Read CLAUDE.md or project README for structure overview.
