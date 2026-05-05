import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  checkForUpdates,
  performUpdate,
  loadSourceRegistry,
  explainUpdates,
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
 * prints a diff plan, and applies changes (unless --dry-run or --check).
 */
export async function runUpdate(options: { check?: boolean; dryRun?: boolean; component?: string }): Promise<void> {
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

  // 5. --check mode: explain WHY rules need updating using sources registry
  if (options.check) {
    try {
      const registry = await loadSourceRegistry(contentRoot);
      const checkResult = explainUpdates(plan, registry);

      console.log('');
      Logger.info(`Update available: ${plan.currentVersion} → ${plan.newVersion}`);
      console.log('');

      if (checkResult.affectedRules.length > 0) {
        Logger.info(checkResult.summary);
        console.log('');

        for (const rule of checkResult.affectedRules) {
          Logger.warn(`  ${rule.ruleId} (${rule.file})`);
          Logger.dim(`    Reason: ${rule.reason}`);
          Logger.dim(`    Assumptions to verify:`);
          for (const assumption of rule.assumptions) {
            Logger.dim(`      • ${assumption}`);
          }
          console.log('');
        }
      } else {
        // Changes exist but no source-mapped rules affected
        const totalFiles = plan.changes.reduce((sum, c) => sum + c.files.length, 0);
        Logger.info(`${totalFiles} file${totalFiles === 1 ? '' : 's'} updated (content improvements).`);
        console.log('');
        for (const change of plan.changes) {
          const fileCount = change.files.length;
          Logger.dim(`  ${change.component}: ${fileCount} file${fileCount === 1 ? '' : 's'}`);
        }
      }

      console.log('');
      Logger.dim('Run `gyrd update` to apply, or `gyrd update --dry-run` for file-level details.');
      console.log('');
    } catch {
      // Fallback to basic plan if sources registry not available
      Logger.info(`Update available: ${plan.currentVersion} → ${plan.newVersion}`);
      for (const change of plan.changes) {
        const fileCount = change.files.length;
        Logger.dim(`  ${change.component}: ${fileCount} file${fileCount === 1 ? '' : 's'} changed`);
      }
      console.log('');
      Logger.dim('Run `gyrd update` to apply.');
    }
    return;
  }

  // 6. Print update plan
  console.log('');
  Logger.info(`Update available: ${plan.currentVersion} → ${plan.newVersion}`);
  console.log('');
  for (const change of plan.changes) {
    const fileCount = change.files.length;
    Logger.dim(`  ${change.component}: ${fileCount} file${fileCount === 1 ? '' : 's'} changed`);
  }
  console.log('');

  // 7. Dry run — show what would change, exit
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

  // 8. Apply update
  let result: UpdateResult;
  try {
    result = await performUpdate(cwd, { ...options, contentRoot });
  } catch (err) {
    Logger.error(`Update failed: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }

  // 9. Print results
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
