import { h, icon, openSheet, toast } from '../core/ui.js';
import { getAllProducts, getRecipesForItem } from '../data/recipes.js';
import { write, newFactoryId } from '../core/store.js';
import { go } from '../core/router.js';
import { planFactory, fmt, fmtMW } from '../planner.js';
import { itemBadge } from './common.js';

const PRODUCTS = getAllProducts();
const QUICK_RATES = [1, 5, 10, 30, 60, 120];

/** Open the "new factory" sheet. prefill: { item, rate, name } */
export function openNewFactory(prefill = {}) {
  let item = prefill.item && PRODUCTS.includes(prefill.item) ? prefill.item : '';
  let active = -1;

  const nameIn = h('input', { class: 'input', id: 'nf-name', placeholder: 'e.g. Rotor Works', maxLength: 80, autocomplete: 'off', value: prefill.name || '' });
  const itemIn = h('input', { class: 'input', id: 'nf-item', placeholder: 'Search items…', autocomplete: 'off', autocapitalize: 'off', spellcheck: false,
    role: 'combobox', 'aria-expanded': 'false', 'aria-controls': 'nf-results', value: item });
  const results = h('div', { class: 'combo-list hidden', id: 'nf-results', role: 'listbox' });
  const rateIn = h('input', { class: 'input', id: 'nf-rate', type: 'number', inputMode: 'decimal', min: '0.01', step: 'any', placeholder: 'per minute', value: prefill.rate || '' });
  const quick = h('div', { class: 'chip-row' }, QUICK_RATES.map(r =>
    h('button', { class: 'chip', type: 'button', onclick: () => { rateIn.value = r; update(); } }, r + '/min')));
  const preview = h('div', { class: 'nf-preview' });
  const err = h('div', { class: 'form-error', role: 'alert' });
  const submit = h('button', { class: 'btn primary hazard', type: 'submit', form: 'nf-form' }, icon('plus', 18), 'Create factory');

  function renderResults() {
    const q = itemIn.value.trim().toLowerCase();
    const matches = (q ? PRODUCTS.filter(p => p.toLowerCase().includes(q)) : PRODUCTS).slice(0, 40);
    results.textContent = '';
    if (!matches.length || (matches.length === 1 && matches[0] === item && document.activeElement !== itemIn)) {
      results.classList.add('hidden'); itemIn.setAttribute('aria-expanded', 'false'); return;
    }
    matches.forEach((p, i) => results.appendChild(h('div', {
      class: 'combo-opt' + (i === active ? ' active' : '') + (p === item ? ' selected' : ''), role: 'option', 'aria-selected': String(p === item), 'data-item': p,
      onpointerdown: e => { e.preventDefault(); choose(p); },
    }, itemBadge(p, 'sm'), h('span', null, p), getRecipesForItem(p).length > 1 ? h('span', { class: 'tag alt' }, getRecipesForItem(p).length + ' recipes') : null)));
    results.classList.remove('hidden'); itemIn.setAttribute('aria-expanded', 'true');
  }
  function choose(p) {
    item = p; itemIn.value = p; active = -1;
    results.classList.add('hidden'); itemIn.setAttribute('aria-expanded', 'false');
    if (!nameIn.value.trim()) nameIn.placeholder = p + ' Factory';
    update();
    if (!rateIn.value) rateIn.focus();
  }
  itemIn.addEventListener('input', () => { item = PRODUCTS.find(p => p.toLowerCase() === itemIn.value.trim().toLowerCase()) || ''; active = -1; renderResults(); update(); });
  itemIn.addEventListener('focus', renderResults);
  itemIn.addEventListener('blur', () => setTimeout(() => results.classList.add('hidden'), 120));
  itemIn.addEventListener('keydown', e => {
    const opts = results.querySelectorAll('.combo-opt');
    if (e.key === 'ArrowDown') { active = Math.min(opts.length - 1, active + 1); renderResults(); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { active = Math.max(0, active - 1); renderResults(); e.preventDefault(); }
    else if (e.key === 'Enter' && !results.classList.contains('hidden')) {
      const pick = opts[Math.max(0, active)]; if (pick) { choose(pick.dataset.item); e.preventDefault(); }
    }
  });
  rateIn.addEventListener('input', update);

  function update() {
    err.textContent = '';
    const rate = parseFloat(rateIn.value);
    preview.textContent = '';
    if (!item || !(rate > 0)) {
      preview.appendChild(h('p', { class: 'muted small' }, 'Pick an item and a target rate to preview the build.'));
      return;
    }
    const p = planFactory({ outputItem: item, outputRate: rate, recipeSelections: {} });
    preview.append(
      h('div', { class: 'nf-preview-head' }, itemBadge(item, 'lg'), h('div', null, h('div', { class: 'strong' }, item), h('div', { class: 'muted small' }, fmt(rate) + '/min'))),
      h('div', { class: 'stat-strip' },
        h('div', { class: 'mini-stat' }, h('b', null, p.totalBuildings), ' buildings'),
        h('div', { class: 'mini-stat' }, h('b', null, fmtMW(p.totalPower))),
        h('div', { class: 'mini-stat' }, h('b', null, p.steps.length), ' steps')),
      h('div', { class: 'muted small' }, 'Raw: ' + p.raw.slice(0, 4).map(r => `${r.item} ${fmt(r.rate)}`).join(' · ') + (p.raw.length > 4 ? ' …' : '')));
  }

  const form = h('form', { id: 'nf-form', class: 'form', onsubmit: e => { e.preventDefault(); create(); } },
    h('label', { class: 'field' }, h('span', { class: 'field-label' }, 'Output item'), h('div', { class: 'combo' }, itemIn, results)),
    h('label', { class: 'field' }, h('span', { class: 'field-label' }, 'Target rate (items / min)'), rateIn),
    quick,
    h('label', { class: 'field' }, h('span', { class: 'field-label' }, 'Factory name'), nameIn),
    preview, err);

  function create() {
    const rate = parseFloat(rateIn.value);
    if (!item) { err.textContent = 'Choose an output item from the list.'; itemIn.focus(); return; }
    if (!(rate > 0)) { err.textContent = 'Enter a target rate above 0.'; rateIn.focus(); return; }
    const id = newFactoryId();
    const now = Date.now();
    write(`factories/${id}`, {
      id, name: nameIn.value.trim() || item + ' Factory', outputItem: item, outputRate: rate,
      recipeSelections: {}, todos: [], createdAt: now, updatedAt: now,
    });
    sheet.close();
    toast('Factory created — time to build!', { type: 'success' });
    go('factories/' + id + '/plan');
  }

  const sheet = openSheet({ title: 'New factory', body: form, footer: [h('button', { class: 'btn ghost', type: 'button', onclick: () => sheet.close() }, 'Cancel'), submit] });
  update();
  setTimeout(() => (item ? rateIn : itemIn).focus(), 260);
}
