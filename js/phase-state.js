const PHASE_KEY = 'sm-phase';
const OBJ_KEY = 'sm-objectives';

export const PHASE_DEFS = [
  {
    id: 1, name: 'PHASE 1', subtitle: 'Structural Components',
    unlockedTiers: ['Tier 0', 'Tier 1'],
    objectives: [
      { id: 'p1-1', text: 'Build Smelters for Iron & Copper' },
      { id: 'p1-2', text: 'Automate Iron Plates & Rods' },
      { id: 'p1-3', text: 'Produce Screws at 120/min' },
      { id: 'p1-4', text: 'Build Assembler for Reinforced Iron Plates' },
      { id: 'p1-5', text: 'Deliver Smart Plating × 50' },
    ]
  },
  {
    id: 2, name: 'PHASE 2', subtitle: 'Industrial Expansion',
    unlockedTiers: ['Tier 0', 'Tier 1', 'Tier 2', 'Tier 3', 'Tier 4'],
    objectives: [
      { id: 'p2-1', text: 'Build Foundry for Steel production' },
      { id: 'p2-2', text: 'Automate Motors & Stators' },
      { id: 'p2-3', text: 'Produce Rotors at 30/min' },
      { id: 'p2-4', text: 'Build Manufacturer for Heavy Modular Frames' },
      { id: 'p2-5', text: 'Deliver Versatile Framework × 100' },
      { id: 'p2-6', text: 'Automate Automated Wiring' },
    ]
  },
  {
    id: 3, name: 'PHASE 3', subtitle: 'Petroleum & Electronics',
    unlockedTiers: ['Tier 0', 'Tier 1', 'Tier 2', 'Tier 3', 'Tier 4', 'Tier 5', 'Tier 6', 'Tier 7'],
    objectives: [
      { id: 'p3-1', text: 'Set up Oil extraction & refining' },
      { id: 'p3-2', text: 'Automate Plastic & Rubber production' },
      { id: 'p3-3', text: 'Build Circuit Board factory' },
      { id: 'p3-4', text: 'Produce Computers at 5/min' },
      { id: 'p3-5', text: 'Build High-Speed Connector line' },
      { id: 'p3-6', text: 'Deliver Supercomputer × 50' },
      { id: 'p3-7', text: 'Set up Crystal Oscillator production' },
    ]
  },
  {
    id: 4, name: 'PHASE 4', subtitle: 'Advanced Manufacturing',
    unlockedTiers: ['Tier 0', 'Tier 1', 'Tier 2', 'Tier 3', 'Tier 4', 'Tier 5', 'Tier 6', 'Tier 7', 'Tier 8', 'Alt'],
    objectives: [
      { id: 'p4-1', text: 'Set up Aluminum chain' },
      { id: 'p4-2', text: 'Automate Turbo Motors' },
      { id: 'p4-3', text: 'Build Fused Modular Frame line' },
      { id: 'p4-4', text: 'Produce Radio Control Units at 5/min' },
      { id: 'p4-5', text: 'Deliver Nuclear Pasta × 5' },
      { id: 'p4-6', text: 'Assemble Thermal Propulsion Rocket' },
    ]
  }
];

let _phase = parseInt(localStorage.getItem(PHASE_KEY) || '1', 10);
if (_phase < 1 || _phase > 4 || isNaN(_phase)) _phase = 1;

let _objMap = {};
try { _objMap = JSON.parse(localStorage.getItem(OBJ_KEY) || '{}'); } catch (_) {}

const _listeners = [];

export function getPhase() { return _phase; }

export function setPhase(n) {
  _phase = Math.max(1, Math.min(4, n));
  localStorage.setItem(PHASE_KEY, String(_phase));
  _listeners.forEach(fn => fn(_phase));
}

export function getObjectiveDoneMap() { return _objMap; }

export function toggleObjective(id) {
  _objMap = Object.assign({}, _objMap, { [id]: !_objMap[id] });
  localStorage.setItem(OBJ_KEY, JSON.stringify(_objMap));
}

export function onPhaseChange(fn) { _listeners.push(fn); }

export function getUnlockedTiers() {
  const def = PHASE_DEFS.find(p => p.id === _phase);
  return def ? def.unlockedTiers : PHASE_DEFS[0].unlockedTiers;
}

export function getPhasePct(phaseId) {
  const def = PHASE_DEFS.find(p => p.id === phaseId);
  if (!def || !def.objectives.length) return 0;
  const done = def.objectives.filter(o => _objMap[o.id]).length;
  return Math.round(done / def.objectives.length * 100);
}
