import type { AgentDef, RuleDef, TemplateDef, WorkflowDef, ProtocolDef } from './types.js';

// ---------------------------------------------------------------------------
// Unified core content — ALL presets get the same capabilities.
// The `preset` field is a PATH RESOLUTION hint (where the file lives on disk),
// NOT a capability filter.
// ---------------------------------------------------------------------------

export const CORE_AGENTS: AgentDef[] = [
  // Quality (shared)
  { id: 'code-reviewer', preset: 'shared', filename: 'code-reviewer.md' },
  { id: 'verification', preset: 'shared', filename: 'verification.md' },
  // Oversight
  { id: 'tech-lead', preset: 'small-team', filename: 'tech-lead.md' },
  // Planning
  { id: 'spec-writer', preset: 'small-team', filename: 'spec-writer.md' },
  { id: 'spec-planner', preset: 'small-team', filename: 'spec-planner.md' },
  { id: 'task-breakdown', preset: 'small-team', filename: 'task-breakdown.md' },
  // Workers
  { id: 'frontend-react', preset: 'small-team', filename: 'frontend-react.md' },
  { id: 'python-dev', preset: 'small-team', filename: 'python-dev.md' },
  { id: 'debugger', preset: 'small-team', filename: 'debugger.md' },
];

export const CORE_RULES: RuleDef[] = [
  { id: 'context-discipline', preset: 'shared', filename: 'context-discipline.md' },
  { id: 'security', preset: 'shared', filename: 'security.md' },
  { id: 'agent-orchestration', preset: 'small-team', filename: 'agent-orchestration.md' },
  { id: 'tool-gate', preset: 'small-team', filename: 'tool-gate.md' },
  { id: 'safety-guardrails', preset: 'pm', filename: 'pm-guardrails.md' },
];

export const CORE_WORKFLOWS: WorkflowDef[] = [
  { id: 'discovery', preset: 'pm', filename: 'discovery.md' },
  { id: 'spec-pipeline', preset: 'small-team', filename: 'spec-pipeline.md' },
];

export const CORE_PROTOCOLS: ProtocolDef[] = [
  { id: 'checkpoint-commits', preset: 'small-team', filename: 'checkpoint-commits.md' },
  { id: 'team-coordination', preset: 'small-team', filename: 'team-coordination.md' },
];

// Shared templates
export const SHARED_TEMPLATES: TemplateDef[] = [
  { id: 'progress-template', filename: 'progress-template.md' },
  { id: 'decisions-template', filename: 'decisions-template.md' },
  { id: 'spec-template', filename: 'spec-template.md' },
];

// ---------------------------------------------------------------------------
// Preset metadata — controls onboarding tone only.
// ---------------------------------------------------------------------------

export const PRESET_META = {
  pm: {
    id: 'pm',
    displayName: 'Product Manager',
    description: 'Optimized for product managers and non-technical leads',
    tone: 'simplified' as const,
  },
  'small-team': {
    id: 'small-team',
    displayName: 'Small Team',
    description: 'Full agent suite for 2-5 developer teams',
    tone: 'technical' as const,
  },
  'solo-dev': {
    id: 'solo-dev',
    displayName: 'Solo Developer',
    description: 'Minimal setup for individual developers',
    tone: 'minimal' as const,
  },
};
