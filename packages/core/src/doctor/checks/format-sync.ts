import { join } from 'node:path';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { generateProject } from '../../generator/index.js';
import { computeHash } from '../../utils/index.js';
import { readFileSafe } from '../../utils/index.js';
import type { GyrdConfig } from '../../schemas/index.js';
import type { CheckResult } from '../types.js';

const FORMAT_FILES = ['CLAUDE.md', 'AGENTS.md'] as const;

/**
 * Check 2: format-sync
 * Generate files in temp dir (same config), compare key file hashes against disk.
 * PASS if same, WARN if drifted.
 */
export async function checkFormatSync(
  dir: string,
  config: GyrdConfig,
  contentRoot?: string,
): Promise<CheckResult> {
  const tempDir = await mkdtemp(join(tmpdir(), 'rig-doctor-'));

  try {
    const genResult = await generateProject(config, tempDir, { contentRoot });

    const drifted: string[] = [];

    for (const formatFile of FORMAT_FILES) {
      const generated = genResult.files.find((f) => f.path === formatFile);
      if (!generated) continue;

      const diskContent = await readFileSafe(join(dir, formatFile));
      if (diskContent === null) {
        drifted.push(formatFile);
        continue;
      }

      const diskHash = computeHash(diskContent);
      const genHash = computeHash(generated.content);

      if (diskHash !== genHash) {
        drifted.push(formatFile);
      }
    }

    if (drifted.length > 0) {
      return {
        name: 'format-sync',
        status: 'warn',
        message: `${drifted.length} format file(s) have drifted: ${drifted.join(', ')}`,
        remediation: 'Run `gyrd generate` to sync.',
      };
    }

    return {
      name: 'format-sync',
      status: 'pass',
      message: 'All format files are in sync',
    };
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}
