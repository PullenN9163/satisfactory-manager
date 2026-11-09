// vis-network wrapper. Loaded lazily the first time a graph is opened.
const VIS_URL = 'https://unpkg.com/vis-network@9.1.9/standalone/umd/vis-network.min.js';
let visPromise = null;
let network = null;

function loadVis() {
  if (window.vis && window.vis.Network) return Promise.resolve(window.vis);
  if (!visPromise) visPromise = new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = VIS_URL; s.async = true;
    s.onload = () => res(window.vis);
    s.onerror = () => { visPromise = null; rej(new Error('Could not load the graph library (offline?)')); };
    document.head.appendChild(s);
  });
  return visPromise;
}

export const GRAPH_THEME = {
  root: { background: '#2a1404', border: '#ff6a00', highlight: { background: '#3a1c06', border: '#ffa040' } },
  step: { background: '#141a24', border: '#3d5a80', highlight: { background: '#1b2433', border: '#5aa0ff' } },
  raw:  { background: '#10161b', border: '#2f7a5f', highlight: { background: '#14201b', border: '#34d399' } },
  text: '#e8edf5', rootText: '#ffb26b', rawText: '#9ee8c6',
  font: { face: 'Chakra Petch, sans-serif', size: 13, multi: false },
  edgeFont: { size: 11, color: '#8a9bb0', face: 'Share Tech Mono, monospace', strokeWidth: 3, strokeColor: '#0b0e13', align: 'middle' },
  edge: { color: '#34445c', highlight: '#ff6a00', hover: '#5aa0ff' },
};

export async function renderGraph(container, data) {
  const vis = await loadVis();
  destroyGraph();
  network = new vis.Network(container,
    { nodes: new vis.DataSet(data.nodes), edges: new vis.DataSet(data.edges) },
    {
      layout: { hierarchical: { enabled: true, direction: 'LR', sortMethod: 'directed', nodeSpacing: 110, levelSeparation: 230, shakeTowards: 'leaves' } },
      physics: { enabled: false },
      interaction: { dragNodes: true, dragView: true, zoomView: true, hover: true, tooltipDelay: 200, navigationButtons: false },
      nodes: { shape: 'box', margin: 10, widthConstraint: { minimum: 110, maximum: 190 }, shapeProperties: { borderRadius: 8 } },
      edges: { smooth: { type: 'cubicBezier', forceDirection: 'horizontal', roundness: 0.45 }, arrows: { to: { scaleFactor: 0.6 } } },
    });
  // Fit, but never so far out that labels become unreadable — then centre on the output instead.
  network.once('afterDrawing', () => {
    if (!network) return;
    network.fit({ animation: false });
    if (network.getScale() < 0.7 && data.rootId != null) {
      const pos = network.getPositions([data.rootId])[data.rootId];
      network.moveTo({ position: { x: pos.x - container.clientWidth * 0.3 / 0.7, y: pos.y }, scale: 0.7, animation: false });
    }
  });
  return network;
}

export function fitGraph() { if (network) network.fit({ animation: { duration: 400, easingFunction: 'easeInOutQuad' } }); }
export function zoomGraph(f) { if (network) network.moveTo({ scale: network.getScale() * f, animation: { duration: 200 } }); }
export function destroyGraph() { if (network) { network.destroy(); network = null; } }
