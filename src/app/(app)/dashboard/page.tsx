"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { User, LogOut, Trophy } from "lucide-react";
import { useApp } from "@/lib/store";
import { GameModeGrid } from "./components/GameModeGrid";
import { StatsPanel } from "./components/StatsPanel";
import { useTranslation, fmt } from "@/lib/i18n/context";
import { LanguageToggle } from "@/components/ui/LanguageToggle";

export default function DashboardPage() {
  const { state, dispatch } = useApp();
  const router = useRouter();
  const { user } = state;
  const { t } = useTranslation();

  const { data: freshUser } = useQuery({
    queryKey: ["user", user?.id],
    queryFn: () => fetch(`/api/users/${user!.id}`).then((res) => (res.ok ? res.json() : null)),
    enabled: !!user,
  });

  useEffect(() => {
    if (!user) {
      router.replace("/");
      return;
    }
    if (freshUser) {
      dispatch({
        type: "SET_USER",
        payload: {
          id: freshUser.id,
          username: freshUser.username,
          elo: freshUser.elo,
          level: freshUser.level,
          xp: freshUser.xp,
          wins: freshUser.wins,
          losses: freshUser.losses,
        },
      });
    }
  }, [freshUser, user, router, dispatch]);

  const handleSelectMode = (mode: "training" | "casual" | "ranked") => {
    dispatch({ type: "SET_GAME_MODE", payload: mode });
    router.push("/matchmaking");
  };

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    router.push("/");
  };

  if (!user) return null;

  const winRate =
    user.wins + user.losses > 0
      ? Math.round((user.wins / (user.wins + user.losses)) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
      <header className="flex justify-between items-center mb-12 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          {fmt(t.dashboard.greeting, { name: user.username })}
        </h1>
        <nav className="flex items-center gap-1">
          <LanguageToggle />
          <Button variant="ghost" onClick={() => router.push("/leaderboard")} className="gap-2">
            <Trophy className="h-4 w-4" />
            {t.dashboard.leaderboard}
          </Button>
          <Button variant="ghost" onClick={() => router.push("/profile")} className="gap-2">
            <User className="h-4 w-4" />
            {t.dashboard.profile}
          </Button>
          <Button variant="ghost" size="icon" onClick={handleLogout} title={t.dashboard.logout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto">
        <h2 className="text-xl font-semibold mb-6 text-slate-700 dark:text-slate-300">
          {t.dashboard.chooseMode}
        </h2>
        <GameModeGrid onSelectMode={handleSelectMode} />

        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-6 text-slate-700 dark:text-slate-300">
            {t.dashboard.statistics}
          </h2>
          <StatsPanel elo={user.elo} wins={user.wins} losses={user.losses} winRate={winRate} />
        </div>
      </main>
    </div>
  );
}
