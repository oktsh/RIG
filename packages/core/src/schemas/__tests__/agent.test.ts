import { describe, it, expect } from 'vitest';
import { AgentFrontmatterSchema } from '../agent.js';

const validFrontmatter = {
  name: 'tech-lead',
  description: 'Technical lead agent for oversight and decisions',
  model: 'opus' as const,
  file_ownership: {
    read: ['**/*.ts', '**/*.md'],
    write: ['DECISIONS.md', 'PROGRESS.md'],
  },
};

describe('AgentFrontmatterSchema', () => {
  it('parses valid frontmatter', () => {
    const result = AgentFrontmatterSchema.safeParse(validFrontmatter);
    expect(result.success).toBe(true);
  });

  it('rejects invalid model "gpt4"', () => {
    const result = AgentFrontmatterSchema.safeParse({ ...validFrontmatter, model: 'gpt4' });
    expect(result.success).toBe(false);
  });

  it('rejects missing name', () => {
    const { name: _, ...rest } = validFrontmatter;
    const result = AgentFrontmatterSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects missing description', () => {
    const { description: _, ...rest } = validFrontmatter;
    const result = AgentFrontmatterSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('accepts optional tools and memory fields', () => {
    const result = AgentFrontmatterSchema.safeParse({
      ...validFrontmatter,
      tools: ['Read', 'Bash', 'Grep'],
      memory: 'team',
    });
    expect(result.success).toBe(true);
  });
});
