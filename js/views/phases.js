import { h, icon, mount, ring, liquidBar, celebrate, confirmSheet, toast } from '../core/ui.js';
import { write } from '../core/store.js';
import { PHASES, MAX_PHASE, phasePct } from '../data/phases.js';
import { itemBadge } from './common.js';
import { openNewFactory } from './new-factory.js';

export function createPhases(el) {
  function render(state) {
    const { phase, objectives } = state.data;
    mount(el, h('div', { class: 'page phases' },
      h('header', { class: 'page-head' }, h('div', null,
        h('h1', { class: 'page-title' }, 'Project Assembly'),
        h('div', { class: 'muted small' }, 'Space Elevator phases · objectives sync across your devices'))),
      h('div', { class: 'phase-track' }, PHASES.map(p => {
        const pct = phasePct(p.id, objectives);
        const st = p.id < phase ? 'complete' : p.id === phase ? 'current' : 'locked';
        return h('button', { class: 'pt-node ' + st, onclick: () => document.getElementById('phase-' + p.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) },
          ring(st === 'complete' ? 100 : pct, { size: 64, stroke: 6, label: st === 'complete' ? '✓' : st === 'locked' ? String(p.id) : undefined, cls: st }),
          h('span', { class: 'pt-label' }, p.short), h('span', { class: 'pt-name muted small' }, p.name));
      })),
      h('div', { class: 'timeline' }, PHASES.map(p => phaseCard(p, phase, objectives)))));
  }

  function phaseCard(p, phase, objectives) {
    const pct = phasePct(p.id, objectives);
    const st = p.id < phase ? 'complete' : p.id === phase ? 'current' : 'locked';
    const done = p.objectives.filter(o => objectives[o.id]).length;
    return h('section', { class: 'card phase-card ' + st, id: 'phase-' + p.id },
      h('header', { class: 'pc-head' },
        h('div', { class: 'pc-num' }, st === 'complete' ? icon('check', 22) : st === 'locked' ? icon('lock', 20) : String(p.id)),
        h('div', { class: 'pc-title' },
          h('div', { class: 'eyebrow' }, p.short, st === 'current' ? h('span', { class: 'tag amber' }, 'CURRENT') : st === 'complete' ? h('span', { class: 'tag green' }, 'DONE') : h('span', { class: 'tag' }, 'PREVIEW')),
          h('h2', null, p.name),
          h('p', { class: 'muted small' }, p.tagline)),
        st === 'current' && p.id < MAX_PHASE ? h('button', { class: 'btn primary hazard', onclick: e => advance(p, pct, e.currentTarget) }, 'Advance', icon('chevron', 18)) : null),
      liquidBar(pct, { height: 30, label: `${done}/${p.objectives.length} objectives`, key: 'phase-' + p.id }),
      h('div', { class: 'deliver' }, h('span', { class: 'field-label' }, 'Space Elevator delivery'),
        h('div', { class: 'chip-row' }, p.deliver.map(d => h('span', { class: 'chip static' }, itemBadge(d.item, 'xs'), `${d.qty.toLocaleString()} × ${d.item}`)))),
      h('div', { class: 'obj-list' }, p.objectives.map(o => {
        const isDone = !!objectives[o.id];
        return h('div', { class: 'obj' + (isDone ? ' done' : '') },
          h('button', { class: 'check' + (isDone ? ' on' : ''), 'aria-label': (isDone ? 'Undo: ' : 'Done: ') + o.text,
            onclick: e => { if (!isDone) celebrate(e.currentTarget); write('objectives/' + o.id, isDone ? null : true); } }, icon('check', 16)),
          h('span', { class: 'obj-text' }, o.text),
          o.suggest ? h('button', { class: 'btn sm ghost', onclick: () => openNewFactory({ item: o.suggest.item, rate: o.suggest.rate }) }, 'Plan it') : null);
      })),
      st !== 'current' ? h('div', { class: 'pc-foot' },
        h('button', { class: 'link-btn', onclick: () => write('phase', p.id) }, st === 'locked' ? 'Jump to this phase' : 'Set as current phase')) : null);
  }

  async function advance(p, pct, btn) {
    if (pct < 100) {
      const ok = await confirmSheet({ title: `Advance past ${p.short}?`, message: `${100 - pct}% of objectives are still open. You can always come back and tick them off.`, confirmLabel: 'Advance anyway' });
      if (!ok) return;
    }
    celebrate(btn);
    write('phase', p.id + 1);
    toast(`Phase ${p.id + 1} unlocked — new recipes available!`, { type: 'success' });
    setTimeout(() => document.getElementById('phase-' + (p.id + 1))?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
  }

  return { update(state, reason) { if (reason !== 'sync') render(state); } };
}
