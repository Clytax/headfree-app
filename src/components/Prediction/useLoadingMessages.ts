// File: components/Home/HomePredictionBottomSheet/useLoadingMessages.ts
import { useEffect, useRef, useState } from "react";

export const LOADING_MESSAGES = [
  "Analyzing your health data...",
  "Processing your entries...",
  "Generating personalized insights...",
  "Calculating migraine risk...",
  "Almost ready...",
];

export function useLoadingMessages(messages: string[], intervalMs: number) {
  const [loadingMessage, setLoadingMessage] = useState(messages[0]);
  const timerRef = useRef<NodeJS.Timer | null>(null);
  const idxRef = useRef(0);

  const startCycling = () => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      idxRef.current = (idxRef.current + 1) % messages.length;
      setLoadingMessage(messages[idxRef.current]);
    }, intervalMs);
  };

  const stopCycling = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      idxRef.current = 0;
      setLoadingMessage(messages[0]);
    }
  };

  useEffect(() => () => stopCycling(), []);

  return { loadingMessage, startCycling, stopCycling } as const;
}
