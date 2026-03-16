"use client";

import { useState, useEffect, RefObject } from "react";
import { Message } from "./types";

interface UseAIAssistantParams {
  gameMode: string | null | undefined;
  isMyTurn: boolean;
  debateReady: boolean;
  topic: string;
  position: "POUR" | "CONTRE";
  messagesRef: RefObject<Message[]>;
  turnCount: number;
}

export function useAIAssistant({
  gameMode,
  isMyTurn,
  debateReady,
  topic,
  position,
  messagesRef,
  turnCount,
}: UseAIAssistantParams) {
  const [aiHint, setAiHint] = useState("");
  const [liveEvaluation, setLiveEvaluation] = useState<any>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [scores, setScores] = useState({ A: 50, B: 50 });

  useEffect(() => {
    if ((gameMode === "casual" || gameMode === "training") && isMyTurn && debateReady) {
      fetchAIHint();
    }
  }, [isMyTurn, gameMode, debateReady]);

  const fetchAIHint = async () => {
    try {
      const res = await fetch("/api/ai/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          position,
          messages: messagesRef.current.slice(-4).map((m) => ({
            sender: m.sender,
            content: m.content,
          })),
        }),
      });
      const data = await res.json();
      setAiHint(data.hint || "");
    } catch {
      setAiHint("Structurez votre argument avec une thèse et des exemples.");
    }
  };

  const runLiveEvaluation = async (userMsg: string) => {
    setIsEvaluating(true);
    setLiveEvaluation(null);
    try {
      const debateContext = {
        debate_meta: {
          topic,
          stance_A: position === "POUR" ? "POUR" : "CONTRE",
          stance_B: position === "POUR" ? "CONTRE" : "POUR",
          round_limit: 6,
          scoring_mode: "live",
        },
        current_state: {
          round_number: turnCount + 1,
          scores: { A: scores.A, B: scores.B },
          momentum: "neutral",
        },
        context_history: messagesRef.current
          .filter((m) => m.sender !== "system")
          .slice(-4)
          .map((m) => ({ player: m.sender === "user" ? "A" : "B", message: m.content })),
        message_to_evaluate: { player: "A", message: userMsg },
      };

      const res = await fetch("/api/ai/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ debateContext }),
      });

      if (res.ok) {
        const data = await res.json();
        setLiveEvaluation(data);
        if (data.score_update) {
          const { player, new_score } = data.score_update;
          setScores((prev) => ({ ...prev, [player]: Math.max(0, Math.min(100, new_score)) }));
        }
      }
    } catch (e) {
      console.error("Live evaluation failed:", e);
    } finally {
      setIsEvaluating(false);
    }
  };

  return { aiHint, liveEvaluation, isEvaluating, scores, runLiveEvaluation };
}
