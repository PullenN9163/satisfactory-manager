import { h, icon } from '../core/ui.js';
import { planFactory } from '../planner.js';
import { RECIPES } from '../data/recipes.js';
import { machineColor } from '../data/machines.js';

// Memoised plan per factory config.
const planCache = new Map();
export function planOf(f) {
  const key = f.outputItem + '|' + f.outputRate + '|' + JSON.stringify(f.recipeSelections || {});
  let p = planCache.get(key);
  if (!p) {
    p = planFactory(f);
    planCache.set(key, p);
    if (planCache.size > 200) planCache.delete(planCache.keys().next().value);
  }
  return p;
}

export function factoryProgress(f) {
  const total = (f.todos || []).length;
  const done = (f.todos || []).filter(t => t.done).length;
  return { total, done, pct: total ? Math.round(done / total * 100) : 0 };
}

// Item "badge": a hex monogram with a stable hue per item (no game art).
const CAT_HUE = { Ingots: 22, Parts: 210, Electronics: 150, Oil: 280, 'Space Elevator': 42 };
const itemCat = new Map();
RECIPES.forEach(r => { if (!itemCat.has(r.product)) itemCat.set(r.product, r.cat); });
function hashHue(s) { let x = 0; for (const c of s) x = (x * 31 + c.charCodeAt(0)) >>> 0; return x % 360; }
export function itemBadge(item, size = 'md') {
  const cat = itemCat.get(item);
  const hue = cat ? (CAT_HUE[cat] + (hashHue(item) % 24) - 12 + 360) % 360 : hashHue(item);
  const raw = !cat;
  const initials = item.split(/[\s-]+/).filter(w => /^[A-Za-z]/.test(w)).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  return h('span', { class: `badge badge-${size}${raw ? ' raw' : ''}`, style: { '--hue': hue }, title: item, 'aria-hidden': 'true' }, initials);
}

export function machineTag(machine) {
  return h('span', { class: 'machine-tag', style: { '--mc': machineColor(machine) } }, machine);
}

export function emptyState({ iconName = 'factory', title, text, action }) {
  return h('div', { class: 'empty' },
    h('div', { class: 'empty-icon' }, icon(iconName, 36)),
    h('h3', null, title),
    text ? h('p', { class: 'muted' }, text) : null,
    action || null);
}

export function sectionHead(title, extra) {
  return h('div', { class: 'section-head' }, h('h2', { class: 'section-title' }, title), extra || null);
}

export function stat(label, value, cls = '') {
  return h('div', { class: 'stat ' + cls }, h('div', { class: 'stat-value' }, value), h('div', { class: 'stat-label' }, label));
}
