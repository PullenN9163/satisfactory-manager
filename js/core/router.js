// Hash router: #/hub, #/recipes, #/factories, #/factories/:id[/plan|graph|tasks], #/phases, #/settings
const listeners = new Set();

export function parse(hash = location.hash) {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  const view = parts[0] || 'hub';
  if (view === 'factories') return { view, id: parts[1] || null, sub: parts[2] || 'plan' };
  return { view };
}

export function go(path, { replace } = {}) {
  const h = '#/' + path.replace(/^#?\/?/, '');
  if (replace) history.replaceState(null, '', h); else if (location.hash !== h) location.hash = h;
  if (replace) fire();
}
export function onRoute(fn) { listeners.add(fn); }
function fire() { const r = parse(); listeners.forEach(fn => fn(r)); }
addEventListener('hashchange', fire);
export function current() { return parse(); }
export function start() { fire(); }
