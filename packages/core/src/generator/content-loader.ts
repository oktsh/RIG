import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { AgentFrontmatterSchema } from '../schemas/index.js';
import type { ContentSet, AgentDef, RuleDef, HookDef, WorkflowDef, ProtocolDef, TemplateDef } from '../registry/types.js';
import type { Stack } from '../schemas/index.js';

export interface LoadedAgent {
  id: string;
  name: string;
  description: string;
  model: string;
  file_ownership: { read: string[]; write: string[] };
  tools: string[];
  memory: string;
  body: string;
}

export interface LoadedRule {
  id: string;
  content: string;
}

export interface LoadedHook {
  id: string;
  filename: string;
  content: string;
}

export interface LoadedWorkflow {
  id: string;
  content: string;
}

export interface LoadedProtocol {
  id: string;
  content: string;
}

export interface LoadedTemplate {
  id: string;
  content: string;
}

export interface LoadedContent {
  agents: LoadedAgent[];
  rules: LoadedRule[];
  hooks: LoadedHook[];
  workflows: LoadedWorkflow[];
  protocols: LoadedProtocol[];
  templates: LoadedTemplate[];
}

function getContentRoot(): string {
  const thisDir = dirname(fileURLToPath(import.meta.url));
  // src/generator/ -> content/ (repo root)
  return join(thisDir, '..', '..', '..', '..', 'content');
}

function parseAgentFrontmatter(raw: string): { frontmatter: Record<string, unknown>; body: string } {
  const trimmed = raw.trimStart();
  if (!trimmed.startsWith('---')) {
    throw new Error('Agent file missing YAML frontmatter (no opening ---)');
  }

  const secondDash = trimmed.indexOf('---', 3);
  if (secondDash === -1) {
    throw new Error('Agent file missing closing --- for frontmatter');
  }

  const yamlBlock = trimmed.slice(3, secondDash).trim();
  const body = trimmed.slice(secondDash + 3).trim();
  const frontmatter = parseYaml(yamlBlock) as Record<string, unknown>;

  return { frontmatter, body };
}

async function readContentFile(path: string): Promise<string> {
  return readFile(path, 'utf8');
}

async function loadAgent(def: AgentDef, contentRoot: string): Promise<LoadedAgent> {
  const filePath = join(contentRoot, 'presets', def.preset, 'agents', def.filename);
  const raw = await readContentFile(filePath);
  const { frontmatter, body } = parseAgentFrontmatter(raw);
  const validated = AgentFrontmatterSchema.parse(frontmatter);

  return {
    id: def.id,
    name: validated.name,
    description: validated.description,
    model: validated.model,
    file_ownership: validated.file_ownership,
    tools: validated.tools ?? [],
    memory: validated.memory ?? 'project',
    body,
  };
}

async function loadRule(def: RuleDef, contentRoot: string, stack: Stack): Promise<LoadedRule> {
  // Try preset path first, then stack path (for stack-specific rules like stack-rules.md)
  const presetPath = join(contentRoot, 'presets', def.preset, 'rules', def.filename);
  try {
    const content = await readContentFile(presetPath);
    return { id: def.id, content };
  } catch {
    // Fall back to stack path
    const stackPath = join(contentRoot, 'stacks', stack, def.filename);
    const content = await readContentFile(stackPath);
    return { id: def.id, content };
  }
}

async function loadHook(def: HookDef, contentRoot: string): Promise<LoadedHook> {
  const filePath = join(contentRoot, 'stacks', def.stack, 'hooks', def.filename);
  const content = await readContentFile(filePath);
  return { id: def.id, filename: def.filename, content };
}

async function loadWorkflow(def: WorkflowDef, contentRoot: string): Promise<LoadedWorkflow> {
  const filePath = join(contentRoot, 'presets', def.preset, 'workflows', def.filename);
  const content = await readContentFile(filePath);
  return { id: def.id, content };
}

async function loadProtocol(def: ProtocolDef, contentRoot: string): Promise<LoadedProtocol> {
  const filePath = join(contentRoot, 'presets', def.preset, 'protocols', def.filename);
  const content = await readContentFile(filePath);
  return { id: def.id, content };
}

async function loadTemplate(def: TemplateDef, contentRoot: string): Promise<LoadedTemplate> {
  const filePath = join(contentRoot, 'presets', 'shared', 'templates', def.filename);
  const content = await readContentFile(filePath);
  return { id: def.id, content };
}

export async function loadContent(
  contentSet: ContentSet,
  stack: Stack,
  contentRoot?: string,
): Promise<LoadedContent> {
  const root = contentRoot ?? getContentRoot();

  const [agents, rules, hooks, workflows, protocols, templates] = await Promise.all([
    Promise.all(contentSet.agents.map((d) => loadAgent(d, root))),
    Promise.all(contentSet.rules.map((d) => loadRule(d, root, stack))),
    Promise.all(contentSet.hooks.map((d) => loadHook(d, root))),
    Promise.all(contentSet.workflows.map((d) => loadWorkflow(d, root))),
    Promise.all(contentSet.protocols.map((d) => loadProtocol(d, root))),
    Promise.all(contentSet.templates.map((d) => loadTemplate(d, root))),
  ]);

  return { agents, rules, hooks, workflows, protocols, templates };
}
