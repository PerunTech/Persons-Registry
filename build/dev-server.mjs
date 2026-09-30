import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { build } from 'vite';

/**
 * The dev server: the shell, the bundles it loads, and this module's own build.
 *
 * The bundle this repository ships is a UMD file the shell fetches as a plugin,
 * not a page, so Vite's module-by-module dev server has nothing to serve for it.
 * What `pnpm dev` does instead is what a deployment does, with this module
 * swapped for the local build: it serves perun-core's page, the bundle that page
 * loads, and `backend/www/persons-registry.js`, rebuilt whenever a source file
 * changes. Everything else is proxied to the backend.
 *
 * `.mjs` for the same reason vite.config.mjs is: this package has no `type`
 * field, so a `.js` here would be read as CommonJS.
 */

const root = path.resolve(import.meta.dirname, '..');
const www = path.join(root, 'backend/www');
const require = createRequire(import.meta.url);

/** The nearest package.json at or above a directory, or null. */
const manifestNear = (dir) => {
  let current = dir;
  for (;;) {
    const candidate = path.join(current, 'package.json');
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
};

/**
 * The bundle the shell provides at runtime.
 *
 * In a deployment it is loaded as a separate script and every module shares one
 * copy. Locally we serve the very same file, rather than bundling it into this
 * one, so dev behaves like production.
 *
 * Bundling it instead does not work: perun-core's package entry is a full,
 * code-split application, and the chunks it lazy-loads are not published -- a
 * dev-bundled copy dies on `Loading chunk 304 failed` partway through its own
 * bootstrap.
 *
 * A sibling checkout wins over the installed package when one is present. Two
 * reasons, and the first is not a convenience: perun-core code-splits with
 * chunkFilename '[name].perun-core.js', but only the entry chunk is committed,
 * so the installed package asks for chunks that were never published. A local
 * build has them. The second is the dev loop -- rebuild perun-core next door
 * and reload this page, with no publish and no reinstall in between.
 *
 * The checkout is also the fallback when the package is not installed at all,
 * which is the state of any machine that cannot reach gitlab.prtech.mk.
 */
const vendorBundle = (name, from, sibling) => {
  const local = sibling && path.resolve(root, '..', sibling);

  let installed = null;
  try {
    const manifest = require.resolve(`${name}/package.json`, from ? { paths: [from] } : undefined);
    installed = path.join(path.dirname(manifest), require(manifest).main);
  } catch {
    installed = null;
  }

  const localManifest = local && manifestNear(local);
  const file = installed
    ? path.basename(installed)
    : localManifest && path.basename(require(localManifest).main);

  if (local && file && fs.existsSync(path.join(local, file))) {
    return { name, dir: local, file, source: 'checkout' };
  }

  if (installed) {
    return { name, dir: path.dirname(installed), file, source: 'installed' };
  }

  throw new Error(
    `vite: ${name} is neither installed nor built in a sibling checkout. ` +
    `Run \`pnpm install\`, or build it in ../${sibling.split('/')[0]}.`
  );
};

/**
 * The `window.server` assignments a browser would actually run.
 *
 * Anchored to the start of a line, so a commented-out host is skipped rather
 * than read -- and global, so where several are live every one is found. Built
 * fresh per call because a `g` regex carries `lastIndex` between uses.
 *
 * This was `source.match(...)` with no anchor and no flag, which takes the first
 * occurrence anywhere in the file, comments included. A config.js that keeps its
 * previous host on a `//` line above the live one therefore pointed the proxy at
 * that old host while rewriting the same commented line for the page -- leaving
 * the page on the real host, loading perun-core from the deployment and
 * silently ignoring every locally built bundle.
 */
const serverLine = () => /^([ \t]*)window\.server\s*=\s*['"]([^'"]+)['"]/gm;

/**
 * The API origin, taken from the config.js that already sits beside index.html
 * so there is only one place to change it.
 *
 * The browser refuses a cross-origin request from localhost to that host, so in
 * dev we proxy the same path instead and hand the page a relative URL. The last
 * live assignment is the one JavaScript would leave standing.
 */
const readApiUrl = () => {
  const source = fs.readFileSync(path.join(www, 'config.js'), 'utf8');
  const found = [...source.matchAll(serverLine())];
  return found.length ? new URL(found[found.length - 1][2]) : null;
};

const TYPES = {
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
};

/**
 * Serve a directory under a URL prefix; anything it does not hold goes on.
 *
 * `no-store` on everything. The shell appends this module's script itself, with
 * no version in the URL, so a browser is free to keep the copy it fetched first
 * -- and a rebuild then changes nothing on screen until its cache is cleared
 * by hand, which is indistinguishable from the new code not running.
 */
const serveDir = (prefix, dir) => (req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  const { pathname } = new URL(req.url, 'http://localhost');
  if (!pathname.startsWith(prefix)) return next();

  let relative;
  try {
    relative = decodeURIComponent(pathname.slice(prefix.length));
  } catch {
    return next();
  }
  const file = path.join(dir, relative);
  if (file !== dir && !file.startsWith(dir + path.sep)) return next();

  fs.stat(file, (error, stat) => {
    if (error || !stat.isFile()) return next();
    res.setHeader('Content-Type', TYPES[path.extname(file)] ?? 'application/octet-stream');
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Cache-Control', 'no-store');
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(file).pipe(res);
  });
};

/**
 * @param {{ name: string, file: string }} self  This module, as the shell
 *   addresses it: a context path and the file the backend serves under it.
 */
export function devServer(self) {
  // Resolved when the server starts, not when the config is read: `vite build`
  // loads this same config, on a CI runner with no config.js and no sibling
  // checkouts, and has no use for any of it.
  const resolve = () => {
    const perunCore = vendorBundle('perun-core', null, 'perun-core/www');
    const vendors = [perunCore];

    /**
     * The paths the dev server answers for itself. Everything else is the
     * backend's.
     *
     * Each package's npm name is also its context path on the server, so mounting
     * them under `/<name>` puts the local copy at the very URL the shell asks
     * for, and the shell loads it without knowing the difference.
     */
    const owned = [...vendors, self].map(v => `/${v.name}/`);

    return { perunCore, vendors, owned, api: readApiUrl() };
  };
  let site;
  // Vite's own: the client that reloads the page, and what it imports. The client
  // pulls in `env.mjs` from wherever the package manager put Vite, which pnpm
  // makes a path under /node_modules/ -- left to the proxy that is the backend's
  // 404, and the client then never runs.
  const viteOwned = ['/@', '/node_modules/'];

  return {
    name: `${self.name}:dev-server`,
    apply: 'serve',

    config: () => {
      site = resolve();
      const { api, owned } = site;
      return {
        // The shell's page is served below, not Vite's.
        appType: 'custom',
        publicDir: false,
        server: {
          port: 8080,
          proxy: api ? {
            // Inverted on purpose. The dev server owns a short, known list of
            // paths; everything else belongs to the backend -- the API, the other
            // plugins, and the shared assets whose location the server only
            // reveals at runtime through FRONTEND_ASSETS_LOCATION, so they cannot
            // be listed here. A request this plugin did not answer has reached the
            // proxy, so what is left to exempt is only what Vite answers next.
            '^/': {
              target: api.origin,
              changeOrigin: true,
              secure: false,
              bypass: (req) => {
                const { pathname } = new URL(req.url, 'http://localhost');
                return [...owned, ...viteOwned].some(prefix => pathname.startsWith(prefix))
                  ? req.url
                  : undefined;
              },
            },
          } : undefined,
        },
      };
    },

    async configureServer(server) {
      const { perunCore, vendors, api } = site;
      // Not just a page: this module's bundle, rebuilt on every change, straight
      // into backend/www where `pnpm build` puts it. The dev entry, which
      // registers with the shell's plugin manager (see frontend/client.js).
      const watcher = await build({
        configFile: server.config.configFile,
        mode: 'development',
        build: { watch: {} },
      });

      // Held back until the first bundle is written, so the first page load does
      // not meet the previous run's file, or none.
      let ready;
      const built = new Promise(resolve => { ready = resolve; });
      watcher.on('event', (event) => {
        if (event.code === 'BUNDLE_END') {
          event.result.close();
          // The job live reload did: a rebuilt bundle is a new page.
          server.ws.send({ type: 'full-reload', path: '*' });
          ready();
        } else if (event.code === 'ERROR') {
          // Vite has already printed it; the server stays up for the next save.
          ready();
        }
      });
      server.httpServer?.once('close', () => watcher.close());
      await built;

      // Serve the real config.js with only the API URL rewritten.
      //
      // Same-origin in dev, so the proxy handles the API and CORS never applies.
      // Everything else in the file is left alone.
      if (api) {
        server.middlewares.use((req, res, next) => {
          if (req.method !== 'GET' || new URL(req.url, 'http://localhost').pathname !== '/config.js') {
            return next();
          }
          const source = fs.readFileSync(path.join(www, 'config.js'), 'utf8');
          res.setHeader('Content-Type', TYPES['.js']);
          res.setHeader('Cache-Control', 'no-store');
          res.end(
            // Every live assignment, indentation kept; commented-out hosts are
            // left exactly as written so the file still documents them.
            source.replace(serverLine(), (_match, indent) => `${indent}window.server = '${api.pathname}'`)
          );
        });

        // Serve index.html as the shell's own page: perun-core and nothing else.
        //
        // The committed file loads this module directly, which is right for the
        // standalone page it describes but wrong here -- the shell loads every
        // plugin itself, in dependency order, and a second copy from a script tag
        // would be a second evaluation of the same bundle. Hand the page the
        // shell and let it do the loading, exactly as a deployment does.
        server.middlewares.use(async (req, res, next) => {
          const { pathname } = new URL(req.url, 'http://localhost');
          if (req.method !== 'GET' || (pathname !== '/' && pathname !== '/index.html')) return next();
          const html = fs.readFileSync(path.join(www, 'index.html'), 'utf8').replace(
            `<script src="${self.file}"></script>`,
            `<script src="/${perunCore.name}/${perunCore.file}"></script>`
          );
          res.setHeader('Content-Type', TYPES['.html']);
          res.setHeader('Cache-Control', 'no-store');
          // Through Vite, for the client that turns a rebuild into a reload.
          res.end(await server.transformIndexHtml(req.url, html));
        });
      }

      for (const v of vendors) server.middlewares.use(serveDir(`/${v.name}/`, v.dir));
      // This module's build, at the path the shell fetches plugins from.
      //
      // Without this the page runs the copy deployed on the server and quietly
      // discards the local one: perun-core's Router loads `/<context>/<file>.js`
      // off the API origin.
      server.middlewares.use(serveDir(`/${self.name}/`, www));
      // With no API to proxy to there is no shell page either, so the committed
      // index.html stands as the standalone page it describes.
      if (!api) server.middlewares.use(serveDir('/', www));
    },
  };
}
