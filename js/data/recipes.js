// Satisfactory 1.0 recipe data.
// Convention: outputs[0] is the recipe's PRODUCT. Any further outputs are byproducts
// and are never used to resolve how an item is produced.

const R = (id, name, tier, cat, machine, time, inputs, outputs, notes = '', alt = false) => ({
  id, name, tier, cat, machine, time, alt, notes,
  inputs: inputs.map(([item, qty]) => ({ item, qty })),
  outputs: outputs.map(([item, qty]) => ({ item, qty })),
  product: outputs[0][0],
});
const A = (...args) => { const r = R(...args); r.alt = true; return r; };

export const RAW_RESOURCES = new Set([
  'Iron Ore', 'Copper Ore', 'Limestone', 'Coal', 'Caterium Ore', 'Raw Quartz', 'Sulfur',
  'Bauxite', 'Uranium', 'SAM', 'Crude Oil', 'Water', 'Nitrogen Gas',
]);

export const FLUIDS = new Set([
  'Water', 'Crude Oil', 'Heavy Oil Residue', 'Fuel', 'Turbofuel', 'Alumina Solution',
  'Sulfuric Acid', 'Nitrogen Gas', 'Nitric Acid',
]);

export const RECIPES = [
  // ── TIER 0 · Onboarding / HUB upgrades
  R('iron-ingot', 'Iron Ingot', 'Tier 0', 'Ingots', 'Smelter', 2, [['Iron Ore', 1]], [['Iron Ingot', 1]], 'Foundation of everything. Automate first.'),
  R('copper-ingot', 'Copper Ingot', 'Tier 0', 'Ingots', 'Smelter', 2, [['Copper Ore', 1]], [['Copper Ingot', 1]], 'Essential for Wire and Cable.'),
  R('iron-plate', 'Iron Plate', 'Tier 0', 'Parts', 'Constructor', 6, [['Iron Ingot', 3]], [['Iron Plate', 2]], 'Used everywhere.'),
  R('iron-rod', 'Iron Rod', 'Tier 0', 'Parts', 'Constructor', 4, [['Iron Ingot', 1]], [['Iron Rod', 1]], 'Screws, Rotors, Modular Frames.'),
  R('screw', 'Screw', 'Tier 0', 'Parts', 'Constructor', 6, [['Iron Rod', 1]], [['Screw', 4]], 'You will need a lot of these.'),
  R('wire', 'Wire', 'Tier 0', 'Parts', 'Constructor', 4, [['Copper Ingot', 1]], [['Wire', 2]], 'Cable, Stators, Automated Wiring.'),
  R('cable', 'Cable', 'Tier 0', 'Parts', 'Constructor', 2, [['Wire', 2]], [['Cable', 1]], 'Power infrastructure staple.'),
  R('concrete', 'Concrete', 'Tier 0', 'Parts', 'Constructor', 4, [['Limestone', 3]], [['Concrete', 1]], 'Foundations and Encased Beams.'),
  R('reinforced-iron-plate', 'Reinforced Iron Plate', 'Tier 0', 'Parts', 'Assembler', 12, [['Iron Plate', 6], ['Screw', 12]], [['Reinforced Iron Plate', 1]], 'Key early component.'),

  // ── TIER 2 · Part Assembly
  R('copper-sheet', 'Copper Sheet', 'Tier 2', 'Parts', 'Constructor', 6, [['Copper Ingot', 2]], [['Copper Sheet', 1]], 'Circuit Boards, AI Limiters, Heat Sinks.'),
  R('rotor', 'Rotor', 'Tier 2', 'Parts', 'Assembler', 15, [['Iron Rod', 5], ['Screw', 25]], [['Rotor', 1]], 'Smart Plating and Motors.'),
  R('modular-frame', 'Modular Frame', 'Tier 2', 'Parts', 'Assembler', 60, [['Reinforced Iron Plate', 3], ['Iron Rod', 12]], [['Modular Frame', 2]], 'Critical for higher-tier buildings.'),
  R('smart-plating', 'Smart Plating', 'Tier 2', 'Space Elevator', 'Assembler', 30, [['Reinforced Iron Plate', 1], ['Rotor', 1]], [['Smart Plating', 1]], 'Space Elevator Phase 1 & 2.'),

  // ── TIER 3 · Basic Steel Production
  R('steel-ingot', 'Steel Ingot', 'Tier 3', 'Ingots', 'Foundry', 4, [['Iron Ore', 3], ['Coal', 3]], [['Steel Ingot', 3]], 'Solid Steel Ingot alt is a must.'),
  R('steel-beam', 'Steel Beam', 'Tier 3', 'Parts', 'Constructor', 4, [['Steel Ingot', 4]], [['Steel Beam', 1]], 'Key structural component.'),
  R('steel-pipe', 'Steel Pipe', 'Tier 3', 'Parts', 'Constructor', 6, [['Steel Ingot', 3]], [['Steel Pipe', 2]], 'Stators and Heavy Modular Frames.'),
  R('versatile-framework', 'Versatile Framework', 'Tier 3', 'Space Elevator', 'Manufacturer', 24, [['Modular Frame', 1], ['Steel Beam', 12]], [['Versatile Framework', 2]], 'Space Elevator Phase 2 & 3.'),

  // ── TIER 4 · Advanced Steel Production
  R('encased-industrial-beam', 'Encased Industrial Beam', 'Tier 4', 'Parts', 'Assembler', 10, [['Steel Beam', 3], ['Concrete', 6]], [['Encased Industrial Beam', 1]], 'Vital for Heavy Modular Frames.'),
  R('stator', 'Stator', 'Tier 4', 'Parts', 'Assembler', 12, [['Steel Pipe', 3], ['Wire', 8]], [['Stator', 1]], 'Motor ingredient.'),
  R('motor', 'Motor', 'Tier 4', 'Parts', 'Assembler', 12, [['Rotor', 2], ['Stator', 2]], [['Motor', 1]], 'Modular Engines and Turbo Motors.'),
  R('automated-wiring', 'Automated Wiring', 'Tier 4', 'Space Elevator', 'Assembler', 24, [['Stator', 1], ['Cable', 20]], [['Automated Wiring', 1]], 'Space Elevator Phase 2.'),

  // ── MAM · Caterium & Quartz
  R('caterium-ingot', 'Caterium Ingot', 'MAM', 'Ingots', 'Smelter', 4, [['Caterium Ore', 3]], [['Caterium Ingot', 1]], 'Unlocks Quickwire.'),
  R('quickwire', 'Quickwire', 'MAM', 'Parts', 'Constructor', 5, [['Caterium Ingot', 1]], [['Quickwire', 5]], 'Essential for advanced electronics.'),
  R('quartz-crystal', 'Quartz Crystal', 'MAM', 'Parts', 'Constructor', 8, [['Raw Quartz', 5]], [['Quartz Crystal', 3]], 'Crystal Oscillators.'),
  R('silica', 'Silica', 'MAM', 'Parts', 'Constructor', 8, [['Raw Quartz', 3]], [['Silica', 5]], 'Used in Aluminum processing.'),
  R('ai-limiter', 'AI Limiter', 'MAM', 'Electronics', 'Assembler', 12, [['Copper Sheet', 5], ['Quickwire', 20]], [['AI Limiter', 1]], 'Supercomputers and EM Control Rods.'),
  R('high-speed-connector', 'High-Speed Connector', 'MAM', 'Electronics', 'Manufacturer', 16, [['Quickwire', 56], ['Cable', 10], ['Circuit Board', 1]], [['High-Speed Connector', 1]], 'Advanced electronics.'),
  R('crystal-oscillator', 'Crystal Oscillator', 'MAM', 'Electronics', 'Manufacturer', 120, [['Quartz Crystal', 36], ['Cable', 28], ['Reinforced Iron Plate', 5]], [['Crystal Oscillator', 2]], 'Slow but essential.'),
  R('black-powder', 'Black Powder', 'MAM', 'Parts', 'Assembler', 4, [['Coal', 1], ['Sulfur', 1]], [['Black Powder', 2]], 'Nobelisks and explosives.'),

  // ── TIER 5 · Oil Processing & Industrial Manufacturing
  R('plastic', 'Plastic', 'Tier 5', 'Oil', 'Refinery', 6, [['Crude Oil', 3]], [['Plastic', 2], ['Heavy Oil Residue', 1]], 'Manage the residue!'),
  R('rubber', 'Rubber', 'Tier 5', 'Oil', 'Refinery', 6, [['Crude Oil', 3]], [['Rubber', 2], ['Heavy Oil Residue', 2]], 'Packaging, Modular Engines, Turbo Motors.'),
  R('fuel', 'Fuel', 'Tier 5', 'Oil', 'Refinery', 6, [['Crude Oil', 6]], [['Fuel', 4], ['Polymer Resin', 3]], 'Powers Fuel Generators.'),
  R('residual-fuel', 'Residual Fuel', 'Tier 5', 'Oil', 'Refinery', 6, [['Heavy Oil Residue', 6]], [['Fuel', 4]], 'Turns HOR byproduct into Fuel.'),
  R('residual-plastic', 'Residual Plastic', 'Tier 5', 'Oil', 'Refinery', 6, [['Polymer Resin', 6], ['Water', 2]], [['Plastic', 2]], 'Uses Polymer Resin byproduct.'),
  R('residual-rubber', 'Residual Rubber', 'Tier 5', 'Oil', 'Refinery', 6, [['Polymer Resin', 4], ['Water', 4]], [['Rubber', 2]], 'Uses Polymer Resin byproduct.'),
  R('petroleum-coke', 'Petroleum Coke', 'Tier 5', 'Oil', 'Refinery', 6, [['Heavy Oil Residue', 4]], [['Petroleum Coke', 12]], 'Great sink for Heavy Oil Residue.'),
  R('circuit-board', 'Circuit Board', 'Tier 5', 'Electronics', 'Assembler', 8, [['Copper Sheet', 2], ['Plastic', 4]], [['Circuit Board', 1]], 'Foundation of electronics.'),
  R('computer', 'Computer', 'Tier 5', 'Electronics', 'Manufacturer', 24, [['Circuit Board', 4], ['Cable', 8], ['Plastic', 16]], [['Computer', 1]], 'Major electronics milestone.'),
  R('heavy-modular-frame', 'Heavy Modular Frame', 'Tier 5', 'Parts', 'Manufacturer', 30, [['Modular Frame', 5], ['Steel Pipe', 20], ['Encased Industrial Beam', 5], ['Screw', 120]], [['Heavy Modular Frame', 1]], 'Major bottleneck. Heavy Encased Frame alt is S-tier.'),
  R('modular-engine', 'Modular Engine', 'Tier 5', 'Space Elevator', 'Manufacturer', 60, [['Motor', 2], ['Rubber', 15], ['Smart Plating', 2]], [['Modular Engine', 1]], 'Space Elevator Phase 3.'),
  R('adaptive-control-unit', 'Adaptive Control Unit', 'Tier 5', 'Space Elevator', 'Manufacturer', 60, [['Automated Wiring', 5], ['Circuit Board', 5], ['Heavy Modular Frame', 1], ['Computer', 2]], [['Adaptive Control Unit', 1]], 'Space Elevator Phase 3.'),

  // ── TIER 7 · Bauxite Refinement & Aeronautical Engineering
  R('alumina-solution', 'Alumina Solution', 'Tier 7', 'Ingots', 'Refinery', 6, [['Bauxite', 12], ['Water', 18]], [['Alumina Solution', 12], ['Silica', 5]], 'First step of the aluminum chain.'),
  R('aluminum-scrap', 'Aluminum Scrap', 'Tier 7', 'Ingots', 'Refinery', 1, [['Alumina Solution', 4], ['Coal', 2]], [['Aluminum Scrap', 6], ['Water', 2]], 'Recycle the water back into Alumina.'),
  R('aluminum-ingot', 'Aluminum Ingot', 'Tier 7', 'Ingots', 'Foundry', 4, [['Aluminum Scrap', 6], ['Silica', 5]], [['Aluminum Ingot', 4]], 'Requires Bauxite processing.'),
  R('alclad-aluminum-sheet', 'Alclad Aluminum Sheet', 'Tier 7', 'Parts', 'Assembler', 6, [['Aluminum Ingot', 3], ['Copper Ingot', 1]], [['Alclad Aluminum Sheet', 3]], 'Heat Sinks and late-game parts.'),
  R('aluminum-casing', 'Aluminum Casing', 'Tier 7', 'Parts', 'Constructor', 2, [['Aluminum Ingot', 3]], [['Aluminum Casing', 2]], 'Used in many late-game items.'),
  R('radio-control-unit', 'Radio Control Unit', 'Tier 7', 'Electronics', 'Manufacturer', 48, [['Aluminum Casing', 32], ['Crystal Oscillator', 1], ['Computer', 2]], [['Radio Control Unit', 1]], 'Turbo Motors and Pressure Cubes.'),
  R('sulfuric-acid', 'Sulfuric Acid', 'Tier 7', 'Oil', 'Refinery', 6, [['Sulfur', 5], ['Water', 5]], [['Sulfuric Acid', 5]], 'Batteries and Uranium processing.'),
  R('battery', 'Battery', 'Tier 7', 'Electronics', 'Blender', 3, [['Sulfuric Acid', 2.5], ['Alumina Solution', 2], ['Aluminum Casing', 1]], [['Battery', 1], ['Water', 1.5]], 'Drones and Electromagnetic parts.'),
  R('supercomputer', 'Supercomputer', 'Tier 7', 'Electronics', 'Manufacturer', 32, [['Computer', 4], ['AI Limiter', 2], ['High-Speed Connector', 3], ['Plastic', 28]], [['Supercomputer', 1]], 'Plan your production chain!'),
  R('assembly-director-system', 'Assembly Director System', 'Tier 7', 'Space Elevator', 'Assembler', 80, [['Adaptive Control Unit', 2], ['Supercomputer', 1]], [['Assembly Director System', 1]], 'Space Elevator Phase 4.'),
  R('electromagnetic-control-rod', 'Electromagnetic Control Rod', 'Tier 7', 'Electronics', 'Assembler', 30, [['Stator', 3], ['AI Limiter', 2]], [['Electromagnetic Control Rod', 2]], 'Magnetic Field Generators.'),
  R('magnetic-field-generator', 'Magnetic Field Generator', 'Tier 7', 'Space Elevator', 'Assembler', 120, [['Versatile Framework', 5], ['Electromagnetic Control Rod', 2]], [['Magnetic Field Generator', 2]], 'Space Elevator Phase 4.'),

  // ── TIER 8 · Advanced Aluminum Production & Particle Enrichment
  R('heat-sink', 'Heat Sink', 'Tier 8', 'Parts', 'Assembler', 8, [['Alclad Aluminum Sheet', 5], ['Copper Sheet', 3]], [['Heat Sink', 1]], 'Cooling Systems.'),
  R('cooling-system', 'Cooling System', 'Tier 8', 'Parts', 'Blender', 10, [['Heat Sink', 2], ['Rubber', 2], ['Water', 5], ['Nitrogen Gas', 25]], [['Cooling System', 1]], 'Turbo Motors and Rockets.'),
  R('fused-modular-frame', 'Fused Modular Frame', 'Tier 8', 'Parts', 'Blender', 40, [['Heavy Modular Frame', 1], ['Aluminum Casing', 50], ['Nitrogen Gas', 25]], [['Fused Modular Frame', 1]], 'Pressure Cubes and Rockets.'),
  R('turbo-motor', 'Turbo Motor', 'Tier 8', 'Parts', 'Manufacturer', 32, [['Cooling System', 4], ['Radio Control Unit', 2], ['Motor', 4], ['Rubber', 24]], [['Turbo Motor', 1]], 'End-game powerhouse.'),
  R('thermal-propulsion-rocket', 'Thermal Propulsion Rocket', 'Tier 8', 'Space Elevator', 'Manufacturer', 120, [['Modular Engine', 5], ['Turbo Motor', 2], ['Cooling System', 6], ['Fused Modular Frame', 2]], [['Thermal Propulsion Rocket', 2]], 'Space Elevator Phase 4.'),
  R('copper-powder', 'Copper Powder', 'Tier 8', 'Parts', 'Constructor', 6, [['Copper Ingot', 30]], [['Copper Powder', 5]], 'Nuclear Pasta. Needs a LOT of copper.'),
  R('pressure-conversion-cube', 'Pressure Conversion Cube', 'Tier 8', 'Parts', 'Assembler', 60, [['Fused Modular Frame', 1], ['Radio Control Unit', 2]], [['Pressure Conversion Cube', 1]], 'Nuclear Pasta.'),
  R('nuclear-pasta', 'Nuclear Pasta', 'Tier 8', 'Space Elevator', 'Particle Accelerator', 120, [['Copper Powder', 200], ['Pressure Conversion Cube', 1]], [['Nuclear Pasta', 1]], 'Space Elevator Phase 4. Power hungry.'),

  // ── ALTERNATE RECIPES (from Hard Drives)
  A('cast-screw', 'Cast Screw', 'Tier 0', 'Parts', 'Constructor', 24, [['Iron Ingot', 5]], [['Screw', 20]], 'S-TIER: Skips Iron Rods entirely.'),
  A('steel-screw', 'Steel Screw', 'Tier 3', 'Parts', 'Constructor', 12, [['Steel Beam', 1]], [['Screw', 52]], 'S-TIER: Insane screw output.'),
  A('iron-wire', 'Iron Wire', 'Tier 0', 'Parts', 'Constructor', 24, [['Iron Ingot', 5]], [['Wire', 9]], 'A-TIER: Wire without Copper.'),
  A('fused-wire', 'Fused Wire', 'MAM', 'Parts', 'Assembler', 20, [['Copper Ingot', 4], ['Caterium Ingot', 1]], [['Wire', 30]], 'S-TIER: Massive wire output.'),
  A('insulated-cable', 'Insulated Cable', 'Tier 5', 'Parts', 'Assembler', 12, [['Wire', 9], ['Rubber', 6]], [['Cable', 20]], 'A-TIER: More cable per wire.'),
  A('quickwire-cable', 'Quickwire Cable', 'MAM', 'Parts', 'Assembler', 24, [['Quickwire', 3], ['Rubber', 2]], [['Cable', 11]], 'B-TIER: Copper-free cable.'),
  A('fused-quickwire', 'Fused Quickwire', 'MAM', 'Parts', 'Assembler', 8, [['Caterium Ingot', 1], ['Copper Ingot', 5]], [['Quickwire', 12]], 'A-TIER: Stretch your Caterium.'),
  A('stitched-iron-plate', 'Stitched Iron Plate', 'Tier 0', 'Parts', 'Assembler', 32, [['Iron Plate', 10], ['Wire', 20]], [['Reinforced Iron Plate', 3]], 'A-TIER: No screws needed.'),
  A('bolted-iron-plate', 'Bolted Iron Plate', 'Tier 0', 'Parts', 'Assembler', 12, [['Iron Plate', 18], ['Screw', 50]], [['Reinforced Iron Plate', 3]], 'B-TIER: Triple output, lots of screws.'),
  A('steel-coated-plate', 'Steel Coated Plate', 'Tier 5', 'Parts', 'Assembler', 24, [['Steel Ingot', 3], ['Plastic', 2]], [['Iron Plate', 18]], 'A-TIER: Huge iron plate output.'),
  A('steel-rod', 'Steel Rod', 'Tier 3', 'Parts', 'Constructor', 5, [['Steel Ingot', 1]], [['Iron Rod', 4]], 'A-TIER: 4 rods per steel ingot.'),
  A('steel-rotor', 'Steel Rotor', 'Tier 3', 'Parts', 'Assembler', 15, [['Steel Pipe', 2], ['Wire', 6]], [['Rotor', 1]], 'A-TIER: No screws.'),
  A('solid-steel-ingot', 'Solid Steel Ingot', 'Tier 3', 'Ingots', 'Foundry', 3, [['Iron Ingot', 2], ['Coal', 2]], [['Steel Ingot', 3]], 'S-TIER: Uses Iron Ingots instead of ore.'),
  A('coke-steel-ingot', 'Coke Steel Ingot', 'Tier 5', 'Ingots', 'Foundry', 12, [['Iron Ore', 15], ['Petroleum Coke', 15]], [['Steel Ingot', 20]], 'A-TIER: Coal-free steel from oil byproducts.'),
  A('copper-alloy-ingot', 'Copper Alloy Ingot', 'Tier 3', 'Ingots', 'Foundry', 12, [['Copper Ore', 10], ['Iron Ore', 5]], [['Copper Ingot', 20]], 'S-TIER: Doubles copper ore output.'),
  A('pure-iron-ingot', 'Pure Iron Ingot', 'Tier 5', 'Ingots', 'Refinery', 12, [['Iron Ore', 7], ['Water', 4]], [['Iron Ingot', 13]], 'S-TIER: Nearly doubles iron.'),
  A('pure-copper-ingot', 'Pure Copper Ingot', 'Tier 5', 'Ingots', 'Refinery', 24, [['Copper Ore', 6], ['Water', 4]], [['Copper Ingot', 15]], 'A-TIER: 2.5x copper.'),
  A('wet-concrete', 'Wet Concrete', 'Tier 5', 'Parts', 'Refinery', 3, [['Limestone', 6], ['Water', 5]], [['Concrete', 4]], 'A-TIER: Fast concrete.'),
  A('rubber-concrete', 'Rubber Concrete', 'Tier 5', 'Parts', 'Assembler', 6, [['Limestone', 10], ['Rubber', 2]], [['Concrete', 9]], 'A-TIER: Limestone-efficient concrete.'),
  A('encased-industrial-pipe', 'Encased Industrial Pipe', 'Tier 4', 'Parts', 'Assembler', 15, [['Steel Pipe', 6], ['Concrete', 5]], [['Encased Industrial Beam', 1]], 'B-TIER: Pipes instead of beams.'),
  A('heavy-encased-frame', 'Heavy Encased Frame', 'Tier 5', 'Parts', 'Manufacturer', 64, [['Modular Frame', 8], ['Encased Industrial Beam', 10], ['Steel Pipe', 36], ['Concrete', 22]], [['Heavy Modular Frame', 3]], 'S-TIER: No screws, more output.'),
  A('plastic-smart-plating', 'Plastic Smart Plating', 'Tier 5', 'Space Elevator', 'Manufacturer', 24, [['Reinforced Iron Plate', 1], ['Rotor', 1], ['Plastic', 3]], [['Smart Plating', 2]], 'A-TIER: Doubles Smart Plating.'),
  A('flexible-framework', 'Flexible Framework', 'Tier 5', 'Space Elevator', 'Manufacturer', 16, [['Modular Frame', 1], ['Steel Beam', 6], ['Rubber', 8]], [['Versatile Framework', 2]], 'A-TIER: Half the steel beams.'),
  A('automated-speed-wiring', 'Automated Speed Wiring', 'MAM', 'Space Elevator', 'Manufacturer', 32, [['Stator', 2], ['Wire', 40], ['High-Speed Connector', 1]], [['Automated Wiring', 4]], 'A-TIER: Quadruple output.'),
  A('electric-motor', 'Electric Motor', 'Tier 7', 'Parts', 'Assembler', 16, [['Electromagnetic Control Rod', 1], ['Rotor', 2]], [['Motor', 2]], 'B-TIER: Skips Stators.'),
  A('caterium-circuit-board', 'Caterium Circuit Board', 'Tier 5', 'Electronics', 'Assembler', 48, [['Plastic', 10], ['Quickwire', 30]], [['Circuit Board', 7]], 'A-TIER: Copper-free boards.'),
  A('silicon-circuit-board', 'Silicon Circuit Board', 'Tier 5', 'Electronics', 'Assembler', 24, [['Copper Sheet', 11], ['Silica', 11]], [['Circuit Board', 5]], 'A-TIER: Plastic-free boards.'),
  A('crystal-computer', 'Crystal Computer', 'Tier 5', 'Electronics', 'Assembler', 36, [['Circuit Board', 3], ['Crystal Oscillator', 1]], [['Computer', 2]], 'A-TIER: Assembler-only computers.'),
  A('recycled-plastic', 'Recycled Plastic', 'Tier 5', 'Oil', 'Refinery', 12, [['Rubber', 6], ['Fuel', 12]], [['Plastic', 12]], 'S-TIER with Diluted Fuel loops.'),
  A('recycled-rubber', 'Recycled Rubber', 'Tier 5', 'Oil', 'Refinery', 12, [['Plastic', 6], ['Fuel', 12]], [['Rubber', 12]], 'S-TIER with Diluted Fuel loops.'),
  A('heavy-oil-residue', 'Heavy Oil Residue', 'Tier 5', 'Oil', 'Refinery', 6, [['Crude Oil', 3]], [['Heavy Oil Residue', 4], ['Polymer Resin', 2]], 'A-TIER: HOR-focused cracking.'),
  A('polymer-resin', 'Polymer Resin', 'Tier 5', 'Oil', 'Refinery', 6, [['Crude Oil', 6]], [['Polymer Resin', 13], ['Heavy Oil Residue', 2]], 'A-TIER: Resin for Residual Plastic/Rubber.'),
  A('diluted-fuel', 'Diluted Fuel', 'Tier 8', 'Oil', 'Blender', 6, [['Heavy Oil Residue', 5], ['Water', 10]], [['Fuel', 10]], 'S-TIER: Fuel from residue + water.'),
  A('sloppy-alumina', 'Sloppy Alumina', 'Tier 7', 'Ingots', 'Refinery', 3, [['Bauxite', 10], ['Water', 10]], [['Alumina Solution', 12]], 'A-TIER: No Silica byproduct.'),
  A('electrode-aluminum-scrap', 'Electrode Aluminum Scrap', 'Tier 7', 'Ingots', 'Refinery', 4, [['Alumina Solution', 12], ['Petroleum Coke', 4]], [['Aluminum Scrap', 20], ['Water', 7]], 'A-TIER: Coal-free scrap.'),
  A('heat-exchanger', 'Heat Exchanger', 'Tier 8', 'Parts', 'Assembler', 6, [['Aluminum Casing', 3], ['Rubber', 3]], [['Heat Sink', 1]], 'B-TIER: Skips Alclad sheets.'),
];

export const RECIPES_BY_ID = Object.fromEntries(RECIPES.map(r => [r.id, r]));

export const CATEGORIES = ['All', 'Favourites', 'Ingots', 'Parts', 'Electronics', 'Oil', 'Space Elevator'];
export const TIERS = ['Tier 0', 'Tier 2', 'Tier 3', 'Tier 4', 'MAM', 'Tier 5', 'Tier 7', 'Tier 8'];

/** Every item that some recipe produces as its primary product, sorted. */
export function getAllProducts() {
  return [...new Set(RECIPES.map(r => r.product))].sort();
}

/** Recipes whose PRODUCT is this item (byproducts never count). */
export function getRecipesForItem(item) {
  if (RAW_RESOURCES.has(item)) return [];
  return RECIPES.filter(r => r.product === item);
}

export function getDefaultRecipe(item) {
  const list = getRecipesForItem(item);
  return list.find(r => !r.alt) || list[0] || null;
}

export function isFluid(item) { return FLUIDS.has(item); }
