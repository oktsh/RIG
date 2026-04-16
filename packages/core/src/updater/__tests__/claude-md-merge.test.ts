import { describe, it, expect } from 'vitest';
import { mergeClaudeMd } from '../claude-md-merge.js';

describe('mergeClaudeMd', () => {
  it('replaces RIG-MANAGED sections with new content', () => {
    const existing = `# My Project

## [RIG-MANAGED] Agents

Old agent list

## [RIG-MANAGED] Workflow

Old workflow
`;

    const newContent = `# My Project

## [RIG-MANAGED] Agents

New agent list with more agents

## [RIG-MANAGED] Workflow

New workflow steps
`;

    const result = mergeClaudeMd(existing, newContent);
    expect(result).toContain('New agent list with more agents');
    expect(result).toContain('New workflow steps');
    expect(result).not.toContain('Old agent list');
    expect(result).not.toContain('Old workflow');
  });

  it('preserves user-added sections (no [RIG-MANAGED])', () => {
    const existing = `# My Project

## [RIG-MANAGED] Agents

Agent list

## My Custom Notes

These are my notes that should survive updates.

## [RIG-MANAGED] Workflow

Workflow steps
`;

    const newContent = `# My Project

## [RIG-MANAGED] Agents

Updated agent list

## [RIG-MANAGED] Workflow

Updated workflow
`;

    const result = mergeClaudeMd(existing, newContent);
    expect(result).toContain('Updated agent list');
    expect(result).toContain('Updated workflow');
    expect(result).toContain('My Custom Notes');
    expect(result).toContain('These are my notes that should survive updates.');
  });

  it('maintains section order', () => {
    const existing = `# My Project

## [RIG-MANAGED] Section A

Content A

## My Custom Section

Custom content

## [RIG-MANAGED] Section B

Content B
`;

    const newContent = `# My Project

## [RIG-MANAGED] Section A

New Content A

## [RIG-MANAGED] Section B

New Content B
`;

    const result = mergeClaudeMd(existing, newContent);

    const sectionAIdx = result.indexOf('Section A');
    const customIdx = result.indexOf('My Custom Section');
    const sectionBIdx = result.indexOf('Section B');

    expect(sectionAIdx).toBeLessThan(customIdx);
    expect(customIdx).toBeLessThan(sectionBIdx);
  });

  it('appends new RIG-MANAGED sections not in existing', () => {
    const existing = `# My Project

## [RIG-MANAGED] Agents

Agent list
`;

    const newContent = `# My Project

## [RIG-MANAGED] Agents

Updated agent list

## [RIG-MANAGED] Feedback

New feedback section
`;

    const result = mergeClaudeMd(existing, newContent);
    expect(result).toContain('Updated agent list');
    expect(result).toContain('New feedback section');
    expect(result).toContain('[RIG-MANAGED] Feedback');
  });

  it('preserves the header (before first ##)', () => {
    const existing = `# My Cool Project

> This is a RIG-managed project. My custom header text.

## [RIG-MANAGED] Agents

Agent list
`;

    const newContent = `# Default Project Name

> RIG header

## [RIG-MANAGED] Agents

Updated agents
`;

    const result = mergeClaudeMd(existing, newContent);
    expect(result).toContain('My Cool Project');
    expect(result).toContain('My custom header text');
    expect(result).toContain('Updated agents');
  });

  it('does not remove empty user sections', () => {
    const existing = `# Project

## [RIG-MANAGED] Agents

Agents here

## My Empty Section

## [RIG-MANAGED] Workflow

Workflow here
`;

    const newContent = `# Project

## [RIG-MANAGED] Agents

New agents

## [RIG-MANAGED] Workflow

New workflow
`;

    const result = mergeClaudeMd(existing, newContent);
    expect(result).toContain('## My Empty Section');
  });
});
