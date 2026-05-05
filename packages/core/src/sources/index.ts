import { join } from 'node:path';
import { readFile } from 'node:fs/promises';
import type { UpdatePlan } from '../updater/types.js';

export interface SourceRegistry {
  version: string;
  description: string;
  sources: SourceEntry[];
  rule_mapping: Record<string, RuleMapping>;
}

export interface SourceEntry {
  id: string;
  name: string;
  type: 'model-release' | 'tool-update' | 'ecosystem-change' | 'security-advisory';
  url?: string;
  affects: string[];
  description: string;
  check_frequency: string;
}

export interface RuleMapping {
  file: string;
  assumptions: string[];
}

export interface SourceCheckResult {
  hasUpdates: boolean;
  affectedRules: AffectedRule[];
  summary: string;
}

export interface AffectedRule {
  ruleId: string;
  file: string;
  sources: string[];
  reason: string;
  assumptions: string[];
}

/**
 * Load the sources registry from the content directory.
 */
export async function loadSourceRegistry(contentRoot: string): Promise<SourceRegistry> {
  const registryPath = join(contentRoot, 'sources', 'registry.json');
  const content = await readFile(registryPath, 'utf-8');
  return JSON.parse(content) as SourceRegistry;
}

/**
 * Cross-reference an UpdatePlan with the sources registry to produce
 * human-readable explanations of WHY rules need updating.
 *
 * Maps changed files → rule IDs → sources that affect them → assumptions at risk.
 */
export function explainUpdates(plan: UpdatePlan, registry: SourceRegistry): SourceCheckResult {
  if (!plan.hasChanges) {
    return {
      hasUpdates: false,
      affectedRules: [],
      summary: 'All rules are up to date. No sources have triggered changes.',
    };
  }

  const affectedRules: AffectedRule[] = [];

  for (const change of plan.changes) {
    for (const file of change.files) {
      // Find which rule this file maps to
      const ruleEntry = findRuleByFile(file.path, registry.rule_mapping);
      if (!ruleEntry) continue;

      const [ruleId, mapping] = ruleEntry;

      // Find which sources affect this rule
      const affectingSources = registry.sources
        .filter((s) => s.affects.includes(ruleId))
        .map((s) => s.name);

      if (affectingSources.length === 0) continue;

      // Build explanation
      const reason = buildReason(file.action, change.component, affectingSources);

      affectedRules.push({
        ruleId,
        file: file.path,
        sources: affectingSources,
        reason,
        assumptions: mapping.assumptions,
      });
    }
  }

  // Deduplicate by ruleId
  const uniqueRules = deduplicateRules(affectedRules);

  const summary = uniqueRules.length > 0
    ? `${uniqueRules.length} rule${uniqueRules.length === 1 ? '' : 's'} affected by ecosystem changes.`
    : 'Files changed but no source-mapped rules affected.';

  return {
    hasUpdates: uniqueRules.length > 0,
    affectedRules: uniqueRules,
    summary,
  };
}

function findRuleByFile(
  filePath: string,
  mapping: Record<string, RuleMapping>,
): [string, RuleMapping] | undefined {
  for (const [ruleId, rule] of Object.entries(mapping)) {
    if (filePath === rule.file || filePath.endsWith(rule.file.replace(/^\.\//, ''))) {
      return [ruleId, rule];
    }
    // Also match by filename (e.g. "code-reviewer.md" matches ".claude/agents/code-reviewer.md")
    const fileName = rule.file.split('/').pop();
    if (fileName && filePath.endsWith(fileName)) {
      return [ruleId, rule];
    }
  }
  return undefined;
}

function buildReason(
  action: 'add' | 'update' | 'remove',
  component: string,
  sources: string[],
): string {
  const sourceList = sources.join(', ');
  switch (action) {
    case 'add':
      return `New ${component} added. Triggered by: ${sourceList}`;
    case 'update':
      return `Updated based on changes from: ${sourceList}`;
    case 'remove':
      return `Removed — no longer needed. Source: ${sourceList}`;
  }
}

function deduplicateRules(rules: AffectedRule[]): AffectedRule[] {
  const seen = new Map<string, AffectedRule>();
  for (const rule of rules) {
    if (!seen.has(rule.ruleId)) {
      seen.set(rule.ruleId, rule);
    } else {
      // Merge sources
      const existing = seen.get(rule.ruleId)!;
      const allSources = new Set([...existing.sources, ...rule.sources]);
      existing.sources = [...allSources];
    }
  }
  return [...seen.values()];
}
