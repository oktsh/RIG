/**
 * Unit tests for the doctor framework.
 *
 * Uses generateProject() to create a fresh project in a temp dir,
 * then runs doctor checks against it.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { generateProject } from '../../generator/index.js';
import { runChecks } from '../index.js';
import type { GyrdConfig } from '../../schemas/index.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const THIS_DIR = dirname(fileURLToPath(import.meta.url));
const CONTENT_ROOT = join(THIS_DIR, '..', '..', '..', '..', '..', 'content');

const TEST_CONFIG: GyrdConfig = {
  project: {
    name: 'doctor-test',
    preset: 'solo-dev',
    stack: 'nextjs',
  },
};

let tempDir: string;

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), 'rig-doctor-test-'));
});

afterEach(() => {
  rmSync(tempDir, { recursive: true, force: true });
});

async function createFreshProject(): Promise<void> {
  await generateProject(TEST_CONFIG, tempDir, { contentRoot: CONTENT_ROOT });
  // Ensure .gitignore with required patterns exists
  writeFileSync(join(tempDir, '.gitignore'), '.env*\n*.pem\n*.key\nnode_modules/\n');
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('doctor checks', () => {
  // 1. Fresh project -> all checks PASS
  it('fresh project — all checks PASS', async () => {
    await createFreshProject();

    const result = await runChecks(tempDir, { contentRoot: CONTENT_ROOT });

    expect(result.overall).toBe('pass');
    for (const check of result.checks) {
      expect(check.status, `${check.name} should pass: ${check.message}`).toBe('pass');
    }
  });

  // 2. Delete an agent file — schema-freshness still PASS (only checks existing files)
  it('delete an agent file — schema-freshness still PASS', async () => {
    await createFreshProject();

    // Find and delete one agent file
    const { readdirSync } = await import('node:fs');
    const agentFiles = readdirSync(join(tempDir, '.claude', 'agents')).filter((f: string) => f.endsWith('.md'));
    if (agentFiles.length > 0) {
      unlinkSync(join(tempDir, '.claude', 'agents', agentFiles[0]));
    }

    const result = await runChecks(tempDir, { contentRoot: CONTENT_ROOT });

    const schemaCheck = result.checks.find((c) => c.name === 'schema-freshness');
    expect(schemaCheck).toBeDefined();
    expect(schemaCheck!.status).toBe('pass');
  });

  // 3. Modify CLAUDE.md content — format-sync WARN
  it('modify CLAUDE.md — format-sync WARN', async () => {
    await createFreshProject();

    // Append junk to CLAUDE.md to make it drift
    const claudePath = join(tempDir, 'CLAUDE.md');
    const { readFileSync } = await import('node:fs');
    const original = readFileSync(claudePath, 'utf8');
    writeFileSync(claudePath, original + '\n\n<!-- user modification -->');

    const result = await runChecks(tempDir, { contentRoot: CONTENT_ROOT });

    const formatCheck = result.checks.find((c) => c.name === 'format-sync');
    expect(formatCheck).toBeDefined();
    expect(formatCheck!.status).toBe('warn');
    expect(formatCheck!.remediation).toContain('gyrd generate');
  });

  // 4. Remove .claude/hooks/ — hook-coverage FAIL
  it('remove hooks dir — hook-coverage FAIL', async () => {
    await createFreshProject();

    rmSync(join(tempDir, '.claude', 'hooks'), { recursive: true, force: true });

    const result = await runChecks(tempDir, { contentRoot: CONTENT_ROOT });

    const hookCheck = result.checks.find((c) => c.name === 'hook-coverage');
    expect(hookCheck).toBeDefined();
    expect(hookCheck!.status).toBe('fail');
    expect(hookCheck!.remediation).toContain('gyrd generate');
  });

  // 5. Missing .gitignore — security-baseline WARN
  it('missing .gitignore — security-baseline WARN', async () => {
    await createFreshProject();

    // Remove .gitignore
    try {
      unlinkSync(join(tempDir, '.gitignore'));
    } catch {
      // May not exist, that's fine
    }

    const result = await runChecks(tempDir, { contentRoot: CONTENT_ROOT });

    const securityCheck = result.checks.find((c) => c.name === 'security-baseline');
    expect(securityCheck).toBeDefined();
    expect(securityCheck!.status).toBe('warn');
  });

  // 6. Overall status = worst individual
  it('overall status is worst of individual statuses', async () => {
    await createFreshProject();

    // Cause a FAIL (remove hooks)
    rmSync(join(tempDir, '.claude', 'hooks'), { recursive: true, force: true });
    // Cause a WARN (modify CLAUDE.md)
    const { readFileSync } = await import('node:fs');
    const claudePath = join(tempDir, 'CLAUDE.md');
    writeFileSync(claudePath, readFileSync(claudePath, 'utf8') + '\n<!-- drift -->');

    const result = await runChecks(tempDir, { contentRoot: CONTENT_ROOT });

    // Should have at least one fail and one warn
    const statuses = result.checks.map((c) => c.status);
    expect(statuses).toContain('fail');
    expect(statuses).toContain('warn');
    // Overall should be fail (worst)
    expect(result.overall).toBe('fail');
  });

  // 7. All checks return proper structure
  it('all checks return proper structure (name, status, message)', async () => {
    await createFreshProject();

    const result = await runChecks(tempDir, { contentRoot: CONTENT_ROOT });

    expect(result.checks.length).toBe(8);
    for (const check of result.checks) {
      expect(check).toHaveProperty('name');
      expect(check).toHaveProperty('status');
      expect(check).toHaveProperty('message');
      expect(typeof check.name).toBe('string');
      expect(['pass', 'warn', 'fail']).toContain(check.status);
      expect(typeof check.message).toBe('string');
      expect(check.message.length).toBeGreaterThan(0);
    }
  });

  // 8. All checks are offline (no network)
  it('all checks complete without network (offline)', async () => {
    await createFreshProject();

    // If any check tried to fetch from network, it would hang/fail
    // with a reasonable timeout. The fact this test completes fast = offline.
    const start = performance.now();
    const result = await runChecks(tempDir, { contentRoot: CONTENT_ROOT });
    const elapsed = performance.now() - start;

    expect(result.checks.length).toBe(8);
    // All checks combined should complete in under 10 seconds (generous for CI)
    expect(elapsed).toBeLessThan(10_000);
  });

  // 9. Dead references — WARN when CLAUDE.md references nonexistent file
  it('dead references detected in CLAUDE.md', async () => {
    await createFreshProject();

    // Add a reference to a nonexistent file in CLAUDE.md
    const claudePath = join(tempDir, 'CLAUDE.md');
    const { readFileSync } = await import('node:fs');
    const content = readFileSync(claudePath, 'utf8');
    writeFileSync(claudePath, content + '\n\nSee `.claude/agents/nonexistent-agent.md` for details.\n');

    const result = await runChecks(tempDir, { contentRoot: CONTENT_ROOT });

    const deadCheck = result.checks.find((c) => c.name === 'dead-references');
    expect(deadCheck).toBeDefined();
    expect(deadCheck!.status).toBe('warn');
    expect(deadCheck!.message).toContain('dead reference');
  });

  // 10. No gyrd.toml — config FAIL
  it('no gyrd.toml — fails fast with config error', async () => {
    // Don't create a project, just use empty temp dir
    const result = await runChecks(tempDir);

    expect(result.overall).toBe('fail');
    expect(result.checks.length).toBe(1);
    expect(result.checks[0].name).toBe('config');
  });
});
