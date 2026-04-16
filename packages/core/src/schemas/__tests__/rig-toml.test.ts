import { describe, it, expect } from 'vitest';
import { RigConfigSchema } from '../rig-toml.js';

const minimalValid = {
  project: { name: 'my-app', preset: 'pm' as const, stack: 'nextjs' as const },
};

describe('RigConfigSchema', () => {
  it('parses minimal valid config (name + preset + stack only)', () => {
    const result = RigConfigSchema.safeParse(minimalValid);
    expect(result.success).toBe(true);
  });

  it('parses full config with all sections', () => {
    const full = {
      project: { name: 'full-app', preset: 'small-team', stack: 'python-fastapi' },
      team: { size: 5 },
      agents: {
        tiers: ['oversight', 'workers'],
        default_memory: 'team',
        worker_model: 'sonnet',
        oversight_model: 'opus',
      },
      hooks: { pre_commit: ['lint', 'typecheck'] },
      formats: { generate: ['claude_md', 'agents_md'] },
      updates: { channel: 'latest', auto_check: true },
    };
    const result = RigConfigSchema.safeParse(full);
    expect(result.success).toBe(true);
  });

  it('applies default tiers when agents section omitted', () => {
    const result = RigConfigSchema.safeParse({ ...minimalValid, agents: {} });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.agents?.tiers).toHaveLength(5);
      expect(result.data.agents?.tiers).toContain('oversight');
      expect(result.data.agents?.tiers).toContain('specialists');
    }
  });

  it('applies default worker_model and oversight_model', () => {
    const result = RigConfigSchema.safeParse({ ...minimalValid, agents: {} });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.agents?.worker_model).toBe('sonnet');
      expect(result.data.agents?.oversight_model).toBe('opus');
    }
  });

  it('applies default hooks.pre_commit', () => {
    const result = RigConfigSchema.safeParse({ ...minimalValid, hooks: {} });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.hooks?.pre_commit).toEqual(['lint', 'typecheck']);
    }
  });

  it('applies default updates channel and auto_check', () => {
    const result = RigConfigSchema.safeParse({ ...minimalValid, updates: {} });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.updates?.channel).toBe('stable');
      expect(result.data.updates?.auto_check).toBe(false);
    }
  });

  it('rejects invalid preset "enterprise"', () => {
    const result = RigConfigSchema.safeParse({
      project: { name: 'x', preset: 'enterprise', stack: 'nextjs' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid stack "go"', () => {
    const result = RigConfigSchema.safeParse({
      project: { name: 'x', preset: 'pm', stack: 'go' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing project.name', () => {
    const result = RigConfigSchema.safeParse({
      project: { preset: 'pm', stack: 'nextjs' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing project.preset', () => {
    const result = RigConfigSchema.safeParse({
      project: { name: 'x', stack: 'nextjs' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing project.stack', () => {
    const result = RigConfigSchema.safeParse({
      project: { name: 'x', preset: 'pm' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty name string', () => {
    const result = RigConfigSchema.safeParse({
      project: { name: '', preset: 'pm', stack: 'nextjs' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects team.size as float', () => {
    const result = RigConfigSchema.safeParse({
      ...minimalValid,
      team: { size: 2.5 },
    });
    expect(result.success).toBe(false);
  });

  it('rejects team.size as negative', () => {
    const result = RigConfigSchema.safeParse({
      ...minimalValid,
      team: { size: -1 },
    });
    expect(result.success).toBe(false);
  });

  it('rejects formats with invalid target', () => {
    const result = RigConfigSchema.safeParse({
      ...minimalValid,
      formats: { generate: ['vscode_md'] },
    });
    expect(result.success).toBe(false);
  });
});
