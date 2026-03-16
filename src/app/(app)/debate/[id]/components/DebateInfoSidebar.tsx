"use client";

import { Button } from "@/components/ui/button";
import { Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";

const DIFFICULTY_LABELS: Record<string, { label: string; color: string }> = {
  easy: { label: "Débutant", color: "text-emerald-400" },
  medium: { label: "Intermédiaire", color: "text-amber-400" },
  hard: { label: "Expert", color: "text-red-400" },
};

interface DebateInfoSidebarProps {
  topic: string;
  position: "POUR" | "CONTRE";
  timeLeft: number;
  turnCount: number;
  gameMode: string | null | undefined;
  trainingDifficulty: string | null | undefined;
  isMultiplayer: boolean;
  opponentName: string;
  isMyTurn: boolean;
  onEndDebate: () => void;
}

export function DebateInfoSidebar({
  topic,
  position,
  timeLeft,
  turnCount,
  gameMode,
  trainingDifficulty,
  isMultiplayer,
  opponentName,
  isMyTurn,
  onEndDebate,
}: DebateInfoSidebarProps) {
  return (
    <aside className="w-1/4 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between">
      <div>
        <h2 className="text-xl font-bold mb-6 text-slate-800 dark:text-slate-100">Informations</h2>

        <div className="mb-8">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Sujet</h3>
          <p className="text-lg font-medium text-slate-900 dark:text-white leading-relaxed">{topic}</p>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Position</h3>
          <span className={cn(
            "px-3 py-1 rounded-full text-sm font-bold",
            position === "POUR" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
          )}>
            {position}
          </span>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
            <Clock className="inline w-4 h-4 mr-1" />
            Temps Restant
          </h3>
          <div className={cn(
            "text-4xl font-mono font-bold",
            timeLeft < 15 ? "text-red-500" : "text-slate-900 dark:text-white"
          )}>
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Tour</h3>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{turnCount + 1}/6</div>
        </div>

        {gameMode === "training" && trainingDifficulty && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Difficulté IA</h3>
            <span className={cn("font-bold text-sm", DIFFICULTY_LABELS[trainingDifficulty]?.color)}>
              {DIFFICULTY_LABELS[trainingDifficulty]?.label}
            </span>
          </div>
        )}

        {isMultiplayer && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Adversaire</h3>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <User className="w-4 h-4" />
              <span className="font-medium">{opponentName}</span>
            </div>
          </div>
        )}

        {isMultiplayer && (
          <div className="mb-4">
            <div className={cn(
              "text-xs font-semibold px-3 py-1.5 rounded-full text-center",
              isMyTurn
                ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
            )}>
              {isMyTurn ? "Votre tour" : `Tour de ${opponentName}`}
            </div>
          </div>
        )}
      </div>

      <Button variant="destructive" onClick={onEndDebate}>
        Terminer le débat
      </Button>
    </aside>
  );
}
