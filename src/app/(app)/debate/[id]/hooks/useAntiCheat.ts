"use client";

import { useState, useEffect } from "react";
import { CHEAT_WARNING_DURATION_MS } from "@/lib/const";

export function useAntiCheat(gameMode: string | null | undefined) {
  const [cheatCount, setCheatCount] = useState(0);
  const [showCheatWarning, setShowCheatWarning] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && gameMode === "ranked") {
        setCheatCount((prev) => prev + 1);
        setShowCheatWarning(true);
        setTimeout(() => setShowCheatWarning(false), CHEAT_WARNING_DURATION_MS);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [gameMode]);

  return { cheatCount, showCheatWarning };
}
