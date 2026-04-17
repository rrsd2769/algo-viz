import { Controls } from "../shared/Controls";
import { LogPanel } from "../shared/LogPanel";
import { ProgressBar } from "../shared/ProgressBar";
import { EV, EV_COLOR, EV_ICON } from "../../utils/constants";

function GraphViz({graph, frame, algoKey, startNode, endNode}) {
  const {nodes, edges} = graph;
  const W = 560, H = 310;
  const visited  = frame?.visited || [];
  const path     = frame?.path   || null;
  const open     = frame?.open   || null;
  const closed   = frame?.closed || null;
  const gCosts   = frame?.g      || null;
  const fCosts   = frame?.f      || null;
  const curNode  = frame?.event?.type === EV.ASTAR_CURRENT ? frame.event.node
                 : frame?.event?.type === EV.VISIT          ? frame.event.node : -1;
  const curFrom  = frame?.event?.node;
  const curTo    = frame?.event?.to;
  const pathSet  = path ? new Set(path) : null;

  const edgeColor = (u, v) => {
    if (pathSet) { const pu=path.indexOf(u), pv=path.indexOf(v); if (Math.abs(pu-pv)===1) return "#f0abfc"; }
    if ((curFrom===u && curTo===v) || (curFrom===v && curTo===u)) return EV_COLOR[EV.EDGE_EXPLORE];
    return "#1e3a5f";
  };

  const nodeColor = id => {
    if (id === startNode) return "#22d3ee";
    if (id === endNode)   return "#f97316";
    if (pathSet?.has(id)) return "#f0abfc";
    if (algoKey === "astar") {
      if (closed?.has(id)) return "#4b5563";
      if (open?.has(id))   return "#ca8a04";
    }
    if (visited[id]) return "#1d4ed8";
    if (curNode === id) return "#f97316";
    return "#0f172a";
  };

  const nodeStroke = id => {
    if (id === startNode || id === endNode) return "none";
    if (curNode === id)   return "#f97316";
    if (pathSet?.has(id)) return "#f0abfc";
    return visited[id] ? "#3b82f6" : "#334155";
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:"100%",display:"block"}}>
      {edges.map(([u,v,w]) => {
        const nu = nodes[u], nv = nodes[v];
        if (!nu || !nv) return null;
        const x1=nu.x*W, y1=nu.y*H, x2=nv.x*W, y2=nv.y*H;
        const color = edgeColor(u, v);
        const isPath = pathSet && path.indexOf(u) >= 0 && Math.abs(path.indexOf(u)-path.indexOf(v)) === 1;
        return (
          <g key={`${u}-${v}`}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={isPath?2.5:1.2} opacity={isPath?1:0.6}/>
            <text x={(x1+x2)/2} y={(y1+y2)/2-3} textAnchor="middle" fontSize={8} fill="#475569">{w}</text>
          </g>
        );
      })}
      {nodes.map(n => {
        const cx = n.x*W, cy = n.y*H;
        const isAstar = algoKey === "astar";
        const g = gCosts && gCosts[n.id] < 1e8 ? gCosts[n.id] : null;
        const f = fCosts && fCosts[n.id] < 1e8 ? fCosts[n.id] : null;
        return (
          <g key={n.id}>
            <circle cx={cx} cy={cy} r={14} fill={nodeColor(n.id)} stroke={nodeStroke(n.id)} strokeWidth={1.5}/>
            <text x={cx} y={cy+4} textAnchor="middle" fontSize={10} fontWeight={700} fill="#f1f5f9" fontFamily="monospace">{n.label}</text>
            {isAstar && g !== null && (
              <text x={cx} y={cy-18} textAnchor="middle" fontSize={7} fill="#facc15">{`g${g} f${f}`}</text>
            )}
          </g>
        );
      })}
      {[{c:"#22d3ee",l:"Start"},{c:"#f97316",l:"End"},{c:"#1d4ed8",l:"Visited"},
        ...(algoKey==="astar"?[{c:"#ca8a04",l:"Open"},{c:"#4b5563",l:"Closed"}]:[]),
        {c:"#f0abfc",l:"Path"}].map(({c,l},i) => (
        <g key={l} transform={`translate(${8+i*72},${H-12})`}>
          <circle cx={5} cy={0} r={4} fill={c}/>
          <text x={12} y={4} fontSize={8} fill="#64748b">{l}</text>
        </g>
      ))}
    </svg>
  );
}

export function GraphVisualizer({state}) {
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{flex:1,position:"relative",background:"#060d1a",overflow:"hidden"}}>
        <ProgressBar progress={state.progress} color={state.algo.color}/>
        <GraphViz graph={state.graph} frame={state.frame} algoKey={state.algoKey} startNode={state.startNode} endNode={state.endNode}/>
        {state.frame && (
          <div style={{
            position:"absolute", top:8, right:8, fontSize:"0.78rem", fontWeight:700,
            color:EV_COLOR[state.frame.event.type]||"#94a3b8",
            background:`${EV_COLOR[state.frame.event.type]||"#334155"}22`,
            border:`1px solid ${EV_COLOR[state.frame.event.type]||"#334155"}44`,
            padding:"0.2rem 0.6rem", borderRadius:16, backdropFilter:"blur(4px)",
          }}>
            {EV_ICON[state.frame.event.type]} {state.frame.event.type}
          </div>
        )}
        {state.algoKey === "astar" && state.frame?.g && (
          <div style={{position:"absolute",top:8,left:8,background:"#0b112088",border:"1px solid #1e293b",borderRadius:8,padding:"0.4rem 0.6rem",backdropFilter:"blur(4px)"}}>
            <div style={{fontSize:"0.63rem",color:"#64748b",fontWeight:700,letterSpacing:"0.08em",marginBottom:"0.2rem"}}>NODE COSTS</div>
            {state.graph.nodes.map(n => {
              const g = state.frame.g[n.id], f = state.frame.f[n.id];
              if (g >= 1e8) return null;
              return (
                <div key={n.id} style={{
                  fontSize:"0.7rem",
                  color:state.frame.open?.has(n.id)?"#facc15":state.frame.closed?.has(n.id)?"#6b7280":"#94a3b8",
                  display:"flex", gap:"0.4rem", marginBottom:1,
                }}>
                  <span style={{minWidth:"0.7rem",fontWeight:700}}>{n.label}</span>
                  <span>g={g}</span><span>h={f-g}</span><span style={{color:"#f97316"}}>f={f}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div style={{padding:"0.7rem 1rem",background:"#0b1120",borderTop:"1px solid #1e293b",flexShrink:0}}>
        <Controls {...state} accentColor={state.algo.color}/>
      </div>
      <div style={{height:"8.5rem",background:"#050c19",borderTop:"1px solid #1e293b",flexShrink:0}}>
        <div style={{padding:"0.22rem 0.6rem",fontSize:"0.63rem",color:"#334155",fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",borderBottom:"1px solid #1e293b"}}>▸ Event Log</div>
        <div style={{height:"calc(100% - 1.3rem)"}}><LogPanel logs={state.logs}/></div>
      </div>
    </div>
  );
}
