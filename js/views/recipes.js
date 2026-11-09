import { h, icon, mount, openSheet, debounce } from '../core/ui.js';
import { write } from '../core/store.js';
import { RECIPES, CATEGORIES, TIERS, getRecipesForItem } from '../data/recipes.js';
import { machinePower } from '../data/machines.js';
import { getPhaseDef } from '../data/phases.js';
import { fmt } from '../planner.js';
import { itemBadge, machineTag, emptyState } from './common.js';
import { openNewFactory } from './new-factory.js';

const ui = { q: '', cat: 'All', tier: 'All', alts: 'all', showLocked: false };
const perMin = (r, qty) => qty * 60 / r.time;

export function createRecipes(el) {
  const search = h('input', { class: 'input search', type: 'search', placeholder: 'Search recipes, items, machines…', value: ui.q, autocomplete: 'off', spellcheck: false, 'aria-label': 'Search recipes' });
  search.addEventListener('input', debounce(() => { ui.q = search.value; renderGrid(); }, 80));
  const catRow = h('div', { class: 'seg-scroll', role: 'tablist', 'aria-label': 'Category' });
  const tierRow = h('div', { class: 'chip-row nowrap' });
  const count = h('div', { class: 'muted small' });
  const grid = h('div', { class: 'recipe-grid' });
  let state;

  mount(el, h('div', { class: 'page recipes' },
    h('header', { class: 'page-head' }, h('div', null, h('h1', { class: 'page-title' }, 'Recipes'), count)),
    h('div', { class: 'toolbar sticky' },
      h('div', { class: 'search-wrap' }, icon('search', 18, 'search-icon'), search),
      catRow, tierRow),
    grid));

  function renderFilters() {
    const unlocked = getPhaseDef(state.data.phase).tiers;
    mount(catRow, CATEGORIES.map(c => h('button', { class: 'seg' + (ui.cat === c ? ' on' : ''), role: 'tab', 'aria-selected': String(ui.cat === c),
      onclick: () => { ui.cat = c; renderFilters(); renderGrid(); } }, c === 'Favourites' ? icon('star', 14) : null, c)));
    const tiers = ['All', ...TIERS.filter(t => ui.showLocked || unlocked.includes(t))];
    if (!tiers.includes(ui.tier)) ui.tier = 'All';
    mount(tierRow,
      tiers.map(t => h('button', { class: 'chip' + (ui.tier === t ? ' on blue' : '') + (!unlocked.includes(t) && t !== 'All' ? ' locked' : ''),
        onclick: () => { ui.tier = t; renderFilters(); renderGrid(); } }, !unlocked.includes(t) && t !== 'All' ? icon('lock', 12) : null, t)),
      h('span', { class: 'chip-sep' }),
      [['all', 'All recipes'], ['standard', 'Standard'], ['alt', 'Alternates']].map(([k, l]) =>
        h('button', { class: 'chip' + (ui.alts === k ? ' on' : ''), onclick: () => { ui.alts = k; renderFilters(); renderGrid(); } }, l)),
      h('button', { class: 'chip' + (ui.showLocked ? ' on' : ''), onclick: () => { ui.showLocked = !ui.showLocked; renderFilters(); renderGrid(); } }, icon('lock', 12), ui.showLocked ? 'Showing locked' : 'Show locked'));
  }

  function renderGrid() {
    const favs = state.data.favourites;
    const unlocked = getPhaseDef(state.data.phase).tiers;
    const q = ui.q.trim().toLowerCase();
    const list = RECIPES.filter(r => {
      if (ui.cat === 'Favourites' ? !favs.includes(r.id) : (ui.cat !== 'All' && r.cat !== ui.cat)) return false;
      if (!ui.showLocked && ui.cat !== 'Favourites' && !unlocked.includes(r.tier)) return false;
      if (ui.tier !== 'All' && r.tier !== ui.tier) return false;
      if (ui.alts === 'standard' && r.alt) return false;
      if (ui.alts === 'alt' && !r.alt) return false;
      if (!q) return true;
      return r.name.toLowerCase().includes(q) || r.machine.toLowerCase().includes(q)
        || r.inputs.some(i => i.item.toLowerCase().includes(q)) || r.outputs.some(o => o.item.toLowerCase().includes(q));
    });
    count.textContent = `${list.length} recipe${list.length === 1 ? '' : 's'} · Phase ${state.data.phase} unlocks`;
    if (!list.length) {
      mount(grid, emptyState({ iconName: ui.cat === 'Favourites' ? 'star' : 'search',
        title: ui.cat === 'Favourites' ? 'No favourites yet' : 'No recipes match',
        text: ui.cat === 'Favourites' ? 'Tap the star on any recipe to pin it here.' : 'Try a different search, or turn on “Show locked”.' }));
      return;
    }
    mount(grid, list.map(r => recipeCard(r, favs.includes(r.id), !unlocked.includes(r.tier))));
  }

  function toggleFav(id) {
    const favs = [...state.data.favourites];
    const i = favs.indexOf(id);
    if (i === -1) favs.push(id); else favs.splice(i, 1);
    write('favourites', favs);
  }

  function recipeCard(r, fav, locked) {
    return h('article', { class: 'recipe-card' + (r.alt ? ' alt' : '') + (locked ? ' locked' : ''), tabIndex: 0,
      onclick: e => { if (!e.target.closest('button')) openRecipe(r); },
      onkeydown: e => { if (e.key === 'Enter' && e.target === e.currentTarget) openRecipe(r); } },
      h('header', { class: 'rc-head' },
        itemBadge(r.product, 'md'),
        h('div', { class: 'rc-title' },
          h('div', { class: 'rc-name' }, r.name),
          h('div', { class: 'rc-meta' }, machineTag(r.machine), h('span', { class: 'tier' }, r.tier), r.alt ? h('span', { class: 'tag alt' }, 'ALT') : null, locked ? icon('lock', 13, 'muted') : null)),
        h('button', { class: 'icon-btn fav' + (fav ? ' on' : ''), 'aria-pressed': String(fav), 'aria-label': fav ? 'Remove favourite' : 'Add favourite', onclick: () => toggleFav(r.id) }, icon('star', 20))),
      h('div', { class: 'rc-flow' },
        h('div', { class: 'rc-io' }, r.inputs.map(i => ioChip(i.item, perMin(r, i.qty)))),
        h('span', { class: 'rc-arrow' }, icon('chevron', 18)),
        h('div', { class: 'rc-io out' }, r.outputs.map((o, k) => ioChip(o.item, perMin(r, o.qty), k > 0)))),
      h('footer', { class: 'rc-foot' },
        h('span', { class: 'muted small' }, `${r.time}s · ${machinePower(r.machine)} MW`),
        h('button', { class: 'btn sm ghost', onclick: () => openNewFactory({ item: r.product, rate: perMin(r, r.outputs[0].qty) }) }, icon('plus', 14), 'Plan')));
  }

  function openRecipe(r) {
    const others = getRecipesForItem(r.product).filter(x => x.id !== r.id);
    const s = openSheet({
      title: r.name,
      body: h('div', { class: 'recipe-detail' },
        h('div', { class: 'rd-head' }, itemBadge(r.product, 'lg'), h('div', null, h('div', { class: 'rc-meta' }, machineTag(r.machine), h('span', { class: 'tier' }, r.tier), r.alt ? h('span', { class: 'tag alt' }, 'ALTERNATE') : null), r.notes ? h('p', { class: 'note' }, r.notes) : null)),
        h('div', { class: 'rd-cols' },
          h('div', null, h('div', { class: 'field-label red' }, 'Inputs'), r.inputs.map(i => h('div', { class: 'kv' }, h('span', null, i.item), h('span', { class: 'mono' }, `${i.qty} · ${fmt(perMin(r, i.qty))}/min`)))),
          h('div', null, h('div', { class: 'field-label green' }, 'Outputs'), r.outputs.map((o, k) => h('div', { class: 'kv' }, h('span', null, o.item, k ? h('span', { class: 'tag' }, 'byproduct') : null), h('span', { class: 'mono' }, `${o.qty} · ${fmt(perMin(r, o.qty))}/min`))))),
        h('div', { class: 'stat-strip' },
          h('div', { class: 'mini-stat' }, h('b', null, r.time + 's'), ' craft'),
          h('div', { class: 'mini-stat' }, h('b', null, machinePower(r.machine) + ' MW'), ' per machine'),
          h('div', { class: 'mini-stat' }, h('b', null, fmt(perMin(r, r.outputs[0].qty))), ' /min per machine')),
        others.length ? h('div', null, h('div', { class: 'field-label' }, `Other ways to make ${r.product}`),
          others.map(o => h('button', { class: 'list-btn', onclick: () => { s.close(); setTimeout(() => openRecipe(o), 260); } },
            h('span', null, o.name), o.alt ? h('span', { class: 'tag alt' }, 'ALT') : null, h('span', { class: 'muted small' }, o.machine), icon('chevron', 16)))) : null),
      footer: [h('button', { class: 'btn primary hazard', onclick: () => { s.close(); openNewFactory({ item: r.product, rate: perMin(r, r.outputs[0].qty) }); } }, icon('plus', 18), `Plan ${r.product}`)],
    });
  }

  return {
    update(st, reason) {
      state = st;
      if (reason === 'sync') return;
      renderFilters(); renderGrid();
    },
  };
}

function ioChip(item, rate, byp) {
  return h('span', { class: 'io-chip' + (byp ? ' byp' : '') }, itemBadge(item, 'xs'), h('span', { class: 'io-name' }, item), h('b', null, fmt(rate)));
}
