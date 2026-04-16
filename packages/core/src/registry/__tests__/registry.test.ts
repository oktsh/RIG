import { describe, it, expect } from 'vitest';
import { getContentSet } from '../index.js';
import type { Preset, Stack } from '../../schemas/index.js';

const PRESETS: Preset[] = ['pm', 'small-team', 'solo-dev'];
const STACKS: Stack[] = ['nextjs', 'python-fastapi'];

describe('getContentSet', () => {
  it('returns non-empty ContentSet for all 6 preset+stack combos', () => {
    for (const preset of PRESETS) {
      for (const stack of STACKS) {
        const set = getContentSet(preset, stack);
        expect(set.agents.length).toBeGreaterThan(0);
        expect(set.rules.length).toBeGreaterThan(0);
        expect(set.hooks.length).toBeGreaterThan(0);
        expect(set.templates.length).toBeGreaterThan(0);
      }
    }
  });

  it('ALL presets return exactly 9 agents', () => {
    for (const preset of PRESETS) {
      for (const stack of STACKS) {
        const set = getContentSet(preset, stack);
        expect(set.agents).toHaveLength(9);
      }
    }
  });

  it('includes shared core agents (code-reviewer, verification) in ALL sets', () => {
    for (const preset of PRESETS) {
      for (const stack of STACKS) {
        const set = getContentSet(preset, stack);
        const ids = set.agents.map(a => a.id);
        expect(ids).toContain('code-reviewer');
        expect(ids).toContain('verification');
      }
    }
  });

  it('ALL presets include tech-lead and spec-writer', () => {
    for (const preset of PRESETS) {
      const set = getContentSet(preset, 'nextjs');
      const ids = set.agents.map(a => a.id);
      expect(ids).toContain('tech-lead');
      expect(ids).toContain('spec-writer');
    }
  });

  it('ALL presets have agent-orchestration and tool-gate rules', () => {
    for (const preset of PRESETS) {
      const set = getContentSet(preset, 'nextjs');
      const ruleIds = set.rules.map(r => r.id);
      expect(ruleIds).toContain('agent-orchestration');
      expect(ruleIds).toContain('tool-gate');
    }
  });

  it('ALL presets have safety-guardrails rule', () => {
    for (const preset of PRESETS) {
      const set = getContentSet(preset, 'nextjs');
      const ruleIds = set.rules.map(r => r.id);
      expect(ruleIds).toContain('safety-guardrails');
    }
  });

  it('ALL presets have discovery + spec-pipeline workflows', () => {
    for (const preset of PRESETS) {
      const set = getContentSet(preset, 'nextjs');
      const wfIds = set.workflows.map(w => w.id);
      expect(wfIds).toContain('discovery');
      expect(wfIds).toContain('spec-pipeline');
    }
  });

  it('ALL presets have protocols', () => {
    for (const preset of PRESETS) {
      const set = getContentSet(preset, 'nextjs');
      expect(set.protocols.length).toBeGreaterThan(0);
      const protoIds = set.protocols.map(p => p.id);
      expect(protoIds).toContain('checkpoint-commits');
      expect(protoIds).toContain('team-coordination');
    }
  });

  it('nextjs stack returns npm-based hook', () => {
    const set = getContentSet('pm', 'nextjs');
    expect(set.hooks.length).toBeGreaterThan(0);
    expect(set.hooks[0]?.stack).toBe('nextjs');
    expect(set.hooks[0]?.id).toContain('npm');
  });

  it('python-fastapi stack returns ruff-based hook', () => {
    const set = getContentSet('pm', 'python-fastapi');
    expect(set.hooks.length).toBeGreaterThan(0);
    expect(set.hooks[0]?.stack).toBe('python-fastapi');
    expect(set.hooks[0]?.id).toContain('ruff');
  });

  it('PM preset tone is "simplified"', () => {
    const set = getContentSet('pm', 'nextjs');
    expect(set.presetMeta.tone).toBe('simplified');
  });

  it('small-team tone is "technical"', () => {
    const set = getContentSet('small-team', 'nextjs');
    expect(set.presetMeta.tone).toBe('technical');
  });

  it('solo-dev tone is "minimal"', () => {
    const set = getContentSet('solo-dev', 'nextjs');
    expect(set.presetMeta.tone).toBe('minimal');
  });

  it('agentCount in presetMeta matches actual agents array length', () => {
    for (const preset of PRESETS) {
      const set = getContentSet(preset, 'nextjs');
      expect(set.presetMeta.agentCount).toBe(set.agents.length);
    }
  });

  it('throws for invalid preset', () => {
    expect(() => getContentSet('enterprise' as Preset, 'nextjs')).toThrow();
  });
});
