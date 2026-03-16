"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { ScoreCard } from "./components/ScoreCard";
import { SkillBreakdown } from "./components/SkillBreakdown";
import { SophismsCard } from "./components/SophismsCard";
import { StrengthsCard } from "./components/StrengthsCard";
import { AnalysisFooter } from "./components/AnalysisFooter";

export default function AnalysisPage() {
  const { state, dispatch } = useApp();
  const router = useRouter();
  const { analysisData } = state;

  useEffect(() => {
    if (!state.user) router.replace("/");
    else if (!analysisData) router.replace("/dashboard");
  }, [state.user, analysisData, router]);

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

  if (!state.user || !analysisData) return null;

  const scoreLabel =
    analysisData.overallScore >= 80 ? "Excellent" :
    analysisData.overallScore >= 60 ? "Bien" : "À améliorer";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 pb-32 overflow-y-auto">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Analyse du Débat</h1>
        <p className="text-slate-500 dark:text-slate-400">
          {analysisData.topic || "Voici le rapport détaillé de votre performance."}
        </p>
      </header>

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
