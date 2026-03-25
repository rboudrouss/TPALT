"use client";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n/context";

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
  const { t } = useTranslation();

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <StatItem label={t.dashboard.eloLevel} value={elo.toString()} />
          <StatItem label={t.common.wins} value={wins.toString()} />
          <StatItem label={t.common.losses} value={losses.toString()} />
          <StatItem label={t.dashboard.winRate} value={`${winRate}%`} />
        </div>
      </CardContent>
    </Card>
  );
}
