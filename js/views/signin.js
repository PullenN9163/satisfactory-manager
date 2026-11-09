import { h, icon, mount } from '../core/ui.js';
import { signIn, enterLocal } from '../core/store.js';
import { isStandalone, isFirebaseHosted, HOSTED_URL } from '../core/firebase.js';

export function renderSignIn(el, { fbAvailable }) {
  const btn = h('button', { class: 'btn google', disabled: !fbAvailable, onclick: async () => {
    btn.disabled = true; btn.classList.add('busy');
    await signIn();
    btn.disabled = false; btn.classList.remove('busy');
  } }, googleMark(), 'Sign in with Google');

  mount(el, h('div', { class: 'signin' },
    h('div', { class: 'signin-card' },
      h('div', { class: 'hazard-strip' }),
      h('div', { class: 'signin-logo' }, h('img', { src: 'icons/icon.svg', alt: '', width: 72, height: 72 })),
      h('div', { class: 'eyebrow' }, 'FICSIT Employee Portal'),
      h('h1', { class: 'brand-title' }, 'SATISFACTORY', h('span', null, 'MANAGER')),
      h('p', { class: 'muted' }, 'Plan production lines, switch alternate recipes, track every build task — synced between your iPad and PC.'),
      h('ul', { class: 'signin-feats' },
        h('li', null, icon('factory', 18), 'Full production chains with power & belt tiers'),
        h('li', null, icon('graph', 18), 'Interactive factory graphs'),
        h('li', null, icon('rocket', 18), 'Space Elevator phase tracker')),
      btn,
      !fbAvailable ? h('p', { class: 'form-error' }, 'Can’t reach Firebase right now.') : null,
      isStandalone() && !isFirebaseHosted() ? h('p', { class: 'note small' },
        'Sign-in from the Home Screen works best from the Firebase-hosted app. Open ',
        h('a', { href: HOSTED_URL, class: 'amber', target: '_blank', rel: 'noopener' }, HOSTED_URL.replace('https://', '').replace(/\/$/, '')),
        ' in Safari, then Share → Add to Home Screen.') : null,
      h('button', { class: 'link-btn', onclick: () => enterLocal() }, 'Continue offline — this device only'),
      h('p', { class: 'muted tiny' }, 'The factory must grow.'))));
}

function googleMark() {
  const s = h('svg', { ns: 'svg', width: 20, height: 20, viewBox: '0 0 48 48', 'aria-hidden': 'true' });
  s.innerHTML = '<path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/>';
  return s;
}
