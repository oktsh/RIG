import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { compareVersions } from '../diff.js';
import { computeHash } from '../../utils/index.js';
import type { Manifest } from '../../schemas/index.js';

function makeManifest(
  files: Record<string, string>,
  version = '0.1.0',
): Manifest {
  return {
    rig_version: version,
    generated_at: '2026-01-01T00:00:00Z',
    config_hash: 'abc123',
    components: {
      agents: { version, count: 0, schema: 'agent-frontmatter-v1' },
      hooks: { version, count: 0 },
      rules: { version, count: 0 },
      formats: {},
      templates: { version, count: 0 },
    },
    compatibility: {},
    files,
  };
}

describe('compareVersions', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'rig-diff-test-'));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('detects added files (in new but not current)', async () => {
    const current = makeManifest({});
    const newManifest = makeManifest({
      '.claude/agents/reviewer.md': computeHash('new content'),
    });

    const plan = await compareVersions(current, newManifest, tempDir);

    expect(plan.hasChanges).toBe(true);
    const addedFiles = plan.changes.flatMap((c) => c.files).filter((f) => f.action === 'add');
    expect(addedFiles).toHaveLength(1);
    expect(addedFiles[0].path).toBe('.claude/agents/reviewer.md');
  });

  it('detects updated files (different hashes)', async () => {
    const originalContent = 'original content';
    const updatedContent = 'updated content';

    // Write the file to disk with original content (not modified by user)
    await mkdir(join(tempDir, '.claude', 'rules'), { recursive: true });
    await writeFile(join(tempDir, '.claude', 'rules', 'security.md'), originalContent);

    const current = makeManifest({
      '.claude/rules/security.md': computeHash(originalContent),
    });
    const newManifest = makeManifest({
      '.claude/rules/security.md': computeHash(updatedContent),
    });

    const plan = await compareVersions(current, newManifest, tempDir);

    expect(plan.hasChanges).toBe(true);
    const updatedFiles = plan.changes.flatMap((c) => c.files).filter((f) => f.action === 'update');
    expect(updatedFiles).toHaveLength(1);
    expect(updatedFiles[0].customized).toBe(false); // disk matches current manifest
  });

  it('detects removed files (in current but not new)', async () => {
    await mkdir(join(tempDir, '.claude', 'agents'), { recursive: true });
    await writeFile(join(tempDir, '.claude', 'agents', 'old.md'), 'old content');

    const current = makeManifest({
      '.claude/agents/old.md': computeHash('old content'),
    });
    const newManifest = makeManifest({});

    const plan = await compareVersions(current, newManifest, tempDir);

    expect(plan.hasChanges).toBe(true);
    const removedFiles = plan.changes
      .flatMap((c) => c.files)
      .filter((f) => f.action === 'remove');
    expect(removedFiles).toHaveLength(1);
    expect(removedFiles[0].path).toBe('.claude/agents/old.md');
  });

  it('marks customized files correctly (disk hash != manifest hash)', async () => {
    const originalContent = 'original';
    const userModifiedContent = 'user modified this file';

    await mkdir(join(tempDir, '.claude', 'rules'), { recursive: true });
    // User modified the file on disk
    await writeFile(join(tempDir, '.claude', 'rules', 'security.md'), userModifiedContent);

    const current = makeManifest({
      '.claude/rules/security.md': computeHash(originalContent), // original hash
    });
    const newManifest = makeManifest({
      '.claude/rules/security.md': computeHash('new rig content'),
    });

    const plan = await compareVersions(current, newManifest, tempDir);

    const updatedFiles = plan.changes.flatMap((c) => c.files).filter((f) => f.action === 'update');
    expect(updatedFiles).toHaveLength(1);
    expect(updatedFiles[0].customized).toBe(true);
  });

  it('produces empty plan when manifests are identical', async () => {
    const hash = computeHash('same content');
    await writeFile(join(tempDir, 'CLAUDE.md'), 'same content');

    const manifest = makeManifest({ 'CLAUDE.md': hash });

    const plan = await compareVersions(manifest, manifest, tempDir);

    expect(plan.hasChanges).toBe(false);
    expect(plan.changes).toHaveLength(0);
  });
});
