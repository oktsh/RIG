/**
 * E2E tests for autonomous agent compatibility (T024).
 *
 * Validates that generated content works for factory-style autonomous agents:
 * - CLAUDE.md contains commit message format (AC-GYRD-042)
 * - Rules contain "if running interactively" qualifiers (AC-GYRD-043)
 * - Hook scripts detect non-TTY and are CI-safe (AC-GYRD-044)
 */

import { describe, it, expect, afterEach } from 'vitest';
import { execSync } from 'node:child_process';
import {
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
} from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RIG_ROOT = join(import.meta.dirname, '..', '..');
const CLI_PATH = join(RIG_ROOT, 'packages', 'gyrd-cli', 'dist', 'index.js');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let tempDirs: string[] = [];

function makeTmpDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'rig-auto-e2e-'));
  tempDirs.push(dir);
  return dir;
}

function generateProject(preset: string, stack: string, name: string): string {
  const dir = makeTmpDir();
  execSync(`node ${CLI_PATH} init --preset=${preset} --stack=${stack} --name=${name}`, {
    cwd: dir,
    encoding: 'utf8',
    timeout: 30_000,
    env: { ...process.env, NODE_NO_WARNINGS: '1' },
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  return dir;
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

describe('Autonomous agent compatibility (T024)', () => {
  // 1. Generated CLAUDE.md contains commit message format section
  it('CLAUDE.md contains commit message format (feat:/fix:/refactor:/chore:)', () => {
    const dir = generateProject('solo-dev', 'nextjs', 'auto-commit-fmt');
    const claudeMd = readFileSync(join(dir, 'CLAUDE.md'), 'utf8');

    expect(claudeMd).toContain('feat:');
    expect(claudeMd).toContain('fix:');
    expect(claudeMd).toContain('refactor:');
    expect(claudeMd).toContain('chore:');
    expect(claudeMd).toMatch(/Commit Messages/i);
  });

  // 2. Generated CLAUDE.md contains testing expectations
  it('CLAUDE.md contains testing expectations section', () => {
    const dir = generateProject('small-team', 'nextjs', 'auto-testing');
    const claudeMd = readFileSync(join(dir, 'CLAUDE.md'), 'utf8');

    expect(claudeMd).toMatch(/Testing/);
    expect(claudeMd).toMatch(/Run tests before committing/);
  });

  // 3. Generated rules contain "if running interactively" qualifiers
  it('rules contain "if running interactively" qualifiers for blocking directives', () => {
    const dir = generateProject('small-team', 'nextjs', 'auto-interactive');
    const rulesDir = join(dir, '.claude', 'rules');
    const ruleFiles = readdirSync(rulesDir).filter((f) => f.endsWith('.md'));

    // Collect all rule content
    const allRules = ruleFiles.map((f) => ({
      name: f,
      content: readFileSync(join(rulesDir, f), 'utf8'),
    }));

    // context-discipline.md should have the qualifier
    const contextRule = allRules.find((r) => r.name === 'context-discipline.md');
    expect(contextRule, 'context-discipline.md should exist').toBeDefined();
    expect(contextRule!.content).toContain('if running interactively');

    // security.md should have the qualifier
    const securityRule = allRules.find((r) => r.name === 'security.md');
    expect(securityRule, 'security.md should exist').toBeDefined();
    expect(securityRule!.content).toContain('if running interactively');

    // agent-orchestration.md should have the qualifier (small-team only)
    const orchRule = allRules.find((r) => r.name === 'agent-orchestration.md');
    expect(orchRule, 'agent-orchestration.md should exist').toBeDefined();
    expect(orchRule!.content).toContain('if running interactively');
  });

  // 4. Hook scripts detect non-TTY (CI-safe)
  it('hook scripts contain NO_COLOR / non-TTY detection', () => {
    const dir = generateProject('solo-dev', 'nextjs', 'auto-hooks-tty');
    const hooksDir = join(dir, '.claude', 'hooks');
    const hookFiles = readdirSync(hooksDir).filter((f) => f.endsWith('.sh'));

    expect(hookFiles.length).toBeGreaterThan(0);

    for (const file of hookFiles) {
      const content = readFileSync(join(hooksDir, file), 'utf8');
      expect(content, `${file} should detect non-TTY`).toContain('! -t 1');
      expect(content, `${file} should set NO_COLOR`).toContain('NO_COLOR');
    }
  });

  // 5. Hook scripts have clean exit codes (only 0 and 1)
  it('hook scripts only use exit 0 and exit 1', () => {
    const dir = generateProject('solo-dev', 'nextjs', 'auto-hooks-exit');
    const hooksDir = join(dir, '.claude', 'hooks');
    const hookFiles = readdirSync(hooksDir).filter((f) => f.endsWith('.sh'));

    expect(hookFiles.length).toBeGreaterThan(0);

    for (const file of hookFiles) {
      const content = readFileSync(join(hooksDir, file), 'utf8');

      // Find all explicit exit statements
      const exitMatches = content.match(/exit\s+\d+/g) || [];
      for (const exitStmt of exitMatches) {
        const code = exitStmt.replace('exit', '').trim();
        expect(
          ['0', '1'].includes(code),
          `${file}: unexpected exit code in "${exitStmt}" — only exit 0 and exit 1 are CI-safe`,
        ).toBe(true);
      }
    }
  });

  // 6. Hook scripts have no interactive prompts
  it('hook scripts contain no interactive prompts (read -p, select)', () => {
    const dir = generateProject('solo-dev', 'python-fastapi', 'auto-hooks-noprompt');
    const hooksDir = join(dir, '.claude', 'hooks');
    const hookFiles = readdirSync(hooksDir).filter((f) => f.endsWith('.sh'));

    expect(hookFiles.length).toBeGreaterThan(0);

    for (const file of hookFiles) {
      const content = readFileSync(join(hooksDir, file), 'utf8');
      expect(content, `${file} should not have 'read -p'`).not.toMatch(/read\s+-p/);
      expect(content, `${file} should not have 'select'`).not.toMatch(/\bselect\b/);
    }
  });
});
