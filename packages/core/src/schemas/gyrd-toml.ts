import { z } from 'zod';

export const PresetSchema = z.enum(['pm', 'small-team', 'solo-dev']);
export const StackSchema = z.enum(['nextjs', 'python-fastapi']);
export const FormatTargetSchema = z.enum(['claude_md', 'agents_md', 'cursor_mdc']);
export const UpdateChannelSchema = z.enum(['stable', 'latest']);

export const SourceTypeSchema = z.enum([
  'model-release',
  'tool-update',
  'ecosystem-change',
  'security-advisory',
]);

export const UpdateSourceSchema = z.object({
  name: z.string().min(1),
  type: SourceTypeSchema,
  url: z.string().url().optional(),
  affects: z.array(z.string()).default([]),
  description: z.string().optional(),
});

export const GyrdConfigSchema = z.object({
  project: z.object({
    name: z.string().min(1),
    preset: PresetSchema,
    stack: StackSchema,
  }),
  team: z.object({
    size: z.number().int().positive().optional(),
  }).optional(),
  agents: z.object({
    tiers: z.array(z.string()).default(['oversight', 'planning', 'workers', 'quality', 'specialists']),
    default_memory: z.enum(['project', 'team', 'personal']).default('project'),
    worker_model: z.string().default('sonnet'),
    oversight_model: z.string().default('opus'),
  }).optional(),
  hooks: z.object({
    pre_commit: z.array(z.string()).default(['lint', 'typecheck']),
  }).optional(),
  formats: z.object({
    generate: z.array(FormatTargetSchema).default(['claude_md', 'agents_md', 'cursor_mdc']),
  }).optional(),
  updates: z.object({
    channel: UpdateChannelSchema.default('stable'),
    auto_check: z.boolean().default(false),
  }).optional(),
  sources: z.array(UpdateSourceSchema).optional(),
});

export type GyrdConfig = z.infer<typeof GyrdConfigSchema>;
export type Preset = z.infer<typeof PresetSchema>;
export type Stack = z.infer<typeof StackSchema>;
export type FormatTarget = z.infer<typeof FormatTargetSchema>;
export type UpdateSource = z.infer<typeof UpdateSourceSchema>;
export type SourceType = z.infer<typeof SourceTypeSchema>;
