import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useFramePlayer } from "./useFramePlayer";
import { buildSortFrames, generateArray } from "../utils/generators";
import { bubbleSortEvents } from "../algorithms/sorting/bubbleSort";
import { insertionSortEvents } from "../algorithms/sorting/insertionSort";
import { mergeSortEvents } from "../algorithms/sorting/mergeSort";
import { quickSortEvents } from "../algorithms/sorting/quickSort";

export const SORT_ALGOS = {
  bubble:    {name:"Bubble Sort",    fn:bubbleSortEvents,    color:"#f97316", desc:"O(n²)"},
  insertion: {name:"Insertion Sort", fn:insertionSortEvents, color:"#facc15", desc:"O(n²)"},
  merge:     {name:"Merge Sort",     fn:mergeSortEvents,     color:"#22d3ee", desc:"O(n log n)"},
  quick:     {name:"Quick Sort",     fn:quickSortEvents,     color:"#a78bfa", desc:"O(n log n) avg"},
};

export function useSortState() {
  const [algoKey,     setAlgoKey]     = useState("bubble");
  const [arraySize,   setArraySize]   = useState(30);
  const [sourceArray, setSourceArray] = useState(() => generateArray(30));
  const [customInput, setCustomInput] = useState("");
  const [inputError,  setInputError]  = useState("");
  const [frames,      setFrames]      = useState([]);

  // Performance metrics
  const [timeTaken,   setTimeTaken]   = useState(0);
  const startTimeRef = useRef(null);
  const timerRef     = useRef(null);

  const compile = useCallback((arr, key) => {
    setFrames(buildSortFrames(SORT_ALGOS[key].fn(arr)));
    setTimeTaken(0);
  }, []);

  useEffect(() => { compile(sourceArray, algoKey); }, []); // eslint-disable-line

  const player = useFramePlayer(frames);

  // Start/stop the ms timer in sync with playback
  useEffect(() => {
    if (player.isPlaying) {
      if (!startTimeRef.current) startTimeRef.current = performance.now() - timeTaken;
      timerRef.current = setInterval(() => {
        setTimeTaken(performance.now() - startTimeRef.current);
      }, 50);
    } else {
      clearInterval(timerRef.current);
      if (player.isDone) {
        // freeze final value
        setTimeTaken(t => t);
      }
    }
    return () => clearInterval(timerRef.current);
  }, [player.isPlaying, player.isDone]); // eslint-disable-line

  const reset = useCallback(() => {
    const arr = generateArray(arraySize);
    setSourceArray(arr); setCustomInput(""); setInputError("");
    compile(arr, algoKey); player.reset();
    setTimeTaken(0); startTimeRef.current = null;
  }, [arraySize, algoKey, compile]); // eslint-disable-line

  const changeAlgo = useCallback(key => {
    setAlgoKey(key); compile(sourceArray, key); player.reset();
    setTimeTaken(0); startTimeRef.current = null;
  }, [sourceArray, compile]); // eslint-disable-line

  const changeSize = useCallback(size => {
    setArraySize(size);
    const arr = generateArray(size);
    setSourceArray(arr); setCustomInput(""); setInputError("");
    compile(arr, algoKey); player.reset();
    setTimeTaken(0); startTimeRef.current = null;
  }, [algoKey, compile]); // eslint-disable-line

  const applyCustomInput = useCallback(raw => {
    const parts = raw.split(",").map(s => s.trim()).filter(Boolean);
    if (parts.length < 2) { setInputError("Enter at least 2 comma-separated numbers."); return; }
    const nums = parts.map(Number);
    if (nums.some(isNaN) || nums.some(n => n <= 0 || n > 999)) { setInputError("Only positive integers (1–999) allowed."); return; }
    setInputError("");
    setSourceArray(nums); setArraySize(nums.length);
    compile(nums, algoKey); player.reset();
    setTimeTaken(0); startTimeRef.current = null;
  }, [algoKey, compile]); // eslint-disable-line

  // FIX: always show sourceArray when no frame is active (fixes custom input bars)
  const displayArray = player.frame ? player.frame.array : sourceArray;

  const algo = SORT_ALGOS[algoKey];
  const cmpData = useMemo(() => frames.slice(0, Math.max(0, player.currentFrame+1)).map(f => f.cumCmp), [frames, player.currentFrame]);
  const swData  = useMemo(() => frames.slice(0, Math.max(0, player.currentFrame+1)).map(f => f.cumSw),  [frames, player.currentFrame]);

  const currentCmp = cmpData[cmpData.length - 1] || 0;
  const currentSw  = swData[swData.length - 1]   || 0;

  return {
    algoKey, changeAlgo, arraySize, changeSize, sourceArray, displayArray,
    customInput, setCustomInput, inputError, applyCustomInput,
    algo, reset, cmpData, swData, frames,
    timeTaken, currentCmp, currentSw,
    ...player,
  };
}
