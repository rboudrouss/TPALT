"use client";

import { useTranslation } from "@/lib/i18n/context";

type Tab = "overview" | "history" | "achievements";

interface ProfileTabsProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex gap-2 mb-8 bg-white dark:bg-slate-900 rounded-lg p-1 shadow-lg max-w-md mx-auto">
      {(["overview", "history", "achievements"] as const).map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === tab
              ? "bg-indigo-600 text-white"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          {t.profile.tabs[tab]}
        </button>
      ))}
    </div>
  );
}
