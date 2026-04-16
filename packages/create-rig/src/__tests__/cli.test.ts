import { execSync } from 'node:child_process';
import { mkdtempSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { rmSync } from 'node:fs';

const _dirname = dirname(fileURLToPath(import.meta.url));
const CLI_PATH = join(_dirname, '..', '..', 'dist', 'index.js');

function runCLI(args: string, opts: { cwd?: string; expectFail?: boolean } = {}): string {
  try {
    return execSync(`node ${CLI_PATH} ${args}`, {
      cwd: opts.cwd ?? process.cwd(),
      encoding: 'utf8',
      timeout: 30_000,
      env: { ...process.env, NODE_NO_WARNINGS: '1' },
      stdio: ['pipe', 'pipe', 'pipe'],
    });
  } catch (err: unknown) {
    if (opts.expectFail) {
      const e = err as { stdout?: string; stderr?: string; status?: number };
      return (e.stdout ?? '') + (e.stderr ?? '');
    }
    throw err;
  }
}

describe('create-rig CLI', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'create-rig-test-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('--version prints version number', () => {
    const output = runCLI('--version');
    expect(output.trim()).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('--help prints usage text', () => {
    const output = runCLI('--help');
    expect(output).toContain('create-rig');
    expect(output).toContain('--preset');
    expect(output).toContain('--stack');
    expect(output).toContain('--name');
    expect(output).toContain('--force');
  });

  it('non-interactive mode with valid args succeeds', () => {
    const output = runCLI(
      '--preset solo-dev --stack nextjs --name test-project',
      { cwd: tempDir },
    );
    expect(output).toContain('Generated');
    expect(output).toContain('files');
    expect(existsSync(join(tempDir, 'rig.toml'))).toBe(true);
    expect(existsSync(join(tempDir, 'CLAUDE.md'))).toBe(true);
    expect(existsSync(join(tempDir, 'AGENTS.md'))).toBe(true);
  });

  it('invalid preset value shows error', () => {
    const output = runCLI(
      '--preset invalid --stack nextjs --name test-project',
      { cwd: tempDir, expectFail: true },
    );
    expect(output).toContain('Invalid preset');
  });

  it('invalid stack value shows error', () => {
    const output = runCLI(
      '--preset pm --stack invalid --name test-project',
      { cwd: tempDir, expectFail: true },
    );
    expect(output).toContain('Invalid stack');
  });

  it('refuses to overwrite existing rig.toml without --force', () => {
    writeFileSync(join(tempDir, 'rig.toml'), 'existing content');
    const output = runCLI(
      '--preset pm --stack nextjs --name test-project',
      { cwd: tempDir, expectFail: true },
    );
    expect(output).toContain('already exists');
  });

  it('--force overwrites existing rig.toml', () => {
    writeFileSync(join(tempDir, 'rig.toml'), 'old content');
    const output = runCLI(
      '--preset pm --stack nextjs --name test-project --force',
      { cwd: tempDir },
    );
    expect(output).toContain('Generated');
    const content = readFileSync(join(tempDir, 'rig.toml'), 'utf8');
    expect(content).not.toBe('old content');
    expect(content).toContain('test-project');
  });

  it('small-team preset with --team-size generates correctly', () => {
    const output = runCLI(
      '--preset small-team --stack python-fastapi --name team-proj --team-size 4',
      { cwd: tempDir },
    );
    expect(output).toContain('Generated');
    const toml = readFileSync(join(tempDir, 'rig.toml'), 'utf8');
    expect(toml).toContain('team-proj');
  });
});
