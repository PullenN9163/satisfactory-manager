import { h, icon, mount } from './core/ui.js';
import { boot, subscribe, getState } from './core/store.js';
import { onRoute, start, current, go } from './core/router.js';
import { createHub } from './views/hub.js';
import { createRecipes } from './views/recipes.js';
import { createFactories } from './views/factories.js';
import { createPhases } from './views/phases.js';
import { createSettings } from './views/settings.js';
import { renderSignIn } from './views/signin.js';
import { openNewFactory } from './views/new-factory.js';

const VIEWS = { hub: createHub, recipes: createRecipes, factories: createFactories, phases: createPhases, settings: createSettings };
const NAV = [
  ['hub', 'HUB', 'hub'], ['recipes', 'Recipes', 'book'], ['factories', 'Factories', 'factory'], ['phases', 'Phases', 'rocket'], ['settings', 'Settings', 'gear'],
];
const SYNC_LABEL = { online: 'Synced', connecting: 'Connecting', offline: 'Offline', denied: 'No access', local: 'Local' };

const appEl = document.getElementById('app');
const navEl = document.getElementById('nav');
const viewEl = document.getElementById('view');
const gateEl = document.getElementById('gate');
let active = null; // { name, view }

function renderNav(route) {
  const st = getState();
  mount(navEl,
    h('div', { class: 'nav-brand' }, h('img', { src: 'icons/icon.svg', alt: '', width: 36, height: 36 }), h('span', { class: 'nav-brand-text' }, 'SATISFACTORY', h('small', null, 'MANAGER'))),
    h('div', { class: 'nav-items' },
      NAV.slice(0, 3).map(n => navItem(n, route)),
      h('button', { class: 'nav-new', 'aria-label': 'New factory', onclick: () => openNewFactory() }, h('span', { class: 'nav-new-btn' }, icon('plus', 24)), h('span', { class: 'nav-label' }, 'New')),
      NAV.slice(3).map(n => navItem(n, route))),
    h('button', { class: 'nav-sync sync-' + st.sync, onclick: () => go('settings'), title: SYNC_LABEL[st.sync] },
      st.user && st.user.photo ? h('img', { class: 'nav-avatar', src: st.user.photo, alt: '', referrerPolicy: 'no-referrer' }) : null,
      h('span', { class: 'dot' }), h('span', { class: 'nav-label' }, SYNC_LABEL[st.sync])));
}
function navItem([key, label, ic], route) {
  const on = route.view === key;
  return h('a', { class: 'nav-item' + (on ? ' on' : ''), href: '#/' + key, 'aria-current': on ? 'page' : null }, icon(ic, 22), h('span', { class: 'nav-label' }, label));
}

function show(route) {
  const st = getState();
  if (st.auth === 'loading') return;
  if (st.auth === 'signedOut') {
    appEl.classList.add('hidden'); gateEl.classList.remove('hidden');
    if (active) { active.view.destroy?.(); active = null; }
    renderSignIn(gateEl, st);
    return;
  }
  gateEl.classList.add('hidden'); appEl.classList.remove('hidden');
  const name = VIEWS[route.view] ? route.view : 'hub';
  renderNav({ view: name });
  document.body.dataset.view = name;
  if (!active || active.name !== name) {
    active?.view.destroy?.();
    viewEl.textContent = '';
    const container = h('div', { class: 'view-root view-' + name });
    viewEl.appendChild(container);
    viewEl.scrollTop = 0;
    active = { name, view: VIEWS[name](container) };
    active.view.route?.(route);
    active.view.update(st, 'mount');
    container.classList.add('enter');
  } else {
    active.view.route?.(route);
  }
  document.title = (name === 'hub' ? 'HUB' : name[0].toUpperCase() + name.slice(1)) + ' · Satisfactory Manager';
}

subscribe((st, reason) => {
  document.getElementById('splash')?.remove();
  if (reason === 'auth') { show(current()); return; }
  renderNav({ view: active ? active.name : 'hub' });
  if (active) active.view.update(st, reason);
});
onRoute(show);

boot().then(() => start());
start();

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
