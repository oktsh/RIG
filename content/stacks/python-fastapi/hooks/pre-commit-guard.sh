#!/usr/bin/env bash
# RIG pre-commit hook — Python / FastAPI
# Auto-detects toolchain (venv, uv, global) and runs ruff + mypy before commit.
# Exit non-zero blocks the commit.

set -euo pipefail

# CI-safe: no colors when not a TTY, no interactive prompts
if [ ! -t 1 ]; then
  export NO_COLOR=1
fi

ERRORS=()

# --- Detect ruff: .venv > uv > global ---
if [[ -x ".venv/bin/ruff" ]]; then
  RUFF_CMD=".venv/bin/ruff"
elif [[ -f "uv.lock" ]] && command -v uv >/dev/null 2>&1; then
  RUFF_CMD="uv run ruff"
elif command -v ruff >/dev/null 2>&1; then
  RUFF_CMD="ruff"
else
  RUFF_CMD=""
fi

# --- Detect mypy: .venv > uv > global ---
if [[ -x ".venv/bin/mypy" ]]; then
  MYPY_CMD=".venv/bin/mypy"
elif [[ -f "uv.lock" ]] && command -v uv >/dev/null 2>&1; then
  MYPY_CMD="uv run mypy"
elif command -v mypy >/dev/null 2>&1; then
  MYPY_CMD="mypy"
else
  MYPY_CMD=""
fi

# --- Ruff lint ---
if [[ -n "$RUFF_CMD" ]]; then
  echo "[rig] Running $RUFF_CMD check..."
  if ! $RUFF_CMD check . 2>&1; then
    ERRORS+=("Ruff lint failed — run '$RUFF_CMD check .' to see details")
  fi
else
  echo "[rig] ruff not found. Skipping lint."
fi

# --- Mypy typecheck ---
if [[ -n "$MYPY_CMD" ]]; then
  echo "[rig] Running $MYPY_CMD..."
  if ! $MYPY_CMD . 2>&1; then
    ERRORS+=("Mypy failed — run '$MYPY_CMD .' to see details")
  fi
else
  echo "[rig] mypy not found. Skipping typecheck."
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
