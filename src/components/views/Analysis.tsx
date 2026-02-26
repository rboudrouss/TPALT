"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertTriangle, BarChart3, ArrowRight, Home } from "lucide-react";
import { useApp } from "@/lib/store";

export function Analysis() {
  const { state, dispatch } = useApp();
  const { analysisData } = state;

  const handleHome = () => {
    dispatch({ type: "SET_ANALYSIS", payload: null });
    dispatch({ type: "SET_DEBATE_ID", payload: null });
    dispatch({ type: "SET_GAME_MODE", payload: null });
    dispatch({ type: "SET_VIEW", payload: "dashboard" });
  };

  const handleNewMatch = () => {
    dispatch({ type: "SET_ANALYSIS", payload: null });
    dispatch({ type: "SET_DEBATE_ID", payload: null });
    dispatch({ type: "SET_VIEW", payload: "matchmaking" });
  };

  if (!analysisData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement de l&apos;analyse...</p>
      </div>
    );
  }

  const scoreLabel = analysisData.overallScore >= 80 ? "Excellent" : 
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
        {/* Score Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="md:col-span-1"
        >
          <Card className="h-full bg-indigo-600 text-white border-none shadow-xl">
            <CardHeader>
              <CardTitle className="text-indigo-100">Score Global</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-64">
              <div className="text-8xl font-bold tracking-tighter">{analysisData.overallScore}</div>
              <div className="text-indigo-200 mt-4 text-xl font-medium">{scoreLabel}</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Breakdown */}
        <div className="md:col-span-2 grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-500" />
                Critères d&apos;évaluation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <SkillBar label="Qualité Argumentative" percentage={analysisData.argumentQuality} color="bg-emerald-500" />
              <SkillBar label="Rhétorique & Style" percentage={analysisData.rhetoricStyle} color="bg-blue-500" />
              <SkillBar label="Cohérence Logique" percentage={analysisData.logicalCoherence} color="bg-violet-500" />
              <SkillBar label="Fact-Checking" percentage={analysisData.factChecking} color="bg-amber-500" />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="border-red-100 bg-red-50/50 dark:bg-red-900/10 dark:border-red-900/30">
              <CardHeader>
                <CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-2 text-lg">
                  <AlertTriangle className="w-5 h-5" />
                  Sophismes Détectés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analysisData.sophisms.length > 0 ? (
                    analysisData.sophisms.map((f, i) => (
                      <li key={i} className="text-sm text-red-900 dark:text-red-200 bg-white dark:bg-red-950/30 p-3 rounded border border-red-100 dark:border-red-900/20">
                        <span className="font-bold block">{f.name} (x{f.count})</span>
                        <span className="opacity-80 text-xs">{f.context}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-emerald-700">Aucun sophisme détecté !</li>
                  )}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-emerald-100 bg-emerald-50/50 dark:bg-emerald-900/10 dark:border-emerald-900/30">
              <CardHeader>
                <CardTitle className="text-emerald-700 dark:text-emerald-400 flex items-center gap-2 text-lg">
                  <CheckCircle className="w-5 h-5" />
                  Points Forts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analysisData.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-emerald-900 dark:text-emerald-200 flex gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-center gap-4 shadow-2xl">
        <Button variant="outline" size="lg" onClick={handleHome} className="min-w-[150px]">
          <Home className="mr-2 w-4 h-4" />
          Accueil
        </Button>
        <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 min-w-[200px]" onClick={handleNewMatch}>
          Nouveau Match <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </footer>
    </div>
  );
}

function SkillBar({ label, percentage, color }: { label: string; percentage: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
        <span className="text-sm font-medium text-slate-900 dark:text-white">{percentage}%</span>
      </div>
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: 0.5 }}
          className={`h-2.5 rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

