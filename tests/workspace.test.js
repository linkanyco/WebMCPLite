import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorkspace, productFileInput } from '../examples/workspace.js';

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
  const next = w.setProducts([{ id: 'p1', patch: { descriptionEn: 'A compact workspace keyboard.' } }], 'ai');
  assert.equal(next.data[0].name, 'Human title');
  assert.equal(next.data[0].price, 50);
});

test('bulk update is atomic for invalid values, fields, duplicates and unknown IDs', () => {
  const w = createWorkspace(), before = w.read('catalog');
  for (const bad of [
    [{ id: 'p1', patch: { name: 'Changed' } }, { id: 'p2', patch: { price: -1 } }],
    [{ id: 'p1', patch: { id: 'p4' } }], [{ id: 'p1', patch: { descriptionEn: null } }],
    [{ id: 'p1', patch: { sku: 'OTHER-001' } }], [{ id: 'p1', patch: { productCode: 'OTHER-1001' } }],
    [{ id: 'p1', patch: { name: 'A' } }, { id: 'p1', patch: { price: 2 } }],
    [{ id: 'unknown', patch: { name: 'A' } }], [null], [],
  ]) {
    assert.equal(w.setProducts(bad).ok, false);
    assert.deepEqual(w.read('catalog'), before);
  }
});

test('search scopes read-only stock to current results and leaves product drafts unchanged', () => {
  const w = createWorkspace(), before = w.read('catalog');
  const result = w.setSearch({ skuContains: 'key', maxPrice: 20 });
  assert.equal(result.count, 6);
  assert.deepEqual(result.data.filter(p => p.stock <= 5).map(p => p.id), ['p4', 'p6', 'p7', 'p9']);
  assert.ok(!result.data.some(p => p.id === 'p11')); // Low stock outside the current price filter.
  assert.deepEqual(w.read('catalog'), before);
  result.data[0].stock = 1000;
  assert.equal(w.search().data[0].stock, 3);
  assert.equal(w.setSearch({ maxPrice: -1 }).ok, false);
  assert.deepEqual(w.search().filters, { skuContains: 'key', maxPrice: 20 });
  assert.equal(w.unsaved('sheet').unsaved, false);
});

test('new-product reuse keeps source and target tabs independent; no SKU uniqueness restriction', async () => {
  const source = createWorkspace(), target = createWorkspace();
  source.setProducts([{ id: 'p1', patch: { descriptionKo: '기계식 키보드' } }], 'ai');
  const { id, stock, ...values } = source.getProduct('p1').data;
  assert.equal(target.set('newProduct', values, 'ai').ok, true);
  assert.equal(target.unsaved('new').unsaved, true);
  assert.equal(target.unsaved('new', 'catalog').ok, false);
  assert.equal((await target.save('newProduct')).saved, true);
  assert.equal(target.read('newProduct').data.sku, 'KEY-101');
  assert.equal(target.read('newProduct').data.id, 'new-product');
  assert.equal(target.read('catalog').data[0].descriptionKo, '');
  assert.equal(source.read('newProduct').data.name, '');
  assert.equal(target.set('newProduct', { stock: 1 }).ok, false);
  assert.equal((await createWorkspace().save('newProduct')).ok, false);
});

test('native file selection replaces the shared draft, validates atomically and returns summaries only', () => {
  const w = createWorkspace();
  w.set('newProduct', { sku: 'REF-01', descriptionEn: 'Reference notes' }, 'ai');
  const pdf = new File(['fictional PDF'], 'reference.PDF', { type: 'application/pdf', lastModified: 1 });
  const png = new File(['fictional PNG'], 'diagram.png', { type: 'image/png', lastModified: 2 });
  const selected = w.selectProductFiles([pdf, png]);
  assert.equal(w.unsaved('new').unsaved, true);
  assert.deepEqual(selected.files, [{ name: 'reference.PDF', size: pdf.size, type: pdf.type, lastModified: 1 }, { name: 'diagram.png', size: png.size, type: png.type, lastModified: 2 }]);
  selected.files[0].name = 'mutated';
  const before = w.read('newProduct');
  for (const invalid of [null, {}, ['base64'], [{ name: 'fake.pdf', size: 1 }], [pdf, png, pdf, png], [pdf, new File(['text'], 'notes.txt')], [new File(['wrong MIME'], 'image.png', { type: 'application/pdf' })], [new File([new Uint8Array(productFileInput.maxBytesPerFile + 1)], 'large.pdf', { type: 'application/pdf' })]]) {
    assert.equal(w.selectProductFiles(invalid).ok, false);
    assert.deepEqual(w.read('newProduct'), before);
  }
  const replacement = w.selectProductFiles([png]);
  assert.equal(replacement.files.length, 1); assert.equal(replacement.files[0].name, 'diagram.png');
  assert.equal(replacement.data.sku, 'REF-01'); assert.equal(replacement.data.descriptionEn, 'Reference notes');
  assert.deepEqual(replacement.aiFields, ['sku', 'descriptionEn']);
  assert.equal(w.set('newProduct', { files: [] }, 'ai').ok, false);
  assert.deepEqual(JSON.parse(JSON.stringify(replacement)), replacement);
  assert.deepEqual(w.selectProductFiles([]).files, []);
  assert.equal(w.read('catalog').dirty, false);
});

test('saved file identity detects different bytes with the same metadata and cancel restores actual baseline', async () => {
  const w = createWorkspace();
  w.set('newProduct', { name: 'Reference product', sku: 'REF-01', productCode: 'REF-1001' });
  const original = new File(['one'], 'same.pdf', { type: 'application/pdf', lastModified: 1 });
  const replacement = new File(['two'], 'same.pdf', { type: 'application/pdf', lastModified: 1 });
  w.selectProductFiles([original]);
  const saved = await w.save('newProduct');
  assert.equal(saved.saved, true); assert.equal(saved.dirty, false); assert.equal(saved.storage, 'tab-memory');
  const changed = w.selectProductFiles([replacement]);
  assert.deepEqual(changed.files, saved.files); assert.equal(changed.dirty, true);
  w.cancel('newProduct');
  assert.equal(w.selectProductFiles([original]).dirty, false, 'cancel restores the original File, not only its summary');
  w.selectProductFiles([]); assert.equal(w.unsaved('new').unsaved, true);
  assert.deepEqual(w.cancel('newProduct').files, saved.files);
  assert.deepEqual(createWorkspace().read('newProduct').files, [], 'another workspace/reload has no files');
});

test('file selection obeys save busy state and failure retains the draft without changing the baseline', async () => {
  const w = createWorkspace();
  const first = new File(['first'], 'first.jpg', { type: 'image/jpeg' });
  w.selectProductFiles([first]);
  assert.equal((await w.save('newProduct')).error.code, 'validation');
  assert.equal(w.read('newProduct').files[0].name, 'first.jpg');
  w.set('newProduct', { name: 'Reference product', sku: 'REF-01', productCode: 'REF-1001' });
  await w.save('newProduct');
  const next = new File(['second'], 'second.pdf', { type: 'application/pdf' });
  w.selectProductFiles([next]);
  const pending = w.save('newProduct', { latency: 10, shouldFail: true });
  assert.equal(w.selectProductFiles([]).error.code, 'busy');
  assert.equal(w.cancel('newProduct').error.code, 'busy');
  assert.equal(w.unsaved('new').busy, true);
  assert.equal((await pending).error.code, 'save_failed');
  assert.equal(w.read('newProduct').files[0].name, 'second.pdf');
  assert.equal(w.read('newProduct').dirty, true);
  assert.equal(w.cancel('newProduct').files[0].name, 'first.jpg');
});

test('async failure preserves draft/markers and blocks edits, cancel and duplicate save', async () => {
  const w = createWorkspace(); w.setProducts([{ id: 'p1', patch: { price: 99 } }], 'ai');
  const before = w.read('catalog');
  const pending = w.save('catalog', { latency: 10, shouldFail: true });
  assert.equal(w.read('catalog').saving, true);
  assert.equal(w.setProducts([{ id: 'p1', patch: { price: 10 } }]).error.code, 'busy');
  assert.equal(w.cancel('catalog').error.code, 'busy');
  assert.equal((await w.save('catalog')).error.code, 'busy');
  assert.equal((await pending).error.code, 'save_failed');
  assert.deepEqual(w.read('catalog'), before);
  const saved = await w.save('catalog');
  assert.equal(saved.saved, true); assert.equal(saved.dirty, false); assert.equal(saved.saving, false);
  assert.equal(saved.storage, 'tab-memory'); assert.deepEqual(saved.aiFields, []);
  w.setProducts([{ id: 'p1', patch: { price: 80 } }]);
  assert.equal(w.cancel('catalog').data[0].price, 99);
});

test('abort cannot commit a save and keeps the draft available for retry', async () => {
  const w = createWorkspace(), controller = new AbortController();
  w.set('storefront', { html: '<div>Unsaved banner</div>' }, 'ai');
  const pending = w.save('storefront', { latency: 100, signal: controller.signal });
  controller.abort();
  assert.equal((await pending).error.code, 'aborted');
  assert.equal(w.read('storefront').saving, false); assert.equal(w.read('storefront').dirty, true);
  assert.equal(w.cancel('storefront').data.html.includes('categories'), true);
});
