import { describe, it, expect } from 'vitest';
import { getManagedFiles, isUnmanagedFile, validateUpdateTarget } from '../safety.js';
import type { Manifest } from '../../schemas/index.js';

function makeManifest(files: Record<string, string>): Manifest {
  return {
    rig_version: '0.1.0',
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

describe('getManagedFiles', () => {
  it('returns only files from manifest', () => {
    const manifest = makeManifest({
      'CLAUDE.md': 'hash1',
      '.claude/agents/reviewer.md': 'hash2',
    });
    const managed = getManagedFiles(manifest);
    expect(managed.size).toBe(2);
    expect(managed.has('CLAUDE.md')).toBe(true);
    expect(managed.has('.claude/agents/reviewer.md')).toBe(true);
    expect(managed.has('PROGRESS.md')).toBe(false);
  });
});

describe('isUnmanagedFile', () => {
  const manifest = makeManifest({
    'CLAUDE.md': 'hash1',
    '.claude/agents/reviewer.md': 'hash2',
  });

  it('returns true for PROGRESS.md', () => {
    expect(isUnmanagedFile('PROGRESS.md', manifest)).toBe(true);
  });

  it('returns true for DECISIONS.md', () => {
    expect(isUnmanagedFile('DECISIONS.md', manifest)).toBe(true);
  });

  it('returns true for memory/* paths', () => {
    expect(isUnmanagedFile('memory/notes.md', manifest)).toBe(true);
    expect(isUnmanagedFile('memory/rig.md', manifest)).toBe(true);
  });

  it('returns true for specs/* paths', () => {
    expect(isUnmanagedFile('specs/1-feature/spec.md', manifest)).toBe(true);
    expect(isUnmanagedFile('specs/2-auth/plan.md', manifest)).toBe(true);
  });

  it('returns false for manifest-tracked files', () => {
    expect(isUnmanagedFile('CLAUDE.md', manifest)).toBe(false);
    expect(isUnmanagedFile('.claude/agents/reviewer.md', manifest)).toBe(false);
  });

  it('returns true for files not in manifest and not in NEVER_MANAGED', () => {
    expect(isUnmanagedFile('random-file.txt', manifest)).toBe(true);
  });
});

describe('validateUpdateTarget', () => {
  const manifest = makeManifest({ 'CLAUDE.md': 'hash1' });

  it('throws for PROGRESS.md', () => {
    expect(() => validateUpdateTarget('PROGRESS.md', manifest)).toThrow('never managed');
  });

  it('throws for specs/ paths', () => {
    expect(() => validateUpdateTarget('specs/1/spec.md', manifest)).toThrow('protected pattern');
  });

  it('throws for files not in manifest', () => {
    expect(() => validateUpdateTarget('random.txt', manifest)).toThrow('not tracked');
  });

  it('does not throw for manifest-tracked files', () => {
    expect(() => validateUpdateTarget('CLAUDE.md', manifest)).not.toThrow();
  });
});
