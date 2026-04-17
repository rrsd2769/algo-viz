import { useMemo } from "react";
import { Controls } from "../shared/Controls";
import { LogPanel } from "../shared/LogPanel";
import { ProgressBar } from "../shared/ProgressBar";
import { ComplexityChart } from "../complexity/ComplexityChart";
import { SORT_EV_COLORS } from "../../utils/constants";

function BarsViz({displayArray, frame}) {
  const max = useMemo(() => Math.max(...displayArray, 1), [displayArray]);
  const highlights = frame?.highlights || {}, sorted = frame?.sorted || new Set();
  return (
    <div style={{display:"flex",alignItems:"flex-end",justifyContent:"center",gap:"2px",height:"100%",padding:"0.6rem 0.6rem 0",width:"100%",boxSizing:"border-box"}}>
      {displayArray.map((val,i) => {
        const ht = highlights[i];
        const color = sorted.has(i) ? "#10b981" : ht ? (SORT_EV_COLORS[ht]||"#f59e0b") : "#1e3a5f";
        return (
          <div key={i} style={{
            flex:1, height:`${(val/max)*100}%`, background:color,
            borderRadius:"2px 2px 0 0", minWidth:"2px",
            transition:"height 0.07s ease,background 0.1s ease",
            boxShadow:ht?`0 0 6px ${color}88`:"none",
          }}/>
        );
      })}
    </div>
  );
}

function MetricsPanel({comparisons, swaps, timeTaken, color}) {
  const fmt = ms => ms < 1000 ? `${Math.round(ms)} ms` : `${(ms/1000).toFixed(2)} s`;
  const metric = (label, value, accent) => (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1,padding:"0.35rem 0.5rem",background:"#0f172a",borderRadius:6,border:`1px solid #1e293b`}}>
      <span style={{fontSize:"0.62rem",color:"#475569",marginBottom:"0.18rem",textTransform:"uppercase",letterSpacing:"0.06em"}}>{label}</span>
      <span style={{fontSize:"1rem",fontWeight:700,color:accent,fontVariantNumeric:"tabular-nums"}}>{value}</span>
    </div>
  );
  return (
    <div style={{padding:"0.45rem 1rem",background:"#080f1e",borderTop:"1px solid #1e293b",flexShrink:0}}>
      <div style={{fontSize:"0.6rem",color:"#334155",fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:"0.3rem"}}>Performance Metrics</div>
      <div style={{display:"flex",gap:"0.4rem"}}>
        {metric("Comparisons", comparisons, "#f59e0b")}
        {metric("Swaps / Writes", swaps, "#ef4444")}
        {metric("Time", fmt(timeTaken), color)}
      </div>
    </div>
  );
}

export function SortingVisualizer({state}) {
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{flex:1,position:"relative",background:"#060d1a",overflow:"hidden"}}>
        <ProgressBar progress={state.progress} color={state.algo.color}/>
        <BarsViz displayArray={state.displayArray} frame={state.frame}/>
      </div>
      <MetricsPanel
        comparisons={state.currentCmp}
        swaps={state.currentSw}
        timeTaken={state.timeTaken}
        color={state.algo.color}
      />
      <div style={{background:"#0a1425",borderTop:"1px solid #1e293b",padding:"0.6rem 1rem",flexShrink:0}}>
        <ComplexityChart cmpData={state.cmpData} swData={state.swData}/>
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

