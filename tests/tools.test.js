import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTools, pages } from '../examples/tools.js';
import { createWorkspace, pageAreas } from '../examples/workspace.js';
function fixture(page) {
  const w = createWorkspace(); let tools;
  const metadata = () => tools.map(({ execute, ...info }) => structuredClone(info));
  tools = buildTools({ workspace: w, page, navigate: target => ({ ok: true, page: target }), setHighlights: enabled => ({ ok: true, enabled }), getTools: metadata });
  return { w, metadata, call: (name, input = {}) => tools.find(t => t.name === name).execute(input) };
}
test('page manuals derive exact contracts; map covers six tutorials and supporting routes', async () => {
  for (const p of pages) {
    const { metadata, call } = fixture(p.id), manual = await call('page_manual');
    assert.equal(manual.page.id, p.id); assert.deepEqual(manual.areas, pageAreas[p.id]); assert.deepEqual(manual.tools, metadata());
    const map = await call('site_map'); assert.equal(map.pages.filter(p => p.example).length, 6);
    for (const entry of map.pages) for (const base of ['https://example.test/', 'https://example.test/WebMCPLite/']) {
      const url = new URL(entry.url, base); assert.equal(url.pathname, new URL(base).pathname); assert.equal(url.searchParams.get('page'), entry.id);
    }
    if (!pageAreas[p.id].length) assert.ok(!metadata().some(t => t.name === 'save'));
  }
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
  const { w, call } = fixture('bulk'), before = (await call('getProducts')).data;
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
