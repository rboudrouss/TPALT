"use client";

import { useState, useEffect } from "react";

export function useAntiCheat(gameMode: string | null | undefined) {
  const [cheatCount, setCheatCount] = useState(0);
  const [showCheatWarning, setShowCheatWarning] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && gameMode === "ranked") {
        setCheatCount((prev) => prev + 1);
        setShowCheatWarning(true);
        setTimeout(() => setShowCheatWarning(false), 3000);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [gameMode]);

  return { cheatCount, showCheatWarning };
}
