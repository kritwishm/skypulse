"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type RefreshInterval = 0 | 1 | 5 | 10 | 15 | 30; // 0 = off

export function useAutoRefresh(onRefresh: () => void) {
  const [interval, setIntervalState] = useState<RefreshInterval>(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const countdownRef = useRef<ReturnType<typeof globalThis.setInterval> | null>(null);
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  const clear = useCallback(() => {
    if (countdownRef.current) {
      globalThis.clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setSecondsLeft(0);
  }, []);

  const setInterval = useCallback(
    (mins: RefreshInterval) => {
      clear();
      setIntervalState(mins);

      if (mins === 0) return;

      const totalSeconds = mins * 60;
      setSecondsLeft(totalSeconds);

      countdownRef.current = globalThis.setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            onRefreshRef.current();
            return mins * 60;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [clear]
  );

  useEffect(() => {
    return clear;
  }, [clear]);

  return { interval, setInterval, isActive: interval > 0, secondsLeft };
}
