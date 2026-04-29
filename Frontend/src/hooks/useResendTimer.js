// /src/hooks/useResendTimer.js
import { useState, useEffect, useCallback } from "react";

export const useResendTimer = (initialSeconds = 60) => {
  const [timer, setTimer] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(true);

  const startTimer = useCallback(() => {
    setTimer(initialSeconds);
    setIsActive(true);
  }, [initialSeconds]);

  const resetTimer = useCallback(() => {
    setTimer(initialSeconds);
    setIsActive(true);
  }, [initialSeconds]);

  useEffect(() => {
    let interval;

    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsActive(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timer]);

  return {
    timer,
    isActive,
    startTimer,
    resetTimer,
    formattedTime: `${Math.floor(timer / 60)}:${(timer % 60)
      .toString()
      .padStart(2, "0")}`,
    canResend: !isActive,
  };
};
