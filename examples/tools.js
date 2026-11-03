import { fail, keys, pageAreas, products, productFileInput } from './workspace.js';
export const projectRepositoryUrl = 'https://github.com/linkanyco/WebMCPLite';
export const pages = [
  { id: 'home', title: 'Welcome', purpose: 'Connect your AI, discover the site and try the tutorials.' },
  { id: 'product', title: 'Product editor', purpose: 'Polish an English description and translate it into Korean.', example: true },
  { id: 'bulk', title: 'Bulk editor', purpose: 'Reduce prices for every SKU starting with KEY-1.', example: true },
  { id: 'sheet', title: 'Product list', purpose: 'Search products, then ask about stock in the current results.', example: true },
  { id: 'board', title: 'Storefront editor', purpose: 'Edit category banner HTML/CSS and preview the result.', example: true },
  { id: 'async', title: 'Memory & Reuse', purpose: 'Read a product and recreate it in a new tab without a duplicate feature.', example: true },
  { id: 'new', title: 'New product', purpose: 'Supporting destination for a product created from remembered data.' },
  { id: 'guide', title: 'About', purpose: 'Learn about WebMCP and WebMCPLite. Use MoveToGithub to visit the project repository when asked where to learn more.', example: true },
];
const string = { type: 'string', minLength: 1, maxLength: 80 };
const description = { type: 'string', maxLength: 4000 };
const price = { type: 'number', minimum: 0, maximum: 100000 };
const object = (properties = {}, required = Object.keys(properties)) => ({ type: 'object', properties, required, additionalProperties: false });
const patch = properties => ({ ...object(properties, []), minProperties: 1 });
const example = (schema, value) => ({ ...schema, examples: [value] });
const fileGuidance = 'Use this ordinary browser file input, not a file-payload tool: ' + JSON.stringify(productFileInput);
const editableProduct = { name: string, price, descriptionEn: description, descriptionKo: description };
const productPatch = patch(editableProduct);
const productIds = products.map(p => p.id);

export function buildTools({ workspace: w, page, navigate, moveToGithub, setHighlights, saveOptions = () => ({}) }) {
  const result = [], areas = pageAreas[page];
  function add(name, description, schema, execute, readOnly = false) {
    result.push({ name, description, inputSchema: schema, annotations: { readOnlyHint: readOnly }, execute: async (input = {}, options = {}) => {
      if (!keys(input, Object.keys(schema.properties), schema.required)) return fail('validation', 'Use the documented input fields.');
      return execute(input, options);
    } });
  }
  add('site_map', 'List the welcome page, six tutorials and supporting New product page with relative URLs.', object(), () => ({ ok: true, pages: pages.map(p => ({ ...p, url: '?page=' + p.id })) }), true);
  add('isUnsavedContents', 'Read unsaved/busy state for all editing areas on this page, or one named form.', object({ form: { type: ['string', 'null'], enum: [...areas, null] } }, []), ({ form = null }) => w.unsaved(page, form), true);
  add('navigate', 'Navigate this tab to a page ID. Unsaved/busy state blocks leaving. Rediscover tools after navigation. Use browser controls for a new tab; site_map lists destinations if needed.', object({ page: { type: 'string', enum: pages.map(p => p.id) } }), ({ page: target }) => navigate(target));
  add('MoveToGithub', 'Open https://github.com/linkanyco/WebMCPLite in this tab, like the sidebar GitHub link. For "Where can I find more information about it?", call this action; do not only return an address. No input or save. Unsaved/busy state blocks leaving. navigationRequested is not proof of arrival; verify the browser URL.', object(), () => moveToGithub());
  add('setHighlights', 'Show/hide AI change marks without editing values. Marks start visible; human edits clear their own marks, save/cancel clear draft marks.', object({ enabled: { type: 'boolean' } }), ({ enabled }) => typeof enabled === 'boolean' ? setHighlights(enabled) : fail('validation', 'enabled must be boolean.'));
  if (areas.length) for (const action of ['save', 'cancel']) add(action, action === 'save' ? 'Save this form only when explicitly requested. Await saved:true; failure retains the draft. Storage is this tab’s memory, not a server; reload resets it. Busy saves block edits/cancel.' : 'Restore this form’s saved tab-memory baseline, including files where present. Refused while saving.', object({ form: { type: 'string', enum: areas } }), ({ form }, { signal }) => {
    if (!areas.includes(form)) return fail('not_found', 'Unknown form on the current page.');
    return action === 'save' ? w.save(form, { ...saveOptions(), signal }) : w.cancel(form);
  });
  if (['product', 'bulk', 'sheet', 'async'].includes(page)) add('getProduct', 'Read current product values, including unsaved edits and authorized read-only stock omitted from the list UI.' + (page === 'async' ? ' To recreate it, remember editable values, open ?page=new in a new browser tab, rediscover tools and call setProduct there. Omit source id/stock; tabs have independent state.' : ''), example(object({ id: { type: 'string', enum: productIds } }), { id: 'p1' }), ({ id }) => w.getProduct(id), true);
  if (['product', 'async'].includes(page)) add('setProduct', 'Patch displayed product p1 in the shared UI draft. Omitted fields stay; null/unknown fields reject. Identifiers/stock are read-only. Does not save.', example(object({ id: { type: 'string', enum: ['p1'] }, patch: productPatch }), { id: 'p1', patch: { descriptionEn: 'A quiet keyboard.', descriptionKo: '조용한 키보드입니다.' } }), ({ id, patch: values }) => id === 'p1' ? w.setProducts([{ id, patch: values }], 'ai') : fail('not_found', 'This page edits p1.'));
  if (page === 'bulk') {
    add('getProducts', 'Read all 12 current product drafts, including unsaved values and SKUs. For the tutorial, select SKU prefix KEY-1 from this data before setProducts.', object(), () => w.read('catalog'), true);
    add('setProducts', 'Patch up to 12 unique product drafts atomically. Omitted fields stay; null/unknown fields or any invalid update reject the whole batch. Identifiers/stock are read-only. Shared UI draft only; does not save.', example(object({ updates: { type: 'array', minItems: 1, maxItems: products.length, items: object({ id: { type: 'string', enum: productIds }, patch: productPatch }) } }), { updates: [{ id: 'p1', patch: { price: 80.1 } }] }), ({ updates }) => w.setProducts(updates, 'ai'));
  }
  if (page === 'sheet') {
    add('getProducts', 'Read ONLY the CURRENT filtered product results, active filters and count. Includes read-only stock omitted from the visible table. Use this for follow-up stock questions without changing filters.', object(), () => w.search(), true);
    add('setSearch', 'Patch visible filters: case-insensitive skuContains; inclusive maxPrice, null clears it. Omitted filters stay. Applies immediately without editing products.', example(object({ patch: patch({ skuContains: { type: 'string', maxLength: 80 }, maxPrice: { type: ['number', 'null'], minimum: 0, maximum: 100000 } }) }), { patch: { skuContains: 'KEY', maxPrice: 20 } }), ({ patch: values }) => w.setSearch(values));
  }
  if (page === 'board') {
    add('getStorefront', 'Read the editable category-banner HTML/CSS and the currently rendered preview source.', object(), () => ({ ...w.read('storefront'), previewHtml: w.getPreview() }), true);
    add('setStorefront', 'Patch html in the shared Textarea. Does not preview or save. Preview allows CSS and images, not scripts; category photos need images.unsplash.com access.', example(object({ patch: patch({ html: { type: 'string', minLength: 1, maxLength: 20000 } }) }), { patch: { html: '<h2>Desk essentials</h2>' } }), ({ patch: values }) => w.set('storefront', values, 'ai'));
    add('previewStorefront', 'Render the current source in the same sandboxed preview as the UI Preview button. Does not save or change the draft.', object(), () => w.previewStorefront());
  }
  if (page === 'new') {
    add('getProduct', 'Read the new-product UI draft and read-only file summaries (name, size, type, lastModified; no bytes). This destination owns its local ID. ' + fileGuidance, object(), () => w.read('newProduct'), true);
    add('setProduct', 'Patch the shared new-product draft; omitted fields stay, null/unknown fields reject. Omit source id/stock/files. Duplicate SKUs allowed. Name, SKU and product code are required to save; does not save. For files use ordinary #new-product-files, or read getProduct’s discovered description for selection guidance; no tool call is needed to obtain it.', example(object({ patch: patch({ sku: { type: 'string', maxLength: 80 }, productCode: { type: 'string', maxLength: 80 }, ...editableProduct, name: { type: 'string', maxLength: 80 } }) }), { patch: { sku: 'KEY-101', productCode: 'PRD-1001', name: 'Mechanical keyboard', price: 89 } }), ({ patch: values }) => w.set('newProduct', values, 'ai'));
  }
  return result;
}
