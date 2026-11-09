// Building power draw at 100% clock (MW), Satisfactory 1.0.
export const MACHINES = {
  'Smelter':              { power: 4,    color: '#f97316' },
  'Constructor':          { power: 4,    color: '#60a5fa' },
  'Assembler':            { power: 15,   color: '#a78bfa' },
  'Foundry':              { power: 16,   color: '#f43f5e' },
  'Manufacturer':         { power: 55,   color: '#facc15' },
  'Refinery':             { power: 30,   color: '#2dd4bf' },
  'Blender':              { power: 75,   color: '#38bdf8' },
  'Packager':             { power: 10,   color: '#94a3b8' },
  'Particle Accelerator': { power: 1000, color: '#e879f9' }, // variable 500–1500 MW, average
};

export const BELTS = [
  { name: 'Mk.1', rate: 60 }, { name: 'Mk.2', rate: 120 }, { name: 'Mk.3', rate: 270 },
  { name: 'Mk.4', rate: 480 }, { name: 'Mk.5', rate: 780 }, { name: 'Mk.6', rate: 1200 },
];
export const PIPES = [{ name: 'Mk.1', rate: 300 }, { name: 'Mk.2', rate: 600 }];

export function machinePower(machine) { return (MACHINES[machine] || { power: 0 }).power; }
export function machineColor(machine) { return (MACHINES[machine] || { color: '#94a3b8' }).color; }

/** Smallest belt/pipe tier that carries `rate`, or the top tier with a count if none does. */
export function transportFor(rate, fluid) {
  const tiers = fluid ? PIPES : BELTS;
  const fit = tiers.find(t => rate <= t.rate + 1e-9);
  if (fit) return { kind: fluid ? 'Pipe' : 'Belt', tier: fit.name, lines: 1, ok: true };
  const top = tiers[tiers.length - 1];
  return { kind: fluid ? 'Pipe' : 'Belt', tier: top.name, lines: Math.ceil(rate / top.rate), ok: false };
}
