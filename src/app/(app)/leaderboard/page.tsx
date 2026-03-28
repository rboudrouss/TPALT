"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { ArrowLeft, Crown, Medal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/hooks/useApp";
import { useTranslation } from "@/lib/i18n/context";

interface LeaderboardUser {
  id: string;
  username: string;
  elo: number;
  level: number;
  wins: number;
  losses: number;
}

export default function LeaderboardPage() {
  const { state } = useApp();
  const router = useRouter();
  const { t } = useTranslation();
  const { data: users = [], isLoading: loading } = useQuery<LeaderboardUser[]>({
    queryKey: ["leaderboard"],
    queryFn: () => fetch("/api/leaderboard").then((res) => (res.ok ? res.json() : [])),
  });

  if (!state.user) {
    router.replace("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
      <header className="flex items-center gap-4 mb-8 max-w-4xl mx-auto">
        <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          {t.leaderboard.title}
        </h1>
      </header>

      <main className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              {t.leaderboard.topPlayers}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-slate-500 py-8">{t.common.loading}</p>
            ) : users.length === 0 ? (
              <p className="text-center text-slate-500 py-8">{t.leaderboard.noPlayers}</p>
            ) : (
              <div className="space-y-2">
                {users.map((u, i) => {
                  const rank = i + 1;
                  const winRate =
                    u.wins + u.losses > 0
                      ? Math.round((u.wins / (u.wins + u.losses)) * 100)
                      : 0;
                  const isCurrentUser = u.id === state.user?.id;

                  return (
                    <motion.div
                      key={u.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                        isCurrentUser
                          ? "bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800"
                          : "bg-slate-50 dark:bg-slate-800/50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 text-center">
                          {rank === 1 ? (
                            <Crown className="w-6 h-6 text-amber-500 mx-auto" />
                          ) : rank === 2 ? (
                            <Medal className="w-6 h-6 text-slate-400 mx-auto" />
                          ) : rank === 3 ? (
                            <Medal className="w-6 h-6 text-amber-700 mx-auto" />
                          ) : (
                            <span className="text-lg font-semibold text-slate-500">{rank}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            {u.username}
                            {isCurrentUser && (
                              <Badge variant="outline" className="text-xs">{t.common.you}</Badge>
                            )}
                          </div>
                          <div className="text-sm text-slate-500">{t.common.level} {u.level}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-right">
                          <div className="font-bold text-slate-900 dark:text-white">{u.elo}</div>
                          <div className="text-slate-500">Elo</div>
                        </div>
                        <div className="text-right hidden sm:block">
                          <div className="font-medium text-slate-900 dark:text-white">
                            {u.wins}W / {u.losses}L
                          </div>
                          <div className="text-slate-500">{winRate}%</div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
