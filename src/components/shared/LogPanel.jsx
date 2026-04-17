import { useEffect, useRef } from "react";
import { EV_COLOR, EV_ICON } from "../../utils/constants";

export function LogPanel({logs}) {
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({behavior:"smooth"}); }, [logs]);
  return (
    <div style={{height:"100%",overflowY:"auto",padding:"0.3rem 0.6rem",display:"flex",flexDirection:"column",gap:2}}>
      {logs.length === 0 && (
        <div style={{color:"#334155",fontSize:"0.75rem",textAlign:"center",marginTop:"0.6rem"}}>
          Press Play or Step Forward…
        </div>
      )}
      {logs.map((l,i) => (
        <div key={i} style={{display:"flex",alignItems:"center",gap:"0.4rem",fontSize:"0.74rem",color:"#94a3b8",borderBottom:"1px solid #0f172a",padding:"0.12rem 0"}}>
          <span style={{color:EV_COLOR[l.type]||"#64748b",minWidth:"1rem",fontFamily:"monospace"}}>{EV_ICON[l.type]||"·"}</span>
          <span style={{color:"#475569",minWidth:"2.8rem",fontSize:"0.65rem"}}>{l.type?.slice(0,6)}</span>
          <span>{l.msg}</span>
        </div>
      ))}
      <div ref={endRef}/>
    </div>
  );
}
