import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { buildSite } from '../scripts/build-site.mjs';

test('static artifact contains only runnable assets, stamps its SHA and resolves under a project path', async () => {
  const temporary = await mkdtemp(path.join(tmpdir(), 'webmcplite-site-'));
  const destination = path.join(temporary, 'site');
  const commit = 'a'.repeat(40);
  try {
    await buildSite(destination, commit);
    const files = (await readdir(destination, { recursive: true })).filter(f => path.extname(f)).sort();
    assert.deepEqual(files, ['examples/app.js', 'examples/manual.json', 'examples/style.css', 'examples/tools.js', 'examples/workspace.js', 'index.html', 'src/connect.js', 'version.json']);
    const html = await readFile(path.join(destination, 'index.html'), 'utf8');
    assert.ok(html.includes(`<meta name="build-commit" content="${commit}">`));
    assert.doesNotMatch(html, /agentsmd|webmcpLite/);
    assert.deepEqual(JSON.parse(await readFile(path.join(destination, 'version.json'), 'utf8')), { commit });
    const base = new URL('https://example.test/WebMCPLite/');
    const refs = [...html.matchAll(/(?:href|src)="([^"]+\.(?:js|css))"/g)].map(m => m[1]);
    for (const ref of refs) {
      const url = new URL(ref, base);
      assert.ok(url.pathname.startsWith(base.pathname));
      await readFile(path.join(destination, url.pathname.slice(base.pathname.length)));
    }
    for (const asset of files.filter(f => f.endsWith('.js'))) {
      const source = await readFile(path.join(destination, asset), 'utf8');
      assert.doesNotMatch(source, /window\.webmcpLite/);
      for (const match of source.matchAll(/(?:from |new URL\()'([^']+\.(?:js|json))'/g)) {
        const url = new URL(match[1], new URL(asset, base));
        assert.ok(url.pathname.startsWith(base.pathname));
        await readFile(path.join(destination, url.pathname.slice(base.pathname.length)));
      }
    }
    await assert.rejects(buildSite(destination, 'invalid'), TypeError);
    assert.deepEqual(JSON.parse(await readFile(path.join(destination, 'version.json'), 'utf8')), { commit });
  } finally { await rm(temporary, { recursive: true, force: true }); }
});
