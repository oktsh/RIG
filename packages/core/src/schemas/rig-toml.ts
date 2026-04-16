import { z } from 'zod';

export const PresetSchema = z.enum(['pm', 'small-team', 'solo-dev']);
export const StackSchema = z.enum(['nextjs', 'python-fastapi']);
export const FormatTargetSchema = z.enum(['claude_md', 'agents_md', 'cursor_mdc']);
export const UpdateChannelSchema = z.enum(['stable', 'latest']);

export const RigConfigSchema = z.object({
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
});

export type RigConfig = z.infer<typeof RigConfigSchema>;
export type Preset = z.infer<typeof PresetSchema>;
export type Stack = z.infer<typeof StackSchema>;
export type FormatTarget = z.infer<typeof FormatTargetSchema>;
