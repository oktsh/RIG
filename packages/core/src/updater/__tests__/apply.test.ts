import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, writeFile, readFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { applyUpdate } from '../apply.js';
import { computeHash } from '../../utils/index.js';
import type { Manifest } from '../../schemas/index.js';
import type { UpdatePlan, FileChange } from '../types.js';

function makeManifest(
  files: Record<string, string>,
  version = '0.1.0',
): Manifest {
  return {
    rig_version: version,
    generated_at: '2026-01-01T00:00:00Z',
    config_hash: 'abc123',
    components: {
      agents: { version, count: 0, schema: 'agent-frontmatter-v1' },
      hooks: { version, count: 0 },
      rules: { version, count: 0 },
      formats: {},
      templates: { version, count: 0 },
    },
    compatibility: {},
    files,
  };
}

function makePlan(changes: { component: string; files: FileChange[] }[]): UpdatePlan {
  return {
    currentVersion: '0.1.0',
    newVersion: '0.2.0',
    changes: changes.map((c) => ({
      component: c.component,
      currentVersion: '0.1.0',
      newVersion: '0.2.0',
      files: c.files,
    })),
    hasChanges: true,
  };
}

describe('applyUpdate', () => {
  let projectDir: string;
  let newDir: string;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'rig-apply-project-'));
    newDir = await mkdtemp(join(tmpdir(), 'rig-apply-new-'));
    // Create .rig dir for manifest writes
    await mkdir(join(projectDir, '.rig'), { recursive: true });
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
    await rm(newDir, { recursive: true, force: true });
  });

  it('updates unmodified files', async () => {
    const originalContent = 'original rule';
    const newContent = 'updated rule';

    // Write original file in project dir
    await mkdir(join(projectDir, '.claude', 'rules'), { recursive: true });
    await writeFile(join(projectDir, '.claude', 'rules', 'security.md'), originalContent);

    // Write new file in new dir
    await mkdir(join(newDir, '.claude', 'rules'), { recursive: true });
    await writeFile(join(newDir, '.claude', 'rules', 'security.md'), newContent);

    const currentManifest = makeManifest({
      '.claude/rules/security.md': computeHash(originalContent),
    });
    const newManifest = makeManifest({
      '.claude/rules/security.md': computeHash(newContent),
    }, '0.2.0');

    const plan = makePlan([
      {
        component: 'rules',
        files: [{ path: '.claude/rules/security.md', action: 'update', customized: false }],
      },
    ]);

    const result = await applyUpdate(plan, projectDir, newDir, currentManifest, newManifest);

    expect(result.applied).toHaveLength(1);
    expect(result.skipped).toHaveLength(0);

    const updatedContent = await readFile(
      join(projectDir, '.claude', 'rules', 'security.md'),
      'utf8',
    );
    expect(updatedContent).toBe(newContent);
  });

  it('preserves customized files (not overwritten)', async () => {
    const userContent = 'user customized this';
    const newContent = 'rig updated version';

    await mkdir(join(projectDir, '.claude', 'rules'), { recursive: true });
    await writeFile(join(projectDir, '.claude', 'rules', 'security.md'), userContent);

    await mkdir(join(newDir, '.claude', 'rules'), { recursive: true });
    await writeFile(join(newDir, '.claude', 'rules', 'security.md'), newContent);

    const currentManifest = makeManifest({
      '.claude/rules/security.md': computeHash('original before user edit'),
    });
    const newManifest = makeManifest({
      '.claude/rules/security.md': computeHash(newContent),
    }, '0.2.0');

    const plan = makePlan([
      {
        component: 'rules',
        files: [{ path: '.claude/rules/security.md', action: 'update', customized: true }],
      },
    ]);

    const result = await applyUpdate(plan, projectDir, newDir, currentManifest, newManifest);

    expect(result.skipped).toHaveLength(1);
    expect(result.skipped[0].path).toBe('.claude/rules/security.md');

    // File should NOT be changed
    const content = await readFile(
      join(projectDir, '.claude', 'rules', 'security.md'),
      'utf8',
    );
    expect(content).toBe(userContent);
  });

  it('uses merge strategy for customized CLAUDE.md', async () => {
    const existingClaude = `# My Project

> Custom header

## [RIG-MANAGED] Agents

Old agents

## My Notes

Keep these notes
`;

    const newClaude = `# Default

> RIG header

## [RIG-MANAGED] Agents

New agents
`;

    await writeFile(join(projectDir, 'CLAUDE.md'), existingClaude);
    await writeFile(join(newDir, 'CLAUDE.md'), newClaude);

    const currentManifest = makeManifest({
      'CLAUDE.md': computeHash('some older version'),
    });
    const newManifest = makeManifest({
      'CLAUDE.md': computeHash(newClaude),
    }, '0.2.0');

    const plan = makePlan([
      {
        component: 'formats',
        files: [{ path: 'CLAUDE.md', action: 'update', customized: true }],
      },
    ]);

    const result = await applyUpdate(plan, projectDir, newDir, currentManifest, newManifest);

    expect(result.applied).toHaveLength(1);

    const mergedContent = await readFile(join(projectDir, 'CLAUDE.md'), 'utf8');
    expect(mergedContent).toContain('New agents'); // RIG section updated
    expect(mergedContent).toContain('My Notes'); // User section preserved
    expect(mergedContent).toContain('Custom header'); // Existing header preserved
  });

  it('does not modify files in dry-run mode', async () => {
    const originalContent = 'original';
    const newContent = 'new';

    await mkdir(join(projectDir, '.claude', 'rules'), { recursive: true });
    await writeFile(join(projectDir, '.claude', 'rules', 'security.md'), originalContent);

    await mkdir(join(newDir, '.claude', 'rules'), { recursive: true });
    await writeFile(join(newDir, '.claude', 'rules', 'security.md'), newContent);

    const currentManifest = makeManifest({
      '.claude/rules/security.md': computeHash(originalContent),
    });
    const newManifest = makeManifest({
      '.claude/rules/security.md': computeHash(newContent),
    }, '0.2.0');

    const plan = makePlan([
      {
        component: 'rules',
        files: [{ path: '.claude/rules/security.md', action: 'update', customized: false }],
      },
    ]);

    const result = await applyUpdate(plan, projectDir, newDir, currentManifest, newManifest, {
      dryRun: true,
    });

    expect(result.applied).toHaveLength(1);

    // File should NOT be changed
    const content = await readFile(
      join(projectDir, '.claude', 'rules', 'security.md'),
      'utf8',
    );
    expect(content).toBe(originalContent);
  });

  it('filters by component', async () => {
    const ruleContent = 'rule content';
    const agentContent = 'agent content';

    await mkdir(join(projectDir, '.claude', 'rules'), { recursive: true });
    await mkdir(join(projectDir, '.claude', 'agents'), { recursive: true });
    await writeFile(join(projectDir, '.claude', 'rules', 'security.md'), 'old rule');
    await writeFile(join(projectDir, '.claude', 'agents', 'reviewer.md'), 'old agent');

    await mkdir(join(newDir, '.claude', 'rules'), { recursive: true });
    await mkdir(join(newDir, '.claude', 'agents'), { recursive: true });
    await writeFile(join(newDir, '.claude', 'rules', 'security.md'), ruleContent);
    await writeFile(join(newDir, '.claude', 'agents', 'reviewer.md'), agentContent);

    const currentManifest = makeManifest({
      '.claude/rules/security.md': computeHash('old rule'),
      '.claude/agents/reviewer.md': computeHash('old agent'),
    });
    const newManifest = makeManifest({
      '.claude/rules/security.md': computeHash(ruleContent),
      '.claude/agents/reviewer.md': computeHash(agentContent),
    }, '0.2.0');

    const plan = makePlan([
      {
        component: 'rules',
        files: [{ path: '.claude/rules/security.md', action: 'update', customized: false }],
      },
      {
        component: 'agents',
        files: [{ path: '.claude/agents/reviewer.md', action: 'update', customized: false }],
      },
    ]);

    const result = await applyUpdate(plan, projectDir, newDir, currentManifest, newManifest, {
      component: 'rules',
    });

    // Only rules should be updated
    expect(result.applied).toHaveLength(1);
    expect(result.applied[0].path).toBe('.claude/rules/security.md');

    // Agent file should NOT be changed
    const agent = await readFile(join(projectDir, '.claude', 'agents', 'reviewer.md'), 'utf8');
    expect(agent).toBe('old agent');
  });

  it('updates manifest after apply', async () => {
    const newContent = 'new rule content';

    await mkdir(join(projectDir, '.claude', 'rules'), { recursive: true });
    await writeFile(join(projectDir, '.claude', 'rules', 'security.md'), 'old');

    await mkdir(join(newDir, '.claude', 'rules'), { recursive: true });
    await writeFile(join(newDir, '.claude', 'rules', 'security.md'), newContent);

    const currentManifest = makeManifest({
      '.claude/rules/security.md': computeHash('old'),
    });
    const newManifest = makeManifest({
      '.claude/rules/security.md': computeHash(newContent),
    }, '0.2.0');

    const plan = makePlan([
      {
        component: 'rules',
        files: [{ path: '.claude/rules/security.md', action: 'update', customized: false }],
      },
    ]);

    await applyUpdate(plan, projectDir, newDir, currentManifest, newManifest);

    // Manifest should be written
    const manifestContent = await readFile(join(projectDir, '.rig', 'manifest.yaml'), 'utf8');
    expect(manifestContent).toContain('0.2.0');
  });
});
