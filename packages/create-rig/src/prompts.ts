import { select, input, confirm } from '@inquirer/prompts';
import type { Preset, Stack } from '@rig/core';

export interface CollectedOptions {
  preset: Preset;
  stack: Stack;
  name: string;
  teamSize?: number;
}

export async function collectOptions(
  partial: Partial<CollectedOptions> = {},
): Promise<CollectedOptions> {
  console.log('\n  Welcome to RIG — Managed AI Dev Practice\n');

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

export async function confirmOverwrite(): Promise<boolean> {
  return confirm({
    message: 'Existing rig.toml found. Overwrite?',
    default: false,
  });
}
