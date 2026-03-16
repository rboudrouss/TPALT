"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "motion/react";
import { Loader2, Zap, Sword, Brain } from "lucide-react";
import { useApp, TrainingDifficulty } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DIFFICULTIES: {
  value: TrainingDifficulty;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  border: string;
  selectedBg: string;
}[] = [
  {
    value: "easy",
    label: "Débutant",
    description: "L'IA commet des erreurs, argumente de manière informelle et parfois hors-sujet.",
    icon: <Zap className="w-6 h-6" />,
    color: "text-emerald-400",
    border: "border-emerald-700",
    selectedBg: "bg-emerald-900/40",
  },
  {
    value: "medium",
    label: "Intermédiaire",
    description: "L'IA construit des arguments solides mais commet quelques généralisations.",
    icon: <Sword className="w-6 h-6" />,
    color: "text-amber-400",
    border: "border-amber-700",
    selectedBg: "bg-amber-900/40",
  },
  {
    value: "hard",
    label: "Expert",
    description: "L'IA contra-argue directement, expose vos sophismes et ne laisse rien passer.",
    icon: <Brain className="w-6 h-6" />,
    color: "text-red-400",
    border: "border-red-700",
    selectedBg: "bg-red-900/40",
  },
];

export function Matchmaking() {
  const { state, dispatch } = useApp();
  const [status, setStatus] = useState("Recherche d'un adversaire...");
  const [difficultySelected, setDifficultySelected] = useState(
    state.gameMode !== "training"
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState<TrainingDifficulty>("medium");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const handleStartTraining = () => {
    dispatch({ type: "SET_TRAINING_DIFFICULTY", payload: selectedDifficulty });
    setDifficultySelected(true);
  };

  const handleCancel = () => {
    stopPolling();
    dispatch({ type: "SET_GAME_MODE", payload: null });
    dispatch({ type: "SET_TRAINING_DIFFICULTY", payload: null });
    dispatch({ type: "SET_PLAYER_ROLE", payload: null });
    dispatch({ type: "SET_VIEW", payload: "dashboard" });
  };

  useEffect(() => {
    if (!difficultySelected) return;
    if (!state.user || !state.gameMode) return;

    // Training mode: simple debate creation, navigate immediately
    if (state.gameMode === "training") {
      const timers = [
        setTimeout(() => setStatus("Analyse du niveau Elo..."), 1500),
        setTimeout(() => setStatus("Sélection du sujet de débat..."), 3000),
        setTimeout(() => setStatus("Préparation de l'arène..."), 4500),
        setTimeout(async () => {
          try {
            const res = await fetch("/api/debates", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ playerId: state.user!.id, mode: "training" }),
            });
            if (!res.ok) throw new Error();
            const debate = await res.json();
            dispatch({ type: "SET_DEBATE_ID", payload: debate.id });
            dispatch({ type: "SET_PLAYER_ROLE", payload: "player1" });
          } catch {
            console.error("Failed to create training debate");
          }
          dispatch({ type: "SET_VIEW", payload: "debate" });
        }, 6000),
      ];
      return () => timers.forEach(clearTimeout);
    }

    // Casual / Ranked: try to join an existing debate first, else create one and wait
    const startMultiplayer = async () => {
      if (!state.user || !state.gameMode) return;

      try {
        setStatus("Recherche d'un adversaire...");

        // Try to find a waiting debate for this mode
        const listRes = await fetch(`/api/debates?mode=${state.gameMode}&status=waiting`);
        const debates: { id: string; player1Id: string }[] = await listRes.json();
        const joinable = debates.find((d) => d.player1Id !== state.user!.id);

        if (joinable) {
          // Join as player2
          setStatus("Adversaire trouvé ! Connexion à l'arène...");
          await fetch(`/api/debates/${joinable.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              player2Id: state.user!.id,
              status: "active",
              startedAt: new Date().toISOString(),
            }),
          });
          dispatch({ type: "SET_DEBATE_ID", payload: joinable.id });
          dispatch({ type: "SET_PLAYER_ROLE", payload: "player2" });
          dispatch({ type: "SET_VIEW", payload: "debate" });
          return;
        }

        // No debate found — create one and wait for opponent
        setStatus("En attente d'un adversaire...");
        const createRes = await fetch("/api/debates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerId: state.user!.id, mode: state.gameMode }),
        });
        if (!createRes.ok) throw new Error("Failed to create debate");
        const debate = await createRes.json();
        dispatch({ type: "SET_DEBATE_ID", payload: debate.id });
        dispatch({ type: "SET_PLAYER_ROLE", payload: "player1" });

        // Poll until player2 joins
        pollRef.current = setInterval(async () => {
          try {
            const stateRes = await fetch(`/api/debates/${debate.id}`);
            const updated = await stateRes.json();
            if (updated.player2Id) {
              stopPolling();
              setStatus("Adversaire trouvé ! Connexion à l'arène...");
              dispatch({ type: "SET_VIEW", payload: "debate" });
            }
          } catch {
            // ignore polling errors
          }
        }, 2000);
      } catch (error) {
        console.error("Matchmaking error:", error);
        setStatus("Erreur de connexion. Réessayez...");
      }
    };

    startMultiplayer();
    return () => stopPolling();
  }, [difficultySelected, dispatch, state.gameMode, state.user]);

  const modeLabels = {
    training: "Entraînement",
    casual: "Casual",
    ranked: "Classé",
  };

  // ── Difficulty selector (training only) ──────────────────────────────────
  if (!difficultySelected && state.gameMode === "training") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg"
        >
          <h2 className="text-3xl font-bold text-center mb-2">Mode Entraînement</h2>
          <p className="text-slate-400 text-center mb-8">
            Choisissez la difficulté de votre adversaire IA
          </p>

          <div className="space-y-3 mb-8">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.value}
                onClick={() => setSelectedDifficulty(d.value)}
                className={cn(
                  "w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4",
                  selectedDifficulty === d.value
                    ? `${d.border} ${d.selectedBg}`
                    : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                )}
              >
                <span className={cn("shrink-0", d.color)}>{d.icon}</span>
                <div>
                  <p className={cn("font-bold text-base", d.color)}>{d.label}</p>
                  <p className="text-sm text-slate-400">{d.description}</p>
                </div>
                {selectedDifficulty === d.value && (
                  <span className={cn("ml-auto text-xs font-bold px-2 py-1 rounded-full border", d.color, d.border)}>
                    Sélectionné
                  </span>
                )}
              </button>
            ))}
          </div>

          <Button
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 text-base"
            onClick={handleStartTraining}
          >
            Commencer l&apos;entraînement
          </Button>
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="w-full mt-3 text-slate-400 hover:text-white"
          >
            Annuler
          </Button>
        </motion.div>
      </div>
    );
  }

  // ── Matchmaking spinner ──────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          repeat: Infinity,
        }}
        className="mb-8 relative"
      >
        <div className="w-24 h-24 rounded-full bg-indigo-500 blur-xl absolute inset-0" />
        <div className="relative z-10 bg-indigo-600 rounded-full p-6">
          <Loader2 className="w-12 h-12 animate-spin text-white" />
        </div>
      </motion.div>

      <h2 className="text-2xl font-bold mb-2">Matchmaking en cours</h2>
      <p className="text-indigo-200 text-lg animate-pulse">{status}</p>

      <div className="mt-8 text-sm text-slate-400 border border-slate-700 rounded-lg p-4 bg-slate-800/50 flex flex-col items-center gap-1">
        <span>
          Mode:{" "}
          <span className="text-white font-semibold uppercase">
            {state.gameMode ? modeLabels[state.gameMode] : ""}
          </span>
        </span>
        {state.gameMode === "training" && state.trainingDifficulty && (
          <span>
            Difficulté:{" "}
            <span className={cn(
              "font-semibold",
              state.trainingDifficulty === "easy" ? "text-emerald-400" :
              state.trainingDifficulty === "medium" ? "text-amber-400" : "text-red-400"
            )}>
              {DIFFICULTIES.find((d) => d.value === state.trainingDifficulty)?.label}
            </span>
          </span>
        )}
      </div>

      <Button variant="ghost" onClick={handleCancel} className="mt-8 text-slate-400 hover:text-white">
        Annuler
      </Button>
    </div>
  );
}
