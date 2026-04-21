import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { select, input, confirm } from '@inquirer/prompts';
import {
  Logger,
  generateProject,
  PresetSchema,
  StackSchema,
} from '@gyrd/core';
import type { GyrdConfig, Preset, Stack } from '@gyrd/core';

/**
 * Resolve the content root directory based on @gyrd/core's package location.
 * Content is shipped inside @gyrd/core at <core>/content/
 * @gyrd/core entry is at <core>/dist/index.js
 * So: dist/ -> core/ -> content/
 */
function resolveContentRoot(): string {
  const coreEntry = import.meta.resolve('@gyrd/core');
  const coreDistDir = dirname(fileURLToPath(coreEntry));
  return join(coreDistDir, '..', 'content');
}

interface CollectedOptions {
  preset: Preset;
  stack: Stack;
  name: string;
  teamSize?: number;
}

async function collectOptions(
  partial: Partial<CollectedOptions> = {},
): Promise<CollectedOptions> {
  console.log('\n  Welcome to GYRD — Managed AI Dev Practice\n');

  const preset =
    partial.preset ??
    ((await select({
      message: 'Choose your preset',
      choices: [
        {
          value: 'pm',
          name: 'Product Manager — Simplified workflow for PMs building prototypes',
        },
        {
          value: 'small-team',
          name: 'Small Team (2-5 devs) — Full agent suite with orchestration',
        },
        {
          value: 'solo-dev',
          name: 'Solo Developer — Minimal setup, just the essentials',
        },
      ],
    })) as Preset);

  const stack =
    partial.stack ??
    ((await select({
      message: 'Choose your stack',
      choices: [
        {
          value: 'nextjs',
          name: 'Next.js — TypeScript, React, App Router',
        },
        {
          value: 'python-fastapi',
          name: 'Python + FastAPI — Async Python, Pydantic, SQLAlchemy',
        },
      ],
    })) as Stack);

  const name =
    partial.name ??
    (await input({
      message: 'Project name',
      default: process.cwd().split('/').pop() ?? 'my-project',
    }));

  let teamSize: number | undefined;
  if (preset === 'small-team') {
    if (partial.teamSize != null) {
      teamSize = partial.teamSize;
    } else {
      const sizeStr = await input({
        message: 'Team size',
        default: '3',
        validate: (val) => {
          const n = parseInt(val, 10);
          if (isNaN(n) || n <= 0) return 'Must be a positive integer';
          return true;
        },
      });
      teamSize = parseInt(sizeStr, 10);
    }
  }

  return { preset, stack, name, teamSize };
}

async function confirmOverwrite(): Promise<boolean> {
  return confirm({
    message: 'Existing gyrd.toml found. Overwrite?',
    default: false,
  });
}

function buildConfig(opts: {
  preset: Preset;
  stack: Stack;
  name: string;
  teamSize?: number;
}): GyrdConfig {
  return {
    project: {
      name: opts.name,
      preset: opts.preset,
      stack: opts.stack,
    },
    team: opts.preset === 'small-team' ? { size: opts.teamSize ?? 3 } : undefined,
  };
}

export async function initAction(options: {
  preset?: string;
  stack?: string;
  name?: string;
  teamSize?: number;
  force?: boolean;
}): Promise<void> {
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
      preset = options.preset as Preset;
      stack = options.stack as Stack;
      name = options.name as string;
      teamSize = options.teamSize as number | undefined;
    } else {
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
    const gyrdTomlPath = join(cwd, 'gyrd.toml');

    // Check existing gyrd.toml
    if (existsSync(gyrdTomlPath) && !options.force) {
      if (hasAllRequired) {
        Logger.error('gyrd.toml already exists. Use --force to overwrite.');
        process.exit(1);
      }
      const overwrite = await confirmOverwrite();
      if (!overwrite) {
        Logger.info('Cancelled. Existing gyrd.toml left unchanged.');
        process.exit(0);
      }
    }

    // Build config and generate
    const contentRoot = resolveContentRoot();
    const config = buildConfig({ preset, stack, name, teamSize });
    const result = await generateProject(config, cwd, { contentRoot });

    // Print results
    console.log('');
    Logger.success(`Generated ${result.files.length} files`);
    console.log('');

    const keyFiles = result.files
      .filter((f) => ['gyrd.toml', 'CLAUDE.md', 'AGENTS.md'].includes(f.path))
      .map((f) => f.path);
    for (const file of keyFiles) {
      Logger.dim(`  ${file}`);
    }

    console.log('');
    Logger.info('Next steps:');
    Logger.summary([
      '1. Review gyrd.toml and customize',
      "2. Run 'gyrd generate' to regenerate after changes",
      "3. Run 'gyrd doctor' to check your setup",
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
}
