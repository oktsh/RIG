import { describe, it, expect } from 'vitest';
import { mergeClaudeMd } from '../claude-md-merge.js';

describe('mergeClaudeMd', () => {
  it('replaces GYRD-MANAGED sections with new content', () => {
    const existing = `# My Project

## [GYRD-MANAGED] Agents

Old agent list

## [GYRD-MANAGED] Workflow

Old workflow
`;

    const newContent = `# My Project

## [GYRD-MANAGED] Agents

New agent list with more agents

## [GYRD-MANAGED] Workflow

New workflow steps
`;

    const result = mergeClaudeMd(existing, newContent);
    expect(result).toContain('New agent list with more agents');
    expect(result).toContain('New workflow steps');
    expect(result).not.toContain('Old agent list');
    expect(result).not.toContain('Old workflow');
  });

  it('preserves user-added sections (no [GYRD-MANAGED])', () => {
    const existing = `# My Project

## [GYRD-MANAGED] Agents

Agent list

## My Custom Notes

These are my notes that should survive updates.

## [GYRD-MANAGED] Workflow

Workflow steps
`;

    const newContent = `# My Project

## [GYRD-MANAGED] Agents

Updated agent list

## [GYRD-MANAGED] Workflow

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

## [GYRD-MANAGED] Section A

Content A

## My Custom Section

Custom content

## [GYRD-MANAGED] Section B

Content B
`;

    const newContent = `# My Project

## [GYRD-MANAGED] Section A

New Content A

## [GYRD-MANAGED] Section B

New Content B
`;

    const result = mergeClaudeMd(existing, newContent);

    const sectionAIdx = result.indexOf('Section A');
    const customIdx = result.indexOf('My Custom Section');
    const sectionBIdx = result.indexOf('Section B');

    expect(sectionAIdx).toBeLessThan(customIdx);
    expect(customIdx).toBeLessThan(sectionBIdx);
  });

  it('appends new GYRD-MANAGED sections not in existing', () => {
    const existing = `# My Project

## [GYRD-MANAGED] Agents

Agent list
`;

    const newContent = `# My Project

## [GYRD-MANAGED] Agents

Updated agent list

## [GYRD-MANAGED] Feedback

New feedback section
`;

    const result = mergeClaudeMd(existing, newContent);
    expect(result).toContain('Updated agent list');
    expect(result).toContain('New feedback section');
    expect(result).toContain('[GYRD-MANAGED] Feedback');
  });

  it('preserves the header (before first ##)', () => {
    const existing = `# My Cool Project

> This is a GYRD-managed project. My custom header text.

## [GYRD-MANAGED] Agents

Agent list
`;

    const newContent = `# Default Project Name

> GYRD header

## [GYRD-MANAGED] Agents

Updated agents
`;

    const result = mergeClaudeMd(existing, newContent);
    expect(result).toContain('My Cool Project');
    expect(result).toContain('My custom header text');
    expect(result).toContain('Updated agents');
  });

  it('does not remove empty user sections', () => {
    const existing = `# Project

## [GYRD-MANAGED] Agents

Agents here

## My Empty Section

## [GYRD-MANAGED] Workflow

Workflow here
`;

    const newContent = `# Project

## [GYRD-MANAGED] Agents

New agents

## [GYRD-MANAGED] Workflow

New workflow
`;

    const result = mergeClaudeMd(existing, newContent);
    expect(result).toContain('## My Empty Section');
  });
});
