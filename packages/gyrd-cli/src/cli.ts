import { Command } from 'commander';
import { VERSION } from '@gyrd/core';
import { generateAction } from './commands/generate.js';
import { runDoctor } from './commands/doctor.js';
import { runUpdate } from './commands/update.js';
import { initAction } from './commands/init.js';

export function createProgram(): Command {
  const program = new Command()
    .name('gyrd')
    .description('Manage your AI dev practice')
    .version(VERSION);

  program
    .command('init')
    .description('Create a new GYRD setup in the current directory')
    .option('--preset <preset>', 'Preset: pm, small-team, solo-dev')
    .option('--stack <stack>', 'Stack: nextjs, python-fastapi')
    .option('--name <name>', 'Project name')
    .option('--team-size <size>', 'Team size (small-team only)', parseInt)
    .option('--force', 'Overwrite existing gyrd.toml')
    .action(async (options) => initAction(options));

  program
    .command('generate')
    .alias('gen')
    .description('Regenerate output files from gyrd.toml')
    .argument('[target]', 'Specific target: claude_md, agents_md, cursor_mdc')
    .action(generateAction);

  program
    .command('doctor')
    .alias('check')
    .description('Check health of your GYRD setup')
    .option('--json', 'Output results as JSON')
    .action(async (options) => runDoctor(options));

  program
    .command('update')
    .description('Update GYRD configuration to latest version')
    .option('--check', 'Show what needs updating and why (sources → rules mapping)')
    .option('--dry-run', 'Show proposed changes without applying')
    .option('--component <name>', 'Update only a specific component (agents, rules, hooks, formats, templates)')
    .action(async (options) => runUpdate(options));

  return program;
}

export async function run(argv?: string[]): Promise<void> {
  const program = createProgram();
  await program.parseAsync(argv ?? process.argv);
}
