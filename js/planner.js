import { getDefaultRecipe, getRecipesForItem, RECIPES } from './data/recipes.js';

export function buildChain(itemName, ratePerMin, recipeSelections = {}, _visiting = new Set()) {
  if (_visiting.has(itemName)) {
    return { itemName, ratePerMin, isRaw: true, cyclic: true, children: [] };
  }
  const selectedId = recipeSelections[itemName];
  const recipe = selectedId
    ? RECIPES.find(r => r.id === selectedId) || getDefaultRecipe(itemName)
    : getDefaultRecipe(itemName);

  if (!recipe) return { itemName, ratePerMin, isRaw: true, children: [] };

  const outEntry = recipe.outputs.find(o => o.item === itemName);
  const outputQty = outEntry ? outEntry.qty : 1;
  const cyclesPerMin = 60 / recipe.time;
  const machineCount = ratePerMin / (outputQty * cyclesPerMin);

  const visiting = new Set(_visiting);
  visiting.add(itemName);
  const children = recipe.inputs.map(input =>
    buildChain(input.item, machineCount * input.qty * cyclesPerMin, recipeSelections, visiting)
  );

  return { itemName, ratePerMin, recipe, machineCount, children, isRaw: false };
}

export function flattenMachines(node) {
  const map = {};
  function walk(n) {
    if (n.isRaw || !n.recipe) return;
    map[n.recipe.machine] = (map[n.recipe.machine] || 0) + n.machineCount;
    n.children.forEach(walk);
  }
  walk(node);
  return Object.entries(map)
    .map(([machine, count]) => ({ machine, count }))
    .sort((a, b) => b.count - a.count);
}

export function flattenRawResources(node) {
  const map = {};
  function walk(n) {
    if (n.isRaw) { map[n.itemName] = (map[n.itemName] || 0) + n.ratePerMin; }
    else n.children.forEach(walk);
  }
  walk(node);
  return Object.entries(map)
    .map(([item, ratePerMin]) => ({ item, ratePerMin }))
    .sort((a, b) => b.ratePerMin - a.ratePerMin);
}

export function buildGraphData(node) {
  const nodes = [];
  const edges = [];
  let id = 0;
  function walk(n, parentId) {
    const myId = ++id;
    const isRoot = parentId === null;
    const color = isRoot
      ? { background:'#1a1300', border:'#f59e0b' }
      : n.isRaw
        ? { background:'#0d0f15', border:'#4b5568' }
        : { background:'#0d1526', border:'#60a5fa' };
    const rate = n.ratePerMin.toFixed(2);
    nodes.push({
      id: myId,
      label: n.itemName + '\n' + rate + '/min',
      color,
      font: { color: isRoot ? '#f59e0b' : n.isRaw ? '#8b95a8' : '#e2e5eb', size: 11, face: 'Share Tech Mono' },
      shape: 'box', margin: 8, borderWidth: isRoot ? 2 : 1,
    });
    if (parentId !== null) {
      edges.push({
        from: myId, to: parentId,
        label: rate + '/min',
        arrows: 'to',
        font: { size: 9, color: '#4b5568', face: 'Share Tech Mono', align: 'middle' },
        color: { color: '#2a3045', highlight: '#60a5fa' },
        width: 1.5,
      });
    }
    n.children.forEach(child => walk(child, myId));
  }
  walk(node, null);
  return { nodes, edges };
}
