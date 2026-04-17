import { useState, useMemo, useRef, useEffect } from "react";
import { ProgressBar } from "../shared/ProgressBar";
import { SORT_EV_COLORS } from "../../utils/constants";
import { useFramePlayer } from "../../hooks/useFramePlayer";
import { SORT_ALGOS } from "../../hooks/useSortState";
import { buildSortFrames, generateArray } from "../../utils/generators";

function MiniBars({displayArray, frame}) {
  const max = useMemo(() => Math.max(...displayArray, 1), [displayArray]);
  const highlights = frame?.highlights || {};
  // FIX: preserve sorted state — once sorted set grows, keep it
  const sorted = frame?.sorted || new Set();
  return (
    <div style={{display:"flex",alignItems:"flex-end",gap:"1px",height:"100%",padding:"0.35rem 0.35rem 0",boxSizing:"border-box"}}>
      {displayArray.map((val,i) => {
        const ht = highlights[i];
        const color = sorted.has(i) ? "#10b981" : ht ? (SORT_EV_COLORS[ht]||"#f59e0b") : "#1e3a5f";
        return (
          <div key={i} style={{
            flex:1, height:`${(val/max)*100}%`, background:color,
            borderRadius:"1px 1px 0 0", minWidth:"1px",
            transition:"height 0.06s ease,background 0.08s ease",
          }}/>
        );
      })}
    </div>
  );
}

function MetricPill({label, value, color}) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:"0.25rem"}}>
      <span style={{fontSize:"0.62rem",color:"#475569"}}>{label}</span>
      <span style={{fontSize:"0.72rem",fontWeight:700,color,fontVariantNumeric:"tabular-nums"}}>{value}</span>
    </div>
  );
}

function AlgoPanel({name, color, frames, sourceArray, syncFrame, timeTaken}) {
  // FIX: after playback ends stay on last frame instead of reverting
  const effectiveFrame = syncFrame >= frames.length ? frames.length - 1 : syncFrame;
  const displayArray = effectiveFrame >= 0 && effectiveFrame < frames.length
    ? frames[effectiveFrame].array
    : sourceArray;
  const frame = effectiveFrame >= 0 && effectiveFrame < frames.length
    ? frames[effectiveFrame]
    : null;
  const fmt = ms => ms < 1000 ? `${Math.round(ms)} ms` : `${(ms/1000).toFixed(2)} s`;

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",border:"1px solid #1e293b",borderRadius:8,overflow:"hidden",minWidth:0}}>
      <div style={{padding:"0.38rem 0.7rem",background:"#0b1120",borderBottom:"1px solid #1e293b",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"0.3rem"}}>
        <span style={{fontSize:"0.8rem",fontWeight:700,color}}>{name}</span>
        <div style={{display:"flex",gap:"0.55rem",alignItems:"center"}}>
          <MetricPill label="↔" value={frame?.cumCmp??0} color="#f59e0b"/>
          <MetricPill label="⇅" value={frame?.cumSw??0}  color="#ef4444"/>
          <MetricPill label="⏱" value={fmt(timeTaken)}   color={color}/>
        </div>
      </div>
      <div style={{flex:1,position:"relative",background:"#060d1a",minHeight:"8rem"}}>
        <ProgressBar progress={frames.length>0?((Math.min(syncFrame,frames.length-1)+1)/frames.length)*100:0} color={color}/>
        <MiniBars displayArray={displayArray} frame={frame}/>
      </div>
      <div style={{padding:"0.25rem 0.7rem",background:"#0a1425",fontSize:"0.65rem",color:"#334155",display:"flex",justifyContent:"space-between"}}>
        <span>Step {Math.max(0, Math.min(syncFrame+1, frames.length))}/{frames.length}</span>
        {frame?.event && <span style={{color:"#475569"}}>{frame.event.message?.slice(0,38)}</span>}
      </div>
    </div>
  );
}

const ALL_KEYS = Object.keys(SORT_ALGOS);

export function ComparisonMode() {
  // FIX: select exactly 2 algorithms (default: bubble + quick)
  const [selected, setSelected] = useState(["bubble", "quick"]);
  const [arraySize,  setArraySize]  = useState(20);
  // FIX: local array fully owned by this component — random works independently
  const [localArray, setLocalArray] = useState(() => generateArray(20));
  const [customInput, setCustomInput] = useState("");
  const [inputError,  setInputError]  = useState("");

  // Per-algo elapsed time tracking
  const [times, setTimes] = useState({bubble:0, insertion:0, merge:0, quick:0});
  const startTimeRef = useRef(null);
  const timerRef     = useRef(null);

  const toggleAlgo = (key) => {
    setSelected(prev => {
      if (prev.includes(key)) {
        // must keep at least 2
        if (prev.length <= 2) return prev;
        return prev.filter(k => k !== key);
      } else {
        // enforce max 2: replace the oldest selection
        if (prev.length < 2) return [...prev, key];
        return [prev[1], key];
      }
    });
  };

  const allFrames = useMemo(() => {
    const r = {};
    for (const [k, a] of Object.entries(SORT_ALGOS)) {
      r[k] = selected.includes(k) ? buildSortFrames(a.fn(localArray)) : [];
    }
    return r;
  }, [localArray, selected]);

  const maxFrames = useMemo(() => {
    const lens = selected.map(k => allFrames[k].length);
    return Math.max(...lens, 1);
  }, [allFrames, selected]);

  const dummyFrames = useMemo(
    () => Array.from({length: maxFrames}, (_, i) => ({event:{type:"COMPARE", message:`Step ${i}`}})),
    [maxFrames]
  );

  const player = useFramePlayer(dummyFrames);

  // Timer for time tracking
  useEffect(() => {
    if (player.isPlaying) {
      if (!startTimeRef.current) startTimeRef.current = performance.now();
      timerRef.current = setInterval(() => {
        const elapsed = performance.now() - startTimeRef.current;
        setTimes(prev => {
          const next = {...prev};
          selected.forEach(k => { next[k] = elapsed; });
          return next;
        });
      }, 50);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [player.isPlaying, selected]); // eslint-disable-line

  // FIX: random properly resets and loads new data
  const handleRandom = () => {
    const arr = generateArray(arraySize);
    setLocalArray(arr);
    setCustomInput("");
    setInputError("");
    setTimes({bubble:0, insertion:0, merge:0, quick:0});
    startTimeRef.current = null;
    player.reset();
  };

  const handleApply = () => {
    const parts = customInput.split(",").map(s => s.trim()).filter(Boolean);
    if (parts.length < 2) { setInputError("Enter at least 2 numbers."); return; }
    const nums = parts.map(Number);
    if (nums.some(isNaN) || nums.some(n => n <= 0 || n > 999)) { setInputError("Positive integers 1-999 only."); return; }
    setInputError("");
    setLocalArray(nums);
    setArraySize(nums.length);
    setTimes({bubble:0, insertion:0, merge:0, quick:0});
    startTimeRef.current = null;
    player.reset();
  };

  const handleReset = () => {
    setTimes({bubble:0, insertion:0, merge:0, quick:0});
    startTimeRef.current = null;
    player.reset();
  };

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      {/* Top toolbar */}
      <div style={{padding:"0.55rem 1rem",background:"#0a1425",borderBottom:"1px solid #1e293b",display:"flex",gap:"0.6rem",flexWrap:"wrap",alignItems:"center",flexShrink:0}}>
        <span style={{fontSize:"0.82rem",fontWeight:700,color:"#94a3b8"}}>⇌ Compare</span>

        {/* Algorithm selector — exactly 2 */}
        <div style={{display:"flex",gap:"0.3rem",alignItems:"center",flexWrap:"wrap"}}>
          <span style={{fontSize:"0.65rem",color:"#475569"}}>Select 2:</span>
          {ALL_KEYS.map(k => {
            const a = SORT_ALGOS[k];
            const active = selected.includes(k);
            return (
              <button key={k} onClick={() => toggleAlgo(k)} style={{
                padding:"0.22rem 0.55rem", borderRadius:20, fontSize:"0.7rem", cursor:"pointer",
                fontFamily:"inherit", fontWeight: active ? 700 : 400,
                border:`1px solid ${active ? a.color : "#334155"}`,
                background: active ? `${a.color}22` : "transparent",
                color: active ? a.color : "#475569",
                transition:"all 0.12s",
              }}>
                {a.name.replace(" Sort","").replace("ion","")}
              </button>
            );
          })}
        </div>

        <div style={{width:"1px",height:"1rem",background:"#1e293b"}}/>

        {/* Size slider */}
        <span style={{fontSize:"0.68rem",color:"#475569"}}>n:{arraySize}</span>
        <input type="range" min={4} max={50} value={arraySize}
          onChange={e => { setArraySize(+e.target.value); }}
          style={{width:"4.5rem",accentColor:"#7c3aed",cursor:"pointer"}}/>

        {/* Custom input */}
        <input value={customInput} onChange={e => setCustomInput(e.target.value)}
          placeholder="e.g. 5,3,8,1,9"
          style={{background:"#0f172a",border:`1px solid ${inputError?"#ef4444":"#334155"}`,borderRadius:6,
            padding:"0.25rem 0.4rem",color:"#f1f5f9",fontFamily:"monospace",fontSize:"0.72rem",
            width:"9rem",outline:"none"}}/>
        {inputError && <span style={{fontSize:"0.65rem",color:"#ef4444"}}>{inputError}</span>}
        <button onClick={handleApply} style={{padding:"0.25rem 0.5rem",background:"#7c3aed",border:"none",borderRadius:6,color:"#fff",fontWeight:700,fontSize:"0.72rem",cursor:"pointer",fontFamily:"inherit"}}>Apply</button>
        {/* FIX: random button now works */}
        <button onClick={handleRandom} style={{padding:"0.25rem 0.5rem",background:"#334155",border:"none",borderRadius:6,color:"#fff",fontSize:"0.72rem",cursor:"pointer",fontFamily:"inherit"}}>Random</button>
      </div>

      {/* Algorithm panels — only selected 2 */}
      <div style={{flex:1,display:"flex",gap:"0.5rem",padding:"0.55rem",overflow:"hidden"}}>
        {selected.map(k => (
          <AlgoPanel
            key={k}
            name={SORT_ALGOS[k].name}
            color={SORT_ALGOS[k].color}
            frames={allFrames[k]}
            sourceArray={localArray}
            syncFrame={player.currentFrame}
            timeTaken={times[k]}
          />
        ))}
      </div>

      {/* Playback controls */}
      <div style={{padding:"0.55rem 1rem",background:"#0b1120",borderTop:"1px solid #1e293b",flexShrink:0}}>
        <div style={{display:"flex",gap:"0.4rem",alignItems:"center",flexWrap:"wrap"}}>
          <button onClick={player.stepBack} disabled={player.currentFrame <= -1}
            style={{border:"1px solid #334155",borderRadius:8,background:"#111e35",color:"#94a3b8",padding:"0.35rem 0.55rem",cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:"0.8rem"}}>◀◀</button>
          {player.isPlaying
            ? <button onClick={player.pause} style={{border:"none",borderRadius:8,background:"#f97316",color:"#fff",fontWeight:700,fontSize:"0.8rem",padding:"0.35rem 0.85rem",cursor:"pointer",fontFamily:"inherit"}}>⏸ Pause</button>
            : <button onClick={player.play}  style={{border:"none",borderRadius:8,background:player.isDone?"#10b981":"#7c3aed",color:"#fff",fontWeight:700,fontSize:"0.8rem",padding:"0.35rem 0.85rem",cursor:"pointer",fontFamily:"inherit"}}>{player.isDone?"↺ Replay":"▶ Play"}</button>
          }
          <button onClick={player.stepForward} disabled={player.currentFrame >= maxFrames-1}
            style={{border:"1px solid #334155",borderRadius:8,background:"#111e35",color:"#94a3b8",padding:"0.35rem 0.55rem",cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:"0.8rem"}}>▶▶</button>
          <button onClick={handleReset}
            style={{border:"1px solid #334155",borderRadius:8,background:"#111e35",color:"#94a3b8",padding:"0.35rem 0.55rem",cursor:"pointer",fontFamily:"inherit",fontSize:"0.8rem"}}>↺ Reset</button>
          <span style={{fontSize:"0.68rem",color:"#475569"}}>Speed</span>
          <input type="range" min={1} max={10} value={player.speed} onChange={e=>player.setSpeed(+e.target.value)}
            style={{accentColor:"#7c3aed",cursor:"pointer",width:"5.5rem"}}/>
          <span style={{fontSize:"0.68rem",color:"#94a3b8"}}>{player.speed}</span>
          <span style={{fontSize:"0.68rem",color:"#334155",marginLeft:"0.4rem"}}>
            Step {Math.max(0,player.currentFrame+1)}/{maxFrames}
          </span>
        </div>
      </div>
    </div>
  );
}

