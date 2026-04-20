import { describe, it, expect, afterEach } from 'vitest';
import { join } from 'node:path';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { parse as parseToml } from '@iarna/toml';
import { parse as parseYaml } from 'yaml';
import { generateProject } from '../index.js';
import type { GyrdConfig } from '../../schemas/index.js';
import { readManifest } from '../../manifest/index.js';

const FIXED_DATE = '2025-01-01T00:00:00.000Z';
const FIXED_VERSION = '0.1.0-test';

function soloDevConfig(overrides?: Partial<GyrdConfig>): GyrdConfig {
  return {
    project: { name: 'test-solo', preset: 'solo-dev', stack: 'nextjs' },
    ...overrides,
  };
}

function smallTeamConfig(overrides?: Partial<GyrdConfig>): GyrdConfig {
  return {
    project: { name: 'test-team', preset: 'small-team', stack: 'nextjs' },
    ...overrides,
  };
}

function pmConfig(overrides?: Partial<GyrdConfig>): GyrdConfig {
  return {
    project: { name: 'test-pm', preset: 'pm', stack: 'nextjs' },
    ...overrides,
  };
}

const dirs: string[] = [];

async function makeTmpDir(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'rig-test-'));
  dirs.push(dir);
  return dir;
}

afterEach(async () => {
  for (const dir of dirs) {
    await rm(dir, { recursive: true, force: true });
  }
  dirs.length = 0;
});

describe('generateProject', () => {
  it('solo-dev/nextjs produces all expected file types', async () => {
    const outDir = await makeTmpDir();
    const result = await generateProject(soloDevConfig(), outDir, {
      generatedAt: FIXED_DATE,
      version: FIXED_VERSION,
    });

    const paths = result.files.map((f) => f.path);

    // Config
    expect(paths).toContain('gyrd.toml');

    // Formats
    expect(paths).toContain('CLAUDE.md');
    expect(paths).toContain('AGENTS.md');

    // Agents (shared: code-reviewer, verification)
    expect(paths.some((p) => p.startsWith('.claude/agents/'))).toBe(true);

    // Rules
    expect(paths.some((p) => p.startsWith('.claude/rules/'))).toBe(true);

    // Hooks
    expect(paths.some((p) => p.startsWith('.claude/hooks/'))).toBe(true);

    // Cursor rules
    expect(paths.some((p) => p.startsWith('.cursor/rules/'))).toBe(true);

    // Templates
    expect(paths.some((p) => p.startsWith('.claude/templates/'))).toBe(true);

    // Duration is a number
    expect(result.duration).toBeGreaterThan(0);
  });

  it('generated gyrd.toml is valid TOML', async () => {
    const outDir = await makeTmpDir();
    const result = await generateProject(soloDevConfig(), outDir, {
      generatedAt: FIXED_DATE,
      version: FIXED_VERSION,
    });

    const rigToml = result.files.find((f) => f.path === 'gyrd.toml');
    expect(rigToml).toBeDefined();

    const parsed = parseToml(rigToml!.content);
    expect(parsed).toHaveProperty('project');
    expect((parsed.project as Record<string, unknown>).name).toBe('test-solo');
    expect((parsed.project as Record<string, unknown>).preset).toBe('solo-dev');
    expect((parsed.project as Record<string, unknown>).stack).toBe('nextjs');
  });

  it('generated .gyrd/manifest.yaml contains SHA-256 hashes for all files', async () => {
    const outDir = await makeTmpDir();
    const result = await generateProject(soloDevConfig(), outDir, {
      generatedAt: FIXED_DATE,
      version: FIXED_VERSION,
    });

    const manifest = await readManifest(outDir);
    expect(manifest).not.toBeNull();

    // Every generated file should appear in the manifest
    for (const file of result.files) {
      expect(manifest!.files).toHaveProperty(file.path);
      // Hash should be 64-char hex (SHA-256)
      expect(manifest!.files[file.path]).toMatch(/^[a-f0-9]{64}$/);
    }
  });

  it('generated .claude/agents/*.md have valid YAML frontmatter', async () => {
    const outDir = await makeTmpDir();
    const result = await generateProject(soloDevConfig(), outDir, {
      generatedAt: FIXED_DATE,
      version: FIXED_VERSION,
    });

    const agentFiles = result.files.filter((f) => f.component === 'agents');
    expect(agentFiles.length).toBeGreaterThan(0);

    for (const file of agentFiles) {
      const content = file.content;
      expect(content.startsWith('---')).toBe(true);

      const secondDash = content.indexOf('---', 3);
      expect(secondDash).toBeGreaterThan(3);

      const yamlBlock = content.slice(3, secondDash).trim();
      const parsed = parseYaml(yamlBlock) as Record<string, unknown>;
      expect(parsed).toHaveProperty('name');
      expect(parsed).toHaveProperty('description');
      expect(parsed).toHaveProperty('model');
      expect(parsed).toHaveProperty('file_ownership');
    }
  });

  it('determinism: generate twice with same config produces byte-identical output', async () => {
    const dir1 = await makeTmpDir();
    const dir2 = await makeTmpDir();
    const config = soloDevConfig();
    const opts = { generatedAt: FIXED_DATE, version: FIXED_VERSION };

    const result1 = await generateProject(config, dir1, opts);
    const result2 = await generateProject(config, dir2, opts);

    expect(result1.files.length).toBe(result2.files.length);

    for (let i = 0; i < result1.files.length; i++) {
      expect(result1.files[i].path).toBe(result2.files[i].path);
      expect(result1.files[i].content).toBe(result2.files[i].content);
    }

    // Also check manifest is identical
    const manifest1Raw = await readFile(join(dir1, '.gyrd', 'manifest.yaml'), 'utf8');
    const manifest2Raw = await readFile(join(dir2, '.gyrd', 'manifest.yaml'), 'utf8');
    expect(manifest1Raw).toBe(manifest2Raw);
  });

  it('all presets generate the same number of files (unified content)', async () => {
    const dir1 = await makeTmpDir();
    const dir2 = await makeTmpDir();
    const dir3 = await makeTmpDir();
    const opts = { generatedAt: FIXED_DATE, version: FIXED_VERSION };

    const soloResult = await generateProject(soloDevConfig(), dir1, opts);
    const teamResult = await generateProject(smallTeamConfig(), dir2, opts);
    const pmResult = await generateProject(pmConfig(), dir3, opts);

    // All presets get the same agents/rules/workflows/protocols
    expect(soloResult.files.length).toBe(teamResult.files.length);
    expect(pmResult.files.length).toBe(teamResult.files.length);
  });

  it('all presets generate 9 agents (unified core set)', async () => {
    const outDir = await makeTmpDir();
    const result = await generateProject(pmConfig(), outDir, {
      generatedAt: FIXED_DATE,
      version: FIXED_VERSION,
    });

    const agentPaths = result.files
      .filter((f) => f.component === 'agents')
      .map((f) => f.path);

    // All presets get 9 agents
    expect(agentPaths.length).toBe(9);
    expect(agentPaths.some((p) => p.includes('code-reviewer'))).toBe(true);
    expect(agentPaths.some((p) => p.includes('tech-lead'))).toBe(true);
    expect(agentPaths.some((p) => p.includes('spec-writer'))).toBe(true);
    expect(agentPaths.some((p) => p.includes('debugger'))).toBe(true);
  });

  it('hooks are copied with correct content (start with shebang)', async () => {
    const outDir = await makeTmpDir();
    const result = await generateProject(soloDevConfig(), outDir, {
      generatedAt: FIXED_DATE,
      version: FIXED_VERSION,
    });

    const hookFiles = result.files.filter((f) => f.component === 'hooks');
    expect(hookFiles.length).toBeGreaterThan(0);

    for (const hook of hookFiles) {
      expect(hook.content.startsWith('#!/')).toBe(true);
    }
  });

  it('files are sorted alphabetically', async () => {
    const outDir = await makeTmpDir();
    const result = await generateProject(smallTeamConfig(), outDir, {
      generatedAt: FIXED_DATE,
      version: FIXED_VERSION,
    });

    const paths = result.files.map((f) => f.path);
    const sorted = [...paths].sort();
    expect(paths).toEqual(sorted);
  });

  it('output files are actually written to disk', async () => {
    const outDir = await makeTmpDir();
    await generateProject(soloDevConfig(), outDir, {
      generatedAt: FIXED_DATE,
      version: FIXED_VERSION,
    });

    // Spot-check a few files
    const rigToml = await readFile(join(outDir, 'gyrd.toml'), 'utf8');
    expect(rigToml).toContain('test-solo');

    const claudeMd = await readFile(join(outDir, 'CLAUDE.md'), 'utf8');
    expect(claudeMd).toContain('test-solo');

    // Manifest
    const manifestYaml = await readFile(join(outDir, '.gyrd', 'manifest.yaml'), 'utf8');
    expect(manifestYaml).toContain('gyrd_version');
  });
});
