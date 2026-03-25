"use client";
import { useState, useEffect } from "react";
import type { AchievementResult } from "@/lib/achievements";
import type { Locale, Translations } from "@/lib/i18n/types";
import { fmt, useTranslation } from "@/lib/i18n/context";

export interface DebateRecord {
  id: string;
  topic: string;
  mode: string;
  status: string;
  player1Id: string;
  player2Id: string | null;
  winnerId: string | null;
  createdAt: string;
  player1?: { id: string; username: string };
  player2?: { id: string; username: string } | null;
  analysis?: {
    overallScore: number;
    player1Score: number | null;
    player2Score: number | null;
    sophisms: string;
  } | null;
}

export interface UserProfile {
  id: string;
  username: string;
  elo: number;
  level: number;
  xp: number;
  wins: number;
  losses: number;
  createdAt: string;
  debates: DebateRecord[];
}

export function formatRelativeDate(dateStr: string, t: Translations): string {
  const date = new Date(dateStr);
  const diffDays = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (diffDays === 0) return t.common.dates.today;
  if (diffDays === 1) return t.common.dates.yesterday;
  if (diffDays < 7) return fmt(t.common.dates.daysAgo, { count: diffDays });
  if (diffDays < 30) return fmt(t.common.dates.weeksAgo, { count: Math.floor(diffDays / 7) });
  return date.toLocaleDateString(t.dateLocale, { day: "numeric", month: "short", year: "numeric" });
}

export function computeCurrentStreak(debates: DebateRecord[], userId: string): number {
  const finished = [...debates]
    .filter((d) => d.status === "finished")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  let streak = 0;
  for (const d of finished) {
    if (d.winnerId === userId) streak++;
    else break;
  }
  return streak;
}

export function computeMaxStreak(debates: DebateRecord[], userId: string): number {
  const finished = [...debates]
    .filter((d) => d.status === "finished")
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  let max = 0,
    cur = 0;
  for (const d of finished) {
    if (d.winnerId === userId) {
      cur++;
      max = Math.max(max, cur);
    } else {
      cur = 0;
    }
  }
  return max;
}

export function computeAverageScore(debates: DebateRecord[], userId: string): string {
  const scores: number[] = [];
  for (const d of debates) {
    if (!d.analysis) continue;
    const s = d.player1Id === userId ? d.analysis.player1Score : d.analysis.player2Score;
    if (s != null) scores.push(s);
  }
  if (scores.length === 0) return "N/A";
  return ((scores.reduce((a, b) => a + b, 0) / scores.length) / 10).toFixed(1) + "/10";
}

interface UseProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  achievementCategories: { category: string; items: AchievementResult[] }[];
  achievementsLoading: boolean;
}

export function useProfile(userId: string | undefined): UseProfileReturn {
  const { locale } = useTranslation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [achievementCategories, setAchievementCategories] = useState<
    { category: string; items: AchievementResult[] }[]
  >([]);
  const [achievementsLoading, setAchievementsLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetch(`/api/users/${userId}`)
      .then((res) => res.json())
      .then((data: UserProfile) => {
        setProfile(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    if (!userId || loading) return;
    setAchievementsLoading(true);
    fetch(`/api/users/${userId}/achievements?locale=${locale}`, { method: "POST" })
      .then((res) => res.json())
      .then((data: { categories: { category: string; items: AchievementResult[] }[] }) => {
        setAchievementCategories(data.categories ?? []);
        setAchievementsLoading(false);
      })
      .catch(() => setAchievementsLoading(false));
  }, [userId, loading, locale]);

  return { profile, loading, achievementCategories, achievementsLoading };
}
