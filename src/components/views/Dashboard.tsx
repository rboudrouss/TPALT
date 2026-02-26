"use client";

import { motion } from "motion/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Swords, Trophy, History, User, LogOut } from "lucide-react";
import { useApp } from "@/lib/store";

export function Dashboard() {
  const { state, dispatch } = useApp();
  const { user } = state;

  const handleSelectMode = (mode: "training" | "casual" | "ranked") => {
    dispatch({ type: "SET_GAME_MODE", payload: mode });
    dispatch({ type: "SET_VIEW", payload: "matchmaking" });
  };

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
  };

  if (!user) return null;

  const winRate = user.wins + user.losses > 0
    ? Math.round((user.wins / (user.wins + user.losses)) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
      <header className="flex justify-between items-center mb-12 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Bonjour, {user.username}
        </h1>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" title="Historique">
            <History className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch({ type: "SET_VIEW", payload: "profile" })}
            title="Profil"
          >
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GameModeCard
            title="Entraînement"
            description="Perfectionnez vos arguments contre une IA adaptative sans pression."
            icon={<Bot className="h-10 w-10 text-emerald-500" />}
            onClick={() => handleSelectMode("training")}
            delay={0.1}
          />
          <GameModeCard
            title="Casual"
            description="Débats amicaux. Sujet imposé, position libre. Idéal pour s'échauffer."
            icon={<Swords className="h-10 w-10 text-amber-500" />}
            onClick={() => handleSelectMode("casual")}
            delay={0.2}
          />
          <GameModeCard
            title="Classé"
            description="La compétition pure. Sujet et position imposés. Grimpez le classement Elo."
            icon={<Trophy className="h-10 w-10 text-indigo-500" />}
            onClick={() => handleSelectMode("ranked")}
            delay={0.3}
          />
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-6 text-slate-700 dark:text-slate-300">
            Statistiques
          </h2>
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <StatItem label="Niveau Elo" value={user.elo.toString()} />
                <StatItem label="Victoires" value={user.wins.toString()} />
                <StatItem label="Défaites" value={user.losses.toString()} />
                <StatItem label="Taux de victoire" value={`${winRate}%`} />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function GameModeCard({
  title,
  description,
  icon,
  onClick,
  delay,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -5 }}
    >
      <Card
        className="h-full hover:shadow-lg transition-shadow cursor-pointer"
        onClick={onClick}
      >
        <CardHeader>
          <div className="mb-4">{icon}</div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button className="w-full" variant="outline">
            Jouer
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
      <div className="text-sm text-slate-500 dark:text-slate-400">{label}</div>
    </div>
  );
}

