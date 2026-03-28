"use client";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { User, LogOut, Trophy } from "lucide-react";
import { useApp } from "@/hooks/useApp";
import { useForceLogin } from "@/hooks/useForceLogin";
import { useLogout } from "@/hooks/useLogout";
import { GameModeGrid } from "./components/GameModeGrid";
import { StatsPanel } from "./components/StatsPanel";
import { useTranslation, fmt } from "@/lib/i18n/context";
import { LanguageToggle } from "@/components/ui/LanguageToggle";

export default function DashboardPage() {
  const { dispatch } = useApp();
  const router = useRouter();
  const user = useForceLogin();
  const handleLogout = useLogout();
  const { t } = useTranslation();

  const { data: freshUser } = useQuery({
    queryKey: ["user", user?.id],
    queryFn: () => fetch(`/api/users/${user!.id}`).then((res) => (res.ok ? res.json() : null)),
    enabled: !!user,
  });

  const handleSelectMode = (mode: "training" | "casual" | "ranked") => {
    dispatch({ type: "SET_GAME_MODE", payload: mode });
    router.push("/matchmaking");
  };

  if (!user) return null;

  const displayUser = freshUser ?? user;
  const winRate =
    displayUser.wins + displayUser.losses > 0
      ? Math.round((displayUser.wins / (displayUser.wins + displayUser.losses)) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
      <header className="flex justify-between items-center mb-12 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          {fmt(t.dashboard.greeting, { name: displayUser.username })}
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
          <StatsPanel elo={displayUser.elo} wins={displayUser.wins} losses={displayUser.losses} winRate={winRate} />
        </div>
      </main>
    </div>
  );
}
