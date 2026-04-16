import { join } from 'node:path';
import { access } from 'node:fs/promises';
import { readFileSafe } from '../../utils/index.js';
import type { CheckResult } from '../types.js';

/**
 * Check 4: dead-references
 * Parse CLAUDE.md for file paths that start with .claude/ or .cursor/,
 * verify they exist on disk.
 * PASS if all refs valid, WARN if any dead refs.
 */
export async function checkDeadReferences(dir: string): Promise<CheckResult> {
  const claudeMd = await readFileSafe(join(dir, 'CLAUDE.md'));

  if (claudeMd === null) {
    return {
      name: 'dead-references',
      status: 'pass',
      message: 'No CLAUDE.md found — nothing to check',
    };
  }

  // Match paths like .claude/agents/foo.md or .cursor/rules/bar.mdc
  // Look for backtick-wrapped or standalone paths starting with .claude/ or .cursor/
  const pathPattern = /(?:`|^|\s)(\.(?:claude|cursor)\/[^\s`\n,)]+)/gm;
  const refs = new Set<string>();

  let match: RegExpExecArray | null;
  while ((match = pathPattern.exec(claudeMd)) !== null) {
    const ref = match[1];
    // Skip glob patterns and wildcards
    if (ref.includes('*') || ref.includes('{')) continue;
    // Strip trailing punctuation
    const cleaned = ref.replace(/[.,:;!?)]+$/, '');
    refs.add(cleaned);
  }

  if (refs.size === 0) {
    return {
      name: 'dead-references',
      status: 'pass',
      message: 'No file references found in CLAUDE.md',
    };
  }

  const dead: string[] = [];
  for (const ref of refs) {
    try {
      await access(join(dir, ref));
    } catch {
      dead.push(ref);
    }
  }

  if (dead.length > 0) {
    return {
      name: 'dead-references',
      status: 'warn',
      message: `${dead.length} dead reference(s) found in CLAUDE.md`,
      remediation: `Remove or fix references to: ${dead.join(', ')}`,
    };
  }

  return {
    name: 'dead-references',
    status: 'pass',
    message: `All ${refs.size} file references in CLAUDE.md are valid`,
  };
}
