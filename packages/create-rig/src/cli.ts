import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';
import {
  VERSION,
  Logger,
  generateProject,
  PresetSchema,
  StackSchema,
} from '@rig/core';
import type { RigConfig, Preset, Stack } from '@rig/core';
import { collectOptions, confirmOverwrite } from './prompts.js';

// Resolve content root relative to this file (bundled into dist/index.js)
// dist/index.js -> packages/create-rig/dist/ -> packages/create-rig/ -> packages/ -> <repo-root>/content/
const _thisDir = dirname(fileURLToPath(import.meta.url));
const CONTENT_ROOT = join(_thisDir, '..', '..', '..', 'content');

function buildConfig(opts: {
  preset: Preset;
  stack: Stack;
  name: string;
  teamSize?: number;
}): RigConfig {
  return {
    project: {
      name: opts.name,
      preset: opts.preset,
      stack: opts.stack,
    },
    team: opts.preset === 'small-team' ? { size: opts.teamSize ?? 3 } : undefined,
  };
}

export function createProgram(): Command {
  const program = new Command()
    .name('create-rig')
    .description('Create a managed AI dev practice setup')
    .version(VERSION)
    .option('--preset <preset>', 'Preset: pm, small-team, solo-dev')
    .option('--stack <stack>', 'Stack: nextjs, python-fastapi')
    .option('--name <name>', 'Project name')
    .option('--team-size <size>', 'Team size (small-team only)', parseInt)
    .option('--force', 'Overwrite existing rig.toml')
    .action(async (options) => {
      try {
        const hasAllRequired = options.preset && options.stack && options.name;

        // Validate preset / stack if provided
        if (options.preset) {
          const result = PresetSchema.safeParse(options.preset);
          if (!result.success) {
            Logger.error(`Invalid preset: "${options.preset}". Must be one of: pm, small-team, solo-dev`);
            process.exit(1);
          }
        }
        if (options.stack) {
          const result = StackSchema.safeParse(options.stack);
          if (!result.success) {
            Logger.error(`Invalid stack: "${options.stack}". Must be one of: nextjs, python-fastapi`);
            process.exit(1);
          }
        }

        let preset: Preset;
        let stack: Stack;
        let name: string;
        let teamSize: number | undefined;

        if (hasAllRequired) {
          // Non-interactive mode
          preset = options.preset as Preset;
          stack = options.stack as Stack;
          name = options.name as string;
          teamSize = options.teamSize as number | undefined;
        } else {
          // Interactive mode — prompt for missing values
          const collected = await collectOptions({
            preset: options.preset as Preset | undefined,
            stack: options.stack as Stack | undefined,
            name: options.name as string | undefined,
            teamSize: options.teamSize as number | undefined,
          });
          preset = collected.preset;
          stack = collected.stack;
          name = collected.name;
          teamSize = collected.teamSize;
        }

        const cwd = process.cwd();
        const rigTomlPath = join(cwd, 'rig.toml');

        // Check existing rig.toml
        if (existsSync(rigTomlPath) && !options.force) {
          if (hasAllRequired) {
            // Non-interactive mode without --force: error
            Logger.error('rig.toml already exists. Use --force to overwrite.');
            process.exit(1);
          }
          const overwrite = await confirmOverwrite();
          if (!overwrite) {
            Logger.info('Cancelled. Existing rig.toml left unchanged.');
            process.exit(0);
          }
        }

        // Build config and generate
        const config = buildConfig({ preset, stack, name, teamSize });
        const result = await generateProject(config, cwd, { contentRoot: CONTENT_ROOT });

        // Print results
        console.log('');
        Logger.success(`Generated ${result.files.length} files`);
        console.log('');

        const keyFiles = result.files
          .filter((f) => ['rig.toml', 'CLAUDE.md', 'AGENTS.md'].includes(f.path))
          .map((f) => f.path);
        for (const file of keyFiles) {
          Logger.dim(`  ${file}`);
        }

        console.log('');
        Logger.info('Next steps:');
        Logger.summary([
          '1. Review rig.toml and customize',
          "2. Run 'rig generate' to regenerate after changes",
          "3. Run 'rig doctor' to check your setup",
        ]);
        console.log('');
      } catch (err: unknown) {
        // Handle Ctrl+C (ExitPromptError from @inquirer/prompts)
        if (
          err instanceof Error &&
          err.name === 'ExitPromptError'
        ) {
          console.log('');
          Logger.dim('Cancelled.');
          process.exit(0);
        }
        throw err;
      }
    });

  return program;
}

export async function run(argv?: string[]): Promise<void> {
  const program = createProgram();
  await program.parseAsync(argv ?? process.argv);
}
