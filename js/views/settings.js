import { h, icon, mount, toast, confirmSheet } from '../core/ui.js';
import { signIn, signOut, replaceAll, enterLocal, emptyData, write } from '../core/store.js';
import { MAX_PHASE, getPhaseDef } from '../data/phases.js';
import { RECIPES } from '../data/recipes.js';

const SYNC_TEXT = {
  online: ['Synced', 'All changes are saved to the cloud.'],
  connecting: ['Connecting…', 'Reaching Firebase.'],
  offline: ['Offline', 'Changes are kept on this device and will sync when you reconnect.'],
  denied: ['Permission denied', 'Firebase rejected access — the database rules need deploying (see README → Firebase setup).'],
  local: ['Local only', 'Data lives in this browser only. Sign in to sync across iPad, phone and PC.'],
};

export function createSettings(el) {
  function render(state) {
    const { user, auth, sync, data } = state;
    const [syncTitle, syncText] = SYNC_TEXT[sync] || SYNC_TEXT.connecting;
    const fileIn = h('input', { type: 'file', accept: 'application/json,.json', hidden: true, onchange: () => importFile(fileIn.files[0]) });

    mount(el, h('div', { class: 'page settings' },
      h('header', { class: 'page-head' }, h('h1', { class: 'page-title' }, 'Settings')),
      h('div', { class: 'settings-grid' },
        h('section', { class: 'card' },
          h('div', { class: 'section-head' }, h('h2', { class: 'section-title' }, 'Account')),
          auth === 'signedIn'
            ? h('div', { class: 'account' },
                user.photo ? h('img', { class: 'avatar', src: user.photo, alt: '', referrerPolicy: 'no-referrer' }) : h('div', { class: 'avatar' }, user.name[0]),
                h('div', null, h('div', { class: 'strong' }, user.name), h('div', { class: 'muted small' }, user.email)),
                h('button', { class: 'btn ghost sm', onclick: signOut }, icon('logout', 16), 'Sign out'))
            : h('div', { class: 'account' },
                h('div', { class: 'avatar' }, icon('cloud', 20)),
                h('div', null, h('div', { class: 'strong' }, 'Not signed in'), h('div', { class: 'muted small' }, 'Sign in to sync and back up your factories.')),
                state.fbAvailable ? h('button', { class: 'btn primary sm', onclick: signIn }, 'Sign in with Google') : h('span', { class: 'muted small' }, 'Firebase unreachable')),
          h('div', { class: 'sync-line sync-' + sync }, h('span', { class: 'dot' }), h('div', null, h('b', null, syncTitle), h('div', { class: 'muted small' }, syncText)))),

        h('section', { class: 'card' },
          h('div', { class: 'section-head' }, h('h2', { class: 'section-title' }, 'Progress')),
          h('label', { class: 'field' }, h('span', { class: 'field-label' }, 'Current phase'),
            h('div', { class: 'seg-group' }, Array.from({ length: MAX_PHASE }, (_, i) => i + 1).map(n =>
              h('button', { class: 'seg' + (data.phase === n ? ' on' : ''), onclick: () => write('phase', n) }, String(n))))),
          h('p', { class: 'muted small' }, `${getPhaseDef(data.phase).name} — controls which recipe tiers are shown as unlocked.`),
          h('button', { class: 'btn ghost sm', onclick: async () => {
            if (await confirmSheet({ title: 'Reset objectives?', message: 'Unticks every phase objective. Factories are not affected.', confirmLabel: 'Reset', danger: true }))
              write('objectives', null);
          } }, 'Reset objectives')),

        h('section', { class: 'card' },
          h('div', { class: 'section-head' }, h('h2', { class: 'section-title' }, 'Backup')),
          h('p', { class: 'muted small' }, `${Object.keys(data.factories).length} factories · ${data.favourites.length} favourites`),
          h('div', { class: 'btn-row' },
            h('button', { class: 'btn ghost', onclick: () => exportData(data) }, icon('download', 18), 'Export JSON'),
            h('button', { class: 'btn ghost', onclick: () => fileIn.click() }, icon('upload', 18), 'Import JSON'), fileIn),
          auth === 'local' ? h('button', { class: 'btn ghost danger sm', style: { marginTop: '12px' }, onclick: async () => {
            if (await confirmSheet({ title: 'Erase local data?', message: 'Removes all factories stored in this browser.', confirmLabel: 'Erase', danger: true })) replaceAll(emptyData(), 'Local data erased');
          } }, icon('trash', 16), 'Erase local data') : null),

        h('section', { class: 'card' },
          h('div', { class: 'section-head' }, h('h2', { class: 'section-title' }, 'About')),
          h('p', { class: 'muted small' }, `${RECIPES.length} recipes (Satisfactory 1.0) · power uses the in-game clock-speed curve · belts Mk.1–Mk.6.`),
          h('p', { class: 'muted small' }, 'Unofficial fan project. Satisfactory and FICSIT belong to Coffee Stain Studios.'),
          auth !== 'local' && auth !== 'signedIn' ? h('button', { class: 'link-btn', onclick: () => enterLocal() }, 'Use offline mode') : null))));
  }

  function exportData(data) {
    const blob = new Blob([JSON.stringify({ app: 'satisfactory-manager', version: 2, exportedAt: new Date().toISOString(), data }, null, 2)], { type: 'application/json' });
    const a = h('a', { href: URL.createObjectURL(blob), download: `satisfactory-manager-${new Date().toISOString().slice(0, 10)}.json` });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  async function importFile(file) {
    if (!file) return;
    try {
      const json = JSON.parse(await file.text());
      const data = json.data || json;
      const n = Object.keys(data.factories || {}).length;
      if (await confirmSheet({ title: 'Replace your data?', message: `Import ${n} factories from “${file.name}”? This replaces what you have now.`, confirmLabel: 'Import' }))
        replaceAll(data, `Imported ${n} factories`);
    } catch (e) { toast('That file isn’t a valid backup.', { type: 'error' }); }
  }

  return { update(state) { render(state); } };
}
