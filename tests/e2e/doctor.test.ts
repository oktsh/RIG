/**
 * E2E tests for `gyrd doctor` command.
 *
 * Full lifecycle: gyrd init -> gyrd doctor -> verify exit codes.
 */

import { describe, it, expect, afterEach } from 'vitest';
import { execSync } from 'node:child_process';
import {
  mkdtempSync,
  writeFileSync,
  rmSync,
} from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RIG_ROOT = join(import.meta.dirname, '..', '..');
const RIG_CLI_PATH = join(RIG_ROOT, 'packages', 'gyrd-cli', 'dist', 'index.js');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let tempDirs: string[] = [];

function makeTmpDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'rig-doctor-e2e-'));
  tempDirs.push(dir);
  return dir;
}

function runInit(args: string, cwd: string): string {
  return execSync(`node ${RIG_CLI_PATH} init ${args}`, {
    cwd,
    encoding: 'utf8',
    timeout: 30_000,
    env: { ...process.env, NODE_NO_WARNINGS: '1' },
    stdio: ['pipe', 'pipe', 'pipe'],
  });
}

function runRig(args: string, cwd: string): { stdout: string; stderr: string; exitCode: number } {
  try {
    const stdout = execSync(`node ${RIG_CLI_PATH} ${args}`, {
      cwd,
      encoding: 'utf8',
      timeout: 30_000,
      env: { ...process.env, NODE_NO_WARNINGS: '1' },
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return { stdout, stderr: '', exitCode: 0 };
  } catch (err: unknown) {
    const e = err as { stdout?: string; stderr?: string; status?: number };
    return {
      stdout: e.stdout ?? '',
      stderr: e.stderr ?? '',
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

describe('gyrd doctor E2E', () => {
  // 1. gyrd init -> gyrd doctor -> exit 0
  it('fresh gyrd init project passes doctor with exit 0', () => {
    const dir = makeTmpDir();
    runInit('--preset=solo-dev --stack=nextjs --name=e2e-doctor', dir);

    // Add required .gitignore patterns
    writeFileSync(join(dir, '.gitignore'), '.env*\n*.pem\n*.key\nnode_modules/\n');

    const { exitCode, stdout } = runRig('doctor', dir);
    expect(exitCode).toBe(0);
    expect(stdout.length).toBeGreaterThan(0);
  });

  // 2. gyrd init -> delete file -> gyrd doctor -> exit non-zero
  it('project with deleted hooks fails doctor with non-zero exit', () => {
    const dir = makeTmpDir();
    runInit('--preset=solo-dev --stack=nextjs --name=e2e-doctor-fail', dir);

    // Add .gitignore so that check passes
    writeFileSync(join(dir, '.gitignore'), '.env*\n*.pem\n*.key\nnode_modules/\n');

    // Delete hooks directory to cause a FAIL
    rmSync(join(dir, '.claude', 'hooks'), { recursive: true, force: true });

    const { exitCode } = runRig('doctor', dir);
    expect(exitCode).toBeGreaterThan(0);
  });

  // 3. JSON output in e2e scenario is parseable and matches check count
  it('--json output is valid and contains all 8 checks', () => {
    const dir = makeTmpDir();
    runInit('--preset=solo-dev --stack=nextjs --name=e2e-doctor-json', dir);

    writeFileSync(join(dir, '.gitignore'), '.env*\n*.pem\n*.key\nnode_modules/\n');

    const { stdout, exitCode } = runRig('doctor --json', dir);
    expect(exitCode).toBe(0);

    const checks = JSON.parse(stdout.trim());
    expect(Array.isArray(checks)).toBe(true);
    expect(checks.length).toBe(8);

    // Verify all expected check names are present
    const names = checks.map((c: { name: string }) => c.name);
    expect(names).toContain('schema-freshness');
    expect(names).toContain('format-sync');
    expect(names).toContain('hook-coverage');
    expect(names).toContain('dead-references');
    expect(names).toContain('rule-contradictions');
    expect(names).toContain('template-drift');
    expect(names).toContain('deprecation-scan');
    expect(names).toContain('security-baseline');
  });
});
