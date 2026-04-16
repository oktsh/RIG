import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  {
    extends: 'packages/core/vitest.config.ts',
    test: { name: 'core' },
  },
  {
    extends: 'packages/create-rig/vitest.config.ts',
    test: { name: 'create-rig', globalSetup: ['./vitest.setup.ts'] },
  },
  {
    extends: 'packages/rig-cli/vitest.config.ts',
    test: { name: 'rig-cli', globalSetup: ['./vitest.setup.ts'] },
  },
  {
    extends: 'tests/vitest.config.ts',
    test: { name: 'e2e', globalSetup: ['./vitest.setup.ts'] },
  },
]);
