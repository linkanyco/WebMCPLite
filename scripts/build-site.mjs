import { readFile, readdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

const root = fileURLToPath(new URL('../', import.meta.url));

// Keep upstream notices with the browser code actually included by the bundler.
async function thirdPartyNotices(bundle) {
  const directories = new Set();
  for (const chunk of Object.values(bundle)) {
    if (chunk.type !== 'chunk') continue;
    for (const id of Object.keys(chunk.modules)) {
      const marker = '/node_modules/';
      const offset = id.lastIndexOf(marker);
      if (offset < 0) continue;
      const start = offset + marker.length;
      const segments = id.slice(start).split('/');
      const name = segments.slice(0, segments[0].startsWith('@') ? 2 : 1).join('/');
      directories.add(id.slice(0, start) + name);
    }
  }
  const notices = [];
  const missing = [];
  for (const directory of [...directories].sort()) {
    const info = JSON.parse(await readFile(path.join(directory, 'package.json'), 'utf8'));
    const files = (await readdir(directory)).filter(name => /^(licen[cs]e|copying|notice)(?:[._-]|$)/i.test(name)).sort();
    let text = await Promise.all(files.map(async name => `${name}\n${await readFile(path.join(directory, name), 'utf8')}`));
    // These pinned npm distributions omit standalone license files.
    if (!text.length && info.name === '@ant-design/icons-svg' && info.version === '4.6.0') {
      // Same upstream repository/license, verified against ant-design-icons/LICENSE.
      text = [`LICENSE (ant-design/ant-design-icons)\n${await readFile(path.join(root, 'node_modules/@ant-design/icons/LICENSE'), 'utf8')}`];
    }
    if (!text.length && info.name === 'is-mobile' && info.version === '5.0.0') {
      const section = (await readFile(path.join(directory, 'README.md'), 'utf8')).split('\n## License\n')[1];
      if (section?.includes('Permission is hereby granted')) text = [`README.md / License\n${section}`];
    }
    if (!text.length) { missing.push(info.name); continue; }
    notices.push(`${info.name}@${info.version}\n${text.join('\n')}`);
  }
  if (missing.length) throw new Error(`Missing bundled dependency notices: ${missing.join(', ')}`);
  return `Third-party notices for the bundled WebMCPLite gallery.\nThese packages retain their own license terms.\n\n${notices.join('\n\n---\n\n')}\n`;
}

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
      async generateBundle(_options, bundle) {
        this.emitFile({ type: 'asset', fileName: 'third-party-notices.txt', source: await thirdPartyNotices(bundle) });
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
