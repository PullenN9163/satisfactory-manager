let network = null;

export function renderGraph(containerId, graphData) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (network) { network.destroy(); network = null; }

  const options = {
    layout: { hierarchical: { enabled: true, direction: 'LR', sortMethod: 'directed', nodeSpacing: 130, levelSeparation: 180 } },
    physics: { enabled: false },
    interaction: { dragNodes: true, dragView: true, zoomView: true, hover: true },
    nodes: { shape: 'box', widthConstraint: { minimum: 80, maximum: 160 } },
    edges: { smooth: { type: 'cubicBezier', forceDirection: 'horizontal', roundness: 0.4 } },
  };

  network = new window.vis.Network(
    container,
    { nodes: new window.vis.DataSet(graphData.nodes), edges: new window.vis.DataSet(graphData.edges) },
    options
  );
}

export function destroyGraph() {
  if (network) { network.destroy(); network = null; }
}
