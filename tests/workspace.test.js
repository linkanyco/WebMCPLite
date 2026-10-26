import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorkspace } from '../examples/workspace.js';

test('UI and AI share product draft; copies cannot mutate state; human takes over a field', () => {
  const w = createWorkspace();
  const initial = w.read('catalog'); initial.data[0].name = 'External';
  assert.equal(w.read('catalog').data[0].name, 'Mechanical keyboard');
  const ai = w.setProducts([{ id: 'p1', patch: { name: 'AI title', price: 50 } }], 'ai');
  assert.deepEqual(ai.aiFields, ['p1.name', 'p1.price']);
  const human = w.setProducts([{ id: 'p1', patch: { name: 'Human title' } }], 'human');
  assert.equal(human.data[0].price, 50);
  assert.deepEqual(human.aiFields, ['p1.price']);
  assert.deepEqual(Object.keys(human).sort(), ['aiFields', 'data', 'dirty', 'ok', 'saving']);
  const next = w.setProducts([{ id: 'p1', patch: { description: 'A compact workspace keyboard.' } }], 'ai');
  assert.equal(next.data[0].name, 'Human title');
  assert.equal(next.data[0].price, 50);
});

test('bulk update is atomic for invalid values, fields, duplicates and unknown IDs', () => {
  const w = createWorkspace(), before = w.read('catalog');
  for (const bad of [
    [{ id: 'p1', patch: { name: 'Changed' } }, { id: 'p2', patch: { price: -1 } }],
    [{ id: 'p1', patch: { id: 'p4' } }], [{ id: 'p1', patch: { description: null } }],
    [{ id: 'p1', patch: { sku: 'OTHER-001' } }], [{ id: 'p1', patch: { productCode: 'OTHER-1001' } }],
    [{ id: 'p1', patch: { name: 'A' } }, { id: 'p1', patch: { price: 2 } }],
    [{ id: 'unknown', patch: { name: 'A' } }], [null], [],
  ]) {
    assert.equal(w.setProducts(bad).ok, false);
    assert.deepEqual(w.read('catalog'), before);
  }
});

test('product list supports product codes, validated array replacement and cancel', () => {
  const w = createWorkspace();
  assert.equal(w.read('catalog').data[0].productCode, 'PRD-1001');
  const result = w.set('sheet', { codeType: 'productCode', rows: [{ productId: 'p2', quantity: 9 }] }, 'ai');
  assert.equal(result.data.title, 'Workspace essentials');
  assert.deepEqual(result.data.rows, [{ productId: 'p2', quantity: 9 }]);
  for (const invalid of [
    { rows: [{ productId: 'p1', quantity: 0 }] },
    { rows: [{ productId: 'p1', quantity: 1 }, { productId: 'p1', quantity: 2 }] },
    { codeType: 'unknown' },
  ]) {
    assert.equal(w.set('sheet', invalid).ok, false);
    assert.deepEqual(w.read('sheet'), result);
  }
  const cancelled = w.cancel('sheet');
  assert.equal(cancelled.data.codeType, 'sku'); assert.equal(cancelled.dirty, false);
  assert.deepEqual(cancelled.aiFields, []);
});

test('unsaved(null) covers both current-page forms and rejects unrelated areas', () => {
  const w = createWorkspace(); w.set('guideDetails', { text: 'AI second area' }, 'ai');
  assert.equal(w.unsaved('guide').unsaved, true);
  assert.equal(w.unsaved('guide', 'guideNote').unsaved, false);
  assert.equal(w.unsaved('guide', 'guideDetails').unsaved, true);
  assert.equal(w.unsaved('product').unsaved, false);
  assert.equal(w.unsaved('guide', 'catalog').error.code, 'not_found');
});

test('async failure preserves draft/markers and blocks edits, cancel and duplicate save', async () => {
  const w = createWorkspace(); w.set('asyncProduct', { price: 99 }, 'ai');
  const before = w.read('asyncProduct');
  const pending = w.save('asyncProduct', { latency: 10, shouldFail: true });
  assert.equal(w.read('asyncProduct').saving, true);
  assert.equal(w.set('asyncProduct', { price: 10 }).error.code, 'busy');
  assert.equal(w.cancel('asyncProduct').error.code, 'busy');
  assert.equal((await w.save('asyncProduct')).error.code, 'busy');
  assert.equal((await pending).error.code, 'save_failed');
  assert.deepEqual(w.read('asyncProduct'), before);
  const saved = await w.save('asyncProduct');
  assert.equal(saved.saved, true); assert.equal(saved.dirty, false); assert.equal(saved.saving, false);
  assert.equal(saved.storage, 'tab-memory'); assert.deepEqual(saved.aiFields, []);
  w.set('asyncProduct', { price: 80 });
  assert.equal(w.cancel('asyncProduct').data.price, 99);
});

test('abort cannot commit a save and keeps the draft available for retry', async () => {
  const w = createWorkspace(), controller = new AbortController();
  w.set('board', { title: 'Unsaved title' }, 'ai');
  const pending = w.save('board', { latency: 100, signal: controller.signal });
  controller.abort();
  assert.equal((await pending).error.code, 'aborted');
  assert.equal(w.read('board').saving, false); assert.equal(w.read('board').dirty, true);
  assert.equal(w.cancel('board').data.title, 'Project board');
});
