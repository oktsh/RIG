/**
 * Unit tests for gyrd-cli update command.
 *
 * Runs the built CLI binary in subprocess with temp directories.
 * Build is done once in beforeAll.
 */

import { describe, it, expect, afterEach } from 'vitest';
import { execSync } from 'node:child_process';
import {
  mkdtempSync,
  existsSync,
  rmSync,
  writeFileSync,
  statSync,
  readdirSync,
} from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RIG_ROOT = join(import.meta.dirname, '..', '..', '..', '..');
const CLI_PATH = join(RIG_ROOT, 'packages', 'gyrd-cli', 'dist', 'index.js');

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
  const dir = mkdtempSync(join(tmpdir(), 'gyrd-update-test-'));
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

/**
 * Create a project via `gyrd generate` so it has gyrd.toml + manifest.
 */
function createProject(dir: string): void {
  writeFileSync(join(dir, 'gyrd.toml'), SAMPLE_RIG_TOML);
  const { exitCode } = runRig('generate', dir);
  if (exitCode !== 0) {
    throw new Error(`Failed to generate project in ${dir}`);
  }
}

/**
 * Collect mtimes for all files under a directory (recursive, shallow for perf).
 */
function collectMtimes(dir: string, base = ''): Record<string, number> {
  const result: Record<string, number> = {};
  if (!existsSync(dir)) return result;

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      Object.assign(result, collectMtimes(full, rel));
    } else {
      result[rel] = statSync(full).mtimeMs;
    }
  }
  return result;
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

describe('gyrd update', () => {
  // 1. gyrd update in fresh project exits 0 (already up to date since same version)
  it('exits 0 and reports up to date on fresh project', () => {
    const dir = makeTmpDir();
    createProject(dir);

    const { stdout, exitCode } = runRig('update', dir);

    expect(exitCode).toBe(0);
    expect(stdout).toContain('up to date');
  });

  // 2. gyrd update --dry-run modifies no files
  it('--dry-run modifies no files', () => {
    const dir = makeTmpDir();
    createProject(dir);

    // Record mtimes before
    const mtimesBefore = collectMtimes(dir);

    // Small delay to ensure mtime would differ if files were touched
    execSync('sleep 1');

    const { exitCode } = runRig('update --dry-run', dir);

    expect(exitCode).toBe(0);

    // Check mtimes are unchanged
    const mtimesAfter = collectMtimes(dir);
    for (const [path, mtime] of Object.entries(mtimesBefore)) {
      if (mtimesAfter[path] !== undefined) {
        expect(mtimesAfter[path], `File ${path} was modified during dry-run`).toBe(mtime);
      }
    }
  });

  // 3. gyrd update --component agents runs without error
  it('--component agents runs without error', () => {
    const dir = makeTmpDir();
    createProject(dir);

    const { exitCode } = runRig('update --component agents', dir);

    expect(exitCode).toBe(0);
  });

  // 4. Missing gyrd.toml exits 1
  it('exits 1 when gyrd.toml is missing', () => {
    const dir = makeTmpDir();

    const { stdout, exitCode } = runRig('update', dir);

    expect(exitCode).toBe(1);
    expect(stdout).toContain('No gyrd.toml found');
    expect(stdout).toContain('gyrd init');
  });

  // 5. Missing manifest exits 1 with helpful message
  it('exits 1 with helpful message when manifest is missing', () => {
    const dir = makeTmpDir();
    writeFileSync(join(dir, 'gyrd.toml'), SAMPLE_RIG_TOML);
    // Don't run generate — no manifest

    const { stdout, exitCode } = runRig('update', dir);

    expect(exitCode).toBe(1);
    expect(stdout).toContain('No manifest found');
    expect(stdout).toContain('gyrd generate');
  });

  // 6. gyrd update output contains summary sections (or "up to date")
  it('output contains update status', () => {
    const dir = makeTmpDir();
    createProject(dir);

    const { stdout, exitCode } = runRig('update', dir);

    expect(exitCode).toBe(0);
    // For same version, we get "up to date". When there are actual changes,
    // we'd see summary sections. Either way, output should be meaningful.
    expect(stdout.length).toBeGreaterThan(0);
    expect(stdout).toMatch(/up to date|Updated|What/i);
  });

  // 7. rig --help shows update command
  it('--help lists update command', () => {
    const { stdout, exitCode } = runRig('--help', makeTmpDir());

    expect(exitCode).toBe(0);
    expect(stdout).toContain('update');
  });
});
