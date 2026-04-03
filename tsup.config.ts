import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/main/server.ts'],
  format: ['esm'],
  outDir: 'dist',
  clean: true,
  tsconfig: './tsconfig.json',
});
