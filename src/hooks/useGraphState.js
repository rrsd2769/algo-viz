import { useState, useCallback, useEffect } from "react";
import { useFramePlayer } from "./useFramePlayer";
import { buildGraphFrames, makeDefaultGraph, parseAdjList } from "../utils/generators";
import { bfsEvents, dfsEvents, astarEvents } from "../algorithms/graph/graphAlgorithms";

export const GRAPH_ALGOS = {
  bfs:   {name:"BFS", fn:bfsEvents,   color:"#3b82f6", desc:"Breadth-First Search"},
  dfs:   {name:"DFS", fn:dfsEvents,   color:"#a78bfa", desc:"Depth-First Search"},
  astar: {name:"A*",  fn:astarEvents, color:"#f97316", desc:"A* Heuristic Search"},
};

export function useGraphState() {
  const [algoKey,   setAlgoKey]   = useState("bfs");
  const [startNode, setStartNode] = useState(0);
  const [endNode,   setEndNode]   = useState(11);
  const [graph,     setGraph]     = useState(() => makeDefaultGraph());
  const [adjInput,  setAdjInput]  = useState("");
  const [adjError,  setAdjError]  = useState("");
  const [directed,  setDirected]  = useState(false);
  const [frames,    setFrames]    = useState([]);

  const compile = useCallback((key, s, e, g) => setFrames(buildGraphFrames(GRAPH_ALGOS[key].fn(g, s, e))), []);
  useEffect(() => { compile(algoKey, startNode, endNode, graph); }, []); // eslint-disable-line

  const player = useFramePlayer(frames);

  const changeAlgo  = useCallback(key => { setAlgoKey(key);  compile(key, startNode, endNode, graph); player.reset(); }, [startNode, endNode, graph, compile]); // eslint-disable-line
  const changeStart = useCallback(s   => { setStartNode(s);  compile(algoKey, s, endNode, graph);     player.reset(); }, [algoKey, endNode, graph, compile]);   // eslint-disable-line
  const changeEnd   = useCallback(e   => { setEndNode(e);    compile(algoKey, startNode, e, graph);   player.reset(); }, [algoKey, startNode, graph, compile]); // eslint-disable-line
  const reset       = useCallback(()  => { compile(algoKey, startNode, endNode, graph); player.reset(); }, [algoKey, startNode, endNode, graph, compile]); // eslint-disable-line

  const applyAdjList = useCallback((raw, isDirected) => {
    try {
      const g = parseAdjList(raw, isDirected);
      if (g.nodes.length < 2) throw new Error("Need at least 2 nodes.");
      setGraph(g); setAdjError("");
      const s = 0, e = g.nodes.length - 1;
      setStartNode(s); setEndNode(e);
      compile(algoKey, s, e, g); player.reset();
    } catch(err) { setAdjError(err.message); }
  }, [algoKey, compile]); // eslint-disable-line

  const resetGraph = useCallback(() => {
    const g = makeDefaultGraph(); setGraph(g); setAdjInput(""); setAdjError("");
    setStartNode(0); setEndNode(11);
    compile(algoKey, 0, 11, g); player.reset();
  }, [algoKey, compile]); // eslint-disable-line

  return {algoKey, changeAlgo, startNode, changeStart, endNode, changeEnd, graph, directed, setDirected, adjInput, setAdjInput, adjError, applyAdjList, resetGraph, frames, algo:GRAPH_ALGOS[algoKey], reset, ...player};
}
