import { RECIPES_BY_ID, RAW_RESOURCES, getDefaultRecipe, getRecipesForItem, isFluid } from './data/recipes.js';
import { machinePower, transportFor } from './data/machines.js';

const EPS = 1e-9;

function pickRecipe(item, selections) {
  if (RAW_RESOURCES.has(item)) return null;
  const sel = selections && selections[item];
  const chosen = sel && RECIPES_BY_ID[sel];
  if (chosen && chosen.product === item) return chosen;
  return getDefaultRecipe(item);
}

/**
 * Build the production tree for `item` at `rate`/min.
 * Node: { item, rate, isRaw, recipe?, machines?, children[], cyclic? }
 */
export function buildChain(item, rate, selections = {}, _path = new Set()) {
  if (_path.has(item)) return { item, rate, isRaw: true, cyclic: true, children: [] };
  const recipe = pickRecipe(item, selections);
  if (!recipe) return { item, rate, isRaw: true, children: [] };

  const out = recipe.outputs[0].qty;
  const cyclesPerMin = 60 / recipe.time;
  const machines = rate / (out * cyclesPerMin);
  const runs = machines * cyclesPerMin; // recipe cycles per minute across all machines

  const path = new Set(_path); path.add(item);
  const children = recipe.inputs.map(i => buildChain(i.item, runs * i.qty, selections, path));
  const byproducts = recipe.outputs.slice(1).map(o => ({ item: o.item, rate: runs * o.qty }));
  return { item, rate, recipe, machines, children, byproducts, isRaw: false };
}

/** Power (MW) for `exact` machines split over ceil(exact) buildings at equal clock. */
export function powerFor(machine, exact) {
  if (exact <= EPS) return 0;
  const buildings = Math.ceil(exact - EPS);
  const clock = exact / buildings;
  return buildings * machinePower(machine) * Math.pow(clock, 1.321928);
}

/**
 * Flatten + aggregate a chain into a full plan summary.
 */
export function summarize(chain) {
  const steps = new Map();   // item -> { item, recipe, rate, machines }
  const raw = new Map();     // item -> rate
  const byp = new Map();     // item -> rate

  (function walk(n) {
    if (n.isRaw) { raw.set(n.item, (raw.get(n.item) || 0) + n.rate); return; }
    const key = n.item;
    const s = steps.get(key) || { item: n.item, recipe: n.recipe, rate: 0, machines: 0, depth: 0 };
    s.rate += n.rate; s.machines += n.machines;
    steps.set(key, s);
    (n.byproducts || []).forEach(b => byp.set(b.item, (byp.get(b.item) || 0) + b.rate));
    n.children.forEach(walk);
  })(chain);

  // depth = longest distance from raw (for build order: build from the ground up)
  const depthOf = new Map();
  function depth(item) {
    if (depthOf.has(item)) return depthOf.get(item);
    const s = steps.get(item);
    if (!s) return 0;
    depthOf.set(item, 0);
    const d = 1 + Math.max(0, ...s.recipe.inputs.map(i => depth(i.item)));
    depthOf.set(item, d);
    return d;
  }

  const stepList = [...steps.values()].map(s => {
    const buildings = Math.ceil(s.machines - EPS);
    const clock = buildings ? s.machines / buildings * 100 : 0;
    const power = powerFor(s.recipe.machine, s.machines);
    const transport = transportFor(s.rate, isFluid(s.item));
    return { ...s, buildings, clock, power, transport, depth: depth(s.item) };
  }).sort((a, b) => a.depth - b.depth || b.machines - a.machines);

  const machineMap = new Map();
  stepList.forEach(s => {
    const m = machineMap.get(s.recipe.machine) || { machine: s.recipe.machine, exact: 0, buildings: 0, power: 0 };
    m.exact += s.machines; m.buildings += s.buildings; m.power += s.power;
    machineMap.set(s.recipe.machine, m);
  });

  const rawList = [...raw.entries()].map(([item, rate]) => ({ item, rate, transport: transportFor(rate, isFluid(item)) }))
    .sort((a, b) => b.rate - a.rate);
  const bypList = [...byp.entries()].map(([item, rate]) => ({ item, rate })).filter(b => b.rate > EPS)
    .sort((a, b) => b.rate - a.rate);

  const warnings = [];
  stepList.forEach(s => {
    if (!s.transport.ok) warnings.push(`${s.item} at ${fmt(s.rate)}/min needs ${s.transport.lines}× ${s.transport.tier} ${s.transport.kind.toLowerCase()}s`);
  });
  rawList.forEach(r => {
    if (!r.transport.ok) warnings.push(`${r.item} intake at ${fmt(r.rate)}/min needs ${r.transport.lines}× ${r.transport.tier} ${r.transport.kind.toLowerCase()}s`);
  });
  if (bypList.length) warnings.push(`Byproducts to handle: ${bypList.map(b => `${b.item} ${fmt(b.rate)}/min`).join(', ')}`);

  const totalPower = stepList.reduce((a, s) => a + s.power, 0);
  const totalBuildings = stepList.reduce((a, s) => a + s.buildings, 0);
  return {
    steps: stepList,
    machines: [...machineMap.values()].sort((a, b) => b.buildings - a.buildings),
    raw: rawList,
    byproducts: bypList,
    warnings,
    totalPower,
    totalBuildings,
  };
}

export function planFactory(f) {
  const chain = buildChain(f.outputItem, Number(f.outputRate) || 0, f.recipeSelections || {});
  return { chain, ...summarize(chain) };
}

/** Items in this chain that have more than one recipe (for the recipe switcher). */
export function switchableItems(summary) {
  return summary.steps.filter(s => getRecipesForItem(s.item).length > 1).map(s => s.item);
}

/** Graph data for vis-network: one node per item (aggregated), edges carry flow. */
export function buildGraphData(chain, summary, theme) {
  const nodes = [], edges = [], ids = new Map();
  let n = 0;
  const idFor = item => { if (!ids.has(item)) ids.set(item, ++n); return ids.get(item); };
  const flows = new Map();
  (function walk(node) {
    if (node.isRaw) return;
    node.children.forEach(c => {
      const k = c.item + '→' + node.item;
      flows.set(k, (flows.get(k) || 0) + c.rate);
      walk(c);
    });
  })(chain);

  const rootId = idFor(chain.item);
  summary.steps.forEach(s => {
    const isRoot = s.item === chain.item;
    nodes.push({
      id: idFor(s.item),
      label: `${s.item}\n${fmt(s.rate)}/min\n${fmt(s.machines)}× ${s.recipe.machine}`,
      color: isRoot ? theme.root : theme.step, font: { ...theme.font, color: isRoot ? theme.rootText : theme.text },
      borderWidth: isRoot ? 2 : 1,
    });
  });
  summary.raw.forEach(r => nodes.push({
    id: idFor(r.item), label: `${r.item}\n${fmt(r.rate)}/min`,
    color: theme.raw, font: { ...theme.font, color: theme.rawText },
  }));
  flows.forEach((rate, k) => {
    const [from, to] = k.split('→');
    edges.push({ from: idFor(from), to: idFor(to), label: fmt(rate), arrows: 'to', font: theme.edgeFont, color: theme.edge, width: 1.5 });
  });
  return { nodes, edges, rootId };
}

export function fmt(x) {
  if (!isFinite(x)) return '0';
  const a = Math.abs(x);
  if (a >= 100) return String(Math.round(x * 10) / 10);
  if (a >= 10) return (Math.round(x * 100) / 100).toString();
  return (Math.round(x * 1000) / 1000).toString();
}
export function fmtMW(x) { return x >= 1000 ? (x / 1000).toFixed(2) + ' GW' : (x >= 100 ? Math.round(x) : x.toFixed(1)) + ' MW'; }
