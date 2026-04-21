import { buildChain, flattenMachines, flattenRawResources, buildGraphData } from './planner.js';
import { getRecipesForItem, RECIPES } from './data/recipes.js';
import { appData, updateRecipeSelections, updateTodos } from './firebase.js';
import { renderGraph, destroyGraph } from './graph.js';

const RECIPES_BY_ID = Object.fromEntries(RECIPES.map(r => [r.id, r]));
let currentFactory = null;
let currentSubTab = 'plan';
let todoPriority = 'low';
let todoFilter = 'active';

export function openFactory(factory) {
  currentFactory = factory;
  currentSubTab = 'plan';
  document.getElementById('detail-title').textContent = factory.name;
  document.getElementById('detail-subtitle').textContent = factory.outputItem + ' - ' + factory.outputRate + '/min';
  updateDetailCircle();
  const detail = document.getElementById('detail-view');
  detail.classList.remove('hidden');
  requestAnimationFrame(() => detail.classList.add('visible'));
  wireSubTabs();
  switchSubTab('plan');
}

export function closeFactory() {
  const detail = document.getElementById('detail-view');
  detail.classList.remove('visible');
  destroyGraph();
  setTimeout(() => detail.classList.add('hidden'), 300);
  currentFactory = null;
}

export function refreshDetail() {
  if (!currentFactory) return;
  const updated = appData.factories[currentFactory.id];
  if (updated) {
    currentFactory = updated;
    document.getElementById('detail-subtitle').textContent = updated.outputItem + ' - ' + updated.outputRate + '/min';
    updateDetailCircle();
  }
  renderSubTab(currentSubTab);
}

function updateDetailCircle() {
  const el = document.getElementById('detail-progress-circle');
  if (!el || !currentFactory) return;
  const todos = currentFactory.todos || [];
  const done = todos.filter(t => t.done).length;
  const pct = todos.length ? Math.round(done / todos.length * 100) : 0;
  const size = 52, r = (size - 8) / 2, cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct / 100;
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', size); svg.setAttribute('height', size);
  const bg = document.createElementNS(ns, 'circle');
  bg.setAttribute('cx', cx); bg.setAttribute('cy', cy); bg.setAttribute('r', r);
  bg.setAttribute('fill', 'none'); bg.setAttribute('stroke', '#2A2A2A'); bg.setAttribute('stroke-width', '4');
  const arc = document.createElementNS(ns, 'circle');
  arc.setAttribute('cx', cx); arc.setAttribute('cy', cy); arc.setAttribute('r', r);
  arc.setAttribute('fill', 'none'); arc.setAttribute('stroke', '#FF6A00'); arc.setAttribute('stroke-width', '4');
  arc.setAttribute('stroke-dasharray', dash.toFixed(2) + ' ' + circ.toFixed(2));
  arc.setAttribute('stroke-dashoffset', (circ / 4).toFixed(2));
  arc.setAttribute('stroke-linecap', 'round');
  const txt = document.createElementNS(ns, 'text');
  txt.setAttribute('x', cx); txt.setAttribute('y', String(cy + 5));
  txt.setAttribute('text-anchor', 'middle'); txt.setAttribute('fill', '#E8EDF5');
  txt.setAttribute('font-size', '11'); txt.setAttribute('font-family', 'Chakra Petch,sans-serif');
  txt.setAttribute('font-weight', '700'); txt.textContent = pct + '%';
  svg.appendChild(bg); svg.appendChild(arc); svg.appendChild(txt);
  el.textContent = '';
  el.appendChild(svg);
}

function wireSubTabs() {
  document.querySelectorAll('#detail-tabs .tab-btn').forEach(btn => {
    const fresh = btn.cloneNode(true);
    btn.parentNode.replaceChild(fresh, btn);
    fresh.addEventListener('click', () => {
      document.querySelectorAll('#detail-tabs .tab-btn').forEach(b => b.classList.remove('active'));
      fresh.classList.add('active');
      currentSubTab = fresh.dataset.subtab;
      renderSubTab(currentSubTab);
    });
  });
  document.querySelector('#detail-tabs [data-subtab="plan"]').classList.add('active');
}

function switchSubTab(tab) {
  currentSubTab = tab;
  ['plan','graph','todo'].forEach(t => document.getElementById(t + '-panel').classList.toggle('hidden', t !== tab));
  document.querySelectorAll('#detail-tabs .tab-btn').forEach(b => b.classList.toggle('active', b.dataset.subtab === tab));
  renderSubTab(tab);
}

function renderSubTab(tab) {
  ['plan','graph','todo'].forEach(t => document.getElementById(t + '-panel').classList.toggle('hidden', t !== tab));
  if (tab === 'plan') renderPlan();
  if (tab === 'graph') renderGraphTab();
  if (tab === 'todo') renderTodo();
}

// PLAN

function renderPlan() {
  if (!currentFactory) return;
  const f = currentFactory;
  const chain = buildChain(f.outputItem, f.outputRate, f.recipeSelections || {});
  const machines = flattenMachines(chain);
  const rawRes = flattenRawResources(chain);
  const panel = document.getElementById('plan-panel');

  const machineRows = machines.map(m =>
    '<div class="summary-row"><span class="summary-machine">' + esc(m.machine) + '</span><span class="summary-count">x' + m.count.toFixed(2) + '</span></div>'
  ).join('');
  const rawRows = rawRes.map(r =>
    '<div class="summary-row"><span class="summary-resource">' + esc(r.item) + '</span><span class="summary-rate">' + r.ratePerMin.toFixed(2) + '/min</span></div>'
  ).join('');

  panel.innerHTML = '<div id="tree-root"></div>'
    + '<div class="summary-box"><div class="summary-title">MACHINES NEEDED</div>' + machineRows + '</div>'
    + '<div class="summary-box"><div class="summary-title">RAW RESOURCES</div>' + rawRows + '</div>';

  buildTreeDOM(chain, document.getElementById('tree-root'), true, f);

  const gBtn = document.createElement('button');
  gBtn.className = 'view-graph-btn';
  gBtn.textContent = 'View Graph \u2192';
  gBtn.addEventListener('click', () => switchSubTab('graph'));
  const gWrap = document.createElement('div');
  gWrap.className = 'plan-actions';
  gWrap.appendChild(gBtn);
  panel.insertBefore(gWrap, panel.firstChild);
}

function buildTreeDOM(node, container, isRoot, factory) {
  const wrapper = document.createElement('div');
  wrapper.className = 'tree-node';

  const item = document.createElement('div');
  item.className = 'tree-item' + (isRoot ? ' root' : '') + (node.isRaw ? ' raw' : '');

  const nameSpan = document.createElement('span');
  nameSpan.className = 'tree-item-name';
  nameSpan.textContent = node.itemName;

  const rateSpan = document.createElement('span');
  rateSpan.className = 'tree-rate';
  rateSpan.textContent = node.ratePerMin.toFixed(2) + '/min';

  item.appendChild(nameSpan);
  item.appendChild(rateSpan);

  if (!node.isRaw) {
    const alts = getRecipesForItem(node.itemName);
    if (alts.length > 1) {
      const sel = document.createElement('select');
      sel.className = 'recipe-select';
      const currentSel = (factory.recipeSelections || {})[node.itemName] || '';
      if (currentSel && RECIPES_BY_ID[currentSel] && RECIPES_BY_ID[currentSel].alt) {
        sel.classList.add('alt');
      }
      const defaultOpt = document.createElement('option');
      defaultOpt.value = '';
      defaultOpt.textContent = 'Default';
      sel.appendChild(defaultOpt);
      alts.forEach(r => {
        const opt = document.createElement('option');
        opt.value = r.id;
        opt.textContent = r.name;
        if (currentSel === r.id) opt.selected = true;
        sel.appendChild(opt);
      });
      sel.addEventListener('change', () => {
        const newSels = Object.assign({}, factory.recipeSelections || {});
        if (sel.value) newSels[node.itemName] = sel.value; else delete newSels[node.itemName];
        updateRecipeSelections(factory.id, newSels);
      });
      sel.addEventListener('click', e => e.stopPropagation());
      item.appendChild(sel);
    }
  }

  wrapper.appendChild(item);
  if (node.children && node.children.length) {
    const childDiv = document.createElement('div');
    childDiv.className = 'tree-children';
    node.children.forEach(child => buildTreeDOM(child, childDiv, false, factory));
    wrapper.appendChild(childDiv);
  }
  container.appendChild(wrapper);
}

// GRAPH

function renderGraphTab() {
  if (!currentFactory) return;
  const chain = buildChain(currentFactory.outputItem, currentFactory.outputRate, currentFactory.recipeSelections || {});
  const graphData = buildGraphData(chain);
  setTimeout(() => renderGraph('graph-container', graphData), 50);
}

// TO-DO

function renderTodo() {
  if (!currentFactory) return;
  const todos = currentFactory.todos || [];
  const panel = document.getElementById('todo-panel');
  const done = todos.filter(t => t.done).length;

  panel.innerHTML = '<div class="stats-row">'
    + '<div class="stat-box"><div class="stat-box-val" id="td-total" style="color:var(--amber)">' + todos.length + '</div><div class="stat-box-label">TOTAL</div></div>'
    + '<div class="stat-box"><div class="stat-box-val" id="td-done" style="color:var(--green)">' + done + '</div><div class="stat-box-label">DONE</div></div>'
    + '<div class="stat-box"><div class="stat-box-val" id="td-left" style="color:var(--blue)">' + (todos.length - done) + '</div><div class="stat-box-label">LEFT</div></div>'
    + '</div>'
    + (todos.length > 0 ? '<div class="progress-wrap"><div class="progress-pill"><canvas id="td-progress-canvas"></canvas><div class="progress-text" id="td-progress-text"></div></div></div>' : '')
    + '<div class="add-row"><input type="text" class="todo-input" id="td-input" placeholder="e.g. Place 3 Assemblers..." autocomplete="off"><button class="add-btn" id="td-add">+</button></div>'
    + '<div class="priority-row"><span class="priority-label">PRIORITY:</span>'
    + ['low','medium','high'].map(p => '<button class="priority-btn' + (todoPriority === p ? ' sel-' + p : '') + '" data-pri="' + p + '">' + p.toUpperCase().slice(0,3) + '</button>').join('')
    + '</div>'
    + '<div class="pills" id="td-filter-pills" style="margin-bottom:12px"></div>'
    + '<div id="td-list"></div>';

  renderTodoFilter();
  renderTodoList(todos);
  if (todos.length > 0) initProgressCanvas(Math.round(done / todos.length * 100));

  panel.querySelector('#td-add').addEventListener('click', addTodo);
  panel.querySelector('#td-input').addEventListener('keydown', e => { if (e.key === 'Enter') addTodo(); });
  panel.querySelectorAll('.priority-btn').forEach(b => {
    b.addEventListener('click', () => {
      todoPriority = b.dataset.pri;
      panel.querySelectorAll('.priority-btn').forEach(x => x.className = 'priority-btn');
      b.className = 'priority-btn sel-' + todoPriority;
    });
  });
}

function renderTodoFilter() {
  const c = document.getElementById('td-filter-pills');
  if (!c) return;
  c.innerHTML = [['active','Active'],['done','Done'],['all','All']].map(([k,l]) =>
    '<button class="pill ' + (todoFilter === k ? 'active-amber' : '') + '" data-tf="' + k + '">' + l + '</button>'
  ).join('');
  c.querySelectorAll('.pill').forEach(p => p.addEventListener('click', () => {
    todoFilter = p.dataset.tf;
    renderTodoFilter();
    renderTodoList(currentFactory.todos || []);
  }));
}

function renderTodoList(todos) {
  const list = document.getElementById('td-list');
  if (!list) return;
  const filtered = todos.filter(t =>
    todoFilter === 'active' ? !t.done : todoFilter === 'done' ? t.done : true
  );
  if (!filtered.length) {
    list.innerHTML = '<div class="empty-state"><p>' + (todoFilter === 'done' ? 'No completed tasks.' : todoFilter === 'active' ? 'All clear, Pioneer!' : 'Add your first task.') + '</p></div>';
    return;
  }
  list.innerHTML = filtered.map(t =>
    '<div class="todo-item ' + (t.done ? 'done ' : '') + 'pri-' + t.priority + '" data-tid="' + t.id + '">'
    + '<div class="todo-check ' + (t.done ? 'checked' : '') + '" data-action="toggle" data-tid="' + t.id + '">'
    + (t.done ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>' : '')
    + '</div>'
    + '<span class="todo-text">' + esc(t.text) + '</span>'
    + '<span class="todo-pri-tag tag-' + t.priority + '">' + t.priority.slice(0,3).toUpperCase() + '</span>'
    + '<button class="todo-delete" data-action="delete" data-tid="' + t.id + '">'
    + '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>'
    + '</button></div>'
  ).join('');
  list.querySelectorAll('[data-action="toggle"]').forEach(el =>
    el.addEventListener('click', e => { e.stopPropagation(); toggleTodo(Number(el.dataset.tid)); })
  );
  list.querySelectorAll('[data-action="delete"]').forEach(el =>
    el.addEventListener('click', e => { e.stopPropagation(); deleteTodo(Number(el.dataset.tid)); })
  );
}

function addTodo() {
  const input = document.getElementById('td-input');
  const text = input && input.value.trim();
  if (!text || !currentFactory) return;
  const todos = [{ id: Date.now(), text, priority: todoPriority, done: false }, ...(currentFactory.todos || [])];
  input.value = '';
  updateTodos(currentFactory.id, todos);
}

function toggleTodo(id) {
  if (!currentFactory) return;
  const todos = (currentFactory.todos || []).map(t => t.id === id ? Object.assign({}, t, { done: !t.done }) : t);
  updateTodos(currentFactory.id, todos);
}

function deleteTodo(id) {
  if (!currentFactory) return;
  updateTodos(currentFactory.id, (currentFactory.todos || []).filter(t => t.id !== id));
}

function esc(s) { const d = document.createElement('div'); d.textContent = String(s); return d.innerHTML; }

let _progTarget = 0, _progCurrent = 0, _progRAF = null;

function initProgressCanvas(pct) {
  _progTarget = pct;
  if (_progRAF) return;
  _progRAF = requestAnimationFrame(_animateProgress);
}

function _animateProgress() {
  const canvas = document.getElementById('td-progress-canvas');
  if (!canvas) { _progRAF = null; return; }

  const diff = _progTarget - _progCurrent;
  _progCurrent += Math.abs(diff) > 0.1 ? diff * 0.08 : diff;

  const pill = canvas.parentElement;
  const W = canvas.width = Math.round(pill.offsetWidth);
  const H = canvas.height = Math.round(pill.offsetHeight);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);

  const textEl = document.getElementById('td-progress-text');
  if (textEl) textEl.textContent = Math.round(_progTarget) + '% complete';

  if (_progCurrent > 0) {
    const fillX = W * _progCurrent / 100;
    const t = Date.now() / 1000;
    const done = _progCurrent >= 99.5;
    const waveAmp = done ? 0 : 3, waveFreq = 0.14;
    const r = H / 2;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(r, 0); ctx.lineTo(W - r, 0);
    ctx.arcTo(W, 0, W, H, r); ctx.lineTo(W, H - r);
    ctx.arcTo(W, H, W - r, H, r); ctx.lineTo(r, H);
    ctx.arcTo(0, H, 0, H - r, r); ctx.lineTo(0, r);
    ctx.arcTo(0, 0, r, 0, r);
    ctx.closePath();
    ctx.clip();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(fillX, 0);
    for (let y = 0; y <= H + 1; y++) ctx.lineTo(fillX + Math.sin(y * waveFreq + t * 2.2) * waveAmp, y);
    ctx.lineTo(0, H);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, 0, fillX, 0);
    g.addColorStop(0, '#CC4400'); g.addColorStop(0.5, '#FF6A00'); g.addColorStop(1, '#FF8C30');
    ctx.fillStyle = g; ctx.fill();

    const gloss = ctx.createLinearGradient(0, 0, 0, H * 0.45);
    gloss.addColorStop(0, 'rgba(255,255,255,0.13)'); gloss.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gloss; ctx.fillRect(0, 0, fillX, H * 0.45);

    if (!done) {
      [{bx:0.08,by:0.6,r:2,s:0.55,p:0},{bx:0.22,by:0.7,r:1.6,s:0.4,p:1.2},
       {bx:0.38,by:0.5,r:1.8,s:0.75,p:2.1},{bx:0.55,by:0.65,r:1.3,s:0.5,p:0.7},
       {bx:0.72,by:0.55,r:2,s:0.65,p:1.5}].forEach(b => {
        const bx = fillX * b.bx;
        if (bx > fillX - 4) return;
        const rawY = b.by * H - ((t * b.s + b.p) % 1) * H;
        ctx.beginPath(); ctx.arc(bx, ((rawY % H) + H) % H, b.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.fill();
      });
      const eg = ctx.createLinearGradient(fillX - 10, 0, fillX + 14, 0);
      eg.addColorStop(0, 'rgba(255,130,0,0)'); eg.addColorStop(0.5, 'rgba(255,160,60,0.5)'); eg.addColorStop(1, 'rgba(255,106,0,0)');
      ctx.fillStyle = eg; ctx.fillRect(fillX - 10, 0, 24, H);
    }
    ctx.restore();
  }

  _progRAF = requestAnimationFrame(_animateProgress);
}