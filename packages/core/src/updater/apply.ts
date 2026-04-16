import { join } from 'node:path';
import { unlink } from 'node:fs/promises';
import type { Manifest } from '../schemas/index.js';
import type { UpdatePlan, UpdateResult, FileChange } from './types.js';
import { computeHash } from '../utils/index.js';
import { readFileSafe, writeFileAtomic } from '../utils/index.js';
import { writeManifest } from '../manifest/index.js';
import { mergeClaudeMd } from './claude-md-merge.js';
import { isUnmanagedFile } from './safety.js';

/**
 * Apply an update plan to a project directory.
 *
 * `newDir` is the temp directory where the new version was generated.
 *
 * For each FileChange in the plan:
 * 1. If `component` filter set and doesn't match -> skip
 * 2. If `dryRun` -> don't write, just report what would change
 * 3. If file is customized (disk hash != manifest hash):
 *    - If it's CLAUDE.md -> use mergeClaudeMd() (merge strategy)
 *    - Otherwise -> skip, add to `skipped` list
 * 4. If file is NOT customized -> overwrite with new content from newDir
 * 5. After applying all changes, rebuild and write manifest
 */
export async function applyUpdate(
  plan: UpdatePlan,
  dir: string,
  newDir: string,
  currentManifest: Manifest,
  newManifest: Manifest,
  options?: { dryRun?: boolean; component?: string },
): Promise<UpdateResult> {
  const applied: FileChange[] = [];
  const skipped: FileChange[] = [];
  const errors: { path: string; error: string }[] = [];

  for (const change of plan.changes) {
    // Component filter
    if (options?.component && change.component !== options.component) {
      continue;
    }

    for (const file of change.files) {
      // Safety check: never update unmanaged files
      if (isUnmanagedFile(file.path, currentManifest) && file.action !== 'add') {
        skipped.push(file);
        continue;
      }

      if (options?.dryRun) {
        applied.push(file);
        continue;
      }

      try {
        if (file.customized) {
          if (file.path === 'CLAUDE.md') {
            // Merge strategy for CLAUDE.md
            await applyCLAUDEMdMerge(file, dir, newDir);
            applied.push(file);
          } else {
            // Non-CLAUDE.md customized files: skip
            skipped.push(file);
          }
        } else if (file.action === 'remove') {
          await removeFile(dir, file.path);
          applied.push(file);
        } else {
          // add or update: copy from newDir
          await copyFromNew(dir, newDir, file.path);
          applied.push(file);
        }
      } catch (err) {
        errors.push({
          path: file.path,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
  }

  // Rebuild manifest after applying changes (unless dry run)
  if (!options?.dryRun && applied.length > 0) {
    const updatedFiles = { ...currentManifest.files };

    for (const file of applied) {
      if (file.action === 'remove') {
        delete updatedFiles[file.path];
      } else {
        const content = await readFileSafe(join(dir, file.path));
        if (content !== null) {
          updatedFiles[file.path] = computeHash(content);
        }
      }
    }

    const updatedManifest: Manifest = {
      ...newManifest,
      files: updatedFiles,
    };
    await writeManifest(dir, updatedManifest);
  }

  return {
    applied,
    skipped,
    errors,
    summary: {
      whatsNew: applied.filter((f) => f.action === 'add').map((f) => f.path),
      whatChanged: applied.filter((f) => f.action === 'update').map((f) => f.path),
      whatToReview: skipped.filter((f) => f.customized).map((f) => f.path),
      migrationNotes: [],
    },
  };
}

async function applyCLAUDEMdMerge(
  _file: FileChange,
  dir: string,
  newDir: string,
): Promise<void> {
  const existingContent = await readFileSafe(join(dir, 'CLAUDE.md'));
  const newContent = await readFileSafe(join(newDir, 'CLAUDE.md'));
  if (existingContent !== null && newContent !== null) {
    const merged = mergeClaudeMd(existingContent, newContent);
    await writeFileAtomic(join(dir, 'CLAUDE.md'), merged);
  }
}

async function removeFile(dir: string, path: string): Promise<void> {
  try {
    await unlink(join(dir, path));
  } catch {
    // File may already be gone
  }
}

async function copyFromNew(dir: string, newDir: string, path: string): Promise<void> {
  const newContent = await readFileSafe(join(newDir, path));
  if (newContent === null) {
    throw new Error(`New file not found: ${path}`);
  }
  await writeFileAtomic(join(dir, path), newContent);
}
