import { SectionLabel } from "./SectionLabel";

export function StatsBox({rows}) {
  return (
    <div style={{background:"#0f172a",borderRadius:8,padding:"0.55rem 0.65rem",border:"1px solid #1e293b"}}>
      <SectionLabel>Stats</SectionLabel>
      {rows.map(([k,v]) => (
        <div key={k} style={{display:"flex",justifyContent:"space-between",marginBottom:"0.22rem",fontSize:"0.78rem"}}>
          <span style={{color:"#475569"}}>{k}</span>
          <span style={{color:"#94a3b8",fontWeight:600}}>{v}</span>
        </div>
      ))}
    </div>
  );
}

export function AlgoBtn({active, color, name, desc, onClick}) {
  return (
    <button onClick={onClick} style={{
      width:"100%", padding:"0.45rem 0.6rem", marginBottom:"0.22rem", borderRadius:7,
      textAlign:"left", cursor:"pointer", fontFamily:"inherit", fontSize:"0.78rem",
      border:`1px solid ${active ? color : "#1e293b"}`,
      background:active ? `${color}18` : "transparent",
      color:active ? color : "#475569", fontWeight:active ? 700 : 400,
      transition:"all 0.15s", display:"flex", justifyContent:"space-between", alignItems:"center",
    }}>
      <span>{name}</span>
      <span style={{fontSize:"0.62rem",color:active?`${color}99`:"#334155"}}>{desc}</span>
    </button>
  );
}
