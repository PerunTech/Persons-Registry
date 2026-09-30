import { defineConfig, transformWithOxc } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { devServer } from './build/dev-server.mjs';

/**
 * The production bundle: one UMD file, `backend/www/persons-registry.js`.
 *
 * The backend registers every plugin under a context path and the shell fetches
 * it from `/<context>/<file>.js`, then reads the routes off `window[<context>]`,
 * so the format and the global's name are the contract. Both halves are in
 * package.json.
 *
 * `perun-core` is the shell's, published as a window global by its own bundle,
 * and is never bundled -- in dev as well as production, so dev catches problems
 * that would otherwise appear only after deployment.
 *
 * `pnpm dev` serves the same file, rebuilt on every save, behind the shell the
 * way a deployment serves it -- see build/dev-server.mjs.
 *
 * `.mjs` because this package has no `type` field, so a `.js` here would be read
 * as CommonJS.
 */
const pkg = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, 'package.json'), 'utf8'));
const self = { name: pkg.name, file: path.basename(pkg.main) };

const frontend = path.resolve(import.meta.dirname, 'frontend') + path.sep;

/**
 * JSX in `.js`, as babel-loader read it.
 *
 * Every frontend file is `.js` and holds JSX, and Vite takes a file's language
 * from its extension -- so the parser refuses the first tag it meets. Renaming
 * the files to `.jsx` would put a rename into every blame on them, so
 * the language is stated here instead, for this repository's own source only.
 *
 * Classic JSX: `React.createElement`, with React imported from perun-core. The
 * automatic runtime would import `react/jsx-runtime`, which is not installed
 * here and would be a second React if it were.
 */
const jsxInJs = () => ({
  name: 'persons-registry:jsx-in-js',
  enforce: 'pre',
  transform(code, id) {
    if (!id.startsWith(frontend) || !id.endsWith('.js')) return null;
    return transformWithOxc(code, id, { lang: 'jsx', jsx: { runtime: 'classic' } });
  },
});

const externals = ['perun-core'];

export default defineConfig(({ mode }) => {
  const production = mode === 'production';

  return {
    publicDir: false,
    plugins: [jsxInJs(), devServer(self)],
    build: {
      outDir: 'backend/www',
      // The directory also holds index.html and config.js, and the jar packages
      // all of it.
      emptyOutDir: false,
      // perun-core's own bundle needs ES2020, so nothing runs this one where the
      // shell could not run.
      target: 'es2020',
      sourcemap: true,
      // The two modes differ in what they are for: production is the file the jar
      // ships, development the one read in a debugger and registered with the
      // shell's plugin manager (frontend/client.js).
      minify: production,
      lib: {
        entry: production ? 'frontend/index.js' : 'frontend/client.js',
        name: self.name,
        formats: ['umd'],
        fileName: () => self.file,
      },
      rollupOptions: {
        external: externals,
        output: { globals: Object.fromEntries(externals.map(name => [name, name])) },
      },
    },
  };
});
