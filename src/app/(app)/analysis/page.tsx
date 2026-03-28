"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/hooks/useApp";
import { useForceLogin } from "@/hooks/useForceLogin";
import { useTranslation } from "@/lib/i18n/context";
import { ScoreCard } from "./components/ScoreCard";
import { SkillBreakdown } from "./components/SkillBreakdown";
import { SophismsCard } from "./components/SophismsCard";
import { StrengthsCard } from "./components/StrengthsCard";
import { AnalysisFooter } from "./components/AnalysisFooter";

export default function AnalysisPage() {
  const { state, dispatch } = useApp();
  const router = useRouter();
  const { t } = useTranslation();
  const user = useForceLogin();
  const { analysisData } = state;

  useEffect(() => {
    if (user && !analysisData) {
      const timer = setTimeout(() => router.replace("/dashboard"), 2000);
      return () => clearTimeout(timer);
    }
  }, [user, analysisData, router]);

  const handleHome = () => {
    dispatch({ type: "SET_ANALYSIS", payload: null });
    dispatch({ type: "SET_DEBATE_ID", payload: null });
    dispatch({ type: "SET_GAME_MODE", payload: null });
    router.push("/dashboard");
  };

  const handleNewMatch = () => {
    dispatch({ type: "SET_ANALYSIS", payload: null });
    dispatch({ type: "SET_DEBATE_ID", payload: null });
    router.push("/matchmaking");
  };

  if (!state.user) return null;
  if (!analysisData) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-pulse text-slate-400">{t.analysis.title}...</div>
      </div>
    );
  }

  const scoreLabel =
    analysisData.overallScore >= 80 ? t.analysis.excellent :
    analysisData.overallScore >= 60 ? t.analysis.good : t.analysis.needsWork;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 pb-32 overflow-y-auto">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">{t.analysis.title}</h1>
        <p className="text-slate-500 dark:text-slate-400">
          {analysisData.topic || t.analysis.fallbackSubtitle}
        </p>
      </header>

      {analysisData.error && (
        <div className="max-w-5xl mx-auto mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          {t.analysis.aiUnavailable}
        </div>
      )}

      <main className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <ScoreCard score={analysisData.overallScore} scoreLabel={scoreLabel} />

        <div className="md:col-span-2 grid grid-cols-1 gap-6">
          <SkillBreakdown
            argumentQuality={analysisData.argumentQuality}
            rhetoricStyle={analysisData.rhetoricStyle}
            logicalCoherence={analysisData.logicalCoherence}
            factChecking={analysisData.factChecking}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <SophismsCard sophisms={analysisData.sophisms} />
            <StrengthsCard strengths={analysisData.strengths} />
          </div>
        </div>
      </main>

      <AnalysisFooter onHome={handleHome} onNewMatch={handleNewMatch} />
    </div>
  );
}
