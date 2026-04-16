import { Command } from 'commander';
import { VERSION } from '@rig/core';
import { generateAction } from './commands/generate.js';
import { runDoctor } from './commands/doctor.js';
import { runUpdate } from './commands/update.js';

export function createProgram(): Command {
  const program = new Command()
    .name('rig')
    .description('Manage your AI dev practice')
    .version(VERSION);

  program
    .command('generate')
    .alias('gen')
    .description('Regenerate output files from rig.toml')
    .argument('[target]', 'Specific target: claude_md, agents_md, cursor_mdc')
    .action(generateAction);

  program
    .command('doctor')
    .alias('check')
    .description('Check health of your RIG setup')
    .option('--json', 'Output results as JSON')
    .action(async (options) => runDoctor(options));

  program
    .command('update')
    .description('Update RIG configuration to latest version')
    .option('--dry-run', 'Show proposed changes without applying')
    .option('--component <name>', 'Update only a specific component (agents, rules, hooks, formats, templates)')
    .action(async (options) => runUpdate(options));

  return program;
}

export async function run(argv?: string[]): Promise<void> {
  const program = createProgram();
  await program.parseAsync(argv ?? process.argv);
}
