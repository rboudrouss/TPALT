"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";

export function useMatchmaking(difficultySelected: boolean): {
  status: string;
  handleCancel: () => void;
} {
  const { state, dispatch } = useApp();
  const router = useRouter();
  const [status, setStatus] = useState("Recherche d'un adversaire...");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const handleCancel = () => {
    stopPolling();
    dispatch({ type: "SET_GAME_MODE", payload: null });
    dispatch({ type: "SET_TRAINING_DIFFICULTY", payload: null });
    dispatch({ type: "SET_PLAYER_ROLE", payload: null });
    router.push("/dashboard");
  };

  useEffect(() => {
    if (!difficultySelected) return;
    if (!state.user || !state.gameMode) return;

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
            router.push(`/debate/${debate.id}`);
          } catch {
            console.error("Failed to create training debate");
          }
        }, 6000),
      ];
      return () => timers.forEach(clearTimeout);
    }

    const startMultiplayer = async () => {
      if (!state.user || !state.gameMode) return;

      try {
        setStatus("Recherche d'un adversaire...");

        const listRes = await fetch(`/api/debates?mode=${state.gameMode}&status=waiting`);
        const debates: { id: string; player1Id: string }[] = await listRes.json();
        const joinable = debates.find((d) => d.player1Id !== state.user!.id);

        if (joinable) {
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
          router.push(`/debate/${joinable.id}`);
          return;
        }

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

        pollRef.current = setInterval(async () => {
          try {
            const stateRes = await fetch(`/api/debates/${debate.id}`);
            const updated = await stateRes.json();
            if (updated.player2Id) {
              stopPolling();
              setStatus("Adversaire trouvé ! Connexion à l'arène...");
              router.push(`/debate/${debate.id}`);
            }
          } catch {
            // ignore polling errors
          }
        }, 500);
      } catch (error) {
        console.error("Matchmaking error:", error);
        setStatus("Erreur de connexion. Réessayez...");
      }
    };

    startMultiplayer();
    return () => stopPolling();
  }, [difficultySelected, dispatch, state.gameMode, state.user, router]);

  return { status, handleCancel };
}
