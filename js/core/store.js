// Single app store. Optimistic local updates, cached to localStorage, mirrored to Firebase when signed in.
import * as FB from './firebase.js';
import { RECIPES_BY_ID } from '../data/recipes.js';
import { MAX_PHASE } from '../data/phases.js';
import { toast } from './ui.js';

const LOCAL_KEY = 'sm-local-v2';
const CACHE_PREFIX = 'sm-cache-v2-';
const MODE_KEY = 'sm-mode';

export const emptyData = () => ({ factories: {}, favourites: [], phase: 1, objectives: {} });

const state = {
  auth: 'loading',      // loading | signedOut | signedIn | local
  user: null,           // { uid, name, email, photo }
  sync: 'connecting',   // connecting | online | offline | denied | local
  data: emptyData(),
  fbAvailable: false,
};
const listeners = new Set();
let unsubUser = null, unsubConn = null;

export function getState() { return state; }
export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
function emit(reason) { listeners.forEach(fn => { try { fn(state, reason); } catch (e) { console.error(e); } }); }

// ── Normalisation (Firebase returns sparse arrays as objects, drops empty ones)
const LEGACY_IDS = {
  'cast-screw-alt': 'cast-screw', 'steel-screw-alt': 'steel-screw', 'solid-steel-alt': 'solid-steel-ingot',
  'copper-alloy-alt': 'copper-alloy-ingot', 'iron-wire-alt': 'iron-wire', 'stitched-plate-alt': 'stitched-iron-plate',
  'heavy-encased-alt': 'heavy-encased-frame', 'rubber-concrete-alt': 'rubber-concrete', 'diluted-fuel-alt': 'diluted-fuel',
  'coke-steel-alt': 'coke-steel-ingot', 'alclad-sheet': 'alclad-aluminum-sheet',
};
const fixId = id => RECIPES_BY_ID[id] ? id : (LEGACY_IDS[id] || null);
const toArray = v => Array.isArray(v) ? v.filter(Boolean) : v && typeof v === 'object' ? Object.values(v).filter(Boolean) : [];

export function normalizeFactory(f, id) {
  if (!f || typeof f !== 'object') return null;
  const sels = {};
  Object.entries(f.recipeSelections || {}).forEach(([item, rid]) => { const x = fixId(rid); if (x) sels[item] = x; });
  return {
    id: f.id || id,
    name: String(f.name || 'Untitled factory').slice(0, 80),
    outputItem: String(f.outputItem || ''),
    outputRate: Number(f.outputRate) > 0 ? Number(f.outputRate) : 1,
    recipeSelections: sels,
    todos: toArray(f.todos).map(t => ({
      id: Number(t.id) || Date.now() + Math.random(), text: String(t.text || ''),
      priority: ['low', 'medium', 'high'].includes(t.priority) ? t.priority : 'low', done: !!t.done,
      ...(t.auto ? { auto: true } : {}),
    })),
    notes: f.notes ? String(f.notes) : '',
    createdAt: Number(f.createdAt) || Date.now(),
    updatedAt: Number(f.updatedAt) || Number(f.createdAt) || Date.now(),
  };
}

export function normalizeData(raw) {
  const d = emptyData();
  if (!raw || typeof raw !== 'object') return d;
  Object.entries(raw.factories || {}).forEach(([id, f]) => { const n = normalizeFactory(f, id); if (n) d.factories[n.id] = n; });
  d.favourites = [...new Set(toArray(raw.favourites).map(fixId).filter(Boolean))];
  d.phase = Math.min(MAX_PHASE, Math.max(1, parseInt(raw.phase, 10) || 1));
  d.objectives = raw.objectives && typeof raw.objectives === 'object' ? { ...raw.objectives } : {};
  return d;
}

const isEmpty = d => !Object.keys(d.factories).length && !d.favourites.length && d.phase === 1 && !Object.keys(d.objectives).length;

// ── Persistence helpers
function cacheKey() { return state.auth === 'signedIn' ? CACHE_PREFIX + state.user.uid : LOCAL_KEY; }
function saveCache() { try { localStorage.setItem(cacheKey(), JSON.stringify(state.data)); } catch (_) {} }
function loadCache(key) { try { return normalizeData(JSON.parse(localStorage.getItem(key) || 'null')); } catch (_) { return emptyData(); } }

function loadLocalWithLegacy() {
  const d = loadCache(LOCAL_KEY);
  const oldPhase = parseInt(localStorage.getItem('sm-phase') || '', 10);
  if (oldPhase && d.phase === 1) d.phase = Math.min(MAX_PHASE, Math.max(1, oldPhase));
  return d;
}

// ── Boot
export async function boot() {
  const preferLocal = localStorage.getItem(MODE_KEY) === 'local';
  try {
    await Promise.race([
      FB.loadFirebase(),
      new Promise((_, rej) => setTimeout(() => rej(new Error('Firebase SDK load timed out')), 10000)),
    ]);
    state.fbAvailable = true;
  } catch (e) {
    console.warn('Firebase SDK unavailable, local mode', e);
    state.fbAvailable = false;
    enterLocal(false);
    return;
  }
  if (preferLocal) enterLocal(false);
  FB.watchAuth(user => {
    if (user) onSignedIn(user);
    else if (state.auth !== 'local') { state.auth = 'signedOut'; state.user = null; emit('auth'); }
  });
  FB.checkRedirectResult().catch(e => { console.error(e); toast(FB.describeError(e), { type: 'error', duration: 8000 }); });
}

export function enterLocal(remember = true) {
  if (remember) try { localStorage.setItem(MODE_KEY, 'local'); } catch (_) {}
  teardownCloud();
  state.auth = 'local'; state.user = null; state.sync = 'local';
  state.data = loadLocalWithLegacy();
  emit('auth');
}

async function onSignedIn(user) {
  try { localStorage.removeItem(MODE_KEY); } catch (_) {}
  const localBefore = state.auth === 'local' ? state.data : loadCache(LOCAL_KEY);
  teardownCloud();
  state.auth = 'signedIn';
  state.user = { uid: user.uid, name: user.displayName || 'Pioneer', email: user.email || '', photo: user.photoURL || '' };
  state.sync = 'connecting';
  state.data = loadCache(CACHE_PREFIX + user.uid);
  emit('auth');

  unsubConn = FB.watchConnection(ok => {
    if (state.sync === 'denied') return;
    state.sync = ok ? 'online' : 'offline'; emit('sync');
  });

  let first = true;
  unsubUser = FB.subscribeUser(user.uid, raw => {
    const remote = normalizeData(raw);
    state.data = remote; saveCache();
    if (state.sync === 'denied') state.sync = 'online';
    emit('data');
    if (first) { first = false; if (!raw) offerImports(localBefore); }
  }, err => {
    console.error(err);
    state.sync = 'denied'; emit('sync');
    toast(FB.describeError(err), { type: 'error', duration: 8000 });
  });
}

function teardownCloud() {
  if (unsubUser) { unsubUser(); unsubUser = null; }
  if (unsubConn) { unsubConn(); unsubConn = null; }
}

async function offerImports(localData) {
  // 1) local-mode data from this device; 2) the old shared database.
  if (localData && !isEmpty(localData)) {
    const n = Object.keys(localData.factories).length;
    toast(`Found ${n} factor${n === 1 ? 'y' : 'ies'} saved on this device.`, {
      action: { label: 'Upload', fn: () => replaceAll(localData, 'Device data uploaded') }, duration: 12000,
    });
    return;
  }
  const legacy = await FB.readLegacy();
  const lf = legacy.factories ? Object.keys(legacy.factories).length : 0;
  if (lf || (legacy.favourites && toArray(legacy.favourites).length)) {
    toast(`Found ${lf} factor${lf === 1 ? 'y' : 'ies'} in the old shared database.`, {
      action: { label: 'Import', fn: () => replaceAll({ ...state.data, factories: { ...legacy.factories, ...state.data.factories }, favourites: legacy.favourites || [] }, 'Old factories imported') },
      duration: 12000,
    });
  }
}

// ── Mutations
function setIn(obj, path, value) {
  const parts = path.split('/');
  let o = obj;
  for (let i = 0; i < parts.length - 1; i++) { o[parts[i]] = o[parts[i]] && typeof o[parts[i]] === 'object' ? { ...o[parts[i]] } : {}; o = o[parts[i]]; }
  const last = parts[parts.length - 1];
  if (value === null || value === undefined) delete o[last]; else o[last] = value;
}
const clean = v => v === undefined ? null : JSON.parse(JSON.stringify(v));

export function write(path, value) {
  const data = { ...state.data };
  setIn(data, path, clean(value));
  state.data = data;
  saveCache();
  emit('data');
  if (state.auth === 'signedIn') {
    FB.writePath(state.user.uid, path, clean(value)).catch(err => {
      console.error(err);
      if (/permission/i.test(err.code || err.message)) { state.sync = 'denied'; emit('sync'); }
      toast('Not saved to cloud — ' + FB.describeError(err), { type: 'error', duration: 7000 });
    });
  }
}

export function replaceAll(raw, msg) {
  const d = normalizeData(raw);
  state.data = d; saveCache(); emit('data');
  if (state.auth === 'signedIn') {
    FB.writeAll(state.user.uid, clean(d))
      .then(() => msg && toast(msg, { type: 'success' }))
      .catch(err => toast(FB.describeError(err), { type: 'error' }));
  } else if (msg) toast(msg, { type: 'success' });
}

export async function signIn() {
  try { await FB.signInWithGoogle(); }
  catch (e) { console.error(e); toast(FB.describeError(e), { type: 'error', duration: 8000 }); }
}
export async function signOut() {
  teardownCloud();
  await FB.signOutUser();
  state.auth = 'signedOut'; state.user = null; state.data = emptyData(); state.sync = 'connecting';
  emit('auth');
}

// ── Domain helpers
export function touchFactory(id, patch) {
  const f = state.data.factories[id];
  if (!f) return;
  write(`factories/${id}`, { ...f, ...patch, updatedAt: Date.now() });
}
export function newFactoryId() {
  return 'f' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
