#!/usr/bin/env bash
# RIG pre-commit hook — Next.js / TypeScript
# Auto-detects package manager and runs lint + typecheck before commit.
# Exit non-zero blocks the commit.

set -euo pipefail

# --- Detect package manager ---
if [[ -f "pnpm-lock.yaml" ]]; then
  PKG_MGR="pnpm"
  EXEC="pnpm exec"
elif [[ -f "yarn.lock" ]]; then
  PKG_MGR="yarn"
  EXEC="yarn"
elif [[ -f "package-lock.json" ]]; then
  PKG_MGR="npm"
  EXEC="npx"
else
  echo "[rig] No lockfile found. Skipping pre-commit checks."
  exit 0
fi

ERRORS=()

# --- Lint ---
if [[ -f "package.json" ]] && grep -q '"lint"' package.json 2>/dev/null; then
  echo "[rig] Running $PKG_MGR run lint..."
  if ! $PKG_MGR run lint --silent 2>&1; then
    ERRORS+=("Lint failed — run '$PKG_MGR run lint' to see details")
  fi
fi

# --- Typecheck ---
if [[ -f "package.json" ]] && grep -q '"typecheck"' package.json 2>/dev/null; then
  echo "[rig] Running $PKG_MGR run typecheck..."
  if ! $PKG_MGR run typecheck --silent 2>&1; then
    ERRORS+=("Typecheck failed — run '$PKG_MGR run typecheck' to see details")
  fi
elif [[ -f "tsconfig.json" ]]; then
  echo "[rig] Running $EXEC tsc --noEmit..."
  if ! $EXEC tsc --noEmit 2>&1; then
    ERRORS+=("Typecheck failed — run '$EXEC tsc --noEmit' to see details")
  fi
fi

# --- Result ---
if [[ ${#ERRORS[@]} -gt 0 ]]; then
  echo ""
  echo "[rig] Pre-commit checks FAILED:"
  for err in "${ERRORS[@]}"; do
    echo "  - $err"
  done
  echo ""
  echo "Fix the issues above before committing."
  exit 1
fi

echo "[rig] All checks passed."
exit 0
