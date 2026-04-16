import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execFile);

export async function isGitRepo(dir: string): Promise<boolean> {
  try {
    await exec('git', ['rev-parse', '--is-inside-work-tree'], { cwd: dir });
    return true;
  } catch {
    return false;
  }
}

export async function createBackupBranch(name: string, dir: string): Promise<void> {
  await exec('git', ['branch', name], { cwd: dir });
}

export async function getCurrentBranch(dir: string): Promise<string> {
  const { stdout } = await exec('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: dir });
  return stdout.trim();
}
