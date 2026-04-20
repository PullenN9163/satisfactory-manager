import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getDatabase, ref, onValue, set, push, remove }
  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';

const firebaseConfig = {
  apiKey: "AIzaSyD9fsh3bVME2f7hscbl2YxXihtnG8Nz7lw",
  authDomain: "satisfactory-manager-c75e7.firebaseapp.com",
  databaseURL: "https://satisfactory-manager-c75e7-default-rtdb.firebaseio.com",
  projectId: "satisfactory-manager-c75e7",
  storageBucket: "satisfactory-manager-c75e7.firebasestorage.app",
  messagingSenderId: "172138107723",
  appId: "1:172138107723:web:8d7baf7a63d189f9684ece"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let _onSyncChange = null;
export function onSyncStatus(cb) { _onSyncChange = cb; }

export const appData = { factories: {}, favourites: [] };

export function startSync(onChange) {
  onValue(ref(db, '/'), snapshot => {
    const val = snapshot.val() || {};
    appData.factories = val.factories || {};
    appData.favourites = Array.isArray(val.favourites) ? val.favourites : [];
    if (_onSyncChange) _onSyncChange('ok');
    onChange(appData);
  }, () => { if (_onSyncChange) _onSyncChange('error'); });
}

export function saveFactory(factory) { return set(ref(db, `factories/${factory.id}`), factory); }
export function deleteFactory(id) { return remove(ref(db, `factories/${id}`)); }
export function updateTodos(factoryId, todos) { return set(ref(db, `factories/${factoryId}/todos`), todos); }
export function updateRecipeSelections(factoryId, sels) { return set(ref(db, `factories/${factoryId}/recipeSelections`), sels); }
export function saveFavourites(favs) { return set(ref(db, 'favourites'), favs); }
export function newId() { return push(ref(db, 'factories')).key; }
