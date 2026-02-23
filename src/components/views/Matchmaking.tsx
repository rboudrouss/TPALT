import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";

interface MatchmakingProps {
  onMatchFound: () => void;
  mode: "training" | "casual" | "ranked";
}

export function Matchmaking({ onMatchFound, mode }: MatchmakingProps) {
  const [status, setStatus] = useState("Recherche d'un adversaire...");

  useEffect(() => {
    const timers = [
      setTimeout(() => setStatus("Analyse du niveau Elo..."), 1500),
      setTimeout(() => setStatus("Sélection du sujet de débat..."), 3000),
      setTimeout(() => setStatus("Préparation de l'arène..."), 4500),
      setTimeout(() => onMatchFound(), 6000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onMatchFound]);

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
        className="mb-8"
      >
        <div className="w-24 h-24 rounded-full bg-indigo-500 blur-xl absolute" />
        <div className="relative z-10 bg-indigo-600 rounded-full p-6">
          <Loader2 className="w-12 h-12 animate-spin text-white" />
        </div>
      </motion.div>
      
      <h2 className="text-2xl font-bold mb-2">Matchmaking en cours</h2>
      <p className="text-indigo-200 text-lg animate-pulse">{status}</p>
      
      <div className="mt-8 text-sm text-slate-400 border border-slate-700 rounded-lg p-4 bg-slate-800/50">
        Mode: <span className="text-white font-semibold uppercase">{mode}</span>
      </div>
    </div>
  );
}
