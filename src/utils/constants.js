export const EV = {
  COMPARE:"COMPARE", SWAP:"SWAP", MATCH:"MATCH", MISMATCH:"MISMATCH",
  SORTED:"SORTED", PIVOT:"PIVOT", MERGE_WRITE:"MERGE_WRITE",
  VISIT:"VISIT", ENQUEUE:"ENQUEUE", DEQUEUE:"DEQUEUE",
  EDGE_EXPLORE:"EDGE_EXPLORE", EDGE_TREE:"EDGE_TREE", EDGE_BACK:"EDGE_BACK",
  PATH_FOUND:"PATH_FOUND", PATH_TRACE:"PATH_TRACE",
  ASTAR_OPEN:"ASTAR_OPEN", ASTAR_CLOSE:"ASTAR_CLOSE",
  ASTAR_RELAX:"ASTAR_RELAX", ASTAR_CURRENT:"ASTAR_CURRENT",
  KMP_MATCH:"KMP_MATCH", KMP_MISMATCH:"KMP_MISMATCH",
  KMP_SKIP:"KMP_SKIP", KMP_FOUND:"KMP_FOUND",
  KMP_LPS_COMPUTE:"KMP_LPS_COMPUTE", KMP_LPS_MATCH:"KMP_LPS_MATCH",
};

export const EV_COLOR = {
  [EV.COMPARE]:"#f59e0b",[EV.SWAP]:"#ef4444",[EV.MATCH]:"#4ade80",
  [EV.MISMATCH]:"#f97316",[EV.SORTED]:"#10b981",[EV.PIVOT]:"#a78bfa",
  [EV.MERGE_WRITE]:"#22d3ee",[EV.VISIT]:"#3b82f6",[EV.ENQUEUE]:"#8b5cf6",
  [EV.DEQUEUE]:"#06b6d4",[EV.EDGE_EXPLORE]:"#fbbf24",[EV.EDGE_TREE]:"#34d399",
  [EV.EDGE_BACK]:"#f87171",[EV.PATH_FOUND]:"#10b981",[EV.PATH_TRACE]:"#f0abfc",
  [EV.ASTAR_OPEN]:"#facc15",[EV.ASTAR_CLOSE]:"#6b7280",
  [EV.ASTAR_RELAX]:"#22d3ee",[EV.ASTAR_CURRENT]:"#f97316",
  [EV.KMP_MATCH]:"#4ade80",[EV.KMP_MISMATCH]:"#ef4444",
  [EV.KMP_SKIP]:"#f59e0b",[EV.KMP_FOUND]:"#10b981",
  [EV.KMP_LPS_COMPUTE]:"#8b5cf6",[EV.KMP_LPS_MATCH]:"#34d399",
};

export const EV_ICON = {
  [EV.COMPARE]:"⇄",[EV.SWAP]:"⇅",[EV.MATCH]:"✓",[EV.MISMATCH]:"✗",
  [EV.SORTED]:"★",[EV.PIVOT]:"◈",[EV.MERGE_WRITE]:"✎",
  [EV.VISIT]:"●",[EV.ENQUEUE]:"→",[EV.DEQUEUE]:"↗",[EV.EDGE_EXPLORE]:"~",
  [EV.EDGE_TREE]:"↓",[EV.EDGE_BACK]:"↺",[EV.PATH_FOUND]:"⬡",[EV.PATH_TRACE]:"◦",
  [EV.ASTAR_OPEN]:"○",[EV.ASTAR_CLOSE]:"◼",[EV.ASTAR_RELAX]:"↻",[EV.ASTAR_CURRENT]:"◎",
  [EV.KMP_MATCH]:"✓",[EV.KMP_MISMATCH]:"✗",[EV.KMP_SKIP]:"→",
  [EV.KMP_FOUND]:"★",[EV.KMP_LPS_COMPUTE]:"λ",[EV.KMP_LPS_MATCH]:"≡",
};

export const SORT_EV_COLORS = {
  [EV.COMPARE]:"#f59e0b",[EV.SWAP]:"#ef4444",[EV.MERGE_WRITE]:"#22d3ee",
  [EV.PIVOT]:"#a78bfa",[EV.MATCH]:"#4ade80",[EV.SORTED]:"#10b981",
};

export const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: #0b1120; }
  ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
  input[type=range] { height: 4px; }
  button:hover:not(:disabled) { filter: brightness(1.18); }
`;

export const TABS = [
  {id:"sort",    label:"Sorting",    icon:"▦"},
  {id:"graph",   label:"Graph",      icon:"⬡"},
  {id:"kmp",     label:"KMP Search", icon:"⌕"},
  {id:"compare", label:"Compare",    icon:"⇌"},
];
