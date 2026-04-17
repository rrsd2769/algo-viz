import { useState } from "react";
import { SectionLabel } from "./SectionLabel";
import { StatsBox, AlgoBtn } from "./StatsBox";
import { SORT_ALGOS } from "../../hooks/useSortState";
import { GRAPH_ALGOS } from "../../hooks/useGraphState";

export function SortSidebar({state}) {
  const [rawInput, setRawInput] = useState("");

  const handleApply = () => {
    // FIX: pass rawInput directly to applyCustomInput which handles validation + compile
    state.applyCustomInput(rawInput);
  };

  const handleRandom = () => {
    setRawInput("");
    state.reset();
  };

  const fmt = ms => ms < 1 ? "0 ms" : ms < 1000 ? `${Math.round(ms)} ms` : `${(ms/1000).toFixed(2)} s`;

  return (
    <>
      <div>
        <SectionLabel>Algorithm</SectionLabel>
        {Object.entries(SORT_ALGOS).map(([k,a]) => (
          <AlgoBtn key={k} active={state.algoKey===k} color={a.color} name={a.name} desc={a.desc} onClick={() => state.changeAlgo(k)}/>
        ))}
      </div>
      <div>
        <SectionLabel>Array Size: <span style={{color:"#f1f5f9"}}>{state.arraySize}</span></SectionLabel>
        <input type="range" min={4} max={80} value={state.arraySize}
          onChange={e => state.changeSize(+e.target.value)}
          style={{width:"100%",accentColor:state.algo.color,cursor:"pointer"}}/>
      </div>
      <div>
        <SectionLabel>Custom Array</SectionLabel>
        <textarea
          value={rawInput}
          onChange={e => setRawInput(e.target.value)}
          placeholder="e.g. 42, 7, 19, 3, 88" rows={2}
          style={{
            width:"100%",
            background:"#0f172a",
            border:`1px solid ${state.inputError ? "#ef4444" : "#334155"}`,
            borderRadius:6, padding:"0.35rem 0.45rem",
            color:"#f1f5f9", fontFamily:"monospace", fontSize:"0.73rem",
            resize:"none", outline:"none", boxSizing:"border-box",
          }}
        />
        {state.inputError && (
          <div style={{fontSize:"0.68rem",color:"#ef4444",marginTop:2}}>{state.inputError}</div>
        )}
        <div style={{display:"flex",gap:"0.35rem",marginTop:"0.35rem"}}>
          <button onClick={handleApply} style={{flex:1,padding:"0.32rem",background:state.algo.color,border:"none",borderRadius:6,color:"#fff",fontWeight:700,fontSize:"0.73rem",cursor:"pointer",fontFamily:"inherit"}}>Apply</button>
          <button onClick={handleRandom} style={{flex:1,padding:"0.32rem",background:"transparent",border:"1px solid #334155",borderRadius:6,color:"#94a3b8",fontSize:"0.73rem",cursor:"pointer",fontFamily:"inherit"}}>Random</button>
        </div>
      </div>
      <StatsBox rows={[
        ["Steps",    state.frames.length],
        ["Progress", `${state.progress.toFixed(1)}%`],
        ["Compares", state.currentCmp],
        ["Swaps",    state.currentSw],
        ["Time",     fmt(state.timeTaken)],
      ]}/>
    </>
  );
}

export function GraphSidebar({state}) {
  const [showInput, setShowInput] = useState(false);
  return (
    <>
      <div>
        <SectionLabel>Algorithm</SectionLabel>
        {Object.entries(GRAPH_ALGOS).map(([k,a]) => (
          <AlgoBtn key={k} active={state.algoKey===k} color={a.color} name={a.name} desc={a.desc} onClick={() => state.changeAlgo(k)}/>
        ))}
      </div>
      <div>
        <SectionLabel>Start / End Node</SectionLabel>
        <div style={{display:"flex",gap:"0.35rem"}}>
          <select value={state.startNode} onChange={e=>state.changeStart(+e.target.value)} style={{flex:1,background:"#0f172a",border:"1px solid #334155",borderRadius:6,padding:"0.32rem",color:"#22d3ee",fontSize:"0.76rem",fontFamily:"inherit",outline:"none"}}>
            {state.graph.nodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
          </select>
          <select value={state.endNode} onChange={e=>state.changeEnd(+e.target.value)} style={{flex:1,background:"#0f172a",border:"1px solid #334155",borderRadius:6,padding:"0.32rem",color:"#f97316",fontSize:"0.76rem",fontFamily:"inherit",outline:"none"}}>
            {state.graph.nodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
          </select>
        </div>
        <div style={{display:"flex",gap:"0.35rem",marginTop:"0.18rem"}}>
          <span style={{flex:1,fontSize:"0.62rem",color:"#22d3ee",textAlign:"center"}}>Start (cyan)</span>
          <span style={{flex:1,fontSize:"0.62rem",color:"#f97316",textAlign:"center"}}>End (orange)</span>
        </div>
      </div>
      <div>
        <button onClick={() => setShowInput(v=>!v)} style={{width:"100%",padding:"0.38rem",background:showInput?"#1e293b":"transparent",border:"1px solid #334155",borderRadius:7,color:"#94a3b8",fontSize:"0.76rem",cursor:"pointer",fontFamily:"inherit"}}>
          {showInput ? "▲ Hide" : "▼ Custom Graph"}
        </button>
        {showInput && (
          <div style={{marginTop:"0.35rem"}}>
            <div style={{fontSize:"0.65rem",color:"#475569",marginBottom:"0.28rem"}}>
              Format: <code style={{color:"#22d3ee"}}>A B 5</code> (src dst weight)<br/>
              or <code style={{color:"#22d3ee"}}>A: B(5), C(3)</code>
            </div>
            <textarea
              value={state.adjInput} onChange={e=>state.setAdjInput(e.target.value)} rows={5}
              placeholder={"A B 4\nA E 2\nB C 5\nB F 3\nC D 2"}
              style={{width:"100%",background:"#0a1425",border:`1px solid ${state.adjError?"#ef4444":"#334155"}`,borderRadius:6,padding:"0.35rem",color:"#f1f5f9",fontFamily:"monospace",fontSize:"0.7rem",resize:"vertical",outline:"none",boxSizing:"border-box"}}
            />
            {state.adjError && <div style={{fontSize:"0.67rem",color:"#ef4444",marginTop:2}}>{state.adjError}</div>}
            <div style={{display:"flex",gap:"0.35rem",marginTop:"0.35rem",alignItems:"center"}}>
              <label style={{display:"flex",alignItems:"center",gap:4,fontSize:"0.7rem",color:"#94a3b8",cursor:"pointer"}}>
                <input type="checkbox" checked={state.directed} onChange={e=>state.setDirected(e.target.checked)}/>Directed
              </label>
              <button onClick={() => state.applyAdjList(state.adjInput, state.directed)} style={{flex:1,padding:"0.32rem",background:state.algo.color,border:"none",borderRadius:6,color:"#fff",fontWeight:700,fontSize:"0.73rem",cursor:"pointer",fontFamily:"inherit"}}>Build</button>
              <button onClick={state.resetGraph} style={{padding:"0.32rem 0.5rem",background:"transparent",border:"1px solid #334155",borderRadius:6,color:"#94a3b8",fontSize:"0.73rem",cursor:"pointer",fontFamily:"inherit"}}>Default</button>
            </div>
          </div>
        )}
      </div>
      <StatsBox rows={[
        ["Steps",    state.frames.length],
        ["Progress", `${state.progress.toFixed(1)}%`],
        ["Nodes",    state.graph.nodes.length],
        ["Edges",    state.graph.edges.length],
      ]}/>
      {state.algoKey === "astar" && (
        <div style={{fontSize:"0.73rem",color:"#475569",background:"#0f172a",borderRadius:7,padding:"0.55rem 0.65rem",border:"1px solid #1e293b"}}>
          <div style={{color:"#f97316",fontWeight:700,marginBottom:"0.28rem"}}>A* Info</div>
          f(n) = g(n) + h(n)<br/>h = Euclidean x 10<br/>Priority Queue over open set
        </div>
      )}
    </>
  );
}

export function KMPSidebar({state}) {
  return (
    <>
      <StatsBox rows={[
        ["Steps",    state.frames.length],
        ["Progress", `${state.progress.toFixed(1)}%`],
        ["Text len", state.text.length],
        ["Pat len",  state.pattern.length],
      ]}/>
      <div style={{fontSize:"0.73rem",color:"#475569",background:"#0f172a",borderRadius:7,padding:"0.55rem 0.65rem",border:"1px solid #1e293b"}}>
        <div style={{color:"#7c3aed",fontWeight:700,marginBottom:"0.28rem"}}>KMP Info</div>
        Phase 1: Build LPS array<br/>Phase 2: Search with jumps<br/>O(n+m) time complexity
      </div>
    </>
  );
}

