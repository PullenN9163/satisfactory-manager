// Firebase: Google sign-in + per-user Realtime Database.
// The SDK loads lazily, so the app still boots (in local mode) if gstatic can't be reached.

const SDK = 'https://www.gstatic.com/firebasejs/10.14.1/';

export const firebaseConfig = {
  apiKey: 'AIzaSyD9fsh3bVME2f7hscbl2YxXihtnG8Nz7lw',
  authDomain: 'satisfactory-manager-c75e7.firebaseapp.com',
  databaseURL: 'https://satisfactory-manager-c75e7-default-rtdb.firebaseio.com',
  projectId: 'satisfactory-manager-c75e7',
  storageBucket: 'satisfactory-manager-c75e7.firebasestorage.app',
  messagingSenderId: '172138107723',
  appId: '1:172138107723:web:8d7baf7a63d189f9684ece',
};

let fb = null; // { app, auth, db, mod: {app, auth, db} }

export async function loadFirebase() {
  if (fb) return fb;
  const [appMod, authMod, dbMod] = await Promise.all([
    import(SDK + 'firebase-app.js'),
    import(SDK + 'firebase-auth.js'),
    import(SDK + 'firebase-database.js'),
  ]);
  const app = appMod.initializeApp(firebaseConfig);
  const auth = authMod.getAuth(app);
  const db = dbMod.getDatabase(app);
  fb = { app, auth, db, A: authMod, D: dbMod };
  return fb;
}

export function watchAuth(cb) {
  const { auth, A } = fb;
  return A.onAuthStateChanged(auth, cb);
}

export async function signInWithGoogle() {
  const { auth, A } = await loadFirebase();
  const provider = new A.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    await A.signInWithPopup(auth, provider);
  } catch (e) {
    if (e && (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment')) {
      await A.signInWithRedirect(auth, provider);
      return;
    }
    throw e;
  }
}

export async function signOutUser() {
  if (!fb) return;
  await fb.A.signOut(fb.auth);
}

const userRef = (uid, path = '') => fb.D.ref(fb.db, `users/${uid}${path ? '/' + path : ''}`);

export function subscribeUser(uid, onData, onError) {
  return fb.D.onValue(userRef(uid), snap => onData(snap.val()), onError);
}

export function watchConnection(cb) {
  return fb.D.onValue(fb.D.ref(fb.db, '.info/connected'), snap => cb(snap.val() === true));
}

export function writePath(uid, path, value) {
  return fb.D.set(userRef(uid, path), value === undefined ? null : value);
}

export function writeAll(uid, data) {
  return fb.D.set(userRef(uid), data);
}

/** Read the pre-sign-in shared data (root /factories and /favourites), if rules allow it. */
export async function readLegacy() {
  const { D, db } = fb;
  const out = {};
  for (const key of ['factories', 'favourites']) {
    try { out[key] = (await D.get(D.ref(db, key))).val(); } catch (_) { /* rules may deny — fine */ }
  }
  return out;
}

export function describeError(e) {
  const code = (e && (e.code || e.message)) || String(e);
  if (/unauthorized-domain/.test(code)) return `This domain (${location.hostname}) isn't authorised in Firebase Auth. Add it under Authentication → Settings → Authorized domains.`;
  if (/operation-not-allowed/.test(code)) return 'Google sign-in is not enabled. Enable it in Firebase Console → Authentication → Sign-in method.';
  if (/popup-closed|cancelled-popup/.test(code)) return 'Sign-in was cancelled.';
  if (/network-request-failed/.test(code)) return 'Network error — check your connection.';
  if (/permission[_-]denied/i.test(code)) return 'Firebase denied access. Deploy database.rules.json (see README → Firebase setup).';
  return 'Something went wrong: ' + code;
}
