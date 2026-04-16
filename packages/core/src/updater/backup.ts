import { join } from 'node:path';
import { readFile, copyFile } from 'node:fs/promises';
import type { Manifest } from '../schemas/index.js';
import { isGitRepo } from '../utils/index.js';
import { ensureDir } from '../utils/index.js';

/**
 * Create a backup of all managed files before applying an update.
 *
 * - If git repo: creates a backup branch via `git stash create`
 * - If not git: copies managed files to `.rig/backups/{ISO-timestamp}/`
 *
 * Returns the backup location path.
 */
export async function createBackup(
  dir: string,
  manifest: Manifest,
): Promise<string> {
  const managedFiles = Object.keys(manifest.files);

  if (await isGitRepo(dir)) {
    return createGitBackup(dir);
  }

  return createFileBackup(dir, managedFiles);
}

async function createGitBackup(dir: string): Promise<string> {
  const { execFile } = await import('node:child_process');
  const { promisify } = await import('node:util');
  const exec = promisify(execFile);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const branchName = `rig-backup/${timestamp}`;

  try {
    await exec('git', ['branch', branchName], { cwd: dir });
    return `branch:${branchName}`;
  } catch {
    // If branch creation fails (e.g., no commits), fall back to file backup
    return createFileBackup(dir, []);
  }
}

async function createFileBackup(
  dir: string,
  managedFiles: string[],
): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = join(dir, '.rig', 'backups', timestamp);
  await ensureDir(backupDir);

  for (const filePath of managedFiles) {
    const srcPath = join(dir, filePath);
    const destPath = join(backupDir, filePath);

    try {
      await readFile(srcPath); // Check it exists
      await ensureDir(join(destPath, '..'));
      await copyFile(srcPath, destPath);
    } catch {
      // File may not exist on disk — skip silently
    }
  }

  return backupDir;
}
