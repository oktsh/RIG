/**
 * E2E tests for create-rig CLI.
 *
 * Runs the *built* CLI binary (`packages/create-rig/dist/index.js`) inside
 * disposable temp directories and validates generated output — file structure,
 * content quality, manifest integrity, and preset-specific behavior.
 *
 * These tests complement (not duplicate) the unit-level CLI tests at
 * `packages/create-rig/src/__tests__/cli.test.ts` and the generator tests at
 * `packages/core/src/generator/__tests__/generate.test.ts`.
 */

import { describe, it, expect, afterEach } from 'vitest';
import { execSync } from 'node:child_process';
import {
  mkdtempSync,
  readFileSync,
  existsSync,
  statSync,
  readdirSync,
  rmSync,
} from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { parse as parseToml } from '@iarna/toml';
import { parse as parseYaml } from 'yaml';
import { computeHash } from '@rig/core';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RIG_ROOT = join(import.meta.dirname, '..', '..');
const CLI_PATH = join(RIG_ROOT, 'packages', 'create-rig', 'dist', 'index.js');

const PRESETS = ['pm', 'small-team', 'solo-dev'] as const;
const STACKS = ['nextjs', 'python-fastapi'] as const;

// All presets now get the same 9 agents
const EXPECTED_AGENTS = [
  'code-reviewer',
  'verification',
  'tech-lead',
  'spec-writer',
  'spec-planner',
  'task-breakdown',
  'frontend-react',
  'python-dev',
  'debugger',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let tempDirs: string[] = [];

function makeTmpDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'rig-e2e-'));
  tempDirs.push(dir);
  return dir;
}

function runCreate(args: string, cwd: string): string {
  return execSync(`node ${CLI_PATH} ${args}`, {
    cwd,
    encoding: 'utf8',
    timeout: 30_000,
    env: { ...process.env, NODE_NO_WARNINGS: '1' },
    stdio: ['pipe', 'pipe', 'pipe'],
  });
}

function listFiles(dir: string, prefix = ''): string[] {
  const entries: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      entries.push(...listFiles(join(dir, entry.name), rel));
    } else {
      entries.push(rel);
    }
  }
  return entries;
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

describe('create-rig E2E', () => {
  // 1. Solo-dev + nextjs — all expected file categories exist
  it('solo-dev + nextjs generates all expected file categories', () => {
    const dir = makeTmpDir();
    runCreate('--preset=solo-dev --stack=nextjs --name=test-solo', dir);

    expect(existsSync(join(dir, 'rig.toml'))).toBe(true);
    expect(existsSync(join(dir, 'CLAUDE.md'))).toBe(true);
    expect(existsSync(join(dir, 'AGENTS.md'))).toBe(true);
    expect(existsSync(join(dir, '.rig', 'manifest.yaml'))).toBe(true);

    // .claude/agents/ must contain agent .md files
    const agentsDir = join(dir, '.claude', 'agents');
    expect(existsSync(agentsDir)).toBe(true);
    const agentFiles = readdirSync(agentsDir).filter((f) => f.endsWith('.md'));
    expect(agentFiles.length).toBeGreaterThan(0);

    // .claude/rules/
    const rulesDir = join(dir, '.claude', 'rules');
    expect(existsSync(rulesDir)).toBe(true);
    const ruleFiles = readdirSync(rulesDir).filter((f) => f.endsWith('.md'));
    expect(ruleFiles.length).toBeGreaterThan(0);

    // .claude/hooks/
    const hooksDir = join(dir, '.claude', 'hooks');
    expect(existsSync(hooksDir)).toBe(true);
    const hookFiles = readdirSync(hooksDir);
    expect(hookFiles.length).toBeGreaterThan(0);

    // .cursor/rules/ with .mdc files
    const cursorDir = join(dir, '.cursor', 'rules');
    expect(existsSync(cursorDir)).toBe(true);
    const mdcFiles = readdirSync(cursorDir).filter((f) => f.endsWith('.mdc'));
    expect(mdcFiles.length).toBeGreaterThan(0);
  });

  // 2. ALL presets generate exactly 9 agent files (unified core set)
  it('small-team + python-fastapi generates 9 expected agent files', () => {
    const dir = makeTmpDir();
    runCreate('--preset=small-team --stack=python-fastapi --name=test-team', dir);

    const agentsDir = join(dir, '.claude', 'agents');
    const agents = readdirSync(agentsDir).filter((f) => f.endsWith('.md'));
    const agentNames = agents.map((f) => f.replace('.md', ''));

    for (const expected of EXPECTED_AGENTS) {
      expect(agentNames).toContain(expected);
    }

    expect(agents.length).toBe(9);
  });

  // 3. PM + nextjs — now generates 9 agents (same as all presets)
  it('pm + nextjs generates 9 expected agent files', () => {
    const dir = makeTmpDir();
    runCreate('--preset=pm --stack=nextjs --name=test-pm', dir);

    const agentsDir = join(dir, '.claude', 'agents');
    const agents = readdirSync(agentsDir).filter((f) => f.endsWith('.md'));
    const agentNames = agents.map((f) => f.replace('.md', ''));

    for (const expected of EXPECTED_AGENTS) {
      expect(agentNames).toContain(expected);
    }

    expect(agents.length).toBe(9);
  });

  // 4. All 6 preset+stack combos generate without error
  it.each(
    PRESETS.flatMap((preset) =>
      STACKS.map((stack) => ({ preset, stack })),
    ),
  )('$preset + $stack generates without error', ({ preset, stack }) => {
    const dir = makeTmpDir();
    const name = `test-${preset}-${stack}`;
    // Should not throw
    const output = runCreate(`--preset=${preset} --stack=${stack} --name=${name}`, dir);
    expect(output).toContain('Generated');
    expect(existsSync(join(dir, 'rig.toml'))).toBe(true);
  });

  // 5. All agent files parse — valid YAML frontmatter
  it('all agent files have valid YAML frontmatter with required fields', () => {
    const dir = makeTmpDir();
    runCreate('--preset=small-team --stack=nextjs --name=test-frontmatter', dir);

    const agentsDir = join(dir, '.claude', 'agents');
    const agentFiles = readdirSync(agentsDir).filter((f) => f.endsWith('.md'));

    expect(agentFiles.length).toBeGreaterThan(0);

    for (const file of agentFiles) {
      const content = readFileSync(join(agentsDir, file), 'utf8');

      // Must start with ---
      expect(content.startsWith('---'), `${file} should start with ---`).toBe(true);

      // Extract frontmatter between first and second ---
      const secondDash = content.indexOf('---', 3);
      expect(secondDash, `${file} should have closing ---`).toBeGreaterThan(3);

      const yamlBlock = content.slice(3, secondDash).trim();
      const parsed = parseYaml(yamlBlock) as Record<string, unknown>;

      // Required fields per AgentFrontmatterSchema
      expect(parsed, `${file} frontmatter`).toHaveProperty('name');
      expect(parsed, `${file} frontmatter`).toHaveProperty('description');
      expect(parsed, `${file} frontmatter`).toHaveProperty('model');

      // model must be one of the valid values
      expect(['opus', 'sonnet', 'haiku']).toContain(parsed.model);
    }
  });

  // 6. All hooks are executable
  it('all hook files have the executable bit set', () => {
    const dir = makeTmpDir();
    runCreate('--preset=solo-dev --stack=nextjs --name=test-hooks', dir);

    const hooksDir = join(dir, '.claude', 'hooks');
    if (!existsSync(hooksDir)) return; // skip if no hooks

    const hookFiles = readdirSync(hooksDir);
    expect(hookFiles.length).toBeGreaterThan(0);

    for (const file of hookFiles) {
      const st = statSync(join(hooksDir, file));
      const isExecutable = (st.mode & 0o111) !== 0;
      expect(isExecutable, `${file} should be executable`).toBe(true);
    }
  });

  // 7. Manifest integrity — hashes match actual file content
  it('manifest file hashes match actual file content on disk', () => {
    const dir = makeTmpDir();
    runCreate('--preset=solo-dev --stack=nextjs --name=test-manifest', dir);

    const manifestPath = join(dir, '.rig', 'manifest.yaml');
    expect(existsSync(manifestPath)).toBe(true);

    const manifestRaw = readFileSync(manifestPath, 'utf8');
    const manifest = parseYaml(manifestRaw) as Record<string, unknown>;
    const fileHashes = manifest.files as Record<string, string>;

    expect(Object.keys(fileHashes).length).toBeGreaterThan(0);

    for (const [relativePath, expectedHash] of Object.entries(fileHashes)) {
      const fullPath = join(dir, relativePath);
      expect(existsSync(fullPath), `${relativePath} should exist on disk`).toBe(true);

      const content = readFileSync(fullPath, 'utf8');
      const actualHash = computeHash(content);
      expect(actualHash, `hash mismatch for ${relativePath}`).toBe(expectedHash);
    }
  });

  // 8. AGENTS.md non-empty and contains agent listing
  it('AGENTS.md contains agent section with agent names', () => {
    const dir = makeTmpDir();
    runCreate('--preset=small-team --stack=nextjs --name=test-agents-md', dir);

    const agentsMd = readFileSync(join(dir, 'AGENTS.md'), 'utf8');
    expect(agentsMd.length).toBeGreaterThan(0);

    // Should contain an "Agents" section header
    expect(agentsMd).toMatch(/##.*[Aa]gent/);

    // Should reference at least some agent names
    expect(agentsMd).toContain('code-reviewer');
    expect(agentsMd).toContain('tech-lead');
  });

  // 9. Cursor MDC files exist and have frontmatter
  it('.cursor/rules/*.mdc files start with frontmatter', () => {
    const dir = makeTmpDir();
    runCreate('--preset=solo-dev --stack=nextjs --name=test-cursor', dir);

    const cursorDir = join(dir, '.cursor', 'rules');
    const mdcFiles = readdirSync(cursorDir).filter((f) => f.endsWith('.mdc'));

    expect(mdcFiles.length).toBeGreaterThan(0);

    for (const file of mdcFiles) {
      const content = readFileSync(join(cursorDir, file), 'utf8');
      expect(content.startsWith('---'), `${file} should start with ---`).toBe(true);
    }
  });

  // 10. LLM-native onboarding (AC-RIG-048)
  describe('LLM-native onboarding in CLAUDE.md', () => {
    it('contains [RIG-MANAGED] About RIG section', () => {
      const dir = makeTmpDir();
      runCreate('--preset=solo-dev --stack=nextjs --name=test-onboard', dir);

      const claudeMd = readFileSync(join(dir, 'CLAUDE.md'), 'utf8');
      expect(claudeMd).toContain('[RIG-MANAGED] About RIG');
    });

    it('PM preset includes PM-specific onboarding text', () => {
      const dir = makeTmpDir();
      runCreate('--preset=pm --stack=nextjs --name=test-pm-onboard', dir);

      const claudeMd = readFileSync(join(dir, 'CLAUDE.md'), 'utf8');
      // PM template says "Tell me what you want to build"
      expect(claudeMd).toMatch(/[Tt]ell me what you want to build/);
    });

    it('small-team preset references PROGRESS.md/DECISIONS.md', () => {
      const dir = makeTmpDir();
      runCreate('--preset=small-team --stack=nextjs --name=test-team-onboard', dir);

      const claudeMd = readFileSync(join(dir, 'CLAUDE.md'), 'utf8');
      expect(claudeMd).toContain('PROGRESS.md');
      expect(claudeMd).toContain('DECISIONS.md');
    });

    it('solo-dev preset includes minimal "Just code" onboarding', () => {
      const dir = makeTmpDir();
      runCreate('--preset=solo-dev --stack=nextjs --name=test-solo-onboard', dir);

      const claudeMd = readFileSync(join(dir, 'CLAUDE.md'), 'utf8');
      expect(claudeMd).toMatch(/[Jj]ust code/);
    });
  });

  // 11. RIG-MANAGED markers on all RIG-owned sections
  it('CLAUDE.md has >= 5 [RIG-MANAGED] markers', () => {
    const dir = makeTmpDir();
    runCreate('--preset=small-team --stack=nextjs --name=test-markers', dir);

    const claudeMd = readFileSync(join(dir, 'CLAUDE.md'), 'utf8');
    const markerCount = (claudeMd.match(/\[RIG-MANAGED\]/g) || []).length;
    expect(markerCount).toBeGreaterThanOrEqual(5);
  });

  // 12. rig.toml is valid TOML and matches input
  it('rig.toml is valid TOML with correct preset and stack', () => {
    const dir = makeTmpDir();
    runCreate('--preset=small-team --stack=python-fastapi --name=my-project', dir);

    const raw = readFileSync(join(dir, 'rig.toml'), 'utf8');
    const parsed = parseToml(raw) as Record<string, unknown>;

    expect(parsed).toHaveProperty('project');
    const project = parsed.project as Record<string, unknown>;
    expect(project.name).toBe('my-project');
    expect(project.preset).toBe('small-team');
    expect(project.stack).toBe('python-fastapi');
  });

  // 13. Manifest schema validity
  it('manifest.yaml has required schema fields', () => {
    const dir = makeTmpDir();
    runCreate('--preset=solo-dev --stack=nextjs --name=test-manifest-schema', dir);

    const raw = readFileSync(join(dir, '.rig', 'manifest.yaml'), 'utf8');
    const manifest = parseYaml(raw) as Record<string, unknown>;

    expect(manifest).toHaveProperty('rig_version');
    expect(manifest).toHaveProperty('generated_at');
    expect(manifest).toHaveProperty('config_hash');
    expect(manifest).toHaveProperty('components');
    expect(manifest).toHaveProperty('files');

    const components = manifest.components as Record<string, unknown>;
    expect(components).toHaveProperty('agents');
    expect(components).toHaveProperty('hooks');
    expect(components).toHaveProperty('rules');
    expect(components).toHaveProperty('formats');
    expect(components).toHaveProperty('templates');
  });

  // 14. All presets generate same number of agents (unified)
  it('all presets generate the same 9 agents', () => {
    const dirs: Record<string, string> = {};
    for (const preset of PRESETS) {
      dirs[preset] = makeTmpDir();
      runCreate(`--preset=${preset} --stack=nextjs --name=test-${preset}-count`, dirs[preset]!);
    }

    const counts = PRESETS.map((preset) => {
      const agentsDir = join(dirs[preset]!, '.claude', 'agents');
      return readdirSync(agentsDir).filter((f) => f.endsWith('.md')).length;
    });

    // All presets should have exactly 9 agents
    for (const count of counts) {
      expect(count).toBe(9);
    }
  });
});
