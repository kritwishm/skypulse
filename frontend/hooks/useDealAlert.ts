"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface DealAlertData {
  id: string;
  message: string;
  cheapest_price: number;
  max_price: number;
  cheapest_date?: string | null;
}

const AUTO_DISMISS_MS = 8_000;

export function useDealAlert() {
  const [showAlert, setShowAlert] = useState(false);
  const [alertData, setAlertData] = useState<DealAlertData | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const dismissAlert = useCallback(() => {
    clearTimer();
    setShowAlert(false);
    setAlertData(null);
  }, [clearTimer]);

  const triggerAlert = useCallback(
    (data: DealAlertData) => {
      clearTimer();

      // Attempt to play a notification sound
      try {
        const audio = new Audio("/sounds/deal-alert.mp3");
        audio.volume = 0.6;
        audio.play().catch(() => {
          // Browser may block autoplay; silently ignore
        });
      } catch {
        // Audio API unavailable; silently ignore
      }

      setAlertData(data);
      setShowAlert(true);

      timerRef.current = setTimeout(() => {
        setShowAlert(false);
        setAlertData(null);
      }, AUTO_DISMISS_MS);
    },
    [clearTimer],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  return { showAlert, alertData, triggerAlert, dismissAlert };
}
