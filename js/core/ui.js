// Tiny DOM toolkit: h() element builder, icons, toasts, sheets, confirm, ring, liquid bar.

export function h(tag, props, ...kids) {
  const el = tag === 'svg' || props?.ns === 'svg'
    ? document.createElementNS('http://www.w3.org/2000/svg', tag)
    : document.createElement(tag);
  if (props) for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false || k === 'ns') continue;
    if (k === 'class') el.setAttribute('class', v);
    else if (k === 'style' && typeof v === 'object') {
      for (const [sk, sv] of Object.entries(v)) sk.startsWith('--') ? el.style.setProperty(sk, sv) : (el.style[sk] = sv);
    }
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'html') el.innerHTML = v;
    else if (k in el && !(el instanceof SVGElement) && k !== 'list' && k !== 'form') el[k] = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  append(el, kids);
  return el;
}
function append(el, kids) {
  for (const k of kids.flat(Infinity)) {
    if (k == null || k === false) continue;
    el.appendChild(k instanceof Node ? k : document.createTextNode(String(k)));
  }
}
export function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); return el; }
export function mount(el, ...kids) { clear(el); append(el, kids); return el; }

// ── Icons (inline SVG paths, 24×24, stroke-based)
const ICONS = {
  hub: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  book: '<path d="M4 4h10a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4z"/><path d="M4 16a4 4 0 0 1 4-4h10"/>',
  factory: '<path d="M3 21V10l6 4V10l6 4V4h6v17z"/><path d="M7 17h2M12 17h2M17 17h2"/>',
  rocket: '<path d="M12 2c4 3 6 7 6 11l-3 3H9l-3-3c0-4 2-8 6-11z"/><circle cx="12" cy="10" r="2"/><path d="M9 16l-2 5 3-2M15 16l2 5-3-2"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  star: '<path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
  back: '<path d="M15 18l-6-6 6-6"/>',
  chevron: '<path d="M9 18l6-6-6-6"/>',
  down: '<path d="M6 9l6 6 6-6"/>',
  bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  graph: '<circle cx="5" cy="6" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="19" cy="12" r="2"/><path d="M7 6.5l10 5M7 17.5l10-5"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  tasks: '<path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"/>',
  x: '<path d="M18 6L6 18M6 6l12 12"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  warn: '<path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  cloud: '<path d="M18 10h-1.3A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>',
  filter: '<path d="M22 3H2l8 9.5V19l4 2v-8.5z"/>',
  fit: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
};
export function icon(name, size = 20, cls = '') {
  const s = h('svg', { ns: 'svg', width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: 'icon ' + cls, 'aria-hidden': 'true' });
  s.innerHTML = ICONS[name] || '';
  return s;
}

// ── Toasts
export function toast(msg, opts = {}) {
  const root = document.getElementById('toast-root');
  const t = h('div', { class: 'toast ' + (opts.type || ''), role: 'status' },
    opts.type === 'error' ? icon('warn', 18) : opts.type === 'success' ? icon('check', 18) : null,
    h('span', { class: 'toast-msg' }, msg),
    opts.action ? h('button', { class: 'toast-action', onclick: () => { opts.action.fn(); dismiss(); } }, opts.action.label) : null);
  root.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  const timer = setTimeout(dismiss, opts.duration || (opts.action ? 6000 : 3200));
  function dismiss() { clearTimeout(timer); t.classList.remove('show'); setTimeout(() => t.remove(), 300); }
  return dismiss;
}

// ── Sheets (modal panels: bottom sheet on narrow, centered dialog on wide)
let sheetStack = [];
export function openSheet({ title, body, footer, onClose, wide }) {
  const root = document.getElementById('sheet-root');
  const close = () => {
    overlay.classList.remove('show');
    sheetStack = sheetStack.filter(s => s !== close);
    document.removeEventListener('keydown', onKey);
    setTimeout(() => overlay.remove(), 250);
    onClose && onClose();
  };
  const onKey = e => { if (e.key === 'Escape' && sheetStack[sheetStack.length - 1] === close) close(); };
  const panel = h('div', { class: 'sheet' + (wide ? ' wide' : ''), role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
    h('div', { class: 'sheet-grip' }),
    h('header', { class: 'sheet-head' },
      h('h2', { class: 'sheet-title' }, title),
      h('button', { class: 'icon-btn', 'aria-label': 'Close', onclick: close }, icon('x'))),
    h('div', { class: 'sheet-body' }, body),
    footer ? h('footer', { class: 'sheet-foot' }, footer) : null);
  const overlay = h('div', { class: 'sheet-overlay', onclick: e => { if (e.target === overlay) close(); } }, panel);
  root.appendChild(overlay);
  sheetStack.push(close);
  document.addEventListener('keydown', onKey);
  requestAnimationFrame(() => overlay.classList.add('show'));
  return { close, panel };
}

export function confirmSheet({ title, message, confirmLabel = 'Confirm', danger }) {
  return new Promise(resolve => {
    let done = false;
    const finish = v => { if (!done) { done = true; resolve(v); s.close(); } };
    const s = openSheet({
      title,
      body: h('p', { class: 'muted' }, message),
      footer: [
        h('button', { class: 'btn ghost', onclick: () => finish(false) }, 'Cancel'),
        h('button', { class: 'btn ' + (danger ? 'danger' : 'primary'), onclick: () => finish(true) }, confirmLabel),
      ],
      onClose: () => { if (!done) { done = true; resolve(false); } },
    });
  });
}

// ── Progress ring (SVG)
export function ring(pct, { size = 56, stroke = 5, label, cls = '' } = {}) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const svg = h('svg', { ns: 'svg', width: size, height: size, viewBox: `0 0 ${size} ${size}`, class: 'ring ' + cls, role: 'img', 'aria-label': `${pct}%` });
  svg.innerHTML =
    `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="ring-track" stroke-width="${stroke}" fill="none"/>` +
    `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="ring-fill" stroke-width="${stroke}" fill="none" stroke-linecap="round"
      stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct / 100)}" transform="rotate(-90 ${size / 2} ${size / 2})"/>` +
    `<text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" class="ring-text" style="font-size:${Math.round(size / 4.2)}px">${label ?? pct + '%'}</text>`;
  return svg;
}

// ── Liquid progress bar (canvas). One shared RAF loop drives all visible bars.
const bars = new Set();
let raf = null;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const lastLevel = new Map(); // key -> last drawn level, so re-renders animate from where they were
export function liquidBar(pct, { height = 40, label = '', key } = {}) {
  const canvas = h('canvas', { class: 'liquid-canvas' });
  const text = h('div', { class: 'liquid-text' }, label);
  const el = h('div', { class: 'liquid', style: { height: height + 'px' } }, canvas, text);
  const start = reduceMotion.matches ? pct : (key && lastLevel.has(key) ? lastLevel.get(key) : 0);
  const state = { el, canvas, target: pct, current: start, key };
  el._liquid = state;
  bars.add(state);
  if (!raf) raf = requestAnimationFrame(loop);
  return el;
}
export function setLiquid(el, pct, label) {
  if (!el || !el._liquid) return;
  el._liquid.target = pct;
  if (label != null) el.querySelector('.liquid-text').textContent = label;
  if (!raf) raf = requestAnimationFrame(loop);
}
function loop(ts) {
  const t = ts / 1000;
  let active = false;
  for (const s of bars) {
    if (!s.el.isConnected) { bars.delete(s); continue; }
    if (s.el.offsetParent === null) continue;
    active = true;
    const d = s.target - s.current;
    s.current += Math.abs(d) > 0.1 ? d * 0.08 : d;
    if (s.key) lastLevel.set(s.key, s.current);
    drawLiquid(s, t);
  }
  raf = active ? requestAnimationFrame(loop) : null;
}
function drawLiquid(s, t) {
  const { canvas } = s;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const W = s.el.clientWidth, H = s.el.clientHeight;
  if (canvas.width !== Math.round(W * dpr)) { canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  if (s.current <= 0.2) return;
  const fillX = W * s.current / 100;
  const full = s.current >= 99.5;
  const amp = full || reduceMotion.matches ? 0 : Math.min(4, H / 10);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(fillX, 0);
  for (let y = 0; y <= H; y += 2) ctx.lineTo(fillX + Math.sin(y * 0.12 + t * 2.4) * amp, y);
  ctx.lineTo(0, H); ctx.closePath();
  const g = ctx.createLinearGradient(0, 0, Math.max(fillX, 1), 0);
  if (full) { g.addColorStop(0, '#0f9f6e'); g.addColorStop(1, '#34d399'); }
  else { g.addColorStop(0, '#b83f00'); g.addColorStop(0.6, '#ff6a00'); g.addColorStop(1, '#ffa040'); }
  ctx.fillStyle = g; ctx.fill();
  const gloss = ctx.createLinearGradient(0, 0, 0, H * 0.5);
  gloss.addColorStop(0, 'rgba(255,255,255,0.18)'); gloss.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gloss; ctx.fillRect(0, 0, fillX, H * 0.5);
  if (!full && !reduceMotion.matches) {
    for (let i = 0; i < 6; i++) {
      const bx = fillX * (0.08 + i * 0.15);
      if (bx > fillX - 6) break;
      const by = H - (((t * (0.35 + i * 0.07) + i * 0.37) % 1) * H);
      ctx.beginPath(); ctx.arc(bx, by, 1.4 + (i % 3) * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fill();
    }
  }
}

// ── Celebration burst (lightweight confetti of hazard-colored sparks)
export function celebrate(anchor) {
  if (reduceMotion.matches) return;
  const rect = anchor ? anchor.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 };
  const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
  const layer = h('div', { class: 'burst', style: { left: cx + 'px', top: cy + 'px' } });
  const colors = ['#ff6a00', '#ffd060', '#34d399', '#5aa0ff', '#ffffff'];
  for (let i = 0; i < 22; i++) {
    const a = (Math.PI * 2 * i) / 22 + Math.random() * 0.3;
    const d = 50 + Math.random() * 70;
    layer.appendChild(h('i', { style: {
      background: colors[i % colors.length],
      '--dx': Math.cos(a) * d + 'px', '--dy': Math.sin(a) * d + 'px', '--r': Math.random() * 360 + 'deg',
    } }));
  }
  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), 900);
}

export function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
export function timeAgo(ts) {
  if (!ts || ts < 1.5e12) return '';
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  const m = Math.round(s / 60); if (m < 60) return m + 'm ago';
  const hr = Math.round(m / 60); if (hr < 24) return hr + 'h ago';
  const d = Math.round(hr / 24); return d + 'd ago';
}
