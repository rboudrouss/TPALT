import React from "react";
import { motion } from "motion/react";
import { Button } from "../ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/Card";
import { CheckCircle, AlertTriangle, XCircle, BarChart3, ArrowRight, Home, Share2 } from "lucide-react";

interface AnalysisProps {
  data: any; // In a real app, strict typing
  onHome: () => void;
}

export function Analysis({ data, onHome }: AnalysisProps) {
  // Mock data generation based on passed data
  const score = Math.floor(Math.random() * 30) + 70; // 70-100
  const fallacies = [
    { name: "Ad Hominem", count: 1, context: "Attaque personnelle au tour 3" },
    { name: "Pente Glissante", count: 2, context: "Exagération des conséquences au tour 5" },
  ];
  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 overflow-y-auto">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Analyse du Débat</h1>
        <p className="text-slate-500 dark:text-slate-400">Voici le rapport détaillé de votre performance.</p>
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
                    <div className="text-9xl font-bold tracking-tighter">{score}</div>
                    <div className="text-indigo-200 mt-4 text-xl font-medium">Excellent</div>
                </CardContent>
            </Card>
        </motion.div>

        {/* Breakdown */}
        <div className="md:col-span-2 grid grid-cols-1 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-indigo-500" />
                        Critères d'évaluation
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <SkillBar label="Qualité Argumentative" percentage={85} color="bg-emerald-500" />
                    <SkillBar label="Rhétorique & Style" percentage={72} color="bg-blue-500" />
                    <SkillBar label="Cohérence Logique" percentage={90} color="bg-violet-500" />
                    <SkillBar label="Fact-Checking" percentage={65} color="bg-amber-500" />
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
                            {fallacies.map((f, i) => (
                                <li key={i} className="text-sm text-red-900 dark:text-red-200 bg-white dark:bg-red-950/30 p-3 rounded border border-red-100 dark:border-red-900/20">
                                    <span className="font-bold block">{f.name} (x{f.count})</span>
                                    <span className="opacity-80 text-xs">{f.context}</span>
                                </li>
                            ))}
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
                            <li className="text-sm text-emerald-900 dark:text-emerald-200 flex gap-2">
                                <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                Usage pertinent de statistiques au début du débat.
                            </li>
                            <li className="text-sm text-emerald-900 dark:text-emerald-200 flex gap-2">
                                <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                Bonne réfutation de l'argument adverse sur l'économie.
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-center gap-4 shadow-2xl">
        <Button variant="outline" size="lg" onClick={onHome} className="min-w-[150px]">
            <Home className="mr-2 w-4 h-4" />
            Accueil
        </Button>
        <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 min-w-[200px]" onClick={onHome}>
            Nouveau Match <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
         <Button variant="ghost" size="icon" className="absolute right-8 text-slate-400 hover:text-indigo-500">
            <Share2 className="w-5 h-5" />
        </Button>
      </footer>
    </div>
  );
}

function SkillBar({ label, percentage, color }: { label: string, percentage: number, color: string }) {
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
    )
}
