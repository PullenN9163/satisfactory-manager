export const RECIPES = [
  // TIER 0
  {id:"iron-ingot",name:"Iron Ingot",tier:"Tier 0",cat:"Ingots",machine:"Smelter",time:2,inputs:[{item:"Iron Ore",qty:1}],outputs:[{item:"Iron Ingot",qty:1}],notes:"Foundation of everything. Automate first.",alt:false},
  {id:"copper-ingot",name:"Copper Ingot",tier:"Tier 0",cat:"Ingots",machine:"Smelter",time:2,inputs:[{item:"Copper Ore",qty:1}],outputs:[{item:"Copper Ingot",qty:1}],notes:"Essential for Wire and Cable.",alt:false},
  {id:"iron-plate",name:"Iron Plate",tier:"Tier 0",cat:"Parts",machine:"Constructor",time:6,inputs:[{item:"Iron Ingot",qty:3}],outputs:[{item:"Iron Plate",qty:2}],notes:"Used everywhere.",alt:false},
  {id:"iron-rod",name:"Iron Rod",tier:"Tier 0",cat:"Parts",machine:"Constructor",time:4,inputs:[{item:"Iron Ingot",qty:1}],outputs:[{item:"Iron Rod",qty:1}],notes:"Needed for Screws and many buildings.",alt:false},
  {id:"wire",name:"Wire",tier:"Tier 0",cat:"Parts",machine:"Constructor",time:4,inputs:[{item:"Copper Ingot",qty:1}],outputs:[{item:"Wire",qty:2}],notes:"Used for Cable, Circuit Boards.",alt:false},
  {id:"cable",name:"Cable",tier:"Tier 0",cat:"Parts",machine:"Constructor",time:2,inputs:[{item:"Wire",qty:2}],outputs:[{item:"Cable",qty:1}],notes:"Power infrastructure staple.",alt:false},
  {id:"concrete",name:"Concrete",tier:"Tier 0",cat:"Parts",machine:"Constructor",time:4,inputs:[{item:"Limestone",qty:3}],outputs:[{item:"Concrete",qty:1}],notes:"Building foundations.",alt:false},
  {id:"screw",name:"Screw",tier:"Tier 0",cat:"Parts",machine:"Constructor",time:6,inputs:[{item:"Iron Rod",qty:1}],outputs:[{item:"Screw",qty:4}],notes:"You will need a lot of these.",alt:false},
  // TIER 1
  {id:"reinforced-iron-plate",name:"Reinforced Iron Plate",tier:"Tier 1",cat:"Parts",machine:"Assembler",time:12,inputs:[{item:"Iron Plate",qty:6},{item:"Screw",qty:12}],outputs:[{item:"Reinforced Iron Plate",qty:1}],notes:"Key mid-tier component.",alt:false},
  {id:"smart-plating",name:"Smart Plating",tier:"Tier 1",cat:"Space Elevator",machine:"Assembler",time:30,inputs:[{item:"Reinforced Iron Plate",qty:1},{item:"Rotor",qty:1}],outputs:[{item:"Smart Plating",qty:1}],notes:"Space Elevator Phase 1.",alt:false},
  // TIER 2
  {id:"rotor",name:"Rotor",tier:"Tier 2",cat:"Parts",machine:"Assembler",time:15,inputs:[{item:"Iron Rod",qty:5},{item:"Screw",qty:25}],outputs:[{item:"Rotor",qty:1}],notes:"Used for Motors and Modular Frames.",alt:false},
  {id:"modular-frame",name:"Modular Frame",tier:"Tier 2",cat:"Parts",machine:"Assembler",time:60,inputs:[{item:"Reinforced Iron Plate",qty:3},{item:"Iron Rod",qty:12}],outputs:[{item:"Modular Frame",qty:2}],notes:"Critical for higher-tier buildings.",alt:false},
  {id:"copper-sheet",name:"Copper Sheet",tier:"Tier 2",cat:"Parts",machine:"Constructor",time:6,inputs:[{item:"Copper Ingot",qty:2}],outputs:[{item:"Copper Sheet",qty:1}],notes:"Used in Circuit Boards.",alt:false},
  {id:"caterium-ingot",name:"Caterium Ingot",tier:"Tier 2",cat:"Ingots",machine:"Smelter",time:4,inputs:[{item:"Caterium Ore",qty:3}],outputs:[{item:"Caterium Ingot",qty:1}],notes:"Unlocks Quickwire.",alt:false},
  {id:"quickwire",name:"Quickwire",tier:"Tier 2",cat:"Parts",machine:"Constructor",time:5,inputs:[{item:"Caterium Ingot",qty:1}],outputs:[{item:"Quickwire",qty:5}],notes:"Essential for advanced electronics.",alt:false},
  // TIER 3
  {id:"steel-ingot",name:"Steel Ingot",tier:"Tier 3",cat:"Ingots",machine:"Foundry",time:4,inputs:[{item:"Iron Ore",qty:3},{item:"Coal",qty:3}],outputs:[{item:"Steel Ingot",qty:3}],notes:"Solid Steel Ingot alt is a must.",alt:false},
  {id:"steel-beam",name:"Steel Beam",tier:"Tier 3",cat:"Parts",machine:"Constructor",time:4,inputs:[{item:"Steel Ingot",qty:4}],outputs:[{item:"Steel Beam",qty:1}],notes:"Key structural component.",alt:false},
  {id:"steel-pipe",name:"Steel Pipe",tier:"Tier 3",cat:"Parts",machine:"Constructor",time:6,inputs:[{item:"Steel Ingot",qty:3}],outputs:[{item:"Steel Pipe",qty:2}],notes:"Used in fluid systems.",alt:false},
  {id:"encased-industrial-beam",name:"Encased Industrial Beam",tier:"Tier 3",cat:"Parts",machine:"Assembler",time:10,inputs:[{item:"Steel Beam",qty:4},{item:"Concrete",qty:5}],outputs:[{item:"Encased Industrial Beam",qty:1}],notes:"Vital for Heavy Modular Frames.",alt:false},
  {id:"stator",name:"Stator",tier:"Tier 3",cat:"Parts",machine:"Assembler",time:12,inputs:[{item:"Steel Pipe",qty:3},{item:"Wire",qty:8}],outputs:[{item:"Stator",qty:1}],notes:"Motor ingredient.",alt:false},
  {id:"motor",name:"Motor",tier:"Tier 3",cat:"Parts",machine:"Assembler",time:12,inputs:[{item:"Rotor",qty:2},{item:"Stator",qty:2}],outputs:[{item:"Motor",qty:1}],notes:"Needed for Manufacturers.",alt:false},
  {id:"quartz-crystal",name:"Quartz Crystal",tier:"Tier 3",cat:"Parts",machine:"Constructor",time:8,inputs:[{item:"Raw Quartz",qty:5}],outputs:[{item:"Quartz Crystal",qty:3}],notes:"Used in Radio Signal research.",alt:false},
  {id:"silica",name:"Silica",tier:"Tier 3",cat:"Parts",machine:"Constructor",time:8,inputs:[{item:"Raw Quartz",qty:3}],outputs:[{item:"Silica",qty:5}],notes:"Used in Aluminum processing.",alt:false},
  // TIER 4
  {id:"heavy-modular-frame",name:"Heavy Modular Frame",tier:"Tier 4",cat:"Parts",machine:"Manufacturer",time:30,inputs:[{item:"Modular Frame",qty:5},{item:"Steel Pipe",qty:15},{item:"Encased Industrial Beam",qty:5},{item:"Screw",qty:100}],outputs:[{item:"Heavy Modular Frame",qty:1}],notes:"Major bottleneck. Heavy Encased Frame alt is S-tier.",alt:false},
  {id:"versatile-framework",name:"Versatile Framework",tier:"Tier 4",cat:"Space Elevator",machine:"Manufacturer",time:24,inputs:[{item:"Modular Frame",qty:1},{item:"Steel Beam",qty:12}],outputs:[{item:"Versatile Framework",qty:2}],notes:"Space Elevator Phase 2.",alt:false},
  {id:"automated-wiring",name:"Automated Wiring",tier:"Tier 4",cat:"Space Elevator",machine:"Manufacturer",time:24,inputs:[{item:"Stator",qty:1},{item:"Cable",qty:20}],outputs:[{item:"Automated Wiring",qty:1}],notes:"Space Elevator Phase 2.",alt:false},
  // TIER 5
  {id:"plastic",name:"Plastic",tier:"Tier 5",cat:"Oil",machine:"Refinery",time:6,inputs:[{item:"Crude Oil",qty:3}],outputs:[{item:"Plastic",qty:2},{item:"Heavy Oil Residue",qty:1}],notes:"Manage the residue!",alt:false},
  {id:"rubber",name:"Rubber",tier:"Tier 5",cat:"Oil",machine:"Refinery",time:6,inputs:[{item:"Crude Oil",qty:3}],outputs:[{item:"Rubber",qty:2},{item:"Heavy Oil Residue",qty:1}],notes:"Used for packaging.",alt:false},
  {id:"fuel",name:"Fuel",tier:"Tier 5",cat:"Oil",machine:"Refinery",time:6,inputs:[{item:"Crude Oil",qty:6}],outputs:[{item:"Fuel",qty:4},{item:"Polymer Resin",qty:3}],notes:"Powers Fuel Generators.",alt:false},
  {id:"circuit-board",name:"Circuit Board",tier:"Tier 5",cat:"Electronics",machine:"Assembler",time:8,inputs:[{item:"Copper Sheet",qty:2},{item:"Plastic",qty:4}],outputs:[{item:"Circuit Board",qty:1}],notes:"Foundation of electronics.",alt:false},
  {id:"computer",name:"Computer",tier:"Tier 5",cat:"Electronics",machine:"Manufacturer",time:24,inputs:[{item:"Circuit Board",qty:10},{item:"Cable",qty:9},{item:"Plastic",qty:18},{item:"Screw",qty:52}],outputs:[{item:"Computer",qty:1}],notes:"Major electronics milestone.",alt:false},
  {id:"ai-limiter",name:"AI Limiter",tier:"Tier 5",cat:"Electronics",machine:"Assembler",time:12,inputs:[{item:"Copper Sheet",qty:5},{item:"Quickwire",qty:20}],outputs:[{item:"AI Limiter",qty:1}],notes:"Consider alt recipes.",alt:false},
  // TIER 6
  {id:"high-speed-connector",name:"High-Speed Connector",tier:"Tier 6",cat:"Electronics",machine:"Manufacturer",time:16,inputs:[{item:"Quickwire",qty:56},{item:"Cable",qty:10},{item:"Circuit Board",qty:1}],outputs:[{item:"High-Speed Connector",qty:1}],notes:"Advanced electronics.",alt:false},
  {id:"supercomputer",name:"Supercomputer",tier:"Tier 6",cat:"Electronics",machine:"Manufacturer",time:32,inputs:[{item:"Computer",qty:2},{item:"AI Limiter",qty:2},{item:"High-Speed Connector",qty:3},{item:"Plastic",qty:28}],outputs:[{item:"Supercomputer",qty:1}],notes:"Plan your production chain!",alt:false},
  // TIER 7
  {id:"aluminum-scrap",name:"Aluminum Scrap",tier:"Tier 7",cat:"Ingots",machine:"Refinery",time:1,inputs:[{item:"Alumina Solution",qty:4},{item:"Coal",qty:2}],outputs:[{item:"Aluminum Scrap",qty:6},{item:"Water",qty:2}],notes:"First step of aluminum chain.",alt:false},
  {id:"aluminum-ingot",name:"Aluminum Ingot",tier:"Tier 7",cat:"Ingots",machine:"Smelter",time:4,inputs:[{item:"Aluminum Scrap",qty:6}],outputs:[{item:"Aluminum Ingot",qty:4}],notes:"Requires Bauxite processing.",alt:false},
  {id:"alclad-sheet",name:"Alclad Aluminum Sheet",tier:"Tier 7",cat:"Parts",machine:"Assembler",time:6,inputs:[{item:"Aluminum Ingot",qty:3},{item:"Copper Ingot",qty:1}],outputs:[{item:"Alclad Aluminum Sheet",qty:3}],notes:"Late-game component.",alt:false},
  {id:"aluminum-casing",name:"Aluminum Casing",tier:"Tier 7",cat:"Parts",machine:"Constructor",time:2,inputs:[{item:"Aluminum Ingot",qty:3}],outputs:[{item:"Aluminum Casing",qty:2}],notes:"Used in many late-game items.",alt:false},
  {id:"crystal-oscillator",name:"Crystal Oscillator",tier:"Tier 7",cat:"Electronics",machine:"Manufacturer",time:120,inputs:[{item:"Quartz Crystal",qty:36},{item:"Cable",qty:28},{item:"Reinforced Iron Plate",qty:5}],outputs:[{item:"Crystal Oscillator",qty:2}],notes:"Slow but essential.",alt:false},
  {id:"radio-control-unit",name:"Radio Control Unit",tier:"Tier 7",cat:"Electronics",machine:"Manufacturer",time:48,inputs:[{item:"Aluminum Casing",qty:32},{item:"Crystal Oscillator",qty:1},{item:"Computer",qty:1}],outputs:[{item:"Radio Control Unit",qty:2}],notes:"Space Elevator Phase 3.",alt:false},
  // TIER 8
  {id:"turbo-motor",name:"Turbo Motor",tier:"Tier 8",cat:"Parts",machine:"Manufacturer",time:32,inputs:[{item:"Cooling System",qty:4},{item:"Radio Control Unit",qty:2},{item:"Motor",qty:4},{item:"Rubber",qty:24}],outputs:[{item:"Turbo Motor",qty:1}],notes:"End-game powerhouse.",alt:false},
  {id:"fused-modular-frame",name:"Fused Modular Frame",tier:"Tier 8",cat:"Parts",machine:"Blender",time:40,inputs:[{item:"Heavy Modular Frame",qty:1},{item:"Aluminum Casing",qty:50},{item:"Nitrogen Gas",qty:25}],outputs:[{item:"Fused Modular Frame",qty:1}],notes:"Space Elevator Phase 4.",alt:false},
  // ALT RECIPES
  {id:"cast-screw-alt",name:"Cast Screw",tier:"Alt",cat:"Alt Recipes",machine:"Constructor",time:24,inputs:[{item:"Iron Ingot",qty:5}],outputs:[{item:"Screw",qty:20}],notes:"S-TIER: Skips Iron Rods entirely.",alt:true},
  {id:"steel-screw-alt",name:"Steel Screw",tier:"Alt",cat:"Alt Recipes",machine:"Constructor",time:12,inputs:[{item:"Steel Beam",qty:1}],outputs:[{item:"Screw",qty:52}],notes:"S-TIER: Insane screw output.",alt:true},
  {id:"solid-steel-alt",name:"Solid Steel Ingot",tier:"Alt",cat:"Alt Recipes",machine:"Foundry",time:3,inputs:[{item:"Iron Ingot",qty:2},{item:"Coal",qty:2}],outputs:[{item:"Steel Ingot",qty:3}],notes:"S-TIER: Uses Iron Ingots instead of ore.",alt:true},
  {id:"copper-alloy-alt",name:"Copper Alloy Ingot",tier:"Alt",cat:"Alt Recipes",machine:"Foundry",time:12,inputs:[{item:"Copper Ore",qty:10},{item:"Iron Ore",qty:5}],outputs:[{item:"Copper Ingot",qty:20}],notes:"S-TIER: Triples copper output.",alt:true},
  {id:"iron-wire-alt",name:"Iron Wire",tier:"Alt",cat:"Alt Recipes",machine:"Constructor",time:24,inputs:[{item:"Iron Ingot",qty:5}],outputs:[{item:"Wire",qty:9}],notes:"A-TIER: Wire without Copper.",alt:true},
  {id:"stitched-plate-alt",name:"Stitched Iron Plate",tier:"Alt",cat:"Alt Recipes",machine:"Assembler",time:32,inputs:[{item:"Iron Plate",qty:10},{item:"Wire",qty:20}],outputs:[{item:"Reinforced Iron Plate",qty:3}],notes:"A-TIER: No screws needed.",alt:true},
  {id:"heavy-encased-alt",name:"Heavy Encased Frame",tier:"Alt",cat:"Alt Recipes",machine:"Manufacturer",time:64,inputs:[{item:"Modular Frame",qty:8},{item:"Encased Industrial Beam",qty:10},{item:"Steel Pipe",qty:36},{item:"Concrete",qty:22}],outputs:[{item:"Heavy Modular Frame",qty:3}],notes:"S-TIER: No Screws, plus 40 percent output boost.",alt:true},
  {id:"rubber-concrete-alt",name:"Rubber Concrete",tier:"Alt",cat:"Alt Recipes",machine:"Assembler",time:12,inputs:[{item:"Limestone",qty:10},{item:"Rubber",qty:2}],outputs:[{item:"Concrete",qty:9}],notes:"A-TIER: 6x concrete output.",alt:true},
  {id:"diluted-fuel-alt",name:"Diluted Fuel",tier:"Alt",cat:"Alt Recipes",machine:"Blender",time:6,inputs:[{item:"Heavy Oil Residue",qty:5},{item:"Water",qty:10}],outputs:[{item:"Fuel",qty:10}],notes:"S-TIER: 4.5x fuel from crude oil.",alt:true},
  {id:"coke-steel-alt",name:"Coke Steel Ingot",tier:"Alt",cat:"Alt Recipes",machine:"Foundry",time:12,inputs:[{item:"Iron Ore",qty:15},{item:"Petroleum Coke",qty:15}],outputs:[{item:"Steel Ingot",qty:20}],notes:"A-TIER: Useful with oil byproducts.",alt:true},
];

export const CATEGORIES = ["All","Favs","Ingots","Parts","Electronics","Oil","Space Elevator","Alt Recipes"];
export const TIERS = ["All","Tier 0","Tier 1","Tier 2","Tier 3","Tier 4","Tier 5","Tier 6","Tier 7","Tier 8","Alt"];

export function getAllOutputItems() {
  const seen = new Set();
  const items = [];
  for (const r of RECIPES) {
    for (const o of r.outputs) {
      if (!seen.has(o.item)) { seen.add(o.item); items.push(o.item); }
    }
  }
  return items.sort();
}

export function getDefaultRecipe(itemName) {
  return RECIPES.find(r => !r.alt && r.outputs.some(o => o.item === itemName))
      || RECIPES.find(r => r.outputs.some(o => o.item === itemName))
      || null;
}

export function getRecipesForItem(itemName) {
  return RECIPES.filter(r => r.outputs.some(o => o.item === itemName));
}
