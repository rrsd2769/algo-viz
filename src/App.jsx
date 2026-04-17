import { useState, useRef, useCallback } from "react";
import { GLOBAL_CSS, TABS } from "./utils/constants";
import { useSortState } from "./hooks/useSortState";
import { useGraphState } from "./hooks/useGraphState";
import { useKMPState } from "./hooks/useKMPState";
import { SortingVisualizer } from "./components/sorting/SortingVisualizer";
import { GraphVisualizer } from "./components/graph/GraphVisualizer";
import { KMPVisualizer } from "./components/string/KMPVisualizer";
import { ComparisonMode } from "./components/comparison/ComparisonMode";
import { SortSidebar, GraphSidebar, KMPSidebar } from "./components/shared/Sidebar";

const SIDEBAR_MIN = 140;
const SIDEBAR_MAX = 320;
const SIDEBAR_DEFAULT = 216;

export default function App() {
  const [tab, setTab] = useState("sort");
  const sortState  = useSortState();
  const graphState = useGraphState();
  const kmpState   = useKMPState();

  // Resizable sidebar
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT);
  const [collapsed, setCollapsed]       = useState(false);
  const dragging  = useRef(false);
  const startX    = useRef(0);
  const startW    = useRef(SIDEBAR_DEFAULT);

  const onDragStart = useCallback((e) => {
    dragging.current = true;
    startX.current   = e.clientX;
    startW.current   = sidebarWidth;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const onMove = (ev) => {
      if (!dragging.current) return;
      const delta = ev.clientX - startX.current;
      const next  = Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, startW.current + delta));
      setSidebarWidth(next);
    };
    const onUp = () => {
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
  }, [sidebarWidth]);

  const currentAlgo =
    tab === "sort"    ? sortState.algo  :
    tab === "graph"   ? graphState.algo :
    tab === "compare" ? {name:"Compare",    color:"#7c3aed", desc:"Select 2 algorithms"} :
                        {name:"KMP Search", color:"#7c3aed", desc:"Knuth-Morris-Pratt"};

  const effectiveWidth = collapsed ? 0 : sidebarWidth;

  return (
    <div style={{display:"flex",height:"100vh",background:"#060d1a",color:"#f1f5f9",fontFamily:"'JetBrains Mono','Fira Code','Courier New',monospace",overflow:"hidden"}}>
      <style>{GLOBAL_CSS}</style>

      {/* ── Sidebar ── */}
      <aside style={{
        width: effectiveWidth, flexShrink:0,
        background:"#0b1120", borderRight:"1px solid #1e293b",
        display:"flex", flexDirection:"column", overflowY:"auto",
        overflowX:"hidden", transition: dragging.current ? "none" : "width 0.18s ease",
      }}>
        {!collapsed && (
          <>
            <div style={{padding:"0.9rem 0.75rem 0.45rem",flexShrink:0}}>
              <div style={{fontSize:"1.05rem",fontWeight:800,color:"#f1f5f9",letterSpacing:"-0.03em",whiteSpace:"nowrap"}}>
                algo<span style={{color:currentAlgo.color}}>viz</span>
                <span style={{fontSize:"0.55rem",color:"#334155",marginLeft:"0.4rem",fontWeight:400}}>v3.0</span>
              </div>
            </div>

            <div style={{padding:"0 0.55rem 0.45rem",flexShrink:0}}>
              <div style={{fontSize:"0.6rem",color:"#475569",fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:"0.3rem"}}>Module</div>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} style={{
                  width:"100%", padding:"0.4rem 0.55rem", marginBottom:"0.18rem", borderRadius:7,
                  textAlign:"left", cursor:"pointer", fontFamily:"inherit",
                  border:`1px solid ${tab===t.id ? currentAlgo.color : "#1e293b"}`,
                  background:tab===t.id ? `${currentAlgo.color}18` : "transparent",
                  color:tab===t.id ? currentAlgo.color : "#475569",
                  fontSize:"0.75rem", fontWeight:tab===t.id ? 700 : 400,
                  transition:"all 0.15s", display:"flex", alignItems:"center", gap:"0.4rem",
                  whiteSpace:"nowrap", overflow:"hidden",
                }}>
                  <span>{t.icon}</span>{t.label}
                </button>
              ))}
            </div>

            <div style={{borderTop:"1px solid #1e293b",margin:"0 0.55rem"}}/>

            <div style={{padding:"0.6rem 0.55rem",flex:1,display:"flex",flexDirection:"column",gap:"0.7rem",overflowY:"auto"}}>
              {tab === "sort"    && <SortSidebar  state={sortState}/>}
              {tab === "graph"   && <GraphSidebar state={graphState}/>}
              {tab === "kmp"     && <KMPSidebar   state={kmpState}/>}
              {tab === "compare" && (
                <div style={{fontSize:"0.72rem",color:"#475569",lineHeight:1.5}}>
                  Select exactly 2 algorithms in the comparison panel to run them side by side on the
                  <strong style={{color:"#94a3b8"}}> same array</strong> with synchronized playback and per-algorithm metrics.
                </div>
              )}
            </div>
          </>
        )}
      </aside>

      {/* ── Drag handle + collapse toggle ── */}
      <div style={{position:"relative",width:"8px",flexShrink:0,cursor:"col-resize",zIndex:20}}
        onMouseDown={onDragStart}>
        <div style={{
          position:"absolute",top:0,bottom:0,left:"3px",width:"2px",
          background:"#1e293b",transition:"background 0.15s",
        }}/>
        {/* Collapse/expand button */}
        <button
          onClick={() => setCollapsed(c => !c)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{
            position:"absolute", top:"50%", left:"50%",
            transform:"translate(-50%,-50%)",
            width:18, height:32, borderRadius:4,
            background:"#1e293b", border:"1px solid #334155",
            color:"#475569", cursor:"pointer", fontSize:"0.6rem",
            display:"flex", alignItems:"center", justifyContent:"center",
            padding:0, lineHeight:1,
          }}>
          {collapsed ? "›" : "‹"}
        </button>
      </div>

      {/* ── Main content ── */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>
        <header style={{padding:"0.6rem 1rem",borderBottom:"1px solid #1e293b",display:"flex",alignItems:"center",justifyContent:"space-between",background:"#0b1120",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:"0.6rem"}}>
            <span style={{fontSize:"0.9rem",fontWeight:700,color:currentAlgo.color}}>{currentAlgo.name}</span>
            <span style={{fontSize:"0.7rem",color:"#334155"}}>{currentAlgo.desc}</span>
          </div>
          <div style={{display:"flex",gap:"0.28rem"}}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                border:`1px solid ${tab===t.id ? "#334155" : "#1e293b"}`, borderRadius:7,
                background:tab===t.id ? "#1e293b" : "transparent",
                color:tab===t.id ? "#f1f5f9" : "#334155",
                fontSize:"0.7rem", fontWeight:tab===t.id ? 700 : 400,
                padding:"0.2rem 0.55rem", cursor:"pointer", fontFamily:"inherit",
              }}>{t.icon} {t.label}</button>
            ))}
          </div>
        </header>

        {tab === "sort"    && <SortingVisualizer state={sortState}/>}
        {tab === "graph"   && <GraphVisualizer   state={graphState}/>}
        {tab === "kmp"     && <KMPVisualizer     state={kmpState}/>}
        {tab === "compare" && <ComparisonMode/>}
      </div>
    </div>
  );
}
