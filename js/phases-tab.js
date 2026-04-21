import { PHASE_DEFS, getPhase, setPhase, getPhasePct, getObjectiveDoneMap, toggleObjective } from './phase-state.js';

let _container = null;
let _pillStates = new Map();
let _rafId = null;
let _t = 0;

export function initPhasesTab(container) {
  _container = container;
  renderPhasesTab();
}

export function refreshPhasesTab() {
  if (_container) renderPhasesTab();
}

function renderPhasesTab() {
  const phase = getPhase();
  const objMap = getObjectiveDoneMap();

  PHASE_DEFS.forEach(p => {
    const pct = getPhasePct(p.id);
    if (!_pillStates.has(p.id)) {
      _pillStates.set(p.id, { target: pct, current: pct });
    } else {
      _pillStates.get(p.id).target = pct;
    }
  });

  buildDOM(phase, objMap);
  wireEvents();

  if (_rafId) cancelAnimationFrame(_rafId);
  _rafId = requestAnimationFrame(_loop);
}

function buildDOM(phase, objMap) {
  _container.textContent = '';

  const overview = document.createElement('div');
  overview.className = 'phase-overview';
  PHASE_DEFS.forEach(p => {
    const pct = getPhasePct(p.id);
    const isActive = p.id === phase;
    const isLocked = p.id > phase;
    const isComplete = p.id < phase;

    const wrap = document.createElement('div');
    wrap.className = 'phase-circle-wrap' + (isActive ? ' active' : '') + (isLocked ? ' locked' : '');

    const svgEl = buildSVGCircle(74, pct, isActive, isComplete, isLocked);
    const label = document.createElement('div');
    label.className = 'phase-circle-label';
    label.textContent = p.name;
    wrap.appendChild(svgEl);
    wrap.appendChild(label);
    overview.appendChild(wrap);
  });
  _container.appendChild(overview);

  PHASE_DEFS.forEach(p => {
    const isActive = p.id === phase;
    const isLocked = p.id > phase;
    const doneCount = p.objectives.filter(o => objMap[o.id]).length;
    const pct = getPhasePct(p.id);

    const card = document.createElement('div');
    card.className = 'phase-card' + (isActive ? ' active' : '') + (isLocked ? ' locked' : '');
    card.dataset.phase = p.id;

    const pillWrap = document.createElement('div');
    pillWrap.className = 'phase-card-pill-wrap';

    const canvas = document.createElement('canvas');
    canvas.className = 'phase-liquid-canvas';
    canvas.id = 'phase-pill-' + p.id;
    canvas.height = 64;
    pillWrap.appendChild(canvas);

    const pillText = document.createElement('div');
    pillText.className = 'phase-pill-text';

    if (isLocked) {
      const lockIcon = document.createElement('span');
      lockIcon.className = 'phase-locked-icon';
      lockIcon.textContent = '\uD83D\uDD12';
      pillText.appendChild(lockIcon);
    }

    const nameSpan = document.createElement('span');
    nameSpan.className = 'phase-pill-name';
    nameSpan.textContent = p.name;
    pillText.appendChild(nameSpan);

    const subSpan = document.createElement('span');
    subSpan.className = 'phase-pill-sub';
    subSpan.textContent = p.subtitle;
    pillText.appendChild(subSpan);

    const pctSpan = document.createElement('span');
    pctSpan.className = 'phase-pill-pct';
    pctSpan.textContent = pct + '%';
    pillText.appendChild(pctSpan);

    const objSpan = document.createElement('span');
    objSpan.className = 'phase-pill-obj';
    objSpan.textContent = doneCount + '/' + p.objectives.length;
    pillText.appendChild(objSpan);

    pillWrap.appendChild(pillText);

    if (isActive && p.id < 4) {
      const advBtn = document.createElement('button');
      advBtn.className = 'advance-btn';
      advBtn.textContent = 'ADVANCE \u2192';
      pillWrap.appendChild(advBtn);
    }

    card.appendChild(pillWrap);

    if (!isLocked) {
      const objDiv = document.createElement('div');
      objDiv.className = 'phase-objectives';
      p.objectives.forEach(o => {
        const done = !!objMap[o.id];
        const row = document.createElement('div');
        row.className = 'obj-row' + (done ? ' done' : '');
        row.dataset.obj = o.id;

        const check = document.createElement('div');
        check.className = 'obj-check' + (done ? ' checked' : '');
        if (done) {
          check.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>';
        }

        const txt = document.createElement('span');
        txt.className = 'obj-text';
        txt.textContent = o.text;

        row.appendChild(check);
        row.appendChild(txt);
        objDiv.appendChild(row);
      });
      card.appendChild(objDiv);
    } else {
      const lockedMsg = document.createElement('div');
      lockedMsg.className = 'phase-locked-msg';
      lockedMsg.textContent = 'Complete previous phases to unlock';
      card.appendChild(lockedMsg);
    }

    _container.appendChild(card);
  });
}

function buildSVGCircle(size, pct, isActive, isComplete, isLocked) {
  const r = (size - 8) / 2;
  const cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct / 100;
  const stroke = isLocked ? '#2A3545' : '#FF6A00';
  const textFill = isLocked ? '#4A5A6A' : '#FF6A00';

  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.setAttribute('class', 'phase-svg' + (isActive ? ' phase-svg-pulse' : ''));

  const bg = document.createElementNS(ns, 'circle');
  bg.setAttribute('cx', cx); bg.setAttribute('cy', cy); bg.setAttribute('r', r);
  bg.setAttribute('fill', 'none'); bg.setAttribute('stroke', '#2A2A2A'); bg.setAttribute('stroke-width', '4');
  svg.appendChild(bg);

  const arc = document.createElementNS(ns, 'circle');
  arc.setAttribute('cx', cx); arc.setAttribute('cy', cy); arc.setAttribute('r', r);
  arc.setAttribute('fill', 'none'); arc.setAttribute('stroke', stroke); arc.setAttribute('stroke-width', '4');
  arc.setAttribute('stroke-dasharray', dash.toFixed(2) + ' ' + circ.toFixed(2));
  arc.setAttribute('stroke-dashoffset', (circ / 4).toFixed(2));
  arc.setAttribute('stroke-linecap', 'round');
  svg.appendChild(arc);

  const label = isLocked ? '\uD83D\uDD12' : isComplete ? '\u2713' : pct + '%';
  const text = document.createElementNS(ns, 'text');
  text.setAttribute('x', cx); text.setAttribute('y', cy + 5);
  text.setAttribute('text-anchor', 'middle'); text.setAttribute('fill', textFill);
  text.setAttribute('font-size', '12'); text.setAttribute('font-family', 'Chakra Petch,sans-serif');
  text.setAttribute('font-weight', '700');
  text.textContent = label;
  svg.appendChild(text);

  return svg;
}

function wireEvents() {
  _container.querySelectorAll('.obj-row').forEach(row => {
    row.addEventListener('click', () => {
      toggleObjective(row.dataset.obj);
      renderPhasesTab();
    });
  });

  const advBtn = _container.querySelector('.advance-btn');
  if (advBtn) {
    advBtn.addEventListener('click', () => setPhase(getPhase() + 1));
  }
}

function _loop() {
  _t += 0.035;
  let hasVisible = false;

  PHASE_DEFS.forEach(p => {
    const canvas = document.getElementById('phase-pill-' + p.id);
    if (!canvas || canvas.offsetParent === null) return;
    hasVisible = true;

    const state = _pillStates.get(p.id);
    if (!state) return;

    const diff = state.target - state.current;
    state.current += Math.abs(diff) > 0.1 ? diff * 0.08 : diff;

    const W = canvas.width = Math.round(canvas.offsetWidth);
    const H = 64;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, W, H);

    const pct = state.current;
    if (pct <= 0) return;

    const fillX = W * pct / 100;
    const done = pct >= 99.5;
    const waveAmp = done ? 0 : 4;
    const rad = H / 2;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(rad, 0); ctx.lineTo(W - rad, 0);
    ctx.arcTo(W, 0, W, H, rad); ctx.lineTo(W, H - rad);
    ctx.arcTo(W, H, W - rad, H, rad); ctx.lineTo(rad, H);
    ctx.arcTo(0, H, 0, H - rad, rad); ctx.lineTo(0, rad);
    ctx.arcTo(0, 0, rad, 0, rad);
    ctx.closePath();
    ctx.clip();

    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(fillX, 0);
    for (let y = 0; y <= H + 1; y++) ctx.lineTo(fillX + Math.sin(y * 0.1 + _t * 2.2) * waveAmp, y);
    ctx.lineTo(0, H);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, 0, fillX, 0);
    g.addColorStop(0, '#CC4400'); g.addColorStop(0.5, '#FF6A00'); g.addColorStop(1, '#FF8C30');
    ctx.fillStyle = g; ctx.fill();

    const gloss = ctx.createLinearGradient(0, 0, 0, H * 0.45);
    gloss.addColorStop(0, 'rgba(255,255,255,0.12)'); gloss.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gloss; ctx.fillRect(0, 0, fillX, H * 0.45);

    if (!done) {
      [{bx:0.08,by:0.6,br:2.5,s:0.55,bp:0},{bx:0.22,by:0.7,br:2,s:0.4,bp:1.2},
       {bx:0.38,by:0.5,br:2.2,s:0.75,bp:2.1},{bx:0.55,by:0.65,br:1.6,s:0.5,bp:0.7},
       {bx:0.72,by:0.55,br:2.5,s:0.65,bp:1.5}].forEach(b => {
        const bx = fillX * b.bx;
        if (bx > fillX - 4) return;
        const rawY = b.by * H - ((_t * b.s + b.bp) % 1) * H;
        ctx.beginPath(); ctx.arc(bx, ((rawY % H) + H) % H, b.br, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.fill();
      });
      const eg = ctx.createLinearGradient(fillX - 12, 0, fillX + 16, 0);
      eg.addColorStop(0, 'rgba(255,130,0,0)');
      eg.addColorStop(0.5, 'rgba(255,160,60,0.5)');
      eg.addColorStop(1, 'rgba(255,106,0,0)');
      ctx.fillStyle = eg; ctx.fillRect(fillX - 12, 0, 28, H);
    }
    ctx.restore();
  });

  if (!hasVisible) { _rafId = null; return; }
  _rafId = requestAnimationFrame(_loop);
}
