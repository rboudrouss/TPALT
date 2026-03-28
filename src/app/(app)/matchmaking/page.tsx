"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp, TrainingDifficulty } from "@/hooks/useApp";
import { useForceLogin } from "@/hooks/useForceLogin";
import { useMatchmaking } from "./hooks/useMatchmaking";
import { DifficultySelector } from "./components/DifficultySelector";
import { MatchmakingSpinner } from "./components/MatchmakingSpinner";

export default function MatchmakingPage() {
  const { state, dispatch } = useApp();
  const router = useRouter();
  const user = useForceLogin();
  const [difficultySelected, setDifficultySelected] = useState(
    state.gameMode !== "training"
  );

  useEffect(() => {
    if (user && !state.gameMode) router.replace("/dashboard");
  }, [user, state.gameMode, router]);

  const handleStartTraining = (difficulty: TrainingDifficulty) => {
    dispatch({ type: "SET_TRAINING_DIFFICULTY", payload: difficulty });
    setDifficultySelected(true);
  };

  const { status, handleCancel } = useMatchmaking(difficultySelected);

  if (!state.user || !state.gameMode) return null;

  if (!difficultySelected && state.gameMode === "training") {
    return (
      <DifficultySelector onStart={handleStartTraining} onCancel={handleCancel} />
    );
  }

  return (
    <MatchmakingSpinner
      status={status}
      gameMode={state.gameMode}
      trainingDifficulty={state.trainingDifficulty}
      onCancel={handleCancel}
    />
  );
}
