import { describe, it, expect } from 'vitest';
import { ManifestSchema } from '../manifest.js';

const validManifest = {
  gyrd_version: '0.1.0',
  generated_at: '2026-04-15T00:00:00Z',
  config_hash: 'abc123',
  components: {
    agents: { version: '1.0.0', count: 5, schema: 'v1' },
    hooks: { version: '1.0.0', count: 2 },
    rules: { version: '1.0.0', count: 3 },
    formats: { claude_md: '1.0.0' },
    templates: { version: '1.0.0', count: 4 },
  },
  compatibility: { 'claude-code': '>=1.0.0' },
  files: { 'CLAUDE.md': 'sha256:deadbeef' },
};

describe('ManifestSchema', () => {
  it('parses a valid manifest', () => {
    const result = ManifestSchema.safeParse(validManifest);
    expect(result.success).toBe(true);
  });

  it('rejects manifest missing gyrd_version', () => {
    const { gyrd_version: _, ...rest } = validManifest;
    const result = ManifestSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects manifest missing files record', () => {
    const { files: _, ...rest } = validManifest;
    const result = ManifestSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('allows extra fields via record shapes (files can have many entries)', () => {
    const result = ManifestSchema.safeParse({
      ...validManifest,
      files: {
        'CLAUDE.md': 'sha256:aaa',
        'agents/tech-lead.md': 'sha256:bbb',
        '.claude/hooks/pre-commit.sh': 'sha256:ccc',
      },
    });
    expect(result.success).toBe(true);
  });
});
