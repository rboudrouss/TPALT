"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { useTranslation } from "@/lib/i18n/context";

export function useMatchmaking(difficultySelected: boolean): {
  status: string;
  handleCancel: () => void;
} {
  const { state, dispatch } = useApp();
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [status, setStatus] = useState(t.matchmaking.statusSearching);
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
        setTimeout(() => setStatus(t.matchmaking.statusAnalyzing), 1500),
        setTimeout(() => setStatus(t.matchmaking.statusSelecting), 3000),
        setTimeout(() => setStatus(t.matchmaking.statusPreparing), 4500),
        setTimeout(async () => {
          try {
            const res = await fetch("/api/debates", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ playerId: state.user!.id, mode: "training", locale }),
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
        setStatus(t.matchmaking.statusSearching);

        const listRes = await fetch(`/api/debates?mode=${state.gameMode}&status=waiting`);
        const debates: { id: string; player1Id: string }[] = await listRes.json();
        const joinable = debates.find((d) => d.player1Id !== state.user!.id);

        if (joinable) {
          setStatus(t.matchmaking.statusFound);
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

        setStatus(t.matchmaking.statusWaiting);
        const createRes = await fetch("/api/debates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerId: state.user!.id, mode: state.gameMode, locale }),
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
              setStatus(t.matchmaking.statusFound);
              router.push(`/debate/${debate.id}`);
            }
          } catch {
            // ignore polling errors
          }
        }, 500);
      } catch (error) {
        console.error("Matchmaking error:", error);
        setStatus(t.matchmaking.statusError);
      }
    };

    startMultiplayer();
    return () => stopPolling();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficultySelected, dispatch, state.gameMode, state.user, router]);

  return { status, handleCancel };
}
