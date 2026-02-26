"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Trophy,
  TrendingUp,
  Target,
  Brain,
  Calendar,
  Flame,
  BarChart3,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { useApp } from "@/lib/store";

// Mock data
const mockBadges = [
  { id: 1, name: "Premier Débat", icon: "🎤", unlocked: true, date: "15 jan 2025" },
  { id: 2, name: "10 Victoires", icon: "🏆", unlocked: true, date: "22 jan 2025" },
  { id: 3, name: "Série de 5", icon: "🔥", unlocked: true, date: "05 fév 2025" },
  { id: 4, name: "Sans Sophisme", icon: "✨", unlocked: false, date: null },
  { id: 5, name: "Top 100", icon: "👑", unlocked: false, date: null },
];

const mockHistory = [
  { id: 1, opponent: "IA_Coach", topic: "L'IA menace-t-elle la créativité ?", result: "win", score: 85, eloChange: +12, date: "Aujourd'hui", mode: "Training" },
  { id: 2, opponent: "Debater_Pro", topic: "Le vote obligatoire", result: "loss", score: 72, eloChange: -8, date: "Hier", mode: "Classé" },
  { id: 3, opponent: "Rhetorician", topic: "Mars doit être colonisée", result: "win", score: 88, eloChange: +15, date: "Il y a 2 jours", mode: "Casual" },
];

export function Profile() {
  const { state, dispatch } = useApp();
  const { user } = state;
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "achievements">("overview");

  if (!user) return null;

  const winRate = user.wins + user.losses > 0 ? Math.round((user.wins / (user.wins + user.losses)) * 100) : 0;
  const xpToNext = (user.level + 1) * 1000;
  const xpProgress = (user.xp % 1000) / 10;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="relative z-10 container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => dispatch({ type: "SET_VIEW", payload: "dashboard" })}
            className="text-white hover:bg-white/10 mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-3xl font-bold shadow-xl">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{user.username}</h1>
                <div className="flex items-center gap-4 text-sm opacity-90">
                  <span className="flex items-center gap-1">
                    <Trophy className="w-4 h-4" /> Niveau {user.level}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> Membre
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/20">
                <div className="text-3xl font-bold">{user.elo}</div>
                <div className="text-sm opacity-90">Elo</div>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/20">
                <div className="text-3xl font-bold">{winRate}%</div>
                <div className="text-sm opacity-90">Win Rate</div>
              </div>
            </div>
          </div>

          <div className="mt-6 max-w-md">
            <div className="flex justify-between text-sm mb-2">
              <span>Niveau {user.level}</span>
              <span>{user.xp % 1000} / 1000 XP</span>
            </div>
            <Progress value={xpProgress} className="h-2" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-4 -mt-4 relative z-20">
        <div className="flex gap-2 mb-8 bg-white dark:bg-slate-900 rounded-lg p-1 shadow-lg max-w-md mx-auto">
          {(["overview", "history", "achievements"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {tab === "overview" ? "Aperçu" : tab === "history" ? "Historique" : "Succès"}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard icon={<BarChart3 className="w-6 h-6 text-blue-500" />} label="Débats" value={user.wins + user.losses} trend="+3 cette semaine" />
            <StatCard icon={<Target className="w-6 h-6 text-green-500" />} label="Victoires" value={user.wins} trend={`${user.losses} défaites`} />
            <StatCard icon={<Brain className="w-6 h-6 text-purple-500" />} label="Score moyen" value="8.2/10" trend="Excellent" />
            <StatCard icon={<Flame className="w-6 h-6 text-orange-500" />} label="Série actuelle" value="3" trend="Record: 7" />
          </div>
        )}

        {activeTab === "history" && (
          <Card>
            <CardHeader><CardTitle>Historique des débats</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {mockHistory.map((d) => (
                <div key={d.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${d.result === "win" ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
                      {d.result === "win" ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">{d.topic}</h4>
                      <div className="text-sm text-slate-500 flex items-center gap-2">
                        vs {d.opponent} <Badge variant="outline">{d.mode}</Badge>
                        <Clock className="w-3 h-3" /> {d.date}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{d.score}/100</div>
                    <div className={d.eloChange > 0 ? "text-green-600" : "text-red-600"}>{d.eloChange > 0 ? "+" : ""}{d.eloChange} Elo</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {activeTab === "achievements" && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {mockBadges.map((b) => (
              <motion.div
                key={b.id}
                whileHover={{ scale: b.unlocked ? 1.05 : 1 }}
                className={`p-6 rounded-xl border text-center ${
                  b.unlocked
                    ? "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 border-amber-200"
                    : "bg-slate-100 dark:bg-slate-900 border-slate-200 opacity-50"
                }`}
              >
                <div className={`text-4xl mb-2 ${b.unlocked ? "" : "grayscale"}`}>{b.icon}</div>
                <h3 className="font-semibold text-sm">{b.name}</h3>
                <p className="text-xs text-slate-500">{b.unlocked ? b.date : "Verrouillé"}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, trend }: { icon: React.ReactNode; label: string; value: string | number; trend: string }) {
  return (
    <Card className="shadow-md">
      <CardContent className="p-6">
        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg w-fit mb-3">{icon}</div>
        <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{value}</div>
        <div className="text-sm text-slate-500 mb-1">{label}</div>
        <div className="text-xs text-green-600 font-medium">{trend}</div>
      </CardContent>
    </Card>
  );
}

