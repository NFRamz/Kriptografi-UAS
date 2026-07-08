import { useState, useEffect, useCallback, useRef } from 'react';

export interface LabAnimationState {
  isPlaying: boolean;
  speed: number;
  globalStep: number;
  maxSteps: number;
  play: () => void;
  pause: () => void;
  reset: () => void;
  setSpeed: (speed: number) => void;
  setGlobalStep: (step: number) => void;
  setMaxSteps: (max: number) => void;
}

export const useLabAnimation = (initialMaxSteps: number = 100): LabAnimationState => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000); // ms per step
  const [globalStep, setGlobalStep] = useState(0);
  const [maxSteps, setMaxSteps] = useState(initialMaxSteps);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);
  const reset = useCallback(() => {
    setIsPlaying(false);
    setGlobalStep(0);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setGlobalStep((prev) => {
          if (prev >= maxSteps) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, speed, maxSteps]);

  return {
    isPlaying,
    speed,
    globalStep,
    maxSteps,
    play,
    pause,
    reset,
    setSpeed,
    setGlobalStep,
    setMaxSteps,
  };
};
