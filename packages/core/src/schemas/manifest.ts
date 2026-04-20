import { z } from 'zod';

export const ManifestSchema = z.object({
  gyrd_version: z.string(),
  generated_at: z.string(),
  config_hash: z.string(),
  components: z.object({
    agents: z.object({ version: z.string(), count: z.number(), schema: z.string() }),
    hooks: z.object({ version: z.string(), count: z.number() }),
    rules: z.object({ version: z.string(), count: z.number() }),
    formats: z.record(z.string(), z.string()),
    templates: z.object({ version: z.string(), count: z.number() }),
  }),
  compatibility: z.record(z.string(), z.string()),
  files: z.record(z.string(), z.string()),
});

export type Manifest = z.infer<typeof ManifestSchema>;
