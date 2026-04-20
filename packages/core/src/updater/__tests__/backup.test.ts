import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, writeFile, readFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createBackup } from '../backup.js';
import type { Manifest } from '../../schemas/index.js';

function makeManifest(files: Record<string, string>): Manifest {
  return {
    gyrd_version: '0.1.0',
    generated_at: '2026-01-01T00:00:00Z',
    config_hash: 'abc123',
    components: {
      agents: { version: '0.1.0', count: 1, schema: 'agent-frontmatter-v1' },
      hooks: { version: '0.1.0', count: 1 },
      rules: { version: '0.1.0', count: 1 },
      formats: {},
      templates: { version: '0.1.0', count: 1 },
    },
    compatibility: {},
    files,
  };
}

describe('createBackup (non-git)', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'gyrd-backup-test-'));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('creates backup in .gyrd/backups/ for non-git dir', async () => {
    // Write a managed file
    await writeFile(join(tempDir, 'CLAUDE.md'), '# Test Project');

    const manifest = makeManifest({ 'CLAUDE.md': 'somehash' });
    const backupPath = await createBackup(tempDir, manifest);

    expect(backupPath).toContain('.gyrd/backups/');
    expect(backupPath).toContain(tempDir);
  });

  it('backup contains all managed files', async () => {
    // Create directory structure
    await mkdir(join(tempDir, '.claude', 'agents'), { recursive: true });
    await writeFile(join(tempDir, 'CLAUDE.md'), '# Test');
    await writeFile(join(tempDir, '.claude', 'agents', 'reviewer.md'), 'reviewer content');

    const manifest = makeManifest({
      'CLAUDE.md': 'hash1',
      '.claude/agents/reviewer.md': 'hash2',
    });

    const backupPath = await createBackup(tempDir, manifest);

    const backedUpClaude = await readFile(join(backupPath, 'CLAUDE.md'), 'utf8');
    expect(backedUpClaude).toBe('# Test');

    const backedUpAgent = await readFile(
      join(backupPath, '.claude', 'agents', 'reviewer.md'),
      'utf8',
    );
    expect(backedUpAgent).toBe('reviewer content');
  });

  it('returns valid backup path', async () => {
    const manifest = makeManifest({});
    const backupPath = await createBackup(tempDir, manifest);

    expect(typeof backupPath).toBe('string');
    expect(backupPath.length).toBeGreaterThan(0);
  });
});
