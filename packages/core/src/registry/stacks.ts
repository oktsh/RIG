import type { HookDef, RuleDef } from './types.js';

export interface StackOverlay {
  hooks: HookDef[];
  rules: RuleDef[];
}

export const STACK_OVERLAYS: Record<'nextjs' | 'python-fastapi', StackOverlay> = {
  nextjs: {
    hooks: [
      { id: 'pre-commit-guard-npm', stack: 'nextjs', filename: 'pre-commit-guard.sh' },
    ],
    rules: [
      { id: 'nextjs-stack-rules', preset: 'shared', filename: 'stack-rules.md' },
    ],
  },
  'python-fastapi': {
    hooks: [
      { id: 'pre-commit-guard-ruff', stack: 'python-fastapi', filename: 'pre-commit-guard.sh' },
    ],
    rules: [
      { id: 'python-stack-rules', preset: 'shared', filename: 'stack-rules.md' },
    ],
  },
};
