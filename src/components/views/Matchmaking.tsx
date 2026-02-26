"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";

export function Matchmaking() {
  const { state, dispatch } = useApp();
  const [status, setStatus] = useState("Recherche d'un adversaire...");

  useEffect(() => {
    const createDebate = async () => {
      if (!state.user || !state.gameMode) return;

      try {
        // Create debate via API
        const res = await fetch("/api/debates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            playerId: state.user.id,
            mode: state.gameMode,
          }),
        });

        if (!res.ok) throw new Error("Failed to create debate");

        const debate = await res.json();
        dispatch({ type: "SET_DEBATE_ID", payload: debate.id });
      } catch (error) {
        console.error("Failed to create debate:", error);
      }
    };

    const timers = [
      setTimeout(() => setStatus("Analyse du niveau Elo..."), 1500),
      setTimeout(() => setStatus("Sélection du sujet de débat..."), 3000),
      setTimeout(() => setStatus("Préparation de l'arène..."), 4500),
      setTimeout(() => {
        createDebate();
        dispatch({ type: "SET_VIEW", payload: "debate" });
      }, 6000),
    ];

    return () => timers.forEach(clearTimeout);
  }, [dispatch, state.gameMode, state.user]);

  const handleCancel = () => {
    dispatch({ type: "SET_GAME_MODE", payload: null });
    dispatch({ type: "SET_VIEW", payload: "dashboard" });
  };

  const modeLabels = {
    training: "Entraînement",
    casual: "Casual",
    ranked: "Classé",
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          repeat: Infinity,
        }}
        className="mb-8 relative"
      >
        <div className="w-24 h-24 rounded-full bg-indigo-500 blur-xl absolute inset-0" />
        <div className="relative z-10 bg-indigo-600 rounded-full p-6">
          <Loader2 className="w-12 h-12 animate-spin text-white" />
        </div>
      </motion.div>

      <h2 className="text-2xl font-bold mb-2">Matchmaking en cours</h2>
      <p className="text-indigo-200 text-lg animate-pulse">{status}</p>

      <div className="mt-8 text-sm text-slate-400 border border-slate-700 rounded-lg p-4 bg-slate-800/50">
        Mode:{" "}
        <span className="text-white font-semibold uppercase">
          {state.gameMode ? modeLabels[state.gameMode] : ""}
        </span>
      </div>

      <Button variant="ghost" onClick={handleCancel} className="mt-8 text-slate-400 hover:text-white">
        Annuler
      </Button>
    </div>
  );
}

