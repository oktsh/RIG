import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile, readdir, chmod } from 'node:fs/promises';
import { GyrdConfigSchema } from '../schemas/index.js';
import type { GyrdConfig, FormatTarget } from '../schemas/index.js';
import { getContentSet } from '../registry/index.js';
import { loadContent } from './content-loader.js';
import type { LoadedAgent } from './content-loader.js';
import { TemplateEngine } from './engine.js';
import type { GenerationResult, GeneratedFile } from './types.js';
import { writeFileAtomic } from '../utils/index.js';
import { buildManifest, writeManifest } from '../manifest/index.js';
import { VERSION } from '../constants.js';

export interface GenerateOptions {
  /** Override content root for testing */
  contentRoot?: string;
  /** Override generated_at for deterministic output */
  generatedAt?: string;
  /** Override version string */
  version?: string;
}

function getTemplatesRoot(): string {
  const thisDir = dirname(fileURLToPath(import.meta.url));
  return join(thisDir, '..', '..', '..', '..', 'content', 'templates');
}

function buildAgentFileContent(agent: LoadedAgent): string {
  const frontmatter = [
    '---',
    `name: ${agent.name}`,
    `description: ${agent.description}`,
    `model: ${agent.model}`,
    'file_ownership:',
    `  read: [${agent.file_ownership.read.map((r) => `"${r}"`).join(', ')}]`,
    `  write: [${agent.file_ownership.write.map((w) => `"${w}"`).join(', ')}]`,
  ];
  if (agent.tools.length > 0) {
    frontmatter.push('tools:');
    for (const tool of agent.tools) {
      frontmatter.push(`  - ${tool}`);
    }
  }
  frontmatter.push(`memory: ${agent.memory}`);
  frontmatter.push('---');
  frontmatter.push('');
  frontmatter.push(agent.body);

  return frontmatter.join('\n');
}

function applyDefaults(config: GyrdConfig): GyrdConfig {
  return {
    ...config,
    agents: {
      tiers: ['oversight', 'planning', 'workers', 'quality', 'specialists'],
      default_memory: 'project',
      worker_model: 'sonnet',
      oversight_model: 'opus',
      ...config.agents,
    },
    hooks: {
      pre_commit: ['lint', 'typecheck'],
      ...config.hooks,
    },
    formats: {
      generate: ['claude_md', 'agents_md', 'cursor_mdc'],
      ...config.formats,
    },
    updates: {
      channel: 'stable',
      auto_check: false,
      ...config.updates,
    },
  };
}

export async function generateProject(
  config: GyrdConfig,
  outputDir: string,
  options?: GenerateOptions,
): Promise<GenerationResult> {
  const startTime = performance.now();

  // 1. Validate config
  const validatedConfig = GyrdConfigSchema.parse(config);
  const fullConfig = applyDefaults(validatedConfig);

  // 2. Resolve content set
  const contentSet = getContentSet(fullConfig.project.preset, fullConfig.project.stack);

  // 3. Load content files
  const loaded = await loadContent(contentSet, fullConfig.project.stack, options?.contentRoot);

  // 4. Setup template engine
  const engine = new TemplateEngine();

  // Resolve templates root: if contentRoot is provided, templates are at contentRoot/templates/
  // since contentRoot points to 'content/'
  const templatesRoot = options?.contentRoot
    ? join(options.contentRoot, 'templates')
    : getTemplatesRoot();

  // 5. Load and register partials
  const partialsDir = join(templatesRoot, 'partials');
  const partialFiles = await readdir(partialsDir);
  const partials: Record<string, string> = {};
  for (const file of partialFiles) {
    if (file.endsWith('.hbs')) {
      const name = file.replace('.hbs', '');
      partials[name] = await readFile(join(partialsDir, file), 'utf8');
    }
  }
  engine.registerPartials(partials);

  // 6. Load main templates
  const templateSources: Record<string, string> = {};
  const mainTemplateFiles = ['claude-md.hbs', 'agents-md.hbs', 'gyrd-toml.hbs', 'cursor-mdc.hbs'];
  for (const file of mainTemplateFiles) {
    templateSources[file] = await readFile(join(templatesRoot, file), 'utf8');
  }

  // 7. Build template context
  const version = options?.version ?? VERSION;
  const context: Record<string, unknown> = {
    project: fullConfig.project,
    team: fullConfig.team,
    agents: loaded.agents,
    rules: loaded.rules,
    hooks: fullConfig.hooks,
    formats: fullConfig.formats,
    updates: fullConfig.updates,
    presetMeta: contentSet.presetMeta,
    gyrd_version: version,
  };

  // 8. Render output files
  const files: GeneratedFile[] = [];
  const formatsToGenerate: FormatTarget[] = fullConfig.formats?.generate ?? ['claude_md', 'agents_md', 'cursor_mdc'];

  // gyrd.toml (always generated)
  files.push({
    path: 'gyrd.toml',
    content: engine.render(templateSources['gyrd-toml.hbs'], context),
    component: 'config',
  });

  // CLAUDE.md
  if (formatsToGenerate.includes('claude_md')) {
    files.push({
      path: 'CLAUDE.md',
      content: engine.render(templateSources['claude-md.hbs'], context),
      component: 'formats',
    });
  }

  // AGENTS.md
  if (formatsToGenerate.includes('agents_md')) {
    files.push({
      path: 'AGENTS.md',
      content: engine.render(templateSources['agents-md.hbs'], context),
      component: 'formats',
    });
  }

  // .claude/agents/*.md — one per agent
  for (const agent of loaded.agents) {
    files.push({
      path: `.claude/agents/${agent.name}.md`,
      content: buildAgentFileContent(agent),
      component: 'agents',
    });
  }

  // .claude/rules/*.md — one per rule
  for (const rule of loaded.rules) {
    files.push({
      path: `.claude/rules/${rule.id}.md`,
      content: rule.content,
      component: 'rules',
    });
  }

  // .claude/hooks/* — one per hook
  for (const hook of loaded.hooks) {
    files.push({
      path: `.claude/hooks/${hook.filename}`,
      content: hook.content,
      component: 'hooks',
    });
  }

  // .cursor/rules/*.mdc — one per rule
  if (formatsToGenerate.includes('cursor_mdc')) {
    for (const rule of loaded.rules) {
      const cursorContext = {
        description: rule.id,
        globs: '',
        alwaysApply: true,
        content: rule.content,
      };
      files.push({
        path: `.cursor/rules/${rule.id}.mdc`,
        content: engine.render(templateSources['cursor-mdc.hbs'], cursorContext),
        component: 'formats',
      });
    }
  }

  // Templates — copy shared templates into output
  for (const template of loaded.templates) {
    files.push({
      path: `.claude/templates/${template.id}.md`,
      content: template.content,
      component: 'templates',
    });
  }

  // 9. Sort files alphabetically for determinism (NFR-004)
  files.sort((a, b) => a.path.localeCompare(b.path));

  // 10. Write all files to outputDir
  for (const file of files) {
    const fullPath = join(outputDir, file.path);
    await writeFileAtomic(fullPath, file.content);
    // Hook scripts must be executable
    if (file.component === 'hooks') {
      await chmod(fullPath, 0o755);
    }
  }

  // 11. Build and write manifest
  const manifest = buildManifest(fullConfig, files, version, {
    generatedAt: options?.generatedAt,
  });
  await writeManifest(outputDir, manifest);

  const duration = performance.now() - startTime;

  return { files, duration };
}
