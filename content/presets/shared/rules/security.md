# Security Rules

## Secrets Protection

Never read or print: `.env*`, `*.pem`, `*.key`, `*.crt`, `secrets/**`, `credentials/**`, `**/secret*`

If secrets are needed: ask for mock values, stub data, or environment variable names only (if running interactively; otherwise, use environment variable placeholders).

## .env.example Pattern

Every project with a `.env` MUST have a `.env.example`:
- All variable names with placeholder values (no real secrets)
- Kept in sync — when adding a new env var, update `.env.example` in the same change
- If `.env` exists but `.env.example` doesn't — flag and create one

## Code-Level Security Checks

When reviewing or writing code, check for:
- **Injection**: SQL, XSS, command injection, path traversal — validate all external input
- **Auth**: Missing auth checks, hardcoded secrets, token leaks in logs or error responses
- **Data exposure**: PII in logs, internal errors returned to client, secrets in committed config
- **Access control**: Can user A access user B's resources? Check every endpoint.
- **Deserialization**: Unvalidated structured input from external sources (JSON.parse, pickle, yaml.load)

### Dangerous Code Patterns (BLOCK on sight)

These patterns are the most common AI-generated vulnerabilities (Stanford SWE-chat, 6K sessions: vibe coding = 0.76 vulns per 1,000 lines).

**NEVER write these. If you see them in existing code, flag immediately:**

| Pattern | Why dangerous | Safe alternative |
|---------|--------------|-----------------|
| `subprocess.run(cmd, shell=True)` | Command injection (CWE-78) | `subprocess.run([cmd, arg1, arg2], shell=False)` |
| `os.system(user_input)` | Command injection | `subprocess.run()` with argument list |
| `eval(user_input)` / `exec(user_input)` | Arbitrary code execution | Parse with safe parser (JSON.parse, ast.literal_eval) |
| `f"SELECT * FROM {table}"` | SQL injection (CWE-89) | Parameterized queries: `cursor.execute("SELECT * FROM ?", (table,))` |
| `innerHTML = user_data` | XSS (CWE-79) | `textContent` or sanitize with DOMPurify |
| `path.join(base, user_input)` without validation | Path traversal (CWE-22) | Validate: `resolved.startsWith(base)` after resolve |
| `yaml.load(data)` without Loader | Arbitrary code execution | `yaml.safe_load(data)` |
| `pickle.loads(untrusted_data)` | Arbitrary code execution | Use JSON or msgpack for untrusted data |
| `chmod 777` / world-writable files | Permission escalation | Use minimal permissions (644 files, 755 dirs) |
| Hardcoded API keys / passwords in source | Credential exposure | Environment variables or secret manager |

### What NOT to Flag (False-Positive Exclusion)

Do not report these categories — they waste time and erode trust in security reviews:
- DoS / rate limiting (infrastructure concern, not code-level)
- Theoretical memory consumption without a specific exploit path
- Regex denial of service without proof of catastrophic backtracking
- "Could be vulnerable if..." without a concrete, reproducible attack vector
- Timing attacks on non-cryptographic operations
- Missing CSRF on API-only endpoints with token auth
- CORS configuration on internal-only services
- Missing security headers on non-browser APIs
- Prototype pollution without a reachable gadget chain
- Information disclosure via stack traces in development mode
- Use of eval/exec in build tooling (webpack, vite configs)
- Password requirements/complexity rules (UX decision, not a vulnerability)

Only flag findings with >80% confidence of real exploitability.

## Supply Chain Security

### Node.js (npm / pnpm / yarn)

Every install MUST be followed by:
1. `pnpm audit` (or npm/yarn equivalent) — flag critical/high vulnerabilities
2. `npm audit signatures` — verify package provenance
3. If issues found — report before proceeding (if interactive); log and continue (if autonomous)

Lockfile discipline:
- NEVER install without a lockfile present
- Missing lockfile = flag to user, do not generate one blindly
- Review lockfile diffs — unexpected new packages = red flag

New/untrusted dependencies:
- Use `--ignore-scripts` when installing unfamiliar packages
- Check npmjs.com: download count, maintainers, last publish date
- Prefer well-maintained packages. Single-maintainer + sudden version bumps = suspicious.

### Python (pip / uv)

- `pip audit` or `uv pip audit` after install
- Pin versions in `requirements.txt` / `pyproject.toml` — no floating ranges in production
