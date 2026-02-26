"use client";

import { useApp } from "@/lib/store";
import { Landing } from "@/components/views/Landing";
import { Dashboard } from "@/components/views/Dashboard";
import { Matchmaking } from "@/components/views/Matchmaking";
import { DebateArena } from "@/components/views/DebateArena";
import { Analysis } from "@/components/views/Analysis";
import { Profile } from "@/components/views/Profile";

export default function Home() {
  const { state } = useApp();

  switch (state.currentView) {
    case "landing":
      return <Landing />;
    case "dashboard":
      return <Dashboard />;
    case "matchmaking":
      return <Matchmaking />;
    case "debate":
      return <DebateArena />;
    case "analysis":
      return <Analysis />;
    case "profile":
      return <Profile />;
    default:
      return <Landing />;
  }
}
