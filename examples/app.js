import { connectTools } from '../src/connect.js';
import { createWorkspace, pageAreas, fail } from './workspace.js';
import { buildTools, pages } from './tools.js';
const $ = selector => document.querySelector(selector);
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
let page = new URL(location.href).searchParams.get('page') || 'product';
if (!pages.some(p => p.id === page)) page = 'product';
let entry = Number.isInteger(history.state?.liteEntry) ? history.state.liteEntry : 0;
let restoring = false, bridge, highlights = true, failNext = true;
const workspace = createWorkspace({ onChange: () => renderEditor() });
history.replaceState({ litePage: page, liteEntry: entry }, '', `?page=${page}`);
const show = value => { $('#result').textContent = JSON.stringify(value, null, 2); return value; };
const notice = message => { $('#notice').textContent = message; };
function canLeave() {
  const state = workspace.unsaved(page);
  if (state.unsaved || state.busy) { notice('이동할 수 없습니다. 현재 페이지의 각 폼을 저장하거나 취소하세요.'); return false; }
  return true;
}
function navigate(target) {
  if (!pages.some(p => p.id === target)) return fail('not_found', 'Unknown page.');
  if (target === page) return { ok: true, page };
  if (!canLeave()) return { ...fail('unsaved', 'Save or cancel every current-page form before leaving.'), state: workspace.unsaved(page) };
  page = target; entry++; history.pushState({ litePage: page, liteEntry: entry }, '', `?page=${page}`);
  activate(); return { ok: true, page };
}
window.addEventListener('popstate', event => {
  if (restoring) { restoring = false; return; }
  const target = event.state;
  if (!target || !pages.some(p => p.id === target.litePage)) return;
  if (!canLeave()) {
    restoring = true; history.go(entry - target.liteEntry); return;
  }
  page = target.litePage; entry = target.liteEntry; activate();
});
window.addEventListener('beforeunload', event => {
  const state = workspace.unsaved(page);
  if (state.unsaved || state.busy) { event.preventDefault(); event.returnValue = ''; }
});
function mark(state, field) { return state.aiFields.includes(field) ? ' class="ai-changed"' : ''; }
function badge(state, field) { return state.aiFields.includes(field) ? '<span class="ai-label">AI 변경</span>' : ''; }
function input(state, area, field, label, { product, type = 'text', value = state.data[field] } = {}) {
  const key = product ? `${product}.${field}` : field;
  return `<label>${label}${badge(state, key)}<input data-area="${area}" data-field="${field}" ${product ? `data-product="${product}"` : ''} type="${type}" ${type === 'number' ? 'min="0" max="100000" step="any"' : `maxlength="${area.startsWith('guide') ? 500 : 80}"`} value="${escape(value)}"${mark(state, key)}></label>`;
}
function stateLine(state) {
  return `<span class="state ${state.dirty ? 'dirty' : ''}">${state.saving ? '저장 중…' : state.dirty ? '미저장 초안' : '탭에 저장된 상태'}</span><span class="revision">revision ${state.revision}</span>`;
}
function actions(id, state) {
  return `<div class="actions"><button class="primary" data-action="save" data-area="${id}" ${state.saving ? 'disabled' : ''}>탭에 저장</button><button data-action="cancel" data-area="${id}" ${state.saving ? 'disabled' : ''}>변경 취소</button></div><p>저장은 이 탭 메모리만 갱신합니다. 새로고침하면 초기화됩니다.</p>`;
}
function renderEditor() {
  const active = document.activeElement;
  const identity = active?.dataset && (active.dataset.field || active.dataset.row !== undefined) ? { row: active.dataset.row, area: active.dataset.area, field: active.dataset.field, product: active.dataset.product, start: active.selectionStart, end: active.selectionEnd } : null;
  const heading = pages.find(p => p.id === page);
  let body = `<p class="eyebrow">${String(pages.findIndex(p => p.id === page) + 1).padStart(2, '0')} / SHARED EDITOR</p><h2>${heading.title}</h2><p>${heading.purpose}</p>`;
  if (page === 'product' || page === 'async') {
    const id = page === 'async' ? 'asyncProduct' : 'catalog', state = workspace.read(id);
    const product = page === 'async' ? state.data : state.data[0];
    body += `${stateLine(state)}<p>${product.styleA} · 제품 ${product.id}</p><fieldset ${state.saving ? 'disabled' : ''}>`;
    for (const [field, label] of [['name', '제품 이름'], ['price', '가격'], ['material', '소재']]) body += input(state, id, field, label, { product: page === 'async' ? undefined : product.id, type: field === 'price' ? 'number' : 'text', value: product[field] });
    if (page === 'async') body += `<label><input id="fail-next" type="checkbox" ${failNext ? 'checked' : ''}> 다음 저장 실패 재현 (성공하려면 끄세요)</label><p>저장에는 약 0.7초가 걸립니다. 진행 중에는 편집·취소·중복 저장이 잠깁니다.</p>`;
    body += `${actions(id, state)}</fieldset>`;
  }
  if (page === 'bulk') {
    const state = workspace.read('catalog'); body += stateLine(state);
    body += `<fieldset ${state.saving ? 'disabled' : ''}><div class="table-wrap"><table><thead><tr><th>스타일</th><th>제품 이름</th><th>가격</th></tr></thead><tbody>`;
    for (const p of state.data) body += `<tr><td>${p.styleA}</td><td>${input(state, 'catalog', 'name', '이름', { product: p.id, value: p.name })}</td><td>${input(state, 'catalog', 'price', '가격', { product: p.id, value: p.price, type: 'number' })}</td></tr>`;
    body += `</tbody></table></div>${actions('catalog', state)}</fieldset>`;
  }
  if (page === 'sheet') {
    const state = workspace.read('sheet'), catalog = workspace.read('catalog').data;
    body += `${stateLine(state)}<fieldset ${state.saving ? 'disabled' : ''}>${input(state, 'sheet', 'title', '라인시트 이름')}<label>표시할 제품 번호${badge(state, 'numberType')}<select data-area="sheet" data-field="numberType"${mark(state, 'numberType')}><option value="A" ${state.data.numberType === 'A' ? 'selected' : ''}>번호 A</option><option value="B" ${state.data.numberType === 'B' ? 'selected' : ''}>번호 B</option></select></label><div class="table-wrap"><table${mark(state, 'rows')}><thead><tr><th>제품 번호</th><th>제품</th><th>수량</th><th>순서</th></tr></thead><tbody>`;
    state.data.rows.forEach((row, index) => {
      const p = catalog.find(p => p.id === row.productId);
      body += `<tr><td data-displayed-style>${escape(p[`style${state.data.numberType}`])}</td><td>${escape(p.name)}</td><td><label>수량<input type="number" min="1" max="999" data-row="${index}" value="${row.quantity}"></label></td><td><div class="row-actions"><button data-move="${index}" data-direction="-1" ${index === 0 ? 'disabled' : ''} aria-label="${p.name} 위로">↑</button><button data-move="${index}" data-direction="1" ${index === state.data.rows.length - 1 ? 'disabled' : ''} aria-label="${p.name} 아래로">↓</button></div></td></tr>`;
    });
    body += `</tbody></table></div><p>미리보기에는 선택한 번호만 나옵니다. getProduct로 다른 번호와 소재를 읽을 수 있습니다.</p>${actions('sheet', state)}</fieldset>`;
  }
  if (page === 'board') {
    const state = workspace.read('board'); body += `${stateLine(state)}<fieldset ${state.saving ? 'disabled' : ''}>${input(state, 'board', 'title', '보드 제목')}<label>메모${badge(state, 'note')}<textarea data-area="board" data-field="note" maxlength="500"${mark(state, 'note')}>${escape(state.data.note)}</textarea></label>${actions('board', state)}</fieldset>`;
  }
  if (page === 'guide') {
    body += '<p>두 영역 중 하나라도 미저장이면 이동을 막습니다. page_manual과 site_map을 호출해 보세요.</p>';
    for (const [index, id] of pageAreas.guide.entries()) {
      const state = workspace.read(id);
      body += `<section class="guide-form"><h3>편집 영역 ${index + 1} · ${id}</h3>${stateLine(state)}<fieldset ${state.saving ? 'disabled' : ''}>${input(state, id, 'text', '안내 메모')}${actions(id, state)}</fieldset></section>`;
    }
  }
  $('#editor').innerHTML = body;
  if (identity) {
    const field = [...$('#editor').querySelectorAll('[data-field], [data-row]')].find(e => identity.row !== undefined ? e.dataset.row === identity.row : e.dataset.area === identity.area && e.dataset.field === identity.field && e.dataset.product === identity.product);
    if (field) { field.focus({ preventScroll: true }); if (identity.start !== null && ['text', 'textarea'].includes(field.type)) field.setSelectionRange(identity.start, identity.end); }
  }
}
function changeField(event) {
  const element = event.target;
  if (element.id === 'fail-next') { failNext = element.checked; return; }
  if (element.dataset.row !== undefined) {
    const state = workspace.read('sheet'), rows = state.data.rows;
    rows[Number(element.dataset.row)].quantity = Number(element.value);
    const result = workspace.set('sheet', { rows }, state.revision);
    if (!result.ok) { notice(result.error.message); renderEditor(); } return;
  }
  const { area, field, product } = element.dataset; if (!field) return;
  const value = element.type === 'number' ? (element.value === '' ? NaN : Number(element.value)) : element.value;
  const state = workspace.read(area);
  const result = product ? workspace.setProducts([{ id: product, patch: { [field]: value } }], state.revision) : workspace.set(area, { [field]: value }, state.revision);
  if (!result.ok) { notice(result.error.message); renderEditor(); } else notice('공유 초안에 반영했습니다.');
}
$('#editor').addEventListener('input', changeField);
$('#editor').addEventListener('click', async event => {
  const button = event.target.closest('button'); if (!button) return;
  if (button.dataset.move !== undefined) {
    const state = workspace.read('sheet'), rows = state.data.rows, index = Number(button.dataset.move), other = index + Number(button.dataset.direction);
    [rows[index], rows[other]] = [rows[other], rows[index]];
    show(workspace.set('sheet', { rows }, state.revision)); return;
  }
  if (button.dataset.action) {
    const form = button.dataset.area;
    show(await bridge.call(button.dataset.action, { form, expectedRevision: workspace.read(form).revision }));
  }
});
function activate() {
  bridge?.dispose(); notice('');
  $('#pages').innerHTML = pages.map(p => `<a href="?page=${p.id}" data-page="${p.id}" ${p.id === page ? 'aria-current="page"' : ''}>${p.title}</a>`).join('');
  renderEditor();
  bridge = connectTools(buildTools({ workspace, page, navigate, getTools: () => bridge.list(), setHighlights: enabled => {
    highlights = enabled; document.body.classList.toggle('hide-highlights', !enabled); $('#highlights').checked = enabled; return { ok: true, enabled };
  }, saveOptions: () => page === 'async' ? { latency: 700, shouldFail: failNext } : {} }));
  window.webmcpLite = bridge;
  const owner = bridge;
  $('#native-status').textContent = '네이티브 WebMCP 등록 확인 중…';
  bridge.ready.then(states => {
    if (owner !== bridge) return;
    $('#native-status').textContent = states.every(s => s.state === 'registered') ? '네이티브 등록 완료 · 실제 에이전트 호출은 별도 확인' : states.some(s => s.state === 'failed') ? '네이티브 등록 실패 · JS 직접 호출 사용 가능' : '네이티브 WebMCP 미지원 · JS 직접 호출 사용 가능';
  });
  $('#tool').innerHTML = bridge.list().map(t => `<option>${t.name}</option>`).join('');
  $('#tool').value = page === 'bulk' ? 'getProducts' : page === 'sheet' ? 'getSheet' : page === 'board' ? 'getBoard' : page === 'guide' ? 'getNotes' : 'getProduct';
  selectTool(); $('#result').textContent = '아직 호출하지 않았습니다.';
  $('#scenario').textContent = { product: '제품 이름·가격을 수정하고 직접 이어서 편집하세요.', bulk: '두 제품의 가격을 한 번에 수정합니다.', sheet: '제품 번호 B를 조회한 뒤 B 번호로 표시합니다.', board: '보드 제목과 메모를 고칩니다.', guide: '두 번째 영역을 수정한 뒤 이동을 시도하세요.', async: '가격 수정 → 저장 실패 → 실패 토글 끄기 → 재시도.' }[page];
}
const examples = () => {
  const area = pageAreas[page][0], rev = workspace.read(area).revision;
  const id = page === 'async' ? 'p3' : 'p1';
  return { getProduct: { id }, setProduct: { id, patch: { name: 'AI와 함께 만든 제품' }, expectedRevision: rev }, setProducts: { updates: [{ id: 'p1', patch: { price: 50 } }], expectedRevision: rev }, setSheet: { patch: { numberType: 'B' }, expectedRevision: rev }, setBoard: { patch: { title: '함께 정리한 보드' }, expectedRevision: rev }, setNote: { form: 'guideDetails', patch: { text: 'AI가 수정한 안내' }, expectedRevision: workspace.read('guideDetails').revision }, save: { form: area, expectedRevision: rev }, cancel: { form: area, expectedRevision: rev }, navigate: { page: page === 'board' ? 'product' : 'board' }, setHighlights: { enabled: false }, isUnsavedContents: { form: null } };
};
function selectTool() {
  const tool = bridge.list().find(t => t.name === $('#tool').value);
  $('#args').value = JSON.stringify(examples()[tool.name] || {}, null, 2);
  $('#schema').textContent = JSON.stringify(tool, null, 2);
}
$('#tool').addEventListener('change', selectTool);
$('#run').addEventListener('click', async () => {
  let input; try { input = JSON.parse($('#args').value); } catch { show(fail('validation', '입력 JSON을 확인하세요.')); return; }
  show(await bridge.call($('#tool').value, input));
});
$('#highlights').addEventListener('change', async event => show(await bridge.call('setHighlights', { enabled: event.target.checked })));
$('#pages').addEventListener('click', event => { const link = event.target.closest('a'); if (link) { event.preventDefault(); show(navigate(link.dataset.page)); } });
$('.brand').addEventListener('click', event => { event.preventDefault(); show(navigate('product')); });
$('#demo').addEventListener('click', async () => {
  const call = (name, input) => bridge.call(name, input);
  if (page === 'bulk') { const state = await call('getProducts', {}); show(await call('setProducts', { updates: [{ id: 'p1', patch: { price: 48 } }, { id: 'p2', patch: { price: 92 } }], expectedRevision: state.revision })); }
  else if (page === 'sheet') { const product = await call('getProduct', { id: 'p1' }); const state = await call('getSheet', {}); show({ relatedProduct: product, edit: await call('setSheet', { patch: { numberType: 'B' }, expectedRevision: state.revision }) }); }
  else if (page === 'board') { const state = await call('getBoard', {}); show(await call('setBoard', { patch: { title: 'AI와 함께 만든 보드', note: '사람이 이 메모를 이어서 편집할 수 있습니다.' }, expectedRevision: state.revision })); }
  else if (page === 'guide') { const state = await call('getNotes', {}); show(await call('setNote', { form: 'guideDetails', patch: { text: '두 번째 편집 영역의 AI 변경' }, expectedRevision: state.forms.guideDetails.revision })); }
  else { const id = page === 'async' ? 'p3' : 'p1', state = await call('getProduct', { id }); show(await call('setProduct', { id, patch: { name: 'AI와 함께 만든 제품', price: 55 }, expectedRevision: state.revision })); }
});
activate();
