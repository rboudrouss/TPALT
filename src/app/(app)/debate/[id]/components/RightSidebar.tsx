"use client";

import { BrainCircuit, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation, fmt } from "@/lib/i18n/context";

interface RightSidebarProps {
  gameMode: string | null | undefined;
  scores: { A: number; B: number };
  opponentName: string;
  cheatCount: number;
  aiHint: string;
  liveEvaluation: any;
  isEvaluating: boolean;
}

export function RightSidebar({
  gameMode,
  scores,
  opponentName,
  cheatCount,
  aiHint,
  liveEvaluation,
  isEvaluating,
}: RightSidebarProps) {
  return (
    <aside className="w-1/5 bg-slate-100 dark:bg-slate-900/50 border-l border-slate-200 dark:border-slate-800 p-4 overflow-y-auto">
      {gameMode === "ranked" ? (
        <RankedPanel scores={scores} opponentName={opponentName} cheatCount={cheatCount} />
      ) : (
        <AIAssistantPanel aiHint={aiHint} liveEvaluation={liveEvaluation} isEvaluating={isEvaluating} />
      )}
    </aside>
  );
}

function RankedPanel({
  scores,
  opponentName,
  cheatCount,
}: {
  scores: { A: number; B: number };
  opponentName: string;
  cheatCount: number;
}) {
  const { t } = useTranslation();

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400">
        <ShieldAlert className="w-5 h-5" />
        <h3 className="font-semibold">{t.debate.rankedMode}</h3>
      </div>
      <div className="bg-white/50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-slate-500">{t.common.you}</span>
          <span className="font-bold text-indigo-600">{scores.A}</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
          <div className="bg-indigo-500 h-2 rounded-full transition-all" style={{ width: `${scores.A}%` }} />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-slate-500">{opponentName}</span>
          <span className="font-bold text-slate-500">{scores.B}</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
          <div className="bg-slate-400 h-2 rounded-full transition-all" style={{ width: `${scores.B}%` }} />
        </div>
      </div>
      {cheatCount > 0 && (
        <div className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-200 dark:border-red-800">
          ⚠️ {fmt(t.debate.infraction, { count: cheatCount })}
          {cheatCount >= 3 && ` — ${t.debate.penaltyApplied}`}
        </div>
      )}
    </div>
  );
}

function AIAssistantPanel({
  aiHint,
  liveEvaluation,
  isEvaluating,
}: {
  aiHint: string;
  liveEvaluation: any;
  isEvaluating: boolean;
}) {
  const { t } = useTranslation();

  return (
    <div className="h-full flex flex-col gap-4">
      <div>
        <div className="flex items-center gap-2 mb-4 text-indigo-600 dark:text-indigo-400">
          <BrainCircuit className="w-5 h-5" />
          <h3 className="font-semibold">{t.debate.aiAssistant}</h3>
        </div>
        <div className="bg-white/50 dark:bg-slate-800/50 p-3 rounded-lg text-sm text-slate-600 dark:text-slate-300 border border-indigo-100 dark:border-indigo-900/30">
          <p>💡 <strong>{t.debate.hint} :</strong> {aiHint || t.debate.hintLoading}</p>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400">
          <ShieldAlert className="w-5 h-5" />
          <h3 className="font-semibold">{t.debate.lastMoveAnalysis}</h3>
        </div>

        <div className="bg-white/50 dark:bg-slate-800/50 p-3 rounded-lg text-sm border border-slate-200 dark:border-slate-700 min-h-[150px]">
          {isEvaluating ? (
            <div className="animate-pulse text-slate-400 flex items-center justify-center h-full text-xs italic">
              {t.debate.analyzingArgument}
            </div>
          ) : liveEvaluation?.evaluation_summary ? (
            <EvaluationResult liveEvaluation={liveEvaluation} />
          ) : (
            <div className="text-slate-400 flex items-center justify-center h-full text-xs italic">
              {t.debate.sendToAnalyze}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EvaluationResult({ liveEvaluation }: { liveEvaluation: any }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-900 p-2 rounded">
        <span className="text-xs uppercase font-medium text-slate-500">{t.debate.quality}</span>
        <span className={cn(
          "font-bold capitalize",
          liveEvaluation.evaluation_summary.move_quality === "brilliant" ? "text-purple-600" :
          liveEvaluation.evaluation_summary.move_quality === "excellent" ? "text-green-600" :
          liveEvaluation.evaluation_summary.move_quality === "blunder" ? "text-red-600" : "text-blue-600"
        )}>
          {liveEvaluation.evaluation_summary.move_quality}
        </span>
      </div>

      <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-900 p-2 rounded">
        <span className="text-xs uppercase font-medium text-slate-500">{t.debate.scoreDelta}</span>
        <span className={cn(
          "font-bold",
          liveEvaluation.score_update?.delta > 0 ? "text-green-600" : "text-red-500"
        )}>
          {liveEvaluation.score_update?.delta > 0 ? "+" : ""}{liveEvaluation.score_update?.delta ?? 0}
        </span>
      </div>

      {liveEvaluation.events && liveEvaluation.events.length > 0 && (
        <div className="mt-2">
          <span className="text-xs font-semibold text-slate-500 mb-1 block">{t.debate.detectedEvents}</span>
          <ul className="space-y-1">
            {liveEvaluation.events.map((ev: any, idx: number) => (
              <li key={idx} className="text-xs p-1.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 flex justify-between items-start">
                <div>
                  <span className={cn(
                    "font-bold block mb-0.5",
                    ev.type === "sophism" || ev.type === "ad_hominem" || ev.type === "wrong_side"
                      ? "text-red-500"
                      : "text-indigo-500"
                  )}>
                    {t.debate.eventTypes[ev.type as keyof typeof t.debate.eventTypes] ?? ev.type}
                  </span>
                  <span className="text-slate-600 dark:text-slate-300">{ev.description}</span>
                </div>
                <span className={cn(
                  "ml-2 px-1.5 py-0.5 rounded-full text-[10px] whitespace-nowrap capitalize",
                  ev.severity === "high" ? "bg-red-100 text-red-600" :
                  ev.severity === "medium" ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" :
                  "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-300"
                )}>{ev.severity}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
