export function Controls({isPlaying, play, pause, stepForward, stepBack, reset, speed, setSpeed, currentFrame, frames, isDone, accentColor="#2563eb"}) {
  const framesLen = frames?.length ?? 0;
  const canBack = currentFrame > -1, canFwd = currentFrame < framesLen - 1;

  const Btn = ({onClick, disabled, children}) => (
    <button onClick={onClick} disabled={disabled} style={{
      border:`1px solid ${disabled?"#1e293b":"#334155"}`, borderRadius:8,
      background:disabled?"#0c1628":"#111e35", color:disabled?"#253550":"#94a3b8",
      cursor:disabled?"not-allowed":"pointer", fontFamily:"inherit", fontWeight:700,
      fontSize:"0.85rem", padding:"0.4rem 0.7rem", transition:"all 0.12s",
    }}>{children}</button>
  );

  return (
    <div style={{display:"flex",flexDirection:"column",gap:"0.55rem"}}>
      <div style={{display:"flex",gap:"0.4rem",alignItems:"center",flexWrap:"wrap"}}>
        <Btn onClick={stepBack} disabled={!canBack}>◀◀</Btn>
        {isPlaying
          ? <button onClick={pause} style={{border:"none",borderRadius:8,background:"#f97316",color:"#fff",fontWeight:700,fontSize:"0.85rem",padding:"0.4rem 1rem",cursor:"pointer",fontFamily:"inherit"}}>⏸ Pause</button>
          : <button onClick={play}  style={{border:"none",borderRadius:8,background:isDone?"#10b981":accentColor,color:"#fff",fontWeight:700,fontSize:"0.85rem",padding:"0.4rem 1rem",cursor:"pointer",fontFamily:"inherit"}}>{isDone?"↺ Replay":"▶ Play"}</button>
        }
        <Btn onClick={stepForward} disabled={!canFwd}>▶▶</Btn>
        <Btn onClick={reset} disabled={false}>↺ Reset</Btn>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>
        <span style={{fontSize:"0.75rem",color:"#475569",minWidth:"2.8rem"}}>Speed</span>
        <input type="range" min={1} max={10} value={speed} onChange={e=>setSpeed(+e.target.value)} style={{flex:1,accentColor,cursor:"pointer"}}/>
        <span style={{fontSize:"0.75rem",color:"#94a3b8",minWidth:"1rem"}}>{speed}</span>
        <span style={{fontSize:"0.75rem",color:"#475569",marginLeft:"0.5rem"}}>Step {Math.max(0,currentFrame+1)}/{framesLen}</span>
      </div>
    </div>
  );
}
