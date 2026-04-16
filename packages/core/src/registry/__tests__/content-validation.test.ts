import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { AgentFrontmatterSchema } from '../../schemas/agent.js';
import {
  CORE_AGENTS,
  CORE_RULES,
  CORE_WORKFLOWS,
  CORE_PROTOCOLS,
  SHARED_TEMPLATES,
} from '../presets.js';
import { STACK_OVERLAYS } from '../stacks.js';
import * as yaml from 'yaml';
import type { AgentDef, RuleDef, HookDef, WorkflowDef, ProtocolDef, TemplateDef } from '../types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// packages/core/src/registry/__tests__ -> content/
const CONTENT_DIR = resolve(__dirname, '..', '..', '..', '..', '..', 'content');

// --- Path resolvers ---

function agentPath(agent: AgentDef): string {
  return join(CONTENT_DIR, 'presets', agent.preset, 'agents', agent.filename);
}

function rulePath(rule: RuleDef): string {
  return join(CONTENT_DIR, 'presets', rule.preset, 'rules', rule.filename);
}

function hookPath(hook: HookDef): string {
  return join(CONTENT_DIR, 'stacks', hook.stack, 'hooks', hook.filename);
}

function workflowPath(wf: WorkflowDef): string {
  return join(CONTENT_DIR, 'presets', wf.preset, 'workflows', wf.filename);
}

function protocolPath(proto: ProtocolDef): string {
  return join(CONTENT_DIR, 'presets', proto.preset, 'protocols', proto.filename);
}

function templatePath(tmpl: TemplateDef): string {
  return join(CONTENT_DIR, 'presets', 'shared', 'templates', tmpl.filename);
}

/** Extract YAML frontmatter from markdown content */
function extractFrontmatter(content: string): Record<string, unknown> | null {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  return yaml.parse(match[1]!) as Record<string, unknown>;
}

// All hooks from all stacks
const ALL_HOOKS: HookDef[] = Object.values(STACK_OVERLAYS).flatMap(o => o.hooks);

describe('Content validation — agent files', () => {
  it('every agent file in every preset has valid YAML frontmatter', () => {
    for (const agent of CORE_AGENTS) {
      const filePath = agentPath(agent);
      expect(existsSync(filePath), `Agent file missing: ${filePath}`).toBe(true);

      const content = readFileSync(filePath, 'utf-8');
      const frontmatter = extractFrontmatter(content);
      expect(frontmatter, `Missing frontmatter in ${agent.id} (${filePath})`).not.toBeNull();

      const result = AgentFrontmatterSchema.safeParse(frontmatter);
      expect(
        result.success,
        `Invalid frontmatter in ${agent.id}: ${JSON.stringify((result as { error?: { issues: unknown[] } }).error?.issues ?? [])}`,
      ).toBe(true);
    }
  });

  it('every agent file has non-empty markdown body after frontmatter', () => {
    for (const agent of CORE_AGENTS) {
      const content = readFileSync(agentPath(agent), 'utf-8');
      const bodyMatch = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
      expect(bodyMatch, `No body after frontmatter in ${agent.id}`).not.toBeNull();
      const body = bodyMatch![1]!.trim();
      expect(body.length, `Empty body in ${agent.id}`).toBeGreaterThan(0);
    }
  });
});

describe('Content validation — rule files', () => {
  it('every rule file is non-empty markdown', () => {
    for (const rule of CORE_RULES) {
      const filePath = rulePath(rule);
      expect(existsSync(filePath), `Rule file missing: ${filePath}`).toBe(true);

      const content = readFileSync(filePath, 'utf-8');
      expect(content.trim().length, `Empty rule file: ${rule.id}`).toBeGreaterThan(0);
    }
  });
});

describe('Content validation — hook files', () => {
  it('every hook file starts with #!/ (bash shebang)', () => {
    for (const hook of ALL_HOOKS) {
      const filePath = hookPath(hook);
      expect(existsSync(filePath), `Hook file missing: ${filePath}`).toBe(true);

      const content = readFileSync(filePath, 'utf-8');
      expect(content.startsWith('#!/'), `Missing shebang in ${hook.id} (${filePath})`).toBe(true);
    }
  });

  it('hook files are executable', () => {
    for (const hook of ALL_HOOKS) {
      const stat = statSync(hookPath(hook));
      const isExecutable = (stat.mode & 0o111) !== 0;
      expect(isExecutable, `Hook not executable: ${hook.id}`).toBe(true);
    }
  });
});

describe('Content validation — unified agent count', () => {
  it('all presets get exactly 9 agents (unified core set)', () => {
    expect(CORE_AGENTS).toHaveLength(9);
    const ids = CORE_AGENTS.map(a => a.id);
    expect(ids).toContain('code-reviewer');
    expect(ids).toContain('verification');
    expect(ids).toContain('tech-lead');
    expect(ids).toContain('spec-writer');
    expect(ids).toContain('spec-planner');
    expect(ids).toContain('task-breakdown');
    expect(ids).toContain('frontend-react');
    expect(ids).toContain('python-dev');
    expect(ids).toContain('debugger');
  });

  it('core rules include safety-guardrails (formerly pm-guardrails)', () => {
    const ruleIds = CORE_RULES.map(r => r.id);
    expect(ruleIds).toContain('safety-guardrails');
    expect(ruleIds).toContain('agent-orchestration');
    expect(ruleIds).toContain('tool-gate');
    expect(ruleIds).toContain('context-discipline');
    expect(ruleIds).toContain('security');
  });
});

describe('Content validation — shared templates', () => {
  it('all 3 shared template files exist and are non-empty', () => {
    // SHARED_TEMPLATES has 2 entries; spec-template also exists on disk
    const expectedFiles = ['progress-template.md', 'decisions-template.md', 'spec-template.md'];

    for (const filename of expectedFiles) {
      const filePath = join(CONTENT_DIR, 'presets', 'shared', 'templates', filename);
      expect(existsSync(filePath), `Template missing: ${filename}`).toBe(true);

      const content = readFileSync(filePath, 'utf-8');
      expect(content.trim().length, `Empty template: ${filename}`).toBeGreaterThan(0);
    }
  });

  it('registry SHARED_TEMPLATES entries resolve to existing files', () => {
    for (const tmpl of SHARED_TEMPLATES) {
      const filePath = templatePath(tmpl);
      expect(existsSync(filePath), `Template from registry missing: ${tmpl.id}`).toBe(true);
    }
  });
});

describe('Content validation — workflow files', () => {
  it('all workflow files exist and are non-empty', () => {
    for (const wf of CORE_WORKFLOWS) {
      const filePath = workflowPath(wf);
      expect(existsSync(filePath), `Workflow file missing: ${wf.id} at ${filePath}`).toBe(true);

      const content = readFileSync(filePath, 'utf-8');
      expect(content.trim().length, `Empty workflow: ${wf.id}`).toBeGreaterThan(0);
    }
  });
});

describe('Content validation — protocol files', () => {
  it('all protocol files exist and are non-empty', () => {
    for (const proto of CORE_PROTOCOLS) {
      const filePath = protocolPath(proto);
      expect(existsSync(filePath), `Protocol file missing: ${proto.id} at ${filePath}`).toBe(true);

      const content = readFileSync(filePath, 'utf-8');
      expect(content.trim().length, `Empty protocol: ${proto.id}`).toBeGreaterThan(0);
    }
  });
});
