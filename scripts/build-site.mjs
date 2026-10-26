import { mkdir, readFile, writeFile, copyFile, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const assets = [
  'examples/app.js', 'examples/tools.js', 'examples/workspace.js',
  'examples/style.css', 'examples/manual.json', 'src/connect.js',
];

// Publish only runnable static assets, never the repository tree or local files.
export async function buildSite(destination, commit) {
  if (!/^[a-f0-9]{40}$/.test(commit)) throw new TypeError('A full Git commit SHA is required.');
  await rm(destination, { recursive: true, force: true });
  await mkdir(destination, { recursive: true });
  for (const asset of assets) {
    await mkdir(path.dirname(path.join(destination, asset)), { recursive: true });
    await copyFile(path.join(root, asset), path.join(destination, asset));
  }
  const html = (await readFile(path.join(root, 'index.html'), 'utf8'))
    .replace('<meta name="build-commit" content="">', `<meta name="build-commit" content="${commit}">`);
  await writeFile(path.join(destination, 'index.html'), html);
  await writeFile(path.join(destination, 'version.json'), JSON.stringify({ commit }) + '\n');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const commit = process.env.GITHUB_SHA || execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
  await buildSite(path.join(root, 'dist'), commit);
  console.log(`Static examples ready in dist/ (${commit.slice(0, 7)})`);
}
