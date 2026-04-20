import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  clean: true,
  sourcemap: true,
  banner: {
    // Shebang + createRequire shim so bundled CJS deps can require() node builtins
    js: [
      '#!/usr/bin/env node',
      'import { createRequire as __$$createRequire } from "node:module";',
      'const require = __$$createRequire(import.meta.url);',
    ].join('\n'),
  },
  noExternal: [/.*/],   // Bundle all deps for standalone npx
});
