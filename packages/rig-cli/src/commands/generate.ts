import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { parse as parseToml } from '@iarna/toml';
import {
  RigConfigSchema,
  generateProject,
  Logger,
  buildManifest,
  writeManifest,
  writeFileAtomic,
  VERSION,
} from '@rig/core';
import type { GeneratedFile } from '@rig/core';

/**
 * Resolve the content root directory based on @rig/core's package location.
 * @rig/core entry is at <repo>/packages/core/dist/index.js
 * Content is at <repo>/content/
 * So: core dist dir -> core/ -> packages/ -> repo root -> content/
 */
function resolveContentRoot(): string {
  const coreEntry = import.meta.resolve('@rig/core');
  const coreDistDir = dirname(fileURLToPath(coreEntry));
  // dist/ -> core/ -> packages/ -> <repo root>
  return join(coreDistDir, '..', '..', '..', 'content');
}

const VALID_TARGETS = ['claude_md', 'agents_md', 'cursor_mdc'] as const;

type Target = (typeof VALID_TARGETS)[number];

function isValidTarget(value: string): value is Target {
  return (VALID_TARGETS as readonly string[]).includes(value);
}

/**
 * Clean parsed TOML data before Zod validation.
 *
 * Generated rig.toml files may have empty strings for optional enum fields
 * (e.g. default_memory = "") that would fail Zod validation. Remove these
 * so that Zod defaults kick in.
 */
function cleanParsedConfig(data: Record<string, unknown>): Record<string, unknown> {
  const cleaned = { ...data };

  // Remove optional sections that have only empty/default values
  for (const key of ['agents', 'hooks', 'formats', 'updates']) {
    if (cleaned[key] && typeof cleaned[key] === 'object') {
      const section = { ...cleaned[key] as Record<string, unknown> };
      let hasValues = false;

      for (const [k, v] of Object.entries(section)) {
        if (v === '' || (Array.isArray(v) && v.length === 0)) {
          delete section[k];
        } else {
          hasValues = true;
        }
      }

      if (hasValues) {
        cleaned[key] = section;
      } else {
        delete cleaned[key];
      }
    }
  }

  return cleaned;
}

/**
 * Filter generated files to only those matching a specific target.
 */
function filterFilesByTarget(files: GeneratedFile[], target: Target): GeneratedFile[] {
  switch (target) {
    case 'claude_md':
      return files.filter((f) => f.path === 'CLAUDE.md');
    case 'agents_md':
      return files.filter((f) => f.path === 'AGENTS.md');
    case 'cursor_mdc':
      return files.filter((f) => f.path.startsWith('.cursor/rules/') && f.path.endsWith('.mdc'));
  }
}

export async function generateAction(target?: string): Promise<void> {
  const cwd = process.cwd();
  const rigTomlPath = join(cwd, 'rig.toml');

  // 1. Check rig.toml exists
  if (!existsSync(rigTomlPath)) {
    Logger.error('No rig.toml found. Run `npx create-rig` first.');
    process.exit(1);
  }

  // 2. Read and parse rig.toml
  const raw = await readFile(rigTomlPath, 'utf8');
  let parsed: unknown;
  try {
    parsed = parseToml(raw);
  } catch (err) {
    Logger.error(`Invalid TOML syntax in rig.toml: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }

  // 3. Clean empty values from optional sections, then validate with Zod schema
  const cleaned = cleanParsedConfig(parsed as Record<string, unknown>);
  const result = RigConfigSchema.safeParse(cleaned);
  if (!result.success) {
    Logger.error('Invalid rig.toml config:');
    for (const issue of result.error.issues) {
      Logger.error(`  ${issue.path.join('.')}: ${issue.message}`);
    }
    process.exit(1);
  }
  const config = result.data;

  // 4. Validate target if specified
  if (target !== undefined) {
    if (!isValidTarget(target)) {
      Logger.error(`Unknown target "${target}". Available: ${VALID_TARGETS.join(', ')}`);
      process.exit(1);
    }
  }

  const contentRoot = resolveContentRoot();

  if (target !== undefined && isValidTarget(target)) {
    // Selective generation: generate into a temp dir, then copy only target files
    const tempDir = mkdtempSync(join(tmpdir(), 'rig-gen-'));
    try {
      const genResult = await generateProject(config, tempDir, { contentRoot });

      const filtered = filterFilesByTarget(genResult.files, target);

      // Write only the filtered files to the real cwd
      for (const file of filtered) {
        const fullPath = join(cwd, file.path);
        await writeFileAtomic(fullPath, file.content);
      }

      // Rebuild manifest with ALL files (hashes are correct for everything)
      // but write it to the real cwd
      const manifest = buildManifest(config, genResult.files, VERSION);
      await writeManifest(cwd, manifest);

      console.log('');
      Logger.success(`Regenerated ${filtered.length} file${filtered.length === 1 ? '' : 's'}`);
      for (const file of filtered) {
        Logger.dim(`  ${file.path}`);
      }
      console.log('');
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  } else {
    // Full generation: write everything directly to cwd
    const genResult = await generateProject(config, cwd, { contentRoot });

    console.log('');
    Logger.success(`Regenerated ${genResult.files.length} files`);
    for (const file of genResult.files) {
      Logger.dim(`  ${file.path}`);
    }
    console.log('');
  }
}
