import { describe, it, expect, beforeAll } from 'vitest';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import * as TOML from '@iarna/toml';
import { TemplateEngine } from '../engine.js';
import { getContentSet } from '../../registry/index.js';
import type { Preset, Stack } from '../../schemas/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Resolve path to content/templates relative to this test file
// __dirname = packages/core/src/generator/__tests__
// repo root  = ../../../../../../  (5 levels up from __tests__)
const TEMPLATES_DIR = join(__dirname, '..', '..', '..', '..', '..', 'content', 'templates');
const PARTIALS_DIR = join(TEMPLATES_DIR, 'partials');

const PARTIAL_NAMES = [
  'role-mindset',
  'about-gyrd',
  'commands',
  'workflow',
  'shared-state',
  'agent-list',
  'git-workflow',
  'feedback',
] as const;

const MAIN_TEMPLATES = [
  'gyrd-toml',
  'claude-md',
  'agents-md',
  'cursor-mdc',
] as const;

type TemplateMap = Record<string, string>;

let templates: TemplateMap = {};
let partials: TemplateMap = {};

beforeAll(async () => {
  // Load main templates
  for (const name of MAIN_TEMPLATES) {
    templates[name] = await readFile(join(TEMPLATES_DIR, `${name}.hbs`), 'utf8');
  }

  // Load partials
  for (const name of PARTIAL_NAMES) {
    partials[name] = await readFile(join(PARTIALS_DIR, `${name}.hbs`), 'utf8');
  }
});

function buildEngine(): TemplateEngine {
  const engine = new TemplateEngine();
  engine.registerPartials(partials);
  return engine;
}

interface AgentContext {
  name: string;
  description: string;
  model: string;
  memory: string;
  file_ownership: { read: string[]; write: string[] };
}

// Build context with top-level agents array for claude-md / agents-md
function buildClaudeMdContext(preset: Preset, stack: Stack) {
  const contentSet = getContentSet(preset, stack);

  const agents: AgentContext[] = contentSet.agents.map(a => ({
    name: a.id,
    description: `${a.id} agent`,
    model: 'sonnet',
    memory: 'project',
    file_ownership: { read: ['**/*'], write: [] },
  }));

  return {
    gyrd_version: '0.1.0',
    project: {
      name: 'test-project',
      preset,
      stack,
    },
    team: preset === 'small-team' ? { size: 3 } : undefined,
    agents,
    rules: contentSet.rules,
    hooks: contentSet.hooks,
    formats: {
      generate: ['claude_md', 'agents_md', 'cursor_mdc'],
    },
    updates: {
      channel: 'stable',
      auto_check: false,
    },
    presetMeta: contentSet.presetMeta,
  };
}

function buildRigTomlContext(preset: Preset, stack: Stack) {
  return {
    gyrd_version: '0.1.0',
    project: { name: 'test-project', preset, stack },
    team: preset === 'small-team' ? { size: 3 } : undefined,
    agents: {
      tiers: ['oversight', 'planning', 'workers', 'quality', 'specialists'],
      default_memory: 'project',
      worker_model: 'sonnet',
      oversight_model: 'opus',
    },
    hooks: {
      pre_commit: ['lint', 'typecheck'],
    },
    formats: {
      generate: ['claude_md', 'agents_md', 'cursor_mdc'],
    },
    updates: {
      channel: 'stable',
      auto_check: false,
    },
  };
}

describe('gyrd-toml.hbs', () => {
  it('renders valid TOML that parses back cleanly', () => {
    const engine = buildEngine();
    const ctx = buildRigTomlContext('small-team', 'nextjs');
    const output = engine.render(templates['gyrd-toml'] as string, ctx as unknown as Record<string, unknown>);

    // Should be parseable TOML
    const parsed = TOML.parse(output);
    expect(parsed).toBeTruthy();

    // Key fields survive round-trip
    const project = parsed['project'] as Record<string, unknown>;
    expect(project['name']).toBe('test-project');
    expect(project['preset']).toBe('small-team');
    expect(project['stack']).toBe('nextjs');
  });

  it('includes team section when team is provided', () => {
    const engine = buildEngine();
    const ctx = buildRigTomlContext('small-team', 'nextjs');
    const output = engine.render(templates['gyrd-toml'] as string, ctx as unknown as Record<string, unknown>);

    const parsed = TOML.parse(output);
    const team = parsed['team'] as Record<string, unknown>;
    expect(team).toBeTruthy();
    expect(team['size']).toBe(3);
  });
});

describe('claude-md.hbs — all presets get full content', () => {
  it('ALL presets include Discovery Workflow section', () => {
    for (const preset of ['pm', 'small-team', 'solo-dev'] as Preset[]) {
      const engine = buildEngine();
      const ctx = buildClaudeMdContext(preset, 'nextjs');
      const output = engine.render(templates['claude-md'] as string, ctx as unknown as Record<string, unknown>);

      expect(output).toContain('Discovery Workflow');
    }
  });

  it('ALL presets include Agent Pipeline section', () => {
    for (const preset of ['pm', 'small-team', 'solo-dev'] as Preset[]) {
      const engine = buildEngine();
      const ctx = buildClaudeMdContext(preset, 'nextjs');
      const output = engine.render(templates['claude-md'] as string, ctx as unknown as Record<string, unknown>);

      expect(output).toContain('Agent Pipeline');
    }
  });

  it('ALL presets include PROGRESS.md and DECISIONS.md references', () => {
    for (const preset of ['pm', 'small-team', 'solo-dev'] as Preset[]) {
      const engine = buildEngine();
      const ctx = buildClaudeMdContext(preset, 'nextjs');
      const output = engine.render(templates['claude-md'] as string, ctx as unknown as Record<string, unknown>);

      expect(output).toContain('PROGRESS.md');
      expect(output).toContain('DECISIONS.md');
    }
  });

  it('contains [GYRD-MANAGED] markers on all GYRD-owned sections', () => {
    const engine = buildEngine();
    const ctx = buildClaudeMdContext('pm', 'nextjs');
    const output = engine.render(templates['claude-md'] as string, ctx as unknown as Record<string, unknown>);

    const expectedSections = [
      '[GYRD-MANAGED] Role & Mindset',
      '[GYRD-MANAGED] About GYRD',
      '[GYRD-MANAGED] Commands',
      '[GYRD-MANAGED] Workflow',
      '[GYRD-MANAGED] Agents',
      '[GYRD-MANAGED] Shared State',
      '[GYRD-MANAGED] Git & Safety',
      '[GYRD-MANAGED] Feedback',
    ];

    for (const section of expectedSections) {
      expect(output).toContain(section);
    }
  });
});

describe('claude-md.hbs — preset-specific onboarding (tone only)', () => {
  it('PM preset includes About GYRD with PM-specific onboarding', () => {
    const engine = buildEngine();
    const ctx = buildClaudeMdContext('pm', 'nextjs');
    const output = engine.render(templates['claude-md'] as string, ctx as unknown as Record<string, unknown>);

    expect(output).toContain('About GYRD');
    // PM-specific onboarding text
    expect(output).toContain('discovery workflow');
  });

  it('small-team preset includes About GYRD with PROGRESS.md reference', () => {
    const engine = buildEngine();
    const ctx = buildClaudeMdContext('small-team', 'nextjs');
    const output = engine.render(templates['claude-md'] as string, ctx as unknown as Record<string, unknown>);

    expect(output).toContain('PROGRESS.md');
  });

  it('ALL presets contain [GYRD-MANAGED] markers', () => {
    for (const preset of ['pm', 'small-team', 'solo-dev'] as Preset[]) {
      const engine = buildEngine();
      const ctx = buildClaudeMdContext(preset, 'nextjs');
      const output = engine.render(templates['claude-md'] as string, ctx as unknown as Record<string, unknown>);

      expect(output).toContain('[GYRD-MANAGED]');
      const markerCount = (output.match(/\[GYRD-MANAGED\]/g) ?? []).length;
      // At least 8 managed sections
      expect(markerCount).toBeGreaterThanOrEqual(8);
    }
  });

  it('ALL presets include Feedback section', () => {
    for (const preset of ['pm', 'small-team', 'solo-dev'] as Preset[]) {
      const engine = buildEngine();
      const ctx = buildClaudeMdContext(preset, 'nextjs');
      const output = engine.render(templates['claude-md'] as string, ctx as unknown as Record<string, unknown>);

      expect(output).toContain('[GYRD-MANAGED] Feedback');
      expect(output).toContain('capture their feedback');
    }
  });
});

describe('agents-md.hbs', () => {
  it('renders markdown with agent list', () => {
    const engine = buildEngine();
    const ctx = buildClaudeMdContext('small-team', 'nextjs');
    const output = engine.render(templates['agents-md'] as string, ctx as unknown as Record<string, unknown>);

    // Should contain AGENTS.md header
    expect(output).toContain('# AGENTS.md');
    // Should list agents from the content set
    expect(output).toContain('code-reviewer');
    // Should show rules section
    expect(output).toContain('## Rules');
  });

  it('renders quality gates section specific to preset', () => {
    const engine = buildEngine();
    const smallTeamCtx = buildClaudeMdContext('small-team', 'nextjs');
    const output = engine.render(templates['agents-md'] as string, smallTeamCtx as unknown as Record<string, unknown>);

    expect(output).toContain('Full pipeline');
  });
});

describe('cursor-mdc.hbs', () => {
  it('renders with frontmatter (description, globs, alwaysApply)', () => {
    const engine = buildEngine();
    const ctx = {
      description: 'Context discipline rules',
      globs: 'src/**/*.ts',
      alwaysApply: true,
      content: 'Never scan node_modules.',
    };
    const output = engine.render(templates['cursor-mdc'] as string, ctx);

    expect(output).toContain('---');
    expect(output).toContain('description: Context discipline rules');
    expect(output).toContain('globs: src/**/*.ts');
    expect(output).toContain('alwaysApply: true');
    expect(output).toContain('Never scan node_modules.');
  });

  it('uses **/* as default globs when not provided', () => {
    const engine = buildEngine();
    const ctx = {
      description: 'Security rules',
      alwaysApply: false,
      content: 'Never read .env files.',
    };
    const output = engine.render(templates['cursor-mdc'] as string, ctx);

    expect(output).toContain('globs: **/*');
    expect(output).toContain('alwaysApply: false');
  });
});
