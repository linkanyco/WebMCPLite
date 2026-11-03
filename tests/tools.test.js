import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTools, pages, projectRepositoryUrl } from '../examples/tools.js';
import { createWorkspace, pageAreas, productFileInput } from '../examples/workspace.js';
function fixture(page, { moveToGithub = () => ({ ok: true, navigationRequested: true, url: projectRepositoryUrl }) } = {}) {
  const w = createWorkspace(); let tools;
  const metadata = () => tools.map(({ execute, ...info }) => structuredClone(info));
  tools = buildTools({ workspace: w, page, navigate: target => ({ ok: true, page: target }), moveToGithub, setHighlights: enabled => ({ ok: true, enabled }) });
  return { w, metadata, call: (name, input = {}) => tools.find(t => t.name === name).execute(input) };
}
test('discovered definitions are self-contained; optional map covers six tutorials and supporting routes', async () => {
  for (const p of pages) {
    const { metadata, call } = fixture(p.id);
    const definitions = metadata();
    assert.ok(!definitions.some(tool => ['site_manual', 'page_manual'].includes(tool.name)));
    assert.ok(definitions.every(tool => tool.description && tool.inputSchema));
    const map = await call('site_map'); assert.equal(map.pages.filter(p => p.example).length, 6);
    for (const entry of map.pages) for (const base of ['https://example.test/', 'https://example.test/WebMCPLite/']) {
      const url = new URL(entry.url, base); assert.equal(url.pathname, new URL(base).pathname); assert.equal(url.searchParams.get('page'), entry.id);
    }
    if (!pageAreas[p.id].length) assert.ok(!metadata().some(t => t.name === 'save'));
  }
});
test('project navigation delegates to the shared fixed-destination app action without accepting URLs', async () => {
  assert.equal(pages.filter(page => page.id !== 'new').at(-1).id, 'guide');
  for (const page of pages) {
    let calls = 0;
    const blocked = { ok: false, error: { code: 'unsaved', message: 'Save or discard before leaving.' } };
    const { call, metadata } = fixture(page.id, { moveToGithub: () => { calls++; return blocked; } });
    const tool = metadata().find(tool => tool.name === 'MoveToGithub');
    assert.equal(tool.annotations.readOnlyHint, false);
    for (const input of [null, [], { url: 'https://example.test/' }, { page: 'guide' }]) {
      assert.equal((await call('MoveToGithub', input)).error.code, 'validation');
      assert.equal(calls, 0);
    }
    assert.deepEqual(await call('MoveToGithub'), blocked);
    assert.equal(calls, 1);
  }
  assert.deepEqual(await fixture('guide').call('MoveToGithub'), { ok: true, navigationRequested: true, url: projectRepositoryUrl });
});
test('product translation shares drafts, validates readonly fields and retains other values', async () => {
  const { w, call } = fixture('product'), before = w.read('catalog');
  for (const input of [null, [], { extra: true }, { id: 'p1', patch: { sku: 'other' } }, { id: 'p1', patch: { stock: 2 } }, { id: 'p2', patch: { price: 5 } }, { id: 'p1', patch: { descriptionKo: null } }]) {
    assert.equal((await call('setProduct', input)).ok, false); assert.deepEqual(w.read('catalog'), before);
  }
  assert.equal((await call('setHighlights', { enabled: 'false' })).ok, false);
  assert.equal((await call('save', { form: '__proto__' })).ok, false); assert.equal(w.read('__proto__').ok, false);
  const updated = await call('setProduct', { id: 'p1', patch: { descriptionEn: 'A quiet mechanical keyboard.', descriptionKo: '조용한 기계식 키보드입니다.' } });
  assert.equal(updated.data[0].descriptionKo, '조용한 기계식 키보드입니다.'); assert.equal(updated.data[0].price, before.data[0].price);
  assert.deepEqual(updated.aiFields, ['p1.descriptionEn', 'p1.descriptionKo']);
  assert.equal((await call('save', { form: 'catalog' })).saved, true);
});
test('bulk prefix selection updates eight matching products atomically', async () => {
  const { w, call, metadata } = fixture('bulk'), before = (await call('getProducts')).data;
  assert.deepEqual(metadata().find(tool => tool.name === 'setProducts').inputSchema.examples, [{ updates: [{ id: 'p1', patch: { price: 80.1 } }] }]);
  const updates = before.filter(p => p.sku.startsWith('KEY-1')).map(p => ({ id: p.id, patch: { price: Math.round(p.price * 90) / 100 } }));
  assert.equal(updates.length, 8);
  assert.equal((await call('setProducts', { updates: [...updates, { id: 'p2', patch: { price: -1 } }] })).ok, false);
  assert.deepEqual(w.read('catalog').data, before);
  assert.equal((await call('setProducts', { updates })).ok, true);
  assert.equal(w.read('catalog').data.find(p => p.id === 'p11').price, 99);
  assert.equal(w.read('catalog').data[0].price, 80.1);
});
test('search then follow-up reads current results without changing filters or stock', async () => {
  const { w, call, metadata } = fixture('sheet');
  await call('setSearch', { patch: { skuContains: 'KEY', maxPrice: 20 } });
  const before = w.read('catalog'), result = await call('getProducts');
  assert.equal(result.count, 6); assert.equal(result.data.filter(p => p.stock <= 5).length, 4);
  assert.equal((await call('getProducts')).count, 6); assert.deepEqual(w.read('catalog'), before);
  assert.deepEqual(w.search().filters, { skuContains: 'KEY', maxPrice: 20 });
  assert.ok(metadata().find(t => t.name === 'getProducts').annotations.readOnlyHint);
  assert.ok(!metadata().some(t => t.name === 'setProduct'));
});
test('storefront source edits, preview and save are separate shared actions', async () => {
  const { w, call } = fixture('board'), before = await call('getStorefront');
  const html = '<style>.category h2{position:absolute;top:50%;text-shadow:0 0 4px white}</style><div class="category"><h2>Desk essentials</h2></div>';
  const edit = await call('setStorefront', { patch: { html } }); assert.equal(edit.dirty, true); assert.deepEqual(edit.aiFields, ['html']);
  assert.equal(w.getPreview(), before.data.html);
  assert.equal((await call('previewStorefront')).html, html); assert.equal(w.read('storefront').dirty, true);
  assert.equal((await call('save', { form: 'storefront' })).saved, true);
});
test('new product accepts remembered editable values and rejects source identity or stock', async () => {
  const source = fixture('async'), target = fixture('new'), { id, stock, ...values } = (await source.call('getProduct', { id: 'p1' })).data;
  assert.equal((await target.call('setProduct', { patch: { ...values, id } })).ok, false);
  assert.equal((await target.call('setProduct', { patch: { ...values, stock } })).ok, false);
  assert.equal((await target.call('setProduct', { patch: values })).ok, true);
  assert.equal((await target.call('save', { form: 'newProduct' })).saved, true);
  assert.deepEqual((await target.call('getProduct')).data, { id: 'new-product', ...values });
});

test('new-product discovery includes complete file guidance without a manual read and accepts no file payload', async () => {
  const { w, call, metadata } = fixture('new');
  const definitions = metadata();
  const getter = definitions.find(tool => tool.name === 'getProduct');
  assert.ok(getter.description.includes(JSON.stringify(productFileInput)));
  assert.match(getter.description, /#new-product-files/);
  assert.match(getter.description, /application\/pdf/);
  assert.match(getter.description, /image\/png/);
  assert.match(getter.description, /image\/jpeg/);
  assert.match(getter.description, /does not upload or save/);
  assert.match(getter.description, /ask the user/);
  assert.ok(!definitions.some(tool => ['site_manual', 'page_manual'].includes(tool.name)));
  assert.ok(!fixture('product').metadata().some(tool => tool.description.includes('#new-product-files')));
  assert.ok(!metadata().some(tool => /file/i.test(tool.name)), 'file selection has no registered setter or upload tool');
  w.selectProductFiles([new File(['private fictional bytes'], 'notes.pdf', { type: 'application/pdf', lastModified: 1 })]);
  const before = await call('getProduct');
  for (const patch of [{ files: ['base64'] }, { file: 'local/path.pdf' }, { base64: 'data:application/pdf;base64,AA==' }]) {
    assert.equal((await call('setProduct', { patch })).ok, false);
    assert.deepEqual(await call('getProduct'), before);
  }
  await call('setProduct', { patch: { name: 'Product with references', sku: 'REF-1', productCode: 'REF-1001' } });
  const read = await call('getProduct');
  assert.deepEqual(read.files, [{ name: 'notes.pdf', size: 23, type: 'application/pdf', lastModified: 1 }]);
  assert.deepEqual(JSON.parse(JSON.stringify(read)), read);
  assert.ok(!JSON.stringify(read).includes('private fictional bytes'));
  assert.equal((await call('isUnsavedContents')).unsaved, true);
  const saved = await call('save', { form: 'newProduct' });
  assert.equal(saved.saved, true); assert.deepEqual(saved.files, read.files);
  w.selectProductFiles([]);
  assert.deepEqual((await call('cancel', { form: 'newProduct' })).files, read.files);
});
