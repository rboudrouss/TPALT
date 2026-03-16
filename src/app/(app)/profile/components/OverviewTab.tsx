"use client";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Target, Brain, Flame } from "lucide-react";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend: string;
}

function StatCard({ icon, label, value, trend }: StatCardProps) {
  return (
    <Card className="shadow-md">
      <CardContent className="p-6">
        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg w-fit mb-3">
          {icon}
        </div>
        <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
          {value}
        </div>
        <div className="text-sm text-slate-500 mb-1">{label}</div>
        <div className="text-xs text-green-600 font-medium">{trend}</div>
      </CardContent>
    </Card>
  );
}

interface OverviewTabProps {
  debateCount: number;
  wins: number;
  losses: number;
  winRate: number;
  avgScore: string;
  currentStreak: number;
  maxStreak: number;
}

export default function OverviewTab({
  debateCount,
  wins,
  losses,
  winRate,
  avgScore,
  currentStreak,
  maxStreak,
}: OverviewTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        icon={<BarChart3 className="w-6 h-6 text-blue-500" />}
        label="Débats"
        value={debateCount}
        trend={`${winRate}% de victoires`}
      />
      <StatCard
        icon={<Target className="w-6 h-6 text-green-500" />}
        label="Victoires"
        value={wins}
        trend={`${losses} défaites`}
      />
      <StatCard
        icon={<Brain className="w-6 h-6 text-purple-500" />}
        label="Score moyen"
        value={avgScore}
        trend={avgScore !== "N/A" ? "Basé sur vos analyses" : "Pas encore d'analyse"}
      />
      <StatCard
        icon={<Flame className="w-6 h-6 text-orange-500" />}
        label="Série actuelle"
        value={currentStreak}
        trend={`Record: ${maxStreak}`}
      />
    </div>
  );
}
