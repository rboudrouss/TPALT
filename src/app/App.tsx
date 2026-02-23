import React, { useState } from "react";
import { Landing } from "../components/views/Landing";
import { Dashboard } from "../components/views/Dashboard";
import { Matchmaking } from "../components/views/Matchmaking";
import { DebateArena } from "../components/views/DebateArena";
import { Analysis } from "../components/views/Analysis";
import { Concept } from "../components/views/Concept";
import { Profile } from "../components/views/Profile";
import { AnimatePresence, motion } from "motion/react";

type ViewState = "landing" | "dashboard" | "matchmaking" | "arena" | "analysis" | "concept" | "profile";
type GameMode = "training" | "casual" | "ranked";

export default function App() {
  const [view, setView] = useState<ViewState>("landing");
  const [mode, setMode] = useState<GameMode>("casual");
  const [lastGameData, setLastGameData] = useState<any>(null);

  // Mock User
  const user = {
    username: "Orateur_42",
    elo: 1250,
  };

  const handleLogin = () => {
    setView("dashboard");
  };

  const handleSelectMode = (selectedMode: GameMode) => {
    setMode(selectedMode);
    setView("matchmaking");
  };

  const handleMatchFound = () => {
    setView("arena");
  };

  const handleFinishDebate = (data: any) => {
    setLastGameData(data);
    setView("analysis");
  };

  const handleHome = () => {
    setView("dashboard");
  };

  const handleConcept = () => {
    setView("concept");
  };

  const handleProfile = () => {
    setView("profile");
  };

  const handleBackToLanding = () => {
    setView("landing");
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 font-sans">
      <AnimatePresence mode="wait">
        {view === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            <Landing onLogin={handleLogin} onConcept={handleConcept} />
          </motion.div>
        )}

        {view === "dashboard" && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute inset-0"
          >
            <Dashboard onSelectMode={handleSelectMode} username={user.username} onConcept={handleConcept} onProfile={handleProfile} />
          </motion.div>
        )}

        {view === "matchmaking" && (
          <motion.div
            key="matchmaking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            <Matchmaking onMatchFound={handleMatchFound} mode={mode} />
          </motion.div>
        )}

        {view === "arena" && (
          <motion.div
            key="arena"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="absolute inset-0"
          >
            <DebateArena mode={mode} onFinish={handleFinishDebate} />
          </motion.div>
        )}

        {view === "analysis" && (
          <motion.div
            key="analysis"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute inset-0 overflow-y-auto"
          >
            <Analysis data={lastGameData} onHome={handleHome} />
          </motion.div>
        )}

        {view === "concept" && (
          <motion.div
            key="concept"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute inset-0 overflow-y-auto"
          >
            <Concept onBack={handleBackToLanding} onGetStarted={handleLogin} />
          </motion.div>
        )}

        {view === "profile" && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute inset-0 overflow-y-auto"
          >
            <Profile onBack={handleHome} username={user.username} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}