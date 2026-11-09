// Space Elevator project phases (Satisfactory 1.0).
// `tiers` = recipe tiers you can realistically use while working on that phase.
// `suggest` = an item + rate the HUB offers as a one-tap factory plan.
export const PHASES = [
  {
    id: 1, name: 'Distribution Platform', short: 'Phase 1',
    tagline: 'Get iron flowing and prove FICSIT made the right hire.',
    tiers: ['Tier 0', 'Tier 2', 'MAM'],
    deliver: [{ item: 'Smart Plating', qty: 50 }],
    objectives: [
      { id: 'p1-1', text: 'Automate Iron Ingots, Plates & Rods', suggest: { item: 'Iron Plate', rate: 30 } },
      { id: 'p1-2', text: 'Screw line running at 90/min', suggest: { item: 'Screw', rate: 90 } },
      { id: 'p1-3', text: 'Reinforced Iron Plate factory', suggest: { item: 'Reinforced Iron Plate', rate: 5 } },
      { id: 'p1-4', text: 'Rotor production online', suggest: { item: 'Rotor', rate: 4 } },
      { id: 'p1-5', text: 'Deliver 50 Smart Plating', suggest: { item: 'Smart Plating', rate: 2 } },
    ],
  },
  {
    id: 2, name: 'Construction Dock', short: 'Phase 2',
    tagline: 'Steel, motors, and the first real megafactory.',
    tiers: ['Tier 0', 'Tier 2', 'Tier 3', 'Tier 4', 'MAM'],
    deliver: [{ item: 'Smart Plating', qty: 1000 }, { item: 'Versatile Framework', qty: 1000 }, { item: 'Automated Wiring', qty: 100 }],
    objectives: [
      { id: 'p2-1', text: 'Coal power plant online' },
      { id: 'p2-2', text: 'Steel Ingot foundries running', suggest: { item: 'Steel Ingot', rate: 60 } },
      { id: 'p2-3', text: 'Smart Plating at 10/min', suggest: { item: 'Smart Plating', rate: 10 } },
      { id: 'p2-4', text: 'Versatile Framework at 10/min', suggest: { item: 'Versatile Framework', rate: 10 } },
      { id: 'p2-5', text: 'Automated Wiring at 2.5/min', suggest: { item: 'Automated Wiring', rate: 2.5 } },
      { id: 'p2-6', text: 'Deliver Phase 2 parts' },
    ],
  },
  {
    id: 3, name: 'Main Body', short: 'Phase 3',
    tagline: 'Oil, plastics, computers — the factory starts thinking.',
    tiers: ['Tier 0', 'Tier 2', 'Tier 3', 'Tier 4', 'MAM', 'Tier 5'],
    deliver: [{ item: 'Versatile Framework', qty: 2500 }, { item: 'Modular Engine', qty: 500 }, { item: 'Adaptive Control Unit', qty: 100 }],
    objectives: [
      { id: 'p3-1', text: 'Oil extraction & Refineries running' },
      { id: 'p3-2', text: 'Plastic & Rubber at 60/min', suggest: { item: 'Plastic', rate: 60 } },
      { id: 'p3-3', text: 'Fuel generators powering the grid', suggest: { item: 'Fuel', rate: 120 } },
      { id: 'p3-4', text: 'Heavy Modular Frame line', suggest: { item: 'Heavy Modular Frame', rate: 2 } },
      { id: 'p3-5', text: 'Modular Engines at 2/min', suggest: { item: 'Modular Engine', rate: 2 } },
      { id: 'p3-6', text: 'Adaptive Control Units at 1/min', suggest: { item: 'Adaptive Control Unit', rate: 1 } },
      { id: 'p3-7', text: 'Deliver Phase 3 parts' },
    ],
  },
  {
    id: 4, name: 'Propulsion', short: 'Phase 4',
    tagline: 'Aluminum, nitrogen and rockets. Go big.',
    tiers: ['Tier 0', 'Tier 2', 'Tier 3', 'Tier 4', 'MAM', 'Tier 5', 'Tier 7', 'Tier 8'],
    deliver: [{ item: 'Assembly Director System', qty: 500 }, { item: 'Magnetic Field Generator', qty: 500 }, { item: 'Nuclear Pasta', qty: 100 }, { item: 'Thermal Propulsion Rocket', qty: 250 }],
    objectives: [
      { id: 'p4-1', text: 'Aluminum Ingot chain', suggest: { item: 'Aluminum Ingot', rate: 60 } },
      { id: 'p4-2', text: 'Supercomputers at 2/min', suggest: { item: 'Supercomputer', rate: 2 } },
      { id: 'p4-3', text: 'Assembly Director System line', suggest: { item: 'Assembly Director System', rate: 1 } },
      { id: 'p4-4', text: 'Magnetic Field Generators', suggest: { item: 'Magnetic Field Generator', rate: 1 } },
      { id: 'p4-5', text: 'Turbo Motors online', suggest: { item: 'Turbo Motor', rate: 1 } },
      { id: 'p4-6', text: 'Thermal Propulsion Rockets', suggest: { item: 'Thermal Propulsion Rocket', rate: 1 } },
      { id: 'p4-7', text: 'Nuclear Pasta in production', suggest: { item: 'Nuclear Pasta', rate: 0.5 } },
    ],
  },
  {
    id: 5, name: 'Assembly', short: 'Phase 5',
    tagline: 'The endgame. Project Assembly awaits.',
    tiers: ['Tier 0', 'Tier 2', 'Tier 3', 'Tier 4', 'MAM', 'Tier 5', 'Tier 7', 'Tier 8'],
    deliver: [{ item: 'Nuclear Pasta', qty: 1000 }, { item: 'Biochemical Sculptor', qty: 1000 }, { item: 'AI Expansion Server', qty: 256 }, { item: 'Ballistic Warp Drive', qty: 200 }],
    objectives: [
      { id: 'p5-1', text: 'Scale Nuclear Pasta to 2/min', suggest: { item: 'Nuclear Pasta', rate: 2 } },
      { id: 'p5-2', text: 'SAM & Ficsite processing' },
      { id: 'p5-3', text: 'Biochemical Sculptors' },
      { id: 'p5-4', text: 'AI Expansion Servers' },
      { id: 'p5-5', text: 'Ballistic Warp Drives' },
      { id: 'p5-6', text: 'Launch Project Assembly' },
    ],
  },
];

export const MAX_PHASE = PHASES.length;
export function getPhaseDef(id) { return PHASES.find(p => p.id === id) || PHASES[0]; }
export function phasePct(id, objectives) {
  const def = getPhaseDef(id);
  const done = def.objectives.filter(o => objectives[o.id]).length;
  return def.objectives.length ? Math.round(done / def.objectives.length * 100) : 0;
}
