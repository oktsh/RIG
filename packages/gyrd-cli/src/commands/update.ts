import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  checkForUpdates,
  performUpdate,
  Logger,
} from '@gyrd/core';
import type { UpdatePlan, UpdateResult } from '@gyrd/core';

/**
 * Resolve the content root directory based on @gyrd/core's package location.
 * Content is shipped inside @gyrd/core at <core>/content/
 */
function resolveContentRoot(): string {
  const coreEntry = import.meta.resolve('@gyrd/core');
  const coreDistDir = dirname(fileURLToPath(coreEntry));
  return join(coreDistDir, '..', 'content');
}

/**
 * Run the `gyrd update` command.
 *
 * Checks the current project against the installed GYRD version,
 * prints a diff plan, and applies changes (unless --dry-run).
 */
export async function runUpdate(options: { dryRun?: boolean; component?: string }): Promise<void> {
  const cwd = process.cwd();
  const contentRoot = resolveContentRoot();

  // 1. Check for gyrd.toml
  if (!existsSync(join(cwd, 'gyrd.toml'))) {
    Logger.error('No gyrd.toml found. Run `gyrd init` first.');
    process.exit(1);
  }

  // 2. Check for manifest
  if (!existsSync(join(cwd, '.gyrd', 'manifest.yaml'))) {
    Logger.error('No manifest found. Run `gyrd generate` first.');
    process.exit(1);
  }

  // 3. Check for updates
  let plan: UpdatePlan;
  try {
    plan = await checkForUpdates(cwd, { contentRoot });
  } catch (err) {
    Logger.error(`Failed to check for updates: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }

  // 4. No changes — already up to date
  if (!plan.hasChanges) {
    Logger.success('Already up to date.');
    return;
  }

  // 5. Print update plan
  console.log('');
  Logger.info(`Update available: ${plan.currentVersion} → ${plan.newVersion}`);
  console.log('');
  for (const change of plan.changes) {
    const fileCount = change.files.length;
    Logger.dim(`  ${change.component}: ${fileCount} file${fileCount === 1 ? '' : 's'} changed`);
  }
  console.log('');

  // 6. Dry run — show what would change, exit
  if (options.dryRun) {
    Logger.info('Dry run — no files modified.');
    console.log('');
    for (const change of plan.changes) {
      for (const file of change.files) {
        const tag = file.customized ? ' (customized — would skip)' : '';
        Logger.dim(`  ${file.action} ${file.path}${tag}`);
      }
    }
    console.log('');
    return;
  }

  // 7. Apply update
  let result: UpdateResult;
  try {
    result = await performUpdate(cwd, { ...options, contentRoot });
  } catch (err) {
    Logger.error(`Update failed: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }

  // 8. Print results
  console.log('');

  if (result.applied.length > 0) {
    Logger.success(`Updated ${result.applied.length} file${result.applied.length === 1 ? '' : 's'}`);
  }

  if (result.skipped.length > 0) {
    Logger.warn(`Skipped ${result.skipped.length} customized file${result.skipped.length === 1 ? '' : 's'}`);
    for (const file of result.skipped) {
      Logger.dim(`  ${file.path}`);
    }
  }

  if (result.errors.length > 0) {
    Logger.error(`Errors: ${result.errors.length}`);
    for (const err of result.errors) {
      Logger.dim(`  ${err.path}: ${err.error}`);
    }
  }

  // Print summary sections
  const { summary } = result;
  if (summary.whatsNew.length > 0) {
    console.log('');
    Logger.info("What's new:");
    Logger.summary(summary.whatsNew);
  }
  if (summary.whatChanged.length > 0) {
    console.log('');
    Logger.info('What changed:');
    Logger.summary(summary.whatChanged);
  }
  if (summary.whatToReview.length > 0) {
    console.log('');
    Logger.warn('What to review:');
    Logger.summary(summary.whatToReview);
  }
  if (summary.migrationNotes.length > 0) {
    console.log('');
    Logger.warn('Migration notes:');
    Logger.summary(summary.migrationNotes);
  }

  if (result.backupPath) {
    console.log('');
    Logger.dim(`Backup at: ${result.backupPath}`);
  }

  console.log('');
}
