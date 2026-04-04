"use client";

import { Button } from "@/components/ui/button";
import { Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation, fmt } from "@/lib/i18n/context";
import { MAX_TURNS } from "@/lib/const";

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "text-emerald-400",
  medium: "text-amber-400",
  hard: "text-red-400",
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
  const { t } = useTranslation();

  const positionLabel = position === "POUR" ? t.common.for : t.common.against;

  return (
    <aside className="w-1/4 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between">
      <div>
        <h2 className="text-xl font-bold mb-6 text-slate-800 dark:text-slate-100">{t.debate.info}</h2>

        <div className="mb-8">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">{t.debate.topic}</h3>
          <p className="text-lg font-medium text-slate-900 dark:text-white leading-relaxed">{topic}</p>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">{t.debate.position}</h3>
          <span className={cn(
            "px-3 py-1 rounded-full text-sm font-bold",
            position === "POUR" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
          )}>
            {positionLabel}
          </span>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
            <Clock className="inline w-4 h-4 mr-1" />
            {t.debate.timeRemaining}
          </h3>
          <div className={cn(
            "text-4xl font-mono font-bold",
            timeLeft < 15 ? "text-red-500" : "text-slate-900 dark:text-white"
          )}>
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">{t.debate.turn}</h3>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{turnCount + 1}/{MAX_TURNS}</div>
        </div>

        {gameMode === "training" && trainingDifficulty && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">{t.debate.aiDifficulty}</h3>
            <span className={cn("font-bold text-sm", DIFFICULTY_COLORS[trainingDifficulty])}>
              {t.common.difficultyLabels[trainingDifficulty as keyof typeof t.common.difficultyLabels]}
            </span>
          </div>
        )}

        {isMultiplayer && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">{t.debate.opponent}</h3>
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
              {isMyTurn ? t.debate.yourTurn : fmt(t.debate.opponentTurn, { name: opponentName })}
            </div>
          </div>
        )}
      </div>

      <Button variant="destructive" onClick={onEndDebate}>
        {t.debate.endDebate}
      </Button>
    </aside>
  );
}
