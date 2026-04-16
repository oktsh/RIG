/**
 * Unit tests for rig-cli generate command.
 *
 * Runs the built CLI binary in subprocess with temp directories.
 * Build is done once in beforeAll.
 */

import { describe, it, expect, afterEach } from 'vitest';
import { execSync } from 'node:child_process';
import {
  mkdtempSync,
  readFileSync,
  existsSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RIG_ROOT = join(import.meta.dirname, '..', '..', '..', '..');
const CLI_PATH = join(RIG_ROOT, 'packages', 'rig-cli', 'dist', 'index.js');

const SAMPLE_RIG_TOML = `
[project]
name = "test-project"
preset = "solo-dev"
stack = "nextjs"
`.trim();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let tempDirs: string[] = [];

function makeTmpDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'rig-cli-test-'));
  tempDirs.push(dir);
  return dir;
}

function runRig(args: string, cwd: string): { stdout: string; exitCode: number } {
  try {
    const stdout = execSync(`node ${CLI_PATH} ${args}`, {
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

describe('rig generate', () => {
  // 1. Full regeneration with valid rig.toml
  it('regenerates all files from rig.toml', () => {
    const dir = makeTmpDir();
    writeFileSync(join(dir, 'rig.toml'), SAMPLE_RIG_TOML);

    const { stdout, exitCode } = runRig('generate', dir);

    expect(exitCode).toBe(0);
    expect(stdout).toContain('Regenerated');
    expect(existsSync(join(dir, 'CLAUDE.md'))).toBe(true);
    expect(existsSync(join(dir, 'AGENTS.md'))).toBe(true);
    expect(existsSync(join(dir, '.rig', 'manifest.yaml'))).toBe(true);
    expect(existsSync(join(dir, '.claude', 'agents'))).toBe(true);
    expect(existsSync(join(dir, '.claude', 'rules'))).toBe(true);
    expect(existsSync(join(dir, '.cursor', 'rules'))).toBe(true);
  });

  // 2. Selective target: claude_md
  it('rig generate claude_md regenerates only CLAUDE.md', () => {
    const dir = makeTmpDir();
    writeFileSync(join(dir, 'rig.toml'), SAMPLE_RIG_TOML);

    // First do full generation
    runRig('generate', dir);

    // Record current AGENTS.md content
    const agentsBefore = readFileSync(join(dir, 'AGENTS.md'), 'utf8');

    // Regenerate only claude_md
    const { stdout, exitCode } = runRig('generate claude_md', dir);

    expect(exitCode).toBe(0);
    expect(stdout).toContain('Regenerated 1 file');
    expect(stdout).toContain('CLAUDE.md');

    // AGENTS.md content should be identical (same config, same output)
    const agentsAfter = readFileSync(join(dir, 'AGENTS.md'), 'utf8');
    expect(agentsAfter).toBe(agentsBefore);
  });

  // 3. Invalid target
  it('exits 1 with helpful message for invalid target', () => {
    const dir = makeTmpDir();
    writeFileSync(join(dir, 'rig.toml'), SAMPLE_RIG_TOML);

    const { stdout, exitCode } = runRig('generate foobar', dir);

    expect(exitCode).toBe(1);
    expect(stdout).toContain('Unknown target');
    expect(stdout).toContain('claude_md');
    expect(stdout).toContain('agents_md');
    expect(stdout).toContain('cursor_mdc');
  });

  // 4. Missing rig.toml
  it('exits 1 with helpful message when rig.toml is missing', () => {
    const dir = makeTmpDir();

    const { stdout, exitCode } = runRig('generate', dir);

    expect(exitCode).toBe(1);
    expect(stdout).toContain('No rig.toml found');
    expect(stdout).toContain('create-rig');
  });

  // 5. --version
  it('rig --version prints version', () => {
    const { stdout, exitCode } = runRig('--version', makeTmpDir());

    expect(exitCode).toBe(0);
    expect(stdout.trim()).toMatch(/^\d+\.\d+\.\d+$/);
  });

  // 6. --help
  it('rig --help shows commands', () => {
    const { stdout, exitCode } = runRig('--help', makeTmpDir());

    expect(exitCode).toBe(0);
    expect(stdout).toContain('generate');
    expect(stdout).toContain('Manage your AI dev practice');
  });

  // 7. Determinism: run twice, output identical
  it('produces identical output on consecutive runs', () => {
    const dir = makeTmpDir();
    writeFileSync(join(dir, 'rig.toml'), SAMPLE_RIG_TOML);

    runRig('generate', dir);
    const claudeFirst = readFileSync(join(dir, 'CLAUDE.md'), 'utf8');
    const agentsFirst = readFileSync(join(dir, 'AGENTS.md'), 'utf8');

    runRig('generate', dir);
    const claudeSecond = readFileSync(join(dir, 'CLAUDE.md'), 'utf8');
    const agentsSecond = readFileSync(join(dir, 'AGENTS.md'), 'utf8');

    expect(claudeSecond).toBe(claudeFirst);
    expect(agentsSecond).toBe(agentsFirst);
  });

  // 8. gen alias works
  it('gen alias works the same as generate', () => {
    const dir = makeTmpDir();
    writeFileSync(join(dir, 'rig.toml'), SAMPLE_RIG_TOML);

    const { stdout, exitCode } = runRig('gen', dir);

    expect(exitCode).toBe(0);
    expect(stdout).toContain('Regenerated');
    expect(existsSync(join(dir, 'CLAUDE.md'))).toBe(true);
  });

  // 9. Invalid TOML content
  it('exits 1 with error for invalid rig.toml content', () => {
    const dir = makeTmpDir();
    writeFileSync(join(dir, 'rig.toml'), '[project]\nname = "test"\n');

    const { stdout, exitCode } = runRig('generate', dir);

    expect(exitCode).toBe(1);
    expect(stdout).toContain('Invalid rig.toml');
  });
});
