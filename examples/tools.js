import { fail, keys, pageAreas, products } from './workspace.js';
export const pages = [
  { id: 'home', title: 'Welcome', purpose: 'Connect your AI, discover the site and try the tutorials.' },
  { id: 'product', title: 'Product editor', purpose: 'Polish an English description and translate it into Korean.', example: true },
  { id: 'bulk', title: 'Bulk editor', purpose: 'Reduce prices for every SKU starting with KEY-1.', example: true },
  { id: 'sheet', title: 'Product list', purpose: 'Search products, then ask about stock in the current results.', example: true },
  { id: 'board', title: 'Storefront editor', purpose: 'Edit category banner HTML/CSS and preview the result.', example: true },
  { id: 'guide', title: 'Guides & navigation', purpose: 'Find more information about this project.', example: true },
  { id: 'async', title: 'Memory & Reuse', purpose: 'Read a product and recreate it in a new tab without a duplicate feature.', example: true },
  { id: 'new', title: 'New product', purpose: 'Supporting destination for a product created from remembered data.' },
];
const string = { type: 'string', minLength: 1, maxLength: 80 };
const description = { type: 'string', maxLength: 4000 };
const price = { type: 'number', minimum: 0, maximum: 100000 };
const object = (properties = {}, required = Object.keys(properties)) => ({ type: 'object', properties, required, additionalProperties: false });
const patch = properties => ({ ...object(properties, []), minProperties: 1 });
const editableProduct = { name: string, price, descriptionEn: description, descriptionKo: description };
const productPatch = patch(editableProduct);
const productIds = products.map(p => p.id);

export function buildTools({ workspace: w, page, navigate, setHighlights, getTools, saveOptions = () => ({}) }) {
  const result = [], areas = pageAreas[page];
  function add(name, description, schema, execute, readOnly = false) {
    result.push({ name, description, inputSchema: schema, annotations: { readOnlyHint: readOnly }, execute: async (input = {}, options = {}) => {
      if (!keys(input, Object.keys(schema.properties), schema.required)) return fail('validation', 'Use the documented input fields.');
      return execute(input, options);
    } });
  }
  add('site_map', 'List the welcome page, six tutorials and supporting New product page with relative URLs.', object(), () => ({ ok: true, pages: pages.map(p => ({ ...p, url: '?page=' + p.id })) }), true);
  add('site_manual', 'Read common site guidance, storage limits and the project information link.', object(), async () => {
    try { const response = await fetch(new URL('./manual.json', import.meta.url)); if (!response.ok) throw Error(); return { ok: true, manual: await response.json() }; }
    catch { return fail('manual_unavailable', 'Could not load the site manual. Retry or call page_manual for current tool contracts.'); }
  }, true);
  add('page_manual', 'Read this page purpose, editing areas and exact registered tool contracts.', object(), () => ({ ok: true, page: pages.find(p => p.id === page), areas, tools: getTools() }), true);
  add('isUnsavedContents', 'Check all editing areas on the CURRENT page when form is null or omitted.', object({ form: { type: ['string', 'null'], enum: [...areas, null] } }, []), ({ form = null }) => w.unsaved(page, form), true);
  add('navigate', 'Move within this tab. Unsaved drafts or pending saves block navigation. For a new tab use browser controls and a URL from site_map.', object({ page: { type: 'string', enum: pages.map(p => p.id) } }), ({ page: target }) => navigate(target));
  add('setHighlights', 'AI changes are highlighted by default. Show or hide these marks without changing any data. No UI switch is shown.', object({ enabled: { type: 'boolean' } }), ({ enabled }) => typeof enabled === 'boolean' ? setHighlights(enabled) : fail('validation', 'enabled must be boolean.'));
  if (areas.length) for (const action of ['save', 'cancel']) add(action, action === 'save' ? 'Save one current-page form to TAB MEMORY only. Await saved:true. Reload resets data; tabs have independent state.' : 'Discard one form draft back to its saved tab-memory value.', object({ form: { type: 'string', enum: areas } }), ({ form }, { signal }) => {
    if (!areas.includes(form)) return fail('not_found', 'Unknown form on the current page.');
    return action === 'save' ? w.save(form, { ...saveOptions(), signal }) : w.cancel(form);
  });
  if (['product', 'bulk', 'sheet', 'async'].includes(page)) add('getProduct', 'Read a demo product including English/Korean descriptions and authorized read-only stock. Stock is not displayed in the list UI.', object({ id: { type: 'string', enum: productIds } }), ({ id }) => w.getProduct(id), true);
  if (['product', 'async'].includes(page)) add('setProduct', 'Patch the displayed product p1 in the shared draft. name, price, descriptionEn and descriptionKo are editable; identifiers and stock are read-only. Save separately.', object({ id: { type: 'string', enum: ['p1'] }, patch: productPatch }), ({ id, patch: values }) => id === 'p1' ? w.setProducts([{ id, patch: values }], 'ai') : fail('not_found', 'This page edits p1.'));
  if (page === 'bulk') {
    add('getProducts', 'Read all 12 product drafts, including SKUs. Select the KEY-1 prefix in the returned data before preparing updates.', object(), () => w.read('catalog'), true);
    add('setProducts', 'Atomically patch up to 12 unique products. Invalid input rejects ALL updates. No implicit save; use the same editable fields as the UI.', object({ updates: { type: 'array', minItems: 1, maxItems: products.length, items: object({ id: { type: 'string', enum: productIds }, patch: productPatch }) } }), ({ updates }) => w.setProducts(updates, 'ai'));
  }
  if (page === 'sheet') {
    add('getProducts', 'Read ONLY the CURRENT filtered product results, active filters and count. Includes read-only stock omitted from the visible table. Use this for follow-up stock questions without changing filters.', object(), () => w.search(), true);
    add('setSearch', 'Patch the same visible search controls as the UI: case-insensitive skuContains, inclusive maxPrice (null clears the price limit). Applies immediately; changes no product data.', object({ patch: patch({ skuContains: { type: 'string', maxLength: 80 }, maxPrice: { type: ['number', 'null'], minimum: 0, maximum: 100000 } }) }), ({ patch: values }) => w.setSearch(values));
  }
  if (page === 'board') {
    add('getStorefront', 'Read the editable category-banner HTML/CSS and the currently rendered preview source.', object(), () => ({ ...w.read('storefront'), previewHtml: w.getPreview() }), true);
    add('setStorefront', 'Patch html in the shared source Textarea (up to 20000 characters). Does not preview or save. Use ordinary HTML/CSS; preview disallows scripts.', object({ patch: patch({ html: { type: 'string', minLength: 1, maxLength: 20000 } }) }), ({ patch: values }) => w.set('storefront', values, 'ai'));
    add('previewStorefront', 'Render the current source in the same sandboxed preview as the UI Preview button. Does not save or change the draft.', object(), () => w.previewStorefront());
  }
  if (page === 'new') {
    add('getProduct', 'Read the new-product form draft. Its local ID belongs to this destination, not to the source product.', object(), () => w.read('newProduct'), true);
    add('setProduct', 'Patch the new-product form with remembered values. Editable: sku, productCode, name, price, descriptionEn, descriptionKo. Omit source id and read-only stock. No uniqueness restriction in this fictional demo. Save separately.', object({ patch: patch({ sku: { type: 'string', maxLength: 80 }, productCode: { type: 'string', maxLength: 80 }, ...editableProduct, name: { type: 'string', maxLength: 80 } }) }), ({ patch: values }) => w.set('newProduct', values, 'ai'));
  }
  return result;
}
