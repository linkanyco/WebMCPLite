import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTools, pages } from '../examples/tools.js';
import { createWorkspace, pageAreas } from '../examples/workspace.js';
import { connectTools } from '../src/connect.js';
function fixture(page) {
  const w = createWorkspace();
  let bridge;
  bridge = connectTools(buildTools({ workspace: w, page, navigate: target => ({ ok: true, page: target }), setHighlights: enabled => ({ ok: true, enabled }), getTools: () => bridge.list() }), { modelContext: null });
  return { w, call: bridge.call, bridge };
}
test('page manuals derive exact exposed contracts and current-page areas', async () => {
  for (const p of pages) {
    const { bridge, call } = fixture(p.id);
    const manual = await call('page_manual');
    assert.equal(manual.page.id, p.id);
    assert.deepEqual(manual.areas, pageAreas[p.id]);
    assert.deepEqual(manual.tools, bridge.list());
    assert.equal((await call('site_map')).pages.length, 6);
    bridge.dispose();
    assert.equal((await call('page_manual')).error.code, 'inactive');
  }
});
test('direct JS calls validate runtime inputs, readonly fields and current editing target', async () => {
  const { w, call } = fixture('product');
  const before = w.read('catalog');
  for (const input of [null, [], { extra: true }, { id: 'p1', patch: { styleB: 'other' }, expectedRevision: 0 }, { id: 'p2', patch: { price: 5 }, expectedRevision: 0 }, { id: 'p1', patch: { price: null }, expectedRevision: 0 }]) {
    assert.equal((await call('setProduct', input)).ok, false);
    assert.deepEqual(w.read('catalog'), before);
  }
  assert.equal((await call('setHighlights', { enabled: 'false' })).ok, false);
  assert.equal((await call('save', { form: '__proto__', expectedRevision: 0 })).ok, false);
  assert.equal(w.read('__proto__').ok, false);
  assert.equal((await call('getProduct', { id: 'p2' })).data.styleB, 'B-702');
});
test('guide exposes only its forms and async setter shares the app path', async () => {
  const guide = fixture('guide');
  assert.equal((await guide.call('setNote', { form: 'board', patch: { text: 'x' }, expectedRevision: 0 })).ok, false);
  await guide.call('setNote', { form: 'guideDetails', patch: { text: 'Changed second form' }, expectedRevision: 0 });
  assert.equal((await guide.call('isUnsavedContents', {})).unsaved, true);
  assert.equal((await guide.call('isUnsavedContents', { form: 'guideNote' })).unsaved, false);
  const async = fixture('async');
  await async.call('setProduct', { id: 'p3', patch: { price: 70 }, expectedRevision: 0 });
  assert.equal(async.w.read('asyncProduct').data.price, 70);
  assert.deepEqual(async.w.read('asyncProduct').aiFields, ['price']);
});
