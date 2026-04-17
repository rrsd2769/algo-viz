import { useState, useCallback, useEffect } from "react";
import { useFramePlayer } from "./useFramePlayer";
import { buildKMPFrames } from "../utils/generators";
import { kmpEvents } from "../algorithms/string/kmp";

export function useKMPState() {
  const [text,    setText]    = useState("ABABDABACDABABCABAB");
  const [pattern, setPattern] = useState("ABABCABAB");
  const [frames,  setFrames]  = useState([]);

  const compile = useCallback((t, p) => {
    if (t && p) setFrames(buildKMPFrames(kmpEvents(t, p)));
  }, []);

  useEffect(() => { compile(text, pattern); }, []); // eslint-disable-line

  const player = useFramePlayer(frames);

  const run   = useCallback(() => { compile(text, pattern); player.reset(); }, [text, pattern, compile]); // eslint-disable-line
  const reset = useCallback(() => { compile(text, pattern); player.reset(); }, [text, pattern, compile]); // eslint-disable-line

  return {text, setText, pattern, setPattern, frames, run, reset, ...player};
}
