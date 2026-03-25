"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { useTranslation } from "@/lib/i18n/context";
import { useProfile, computeCurrentStreak, computeMaxStreak, computeAverageScore } from "./hooks/useProfile";
import ProfileHeader from "./components/ProfileHeader";
import ProfileTabs from "./components/ProfileTabs";
import OverviewTab from "./components/OverviewTab";
import HistoryTab from "./components/HistoryTab";
import AchievementsTab from "./components/AchievementsTab";

type Tab = "overview" | "history" | "achievements";

export default function ProfilePage() {
  const { state } = useApp();
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = state;
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const { profile, loading, achievementCategories, achievementsLoading } = useProfile(
    user?.id
  );

  useEffect(() => {
    if (!user) router.replace("/");
  }, [user, router]);

  if (!user) return null;

  const displayUser = profile ?? user;
  const debates = profile?.debates ?? [];
  const rankedDebates = debates.filter((d) => d.mode !== "training");
  const winRate =
    displayUser.wins + displayUser.losses > 0
      ? Math.round((displayUser.wins / (displayUser.wins + displayUser.losses)) * 100)
      : 0;
  const currentStreak = computeCurrentStreak(rankedDebates, user.id);
  const maxStreak = computeMaxStreak(rankedDebates, user.id);
  const avgScore = computeAverageScore(rankedDebates, user.id);
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(t.dateLocale, {
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      <ProfileHeader
        username={displayUser.username}
        level={displayUser.level}
        elo={displayUser.elo}
        xp={displayUser.xp}
        wins={displayUser.wins}
        losses={displayUser.losses}
        memberSince={memberSince}
        onBack={() => router.push("/dashboard")}
      />

      <div className="container mx-auto px-4 -mt-4 relative z-20">
        <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "overview" && (
          <OverviewTab
            debateCount={rankedDebates.length}
            wins={displayUser.wins}
            losses={displayUser.losses}
            winRate={winRate}
            avgScore={avgScore}
            currentStreak={currentStreak}
            maxStreak={maxStreak}
          />
        )}

        {activeTab === "history" && (
          <HistoryTab debates={debates} userId={user.id} loading={loading} />
        )}

        {activeTab === "achievements" && (
          <AchievementsTab
            achievementCategories={achievementCategories}
            achievementsLoading={achievementsLoading}
          />
        )}
      </div>
    </div>
  );
}
