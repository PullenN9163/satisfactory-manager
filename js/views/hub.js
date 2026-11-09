import { h, icon, ring, liquidBar, celebrate, mount, timeAgo } from '../core/ui.js';
import { write } from '../core/store.js';
import { go } from '../core/router.js';
import { getPhaseDef, phasePct } from '../data/phases.js';
import { fmt, fmtMW } from '../planner.js';
import { planOf, factoryProgress, itemBadge, emptyState, sectionHead } from './common.js';
import { openNewFactory } from './new-factory.js';

const GREETINGS = ['The factory must grow.', 'FICSIT appreciates your continued productivity.', 'Efficiency is its own reward.', 'Another shift, another megafactory.', 'Conveyor belts don\'t lay themselves.'];

export function createHub(el) {
  const greet = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
  function render(state) {
    const { data, user } = state;
    const phase = getPhaseDef(data.phase);
    const pct = phasePct(phase.id, data.objectives);
    const factories = Object.values(data.factories).sort((a, b) => b.updatedAt - a.updatedAt);
    const next = phase.objectives.filter(o => !data.objectives[o.id]).slice(0, 3);

    // Empire totals
    let buildings = 0, power = 0, openTasks = 0;
    const raw = new Map();
    factories.forEach(f => {
      const p = planOf(f);
      buildings += p.totalBuildings; power += p.totalPower;
      openTasks += (f.todos || []).filter(t => !t.done).length;
      p.raw.forEach(r => raw.set(r.item, (raw.get(r.item) || 0) + r.rate));
    });
    const rawTop = [...raw.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
    const rawMax = rawTop.length ? rawTop[0][1] : 1;

    const hero = h('section', { class: 'card hero' },
      h('div', { class: 'hero-grid' },
        h('div', { class: 'hero-copy' },
          h('div', { class: 'eyebrow' }, icon('sparkle', 14), user ? `Welcome back, ${user.name.split(' ')[0]}` : 'Welcome back, Pioneer'),
          h('h1', { class: 'hero-title' }, phase.short, h('span', { class: 'hero-sub' }, ' · ' + phase.name)),
          h('p', { class: 'muted' }, phase.tagline),
          h('div', { class: 'chip-row' }, phase.deliver.map(d => h('span', { class: 'chip static' }, itemBadge(d.item, 'xs'), `${d.qty.toLocaleString()} × ${d.item}`))),
          liquidBar(pct, { height: 34, label: `${pct}% of phase objectives`, key: 'phase-' + phase.id }),
          h('div', { class: 'btn-row' },
            h('button', { class: 'btn primary hazard', onclick: () => openNewFactory() }, icon('plus', 18), 'Plan a factory'),
            h('button', { class: 'btn ghost', onclick: () => go('phases') }, icon('rocket', 18), 'Project Assembly'))),
        h('div', { class: 'hero-ring' }, ring(pct, { size: 148, stroke: 12, cls: 'ring-xl' }), h('div', { class: 'hero-ring-cap' }, greet))));

    const nextCard = h('section', { class: 'card' },
      sectionHead('Next objectives', h('button', { class: 'link-btn', onclick: () => go('phases') }, 'All phases', icon('chevron', 16))),
      next.length
        ? h('div', { class: 'obj-list' }, next.map(o => h('div', { class: 'obj' },
            h('button', { class: 'check', 'aria-label': 'Mark done: ' + o.text, onclick: e => { celebrate(e.currentTarget); write('objectives/' + o.id, true); } }, icon('check', 16)),
            h('span', { class: 'obj-text' }, o.text),
            o.suggest ? h('button', { class: 'btn sm ghost', onclick: () => openNewFactory({ item: o.suggest.item, rate: o.suggest.rate }) }, 'Plan it') : null)))
        : h('div', { class: 'done-banner' }, icon('check', 20), h('div', null, h('b', null, 'Phase objectives complete!'), h('div', { class: 'muted small' }, 'Head to Phases and advance when the Space Elevator delivery is done.')),
            h('button', { class: 'btn sm primary', onclick: () => go('phases') }, 'Advance')));

    const continueCard = h('section', { class: 'card span-2' },
      sectionHead('Continue building', factories.length ? h('button', { class: 'link-btn', onclick: () => go('factories') }, 'All factories', icon('chevron', 16)) : null),
      factories.length
        ? h('div', { class: 'factory-mini-grid' }, factories.slice(0, 4).map(f => {
            const p = planOf(f), pr = factoryProgress(f);
            return h('button', { class: 'factory-mini', onclick: () => go('factories/' + f.id + '/plan') },
              itemBadge(f.outputItem, 'lg'),
              h('div', { class: 'fm-body' },
                h('div', { class: 'fm-name' }, f.name),
                h('div', { class: 'muted small' }, `${f.outputItem} · ${fmt(f.outputRate)}/min`),
                h('div', { class: 'fm-meta' }, h('span', null, icon('factory', 13), p.totalBuildings), h('span', null, icon('bolt', 13), fmtMW(p.totalPower)), h('span', { class: 'muted' }, timeAgo(f.updatedAt)))),
              ring(pr.pct, { size: 46, stroke: 4, label: pr.total ? undefined : '—' }));
          }))
        : emptyState({ title: 'No factories yet', text: 'Pick something to build and the planner works out every machine, belt and ore node.',
            action: h('div', { class: 'chip-row center' }, (phase.objectives.filter(o => o.suggest).slice(0, 4)).map(o =>
              h('button', { class: 'chip', onclick: () => openNewFactory({ item: o.suggest.item, rate: o.suggest.rate }) }, itemBadge(o.suggest.item, 'xs'), o.suggest.item))) }));

    const statsCard = h('section', { class: 'card' },
      sectionHead('Empire'),
      h('div', { class: 'stat-grid' },
        h('div', { class: 'stat' }, h('div', { class: 'stat-value' }, factories.length), h('div', { class: 'stat-label' }, 'Factories')),
        h('div', { class: 'stat' }, h('div', { class: 'stat-value' }, buildings), h('div', { class: 'stat-label' }, 'Buildings')),
        h('div', { class: 'stat' }, h('div', { class: 'stat-value amber' }, fmtMW(power)), h('div', { class: 'stat-label' }, 'Power draw')),
        h('div', { class: 'stat' }, h('div', { class: 'stat-value blue' }, openTasks), h('div', { class: 'stat-label' }, 'Open tasks'))),
      rawTop.length ? h('div', { class: 'bars' }, h('div', { class: 'field-label' }, 'Raw resources / min'),
        rawTop.map(([item, rate]) => h('div', { class: 'bar-row' },
          h('span', { class: 'bar-label' }, item),
          h('span', { class: 'bar' }, h('i', { style: { width: Math.max(3, rate / rawMax * 100) + '%' } })),
          h('span', { class: 'bar-val' }, fmt(rate))))) : null);

    mount(el, h('div', { class: 'page hub' }, hero, h('div', { class: 'hub-grid' }, nextCard, statsCard, continueCard)));
  }
  return { update: render };
}
