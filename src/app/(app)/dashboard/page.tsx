"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";
import { useApp } from "@/lib/store";
import { GameModeGrid } from "./components/GameModeGrid";
import { StatsPanel } from "./components/StatsPanel";

export default function DashboardPage() {
  const { state, dispatch } = useApp();
  const router = useRouter();
  const { user } = state;

  useEffect(() => {
    if (!user) router.replace("/");
  }, [user, router]);

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
          Bonjour, {user.username}
        </h1>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push("/profile")} title="Profil">
            <User className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Déconnexion">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        <h2 className="text-xl font-semibold mb-6 text-slate-700 dark:text-slate-300">
          Choisir un mode de jeu
        </h2>
        <GameModeGrid onSelectMode={handleSelectMode} />

        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-6 text-slate-700 dark:text-slate-300">
            Statistiques
          </h2>
          <StatsPanel elo={user.elo} wins={user.wins} losses={user.losses} winRate={winRate} />
        </div>
      </main>
    </div>
  );
}
