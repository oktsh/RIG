import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { AgentFrontmatterSchema } from '../../schemas/index.js';
import type { CheckResult } from '../types.js';

/**
 * Check 1: schema-freshness
 * Read agent files in .claude/agents/, parse frontmatter, validate against AgentFrontmatterSchema.
 * PASS if all valid, FAIL if any invalid.
 */
export async function checkSchemaFreshness(dir: string): Promise<CheckResult> {
  const agentsDir = join(dir, '.claude', 'agents');

  let files: string[];
  try {
    files = await readdir(agentsDir);
  } catch {
    return {
      name: 'schema-freshness',
      status: 'pass',
      message: 'No agents directory found — nothing to validate',
    };
  }

  const mdFiles = files.filter((f) => f.endsWith('.md'));
  if (mdFiles.length === 0) {
    return {
      name: 'schema-freshness',
      status: 'pass',
      message: 'No agent files found — nothing to validate',
    };
  }

  const invalid: string[] = [];

  for (const file of mdFiles) {
    const content = await readFile(join(agentsDir, file), 'utf8');
    const frontmatter = extractFrontmatter(content);
    if (frontmatter === null) {
      invalid.push(file);
      continue;
    }

    const result = AgentFrontmatterSchema.safeParse(frontmatter);
    if (!result.success) {
      invalid.push(file);
    }
  }

  if (invalid.length > 0) {
    return {
      name: 'schema-freshness',
      status: 'fail',
      message: `${invalid.length} agent file(s) have invalid schema: ${invalid.join(', ')}`,
      remediation: 'Run `rig generate` to regenerate agent files.',
    };
  }

  return {
    name: 'schema-freshness',
    status: 'pass',
    message: `All ${mdFiles.length} agent schemas are valid`,
  };
}

function extractFrontmatter(content: string): Record<string, unknown> | null {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  try {
    return parseYaml(match[1]) as Record<string, unknown>;
  } catch {
    return null;
  }
}
