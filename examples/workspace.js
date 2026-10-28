// Fictional application state. The reusable connector does not depend on this module.
const roughDescription = 'This keybord is sooo awsome!! Get ur work done super fast, quiet swiches and a realy nice feel. Best stuff for ur desk, dont miss it!!!';
export const products = [
  { id: 'p1', sku: 'KEY-101', name: 'Mechanical keyboard', price: 89 },
  { id: 'p2', sku: 'HUB-002', name: 'Desktop hub', price: 49 },
  { id: 'p3', sku: 'LGT-003', name: 'Task light', price: 64 },
  { id: 'p4', sku: 'KEY-102', name: 'Keycap puller', price: 8 },
  { id: 'p5', sku: 'KEY-103', name: 'Keyboard brush', price: 12 },
  { id: 'p6', sku: 'KEY-104', name: 'Wrist rest', price: 19 },
  { id: 'p7', sku: 'KEY-105', name: 'Coiled USB cable', price: 15 },
  { id: 'p8', sku: 'KEY-106', name: 'Keycap set', price: 32 },
  { id: 'p9', sku: 'KEY-107', name: 'Switch sampler', price: 18 },
  { id: 'p10', sku: 'KEY-108', name: 'Keyboard sleeve', price: 20 },
  { id: 'p11', sku: 'KEY-201', name: 'Wireless keyboard', price: 99 },
  { id: 'p12', sku: 'MAT-001', name: 'Desk mat', price: 14 },
].map((p, i) => ({ ...p, productCode: 'PRD-' + (1001 + i), descriptionEn: i === 0 ? roughDescription : 'A practical ' + p.name.toLowerCase() + ' for your everyday workspace.', descriptionKo: '' }));
// Authorized read-only context; deliberately absent from the product list UI.
const stock = Object.fromEntries(products.map((p, i) => [p.id, [24, 18, 9, 3, 12, 5, 0, 16, 4, 8, 2, 30][i]]));
export const initialStorefront = `<style>
  * { box-sizing: border-box; }
  body { margin: 0; padding: 24px; font: 16px system-ui, sans-serif; color: #202027; background: #fff; }
  .categories { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
  .category { position: relative; }
  .category h2 { margin: 0 0 12px; font-size: 20px; }
  .category img { display: block; width: 100%; height: 220px; object-fit: cover; border-radius: 12px; }
  @media (max-width: 480px) { .categories { grid-template-columns: 1fr; } }
</style>
<div class="categories">
  <div class="category"><h2>Desk essentials</h2><img alt="Workspace with a computer" src="https://images.unsplash.com/photo-1498049794561-7780e7231661?w=640&auto=format&fit=crop&q=80"></div>
  <div class="category"><h2>Everyday tech</h2><img alt="Laptop on a desk" src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=640&auto=format&fit=crop&q=80"></div>
  <div class="category"><h2>Work together</h2><img alt="Shared workspace" src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=640&auto=format&fit=crop&q=80"></div>
</div>`;
export const pageAreas = { home: [], product: ['catalog'], bulk: ['catalog'], sheet: [], board: ['storefront'], guide: [], async: ['catalog'], new: ['newProduct'] };
const clone = value => structuredClone(value);
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
export const fail = (code, message) => ({ ok: false, error: { code, message } });
export function keys(value, allowed, required = []) {
  return value !== null && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).every(key => allowed.includes(key)) && required.every(key => Object.hasOwn(value, key));
}
const text = (value, max, empty = false) => typeof value === 'string' && (empty || value.trim().length > 0) && value.length <= max;
const productFields = ['name', 'price', 'descriptionEn', 'descriptionKo'];
const newFields = ['sku', 'productCode', ...productFields];
const validProduct = p => keys(p, ['id', ...newFields], ['id', ...newFields]) && text(p.id, 80) && text(p.sku, 80) && text(p.productCode, 80) && text(p.name, 80) && text(p.descriptionEn, 4000, true) && text(p.descriptionKo, 4000, true) && Number.isFinite(p.price) && p.price >= 0 && p.price <= 100000;
const blankProduct = { id: 'new-product', sku: '', productCode: '', name: '', price: 0, descriptionEn: '', descriptionKo: '' };
const seeds = { catalog: products, storefront: { html: initialStorefront }, newProduct: blankProduct };
const delay = (ms, signal) => new Promise((resolve, reject) => {
  if (signal?.aborted) { reject(Error('aborted')); return; }
  const abort = () => { clearTimeout(timer); reject(Error('aborted')); };
  const timer = setTimeout(() => { signal?.removeEventListener('abort', abort); resolve(); }, ms);
  signal?.addEventListener('abort', abort, { once: true });
});

export function createWorkspace({ onChange = () => {} } = {}) {
  const areas = Object.fromEntries(Object.entries(seeds).map(([id, value]) => [id, { draft: clone(value), saved: clone(value), aiFields: [], saving: false }]));
  let filters = { skuContains: '', maxPrice: null }, previewHtml = initialStorefront;
  function read(id) {
    const a = Object.hasOwn(areas, id) ? areas[id] : null;
    return a ? { ok: true, data: clone(a.draft), dirty: !equal(a.draft, a.saved), saving: a.saving, aiFields: [...a.aiFields] } : fail('not_found', 'Unknown editing area.');
  }
  function guard(id) {
    if (!Object.hasOwn(areas, id)) return fail('not_found', 'Unknown editing area.');
    return areas[id].saving ? fail('busy', 'Save is in progress. Wait for its result.') : null;
  }
  function commit(id, next, changed, source) {
    const a = areas[id];
    if (!changed.length) return read(id);
    const marks = new Set(a.aiFields);
    for (const field of changed) source === 'ai' ? marks.add(field) : marks.delete(field);
    a.draft = clone(next); a.aiFields = [...marks]; onChange(); return read(id);
  }
  function set(id, patch, source = 'human') {
    const error = guard(id); if (error) return error;
    const allowed = id === 'storefront' ? ['html'] : id === 'newProduct' ? newFields : [];
    if (!keys(patch, allowed) || !Object.keys(patch).length) return fail('validation', 'Provide only documented editable fields.');
    const next = { ...areas[id].draft, ...clone(patch) };
    const valid = id === 'storefront' ? text(next.html, 20000) : newFields.every(field => field === 'price' ? Number.isFinite(next[field]) && next[field] >= 0 && next[field] <= 100000 : text(next[field], field.startsWith('description') ? 4000 : 80, true));
    if (!valid) return fail('validation', 'Invalid field type or length.');
    return commit(id, next, Object.keys(patch).filter(k => !equal(next[k], areas[id].draft[k])), source);
  }
  function setProducts(updates, source = 'human') {
    const error = guard('catalog'); if (error) return error;
    if (!Array.isArray(updates) || !updates.length || updates.length > products.length || new Set(updates.map(u => u?.id)).size !== updates.length) return fail('validation', 'Provide unique product updates within the demo catalog.');
    const next = clone(areas.catalog.draft), changed = [];
    for (const update of updates) {
      if (!keys(update, ['id', 'patch'], ['id', 'patch']) || !keys(update.patch, productFields) || !Object.keys(update.patch).length) return fail('validation', 'Use id and a nonempty editable product patch.');
      const index = next.findIndex(p => p.id === update.id);
      if (index < 0) return fail('not_found', 'Unknown product.');
      const candidate = { ...next[index], ...clone(update.patch) };
      if (!validProduct(candidate)) return fail('validation', 'Invalid product value.');
      for (const key of Object.keys(update.patch)) if (!equal(candidate[key], next[index][key])) changed.push(update.id + '.' + key);
      next[index] = candidate;
    }
    return commit('catalog', next, changed, source);
  }
  function cancel(id) {
    const error = guard(id); if (error) return error;
    const a = areas[id]; a.draft = clone(a.saved); a.aiFields = []; onChange(); return read(id);
  }
  async function save(id, { latency = 0, shouldFail = false, signal } = {}) {
    const error = guard(id); if (error) return error;
    if (id === 'newProduct' && !validProduct(areas[id].draft)) return fail('validation', 'Name, SKU and product code are required before saving.');
    const a = areas[id]; a.saving = true; onChange();
    try {
      await delay(latency, signal);
      if (signal?.aborted) return fail('aborted', 'Save cancelled; draft retained.');
      if (shouldFail) return fail('save_failed', 'Demo save failed. Draft retained; retry when ready.');
      a.saved = clone(a.draft); a.aiFields = [];
      return { ...read(id), saving: false, saved: true, storage: 'tab-memory' };
    } catch { return fail('aborted', 'Save cancelled; draft retained.'); }
    finally { a.saving = false; onChange(); }
  }
  function unsaved(page, form = null) {
    const ids = pageAreas[page];
    if (!ids || (form !== null && !ids.includes(form))) return fail('not_found', 'Unknown area on the current page.');
    const states = (form === null ? ids : [form]).map(id => ({ id, dirty: read(id).dirty, saving: read(id).saving }));
    return { ok: true, unsaved: states.some(a => a.dirty), busy: states.some(a => a.saving), areas: states };
  }
  function search() {
    const data = areas.catalog.draft.filter(p => p.sku.toLowerCase().includes(filters.skuContains.toLowerCase()) && (filters.maxPrice === null || p.price <= filters.maxPrice)).map(p => ({ ...clone(p), stock: stock[p.id] }));
    return { ok: true, filters: clone(filters), count: data.length, data };
  }
  function setSearch(patch) {
    if (!keys(patch, ['skuContains', 'maxPrice']) || !Object.keys(patch).length) return fail('validation', 'Provide skuContains or maxPrice.');
    const next = { ...filters, ...patch };
    if (!text(next.skuContains, 80, true) || !(next.maxPrice === null || Number.isFinite(next.maxPrice) && next.maxPrice >= 0 && next.maxPrice <= 100000)) return fail('validation', 'Invalid search filters.');
    filters = next; onChange(); return search();
  }
  function getProduct(id) {
    const p = areas.catalog.draft.find(p => p.id === id);
    return p ? { ok: true, data: { ...clone(p), stock: stock[id] } } : fail('not_found', 'Unknown product.');
  }
  function previewStorefront() { previewHtml = areas.storefront.draft.html; onChange(); return { ok: true, previewed: true, html: previewHtml }; }
  return { read, set, setProducts, save, cancel, unsaved, search, setSearch, getProduct, previewStorefront, getPreview: () => previewHtml };
}
