/**
 * Subprocess tests for `gyrd doctor` CLI command.
 *
 * Tests the CLI binary as a subprocess, verifying output format and exit codes.
 */

import { describe, it, expect, afterEach } from 'vitest';
import { execSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RIG_ROOT = join(import.meta.dirname, '..', '..', '..', '..');
const RIG_CLI_PATH = join(RIG_ROOT, 'packages', 'gyrd-cli', 'dist', 'index.js');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let tempDirs: string[] = [];

function makeTmpDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'rig-doctor-cli-'));
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

describe('gyrd doctor CLI', () => {
  // 1. Fresh project exits 0
  it('fresh project — exits 0', () => {
    const dir = makeTmpDir();
    runInit('--preset=solo-dev --stack=nextjs --name=doctor-test', dir);

    // Add .gitignore for security-baseline check
    const { writeFileSync } = require('node:fs');
    writeFileSync(join(dir, '.gitignore'), '.env*\n*.pem\n*.key\nnode_modules/\n');

    const { exitCode, stdout } = runRig('doctor', dir);
    expect(exitCode).toBe(0);
    // Should have some output
    expect(stdout.length).toBeGreaterThan(0);
  });

  // 2. --json outputs valid JSON array
  it('--json outputs valid JSON array', () => {
    const dir = makeTmpDir();
    runInit('--preset=solo-dev --stack=nextjs --name=doctor-json', dir);

    const { writeFileSync } = require('node:fs');
    writeFileSync(join(dir, '.gitignore'), '.env*\n*.pem\n*.key\nnode_modules/\n');

    const { stdout, exitCode } = runRig('doctor --json', dir);
    expect(exitCode).toBe(0);

    // Should be valid JSON
    const parsed = JSON.parse(stdout.trim());
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBe(8);
  });

  // 3. JSON results have required fields
  it('--json results have required fields', () => {
    const dir = makeTmpDir();
    runInit('--preset=solo-dev --stack=nextjs --name=doctor-fields', dir);

    const { writeFileSync } = require('node:fs');
    writeFileSync(join(dir, '.gitignore'), '.env*\n*.pem\n*.key\nnode_modules/\n');

    const { stdout } = runRig('doctor --json', dir);
    const parsed = JSON.parse(stdout.trim()) as Array<Record<string, unknown>>;

    for (const check of parsed) {
      expect(check).toHaveProperty('name');
      expect(check).toHaveProperty('status');
      expect(check).toHaveProperty('message');
      expect(typeof check.name).toBe('string');
      expect(['pass', 'warn', 'fail']).toContain(check.status);
      expect(typeof check.message).toBe('string');
    }
  });

  // 4. Broken project (delete hooks) exits 2
  it('broken project (missing hooks) — exits 2', () => {
    const dir = makeTmpDir();
    runInit('--preset=solo-dev --stack=nextjs --name=doctor-broken', dir);

    const { writeFileSync } = require('node:fs');
    writeFileSync(join(dir, '.gitignore'), '.env*\n*.pem\n*.key\nnode_modules/\n');

    // Delete hooks dir to cause a FAIL
    rmSync(join(dir, '.claude', 'hooks'), { recursive: true, force: true });

    const { exitCode } = runRig('doctor', dir);
    expect(exitCode).toBe(2);
  });

  // 5. rig --help shows doctor command
  it('rig --help shows doctor command', () => {
    const dir = makeTmpDir();
    const { stdout } = runRig('--help', dir);
    expect(stdout).toContain('doctor');
  });

  // 6. check alias works
  it('check alias works', () => {
    const dir = makeTmpDir();
    runInit('--preset=solo-dev --stack=nextjs --name=doctor-alias', dir);

    const { writeFileSync } = require('node:fs');
    writeFileSync(join(dir, '.gitignore'), '.env*\n*.pem\n*.key\nnode_modules/\n');

    const { exitCode } = runRig('check', dir);
    expect(exitCode).toBe(0);
  });
});
