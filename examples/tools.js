import { fail, keys, pageAreas } from './workspace.js';
export const pages = [
  { id: 'product', title: 'Product editor', purpose: 'Edit one product together through the same shared draft.' },
  { id: 'bulk', title: 'Bulk editor', purpose: 'Validate and apply multiple product updates together.' },
  { id: 'sheet', title: 'Product list', purpose: 'Edit rows, quantities and the displayed product identifier.' },
  { id: 'board', title: 'Planning board', purpose: 'Use a simple getBoard/setBoard editing contract.' },
  { id: 'guide', title: 'Guides & navigation', purpose: 'Discover manuals and check unsaved changes across two forms.' },
  { id: 'async', title: 'Save & recovery', purpose: 'Try delayed saves, failure, retry and draft recovery.' },
];
const string = { type: 'string', minLength: 1, maxLength: 80 };
const object = (properties = {}, required = Object.keys(properties)) => ({ type: 'object', properties, required, additionalProperties: false });
const patch = (properties) => ({ ...object(properties, []), minProperties: 1 });
const productPatch = patch({ name: string, price: { type: 'number', minimum: 0, maximum: 100000 }, description: string });

export function buildTools({ workspace: w, page, navigate, setHighlights, getTools, saveOptions = () => ({}) }) {
  const result = [];
  function add(name, description, schema, execute, readOnly = false) {
    result.push({ name, description, inputSchema: schema, annotations: { readOnlyHint: readOnly }, execute: async (input = {}, options = {}) => {
      if (!keys(input, Object.keys(schema.properties), schema.required)) return fail('validation', 'Use the documented input fields.');
      return execute(input, options);
    } });
  }
  const areas = pageAreas[page];
  const getProduct = ({ id }) => {
    const state = w.read(page === 'async' ? 'asyncProduct' : 'catalog');
    const product = page === 'async' ? (state.data.id === id ? state.data : null) : state.data.find(p => p.id === id);
    return product ? { ...state, data: product } : fail('not_found', 'Unknown product.');
  };
  add('site_map', 'List the six example pages with URLs and purposes.', object(), () => ({ ok: true, pages: pages.map(p => ({ ...p, url: `?page=${p.id}` })) }), true);
  add('site_manual', 'Read common site rules, storage limits and how to start.', object(), async () => {
    try { const response = await fetch(new URL('./manual.json', import.meta.url)); if (!response.ok) throw Error(); return { ok: true, manual: await response.json() }; }
    catch { return fail('manual_unavailable', 'Could not load the site manual. Retry or call page_manual for current page tool contracts.'); }
  }, true);
  add('page_manual', 'Read this page purpose, editing areas and exact tool contracts.', object(), () => ({ ok: true, page: pages.find(p => p.id === page), areas, tools: getTools() }), true);
  add('isUnsavedContents', 'Check every editing area on the CURRENT page when form is null or omitted; never the entire server.', object({ form: { type: ['string', 'null'], enum: [...areas, null] } }, []), ({ form = null }) => w.unsaved(page, form), true);
  add('navigate', 'Move to another example. Unsaved drafts or pending saves block navigation; save or cancel first.', object({ page: { type: 'string', enum: pages.map(p => p.id) } }), ({ page: target }) => navigate(target));
  add('setHighlights', 'Show or hide AI change highlights without changing data or dirty state.', object({ enabled: { type: 'boolean' } }), ({ enabled }) => typeof enabled === 'boolean' ? setHighlights(enabled) : fail('validation', 'enabled must be boolean.'));
  for (const action of ['save', 'cancel']) add(action, action === 'save' ? 'Save one current-page form to TAB MEMORY only. Reload resets data. Await saved:true; failure retains draft.' : 'Discard one form draft back to its saved tab-memory value.', object({ form: { type: 'string', enum: areas } }), ({ form }, { signal }) => {
    if (!areas.includes(form)) return fail('not_found', 'Unknown form on the current page.');
    return action === 'save' ? w.save(form, { ...saveOptions(), signal }) : w.cancel(form);
  });
  if (['product', 'bulk', 'sheet', 'async'].includes(page)) add('getProduct', 'Read an authorized demo product including its SKU, product code and description, even when these details are absent from the preview.', object({ id: { type: 'string', enum: page === 'async' ? ['p3'] : ['p1', 'p2', 'p3'] } }), getProduct, true);
  if (['product', 'async'].includes(page)) add('setProduct', 'Patch editable product fields in the shared draft only; omitted fields stay. No null, no unknown fields. SKU and product code are read-only. Save separately.', object({ id: { type: 'string', enum: page === 'async' ? ['p3'] : ['p1'] }, patch: productPatch }), ({ id, patch: values }) => {
    if (page !== 'async') return id === 'p1' ? w.setProducts([{ id, patch: values }], 'ai') : fail('not_found', 'This page edits p1. Use the bulk page for other products.');
    return id === 'p3' ? w.set('asyncProduct', values, 'ai') : fail('not_found', 'Unknown product.');
  });
  if (page === 'bulk') {
    add('getProducts', 'Read all three demo product drafts.', object(), () => w.read('catalog'), true);
    add('setProducts', 'Atomically patch 1–3 unique products. Any invalid value rejects ALL updates; no save.', object({ updates: { type: 'array', minItems: 1, maxItems: 3, items: object({ id: { type: 'string', enum: ['p1', 'p2', 'p3'] }, patch: productPatch }) } }), ({ updates }) => w.setProducts(updates, 'ai'));
  }
  if (page === 'sheet') {
    add('getSheet', 'Read the product list draft. Use getProduct for details omitted from the preview.', object(), () => w.read('sheet'), true);
    add('setSheet', 'Patch the product list draft. rows replaces the full array; productId must exist and be unique. codeType selects SKU or product code for the preview.', object({ patch: patch({ title: string, codeType: { type: 'string', enum: ['sku', 'productCode'] }, rows: { type: 'array', minItems: 1, maxItems: 3, items: object({ productId: { type: 'string', enum: ['p1', 'p2', 'p3'] }, quantity: { type: 'integer', minimum: 1, maximum: 999 } }) } }) }), ({ patch: values }) => w.set('sheet', values, 'ai'));
  }
  if (page === 'board') {
    add('getBoard', 'Read the shared board draft.', object(), () => w.read('board'), true);
    add('setBoard', 'Patch title/note on the shared board draft; no implicit save.', object({ patch: patch({ title: string, note: { type: 'string', minLength: 1, maxLength: 500 } }) }), ({ patch: values }) => w.set('board', values, 'ai'));
  }
  if (page === 'guide') {
    add('getNotes', 'Read both independent form drafts on this page.', object(), () => ({ ok: true, forms: Object.fromEntries(areas.map(id => [id, w.read(id)])) }), true);
    add('setNote', 'Patch one note draft through the same action used by its UI.', object({ form: { type: 'string', enum: areas }, patch: patch({ text: { type: 'string', minLength: 1, maxLength: 500 } }) }), ({ form, patch: values }) => areas.includes(form) ? w.set(form, values, 'ai') : fail('not_found', 'Unknown form.'));
  }
  return result;
}
