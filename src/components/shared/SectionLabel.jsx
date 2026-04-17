export function SectionLabel({children}) {
  return (
    <div style={{
      fontSize:"0.65rem", color:"#475569", fontWeight:700,
      letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"0.35rem",
    }}>
      {children}
    </div>
  );
}
