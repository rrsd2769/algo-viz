import { EV } from "../../utils/constants";

export function bfsEvents(graph, start, end) {
  const {nodes, adj} = graph;
  const n = nodes.length;
  const events = [], visited = new Array(n).fill(false), parent = new Array(n).fill(-1);
  const queue = [start];
  visited[start] = true;
  events.push({type:EV.ENQUEUE, node:start, visited:[...visited], queue:[...queue], parent:[...parent], message:`Start BFS from ${nodes[start].label}`});
  while (queue.length) {
    const u = queue.shift();
    events.push({type:EV.VISIT, node:u, visited:[...visited], queue:[...queue], parent:[...parent], message:`Visit ${nodes[u].label}`});
    if (u === end) {
      events.push({type:EV.PATH_FOUND, node:u, visited:[...visited], queue:[...queue], parent:[...parent], message:`Reached ${nodes[end].label}!`});
      const path = []; for (let v = end; v !== -1; v = parent[v]) path.unshift(v);
      path.forEach(p => events.push({type:EV.PATH_TRACE, node:p, path:[...path], visited:[...visited], queue:[...queue], parent:[...parent], message:`Path: ${path.map(x => nodes[x].label).join(" → ")}`}));
      break;
    }
    for (const {to} of adj[u]) {
      events.push({type:EV.EDGE_EXPLORE, node:u, to, visited:[...visited], queue:[...queue], parent:[...parent], message:`Explore ${nodes[u].label}→${nodes[to].label}`});
      if (!visited[to]) {
        visited[to] = true; parent[to] = u; queue.push(to);
        events.push({type:EV.ENQUEUE, node:to, visited:[...visited], queue:[...queue], parent:[...parent], message:`Enqueue ${nodes[to].label}`});
      }
    }
  }
  return events;
}

export function dfsEvents(graph, start, end) {
  const {nodes, adj} = graph;
  const n = nodes.length;
  const events = [], visited = new Array(n).fill(false), parent = new Array(n).fill(-1);
  let found = false;
  function dfs(u) {
    if (found) return;
    visited[u] = true;
    events.push({type:EV.VISIT, node:u, visited:[...visited], parent:[...parent], message:`Visit ${nodes[u].label}`});
    if (u === end) {
      found = true;
      events.push({type:EV.PATH_FOUND, node:u, visited:[...visited], parent:[...parent], message:`Reached ${nodes[end].label}!`});
      const path = []; for (let v = end; v !== -1; v = parent[v]) path.unshift(v);
      path.forEach(p => events.push({type:EV.PATH_TRACE, node:p, path:[...path], visited:[...visited], parent:[...parent], message:`Path: ${path.map(x => nodes[x].label).join(" → ")}`}));
      return;
    }
    for (const {to} of adj[u]) {
      events.push({type:EV.EDGE_EXPLORE, node:u, to, visited:[...visited], parent:[...parent], message:`Explore ${nodes[u].label}→${nodes[to].label}`});
      if (!visited[to]) {
        parent[to] = u;
        events.push({type:EV.EDGE_TREE, node:u, to, visited:[...visited], parent:[...parent], message:`Tree edge → ${nodes[to].label}`});
        dfs(to);
      } else {
        events.push({type:EV.EDGE_BACK, node:u, to, visited:[...visited], parent:[...parent], message:`Back edge → ${nodes[to].label} (visited)`});
      }
    }
  }
  dfs(start);
  return events;
}

export function astarEvents(graph, start, end) {
  const {nodes, adj} = graph;
  const n = nodes.length, events = [];
  const h = u => {
    const dx = nodes[u].x - nodes[end].x, dy = nodes[u].y - nodes[end].y;
    return Math.round(Math.sqrt(dx*dx + dy*dy) * 10);
  };
  const INF = 1e9;
  const g = new Array(n).fill(INF), f = new Array(n).fill(INF), parent = new Array(n).fill(-1);
  const openSet = new Set([start]), closedSet = new Set();
  g[start] = 0; f[start] = h(start);
  const snap = () => ({g:[...g], f:[...f], open:new Set(openSet), closed:new Set(closedSet), parent:[...parent]});
  events.push({type:EV.ASTAR_OPEN, node:start, ...snap(), message:`Start A* from ${nodes[start].label}. h=${h(start)}`});
  while (openSet.size > 0) {
    let current = -1, minF = INF;
    for (const u of openSet) if (f[u] < minF) { minF = f[u]; current = u; }
    if (current === -1) break;
    events.push({type:EV.ASTAR_CURRENT, node:current, ...snap(), message:`Current: ${nodes[current].label}  g=${g[current]} h=${h(current)} f=${f[current]}`});
    if (current === end) {
      events.push({type:EV.PATH_FOUND, node:current, ...snap(), message:`Path found! Cost=${g[end]}`});
      const path = []; for (let v = end; v !== -1; v = parent[v]) path.unshift(v);
      path.forEach(p => events.push({type:EV.PATH_TRACE, node:p, path:[...path], ...snap(), message:`Optimal: ${path.map(x => nodes[x].label).join("→")} (cost ${g[end]})`}));
      break;
    }
    openSet.delete(current); closedSet.add(current);
    events.push({type:EV.ASTAR_CLOSE, node:current, ...snap(), message:`Close ${nodes[current].label}`});
    for (const {to, w} of adj[current]) {
      if (closedSet.has(to)) continue;
      const tentG = g[current] + w;
      events.push({type:EV.EDGE_EXPLORE, node:current, to, ...snap(), message:`Edge ${nodes[current].label}→${nodes[to].label} w=${w}, tentG=${tentG}`});
      if (tentG < g[to]) {
        parent[to] = current; g[to] = tentG; f[to] = g[to] + h(to); openSet.add(to);
        events.push({type:EV.ASTAR_RELAX, node:to, ...snap(), message:`Relax ${nodes[to].label}: g=${g[to]} h=${h(to)} f=${f[to]}`});
      }
    }
  }
  return events;
}
