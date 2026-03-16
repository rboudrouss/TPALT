"use client";

import { useEffect, useRef, Dispatch, SetStateAction } from "react";
import { Message, ROUND_TIME } from "./types";

interface WebSocketSetters {
  setTopic: (topic: string) => void;
  setPosition: (pos: "POUR" | "CONTRE") => void;
  setOpponentName: (name: string) => void;
  setMessages: Dispatch<SetStateAction<Message[]>>;
  setTurnCount: Dispatch<SetStateAction<number>>;
  setIsMyTurn: Dispatch<SetStateAction<boolean>>;
  setIsOpponentTyping: Dispatch<SetStateAction<boolean>>;
  setDebateReady: Dispatch<SetStateAction<boolean>>;
  setTimeLeft: Dispatch<SetStateAction<number>>;
}

interface UseWebSocketParams {
  isMultiplayer: boolean;
  currentDebateId: string | null | undefined;
  user: { id: string } | null | undefined;
  playerRole: string | null | undefined;
  setters: WebSocketSetters;
  onDebateEnded: () => void;
}

export function useWebSocket({
  isMultiplayer,
  currentDebateId,
  user,
  playerRole,
  setters,
  onDebateEnded,
}: UseWebSocketParams) {
  const wsRef = useRef<WebSocket | null>(null);
  // Store callback in ref so WS closure always has the latest version
  const onDebateEndedRef = useRef(onDebateEnded);
  onDebateEndedRef.current = onDebateEnded;

  useEffect(() => {
    if (!isMultiplayer || !currentDebateId || !user) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "join", debateId: currentDebateId, userId: user.id }));
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "state") {
        const debate = msg.debate;
        setters.setTopic(debate.topic);
        const myPos = playerRole === "player1" ? debate.player1Position : debate.player2Position;
        setters.setPosition(myPos ?? "POUR");
        const opponent = playerRole === "player1" ? debate.player2 : debate.player1;
        if (opponent) setters.setOpponentName(opponent.username);

        if (debate.messages && debate.messages.length > 0) {
          const loaded: Message[] = debate.messages.map((m: any) => ({
            id: m.id,
            sender: m.senderId === user.id ? "user" : "opponent",
            content: m.content,
            timestamp: new Date(m.createdAt),
          }));
          setters.setMessages([
            { id: "0", sender: "system", content: "Connexion au débat...", timestamp: new Date() },
            ...loaded,
          ]);
          setters.setTurnCount(debate.messages.length);
        }
      }

      if (msg.type === "debate_ready") {
        const isFirst = msg.currentTurn === playerRole;
        setters.setIsMyTurn(isFirst);
        setters.setIsOpponentTyping(!isFirst);
        setters.setDebateReady(true);
        setters.setMessages((prev) => {
          const rest = prev.filter((m) => m.id !== "0");
          return [
            {
              id: "0",
              sender: "system",
              content: isFirst
                ? "Le débat commence ! Vous avez la parole en premier."
                : "Le débat commence ! L'adversaire parle en premier.",
              timestamp: new Date(),
            },
            ...rest,
          ];
        });
        setters.setTimeLeft(ROUND_TIME);
      }

      if (msg.type === "new_message") {
        const m = msg.message;
        if (m.senderId !== user.id) {
          setters.setIsOpponentTyping(false);
          setters.setMessages((prev) => [
            ...prev,
            {
              id: m.id,
              sender: "opponent",
              content: m.content,
              timestamp: new Date(m.createdAt),
            },
          ]);
        }
        const nowMyTurn = msg.currentTurn === playerRole;
        setters.setIsMyTurn(nowMyTurn);
        setters.setIsOpponentTyping(!nowMyTurn);
        setters.setTurnCount(msg.messageCount);
        setters.setTimeLeft(ROUND_TIME);
      }

      if (msg.type === "turn_changed") {
        const nowMyTurn = msg.currentTurn === playerRole;
        setters.setIsMyTurn(nowMyTurn);
        setters.setIsOpponentTyping(!nowMyTurn);
        setters.setTimeLeft(ROUND_TIME);
      }

      if (msg.type === "debate_ended") {
        onDebateEndedRef.current();
      }

      if (msg.type === "error" && msg.code !== "NOT_YOUR_TURN") {
        console.error("WS error:", msg.message);
      }
    };

    ws.onclose = () => {
      wsRef.current = null;
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMultiplayer, currentDebateId, user?.id, playerRole]);

  return { wsRef };
}
