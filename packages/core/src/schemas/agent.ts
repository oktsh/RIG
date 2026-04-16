import { z } from 'zod';

export const AgentFrontmatterSchema = z.object({
  name: z.string(),
  description: z.string(),
  model: z.enum(['opus', 'sonnet', 'haiku']),
  file_ownership: z.object({
    read: z.array(z.string()),
    write: z.array(z.string()),
  }),
  tools: z.array(z.string()).optional(),
  memory: z.enum(['project', 'team', 'personal']).optional(),
});

export type AgentFrontmatter = z.infer<typeof AgentFrontmatterSchema>;
