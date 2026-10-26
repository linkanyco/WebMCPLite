import { writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

const root = fileURLToPath(new URL('../', import.meta.url));

// Bundle the HTML entry and its imports; never copy the repository tree.
export async function buildSite(destination, commit) {
  if (!/^[a-f0-9]{40}$/.test(commit)) throw new TypeError('A full Git commit SHA is required.');
  await build({
    root,
    configFile: path.join(root, 'vite.config.js'),
    logLevel: 'warn',
    build: { outDir: path.resolve(destination), emptyOutDir: true },
    plugins: [{
      name: 'published-commit',
      transformIndexHtml(html) {
        return html.replace('<meta name="build-commit" content="">', `<meta name="build-commit" content="${commit}">`);
      },
    }],
  });
  await writeFile(path.join(destination, 'version.json'), JSON.stringify({ commit }) + '\n');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const commit = process.env.GITHUB_SHA || execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
  await buildSite(path.join(root, 'dist'), commit);
  console.log(`Bundled examples ready in dist/ (${commit.slice(0, 7)})`);
}
