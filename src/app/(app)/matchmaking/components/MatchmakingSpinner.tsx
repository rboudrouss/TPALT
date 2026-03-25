"use client";

import { motion } from "motion/react";
import { Loader2, Zap, Sword, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/context";

const DIFFICULTIES: {
  value: string;
  color: string;
  icon: React.ReactNode;
}[] = [
  { value: "easy", color: "text-emerald-400", icon: <Zap className="w-4 h-4" /> },
  { value: "medium", color: "text-amber-400", icon: <Sword className="w-4 h-4" /> },
  { value: "hard", color: "text-red-400", icon: <Brain className="w-4 h-4" /> },
];

interface MatchmakingSpinnerProps {
  status: string;
  gameMode: string;
  trainingDifficulty: string | null | undefined;
  onCancel: () => void;
}

export function MatchmakingSpinner({ status, gameMode, trainingDifficulty, onCancel }: MatchmakingSpinnerProps) {
  const { t } = useTranslation();
  const difficulty = DIFFICULTIES.find((d) => d.value === trainingDifficulty);

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

      <h2 className="text-2xl font-bold mb-2">{t.matchmaking.searching}</h2>
      <p className="text-indigo-200 text-lg animate-pulse">{status}</p>

      <div className="mt-8 text-sm text-slate-400 border border-slate-700 rounded-lg p-4 bg-slate-800/50 flex flex-col items-center gap-1">
        <span>
          {t.matchmaking.mode}:{" "}
          <span className="text-white font-semibold uppercase">
            {t.common.modeLabels[gameMode as keyof typeof t.common.modeLabels] ?? gameMode}
          </span>
        </span>
        {gameMode === "training" && difficulty && (
          <span>
            {t.matchmaking.difficulty}:{" "}
            <span className={cn("font-semibold", difficulty.color)}>
              {t.common.difficultyLabels[difficulty.value as keyof typeof t.common.difficultyLabels]}
            </span>
          </span>
        )}
      </div>

      <Button variant="ghost" onClick={onCancel} className="mt-8 text-slate-400 hover:text-white">
        {t.common.cancel}
      </Button>
    </div>
  );
}
