import React, { useState, useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import { Alert, Button, Input, InputNumber, Select, Switch, Table, Tabs, Tag } from 'antd';
import LobeConfigProvider from '@lobehub/ui/es/ConfigProvider/index';
import ThemeProvider from '@lobehub/ui/es/ThemeProvider/index';
import { motion } from 'motion/react';
import { ArrowDown, ArrowRight, ArrowUp, BookOpen, Box, Braces, Check, ChevronRight, CircleHelp, Code2, ExternalLink, Github, Layers, LayoutDashboard, List, Package, Play, RotateCcw, Save, ShieldCheck, Sparkles, Terminal, Workflow } from 'lucide-react';
import { connectTools } from '../src/connect.js';
import { createWorkspace, fail, pageAreas } from './workspace.js';
import { buildTools, pages } from './tools.js';
import './style.css';

// Both the UI and registered tools use these app actions; no public fallback API.
const listeners = new Set();
let snapshot = 0;
const emit = () => { snapshot++; for (const listener of listeners) listener(); };
const subscribe = listener => { listeners.add(listener); return () => listeners.delete(listener); };
const workspace = createWorkspace({ onChange: emit });
let page = new URL(location.href).searchParams.get('page') || 'product';
if (!pages.some(p => p.id === page)) page = 'product';
let entry = Number.isInteger(history.state?.liteEntry) ? history.state.liteEntry : 0;
let restoring = false, bridge, definitions = [], registration = 'pending', highlights = true, failNext = true;
let lastResult = null, notice = null;
history.replaceState({ litePage: page, liteEntry: entry }, '', `?page=${page}`);
const publish = result => { lastResult = result; emit(); return result; };
function report(result) { notice = result.ok === false ? { type: 'error', message: result.error.message } : null; return publish(result); }
function canLeave() {
  const state = workspace.unsaved(page);
  if (state.unsaved || state.busy) { notice = { type: 'warning', message: 'Save or discard changes in every form on this page before leaving.' }; emit(); return false; }
  return true;
}
function navigate(target) {
  if (!pages.some(p => p.id === target)) return fail('not_found', 'Unknown page.');
  if (target === page) return { ok: true, page };
  if (!canLeave()) return { ...fail('unsaved', 'Save or discard every current-page form before leaving.'), state: workspace.unsaved(page) };
  page = target; entry++; notice = null;
  history.pushState({ litePage: page, liteEntry: entry }, '', `?page=${page}`);
  activate(); return { ok: true, page };
}
window.addEventListener('popstate', event => {
  if (restoring) { restoring = false; return; }
  const target = event.state;
  if (!target || !pages.some(p => p.id === target.litePage)) return;
  if (!canLeave()) { restoring = true; history.go(entry - target.liteEntry); return; }
  page = target.litePage; entry = target.liteEntry; notice = null; activate();
});
window.addEventListener('beforeunload', event => {
  const state = workspace.unsaved(page);
  if (state.unsaved || state.busy) { event.preventDefault(); event.returnValue = ''; }
});
function setHighlights(enabled) { highlights = enabled; emit(); return { ok: true, enabled }; }
const saveOptions = () => page === 'async' ? { latency: 700, shouldFail: failNext } : {};
const metadata = () => definitions.map(({ execute, ...tool }) => structuredClone(tool));
const inPageSupported = () => typeof document.modelContext?.getTools === 'function' && typeof document.modelContext?.executeTool === 'function';
function activate() {
  bridge?.dispose(); registration = 'pending';
  definitions = buildTools({ workspace, page, navigate, setHighlights, getTools: metadata, saveOptions });
  bridge = connectTools(definitions);
  const owner = bridge;
  owner.ready.then(states => {
    if (owner !== bridge) return;
    registration = states.every(s => s.state === 'registered') ? 'registered' : states.some(s => s.state === 'failed') ? 'failed' : 'unsupported';
    emit();
  });
  emit();
}
async function callTool(name, input = {}) {
  if (!inPageSupported()) return fail('unsupported', 'This browser does not support in-page WebMCP invocation. You can still use the editor.');
  const owner = bridge; await owner.ready;
  try {
    const tools = await document.modelContext.getTools();
    if (owner !== bridge) return fail('inactive', 'The page changed. Select a tool from the current page.');
    const tool = tools.find(t => t.name === name && t.window === window);
    if (!tool) return fail('not_found', 'The requested tool is not registered on this page.');
    return JSON.parse(await document.modelContext.executeTool(tool, input));
  } catch { return fail('tool_failed', 'The browser could not execute this tool. Check support and try again.'); }
}
activate();

const icons = { product: Package, bulk: Layers, sheet: List, board: LayoutDashboard, guide: BookOpen, async: RotateCcw };
const details = {
  product: ['One product. One shared draft.', 'Edit a product yourself, then let a tool pick up where you left off.'],
  bulk: ['A few edits, all together.', 'Update multiple products with one validated, atomic patch.'],
  sheet: ['A product list that works your way.', 'Choose an identifier and arrange a short product list.'],
  board: ['Make a plan, together.', 'A small board with a simple read-and-patch contract.'],
  guide: ['Find your way. Keep your work.', 'Discover the site and try navigation with two independent forms.'],
  async: ['A failed save is not lost work.', 'Try a delayed save, keep your draft on failure, and retry.'],
};
const scenarios = { product: 'Update the product name and price in the shared form.', bulk: 'Update two products in a single atomic operation.', sheet: 'Read a related product, then display product codes instead of SKUs.', board: 'Update the board title and note together.', guide: 'Update the second form, then check all unsaved areas.', async: 'Update a product draft, then try saving with the failure switch on.' };
const defaultTool = { product: 'getProduct', bulk: 'getProducts', sheet: 'getSheet', board: 'getBoard', guide: 'getNotes', async: 'getProduct' };
function sample(name) {
  const form = pageAreas[page][0];
  const examples = { getProduct: { id: page === 'async' ? 'p3' : 'p1' }, setProduct: { id: page === 'async' ? 'p3' : 'p1', patch: { name: 'Updated workspace product' } }, setProducts: { updates: [{ id: 'p1', patch: { price: 85 } }, { id: 'p2', patch: { price: 45 } }] }, setSheet: { patch: { codeType: 'productCode' } }, setBoard: { patch: { title: 'Our next steps' } }, setNote: { form: 'guideDetails', patch: { text: 'Please deliver to the reception desk.' } }, save: { form }, cancel: { form }, navigate: { page: page === 'board' ? 'product' : 'board' }, setHighlights: { enabled: !highlights }, isUnsavedContents: { form: null } };
  return JSON.stringify(examples[name] || {}, null, 2);
}
async function runExample() {
  if (page === 'product' || page === 'async') return callTool('setProduct', { id: page === 'async' ? 'p3' : 'p1', patch: { name: page === 'async' ? 'Adjustable task light' : 'Mechanical keyboard Pro', price: page === 'async' ? 69 : 95 } });
  if (page === 'bulk') return callTool('setProducts', { updates: [{ id: 'p1', patch: { price: 85 } }, { id: 'p2', patch: { name: 'Desktop hub Plus', price: 55 } }] });
  if (page === 'sheet') { const relatedProduct = await callTool('getProduct', { id: 'p1' }); if (!relatedProduct.ok) return relatedProduct; return { relatedProduct, edit: await callTool('setSheet', { patch: { codeType: 'productCode' } }) }; }
  if (page === 'board') return callTool('setBoard', { patch: { title: 'Our next steps', note: 'A shared plan, ready for a human to continue editing.' } });
  const edit = await callTool('setNote', { form: 'guideDetails', patch: { text: 'Please deliver to the reception desk.' } });
  return edit.ok ? { edit, unsaved: await callTool('isUnsavedContents', {}) } : edit;
}
function DraftStatus({ state }) { return <Tag className="draft-tag" color={state.saving ? 'processing' : state.dirty ? 'gold' : undefined} icon={state.dirty || state.saving ? undefined : <Check size={12} />}>{state.saving ? 'Saving…' : state.dirty ? 'Unsaved changes' : 'Saved in this tab'}</Tag>; }
function Field({ state, name, label, children, product, inputId }) {
  const changed = state.aiFields.includes(product ? `${product}.${name}` : name);
  return <div className={`field ${changed && highlights ? 'ai-field' : ''}`}><div className="field-label"><label htmlFor={inputId || `${product || ''}${name}`}>{label}</label>{changed && highlights && <span className="ai-label"><Sparkles size={11} />AI edited</span>}</div>{children}</div>;
}
function FormActions({ area, state }) { return <div className="form-actions"><div className="save-buttons"><Button type="primary" icon={<Save size={15} />} loading={state.saving} onClick={async () => report(await workspace.save(area, saveOptions()))}>Save changes</Button><Button disabled={state.saving} icon={<RotateCcw size={14} />} onClick={() => report(workspace.cancel(area))}>Discard</Button></div><span>Tab memory only. Reload to reset.</span></div>; }
function ProductEditor() {
  const area = page === 'async' ? 'asyncProduct' : 'catalog', state = workspace.read(area), product = page === 'async' ? state.data : state.data[0];
  const prefix = area === 'catalog' ? product.id : '';
  const change = (name, value) => { const result = area === 'catalog' ? workspace.setProducts([{ id: product.id, patch: { [name]: value } }]) : workspace.set(area, { [name]: value }); if (!result.ok) report(result); else if (notice) { notice = null; emit(); } };
  return <section className="surface editor-surface" aria-label="Shared product editor"><div className="surface-heading"><div><h2>Product details</h2><p>Shared by you and your AI tools</p></div><DraftStatus state={state} /></div><div className="product-summary"><div className="product-icon"><Package size={30} strokeWidth={1.5} /></div><div><span className="tiny-label">PRODUCT</span><h3>{product.name}</h3><div className="inline-codes"><code>{product.sku}</code><span>·</span><code>{product.productCode}</code></div></div></div><div className="form-body">
    <Field state={state} name="name" product={prefix} label="Product name"><Input id={`${prefix}name`} value={product.name} maxLength={80} disabled={state.saving} onChange={e => change('name', e.target.value)} /></Field>
    <div className="form-grid"><Field state={state} name="price" product={prefix} label="Unit price"><InputNumber id={`${prefix}price`} value={product.price} prefix="$" min={0} max={100000} disabled={state.saving} onChange={value => change('price', value)} /></Field><div className="readonly-field"><span>SKU</span><div><Code2 size={14} /><code>{product.sku}</code><Tag>Read only</Tag></div></div></div>
    <Field state={state} name="description" product={prefix} label="Description"><Input.TextArea id={`${prefix}description`} value={product.description} maxLength={80} rows={3} disabled={state.saving} onChange={e => change('description', e.target.value)} /></Field>
    {page === 'async' && <div className="failure-control"><div><strong>Simulate save failure</strong><p>Saves take 0.7 seconds. Turn this off to retry successfully.</p></div><Switch aria-label="Simulate save failure" checked={failNext} disabled={state.saving} onChange={value => { failNext = value; emit(); }} /></div>}
  </div><FormActions area={area} state={state} /></section>;
}
function BulkEditor() {
  const state = workspace.read('catalog');
  const change = (id, field, value) => { const result = workspace.setProducts([{ id, patch: { [field]: value } }]); if (!result.ok) report(result); };
  const columns = [{ title: 'Product', key: 'name', width: 235, render: (_, p) => <Field state={state} product={p.id} name="name" label={`Name for ${p.sku}`}><Input id={`${p.id}name`} value={p.name} disabled={state.saving} maxLength={80} onChange={e => change(p.id, 'name', e.target.value)} /></Field> }, { title: 'SKU', dataIndex: 'sku', width: 110, render: value => <code>{value}</code> }, { title: 'Unit price', key: 'price', width: 145, render: (_, p) => <Field state={state} product={p.id} name="price" label={`Price for ${p.sku}`}><InputNumber id={`${p.id}price`} value={p.price} prefix="$" min={0} max={100000} disabled={state.saving} onChange={value => change(p.id, 'price', value)} /></Field> }];
  return <section className="surface editor-surface"><div className="surface-heading"><div><h2>Product catalog</h2><p>3 products · one atomic update contract</p></div><DraftStatus state={state} /></div><div className="table-body bulk-table"><Table rowKey="id" columns={columns} dataSource={state.data} pagination={false} scroll={{ x: 500 }} /></div><div className="inline-note"><ShieldCheck size={16} />Invalid bulk input rejects the entire update.</div><FormActions area="catalog" state={state} /></section>;
}
function ProductList() {
  const state = workspace.read('sheet'), catalog = workspace.read('catalog').data;
  const patch = values => { const result = workspace.set('sheet', values); if (!result.ok) report(result); };
  const move = (index, direction) => { const rows = state.data.rows; [rows[index], rows[index + direction]] = [rows[index + direction], rows[index]]; patch({ rows }); };
  const columns = [{ title: state.data.codeType === 'sku' ? 'SKU' : 'Product code', key: 'identifier', width: 130, render: (_, row) => <code className={state.aiFields.includes('codeType') && highlights ? 'ai-code' : ''}>{catalog.find(p => p.id === row.productId)[state.data.codeType]}</code> }, { title: 'Product', key: 'product', width: 190, render: (_, row) => catalog.find(p => p.id === row.productId).name }, { title: 'Quantity', key: 'quantity', width: 100, render: (_, row, index) => <InputNumber aria-label={`Quantity for ${catalog.find(p => p.id === row.productId).name}`} value={row.quantity} min={1} max={999} onChange={value => { const rows = state.data.rows; rows[index].quantity = value; patch({ rows }); }} /> }, { title: 'Order', key: 'order', width: 85, render: (_, row, index) => <div className="row-order"><Button aria-label={`Move ${catalog.find(p => p.id === row.productId).name} up`} size="small" icon={<ArrowUp size={13} />} disabled={index === 0} onClick={() => move(index, -1)} /><Button aria-label={`Move ${catalog.find(p => p.id === row.productId).name} down`} size="small" icon={<ArrowDown size={13} />} disabled={index === state.data.rows.length - 1} onClick={() => move(index, 1)} /></div> }];
  return <section className="surface editor-surface"><div className="surface-heading"><div><h2>List settings</h2><p>Related products, without a special workflow</p></div><DraftStatus state={state} /></div><div className="form-body"><Field state={state} name="title" label="List name"><Input id="title" maxLength={80} value={state.data.title} onChange={e => patch({ title: e.target.value })} /></Field><Field state={state} name="codeType" label="Display identifier"><Select id="codeType" value={state.data.codeType} options={[{ value: 'sku', label: 'SKU' }, { value: 'productCode', label: 'Product code' }]} onChange={value => patch({ codeType: value })} /></Field></div><div className={`table-body ${state.aiFields.includes('rows') && highlights ? 'ai-rows' : ''}`}><Table rowKey="productId" columns={columns} dataSource={state.data.rows} pagination={false} scroll={{ x: 505 }} /></div><div className="inline-note"><CircleHelp size={15} />getProduct can read details beyond this list preview.</div><FormActions area="sheet" state={state} /></section>;
}
function BoardEditor() {
  const state = workspace.read('board');
  const patch = values => { const result = workspace.set('board', values); if (!result.ok) report(result); };
  return <section className="surface editor-surface"><div className="surface-heading"><div><h2>Planning board</h2><p>A small example for any kind of app</p></div><DraftStatus state={state} /></div><div className="form-body"><Field state={state} name="title" label="Board title"><Input id="title" maxLength={80} value={state.data.title} onChange={e => patch({ title: e.target.value })} /></Field><Field state={state} name="note" label="Note"><Input.TextArea id="note" rows={8} maxLength={500} value={state.data.note} onChange={e => patch({ note: e.target.value })} /></Field></div><FormActions area="board" state={state} /></section>;
}
function GuideEditor() {
  return <div className="guide-editors"><div className="guide-intro"><BookOpen size={20} /><div><h3>A manual, through the same tools.</h3><p>Try site_map, site_manual or page_manual in the playground. Unsaved changes in either form below will block navigation.</p></div></div>{pageAreas.guide.map((area, index) => { const state = workspace.read(area); return <section key={area} className="surface editor-surface"><div className="surface-heading"><div><h2>{index ? 'Delivery instructions' : 'Front desk note'}</h2><p>{area}</p></div><DraftStatus state={state} /></div><div className="form-body"><Field state={state} name="text" inputId={`text-${area}`} label={index ? 'Delivery note' : 'Reception note'}><Input.TextArea id={`text-${area}`} aria-label={index ? 'Delivery note' : 'Reception note'} rows={3} maxLength={500} className={state.aiFields.includes('text') && highlights ? 'ai-note' : ''} value={state.data.text} onChange={e => { const result = workspace.set(area, { text: e.target.value }); if (!result.ok) report(result); }} /></Field></div><FormActions area={area} state={state} /></section>; })}</div>;
}
function ToolPlayground() {
  const [selected, setSelected] = useState(defaultTool[page]), [args, setArgs] = useState(sample(defaultTool[page])), [running, setRunning] = useState(false);
  const available = registration === 'registered' && inPageSupported(), selectedDefinition = definitions.find(t => t.name === selected);
  async function run(example = false) { setRunning(true); try { report(example ? await runExample() : await callTool(selected, JSON.parse(args))); } catch { report(fail('validation', 'Enter a valid JSON object using the documented input fields.')); } finally { setRunning(false); } }
  const statusMessage = registration === 'pending' ? 'Checking browser support…' : registration === 'failed' ? 'Tool registration failed. The editor remains available.' : registration !== 'registered' ? 'WebMCP is unavailable here. The editor remains available.' : !inPageSupported() ? 'Tools registered. In-page invocation is unavailable.' : `${definitions.length} tools registered · in-page invocation ready`;
  const output = lastResult === null ? null : JSON.stringify(lastResult, null, 2);
  return <aside className="surface tool-panel" aria-label="WebMCP tool playground"><div className="tool-title"><span className="tool-icon"><Terminal size={19} /></span><div><h2>Tool playground</h2><p>Same state. Standard API.</p></div><Tag>WebMCP</Tag></div><div className="tool-status" role="status"><span className={`status-dot ${registration === 'registered' ? 'connected' : ''}`} />{statusMessage}</div><div className="example-box"><div className="example-caption"><Sparkles size={14} /><span>GIVE IT A TRY</span></div><p>{scenarios[page]}</p><Button block type="primary" disabled={!available || running} loading={running} icon={<Play size={14} />} onClick={() => run(true)}>Run example</Button><span className="example-footnote">Calls registered tools. No AI model required.</span></div>
    <div className="tool-form"><label htmlFor="tool-select">Registered tool</label><Select id="tool-select" showSearch={{ optionFilterProp: 'label' }} value={selected} disabled={!available || running} options={definitions.map(t => ({ value: t.name, label: t.name }))} onChange={value => { setSelected(value); setArgs(sample(value)); }} /><div className="code-label"><label htmlFor="tool-args">Arguments</label><span>JSON</span></div><Input.TextArea id="tool-args" className="json-input" value={args} disabled={!available || running} rows={5} spellCheck={false} onChange={e => setArgs(e.target.value)} /><Button block disabled={!available || running} icon={<ArrowRight size={14} />} onClick={() => run()}>Execute tool</Button></div>
    <Tabs className="output-tabs" defaultActiveKey="result" items={[{ key: 'result', label: 'Response', children: output ? <pre className="result-code" aria-live="polite">{output}</pre> : <div className="empty-result"><Braces size={24} strokeWidth={1.4} /><p>Your tool response appears here.</p><span>Run an example or call a tool.</span></div> }, { key: 'schema', label: 'Input schema', children: <pre className="result-code">{JSON.stringify(selectedDefinition.inputSchema, null, 2)}</pre> }]} /><div className="standard-note"><ShieldCheck size={14} /><span>Uses document.modelContext. Browser agent support is checked separately.</span></div></aside>;
}
function WorkspaceApp() {
  useSyncExternalStore(subscribe, () => snapshot);
  const current = pages.find(p => p.id === page), Icon = icons[page], index = pages.findIndex(p => p.id === page), commit = document.querySelector('meta[name="build-commit"]')?.content;
  return <div className={`app-shell ${highlights ? '' : 'hide-highlights'}`}><aside className="sidebar"><a className="brand" href="?page=product" onClick={e => { e.preventDefault(); report(navigate('product')); }}><span className="brand-mark"><Workflow size={22} /></span><span>WebMCP<span className="brand-lite">Lite</span><small>Example workspace</small></span></a><div className="nav-section-label">EXPLORE EXAMPLES<span>06</span></div><nav aria-label="Example pages">{pages.map((p, i) => { const NavIcon = icons[p.id]; return <a key={p.id} href={`?page=${p.id}`} aria-current={page === p.id ? 'page' : undefined} onClick={e => { e.preventDefault(); report(navigate(p.id)); }}><NavIcon size={17} /><span>{p.title}</span><span className="nav-number">0{i + 1}</span></a>; })}</nav><div className="sidebar-bottom"><div className="standards-card"><span className="standards-icon"><ShieldCheck size={18} /></span><h3>Built on WebMCP</h3><p>Practical examples for the existing browser interface.</p><a href="https://webmachinelearning.github.io/webmcp/" target="_blank" rel="noreferrer">Read the specification<ExternalLink size={12} /></a></div><a className="sidebar-link" href="https://github.com/linkanyco/WebMCPLite#readme" target="_blank" rel="noreferrer"><BookOpen size={16} />Documentation<ExternalLink size={12} /></a><a className="sidebar-link" href="https://github.com/linkanyco/WebMCPLite" target="_blank" rel="noreferrer"><Github size={16} />GitHub repository<ExternalLink size={12} /></a></div></aside>
    <div className="main-shell"><header className="topbar"><div className="breadcrumbs"><span>Examples</span><ChevronRight size={13} /><strong>{current.title}</strong></div><a className="source-link" href="https://github.com/linkanyco/WebMCPLite" target="_blank" rel="noreferrer"><Github size={15} /><span>View source</span><ExternalLink size={12} /></a></header><main><div className="page-heading"><div><div className="eyebrow">EXAMPLE 0{index + 1}<span>/</span>HUMAN + AI</div><h1>{current.title}</h1><p>{details[page][1]}</p></div><span className="page-icon"><Icon size={28} strokeWidth={1.25} /></span></div><div className="workspace-toolbar"><div className="workspace-label"><Box size={15} /><span>{details[page][0]}</span></div><label className="highlight-toggle"><Switch size="small" checked={highlights} onChange={setHighlights} aria-label="Show AI changes" /><span>Show AI changes</span><Sparkles size={13} /></label></div>
    {notice && <Alert className="app-notice" type={notice.type} showIcon title={notice.message} closable onClose={() => { notice = null; emit(); }} />}
    <div className="workspace-grid"><div className="editor-column">{page === 'product' || page === 'async' ? <ProductEditor /> : page === 'bulk' ? <BulkEditor /> : page === 'sheet' ? <ProductList /> : page === 'board' ? <BoardEditor /> : <GuideEditor />}<div className="how-it-works"><span className="how-icon"><Workflow size={17} /></span><div><strong>Your interface is the shared workspace.</strong><p>Tools use the same app actions as you. AI edits are highlighted; you can keep editing, save, or discard.</p></div></div></div><ToolPlayground key={page} /></div>
    <footer><span><span className="status-dot" />Fictional data<span className="footer-dot">·</span>Tab memory only<span className="footer-dot">·</span>Reload to reset</span>{commit ? <a href={`https://github.com/linkanyco/WebMCPLite/commit/${commit}`} target="_blank" rel="noreferrer">Build {commit.slice(0, 7)}<ExternalLink size={11} /></a> : <span>Local preview</span>}</footer></main></div></div>;
}
createRoot(document.getElementById('root')).render(<LobeConfigProvider motion={motion} locale="en-US"><ThemeProvider defaultAppearance="light" enableCustomFonts={false} customTheme={{ neutralColor: 'slate' }} theme={{ token: { fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', borderRadius: 8, controlHeight: 38 } }}><WorkspaceApp /></ThemeProvider></LobeConfigProvider>);
