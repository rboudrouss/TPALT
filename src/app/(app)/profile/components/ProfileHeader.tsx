"use client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Trophy, Calendar } from "lucide-react";

interface ProfileHeaderProps {
  username: string;
  level: number;
  elo: number;
  xp: number;
  wins: number;
  losses: number;
  memberSince: string;
  onBack: () => void;
}

export default function ProfileHeader({
  username,
  level,
  elo,
  xp,
  wins,
  losses,
  memberSince,
  onBack,
}: ProfileHeaderProps) {
  const winRate =
    wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : 0;
  const xpProgress = (xp % 1000) / 10;

  return (
    <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white">
      <div className="relative z-10 container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-white hover:bg-white/10 mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-3xl font-bold shadow-xl">
              {username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">{username}</h1>
              <div className="flex items-center gap-4 text-sm opacity-90">
                <span className="flex items-center gap-1">
                  <Trophy className="w-4 h-4" /> Niveau {level}
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
              <div className="text-3xl font-bold">{elo}</div>
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
            <span>Niveau {level}</span>
            <span>{xp % 1000} / 1000 XP</span>
          </div>
          <Progress value={xpProgress} className="h-2" />
        </div>
      </div>
    </div>
  );
}
