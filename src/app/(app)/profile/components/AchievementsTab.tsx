"use client";
import { motion } from "motion/react";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2 } from "lucide-react";
import type { AchievementResult } from "@/lib/achievements";
import { formatRelativeDate } from "../hooks/useProfile";
import { useTranslation } from "@/lib/i18n/context";

interface AchievementCardProps {
  achievement: AchievementResult;
}

function AchievementCard({ achievement: b }: AchievementCardProps) {
  const { t } = useTranslation();

  return (
    <motion.div
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
      <span className={`text-3xl ${b.unlocked ? "" : "grayscale opacity-60"}`}>
        {b.icon}
      </span>
      <div>
        <p className="font-semibold text-sm text-slate-900 dark:text-white leading-tight">
          {b.name}
        </p>
        <p className="text-xs text-slate-500 mt-0.5 leading-snug">{b.description}</p>
      </div>
      {b.unlocked ? (
        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-auto">
          {b.unlockedAt ? formatRelativeDate(b.unlockedAt, t) : t.profile.unlocked}
        </p>
      ) : (
        <div className="mt-auto">
          <Progress value={b.progress} className="h-1.5" />
          <p className="text-xs text-slate-400 mt-1">{b.progressLabel}</p>
        </div>
      )}
    </motion.div>
  );
}

interface AchievementsTabProps {
  achievementCategories: { category: string; items: AchievementResult[] }[];
  achievementsLoading: boolean;
}

export default function AchievementsTab({
  achievementCategories,
  achievementsLoading,
}: AchievementsTabProps) {
  const { t } = useTranslation();
  const totalAchievements = achievementCategories.reduce(
    (n, c) => n + c.items.length,
    0
  );
  const unlockedCount = achievementCategories.reduce(
    (n, c) => n + c.items.filter((b) => b.unlocked).length,
    0
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-xl px-6 py-4 shadow-md border border-slate-200 dark:border-slate-800">
        <div>
          <p className="text-sm text-slate-500">{t.profile.achievementsUnlocked}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {unlockedCount}{" "}
            <span className="text-slate-400 font-normal text-lg">
              / {totalAchievements}
            </span>
          </p>
        </div>
        <div className="w-48">
          <Progress
            value={
              totalAchievements > 0
                ? Math.round((unlockedCount / totalAchievements) * 100)
                : 0
            }
            className="h-3"
          />
          <p className="text-xs text-slate-500 mt-1 text-right">
            {totalAchievements > 0
              ? Math.round((unlockedCount / totalAchievements) * 100)
              : 0}
            %
          </p>
        </div>
      </div>

      {achievementsLoading ? (
        <p className="text-center text-slate-500 py-8">{t.profile.loadingAchievements}</p>
      ) : (
        achievementCategories.map(({ category, items }) => (
          <div key={category}>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
              {category}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {items.map((b) => (
                <AchievementCard key={b.id} achievement={b} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
