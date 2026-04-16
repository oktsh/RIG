# Stack Rules — Next.js / TypeScript

## Package Manager Detection

Detection order:
1. `pnpm-lock.yaml` — use `pnpm`
2. `yarn.lock` — use `yarn`
3. `package-lock.json` — use `npm`
4. Fallback: `npm`

Commands:
- Install: `$PKG_MGR install`
- Run script: `$PKG_MGR run <script>`
- Execute binary: `pnpm exec` / `yarn` / `npx`

## TypeScript

- Strict mode enabled. No `any` unless documented with a comment explaining why.
- Use `import type` for type-only imports (`verbatimModuleSyntax`).
- Explicit return types on exported functions.
- No unused locals (`noUnusedLocals`).

## Next.js

- App Router (`app/` directory). No Pages Router.
- Server Components by default. Add `'use client'` only when needed (hooks, event handlers, browser APIs).
- Use `next/image` for images. Use `next/link` for navigation.
- API routes in `app/api/` use Route Handlers (`route.ts`).

## Quality Commands

```bash
# Lint
$PKG_MGR run lint

# Typecheck
$PKG_MGR run typecheck    # if script exists
npx tsc --noEmit          # fallback

# Test
$PKG_MGR run test         # vitest / jest

# Build
$PKG_MGR run build        # production build (catches SSR issues)
```

## Common Patterns

- Absolute imports via `@/` alias (configured in `tsconfig.json`).
- Co-located files: component + test + styles in the same directory.
- Barrel exports (`index.ts`) for component directories.
- Environment variables: `NEXT_PUBLIC_` prefix for client-side access.
