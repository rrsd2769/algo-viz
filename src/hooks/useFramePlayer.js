import { useState, useEffect, useRef, useCallback } from "react";

export function useFramePlayer(frames) {
  const [currentFrame, setCurrentFrame] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(5);
  const [logs, setLogs] = useState([]);
  const intervalRef = useRef(null);

  const pushLog = useCallback(frame => {
    if (!frame?.event) return;
    setLogs(l => [...l.slice(-99), {type: frame.event.type, msg: frame.event.message}]);
  }, []);

  const stepForward = useCallback(() => {
    setCurrentFrame(f => {
      const next = Math.min(f+1, frames.length-1);
      pushLog(frames[next]);
      return next;
    });
  }, [frames, pushLog]);

  const stepBack = useCallback(() => setCurrentFrame(f => Math.max(f-1, -1)), []);

  const pause = useCallback(() => {
    setIsPlaying(false);
    clearInterval(intervalRef.current);
  }, []);

  const play = useCallback(() => {
    if (currentFrame >= frames.length - 1) setCurrentFrame(-1);
    setIsPlaying(true);
  }, [currentFrame, frames.length]);

  useEffect(() => {
    clearInterval(intervalRef.current);
    if (isPlaying) {
      const delay = Math.max(30, 650 - speed * 60);
      intervalRef.current = setInterval(() => {
        setCurrentFrame(f => {
          const next = f + 1;
          if (next >= frames.length) {
            setIsPlaying(false);
            clearInterval(intervalRef.current);
            return f;
          }
          pushLog(frames[next]);
          return next;
        });
      }, delay);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, speed, frames, pushLog]);

  const reset = useCallback(() => {
    setCurrentFrame(-1);
    setIsPlaying(false);
    setLogs([]);
    clearInterval(intervalRef.current);
  }, []);

  const progress = frames.length > 0 ? ((currentFrame + 1) / frames.length) * 100 : 0;
  const isDone   = currentFrame === frames.length - 1;
  const frame    = currentFrame >= 0 ? frames[currentFrame] : null;

  return {currentFrame, frame, isPlaying, speed, setSpeed, logs, play, pause, stepForward, stepBack, reset, progress, isDone};
}
