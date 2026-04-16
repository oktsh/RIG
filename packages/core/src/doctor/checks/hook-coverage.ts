import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import type { CheckResult } from '../types.js';

/**
 * Check 3: hook-coverage
 * Check .claude/hooks/ exists and has at least one hook file.
 * PASS if present, FAIL if missing.
 */
export async function checkHookCoverage(dir: string): Promise<CheckResult> {
  const hooksDir = join(dir, '.claude', 'hooks');

  let files: string[];
  try {
    files = await readdir(hooksDir);
  } catch {
    return {
      name: 'hook-coverage',
      status: 'fail',
      message: 'No .claude/hooks/ directory found',
      remediation: 'Run `rig generate` to create hooks.',
    };
  }

  const hookFiles = files.filter((f) => !f.startsWith('.'));

  if (hookFiles.length === 0) {
    return {
      name: 'hook-coverage',
      status: 'fail',
      message: '.claude/hooks/ exists but contains no hook files',
      remediation: 'Run `rig generate` to create hooks.',
    };
  }

  return {
    name: 'hook-coverage',
    status: 'pass',
    message: `Pre-commit hooks are installed (${hookFiles.length} file${hookFiles.length === 1 ? '' : 's'})`,
  };
}
