import React, { useState, useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import { Alert, Button, ConfigProvider, Input, InputNumber, Select, Table, Tabs, Tag } from 'antd';
import enUS from 'antd/locale/en_US';
import koKR from 'antd/locale/ko_KR';
import LobeConfigProvider from '@lobehub/ui/es/ConfigProvider/index';
import ThemeProvider from '@lobehub/ui/es/ThemeProvider/index';
import { motion } from 'motion/react';
import { ArrowRight, BookOpen, ChevronRight, ExternalLink, Github, Layers, LayoutDashboard, List, Package, Play, RotateCcw, Save, Sparkles, Workflow } from 'lucide-react';
import { connectTools } from '../src/connect.js';
import { createWorkspace, fail, pageAreas, productFileInput } from './workspace.js';
import { buildTools, pages } from './tools.js';
import bannerUrl from './assets/collaboration-banner.png';
import { translate } from './i18n.js';
import './style.css';

// Both the UI and registered tools use these app actions; no public fallback API.
const listeners = new Set();
let snapshot = 0;
const emit = () => { snapshot++; for (const listener of listeners) listener(); };
const subscribe = listener => { listeners.add(listener); return () => listeners.delete(listener); };
const workspace = createWorkspace({ onChange: () => { notice = null; emit(); } });
let page = new URL(location.href).searchParams.get('page') || 'home';
if (!pages.some(p => p.id === page)) page = 'home';
let entry = Number.isInteger(history.state?.liteEntry) ? history.state.liteEntry : 0;
let restoring = false, bridge, definitions = [], registration = 'pending', highlights = true;
let lastResult = null, notice = null, language = 'en';
const t = text => translate(text, language);
function setLanguage(value) { language = value; document.documentElement.lang = value; emit(); }
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
  activate(); window.scrollTo(0, 0); return { ok: true, page };
}
window.addEventListener('popstate', event => {
  if (restoring) { restoring = false; return; }
  const target = event.state;
  if (!target || !pages.some(p => p.id === target.litePage)) return;
  if (!canLeave()) { restoring = true; history.go(entry - target.liteEntry); return; }
  page = target.litePage; entry = target.liteEntry; notice = null; activate(); window.scrollTo(0, 0);
});
window.addEventListener('beforeunload', event => {
  const state = workspace.unsaved(page);
  if (state.unsaved || state.busy) { event.preventDefault(); event.returnValue = ''; }
});
function setHighlights(enabled) { highlights = enabled; emit(); return { ok: true, enabled }; }
const saveOptions = () => ({});
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

const icons = { home: Workflow, product: Package, bulk: Layers, sheet: List, board: LayoutDashboard, guide: BookOpen, async: RotateCcw, new: Package };
const prompts = {
  product: ['Polish the English description, then translate it and fill in the Korean description too.'],
  bulk: ['Reduce the price of every product whose SKU starts with KEY-1 by 10%.'],
  sheet: ['Find products with KEY in the SKU priced at $20 or less.', 'Among these results, are any products at 5 units of stock or fewer?'],
  board: ['Move each category name to the center of its image and add a white text shadow so it stands out.'],
  guide: ['I really like this site. Where can I find more information about it?'],
  async: ['Create an identical product in a new tab.'],
  new: ['Use the product details you read in the other tab to fill in this new product.'],
};
const defaultTool = { home: 'site_map', product: 'getProduct', bulk: 'getProducts', sheet: 'getProducts', board: 'getStorefront', guide: 'site_manual', async: 'getProduct', new: 'getProduct' };
const discoveryPrompt = 'This website exposes WebMCP tools through document.modelContext. Use your browser’s WebMCP support to discover the tools registered on this page. Read site_manual, site_map and page_manual to get started. For file tasks, read page_manual for the ordinary file input and use supported browser attachment or ask me to select the files. If WebMCP is unavailable in your browser or AI environment, tell me.';
const pagePrompt = 'Now that you have discovered WebMCP, what can you do on this page?';
function sample(name) {
  const examples = { getProduct: page === 'new' ? {} : { id: 'p1' }, setProduct: page === 'new' ? { patch: { name: 'Mechanical keyboard', sku: 'KEY-101', productCode: 'PRD-1001', price: 89 } } : { id: 'p1', patch: { descriptionEn: 'A compact mechanical keyboard with quiet switches and a comfortable typing feel.', descriptionKo: '조용한 스위치와 편안한 타건감을 갖춘 컴팩트한 기계식 키보드입니다.' } }, setProducts: { updates: [{ id: 'p1', patch: { price: 80.1 } }] }, setSearch: { patch: { skuContains: 'KEY', maxPrice: 20 } }, setStorefront: { patch: { html: workspace.read('storefront').data.html } }, save: { form: pageAreas[page][0] }, cancel: { form: pageAreas[page][0] }, navigate: { page: 'guide' }, setHighlights: { enabled: false } };
  return JSON.stringify(examples[name] || {}, null, 2);
}
function PromptCard() {
  return <section className="prompt-stage" aria-label="Tutorial prompts"><div className="prompt-avatar"><Sparkles size={25} /></div><div className="speech-bubble"><span className="comic-label">{t('ASK YOUR AI')}</span>{prompts[page].map((text, index) => <div className="prompt-line" key={text}>{prompts[page].length > 1 && <span className="prompt-step">{index + 1}</span>}<p>{t(text)}</p></div>)}</div></section>;
}
function CopyPrompt({ text, label }) {
  const [copied, setCopied] = useState(false);
  return <div className="copy-prompt"><p>{t(text)}</p><Button aria-label={'Copy ' + label} onClick={async () => { try { await navigator.clipboard.writeText(text); setCopied(true); } catch { setCopied(false); } }}>{t(copied ? 'Copied' : 'Copy prompt')}</Button></div>;
}
function Home() {
  return <div className="landing"><div className="landing-heading"><span className="eyebrow">{t('A SHARED WORKSPACE FOR YOU AND YOUR AI')}</span><h1>{t('One website.')}<br />{t('Two collaborators.')}</h1><p>{t('Ask your AI. Watch the page change. Pick up where it leaves off.')}</p></div><img className="hero-banner" src={bannerUrl} alt="A store administrator and a friendly computer character discussing one shared webpage" /><div className="landing-start"><div className="landing-step"><span className="step-number">01</span><div><h2>{t('Help your AI find WebMCP')}</h2><p>{t('Already connected? Skip to the next prompt. Your AI and browser need WebMCP access.')}</p><CopyPrompt text={t(discoveryPrompt)} label="discovery prompt" /></div></div><div className="landing-step"><span className="step-number">02</span><div><h2>{t('Ask what this page can do')}</h2><p>{t('You can ask this on any page.')}</p><CopyPrompt text={t(pagePrompt)} label="page prompt" /></div></div><div className="landing-step"><span className="step-number">03</span><div><h2>{t('Take a tour')}</h2><p>{t('Use the menu to visit each page and try its tutorial prompt with your AI.')}</p><Button type="primary" icon={<ArrowRight size={15} />} onClick={() => report(navigate('product'))}>{t('Try the product editor')}</Button></div></div></div></div>;
}
function DraftStatus({ state, newProduct = false }) { return <Tag color={state.saving ? 'processing' : state.dirty ? 'gold' : undefined}>{t(state.saving ? 'Saving…' : state.dirty ? 'Unsaved changes' : newProduct && !state.data.name ? 'New draft' : 'Saved')}</Tag>; }
function Field({ state, name, label, children, product }) {
  const changed = state.aiFields.includes(product ? product + '.' + name : name);
  return <div className={'field ' + (changed && highlights ? 'ai-field' : '')}><div className="field-label"><label htmlFor={(product || '') + name}>{t(label)}</label>{changed && highlights && <span className="ai-label"><Sparkles size={11} />{t('AI edited')}</span>}</div>{children}</div>;
}
function FormActions({ area, state }) {
  return <div className="form-actions"><Button type="primary" icon={<Save size={15} />} loading={state.saving} onClick={async () => report(await workspace.save(area))}>{t(area === 'newProduct' ? 'Create product' : 'Save changes')}</Button><Button disabled={state.saving} onClick={() => report(workspace.cancel(area))}>{t('Discard')}</Button></div>;
}
function ProductFiles({ state }) {
  return <div className="field reference-files"><div className="field-label"><label htmlFor={productFileInput.id}>{t(productFileInput.label)}</label></div><p id="new-product-files-help" className="muted">{t('Optional. PDF, PNG or JPEG; up to 3 files, 25 MiB each. Selecting files replaces the list and does not upload them.')}</p><input id={productFileInput.id} type="file" multiple={productFileInput.multiple} accept={productFileInput.accept} disabled={state.saving} aria-describedby="new-product-files-help" onChange={event => { const result = workspace.selectProductFiles(event.currentTarget.files); event.currentTarget.value = ''; report(result); }} />{state.files.length ? <ul>{state.files.map((file, index) => <li key={index}><span>{file.name}</span><span className="muted">{file.size.toLocaleString()} {t('bytes')}</span></li>)}</ul> : <p className="muted">{t('No reference files selected.')}</p>}<Button disabled={state.saving || !state.files.length} onClick={() => report(workspace.selectProductFiles([]))}>{t('Clear reference files')}</Button><p className="muted">{t('The list shows this draft’s files. Save keeps them in this tab’s memory only; Discard restores the saved list. Reload clears them.')}</p></div>;
}
function ProductEditor() {
  const isNew = page === 'new', area = isNew ? 'newProduct' : 'catalog', state = workspace.read(area), product = isNew ? state.data : state.data[0], prefix = isNew ? '' : product.id;
  const change = (name, value) => report(isNew ? workspace.set(area, { [name]: value }) : workspace.setProducts([{ id: product.id, patch: { [name]: value } }]));
  return <section className="surface" aria-label="Product details"><div className="surface-heading"><h2>{t(isNew ? 'New product' : 'Product details')}</h2><DraftStatus state={state} newProduct={isNew} /></div><div className="form-body"><Field state={state} name="name" product={prefix} label={t('Product name')}><Input id={prefix + 'name'} value={product.name} maxLength={80} disabled={state.saving} onChange={e => change('name', e.target.value)} /></Field><div className="form-grid"><Field state={state} name="sku" product={prefix} label={t('SKU')}><Input id={prefix + 'sku'} value={product.sku} readOnly={!isNew} maxLength={80} disabled={state.saving} onChange={e => change('sku', e.target.value)} /></Field><Field state={state} name="productCode" product={prefix} label={t('Product code')}><Input id={prefix + 'productCode'} value={product.productCode} readOnly={!isNew} maxLength={80} disabled={state.saving} onChange={e => change('productCode', e.target.value)} /></Field></div><Field state={state} name="price" product={prefix} label={t('Unit price')}><InputNumber id={prefix + 'price'} value={product.price} prefix="$" min={0} max={100000} precision={2} disabled={state.saving} onChange={value => change('price', value)} /></Field><div className="description-grid">{[['descriptionEn', 'English description'], ['descriptionKo', 'Korean description']].map(([name, label]) => <Field key={name} state={state} name={name} product={prefix} label={label}><Input.TextArea id={prefix + name} value={product[name]} maxLength={4000} rows={6} disabled={state.saving} onChange={e => change(name, e.target.value)} /></Field>)}</div>{isNew && <ProductFiles state={state} />}</div><FormActions area={area} state={state} /></section>;
}
function BulkEditor() {
  const state = workspace.read('catalog');
  const change = (id, field, value) => report(workspace.setProducts([{ id, patch: { [field]: value } }]));
  const columns = [{ title: t('Product'), dataIndex: 'name', width: 260 }, { title: 'SKU', dataIndex: 'sku', width: 140, render: value => <code>{value}</code> }, { title: t('Unit price'), width: 190, render: (_, p) => <Field state={state} product={p.id} name="price" label={t('Price for') + ' ' + p.sku}><InputNumber id={p.id + 'price'} value={p.price} prefix="$" min={0} max={100000} precision={2} disabled={state.saving} onChange={value => change(p.id, 'price', value)} /></Field> }];
  return <section className="surface"><div className="surface-heading"><div><h2>{t('Products')}</h2><span className="muted">{state.data.length} {t('products')}</span></div><DraftStatus state={state} /></div><Table className="bulk-table" rowKey="id" columns={columns} dataSource={state.data} pagination={false} scroll={{ x: 590 }} /><FormActions area="catalog" state={state} /></section>;
}
function ProductList() {
  const result = workspace.search();
  const columns = [{ title: 'SKU', dataIndex: 'sku', render: value => <code>{value}</code> }, { title: t('Product'), dataIndex: 'name' }, { title: t('Product code'), dataIndex: 'productCode' }, { title: t('Unit price'), dataIndex: 'price', render: value => '$' + value.toFixed(2) }];
  return <section className="surface"><div className="surface-heading"><h2>{t('Products')}</h2><div className="list-heading-actions"><Tag>{result.count} {t('results')}</Tag><Button type="primary" onClick={() => report(navigate('new'))}>{t('Add product')}</Button></div></div><div className="search-controls"><div><label htmlFor="sku-search">{t('SKU contains')}</label><Input id="sku-search" value={result.filters.skuContains} maxLength={80} allowClear onChange={e => report(workspace.setSearch({ skuContains: e.target.value }))} /></div><div><label htmlFor="price-search">{t('Maximum price')}</label><InputNumber id="price-search" value={result.filters.maxPrice} prefix="$" min={0} max={100000} onChange={value => report(workspace.setSearch({ maxPrice: value }))} /></div><Button onClick={() => report(workspace.setSearch({ skuContains: '', maxPrice: null }))}>{t('Reset')}</Button></div><Table rowKey="id" columns={columns} dataSource={result.data} pagination={false} scroll={{ x: 620 }} /></section>;
}
const previewPolicy = '<meta http-equiv="Content-Security-Policy" content="default-src &#39;none&#39;; img-src https://images.unsplash.com data:; style-src &#39;unsafe-inline&#39;; base-uri &#39;none&#39;; form-action &#39;none&#39;">';
function StorefrontEditor() {
  const state = workspace.read('storefront');
  return <section className="surface"><div className="surface-heading"><h2>{t('Storefront custom HTML')}</h2><DraftStatus state={state} /></div><div className="form-body"><Field state={state} name="html" label={t('HTML / CSS')}><Input.TextArea id="html" className="source-editor" value={state.data.html} rows={12} maxLength={20000} spellCheck={false} disabled={state.saving} onChange={e => report(workspace.set('storefront', { html: e.target.value }))} /></Field><Button icon={<Play size={14} />} onClick={() => report(workspace.previewStorefront())}>{t('Preview')}</Button></div><div className="preview-heading"><h3>{t('Preview')}</h3></div><iframe title={t('Storefront preview')} className="storefront-preview" sandbox="" referrerPolicy="no-referrer" srcDoc={previewPolicy + workspace.getPreview()} /><FormActions area="storefront" state={state} /></section>;
}
function ProjectInfo() {
  return <section className="surface project-info"><Github size={36} strokeWidth={1.4} /><h2>{t('Explore the project on GitHub.')}</h2><a href="https://github.com/linkanyco/WebMCPLite" target="_blank" rel="noreferrer">WebMCPLite<ExternalLink size={15} /></a></section>;
}
function ToolPlayground() {
  const [selected, setSelected] = useState(defaultTool[page]), [args, setArgs] = useState(sample(defaultTool[page])), [running, setRunning] = useState(false);
  const available = registration === 'registered' && inPageSupported(), selectedDefinition = definitions.find(t => t.name === selected);
  async function run() { setRunning(true); try { report(await callTool(selected, JSON.parse(args))); } catch { report(fail('validation', 'Enter a valid JSON object.')); } finally { setRunning(false); } }
  const status = registration === 'pending' ? t('Checking browser support…') : registration === 'failed' ? t('Registration failed.') : registration !== 'registered' ? t('WebMCP is unavailable. Ordinary UI remains usable.') : !inPageSupported() ? t('Tools registered. In-page invocation is unavailable.') : definitions.length + ' ' + t('tools registered · in-page invocation ready');
  return <section className="surface tool-panel" aria-label="WebMCP tool playground"><div className="surface-heading"><h2>{t('Tool playground')}</h2><Tag>document.modelContext</Tag></div><div className="tool-form"><p role="status">{status}</p><label htmlFor="tool-select">{t('Registered tool')}</label><Select id="tool-select" showSearch={{ optionFilterProp: 'label' }} value={selected} disabled={!available || running} options={definitions.map(t => ({ value: t.name, label: t.name }))} onChange={value => { setSelected(value); setArgs(sample(value)); }} /><label htmlFor="tool-args">{t('Arguments')}</label><Input.TextArea id="tool-args" className="source-editor" value={args} disabled={!available || running} rows={6} spellCheck={false} onChange={e => setArgs(e.target.value)} /><Button type="primary" disabled={!available || running} loading={running} onClick={run}>{t('Execute tool')}</Button></div><Tabs items={[{ key: 'result', label: t('Response'), children: <pre className="result-code" aria-live="polite">{lastResult === null ? t('No tool response yet.') : JSON.stringify(lastResult, null, 2)}</pre> }, { key: 'schema', label: t('Input schema'), children: <pre className="result-code">{JSON.stringify(selectedDefinition?.inputSchema, null, 2)}</pre> }]} /></section>;
}
function WorkspaceApp() {
  useSyncExternalStore(subscribe, () => snapshot);
  const current = pages.find(p => p.id === page), commit = document.querySelector('meta[name="build-commit"]')?.content;
  const content = page === 'home' ? <Home /> : page === 'product' || page === 'async' || page === 'new' ? <ProductEditor /> : page === 'bulk' ? <BulkEditor /> : page === 'sheet' ? <ProductList /> : page === 'board' ? <StorefrontEditor /> : <ProjectInfo />;
  return <ConfigProvider locale={language === 'ko' ? koKR : enUS}><div className="app-shell"><aside className="sidebar"><a className="brand" href="?page=home" onClick={e => { e.preventDefault(); report(navigate('home')); }}><span className="brand-mark"><Workflow size={22} /></span><span>WebMCP<span className="brand-lite">Lite</span><small>{t('Human + AI, together')}</small></span></a><nav aria-label="Tutorial pages">{pages.filter(p => p.id !== 'new').map(p => { const Icon = icons[p.id]; return <a key={p.id} href={'?page=' + p.id} aria-current={page === p.id ? 'page' : undefined} onClick={e => { e.preventDefault(); report(navigate(p.id)); }}><Icon size={17} /><span>{t(p.title)}</span></a>; })}</nav><div className="sidebar-bottom"><a className="sidebar-link" href="https://github.com/linkanyco/WebMCPLite" target="_blank" rel="noreferrer"><Github size={16} />GitHub<ExternalLink size={12} /></a><a className="sidebar-link" href="https://webmachinelearning.github.io/webmcp/" target="_blank" rel="noreferrer"><BookOpen size={16} />{t('WebMCP specification')}<ExternalLink size={12} /></a></div></aside><div className="main-shell"><header className="topbar"><div className="breadcrumbs"><span>WebMCPLite</span><ChevronRight size={13} /><strong>{t(current.title)}</strong></div><div className="topbar-actions"><div className="language-switch" role="group" aria-label="Interface language"><button type="button" aria-pressed={language === 'en'} onClick={() => setLanguage('en')}>EN</button><button type="button" aria-pressed={language === 'ko'} onClick={() => setLanguage('ko')}>한국어</button></div><span className="store-label">{t('DEMO STORE')}</span></div></header><main>{page !== 'home' && <PromptCard />}<div className={page === 'home' ? 'home-content' : 'application-stage'}>{notice && <Alert className="app-notice" type={notice.type} showIcon title={t(notice.message)} closable onClose={() => { notice = null; emit(); }} />}<Tabs key={page} defaultActiveKey="workspace" className="workspace-tabs" items={[{ key: 'workspace', label: t(page === 'home' ? 'Welcome' : current.title), children: content }, { key: 'developer', label: t('Developer tools'), children: <ToolPlayground key={page} /> }]} /></div><footer><span>{t('Fictional data · Saved in this tab · Reload to reset')}</span>{commit ? <a href={'https://github.com/linkanyco/WebMCPLite/commit/' + commit} target="_blank" rel="noreferrer">{t('Build')} {commit.slice(0, 7)}<ExternalLink size={11} /></a> : <span>{t('Local preview')}</span>}</footer></main></div></div></ConfigProvider>;
}
createRoot(document.getElementById('root')).render(<LobeConfigProvider motion={motion} locale="en-US"><ThemeProvider defaultAppearance="light" enableCustomFonts={false} customTheme={{ neutralColor: 'slate' }} theme={{ token: { fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', borderRadius: 8, controlHeight: 38 } }}><WorkspaceApp /></ThemeProvider></LobeConfigProvider>);
