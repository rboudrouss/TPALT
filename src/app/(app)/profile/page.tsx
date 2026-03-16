"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Trophy,
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
import type { AchievementResult } from "@/lib/achievements";

interface DebateRecord {
  id: string;
  topic: string;
  mode: string;
  status: string;
  player1Id: string;
  player2Id: string | null;
  winnerId: string | null;
  createdAt: string;
  player1?: { id: string; username: string };
  player2?: { id: string; username: string } | null;
  analysis?: {
    overallScore: number;
    player1Score: number | null;
    player2Score: number | null;
    sophisms: string;
  } | null;
}

interface UserProfile {
  id: string;
  username: string;
  elo: number;
  level: number;
  xp: number;
  wins: number;
  losses: number;
  createdAt: string;
  debates: DebateRecord[];
}

const modeLabels: Record<string, string> = {
  training: "Training",
  casual: "Casual",
  ranked: "Classé",
};

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const diffDays = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaine(s)`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

function computeCurrentStreak(debates: DebateRecord[], userId: string): number {
  const finished = [...debates]
    .filter((d) => d.status === "finished")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  let streak = 0;
  for (const d of finished) {
    if (d.winnerId === userId) streak++;
    else break;
  }
  return streak;
}

function computeMaxStreak(debates: DebateRecord[], userId: string): number {
  const finished = [...debates]
    .filter((d) => d.status === "finished")
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  let max = 0, cur = 0;
  for (const d of finished) {
    if (d.winnerId === userId) { cur++; max = Math.max(max, cur); }
    else cur = 0;
  }
  return max;
}

function computeAverageScore(debates: DebateRecord[], userId: string): string {
  const scores: number[] = [];
  for (const d of debates) {
    if (!d.analysis) continue;
    const s = d.player1Id === userId ? d.analysis.player1Score : d.analysis.player2Score;
    if (s != null) scores.push(s);
  }
  if (scores.length === 0) return "N/A";
  return ((scores.reduce((a, b) => a + b, 0) / scores.length) / 10).toFixed(1) + "/10";
}

export default function ProfilePage() {
  const { state } = useApp();
  const router = useRouter();
  const { user } = state;
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "achievements">("overview");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [achievementCategories, setAchievementCategories] = useState<
    { category: string; items: AchievementResult[] }[]
  >([]);
  const [achievementsLoading, setAchievementsLoading] = useState(false);

  useEffect(() => {
    if (!user) router.replace("/");
  }, [user, router]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(`/api/users/${user.id}`)
      .then((res) => res.json())
      .then((data: UserProfile) => { setProfile(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  // After profile loads, evaluate + persist achievements
  useEffect(() => {
    if (!user || loading) return;
    setAchievementsLoading(true);
    fetch(`/api/users/${user.id}/achievements`, { method: "POST" })
      .then((res) => res.json())
      .then((data: { categories: { category: string; items: AchievementResult[] }[] }) => {
        setAchievementCategories(data.categories ?? []);
        setAchievementsLoading(false);
      })
      .catch(() => setAchievementsLoading(false));
  }, [user, loading]);

  if (!user) return null;

  const displayUser = profile ?? user;
  const debates = profile?.debates ?? [];
  // Training games are excluded from all stat computations
  const rankedDebates = debates.filter((d) => d.mode !== "training");
  const winRate =
    displayUser.wins + displayUser.losses > 0
      ? Math.round((displayUser.wins / (displayUser.wins + displayUser.losses)) * 100)
      : 0;
  const xpProgress = (displayUser.xp % 1000) / 10;
  const currentStreak = computeCurrentStreak(rankedDebates, user.id);
  const maxStreak = computeMaxStreak(rankedDebates, user.id);
  const avgScore = computeAverageScore(rankedDebates, user.id);
  const totalAchievements = achievementCategories.reduce((n, c) => n + c.items.length, 0);
  const unlockedCount = achievementCategories.reduce((n, c) => n + c.items.filter((b) => b.unlocked).length, 0);
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
    : "";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="relative z-10 container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="text-white hover:bg-white/10 mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-3xl font-bold shadow-xl">
                {displayUser.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{displayUser.username}</h1>
                <div className="flex items-center gap-4 text-sm opacity-90">
                  <span className="flex items-center gap-1">
                    <Trophy className="w-4 h-4" /> Niveau {displayUser.level}
                  </span>
                  {memberSince && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" /> Depuis {memberSince}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/20">
                <div className="text-3xl font-bold">{displayUser.elo}</div>
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
              <span>Niveau {displayUser.level}</span>
              <span>{displayUser.xp % 1000} / 1000 XP</span>
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
            <StatCard icon={<BarChart3 className="w-6 h-6 text-blue-500" />} label="Débats" value={rankedDebates.length} trend={`${winRate}% de victoires`} />
            <StatCard icon={<Target className="w-6 h-6 text-green-500" />} label="Victoires" value={displayUser.wins} trend={`${displayUser.losses} défaites`} />
            <StatCard icon={<Brain className="w-6 h-6 text-purple-500" />} label="Score moyen" value={avgScore} trend={avgScore !== "N/A" ? "Basé sur vos analyses" : "Pas encore d'analyse"} />
            <StatCard icon={<Flame className="w-6 h-6 text-orange-500" />} label="Série actuelle" value={currentStreak} trend={`Record: ${maxStreak}`} />
          </div>
        )}

        {activeTab === "history" && (
          <Card>
            <CardHeader><CardTitle>Historique des débats</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <p className="text-center text-slate-500 py-8">Chargement...</p>
              ) : debates.length === 0 ? (
                <p className="text-center text-slate-500 py-8">Aucun débat pour l&apos;instant.</p>
              ) : (
                debates.map((d) => {
                  const isPlayer1 = d.player1Id === user.id;
                  const opponent = isPlayer1 ? d.player2 : d.player1;
                  const opponentName = opponent?.username ?? "IA_Coach";
                  const userScore = isPlayer1 ? d.analysis?.player1Score : d.analysis?.player2Score;
                  const result: "win" | "loss" | "draw" =
                    d.winnerId === user.id ? "win" : d.winnerId ? "loss" : "draw";
                  return (
                    <div key={d.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          result === "win"
                            ? "bg-green-100 dark:bg-green-900/30"
                            : result === "loss"
                            ? "bg-red-100 dark:bg-red-900/30"
                            : "bg-slate-100 dark:bg-slate-700"
                        }`}>
                          {result === "win" ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : result === "loss" ? (
                            <XCircle className="w-5 h-5 text-red-600" />
                          ) : (
                            <Clock className="w-5 h-5 text-slate-500" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-white">{d.topic}</h4>
                          <div className="text-sm text-slate-500 flex items-center gap-2">
                            vs {opponentName}{" "}
                            <Badge variant="outline">{modeLabels[d.mode] ?? d.mode}</Badge>
                            <Clock className="w-3 h-3" /> {formatRelativeDate(d.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {userScore != null ? (
                          <div className="font-bold">{userScore}/100</div>
                        ) : (
                          <div className="text-slate-400 text-sm">N/A</div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "achievements" && (
          <div className="space-y-8">
            {/* Summary */}
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-xl px-6 py-4 shadow-md border border-slate-200 dark:border-slate-800">
              <div>
                <p className="text-sm text-slate-500">Succès débloqués</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {unlockedCount} <span className="text-slate-400 font-normal text-lg">/ {totalAchievements}</span>
                </p>
              </div>
              <div className="w-48">
                <Progress value={totalAchievements > 0 ? Math.round((unlockedCount / totalAchievements) * 100) : 0} className="h-3" />
                <p className="text-xs text-slate-500 mt-1 text-right">
                  {totalAchievements > 0 ? Math.round((unlockedCount / totalAchievements) * 100) : 0}%
                </p>
              </div>
            </div>

            {achievementsLoading ? (
              <p className="text-center text-slate-500 py-8">Chargement des succès...</p>
            ) : (
              achievementCategories.map(({ category, items }) => (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">{category}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {items.map((b) => (
                      <motion.div
                        key={b.id}
                        whileHover={{ scale: 1.02 }}
                        className={`relative p-4 rounded-xl border flex flex-col gap-2 ${
                          b.unlocked
                            ? "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border-amber-300 dark:border-amber-700"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60"
                        }`}
                      >
                        {b.unlocked && (
                          <span className="absolute top-2 right-2">
                            <CheckCircle2 className="w-4 h-4 text-amber-500" />
                          </span>
                        )}
                        <span className={`text-3xl ${b.unlocked ? "" : "grayscale opacity-60"}`}>{b.icon}</span>
                        <div>
                          <p className="font-semibold text-sm text-slate-900 dark:text-white leading-tight">{b.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5 leading-snug">{b.description}</p>
                        </div>
                        {b.unlocked ? (
                          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-auto">
                            {b.unlockedAt ? formatRelativeDate(b.unlockedAt) : "Débloqué"}
                          </p>
                        ) : (
                          <div className="mt-auto">
                            <Progress value={b.progress} className="h-1.5" />
                            <p className="text-xs text-slate-400 mt-1">{b.progressLabel}</p>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))
            )}
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
