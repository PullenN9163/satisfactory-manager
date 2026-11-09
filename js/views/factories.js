import { h, icon, mount, ring, liquidBar, setLiquid, openSheet, confirmSheet, toast, celebrate, timeAgo, debounce } from '../core/ui.js';
import { write, touchFactory, newFactoryId, getState } from '../core/store.js';
import { go } from '../core/router.js';
import { getRecipesForItem } from '../data/recipes.js';
import { fmt, fmtMW, buildGraphData } from '../planner.js';
import { renderGraph, destroyGraph, fitGraph, zoomGraph, GRAPH_THEME } from '../graph.js';
import { planOf, factoryProgress, itemBadge, machineTag, emptyState, sectionHead } from './common.js';
import { openNewFactory } from './new-factory.js';

const listUI = { q: '', sort: 'recent' };
const taskUI = { priority: 'medium', filter: 'active' };

export function createFactories(el) {
  let state = getState();
  let route = { id: null, sub: 'plan' };
  let detail = null; // { id, ...handles }

  const search = h('input', { class: 'input search', type: 'search', placeholder: 'Find a factory…', value: listUI.q, 'aria-label': 'Search factories' });
  search.addEventListener('input', debounce(() => { listUI.q = search.value; renderList(); }, 80));
  const sortSel = h('div', { class: 'seg-group sm' });
  const listBody = h('div', { class: 'factory-list' });
  const listPane = h('aside', { class: 'pane list-pane' },
    h('header', { class: 'page-head' },
      h('div', null, h('h1', { class: 'page-title' }, 'Factories'), h('div', { class: 'muted small', id: 'fl-count' })),
      h('button', { class: 'btn primary hazard sm', onclick: () => openNewFactory() }, icon('plus', 16), 'New')),
    h('div', { class: 'toolbar' }, h('div', { class: 'search-wrap' }, icon('search', 18, 'search-icon'), search), sortSel),
    listBody);
  const detailPane = h('section', { class: 'pane detail-pane' });
  const split = h('div', { class: 'split' }, listPane, detailPane);
  mount(el, split);

  // ── LIST
  function renderList() {
    mount(sortSel, [['recent', 'Recent'], ['name', 'A–Z'], ['progress', 'Progress']].map(([k, l]) =>
      h('button', { class: 'seg' + (listUI.sort === k ? ' on' : ''), onclick: () => { listUI.sort = k; renderList(); } }, l)));
    const q = listUI.q.trim().toLowerCase();
    let fs = Object.values(state.data.factories);
    el.querySelector('#fl-count').textContent = fs.length + ' factor' + (fs.length === 1 ? 'y' : 'ies');
    if (q) fs = fs.filter(f => f.name.toLowerCase().includes(q) || f.outputItem.toLowerCase().includes(q));
    fs.sort(listUI.sort === 'name' ? (a, b) => a.name.localeCompare(b.name)
      : listUI.sort === 'progress' ? (a, b) => factoryProgress(b).pct - factoryProgress(a).pct
      : (a, b) => b.updatedAt - a.updatedAt);
    if (!fs.length) {
      mount(listBody, emptyState({ title: q ? 'No matches' : 'No factories yet', text: q ? 'Try another search.' : 'Plan your first build — pick an item and a rate.',
        action: q ? null : h('button', { class: 'btn primary hazard', onclick: () => openNewFactory() }, icon('plus', 18), 'New factory') }));
      return;
    }
    mount(listBody, fs.map(f => {
      const p = planOf(f), pr = factoryProgress(f);
      return h('button', { class: 'factory-row' + (f.id === route.id ? ' active' : ''), onclick: () => go('factories/' + f.id + '/' + (route.id === f.id ? route.sub : 'plan')) },
        itemBadge(f.outputItem, 'lg'),
        h('div', { class: 'fr-body' },
          h('div', { class: 'fr-name' }, f.name),
          h('div', { class: 'muted small' }, `${f.outputItem} · ${fmt(f.outputRate)}/min`),
          h('div', { class: 'fm-meta' }, h('span', null, icon('factory', 13), p.totalBuildings), h('span', null, icon('bolt', 13), fmtMW(p.totalPower)),
            pr.total ? h('span', null, icon('tasks', 13), `${pr.done}/${pr.total}`) : null, h('span', { class: 'muted' }, timeAgo(f.updatedAt)))),
        ring(pr.pct, { size: 42, stroke: 4, label: pr.total ? undefined : '—' }));
    }));
  }

  // ── DETAIL
  function renderDetail() {
    const f = route.id && state.data.factories[route.id];
    split.classList.toggle('has-sel', !!route.id);
    if (!f) {
      if (detail) { destroyGraph(); detail = null; }
      mount(detailPane, route.id
        ? emptyState({ iconName: 'warn', title: 'Factory not found', text: 'It may have been deleted on another device.', action: h('button', { class: 'btn ghost', onclick: () => go('factories') }, 'Back to list') })
        : emptyState({ iconName: 'factory', title: 'Select a factory', text: 'Choose a factory on the left, or plan a new one.', action: h('button', { class: 'btn primary hazard', onclick: () => openNewFactory() }, icon('plus', 18), 'New factory') }));
      return;
    }
    if (!detail || detail.id !== f.id) buildDetailShell(f);
    renderHeader(f);
    renderTabs();
    renderBody(f);
  }

  function buildDetailShell(f) {
    destroyGraph();
    const head = h('header', { class: 'detail-head' });
    const tabs = h('nav', { class: 'seg-group tabs', role: 'tablist' });
    const body = h('div', { class: 'detail-body' });
    // persistent task input (survives remote re-renders)
    const taskInput = h('input', { class: 'input', placeholder: 'Add a task… e.g. “Run Mk.3 belt to iron node”', maxLength: 200, 'aria-label': 'New task' });
    taskInput.addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });
    detail = { id: f.id, head, tabs, body, taskInput, graphKey: null, panes: {} };
    mount(detailPane, h('div', { class: 'detail-top' }, head, tabs), body);
  }

  function renderHeader(f) {
    const pr = factoryProgress(f);
    mount(detail.head,
      h('button', { class: 'icon-btn back-only', 'aria-label': 'Back to factories', onclick: () => go('factories') }, icon('back', 22)),
      itemBadge(f.outputItem, 'lg'),
      h('div', { class: 'dh-title' },
        h('h1', { class: 'dh-name' }, f.name),
        h('div', { class: 'muted small' }, `${f.outputItem} @ `, h('b', { class: 'amber' }, fmt(f.outputRate) + '/min'))),
      h('div', { class: 'dh-actions' },
        h('button', { class: 'icon-btn', 'aria-label': 'Edit factory', title: 'Edit', onclick: () => editFactory(f) }, icon('edit', 20)),
        h('button', { class: 'icon-btn', 'aria-label': 'Duplicate factory', title: 'Duplicate', onclick: () => duplicate(f) }, icon('copy', 20)),
        h('button', { class: 'icon-btn danger', 'aria-label': 'Delete factory', title: 'Delete', onclick: () => remove(f) }, icon('trash', 20))),
      ring(pr.pct, { size: 54, stroke: 5, label: pr.total ? undefined : '—' }));
  }

  function renderTabs() {
    mount(detail.tabs, [['plan', 'Plan', 'list'], ['graph', 'Graph', 'graph'], ['tasks', 'Tasks', 'tasks']].map(([k, l, ic]) =>
      h('button', { class: 'seg' + (route.sub === k ? ' on' : ''), role: 'tab', 'aria-selected': String(route.sub === k), onclick: () => go(`factories/${route.id}/${k}`, { replace: true }) }, icon(ic, 16), l)));
  }

  function renderBody(f) {
    if (route.sub !== 'graph') { destroyGraph(); detail.graphKey = null; }
    if (route.sub === 'graph') return renderGraphPane(f);
    if (route.sub === 'tasks') return renderTasks(f);
    return renderPlan(f);
  }

  // ── PLAN
  function renderPlan(f) {
    const p = planOf(f);
    const rawMax = p.raw.length ? p.raw[0].rate : 1;
    const main = document.getElementById('view');
    const y1 = detailPane.scrollTop, y2 = main.scrollTop;
    mount(detail.body, h('div', { class: 'plan' },
      h('div', { class: 'stat-grid four' },
        h('div', { class: 'stat' }, h('div', { class: 'stat-value' }, p.totalBuildings), h('div', { class: 'stat-label' }, 'Buildings')),
        h('div', { class: 'stat' }, h('div', { class: 'stat-value amber' }, fmtMW(p.totalPower)), h('div', { class: 'stat-label' }, 'Power')),
        h('div', { class: 'stat' }, h('div', { class: 'stat-value green' }, fmt(p.raw.reduce((a, r) => a + r.rate, 0))), h('div', { class: 'stat-label' }, 'Raw / min')),
        h('div', { class: 'stat' }, h('div', { class: 'stat-value blue' }, p.steps.length), h('div', { class: 'stat-label' }, 'Steps'))),
      p.warnings.length ? h('div', { class: 'warn-box' }, icon('warn', 18), h('ul', null, p.warnings.map(w => h('li', null, w)))) : null,
      sectionHead('Build list', h('span', { class: 'muted small' }, 'Bottom-up build order')),
      h('div', { class: 'step-list' }, p.steps.map(s => stepCard(f, s))),
      h('div', { class: 'plan-cols' },
        h('section', { class: 'card' }, sectionHead('Raw resources'),
          h('div', { class: 'bars' }, p.raw.map(r => h('div', { class: 'bar-row' },
            h('span', { class: 'bar-label' }, itemBadge(r.item, 'xs'), r.item),
            h('span', { class: 'bar green' }, h('i', { style: { width: Math.max(3, r.rate / rawMax * 100) + '%' } })),
            h('span', { class: 'bar-val' }, fmt(r.rate)), h('span', { class: 'transport' + (r.transport.ok ? '' : ' bad') }, transportLabel(r.transport)))))),
        h('section', { class: 'card' }, sectionHead('Machines'),
          p.machines.map(m => h('div', { class: 'kv' }, machineTag(m.machine), h('span', { class: 'mono' }, `${m.buildings}× · ${fmtMW(m.power)}`))),
          p.byproducts.length ? [h('div', { class: 'field-label', style: { marginTop: '14px' } }, 'Byproducts'),
            p.byproducts.map(b => h('div', { class: 'kv' }, h('span', null, itemBadge(b.item, 'xs'), ' ', b.item), h('span', { class: 'mono amber' }, fmt(b.rate) + '/min')))] : null)),
      h('details', { class: 'card tree-card' }, h('summary', null, icon('down', 16), 'Production tree'), treeNode(p.chain, true)),
      h('div', { class: 'btn-row' },
        h('button', { class: 'btn ghost', onclick: () => go(`factories/${f.id}/graph`, { replace: true }) }, icon('graph', 18), 'View graph'),
        h('button', { class: 'btn ghost', onclick: () => { generateTasks(f); go(`factories/${f.id}/tasks`, { replace: true }); } }, icon('tasks', 18), 'Generate build tasks'))));
    detailPane.scrollTop = y1; main.scrollTop = y2;
  }

  function stepCard(f, s) {
    const options = getRecipesForItem(s.item);
    const isRoot = s.item === f.outputItem;
    return h('div', { class: 'step' + (isRoot ? ' root' : '') + (s.recipe.alt ? ' alt' : '') },
      itemBadge(s.item, 'md'),
      h('div', { class: 'step-main' },
        h('div', { class: 'step-title' }, h('span', { class: 'strong' }, s.item), h('span', { class: 'mono muted' }, fmt(s.rate) + '/min')),
        h('div', { class: 'step-sub' }, machineTag(s.recipe.machine), h('b', null, `× ${s.buildings}`),
          h('span', { class: 'muted small' }, `@ ${fmt(s.clock)}%`), h('span', { class: 'muted small' }, icon('bolt', 12), fmtMW(s.power)),
          h('span', { class: 'transport' + (s.transport.ok ? '' : ' bad') }, transportLabel(s.transport)))),
      options.length > 1
        ? h('button', { class: 'recipe-pick' + (s.recipe.alt ? ' alt' : ''), onclick: () => pickRecipe(f, s.item) }, h('span', null, s.recipe.name), icon('down', 14))
        : h('span', { class: 'recipe-fixed muted small' }, s.recipe.name));
  }

  function treeNode(n, root) {
    const label = h('span', { class: 'tn-label' }, itemBadge(n.item, 'xs'), h('span', null, n.item), h('span', { class: 'mono muted' }, fmt(n.rate) + '/min'),
      n.isRaw ? h('span', { class: 'tag green' }, 'raw') : h('span', { class: 'muted small' }, `${fmt(n.machines)}× ${n.recipe.machine}`));
    if (n.isRaw || !n.children.length) return h('div', { class: 'tn leaf' }, label);
    return h('details', { class: 'tn', open: root || undefined }, h('summary', null, label), h('div', { class: 'tn-kids' }, n.children.map(c => treeNode(c))));
  }

  function pickRecipe(f, item) {
    const options = getRecipesForItem(item);
    const current = (f.recipeSelections || {})[item] || options.find(o => !o.alt)?.id;
    const s = openSheet({
      title: `Recipe for ${item}`,
      body: h('div', { class: 'pick-list' }, options.map(r => h('button', { class: 'pick' + (r.id === current ? ' on' : ''), onclick: () => {
        const sels = { ...(f.recipeSelections || {}) };
        if (!r.alt && options.filter(o => !o.alt)[0]?.id === r.id) delete sels[item]; else sels[item] = r.id;
        touchFactory(f.id, { recipeSelections: sels });
        s.close();
        toast(`${item} now uses ${r.name}`, { type: 'success' });
      } },
        h('div', { class: 'pick-head' }, h('b', null, r.name), r.alt ? h('span', { class: 'tag alt' }, 'ALT') : h('span', { class: 'tag' }, 'Standard'), machineTag(r.machine), r.id === current ? icon('check', 18, 'amber') : null),
        h('div', { class: 'muted small' }, r.inputs.map(i => `${i.qty} ${i.item}`).join(' + '), '  →  ', r.outputs.map(o => `${o.qty} ${o.item}`).join(' + '), `  ·  ${r.time}s`),
        r.notes ? h('div', { class: 'small note' }, r.notes) : null))),
    });
  }

  // ── GRAPH
  function renderGraphPane(f) {
    const p = planOf(f);
    const key = f.outputItem + f.outputRate + JSON.stringify(f.recipeSelections);
    if (detail.graphKey === key && detail.body.querySelector('.graph-box')) return;
    detail.graphKey = key;
    const box = h('div', { class: 'graph-box' }, h('div', { class: 'graph-loading muted' }, 'Loading graph…'));
    mount(detail.body, h('div', { class: 'graph-wrap' },
      h('div', { class: 'graph-tools' },
        h('button', { class: 'icon-btn', 'aria-label': 'Zoom in', onclick: () => zoomGraph(1.25) }, icon('plus', 18)),
        h('button', { class: 'icon-btn', 'aria-label': 'Zoom out', onclick: () => zoomGraph(0.8) }, h('span', { class: 'minus' }, '−')),
        h('button', { class: 'icon-btn', 'aria-label': 'Fit to screen', onclick: fitGraph }, icon('fit', 18))),
      h('div', { class: 'graph-legend small' }, h('span', { class: 'lg root' }, 'Output'), h('span', { class: 'lg step' }, 'Step'), h('span', { class: 'lg raw' }, 'Raw')),
      box));
    requestAnimationFrame(() => renderGraph(box, buildGraphData(p.chain, p, GRAPH_THEME)).catch(e => mount(box, emptyState({ iconName: 'warn', title: 'Graph unavailable', text: e.message }))));
  }

  // ── TASKS
  function renderTasks(f) {
    const todos = f.todos || [];
    const pr = factoryProgress(f);
    let shell = detail.panes.tasks;
    if (!shell || !shell.root.isConnected) {
      const prioRow = h('div', { class: 'seg-group sm prio' });
      const filterRow = h('div', { class: 'seg-group sm' });
      const list = h('div', { class: 'task-list' });
      const statRow = h('div', { class: 'stat-grid three' });
      const bar = liquidBar(pr.pct, { height: 36, label: `${pr.pct}% complete`, key: 'tasks-' + f.id });
      const root = h('div', { class: 'tasks' },
        statRow, bar,
        h('div', { class: 'add-task' }, detail.taskInput, h('button', { class: 'btn primary', 'aria-label': 'Add task', onclick: addTask }, icon('plus', 20))),
        h('div', { class: 'task-controls' }, h('span', { class: 'field-label' }, 'Priority'), prioRow, h('span', { class: 'spacer' }), filterRow),
        list,
        h('div', { class: 'btn-row' },
          h('button', { class: 'btn ghost', onclick: () => generateTasks(state.data.factories[route.id]) }, icon('sparkle', 18), 'Generate from plan'),
          h('button', { class: 'btn ghost', onclick: () => clearDone(state.data.factories[route.id]) }, icon('trash', 18), 'Clear completed')));
      shell = detail.panes.tasks = { root, prioRow, filterRow, list, statRow, bar };
      mount(detail.body, root);
    }
    mount(shell.statRow,
      h('div', { class: 'stat' }, h('div', { class: 'stat-value amber' }, pr.total), h('div', { class: 'stat-label' }, 'Total')),
      h('div', { class: 'stat' }, h('div', { class: 'stat-value green' }, pr.done), h('div', { class: 'stat-label' }, 'Done')),
      h('div', { class: 'stat' }, h('div', { class: 'stat-value blue' }, pr.total - pr.done), h('div', { class: 'stat-label' }, 'Left')));
    setLiquid(shell.bar, pr.pct, pr.total ? `${pr.pct}% complete` : 'No tasks yet');
    mount(shell.prioRow, ['low', 'medium', 'high'].map(p => h('button', { class: `seg p-${p}` + (taskUI.priority === p ? ' on' : ''), onclick: () => { taskUI.priority = p; renderTasks(state.data.factories[route.id]); } }, p)));
    mount(shell.filterRow, [['active', 'Active'], ['done', 'Done'], ['all', 'All']].map(([k, l]) => h('button', { class: 'seg' + (taskUI.filter === k ? ' on' : ''), onclick: () => { taskUI.filter = k; renderTasks(state.data.factories[route.id]); } }, l)));
    const order = { high: 0, medium: 1, low: 2 };
    const shown = todos.filter(t => taskUI.filter === 'all' || (taskUI.filter === 'done' ? t.done : !t.done))
      .sort((a, b) => (a.done - b.done) || (order[a.priority] - order[b.priority]));
    if (!shown.length) {
      mount(shell.list, emptyState({ iconName: 'tasks',
        title: taskUI.filter === 'done' ? 'Nothing completed yet' : todos.length ? 'All clear, Pioneer!' : 'No tasks yet',
        text: todos.length ? null : 'Add your own, or generate a full build checklist from the plan.' }));
      return;
    }
    mount(shell.list, shown.map(t => h('div', { class: `task p-${t.priority}` + (t.done ? ' done' : '') },
      h('button', { class: 'check' + (t.done ? ' on' : ''), 'aria-label': (t.done ? 'Mark not done: ' : 'Mark done: ') + t.text, onclick: e => toggleTask(t.id, e.currentTarget) }, icon('check', 16)),
      h('span', { class: 'task-text' }, t.text),
      h('span', { class: `prio-tag p-${t.priority}` }, t.priority),
      h('button', { class: 'icon-btn sm', 'aria-label': 'Delete task', onclick: () => deleteTask(t.id) }, icon('x', 16)))));
  }

  function setTodos(todos) { touchFactory(route.id, { todos }); }
  function addTask() {
    const f = state.data.factories[route.id]; if (!f) return;
    const text = detail.taskInput.value.trim();
    if (!text) { detail.taskInput.focus(); return; }
    detail.taskInput.value = '';
    setTodos([{ id: Date.now(), text, priority: taskUI.priority, done: false }, ...(f.todos || [])]);
    if (taskUI.filter === 'done') taskUI.filter = 'active';
  }
  function toggleTask(id, btn) {
    const f = state.data.factories[route.id]; if (!f) return;
    const todos = f.todos.map(t => t.id === id ? { ...t, done: !t.done } : t);
    const t = todos.find(x => x.id === id);
    if (t && t.done) {
      celebrate(btn);
      if (todos.every(x => x.done)) setTimeout(() => toast(`${f.name} is fully built! 🎉`, { type: 'success' }), 300);
    }
    setTodos(todos);
  }
  function deleteTask(id) {
    const f = state.data.factories[route.id]; if (!f) return;
    const before = f.todos;
    setTodos(before.filter(t => t.id !== id));
    toast('Task deleted', { action: { label: 'Undo', fn: () => setTodos(before) } });
  }
  function clearDone(f) {
    if (!f) return;
    const before = f.todos;
    const n = before.filter(t => t.done).length;
    if (!n) { toast('No completed tasks to clear'); return; }
    setTodos(before.filter(t => !t.done));
    toast(`Cleared ${n} task${n === 1 ? '' : 's'}`, { action: { label: 'Undo', fn: () => setTodos(before) } });
  }
  function generateTasks(f) {
    if (!f) return;
    const p = planOf(f);
    const existing = new Set((f.todos || []).map(t => t.text));
    let id = Date.now();
    const fresh = [];
    p.raw.forEach(r => fresh.push({ text: `Tap ${r.item}: ${fmt(r.rate)}/min via ${transportLabel(r.transport)}`, priority: 'high' }));
    p.steps.forEach(s => fresh.push({ text: `Build ${s.buildings}× ${s.recipe.machine} → ${s.item} (${s.recipe.name}${s.clock < 99.95 ? `, ${fmt(s.clock)}% clock` : ''})`, priority: s.item === f.outputItem ? 'high' : 'medium' }));
    if (p.totalPower > 0) fresh.push({ text: `Make sure the grid has ${fmtMW(p.totalPower)} spare`, priority: 'medium' });
    p.byproducts.forEach(b => fresh.push({ text: `Handle byproduct: ${b.item} ${fmt(b.rate)}/min (sink, store or reuse)`, priority: 'low' }));
    const added = fresh.filter(t => !existing.has(t.text)).map(t => ({ id: id++, done: false, auto: true, ...t }));
    if (!added.length) { toast('Build tasks are already up to date'); return; }
    setTodos([...(f.todos || []), ...added]);
    taskUI.filter = 'active';
    toast(`Added ${added.length} build task${added.length === 1 ? '' : 's'}`, { type: 'success' });
  }

  // ── Factory actions
  function editFactory(f) {
    const name = h('input', { class: 'input', value: f.name, maxLength: 80 });
    const rate = h('input', { class: 'input', type: 'number', inputMode: 'decimal', min: '0.01', step: 'any', value: f.outputRate });
    const notes = h('textarea', { class: 'input', rows: 3, placeholder: 'Location, belt routing, reminders…', value: f.notes || '' });
    const err = h('div', { class: 'form-error' });
    const save = () => {
      const r = parseFloat(rate.value);
      if (!name.value.trim()) { err.textContent = 'Name can’t be empty.'; return; }
      if (!(r > 0)) { err.textContent = 'Rate must be above 0.'; return; }
      touchFactory(f.id, { name: name.value.trim(), outputRate: r, notes: notes.value.trim() });
      s.close();
    };
    const s = openSheet({
      title: 'Edit factory',
      body: h('form', { class: 'form', onsubmit: e => { e.preventDefault(); save(); } },
        h('label', { class: 'field' }, h('span', { class: 'field-label' }, 'Name'), name),
        h('label', { class: 'field' }, h('span', { class: 'field-label' }, `${f.outputItem} per minute`), rate),
        h('div', { class: 'chip-row' }, [0.5, 2, 1.5].map(m => h('button', { type: 'button', class: 'chip', onclick: () => { rate.value = fmt((parseFloat(rate.value) || f.outputRate) * m); } }, m === 0.5 ? '½×' : m + '×'))),
        h('label', { class: 'field' }, h('span', { class: 'field-label' }, 'Notes'), notes), err,
        h('button', { type: 'submit', hidden: true })),
      footer: [h('button', { class: 'btn ghost', onclick: () => s.close() }, 'Cancel'), h('button', { class: 'btn primary', onclick: save }, 'Save')],
    });
  }
  function duplicate(f) {
    const id = newFactoryId(), now = Date.now();
    write(`factories/${id}`, { ...f, id, name: f.name + ' (copy)', todos: (f.todos || []).map(t => ({ ...t, done: false })), createdAt: now, updatedAt: now });
    toast('Factory duplicated', { type: 'success' });
    go(`factories/${id}/plan`);
  }
  async function remove(f) {
    const ok = await confirmSheet({ title: 'Delete factory?', message: `“${f.name}” and its ${(f.todos || []).length} tasks will be removed.`, confirmLabel: 'Delete', danger: true });
    if (!ok) return;
    const backup = f;
    write(`factories/${f.id}`, null);
    go('factories');
    toast(`Deleted ${f.name}`, { action: { label: 'Undo', fn: () => { write(`factories/${backup.id}`, backup); go(`factories/${backup.id}/plan`); } } });
  }

  return {
    update(st, reason) {
      state = st;
      if (reason === 'sync') return;
      renderList(); renderDetail();
    },
    route(r) {
      const changedId = r.id !== route.id;
      route = { id: r.id, sub: ['plan', 'graph', 'tasks'].includes(r.sub) ? r.sub : 'plan' };
      if (changedId && detail) detail.panes = {};
      renderList(); renderDetail();
      if (changedId) detailPane.scrollTop = 0;
    },
    destroy() { destroyGraph(); },
  };
}

function transportLabel(t) { return t.lines > 1 ? `${t.lines}× ${t.kind} ${t.tier}` : `${t.kind} ${t.tier}`; }

