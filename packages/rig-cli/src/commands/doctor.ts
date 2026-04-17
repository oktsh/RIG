import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { runChecks, Logger } from '@rig/core';
import type { CheckResult, CheckStatus } from '@rig/core';

/**
 * Resolve the content root directory based on @rig/core's package location.
 * Same logic as in generate.ts.
 */
function resolveContentRoot(): string {
  const coreEntry = import.meta.resolve('@rig/core');
  const coreDistDir = dirname(fileURLToPath(coreEntry));
  return join(coreDistDir, '..', 'content');
}

function statusToExitCode(status: CheckStatus): number {
  switch (status) {
    case 'pass': return 0;
    case 'warn': return 1;
    case 'fail': return 2;
  }
}

function printCheckResult(check: CheckResult): void {
  switch (check.status) {
    case 'pass':
      Logger.success(`${check.name}: ${check.message}`);
      break;
    case 'warn':
      Logger.warn(`${check.name}: ${check.message}`);
      if (check.remediation) {
        Logger.dim(`  → ${check.remediation}`);
      }
      break;
    case 'fail':
      Logger.error(`${check.name}: ${check.message}`);
      if (check.remediation) {
        Logger.dim(`  → ${check.remediation}`);
      }
      break;
  }
}

export async function runDoctor(options: { json?: boolean }): Promise<void> {
  const cwd = process.cwd();
  const contentRoot = resolveContentRoot();
  const result = await runChecks(cwd, { contentRoot });

  if (options.json) {
    console.log(JSON.stringify(result.checks, null, 2));
  } else {
    console.log('');
    for (const check of result.checks) {
      printCheckResult(check);
    }
    console.log('');
  }

  process.exit(statusToExitCode(result.overall));
}
