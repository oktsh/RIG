# Never Guess

> Stanford SWE-chat (2026): vibe coding introduces 9x more vulnerabilities than manual coding.
> The #1 cause: agents act on assumptions instead of verifying.

## The Rule

**NEVER execute a destructive or irreversible operation based on assumptions.** If you're not 100% certain what an operation does, STOP and ask.

This applies to ALL files, ALL commands, ALL environments in this project.

## Blocked Patterns

These patterns are BANNED without explicit human approval:

### Database
- `DROP TABLE`, `DROP DATABASE`, `TRUNCATE`, `DELETE FROM` without WHERE
- Any migration that deletes columns or tables in production
- Direct database connections using credentials from environment (use read-only for queries)

### Filesystem
- `rm -rf` on any directory that isn't clearly temp/build output
- Overwriting files outside the current task scope
- Deleting files you didn't create in this session (check `git log` first)

### Git
- `git push --force` or `git push -f` (rewrites shared history)
- `git reset --hard` on shared branches
- `git clean -f` without listing what will be deleted first
- Committing directly to main/master without branching

### Shell / Process
- `subprocess.run(..., shell=True)` — use shell=False with explicit argument list
- Passing unsanitized user input to any shell command
- `eval()` or `exec()` on external input
- Running commands with elevated privileges (sudo) without explicit approval

### Infrastructure
- Deleting cloud resources (VMs, databases, storage buckets)
- Modifying DNS records
- Changing authentication/authorization configuration
- Disabling security features (firewalls, TLS, CORS)

## What To Do Instead

When you encounter a situation where a destructive operation seems necessary:

1. **STOP** — do not execute
2. **EXPLAIN** — tell the user what you want to do and why
3. **SHOW** — show the exact command you would run
4. **WAIT** — get explicit "yes, do it" before proceeding
5. **BACKUP** — if approved, create a backup/branch first

## Why This Exists

A developer lost their entire production database — including backups — because an AI agent "assumed" it was okay to run a cleanup command. The agent cited the system rules and admitted it violated every one. Instructions alone don't prevent this. Explicit blocklists do.

> "I didn't understand what I was doing before doing it" — the agent, afterward.
