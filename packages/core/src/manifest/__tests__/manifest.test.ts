import { describe, it, expect, afterEach } from 'vitest';
import { join } from 'node:path';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { buildManifest, writeManifest, readManifest } from '../index.js';
import { computeHash } from '../../utils/index.js';
import type { GyrdConfig } from '../../schemas/index.js';
import type { GeneratedFile } from '../../generator/types.js';

const FIXED_DATE = '2025-01-01T00:00:00.000Z';

function makeConfig(overrides?: Partial<GyrdConfig>): GyrdConfig {
  return {
    project: { name: 'test-app', preset: 'solo-dev', stack: 'nextjs' },
    ...overrides,
  };
}

function makeFiles(): GeneratedFile[] {
  return [
    { path: 'gyrd.toml', content: '[project]\nname = "test"', component: 'config' },
    { path: 'CLAUDE.md', content: '# Test\nCLAUDE.md content', component: 'formats' },
    { path: 'AGENTS.md', content: '# Agents\nagent list', component: 'formats' },
    { path: '.claude/agents/reviewer.md', content: '---\nname: reviewer\n---\nbody', component: 'agents' },
    { path: '.claude/rules/security.md', content: '# Security rules', component: 'rules' },
    { path: '.claude/hooks/pre-commit-guard.sh', content: '#!/bin/bash\necho ok', component: 'hooks' },
    { path: '.claude/templates/progress.md', content: '# Progress', component: 'templates' },
    { path: '.cursor/rules/security.mdc', content: '---\ndescription: security\n---\ncontent', component: 'formats' },
  ];
}

const dirs: string[] = [];

async function makeTmpDir(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'rig-manifest-test-'));
  dirs.push(dir);
  return dir;
}

afterEach(async () => {
  for (const dir of dirs) {
    await rm(dir, { recursive: true, force: true });
  }
  dirs.length = 0;
});

describe('buildManifest', () => {
  it('creates valid manifest with correct file hashes', () => {
    const config = makeConfig();
    const files = makeFiles();
    const manifest = buildManifest(config, files, '0.1.0', { generatedAt: FIXED_DATE });

    expect(manifest.gyrd_version).toBe('0.1.0');
    expect(manifest.generated_at).toBe(FIXED_DATE);
    expect(manifest.config_hash).toBe(computeHash(JSON.stringify(config)));

    // Components
    expect(manifest.components.agents.count).toBe(1);
    expect(manifest.components.agents.schema).toBe('agent-frontmatter-v1');
    expect(manifest.components.rules.count).toBe(1);
    expect(manifest.components.hooks.count).toBe(1);
    expect(manifest.components.templates.count).toBe(1);

    // Formats
    expect(manifest.components.formats).toHaveProperty('claude_md', 'generated');
    expect(manifest.components.formats).toHaveProperty('agents_md', 'generated');
    expect(manifest.components.formats).toHaveProperty('cursor_mdc', 'generated');

    // Compatibility
    expect(manifest.compatibility).toHaveProperty('claude-code', '>=1.0');
    expect(manifest.compatibility).toHaveProperty('cursor', '>=0.40');

    // File hashes
    for (const file of files) {
      expect(manifest.files).toHaveProperty(file.path);
      expect(manifest.files[file.path]).toBe(computeHash(file.content));
    }
  });

  it('files field contains all generated file paths', () => {
    const files = makeFiles();
    const manifest = buildManifest(makeConfig(), files, '0.1.0', { generatedAt: FIXED_DATE });

    const manifestPaths = Object.keys(manifest.files).sort();
    const inputPaths = files.map((f) => f.path).sort();
    expect(manifestPaths).toEqual(inputPaths);
  });

  it('config hash changes when config changes', () => {
    const files = makeFiles();
    const config1 = makeConfig({ project: { name: 'app-a', preset: 'solo-dev', stack: 'nextjs' } });
    const config2 = makeConfig({ project: { name: 'app-b', preset: 'solo-dev', stack: 'nextjs' } });

    const m1 = buildManifest(config1, files, '0.1.0', { generatedAt: FIXED_DATE });
    const m2 = buildManifest(config2, files, '0.1.0', { generatedAt: FIXED_DATE });

    expect(m1.config_hash).not.toBe(m2.config_hash);
  });
});

describe('writeManifest + readManifest', () => {
  it('round-trips correctly', async () => {
    const dir = await makeTmpDir();
    const config = makeConfig();
    const files = makeFiles();
    const original = buildManifest(config, files, '0.1.0', { generatedAt: FIXED_DATE });

    await writeManifest(dir, original);
    const loaded = await readManifest(dir);

    expect(loaded).not.toBeNull();
    expect(loaded!.gyrd_version).toBe(original.gyrd_version);
    expect(loaded!.generated_at).toBe(original.generated_at);
    expect(loaded!.config_hash).toBe(original.config_hash);
    expect(loaded!.components).toEqual(original.components);
    expect(loaded!.compatibility).toEqual(original.compatibility);
    expect(loaded!.files).toEqual(original.files);
  });

  it('readManifest returns null when no manifest exists', async () => {
    const dir = await makeTmpDir();
    const result = await readManifest(dir);
    expect(result).toBeNull();
  });
});
