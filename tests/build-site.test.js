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
    assert.ok(files.every(file => ['index.html', 'version.json', 'third-party-notices.txt'].includes(file) || file.startsWith('assets/')));
    assert.ok(files.every(file => !/\.(?:map|md|jsx)$/.test(file)));
    assert.ok(!files.some(file => /^assets\/manual-.+\.json$/.test(file)), 'discovery guidance does not need a fetched manual asset');
    const licenseFile = files.find(file => /^assets\/LICENSE-.+\.txt$/.test(file));
    assert.ok(licenseFile, 'the distributed site includes the full project license');
    assert.equal(await readFile(path.join(destination, licenseFile), 'utf8'),
      await readFile(new URL('../LICENSE.txt', import.meta.url), 'utf8'));
    const notices = await readFile(path.join(destination, 'third-party-notices.txt'), 'utf8');
    for (const name of ['react', 'react-dom', 'antd', '@lobehub/ui', 'lucide-react']) {
      const packageRoot = new URL(`../node_modules/${name}/`, import.meta.url);
      assert.ok(notices.includes(`${name}@`), `${name} is included in upstream notices`);
      const noticeFile = (await readdir(packageRoot)).find(file => /^licen[cs]e(?:\.|$)/i.test(file));
      assert.ok(notices.includes(await readFile(new URL(noticeFile, packageRoot), 'utf8')),
        `${name}'s full original license is preserved`);
    }
    assert.ok(notices.includes('@ant-design/icons-svg@4.6.0'));
    assert.ok(notices.includes(await readFile(new URL('../node_modules/@ant-design/icons/LICENSE', import.meta.url), 'utf8')));
    assert.ok(notices.includes('is-mobile@5.0.0'));
    const mobileLicense = (await readFile(new URL('../node_modules/is-mobile/README.md', import.meta.url), 'utf8')).split('\n## License\n')[1];
    assert.ok(mobileLicense && notices.includes(mobileLicense));
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
    assert.doesNotMatch(runtime, /page_manual|site_manual/, 'the runtime does not require separate manual tools');
    assert.ok(runtime.includes(path.basename(licenseFile)), 'the site links to its emitted license notice');
    assert.ok(runtime.includes('third-party-notices.txt'), 'the site links to bundled upstream notices');
    await assert.rejects(buildSite(destination, 'invalid'), TypeError);
    assert.deepEqual(JSON.parse(await readFile(path.join(destination, 'version.json'), 'utf8')), { commit });
  } finally { await rm(temporary, { recursive: true, force: true }); }
});
