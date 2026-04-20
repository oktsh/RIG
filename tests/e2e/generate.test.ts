/**
 * E2E tests for `gyrd generate` command.
 *
 * Full lifecycle: create-gyrd -> modify gyrd.toml -> gyrd generate -> verify changes.
 * Complements unit tests at packages/gyrd-cli/src/__tests__/generate.test.ts.
 */

import { describe, it, expect, afterEach } from 'vitest';
import { execSync } from 'node:child_process';
import {
  mkdtempSync,
  readFileSync,
  writeFileSync,
  existsSync,
  rmSync,
} from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { parse as parseYaml } from 'yaml';
import { computeHash } from '@gyrd/core';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RIG_ROOT = join(import.meta.dirname, '..', '..');
const CREATE_CLI_PATH = join(RIG_ROOT, 'packages', 'create-gyrd', 'dist', 'index.js');
const RIG_CLI_PATH = join(RIG_ROOT, 'packages', 'gyrd-cli', 'dist', 'index.js');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let tempDirs: string[] = [];

function makeTmpDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'rig-gen-e2e-'));
  tempDirs.push(dir);
  return dir;
}

function runCreate(args: string, cwd: string): string {
  return execSync(`node ${CREATE_CLI_PATH} ${args}`, {
    cwd,
    encoding: 'utf8',
    timeout: 30_000,
    env: { ...process.env, NODE_NO_WARNINGS: '1' },
    stdio: ['pipe', 'pipe', 'pipe'],
  });
}

function runRig(args: string, cwd: string): { stdout: string; exitCode: number } {
  try {
    const stdout = execSync(`node ${RIG_CLI_PATH} ${args}`, {
      cwd,
      encoding: 'utf8',
      timeout: 30_000,
      env: { ...process.env, NODE_NO_WARNINGS: '1' },
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return { stdout, exitCode: 0 };
  } catch (err: unknown) {
    const e = err as { stdout?: string; stderr?: string; status?: number };
    return {
      stdout: (e.stdout ?? '') + (e.stderr ?? ''),
      exitCode: e.status ?? 1,
    };
  }
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

afterEach(() => {
  for (const dir of tempDirs) {
    rmSync(dir, { recursive: true, force: true });
  }
  tempDirs = [];
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('gyrd generate E2E', () => {
  // 1. Create project, modify gyrd.toml, regenerate, verify changes
  it('regenerates after preset change — CLAUDE.md reflects new preset', () => {
    const dir = makeTmpDir();

    // Step 1: Create project with solo-dev preset
    runCreate('--preset=solo-dev --stack=nextjs --name=e2e-project', dir);

    const claudeBefore = readFileSync(join(dir, 'CLAUDE.md'), 'utf8');
    expect(claudeBefore).toMatch(/[Jj]ust code/); // solo-dev onboarding

    // Step 2: Modify gyrd.toml to change preset to pm
    const rigToml = readFileSync(join(dir, 'gyrd.toml'), 'utf8');
    const updatedToml = rigToml.replace('preset = "solo-dev"', 'preset = "pm"');
    writeFileSync(join(dir, 'gyrd.toml'), updatedToml);

    // Step 3: Run gyrd generate
    const { stdout, exitCode } = runRig('generate', dir);
    expect(exitCode).toBe(0);
    expect(stdout).toContain('Regenerated');

    // Step 4: Verify CLAUDE.md changed (PM preset has different tone)
    const claudeAfter = readFileSync(join(dir, 'CLAUDE.md'), 'utf8');
    expect(claudeAfter).not.toBe(claudeBefore);
    // PM preset says "Tell me what you want to build"
    expect(claudeAfter).toMatch(/[Tt]ell me what you want to build/);
  });

  // 2. Manifest updated after regeneration
  it('manifest is updated after gyrd generate', () => {
    const dir = makeTmpDir();

    // Create initial project
    runCreate('--preset=solo-dev --stack=nextjs --name=e2e-manifest', dir);

    const manifestBefore = readFileSync(join(dir, '.gyrd', 'manifest.yaml'), 'utf8');

    // Modify preset
    const rigToml = readFileSync(join(dir, 'gyrd.toml'), 'utf8');
    writeFileSync(join(dir, 'gyrd.toml'), rigToml.replace('preset = "solo-dev"', 'preset = "pm"'));

    // Regenerate
    const { exitCode } = runRig('generate', dir);
    expect(exitCode).toBe(0);

    // Manifest should have changed (different config_hash due to preset change)
    const manifestAfter = readFileSync(join(dir, '.gyrd', 'manifest.yaml'), 'utf8');
    expect(manifestAfter).not.toBe(manifestBefore);

    // Verify manifest hashes match actual files
    const manifest = parseYaml(manifestAfter) as Record<string, unknown>;
    const fileHashes = manifest.files as Record<string, string>;

    for (const [relativePath, expectedHash] of Object.entries(fileHashes)) {
      const fullPath = join(dir, relativePath);
      expect(existsSync(fullPath), `${relativePath} should exist`).toBe(true);
      const content = readFileSync(fullPath, 'utf8');
      expect(computeHash(content), `hash mismatch for ${relativePath}`).toBe(expectedHash);
    }
  });

  // 3. Selective generation preserves non-targeted files
  it('selective generate claude_md does not modify AGENTS.md', () => {
    const dir = makeTmpDir();

    // Create initial project
    runCreate('--preset=solo-dev --stack=nextjs --name=e2e-selective', dir);

    const agentsBefore = readFileSync(join(dir, 'AGENTS.md'), 'utf8');

    // Change preset
    const rigToml = readFileSync(join(dir, 'gyrd.toml'), 'utf8');
    writeFileSync(join(dir, 'gyrd.toml'), rigToml.replace('preset = "solo-dev"', 'preset = "pm"'));

    // Regenerate only CLAUDE.md
    const { exitCode } = runRig('generate claude_md', dir);
    expect(exitCode).toBe(0);

    // AGENTS.md should NOT have changed (selective generation skips it)
    const agentsAfter = readFileSync(join(dir, 'AGENTS.md'), 'utf8');
    expect(agentsAfter).toBe(agentsBefore);

    // But CLAUDE.md should have changed
    const claudeAfter = readFileSync(join(dir, 'CLAUDE.md'), 'utf8');
    expect(claudeAfter).toMatch(/[Tt]ell me what you want to build/);
  });

  // 4. Regeneration is idempotent
  it('consecutive gyrd generate produces identical output', () => {
    const dir = makeTmpDir();

    runCreate('--preset=small-team --stack=python-fastapi --name=e2e-idempotent', dir);

    // First regeneration
    runRig('generate', dir);
    const claudeFirst = readFileSync(join(dir, 'CLAUDE.md'), 'utf8');
    const agentsFirst = readFileSync(join(dir, 'AGENTS.md'), 'utf8');

    // Second regeneration
    runRig('generate', dir);
    const claudeSecond = readFileSync(join(dir, 'CLAUDE.md'), 'utf8');
    const agentsSecond = readFileSync(join(dir, 'AGENTS.md'), 'utf8');

    expect(claudeSecond).toBe(claudeFirst);
    expect(agentsSecond).toBe(agentsFirst);
  });
});
