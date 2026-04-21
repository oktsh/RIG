import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  {
    extends: 'packages/core/vitest.config.ts',
    test: { name: 'core' },
  },
{
    extends: 'packages/gyrd-cli/vitest.config.ts',
    test: { name: 'gyrd-cli', globalSetup: ['./vitest.setup.ts'] },
  },
  {
    extends: 'tests/vitest.config.ts',
    test: { name: 'e2e', globalSetup: ['./vitest.setup.ts'] },
  },
]);
