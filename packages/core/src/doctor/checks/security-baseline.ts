import { join } from 'node:path';
import { readFileSafe } from '../../utils/index.js';
import type { CheckResult } from '../types.js';

const REQUIRED_PATTERNS = ['.env*', '*.pem', '*.key'] as const;

/**
 * Check 8: security-baseline
 * Check .gitignore exists and covers: .env*, *.pem, *.key.
 * PASS if all covered, WARN if missing patterns.
 */
export async function checkSecurityBaseline(dir: string): Promise<CheckResult> {
  const gitignore = await readFileSafe(join(dir, '.gitignore'));

  if (gitignore === null) {
    return {
      name: 'security-baseline',
      status: 'warn',
      message: 'No .gitignore file found',
      remediation: `Add a .gitignore with: ${REQUIRED_PATTERNS.join(', ')}`,
    };
  }

  const lines = gitignore.split('\n').map((l) => l.trim());
  const missing: string[] = [];

  for (const pattern of REQUIRED_PATTERNS) {
    // Check if the pattern (or a more general version) is in .gitignore
    const covered = lines.some((line) => {
      if (line.startsWith('#') || line === '') return false;
      // Exact match
      if (line === pattern) return true;
      // .env* could be covered by .env or .env*
      if (pattern === '.env*' && (line === '.env' || line === '.env*' || line === '.env.*')) return true;
      return false;
    });

    if (!covered) {
      missing.push(pattern);
    }
  }

  if (missing.length > 0) {
    return {
      name: 'security-baseline',
      status: 'warn',
      message: `${missing.length} security pattern(s) missing from .gitignore: ${missing.join(', ')}`,
      remediation: `Add missing patterns to .gitignore: ${missing.join(', ')}`,
    };
  }

  return {
    name: 'security-baseline',
    status: 'pass',
    message: 'All required security patterns are in .gitignore',
  };
}
