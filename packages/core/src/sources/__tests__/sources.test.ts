import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import { loadSourceRegistry, explainUpdates } from '../index.js';
import type { UpdatePlan } from '../../updater/types.js';

const CONTENT_ROOT = join(__dirname, '..', '..', '..', '..', '..', 'content');

describe('Sources Registry', () => {
  it('loads the registry from content directory', async () => {
    const registry = await loadSourceRegistry(CONTENT_ROOT);
    expect(registry.version).toBe('0.3.0');
    expect(registry.sources.length).toBeGreaterThan(0);
    expect(registry.rule_mapping).toBeDefined();
  });

  it('registry has required fields for each source', async () => {
    const registry = await loadSourceRegistry(CONTENT_ROOT);
    for (const source of registry.sources) {
      expect(source.id).toBeTruthy();
      expect(source.name).toBeTruthy();
      expect(source.type).toBeTruthy();
      expect(source.affects).toBeInstanceOf(Array);
      expect(source.description).toBeTruthy();
    }
  });

  it('rule_mapping references valid source IDs in affects', async () => {
    const registry = await loadSourceRegistry(CONTENT_ROOT);
    const ruleIds = Object.keys(registry.rule_mapping);

    // Every rule that appears in source.affects should exist in rule_mapping
    for (const source of registry.sources) {
      for (const ruleId of source.affects) {
        expect(ruleIds).toContain(ruleId);
      }
    }
  });

  it('rule_mapping has assumptions for each rule', async () => {
    const registry = await loadSourceRegistry(CONTENT_ROOT);
    for (const [, mapping] of Object.entries(registry.rule_mapping)) {
      expect(mapping.file).toBeTruthy();
      expect(mapping.assumptions.length).toBeGreaterThan(0);
    }
  });
});

describe('explainUpdates', () => {
  it('returns no updates when plan has no changes', async () => {
    const registry = await loadSourceRegistry(CONTENT_ROOT);
    const plan: UpdatePlan = {
      currentVersion: '0.2.1',
      newVersion: '0.3.0',
      changes: [],
      hasChanges: false,
    };

    const result = explainUpdates(plan, registry);
    expect(result.hasUpdates).toBe(false);
    expect(result.affectedRules).toHaveLength(0);
  });

  it('maps file changes to affected rules with sources', async () => {
    const registry = await loadSourceRegistry(CONTENT_ROOT);
    const plan: UpdatePlan = {
      currentVersion: '0.2.1',
      newVersion: '0.3.0',
      changes: [
        {
          component: 'agents',
          currentVersion: '0.2.1',
          newVersion: '0.3.0',
          files: [
            { path: '.claude/agents/code-reviewer.md', action: 'update', customized: false },
          ],
        },
      ],
      hasChanges: true,
    };

    const result = explainUpdates(plan, registry);
    expect(result.hasUpdates).toBe(true);
    expect(result.affectedRules.length).toBeGreaterThan(0);

    const reviewerRule = result.affectedRules.find((r) => r.ruleId === 'code-reviewer');
    expect(reviewerRule).toBeDefined();
    expect(reviewerRule!.sources.length).toBeGreaterThan(0);
    expect(reviewerRule!.assumptions.length).toBeGreaterThan(0);
  });

  it('deduplicates rules affected by multiple file changes', async () => {
    const registry = await loadSourceRegistry(CONTENT_ROOT);
    const plan: UpdatePlan = {
      currentVersion: '0.2.1',
      newVersion: '0.3.0',
      changes: [
        {
          component: 'rules',
          currentVersion: '0.2.1',
          newVersion: '0.3.0',
          files: [
            { path: '.claude/rules/security.md', action: 'update', customized: false },
          ],
        },
        {
          component: 'agents',
          currentVersion: '0.2.1',
          newVersion: '0.3.0',
          files: [
            { path: '.claude/agents/code-reviewer.md', action: 'update', customized: false },
          ],
        },
      ],
      hasChanges: true,
    };

    const result = explainUpdates(plan, registry);
    // Each ruleId should appear only once
    const ruleIds = result.affectedRules.map((r) => r.ruleId);
    const uniqueIds = new Set(ruleIds);
    expect(ruleIds.length).toBe(uniqueIds.size);
  });
});
