// Demo application state, deliberately outside the reusable WebMCP adapter.
export const products = [
  { id: 'p1', styleA: 'A-101', styleB: 'B-701', name: 'Harbor shirt', price: 42, material: 'Cotton' },
  { id: 'p2', styleA: 'A-102', styleB: 'B-702', name: 'Meadow jacket', price: 86, material: 'Linen blend' },
  { id: 'p3', styleA: 'A-103', styleB: 'B-703', name: 'Ridge trousers', price: 64, material: 'Twill' },
];
const clone = value => structuredClone(value);
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
export const fail = (code, message) => ({ ok: false, error: { code, message } });
export function keys(value, allowed, required = []) {
  return value !== null && typeof value === 'object' && !Array.isArray(value) &&
    Object.keys(value).every(key => allowed.includes(key)) && required.every(key => Object.hasOwn(value, key));
}
const text = (value, max = 80) => typeof value === 'string' && value.trim().length > 0 && value.length <= max;
const validProduct = p => keys(p, ['id', 'styleA', 'styleB', 'name', 'price', 'material'], ['id', 'styleA', 'styleB', 'name', 'price', 'material']) && text(p.name) && text(p.material) && Number.isFinite(p.price) && p.price >= 0 && p.price <= 100000;
export const pageAreas = {
  product: ['catalog'], bulk: ['catalog'], sheet: ['sheet'], board: ['board'],
  guide: ['guideNote', 'guideDetails'], async: ['asyncProduct'],
};
const seeds = {
  catalog: products,
  sheet: { title: 'Spring edit', numberType: 'A', rows: [{ productId: 'p1', quantity: 2 }, { productId: 'p2', quantity: 3 }] },
  board: { title: 'Studio board', note: 'Plan the next collection together.' },
  guideNote: { text: 'Front desk note' }, guideDetails: { text: 'Delivery instructions' },
  asyncProduct: products[2],
};
function valid(id, value) {
  if (id === 'catalog') return Array.isArray(value) && value.length === products.length && value.every((p, i) => validProduct(p) && p.id === products[i].id && p.styleA === products[i].styleA && p.styleB === products[i].styleB);
  if (id === 'asyncProduct') return validProduct(value) && value.id === 'p3' && value.styleA === 'A-103' && value.styleB === 'B-703';
  if (id === 'board') return keys(value, ['title', 'note'], ['title', 'note']) && text(value.title) && text(value.note, 500);
  if (id.startsWith('guide')) return keys(value, ['text'], ['text']) && text(value.text, 500);
  return keys(value, ['title', 'numberType', 'rows'], ['title', 'numberType', 'rows']) && text(value.title) && ['A', 'B'].includes(value.numberType) &&
    Array.isArray(value.rows) && value.rows.length > 0 && value.rows.length <= 3 && new Set(value.rows.map(r => r?.productId)).size === value.rows.length &&
    value.rows.every(r => keys(r, ['productId', 'quantity'], ['productId', 'quantity']) && products.some(p => p.id === r.productId) && Number.isInteger(r.quantity) && r.quantity > 0 && r.quantity <= 999);
}
const editable = { sheet: ['title', 'numberType', 'rows'], board: ['title', 'note'], guideNote: ['text'], guideDetails: ['text'], asyncProduct: ['name', 'price', 'material'] };
const productFields = ['name', 'price', 'material'];
const delay = (ms, signal) => new Promise((resolve, reject) => {
  if (signal?.aborted) { reject(Error('aborted')); return; }
  const abort = () => { clearTimeout(timer); reject(Error('aborted')); };
  const timer = setTimeout(() => { signal?.removeEventListener('abort', abort); resolve(); }, ms);
  signal?.addEventListener('abort', abort, { once: true });
});

export function createWorkspace({ onChange = () => {} } = {}) {
  const areas = Object.fromEntries(Object.entries(seeds).map(([id, value]) => [id, { draft: clone(value), saved: clone(value), revision: 0, aiFields: [], saving: false }]));
  function read(id) {
    const a = Object.hasOwn(areas, id) ? areas[id] : null;
    return a ? { ok: true, data: clone(a.draft), revision: a.revision, dirty: !equal(a.draft, a.saved), saving: a.saving, aiFields: [...a.aiFields] } : fail('not_found', 'Unknown editing area.');
  }
  function guard(id, expectedRevision) {
    const a = Object.hasOwn(areas, id) ? areas[id] : null;
    if (!a) return fail('not_found', 'Unknown editing area.');
    if (a.saving) return fail('busy', 'Save is in progress. Wait for its result.');
    if (!Number.isInteger(expectedRevision) || expectedRevision !== a.revision) return fail('conflict', 'Read the current draft and revision before editing.');
    return null;
  }
  function commit(id, next, changed, source) {
    const a = areas[id];
    if (!changed.length) return read(id);
    const marks = new Set(a.aiFields);
    for (const field of changed) source === 'ai' ? marks.add(field) : marks.delete(field);
    a.draft = clone(next); a.aiFields = [...marks]; a.revision++;
    onChange(); return read(id);
  }
  function set(id, patch, revision, source = 'human') {
    const error = guard(id, revision); if (error) return error;
    if (!keys(patch, editable[id] ?? []) || !Object.keys(patch).length) return fail('validation', 'Provide only documented editable fields.');
    const next = { ...areas[id].draft, ...clone(patch) };
    if (!valid(id, next)) return fail('validation', 'Invalid value. Check the field types and limits in the tool schema.');
    return commit(id, next, Object.keys(patch).filter(k => !equal(next[k], areas[id].draft[k])), source);
  }
  function setProducts(updates, revision, source = 'human') {
    const error = guard('catalog', revision); if (error) return error;
    if (!Array.isArray(updates) || !updates.length || updates.length > products.length || new Set(updates.map(u => u?.id)).size !== updates.length) return fail('validation', 'Provide 1–3 unique product updates.');
    const next = clone(areas.catalog.draft), changed = [];
    for (const update of updates) {
      if (!keys(update, ['id', 'patch'], ['id', 'patch']) || !keys(update.patch, productFields) || !Object.keys(update.patch).length) return fail('validation', 'Use id and a nonempty editable product patch.');
      const index = next.findIndex(p => p.id === update.id);
      if (index < 0) return fail('not_found', 'Unknown product.');
      const candidate = { ...next[index], ...clone(update.patch) };
      if (!validProduct(candidate)) return fail('validation', 'Invalid product value.');
      for (const key of Object.keys(update.patch)) if (!equal(candidate[key], next[index][key])) changed.push(`${update.id}.${key}`);
      next[index] = candidate;
    }
    return commit('catalog', next, changed, source);
  }
  function cancel(id, revision) {
    const error = guard(id, revision); if (error) return error;
    const a = areas[id]; a.draft = clone(a.saved); a.aiFields = []; a.revision++;
    onChange(); return read(id);
  }
  async function save(id, revision, { latency = 0, shouldFail = false, signal } = {}) {
    const error = guard(id, revision); if (error) return error;
    const a = areas[id]; a.saving = true; onChange();
    try {
      await delay(latency, signal);
      if (signal?.aborted) return fail('aborted', 'Save cancelled; draft retained.');
      if (shouldFail) return fail('save_failed', 'Demo save failed. Your draft is retained; retry when ready.');
      a.saved = clone(a.draft); a.aiFields = []; a.revision++;
      return { ...read(id), saving: false, saved: true, storage: 'tab-memory' };
    } catch {
      return fail('aborted', 'Save cancelled; draft retained.');
    } finally { a.saving = false; onChange(); }
  }
  function unsaved(page, form = null) {
    const ids = pageAreas[page];
    if (!ids || (form !== null && !ids.includes(form))) return fail('not_found', 'Unknown area on the current page.');
    const states = (form === null ? ids : [form]).map(id => ({ id, dirty: read(id).dirty, saving: read(id).saving }));
    return { ok: true, unsaved: states.some(a => a.dirty), busy: states.some(a => a.saving), areas: states };
  }
  return { read, set, setProducts, save, cancel, unsaved };
}
