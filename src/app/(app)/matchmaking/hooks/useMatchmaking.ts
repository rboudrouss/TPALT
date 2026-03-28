"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/hooks/useApp";
import { useTranslation } from "@/lib/i18n/context";

export function useMatchmaking(difficultySelected: boolean): {
  status: string;
  handleCancel: () => void;
} {
  const { state, dispatch } = useApp();
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [status, setStatus] = useState(t.matchmaking.statusSearching);
  const matchmakingWsRef = useRef<WebSocket | null>(null);

  const closeMatchmakingWs = () => {
    const ws = matchmakingWsRef.current;
    if (ws) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "cancel_queue" }));
      }
      ws.close();
      matchmakingWsRef.current = null;
    }
  };

  const handleCancel = () => {
    closeMatchmakingWs();
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

    setStatus(t.matchmaking.statusSearching);

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
    matchmakingWsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "queue", userId: state.user!.id, mode: state.gameMode, locale }));
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "queued") {
        setStatus(t.matchmaking.statusWaiting);
      }
      if (msg.type === "matched") {
        setStatus(t.matchmaking.statusFound);
        dispatch({ type: "SET_DEBATE_ID", payload: msg.debateId });
        dispatch({ type: "SET_PLAYER_ROLE", payload: msg.playerRole });
        ws.close();
        matchmakingWsRef.current = null;
        router.push(`/debate/${msg.debateId}`);
      }
    };

    ws.onerror = () => {
      setStatus(t.matchmaking.statusError);
    };

    ws.onclose = (event) => {
      matchmakingWsRef.current = null;
      if (!event.wasClean) {
        setStatus(t.matchmaking.statusError);
      }
    };

    return () => closeMatchmakingWs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficultySelected, dispatch, state.gameMode, state.user, router]);

  return { status, handleCancel };
}
