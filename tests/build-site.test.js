import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { buildSite } from '../scripts/build-site.mjs';

test('bundled artifact contains only runtime files, stamps its SHA and resolves under a project path', async () => {
  const temporary = await mkdtemp(path.join(tmpdir(), 'webmcplite-site-'));
  const destination = path.join(temporary, 'site');
  const commit = 'a'.repeat(40);
  try {
    await buildSite(destination, commit);
    const files = (await readdir(destination, { recursive: true, withFileTypes: true }))
      .filter(entry => entry.isFile())
      .map(entry => path.relative(destination, path.join(entry.parentPath, entry.name)))
      .sort();
    assert.ok(files.includes('index.html'));
    assert.ok(files.includes('version.json'));
    assert.ok(files.some(file => /^assets\/.+\.js$/.test(file)));
    assert.ok(files.some(file => /^assets\/.+\.css$/.test(file)));
    assert.ok(files.every(file => ['index.html', 'version.json'].includes(file) || file.startsWith('assets/')));
    assert.ok(files.every(file => !/\.(?:map|md|jsx)$/.test(file)));
    const manualFile = files.find(file => /^assets\/manual-.+\.json$/.test(file));
    assert.ok(manualFile, 'the runtime manual is emitted as a bundled asset');
    JSON.parse(await readFile(path.join(destination, manualFile), 'utf8'));
    const html = await readFile(path.join(destination, 'index.html'), 'utf8');
    assert.ok(html.includes(`<meta name="build-commit" content="${commit}">`));
    assert.doesNotMatch(html, /agentsmd|webmcpLite/);
    assert.deepEqual(JSON.parse(await readFile(path.join(destination, 'version.json'), 'utf8')), { commit });
    const base = new URL('https://example.test/WebMCPLite/');
    const refs = [...html.matchAll(/(?:href|src)="([^"]+\.(?:js|css))"/g)].map(m => m[1]);
    assert.ok(refs.some(ref => ref.endsWith('.js')));
    assert.ok(refs.some(ref => ref.endsWith('.css')));
    for (const ref of refs) {
      const url = new URL(ref, base);
      assert.ok(url.pathname.startsWith(base.pathname));
      await readFile(path.join(destination, url.pathname.slice(base.pathname.length)));
    }
    const runtime = (await Promise.all(files.filter(file => file.endsWith('.js')).map(file => readFile(path.join(destination, file), 'utf8')))).join('\n');
    assert.doesNotMatch(runtime, /window\.webmcpLite/);
    assert.ok(runtime.includes(path.basename(manualFile)), 'the bundled tool references its emitted manual');
    await assert.rejects(buildSite(destination, 'invalid'), TypeError);
    assert.deepEqual(JSON.parse(await readFile(path.join(destination, 'version.json'), 'utf8')), { commit });
  } finally { await rm(temporary, { recursive: true, force: true }); }
});
