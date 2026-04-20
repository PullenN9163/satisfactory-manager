import { RECIPES, CATEGORIES, TIERS } from './data/recipes.js';
import { appData, saveFavourites } from './firebase.js';

let searchQuery = '';
let catFilter = 'All';
let tierFilter = 'All';
let expandedId = null;

export function initRecipesTab(container) {
  container.innerHTML = buildShell();
  container.querySelector('#recipe-search').addEventListener('input', e => {
    searchQuery = e.target.value;
    renderRecipes(container);
  });
  renderCatPills(container);
  renderTierPills(container);
  renderRecipes(container);
}

export function refreshRecipesTab(container) {
  renderRecipes(container);
}

function buildShell() {
  return '<div class="search-wrap">'
    + '<svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>'
    + '<input type="text" class="search-input" id="recipe-search" placeholder="Search recipes, items, machines..." autocomplete="off" spellcheck="false"></div>'
    + '<div class="pills" id="cat-pills"></div>'
    + '<div class="pills" id="tier-pills" style="margin-top:2px"></div>'
    + '<div class="result-count" id="result-count"></div>'
    + '<div id="recipe-list"></div>';
}

function renderCatPills(container) {
  const c = container.querySelector('#cat-pills');
  if (!c) return;
  c.innerHTML = CATEGORIES.map(cat =>
    '<button class="pill ' + (catFilter === cat ? 'active-amber' : '') + '" data-cat="' + esc(cat) + '">' + esc(cat) + '</button>'
  ).join('');
  c.querySelectorAll('.pill').forEach(p => p.addEventListener('click', () => {
    catFilter = p.dataset.cat; renderCatPills(container); renderRecipes(container);
  }));
}

function renderTierPills(container) {
  const c = container.querySelector('#tier-pills');
  if (!c) return;
  c.innerHTML = TIERS.map(t =>
    '<button class="pill ' + (tierFilter === t ? 'active-blue' : '') + '" data-tier="' + esc(t) + '">' + esc(t) + '</button>'
  ).join('');
  c.querySelectorAll('.pill').forEach(p => p.addEventListener('click', () => {
    tierFilter = p.dataset.tier; renderTierPills(container); renderRecipes(container);
  }));
}

function renderRecipes(container) {
  const favs = appData.favourites || [];
  const s = searchQuery.toLowerCase();
  const filtered = RECIPES.filter(r => {
    if (catFilter === 'Favs') return favs.includes(r.id);
    const matchS = !s || r.name.toLowerCase().includes(s)
      || r.inputs.some(i => i.item.toLowerCase().includes(s))
      || r.machine.toLowerCase().includes(s);
    return matchS && (catFilter === 'All' || r.cat === catFilter) && (tierFilter === 'All' || r.tier === tierFilter);
  });

  const rc = container.querySelector('#result-count');
  if (rc) rc.textContent = filtered.length + ' recipe' + (filtered.length !== 1 ? 's' : '');

  const list = container.querySelector('#recipe-list');
  if (!list) return;

  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty-state"><p>No recipes found.</p><p class="hint">Try adjusting filters.</p></div>';
    return;
  }

  list.innerHTML = filtered.map(r => {
    const open = expandedId === r.id;
    const isFav = favs.includes(r.id);
    return '<div class="recipe-card' + (r.alt ? ' alt-recipe' : '') + (open ? ' expanded' : '') + '" data-id="' + r.id + '">'
      + '<div class="recipe-header">'
      + '<div class="recipe-info">'
      + '<div class="recipe-name">' + (r.alt ? '<span class="star">*</span>' : '') + esc(r.name) + '</div>'
      + '<div class="recipe-meta"><span class="recipe-machine">' + esc(r.machine) + '</span><span class="recipe-tier">' + esc(r.tier) + '</span></div>'
      + '</div>'
      + '<button class="fav-btn' + (isFav ? ' active' : '') + '" data-fav="' + r.id + '" title="Favourite">&#9733;</button>'
      + '<svg class="chevron' + (open ? ' open' : '') + '" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>'
      + '</div>'
      + '<div class="recipe-detail">'
      + '<div class="detail-section"><div class="detail-label label-input">INPUTS</div>'
      + r.inputs.map(i => '<div class="detail-row"><span class="item-name">' + esc(i.item) + '</span><span class="item-qty">x' + i.qty + '</span></div>').join('')
      + '</div>'
      + '<div class="detail-section"><div class="detail-label label-output">OUTPUTS</div>'
      + r.outputs.map(o => '<div class="detail-row output-row"><span class="item-name">' + esc(o.item) + '</span><span class="item-qty">x' + o.qty + '</span></div>').join('')
      + '</div>'
      + '<div class="detail-stats"><div class="stat-time"><div class="stat-label">CRAFT TIME</div><div class="stat-value">' + r.time + 's</div></div></div>'
      + (r.notes ? '<div class="recipe-notes">' + esc(r.notes) + '</div>' : '')
      + '</div></div>';
  }).join('');

  list.querySelectorAll('.recipe-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.fav-btn')) return;
      const id = card.dataset.id;
      expandedId = expandedId === id ? null : id;
      renderRecipes(container);
    });
  });
  list.querySelectorAll('.fav-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = btn.dataset.fav;
      const current = [...(appData.favourites || [])];
      const idx = current.indexOf(id);
      if (idx === -1) current.push(id); else current.splice(idx, 1);
      saveFavourites(current);
    });
  });
}

function esc(s) { const d = document.createElement('div'); d.textContent = String(s); return d.innerHTML; }
