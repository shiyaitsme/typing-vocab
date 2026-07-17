import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: false,
  clean: true,
  splitting: false,
  minify: false,
  injectStyle: false,
  external: ['react', 'react-dom'],
});
