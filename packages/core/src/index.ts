// Schemas
export { GyrdConfigSchema, PresetSchema, StackSchema, FormatTargetSchema } from './schemas/index.js';
export type { GyrdConfig, Preset, Stack, FormatTarget } from './schemas/index.js';
export { ManifestSchema } from './schemas/index.js';
export type { Manifest } from './schemas/index.js';
export { AgentFrontmatterSchema } from './schemas/index.js';
export type { AgentFrontmatter } from './schemas/index.js';

// Registry
export { getContentSet } from './registry/index.js';
export type { ContentSet, AgentDef, RuleDef, HookDef } from './registry/types.js';

// Generator
export { TemplateEngine } from './generator/engine.js';
export { generateProject } from './generator/index.js';
export type { GenerateOptions } from './generator/index.js';
export type { GenerationResult, GeneratedFile } from './generator/types.js';

// Manifest
export { readManifest, writeManifest, buildManifest } from './manifest/index.js';

// Utils
export { computeHash } from './utils/index.js';
export { ensureDir, writeFileAtomic, readFileSafe } from './utils/index.js';
export { isGitRepo, createBackupBranch } from './utils/index.js';
export { Logger } from './utils/index.js';

// Updater
export { checkForUpdates, performUpdate } from './updater/index.js';
export type { UpdatePlan, UpdateResult, UpdateSummary, ComponentChange, FileChange } from './updater/types.js';
export { mergeClaudeMd } from './updater/claude-md-merge.js';

// Doctor
export { runChecks } from './doctor/index.js';
export type { RunChecksOptions } from './doctor/index.js';
export type { CheckResult, CheckStatus, DoctorResult } from './doctor/types.js';

export { VERSION } from './constants.js';
