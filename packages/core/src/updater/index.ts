import { join } from 'node:path';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { readManifest } from '../manifest/index.js';
import { generateProject } from '../generator/index.js';
import { VERSION } from '../constants.js';
import { compareVersions } from './diff.js';
import { createBackup } from './backup.js';
import { applyUpdate } from './apply.js';
import type { UpdatePlan, UpdateResult } from './types.js';

/**
 * Clean parsed TOML data before Zod validation.
 *
 * Generated rig.toml files may have empty strings for optional enum fields
 * (e.g. default_memory = "") that would fail Zod validation. Remove these
 * so that Zod defaults kick in.
 */
function cleanParsedConfig(data: Record<string, unknown>): Record<string, unknown> {
  const cleaned = { ...data };

  for (const key of ['agents', 'hooks', 'formats', 'updates']) {
    if (cleaned[key] && typeof cleaned[key] === 'object') {
      const section = { ...(cleaned[key] as Record<string, unknown>) };
      let hasValues = false;

      for (const [k, v] of Object.entries(section)) {
        if (v === '' || (Array.isArray(v) && v.length === 0)) {
          delete section[k];
        } else {
          hasValues = true;
        }
      }

      if (hasValues) {
        cleaned[key] = section;
      } else {
        delete cleaned[key];
      }
    }
  }

  return cleaned;
}

/**
 * Parse the rig.toml config from a project directory.
 * Uses @iarna/toml since that's what the project already depends on.
 * Cleans empty values from optional enum fields before returning.
 */
async function loadProjectConfig(dir: string): Promise<Record<string, unknown>> {
  const { readFileSafe } = await import('../utils/index.js');
  const tomlContent = await readFileSafe(join(dir, 'rig.toml'));
  if (!tomlContent) {
    throw new Error('No rig.toml found — is this a RIG project?');
  }
  const TOML = await import('@iarna/toml');
  const parsed = TOML.parse(tomlContent) as Record<string, unknown>;
  return cleanParsedConfig(parsed);
}

/**
 * Check what would change if the project were updated to the latest version.
 *
 * 1. Read manifest from dir
 * 2. Generate new project in temp dir (same config, new version)
 * 3. Compare manifests -> UpdatePlan
 */
export async function checkForUpdates(
  dir: string,
  options?: { contentRoot?: string },
): Promise<UpdatePlan> {
  const currentManifest = await readManifest(dir);
  if (!currentManifest) {
    throw new Error('No manifest found — run `rig generate` first');
  }

  const config = await loadProjectConfig(dir);

  // Generate new version in temp directory
  const tempDir = await mkdtemp(join(tmpdir(), 'rig-update-'));
  try {
    await generateProject(config as Parameters<typeof generateProject>[0], tempDir, {
      version: VERSION,
      contentRoot: options?.contentRoot,
    });

    const newManifest = await readManifest(tempDir);
    if (!newManifest) {
      throw new Error('Failed to generate new manifest');
    }

    return compareVersions(currentManifest, newManifest, dir);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

/**
 * Perform a full update:
 *
 * 1. Check for updates
 * 2. If changes exist: create backup
 * 3. Apply updates
 * 4. Build UpdateSummary
 * 5. Return UpdateResult
 */
export async function performUpdate(
  dir: string,
  options?: { dryRun?: boolean; component?: string; contentRoot?: string },
): Promise<UpdateResult> {
  const currentManifest = await readManifest(dir);
  if (!currentManifest) {
    throw new Error('No manifest found — run `rig generate` first');
  }

  const config = await loadProjectConfig(dir);

  // Generate new version in temp directory
  const tempDir = await mkdtemp(join(tmpdir(), 'rig-update-'));
  try {
    await generateProject(config as Parameters<typeof generateProject>[0], tempDir, {
      version: VERSION,
      contentRoot: options?.contentRoot,
    });

    const newManifest = await readManifest(tempDir);
    if (!newManifest) {
      throw new Error('Failed to generate new manifest');
    }

    const plan = await compareVersions(currentManifest, newManifest, dir);

    if (!plan.hasChanges) {
      return {
        applied: [],
        skipped: [],
        errors: [],
        summary: {
          whatsNew: [],
          whatChanged: [],
          whatToReview: [],
          migrationNotes: [],
        },
      };
    }

    // Create backup (unless dry run)
    let backupPath: string | undefined;
    if (!options?.dryRun) {
      backupPath = await createBackup(dir, currentManifest);
    }

    const result = await applyUpdate(
      plan,
      dir,
      tempDir,
      currentManifest,
      newManifest,
      options,
    );

    result.backupPath = backupPath;

    return result;
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}
