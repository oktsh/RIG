/**
 * CLAUDE.md merge engine.
 *
 * Key differentiation: partial CLAUDE.md updates that preserve user customizations.
 *
 * Algorithm:
 * 1. Parse existing CLAUDE.md into sections (split on `## ` at line start)
 * 2. Classify each section:
 *    - `[GYRD-MANAGED]` in heading -> GYRD-owned, candidate for replacement
 *    - No prefix -> user-added, ALWAYS preserved
 * 3. Parse new GYRD content into sections (all will be `[GYRD-MANAGED]`)
 * 4. Build result:
 *    - For each section in existing:
 *      - If GYRD-MANAGED -> replace with corresponding section from new content
 *      - If user-added -> keep as-is
 *    - If new content has sections not in existing -> append at end
 * 5. Preserve the header (everything before first `##`)
 */

interface Section {
  heading: string; // The full heading line, e.g. "## [GYRD-MANAGED] Agents"
  key: string; // Normalized key for matching, e.g. "agents"
  isManaged: boolean;
  body: string; // Everything after the heading line until the next section
}

const RIG_MANAGED_PREFIX = '[GYRD-MANAGED]';

/**
 * Merge an existing CLAUDE.md with new GYRD-generated content.
 *
 * - GYRD-MANAGED sections are replaced with new content
 * - User-added sections are preserved
 * - New GYRD sections not in existing are appended
 * - Header (before first ##) is preserved
 */
export function mergeClaudeMd(existing: string, newRigContent: string): string {
  const { header: existingHeader, sections: existingSections } = parseSections(existing);
  const { sections: newSections } = parseSections(newRigContent);

  // Build a map of new sections by key for quick lookup
  const newSectionMap = new Map<string, Section>();
  for (const section of newSections) {
    newSectionMap.set(section.key, section);
  }

  // Track which new sections were consumed
  const consumed = new Set<string>();

  // Build result sections
  const resultSections: string[] = [];

  for (const section of existingSections) {
    if (section.isManaged) {
      // Replace with new version if available
      const replacement = newSectionMap.get(section.key);
      if (replacement) {
        resultSections.push(replacement.heading + replacement.body);
        consumed.add(section.key);
      } else {
        // GYRD-managed section removed in new version — drop it
        // (This is intentional: if GYRD no longer generates a section, it should be removed)
        resultSections.push(section.heading + section.body);
      }
    } else {
      // User-added section — always preserve
      resultSections.push(section.heading + section.body);
    }
  }

  // Append new sections not in existing
  for (const section of newSections) {
    if (!consumed.has(section.key)) {
      resultSections.push(section.heading + section.body);
    }
  }

  // Combine header + sections
  const parts = [existingHeader.trimEnd()];
  for (const section of resultSections) {
    parts.push(section.trimEnd());
  }

  return parts.join('\n\n') + '\n';
}

function parseSections(content: string): { header: string; sections: Section[] } {
  const lines = content.split('\n');
  let header = '';
  const sections: Section[] = [];

  let currentHeading = '';
  let currentBody = '';
  let inHeader = true;

  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (inHeader) {
        inHeader = false;
      } else if (currentHeading) {
        sections.push(makeSection(currentHeading, currentBody));
      }
      currentHeading = line;
      currentBody = '';
    } else if (inHeader) {
      header += line + '\n';
    } else {
      currentBody += line + '\n';
    }
  }

  // Push the last section
  if (currentHeading) {
    sections.push(makeSection(currentHeading, currentBody));
  }

  return { header, sections };
}

function makeSection(heading: string, body: string): Section {
  const isManaged = heading.includes(RIG_MANAGED_PREFIX);
  const key = normalizeKey(heading);
  return { heading, key, isManaged, body };
}

function normalizeKey(heading: string): string {
  return heading
    .replace(/^##\s*/, '')
    .replace(/\[GYRD-MANAGED\]\s*/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
