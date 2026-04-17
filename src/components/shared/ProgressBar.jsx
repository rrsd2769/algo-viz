export function ProgressBar({progress, color}) {
  return (
    <div style={{
      position:"absolute", top:0, left:0, height:3,
      width:`${progress}%`,
      background:`linear-gradient(90deg,${color},${color}88)`,
      transition:"width 0.1s ease", zIndex:10,
    }}/>
  );
}
