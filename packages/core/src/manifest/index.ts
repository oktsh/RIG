import { join } from 'node:path';
import { stringify, parse } from 'yaml';
import { ManifestSchema } from '../schemas/index.js';
import type { Manifest } from '../schemas/index.js';
import type { GyrdConfig } from '../schemas/index.js';
import type { GeneratedFile } from '../generator/types.js';
import { computeHash } from '../utils/index.js';
import { ensureDir, writeFileAtomic, readFileSafe } from '../utils/index.js';

export interface BuildManifestOptions {
  generatedAt?: string;
}

export function buildManifest(
  config: GyrdConfig,
  files: GeneratedFile[],
  version: string,
  options?: BuildManifestOptions,
): Manifest {
  const configHash = computeHash(JSON.stringify(config));
  const generatedAt = options?.generatedAt ?? new Date().toISOString();

  // Count files by component
  const agentFiles = files.filter((f) => f.component === 'agents');
  const hookFiles = files.filter((f) => f.component === 'hooks');
  const ruleFiles = files.filter((f) => f.component === 'rules');
  const templateFiles = files.filter((f) => f.component === 'templates');

  // Build formats map from generated format files
  const formats: Record<string, string> = {};
  for (const f of files) {
    if (f.component === 'formats') {
      if (f.path.endsWith('CLAUDE.md')) formats['claude_md'] = 'generated';
      else if (f.path.endsWith('AGENTS.md')) formats['agents_md'] = 'generated';
      else if (f.path.includes('.cursor/rules/')) formats['cursor_mdc'] = 'generated';
    }
  }

  // Build file hash map (sorted for determinism)
  const fileEntries = files
    .map((f) => [f.path, computeHash(f.content)] as const)
    .sort(([a], [b]) => a.localeCompare(b));
  const fileHashes: Record<string, string> = Object.fromEntries(fileEntries);

  return {
    gyrd_version: version,
    generated_at: generatedAt,
    config_hash: configHash,
    components: {
      agents: { version, count: agentFiles.length, schema: 'agent-frontmatter-v1' },
      hooks: { version, count: hookFiles.length },
      rules: { version, count: ruleFiles.length },
      formats,
      templates: { version, count: templateFiles.length },
    },
    compatibility: {
      'claude-code': '>=1.0',
      cursor: '>=0.40',
    },
    files: fileHashes,
  };
}

export async function writeManifest(dir: string, manifest: Manifest): Promise<void> {
  const manifestDir = join(dir, '.gyrd');
  await ensureDir(manifestDir);
  const manifestPath = join(manifestDir, 'manifest.yaml');
  const content = stringify(manifest);
  await writeFileAtomic(manifestPath, content);
}

export async function readManifest(dir: string): Promise<Manifest | null> {
  const manifestPath = join(dir, '.gyrd', 'manifest.yaml');
  const raw = await readFileSafe(manifestPath);
  if (raw === null) return null;
  const parsed = parse(raw) as unknown;
  return ManifestSchema.parse(parsed);
}
