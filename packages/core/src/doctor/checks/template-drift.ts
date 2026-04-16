import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { computeHash } from '../../utils/index.js';
import type { Manifest } from '../../schemas/index.js';
import type { CheckResult } from '../types.js';

/**
 * Check 6: template-drift
 * Compare .claude/templates/ files against hashes in manifest.
 * PASS if hashes match, WARN if drifted.
 */
export async function checkTemplateDrift(
  dir: string,
  manifest: Manifest | null,
): Promise<CheckResult> {
  const templatesDir = join(dir, '.claude', 'templates');

  let files: string[];
  try {
    files = await readdir(templatesDir);
  } catch {
    return {
      name: 'template-drift',
      status: 'pass',
      message: 'No .claude/templates/ directory — nothing to check',
    };
  }

  if (manifest === null) {
    return {
      name: 'template-drift',
      status: 'warn',
      message: 'No manifest found — cannot verify template hashes',
      remediation: 'Run `rig generate` to create manifest.',
    };
  }

  const templateFiles = files.filter((f) => f.endsWith('.md'));
  if (templateFiles.length === 0) {
    return {
      name: 'template-drift',
      status: 'pass',
      message: 'No template files found',
    };
  }

  const drifted: string[] = [];

  for (const file of templateFiles) {
    const relPath = `.claude/templates/${file}`;
    const expectedHash = manifest.files[relPath];
    if (!expectedHash) continue;

    const content = await readFile(join(templatesDir, file), 'utf8');
    const actualHash = computeHash(content);

    if (actualHash !== expectedHash) {
      drifted.push(file);
    }
  }

  if (drifted.length > 0) {
    return {
      name: 'template-drift',
      status: 'warn',
      message: `${drifted.length} template(s) have drifted: ${drifted.join(', ')}`,
      remediation: 'Run `rig generate` to sync templates.',
    };
  }

  return {
    name: 'template-drift',
    status: 'pass',
    message: `All ${templateFiles.length} templates match manifest hashes`,
  };
}
