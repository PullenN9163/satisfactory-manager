// Offline support: network-first for the app's own files, cache-first for versioned CDN assets.
const CACHE = 'sm-v2';
const SHELL = [
  './', 'index.html', 'manifest.webmanifest', 'ManlineSlabs.ttf', 'icons/icon.svg', 'icons/icon-180.png',
  'css/tokens.css', 'css/base.css', 'css/components.css', 'css/views.css',
  'js/app.js', 'js/planner.js', 'js/graph.js',
  'js/core/ui.js', 'js/core/store.js', 'js/core/router.js', 'js/core/firebase.js',
  'js/data/recipes.js', 'js/data/machines.js', 'js/data/phases.js',
  'js/views/common.js', 'js/views/hub.js', 'js/views/recipes.js', 'js/views/factories.js',
  'js/views/phases.js', 'js/views/settings.js', 'js/views/signin.js', 'js/views/new-factory.js',
];
const CDN = /^https:\/\/(www\.gstatic\.com\/firebasejs\/|unpkg\.com\/vis-network@|fonts\.(googleapis|gstatic)\.com\/)/;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (CDN.test(req.url)) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    })));
    return;
  }
  if (url.origin !== location.origin) return; // Firebase DB/auth traffic goes straight to the network
  e.respondWith(fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req).then(hit => hit || caches.match('index.html'))));
});
