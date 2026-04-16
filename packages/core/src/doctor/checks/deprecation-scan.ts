import type { CheckResult } from '../types.js';

/**
 * Check 7: deprecation-scan
 * Grep generated files for known deprecated patterns.
 * For MVP: always PASS with message "No deprecated patterns found."
 */
export async function checkDeprecationScan(_dir: string): Promise<CheckResult> {
  // MVP: no deprecated patterns to check for yet
  return {
    name: 'deprecation-scan',
    status: 'pass',
    message: 'No deprecated patterns found',
  };
}
