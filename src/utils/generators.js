import { EV } from "./constants";

export function generateArray(size) {
  return Array.from({length: size}, () => Math.floor(Math.random() * 90) + 10);
}

export function makeDefaultGraph() {
  const nodes = [
    {id:0,label:"A",x:0.10,y:0.20},{id:1,label:"B",x:0.30,y:0.10},
    {id:2,label:"C",x:0.55,y:0.10},{id:3,label:"D",x:0.80,y:0.18},
    {id:4,label:"E",x:0.15,y:0.50},{id:5,label:"F",x:0.40,y:0.42},
    {id:6,label:"G",x:0.65,y:0.38},{id:7,label:"H",x:0.88,y:0.48},
    {id:8,label:"I",x:0.12,y:0.78},{id:9,label:"J",x:0.38,y:0.72},
    {id:10,label:"K",x:0.63,y:0.75},{id:11,label:"L",x:0.86,y:0.80},
  ];
  const edges = [
    [0,1,4],[0,4,2],[1,2,5],[1,5,3],[2,3,2],[2,6,4],
    [3,7,3],[4,5,6],[4,8,5],[5,6,3],[5,9,4],[6,7,2],
    [6,10,5],[7,11,4],[8,9,3],[9,10,4],[10,11,3],[9,5,2],
  ];
  const adj = Array.from({length: nodes.length}, () => []);
  edges.forEach(([u,v,w]) => { adj[u].push({to:v,w}); adj[v].push({to:u,w}); });
  return {nodes, edges, adj};
}

// Supports two formats:
//   "A B 5"  (space-separated: src dst weight)
//   "A: B(5), C(3)"  (colon-list format)
export function parseAdjList(raw, directed = false) {
  const lines = raw.trim().split("\n").map(l => l.trim()).filter(Boolean);
  const nodeMap = new Map();
  const edgesRaw = [];
  const useColon = lines.some(l => l.includes(":"));

  if (useColon) {
    lines.forEach(line => {
      const [src, rest] = line.split(":").map(s => s.trim());
      if (!src) return;
      if (!nodeMap.has(src)) nodeMap.set(src, nodeMap.size);
      if (!rest) return;
      rest.split(",").map(s => s.trim()).filter(Boolean).forEach(token => {
        const m = token.match(/^(\w+)\((\d+(?:\.\d+)?)\)$|^(\w+)$/);
        if (!m) throw new Error(`Invalid token: "${token}"`);
        const dest = m[1] || m[3], w = m[2] ? parseFloat(m[2]) : 1;
        if (!nodeMap.has(dest)) nodeMap.set(dest, nodeMap.size);
        edgesRaw.push([src, dest, w]);
      });
    });
  } else {
    lines.forEach(line => {
      const parts = line.split(/\s+/);
      if (parts.length < 2) throw new Error(`Bad line: "${line}"`);
      const [src, dest] = parts;
      const w = parts[2] ? parseFloat(parts[2]) : 1;
      if (isNaN(w) || w <= 0) throw new Error(`Invalid weight in: "${line}"`);
      [src, dest].forEach(l => { if (!nodeMap.has(l)) nodeMap.set(l, nodeMap.size); });
      edgesRaw.push([src, dest, w]);
    });
  }

  const n = nodeMap.size;
  if (n === 0) throw new Error("No nodes found.");

  const nodes = Array.from(nodeMap.entries()).map(([label, id]) => {
    const angle = (2 * Math.PI * id) / n - Math.PI / 2;
    return { id, label, x: 0.5 + 0.38 * Math.cos(angle), y: 0.5 + 0.38 * Math.sin(angle) };
  });

  const edges = [];
  const adj = Array.from({length: n}, () => []);
  edgesRaw.forEach(([srcL, dstL, w]) => {
    const u = nodeMap.get(srcL), v = nodeMap.get(dstL);
    edges.push([u, v, w]);
    adj[u].push({to: v, w});
    if (!directed) adj[v].push({to: u, w});
  });

  return {nodes, edges, adj, directed};
}

export function buildSortFrames(events) {
  const sortedSet = new Set();
  let cumCmp = 0, cumSw = 0;
  return events.map(evt => {
    if (evt.type === EV.SORTED) evt.indices.forEach(i => sortedSet.add(i));
    cumCmp += evt.cmp || 0;
    cumSw  += evt.sw  || 0;
    return {
      array: evt.array,
      highlights: evt.indices.reduce((a, idx) => ({...a, [idx]: evt.type}), {}),
      sorted: new Set(sortedSet),
      event: evt,
      cumCmp,
      cumSw,
    };
  });
}

export function buildGraphFrames(events) {
  return events.map(evt => ({
    event: evt,
    node: evt.node,
    to: evt.to,
    path: evt.path || null,
    visited: evt.visited || [],
    parent: evt.parent || [],
    queue: evt.queue || null,
    g: evt.g || null,
    f: evt.f || null,
    open: evt.open || null,
    closed: evt.closed || null,
  }));
}

export function buildKMPFrames(events) {
  return events.map(evt => ({event: evt}));
}
