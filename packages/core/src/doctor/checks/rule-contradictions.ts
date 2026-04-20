import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import type { CheckResult } from '../types.js';

// Core rules that should always exist in a GYRD project
const EXPECTED_CORE_RULES = [
  'agent-orchestration',
  'context-discipline',
  'security',
  'tool-gate',
] as const;

/**
 * Check 5: rule-contradictions
 * Check if rules/ exists and has at least the expected core rules.
 * PASS if all present, WARN if some missing.
 */
export async function checkRuleContradictions(dir: string): Promise<CheckResult> {
  const rulesDir = join(dir, '.claude', 'rules');

  let files: string[];
  try {
    files = await readdir(rulesDir);
  } catch {
    return {
      name: 'rule-contradictions',
      status: 'warn',
      message: 'No .claude/rules/ directory found',
      remediation: 'Run `gyrd generate` to create rules.',
    };
  }

  const ruleNames = files
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace('.md', ''));

  const missing = EXPECTED_CORE_RULES.filter((r) => !ruleNames.includes(r));

  if (missing.length > 0) {
    return {
      name: 'rule-contradictions',
      status: 'warn',
      message: `${missing.length} core rule(s) missing: ${missing.join(', ')}`,
      remediation: 'Run `gyrd generate` to recreate missing rules.',
    };
  }

  return {
    name: 'rule-contradictions',
    status: 'pass',
    message: `All ${EXPECTED_CORE_RULES.length} core rules are present`,
  };
}
