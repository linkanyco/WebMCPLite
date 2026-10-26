import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTools, pages } from '../examples/tools.js';
import { createWorkspace, pageAreas } from '../examples/workspace.js';
function fixture(page) {
  const w = createWorkspace();
  let tools;
  const metadata = () => tools.map(({ execute, ...info }) => structuredClone(info));
  tools = buildTools({ workspace: w, page, navigate: target => ({ ok: true, page: target }), setHighlights: enabled => ({ ok: true, enabled }), getTools: metadata });
  // Test-only access to app definitions, not a public browser discovery protocol.
  return { w, metadata, call: (name, input = {}) => tools.find(t => t.name === name).execute(input) };
}
test('page manuals derive exact exposed contracts and current-page areas', async () => {
  for (const p of pages) {
    const { metadata, call } = fixture(p.id);
    const manual = await call('page_manual');
    assert.equal(manual.page.id, p.id);
    assert.deepEqual(manual.areas, pageAreas[p.id]);
    assert.deepEqual(manual.tools, metadata());
    const map = await call('site_map');
    assert.equal(map.pages.length, 6);
    for (const entry of map.pages) {
      for (const base of ['https://example.test/', 'https://example.test/WebMCPLite/']) {
        const url = new URL(entry.url, base);
        assert.equal(url.pathname, new URL(base).pathname);
        assert.equal(url.searchParams.get('page'), entry.id);
      }
    }
  }
});
test('shared app actions validate runtime inputs, readonly fields and current editing target', async () => {
  const { w, call } = fixture('product');
  const before = w.read('catalog');
  for (const input of [null, [], { extra: true }, { id: 'p1', patch: { productCode: 'other' } }, { id: 'p1', patch: { sku: 'other' } }, { id: 'p2', patch: { price: 5 } }, { id: 'p1', patch: { price: null } }]) {
    assert.equal((await call('setProduct', input)).ok, false);
    assert.deepEqual(w.read('catalog'), before);
  }
  assert.equal((await call('setHighlights', { enabled: 'false' })).ok, false);
  assert.equal((await call('save', { form: '__proto__' })).ok, false);
  assert.equal(w.read('__proto__').ok, false);
  const related = await call('getProduct', { id: 'p2' });
  assert.equal(related.data.sku, 'HUB-002');
  assert.equal(related.data.productCode, 'PRD-1002');
  const updated = await call('setProduct', { id: 'p1', patch: { description: 'An updated product description.' } });
  assert.equal(updated.data[0].description, 'An updated product description.');
  assert.equal(updated.data[0].price, before.data[0].price);
  assert.equal((await call('save', { form: 'catalog' })).saved, true);
});
test('guide exposes only its forms and async setter shares the app path', async () => {
  const guide = fixture('guide');
  assert.equal((await guide.call('setNote', { form: 'board', patch: { text: 'x' } })).ok, false);
  await guide.call('setNote', { form: 'guideDetails', patch: { text: 'Changed second form' } });
  assert.equal((await guide.call('isUnsavedContents', {})).unsaved, true);
  assert.equal((await guide.call('isUnsavedContents', { form: 'guideNote' })).unsaved, false);
  const async = fixture('async');
  await async.call('setProduct', { id: 'p3', patch: { price: 70 } });
  assert.equal(async.w.read('asyncProduct').data.price, 70);
  assert.deepEqual(async.w.read('asyncProduct').aiFields, ['price']);
});
test('product list can retrieve related product identifiers before changing its preview', async () => {
  const { call } = fixture('sheet');
  const list = await call('getSheet');
  assert.equal(list.data.codeType, 'sku');
  for (const row of list.data.rows) {
    const product = await call('getProduct', { id: row.productId });
    assert.match(product.data.productCode, /^PRD-/);
  }
  const changed = await call('setSheet', { patch: { codeType: 'productCode' } });
  assert.equal(changed.data.codeType, 'productCode');
  assert.deepEqual(changed.data.rows, list.data.rows);
  assert.deepEqual(changed.aiFields, ['codeType']);
  const cancelled = await call('cancel', { form: 'sheet' });
  assert.equal(cancelled.data.codeType, 'sku');
  assert.equal(cancelled.dirty, false);
});
