export function ComplexityChart({cmpData, swData}) {
  const pad = {l:36, r:10, t:10, b:22};
  const W = 480, H = 90;
  const iW = W - pad.l - pad.r, iH = H - pad.t - pad.b;
  const allVals = [...(cmpData||[]), ...(swData||[])];
  const maxY = Math.max(...allVals, 1);
  const len = (cmpData||[]).length;
  const toX = i => pad.l + (i / (Math.max(len,1)-1||1)) * iW;
  const toY = v => pad.t + iH - (v / maxY) * iH;

  const line = (data, color) => {
    if (!data || data.length < 2) return null;
    const d = data.map((v,i) => `${i===0?"M":"L"}${toX(i)},${toY(v)}`).join(" ");
    return <path d={d} stroke={color} strokeWidth={1.5} fill="none" opacity={0.9}/>;
  };

  return (
    <div>
      <div style={{fontSize:"0.68rem",color:"#475569",fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:"0.25rem"}}>
        Live Complexity
      </div>
      <svg width={W} height={H} style={{display:"block",overflow:"visible",maxWidth:"100%"}}>
        {[0,0.25,0.5,0.75,1].map(t => (
          <g key={t}>
            <line x1={pad.l} y1={pad.t+iH*t} x2={pad.l+iW} y2={pad.t+iH*t} stroke="#1e293b" strokeWidth={0.5}/>
            <text x={pad.l-4} y={pad.t+iH*t+4} textAnchor="end" fontSize={8} fill="#334155">{Math.round(maxY*(1-t))}</text>
          </g>
        ))}
        <line x1={pad.l} y1={pad.t} x2={pad.l} y2={pad.t+iH} stroke="#334155" strokeWidth={0.5}/>
        {line(cmpData, "#f59e0b")}
        {line(swData,  "#ef4444")}
        <rect x={pad.l}     y={pad.t+iH+6} width={7} height={7} fill="#f59e0b" rx={1}/>
        <text x={pad.l+10}  y={pad.t+iH+13} fontSize={8} fill="#64748b">Comparisons ({(cmpData||[]).slice(-1)[0]||0})</text>
        <rect x={pad.l+130} y={pad.t+iH+6} width={7} height={7} fill="#ef4444" rx={1}/>
        <text x={pad.l+140} y={pad.t+iH+13} fontSize={8} fill="#64748b">Swaps/Writes ({(swData||[]).slice(-1)[0]||0})</text>
      </svg>
    </div>
  );
}
