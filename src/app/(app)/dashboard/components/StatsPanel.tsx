"use client";
import { Card, CardContent } from "@/components/ui/card";

interface StatsPanelProps {
  elo: number;
  wins: number;
  losses: number;
  winRate: number;
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
      <div className="text-sm text-slate-500 dark:text-slate-400">{label}</div>
    </div>
  );
}

export function StatsPanel({ elo, wins, losses, winRate }: StatsPanelProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <StatItem label="Niveau Elo" value={elo.toString()} />
          <StatItem label="Victoires" value={wins.toString()} />
          <StatItem label="Défaites" value={losses.toString()} />
          <StatItem label="Taux de victoire" value={`${winRate}%`} />
        </div>
      </CardContent>
    </Card>
  );
}
