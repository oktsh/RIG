import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, writeFile, readFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { generateProject } from '../../generator/index.js';
import { readManifest } from '../../manifest/index.js';
import { compareVersions } from '../diff.js';
import { applyUpdate } from '../apply.js';
import type { GyrdConfig } from '../../schemas/index.js';

const TEST_CONFIG: GyrdConfig = {
  project: {
    name: 'test-integration',
    preset: 'solo-dev',
    stack: 'nextjs',
  },
};

// Content root is at repo-root/content/
function getContentRoot(): string {
  const thisDir = dirname(fileURLToPath(import.meta.url));
  // __tests__/ -> updater/ -> src/ -> core/ -> packages/ -> GYRD-root/
  return join(thisDir, '..', '..', '..', '..', '..', 'content');
}

const GENERATE_OPTIONS = {
  contentRoot: getContentRoot(),
  generatedAt: '2026-01-01T00:00:00Z',
  version: '0.1.0',
};

describe('updater integration', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'rig-int-test-'));
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
  });

  it('preserves user-modified files while updating others', async () => {
    // Step 1: Generate initial project
    await generateProject(TEST_CONFIG, projectDir, GENERATE_OPTIONS);
    const currentManifest = await readManifest(projectDir);
    expect(currentManifest).not.toBeNull();

    // Step 2: User modifies a rule file
    const ruleFile = join(projectDir, '.claude', 'rules', 'security.md');
    const originalContent = await readFile(ruleFile, 'utf8');
    const userModified = originalContent + '\n\n## My Custom Security Rule\n\nDo not use eval().\n';
    await writeFile(ruleFile, userModified);

    // Step 3: Generate "new version" in a temp dir (simulating an update)
    const newDir = await mkdtemp(join(tmpdir(), 'rig-int-new-'));
    try {
      await generateProject(TEST_CONFIG, newDir, {
        ...GENERATE_OPTIONS,
        version: '0.2.0',
        generatedAt: '2026-02-01T00:00:00Z',
      });
      const newManifest = await readManifest(newDir);
      expect(newManifest).not.toBeNull();

      // Step 4: Compare and apply
      const plan = await compareVersions(currentManifest!, newManifest!, projectDir);

      // There should be changes (version bump changes hashes if version is in content)
      // Even if no content changes, the gyrd.toml will differ due to version not being in files
      // The security.md should be marked as customized
      const securityChange = plan.changes
        .flatMap((c) => c.files)
        .find((f) => f.path === '.claude/rules/security.md');

      if (securityChange) {
        expect(securityChange.customized).toBe(true);
      }

      const result = await applyUpdate(
        plan,
        projectDir,
        newDir,
        currentManifest!,
        newManifest!,
      );

      // The modified security.md should be in skipped (preserved)
      const securitySkipped = result.skipped.find(
        (f) => f.path === '.claude/rules/security.md',
      );
      if (securityChange) {
        expect(securitySkipped).toBeDefined();
      }

      // The user's modification should still be there
      const afterUpdate = await readFile(ruleFile, 'utf8');
      expect(afterUpdate).toContain('My Custom Security Rule');
    } finally {
      await rm(newDir, { recursive: true, force: true });
    }
  });

  it('does not touch PROGRESS.md and memory/ files', async () => {
    // Step 1: Generate initial project
    await generateProject(TEST_CONFIG, projectDir, GENERATE_OPTIONS);

    // Step 2: User creates PROGRESS.md and memory/ files
    await writeFile(join(projectDir, 'PROGRESS.md'), '## In Progress\n- [ ] T001 My task');
    await mkdir(join(projectDir, 'memory'), { recursive: true });
    await writeFile(join(projectDir, 'memory', 'notes.md'), 'My important notes');

    const currentManifest = await readManifest(projectDir);
    expect(currentManifest).not.toBeNull();

    // Step 3: Generate "new version"
    const newDir = await mkdtemp(join(tmpdir(), 'rig-int-new2-'));
    try {
      await generateProject(TEST_CONFIG, newDir, {
        ...GENERATE_OPTIONS,
        version: '0.2.0',
      });
      const newManifest = await readManifest(newDir);
      expect(newManifest).not.toBeNull();

      const plan = await compareVersions(currentManifest!, newManifest!, projectDir);
      await applyUpdate(plan, projectDir, newDir, currentManifest!, newManifest!);

      // PROGRESS.md and memory/ should be untouched
      const progress = await readFile(join(projectDir, 'PROGRESS.md'), 'utf8');
      expect(progress).toContain('T001 My task');

      const notes = await readFile(join(projectDir, 'memory', 'notes.md'), 'utf8');
      expect(notes).toBe('My important notes');
    } finally {
      await rm(newDir, { recursive: true, force: true });
    }
  });

  it('preserves user CLAUDE.md sections while updating GYRD sections', async () => {
    // Step 1: Generate initial project
    await generateProject(TEST_CONFIG, projectDir, GENERATE_OPTIONS);
    const claudeMdPath = join(projectDir, 'CLAUDE.md');

    // Step 2: User adds a custom section
    const originalClaude = await readFile(claudeMdPath, 'utf8');
    const withUserSection =
      originalClaude + '\n## My Team Notes\n\nImportant team information here.\n';
    await writeFile(claudeMdPath, withUserSection);

    const currentManifest = await readManifest(projectDir);
    expect(currentManifest).not.toBeNull();

    // Step 3: Generate "new version"
    const newDir = await mkdtemp(join(tmpdir(), 'rig-int-new3-'));
    try {
      await generateProject(TEST_CONFIG, newDir, {
        ...GENERATE_OPTIONS,
        version: '0.2.0',
      });
      const newManifest = await readManifest(newDir);
      expect(newManifest).not.toBeNull();

      const plan = await compareVersions(currentManifest!, newManifest!, projectDir);

      // CLAUDE.md should be marked as customized
      const claudeChange = plan.changes
        .flatMap((c) => c.files)
        .find((f) => f.path === 'CLAUDE.md');

      if (claudeChange) {
        expect(claudeChange.customized).toBe(true);

        const result = await applyUpdate(
          plan,
          projectDir,
          newDir,
          currentManifest!,
          newManifest!,
        );

        // Should be in applied (merge strategy), not skipped
        const claudeApplied = result.applied.find((f) => f.path === 'CLAUDE.md');
        expect(claudeApplied).toBeDefined();
      }

      // User section should be preserved
      const updatedClaude = await readFile(claudeMdPath, 'utf8');
      expect(updatedClaude).toContain('My Team Notes');
      expect(updatedClaude).toContain('Important team information here.');
      // GYRD sections should still be present
      expect(updatedClaude).toContain('[GYRD-MANAGED]');
    } finally {
      await rm(newDir, { recursive: true, force: true });
    }
  });

  it('UpdateResult contains all 4 summary sections', async () => {
    await generateProject(TEST_CONFIG, projectDir, GENERATE_OPTIONS);
    const currentManifest = await readManifest(projectDir);

    const newDir = await mkdtemp(join(tmpdir(), 'rig-int-new4-'));
    try {
      await generateProject(TEST_CONFIG, newDir, {
        ...GENERATE_OPTIONS,
        version: '0.2.0',
      });
      const newManifest = await readManifest(newDir);

      const plan = await compareVersions(currentManifest!, newManifest!, projectDir);
      const result = await applyUpdate(
        plan,
        projectDir,
        newDir,
        currentManifest!,
        newManifest!,
      );

      // Verify all summary sections exist
      expect(result.summary).toHaveProperty('whatsNew');
      expect(result.summary).toHaveProperty('whatChanged');
      expect(result.summary).toHaveProperty('whatToReview');
      expect(result.summary).toHaveProperty('migrationNotes');
      expect(Array.isArray(result.summary.whatsNew)).toBe(true);
      expect(Array.isArray(result.summary.whatChanged)).toBe(true);
      expect(Array.isArray(result.summary.whatToReview)).toBe(true);
      expect(Array.isArray(result.summary.migrationNotes)).toBe(true);
    } finally {
      await rm(newDir, { recursive: true, force: true });
    }
  });
});
