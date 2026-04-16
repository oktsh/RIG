# Security Rules

## Secrets Protection

Never read or print: `.env*`, `*.pem`, `*.key`, `*.crt`, `secrets/**`, `credentials/**`, `**/secret*`

If secrets are needed: ask for mock values, stub data, or environment variable names only (if running interactively; otherwise, use environment variable placeholders).

## .env.example Pattern

Every project with a `.env` MUST have a `.env.example` alongside it:
- Contains all variable names with placeholder values (no real secrets)
- Kept in sync -- when adding a new env var, update `.env.example` in the same change
- If `.env` exists but `.env.example` doesn't -- flag to user and create one (if running interactively; otherwise, create it automatically)

## Supply Chain & Dependency Security

### Node.js (npm / pnpm / yarn)

Every install MUST be followed by:
1. `npm audit` (or `pnpm audit` / `yarn audit`) -- review output, flag critical/high vulnerabilities
2. `npm audit signatures` -- verify package provenance (catches hijacked maintainer accounts)
3. If audit finds issues -- report to user before proceeding (if running interactively; otherwise, log the issues and continue), suggest `npm audit fix` or manual resolution

Lockfile discipline:
- NEVER run install without a lockfile (`package-lock.json` / `pnpm-lock.yaml` / `yarn.lock`)
- If lockfile is missing -- flag to user (if running interactively; otherwise, log a warning), do not blindly generate one
- Review lockfile diffs in commits -- unexpected new packages = red flag

Untrusted / new dependencies:
- Use `--ignore-scripts` when installing unfamiliar packages
- Check package on npmjs.com before adding: download count, maintainers, last publish date
- Prefer well-known packages with active maintenance over low-download alternatives
- Single-maintainer packages with sudden version bumps = suspicious, flag to user (if running interactively; otherwise, log a warning and skip the package)

### Python (pip / uv)

- `pip audit` or `uv pip audit` after install when available
- Pin versions in `requirements.txt` / `pyproject.toml` -- no floating ranges in production
