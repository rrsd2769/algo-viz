import { Controls } from "../shared/Controls";
import { LogPanel } from "../shared/LogPanel";
import { ProgressBar } from "../shared/ProgressBar";
import { SectionLabel } from "../shared/SectionLabel";
import { EV, EV_COLOR, EV_ICON } from "../../utils/constants";

function KMPViz({text, pattern, frame}) {
  if (!frame) {
    return (
      <div style={{padding:"1.2rem",color:"#475569",fontSize:"0.9rem"}}>
        Enter text &amp; pattern, press Run then Play.
      </div>
    );
  }

  const evt = frame.event, lps = evt.lps || [];
  const isLPS = evt.type === EV.KMP_LPS_COMPUTE || evt.type === EV.KMP_LPS_MATCH;
  const ti = evt.ti ?? -1, pi = evt.pi ?? -1, matchStart = evt.matchStart ?? -1;
  const matches = evt.matches || [], skipBy = evt.skipBy;

  const textColors = Array.from({length:text.length}, (_,i) => {
    if (matches.some(m => i >= m && i < m+pattern.length)) return "#10b981";
    if (evt.type === EV.KMP_FOUND  && i >= matchStart && i < matchStart+pattern.length) return "#10b981";
    if (evt.type === EV.KMP_SKIP   && i >= ti-pi && i < ti-pi+pi) return "#f59e0b";
    if (i === ti) return evt.type === EV.KMP_MATCH ? "#4ade80" : "#ef4444";
    return "#64748b";
  });

  const patColors = Array.from({length:pattern.length}, (_,i) => {
    if (evt.type === EV.KMP_FOUND) return "#10b981";
    if (i === pi) return evt.type === EV.KMP_MATCH ? "#4ade80" : "#ef4444";
    if (i < pi)   return "#4ade8066";
    return "#475569";
  });

  const cell = (color, highlight=false) => ({
    width:"1.5rem", height:"1.65rem", display:"flex", alignItems:"center", justifyContent:"center",
    borderRadius:4, fontSize:"0.8rem", fontWeight:700, fontFamily:"monospace",
    background:highlight ? `${color}30` : "#0f172a", color,
    border:`1px solid ${highlight ? color : "#1e293b"}`,
    transition:"all 0.15s", flexShrink:0, position:"relative",
  });

  return (
    <div style={{padding:"0.8rem 1rem",display:"flex",flexDirection:"column",gap:"0.8rem"}}>
      <div style={{
        fontSize:"0.78rem", fontWeight:700,
        color:EV_COLOR[evt.type]||"#94a3b8",
        background:`${EV_COLOR[evt.type]||"#334155"}18`,
        border:`1px solid ${EV_COLOR[evt.type]||"#334155"}44`,
        padding:"0.22rem 0.7rem", borderRadius:16, alignSelf:"flex-start",
      }}>
        {EV_ICON[evt.type]} {evt.type} — {evt.message}
      </div>

      {!isLPS && (
        <>
          <div>
            <SectionLabel>Text</SectionLabel>
            <div style={{display:"flex",gap:2,flexWrap:"wrap"}}>
              {[...text].map((ch,i) => (
                <div key={i} style={cell(textColors[i], i===ti)}>
                  {ch}
                  <span style={{fontSize:"0.42rem",color:"#334155",position:"absolute",bottom:1,right:2}}>{i}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <SectionLabel>
              Pattern (offset {Math.max(0,ti-pi)})
              {skipBy && <span style={{color:"#f59e0b",marginLeft:"0.5rem"}}>← jump {skipBy} by LPS</span>}
            </SectionLabel>
            <div style={{display:"flex",gap:2,marginLeft:`${Math.max(0,ti-pi)*26}px`}}>
              {[...pattern].map((ch,i) => <div key={i} style={cell(patColors[i], i===pi)}>{ch}</div>)}
            </div>
          </div>
          {matches.length > 0 && (
            <div style={{fontSize:"0.82rem",color:"#10b981"}}>★ Matches at indices: {matches.join(", ")}</div>
          )}
        </>
      )}

      <div>
        <SectionLabel>
          LPS Array (Failure Function)
          {isLPS && <span style={{color:"#a78bfa",marginLeft:"0.5rem"}}>← Building…</span>}
        </SectionLabel>
        <div style={{display:"flex",gap:2,marginBottom:"0.25rem"}}>
          {[...pattern].map((ch,i) => (
            <div key={i} style={{
              ...cell(isLPS && i===evt.i ? "#a78bfa" : "#64748b", isLPS && i===evt.i),
              height:"2.5rem", flexDirection:"column", gap:1,
            }}>
              <span style={{fontSize:"0.8rem"}}>{ch}</span>
              <span style={{fontSize:"0.6rem",color:lps[i]>0?"#22d3ee":"#334155"}}>{lps[i]??""}</span>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:2}}>
          {lps.map((v,i) => (
            <div key={i} style={cell(v>0?"#22d3ee":"#334155")}>
              <span style={{fontSize:"0.65rem"}}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{display:"flex",gap:"0.65rem",flexWrap:"wrap"}}>
        {[["#4ade80","Match"],["#ef4444","Mismatch"],["#f59e0b","Skipped"],["#10b981","Found"],["#22d3ee","LPS value"]].map(([c,l]) => (
          <div key={l} style={{display:"flex",alignItems:"center",gap:"0.25rem",fontSize:"0.72rem",color:"#64748b"}}>
            <div style={{width:8,height:8,borderRadius:2,background:c}}/>{l}
          </div>
        ))}
      </div>
    </div>
  );
}

export function KMPVisualizer({state}) {
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{padding:"0.6rem 1rem",background:"#0a1425",borderBottom:"1px solid #1e293b",display:"flex",gap:"0.65rem",flexWrap:"wrap",flexShrink:0,alignItems:"flex-end"}}>
        <div style={{display:"flex",flexDirection:"column",gap:"0.22rem",flex:2,minWidth:"11rem"}}>
          <label style={{fontSize:"0.63rem",color:"#475569",fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase"}}>Text</label>
          <input
            value={state.text}
            onChange={e => state.setText(e.target.value.toUpperCase())}
            style={{background:"#0f172a",border:"1px solid #334155",borderRadius:6,padding:"0.32rem 0.5rem",color:"#f1f5f9",fontFamily:"monospace",fontSize:"0.8rem",outline:"none"}}
          />
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:"0.22rem",flex:1,minWidth:"9rem"}}>
          <label style={{fontSize:"0.63rem",color:"#475569",fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase"}}>Pattern</label>
          <input
            value={state.pattern}
            onChange={e => state.setPattern(e.target.value.toUpperCase())}
            style={{background:"#0f172a",border:"1px solid #334155",borderRadius:6,padding:"0.32rem 0.5rem",color:"#f1f5f9",fontFamily:"monospace",fontSize:"0.8rem",outline:"none"}}
          />
        </div>
        <button onClick={state.run} style={{border:"none",borderRadius:7,background:"#7c3aed",color:"#fff",fontWeight:700,fontSize:"0.82rem",padding:"0.4rem 0.85rem",cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>
          ▶ Run KMP
        </button>
      </div>
      <div style={{flex:1,overflowY:"auto",background:"#060d1a",position:"relative"}}>
        <ProgressBar progress={state.progress} color="#7c3aed"/>
        <KMPViz text={state.text} pattern={state.pattern} frame={state.frame}/>
      </div>
      <div style={{padding:"0.7rem 1rem",background:"#0b1120",borderTop:"1px solid #1e293b",flexShrink:0}}>
        <Controls {...state} accentColor="#7c3aed"/>
      </div>
      <div style={{height:"8.5rem",background:"#050c19",borderTop:"1px solid #1e293b",flexShrink:0}}>
        <div style={{padding:"0.22rem 0.6rem",fontSize:"0.63rem",color:"#334155",fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",borderBottom:"1px solid #1e293b"}}>▸ Event Log</div>
        <div style={{height:"calc(100% - 1.3rem)"}}><LogPanel logs={state.logs}/></div>
      </div>
    </div>
  );
}
