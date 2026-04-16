import type { Preset, Stack } from '../schemas/index.js';
import type { ContentSet } from './types.js';
import {
  CORE_AGENTS,
  CORE_RULES,
  CORE_WORKFLOWS,
  CORE_PROTOCOLS,
  SHARED_TEMPLATES,
  PRESET_META,
} from './presets.js';
import { STACK_OVERLAYS } from './stacks.js';

export function getContentSet(preset: Preset, stack: Stack): ContentSet {
  const stackOverlay = STACK_OVERLAYS[stack];
  const meta = PRESET_META[preset];

  if (!meta) {
    throw new Error(`Unknown preset: ${String(preset)}`);
  }

  return {
    agents: CORE_AGENTS,
    rules: [...CORE_RULES, ...stackOverlay.rules],
    hooks: stackOverlay.hooks,
    templates: SHARED_TEMPLATES,
    workflows: CORE_WORKFLOWS,
    protocols: CORE_PROTOCOLS,
    presetMeta: {
      ...meta,
      agentCount: CORE_AGENTS.length,
    },
  };
}

export type { ContentSet, AgentDef, RuleDef, HookDef } from './types.js';
