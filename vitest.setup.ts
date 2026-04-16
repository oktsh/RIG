import { execSync } from 'node:child_process';

export default function setup() {
  console.log('[vitest] Building all packages...');
  execSync('pnpm build', {
    cwd: import.meta.dirname,
    stdio: 'pipe',
    timeout: 120_000,
  });
  console.log('[vitest] Build complete.');
}
