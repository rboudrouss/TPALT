"use client";

import { useState, RefObject } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Message } from "./types";
import { useTranslation } from "@/lib/i18n/context";

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
  const { locale } = useTranslation();
  const [liveEvaluation, setLiveEvaluation] = useState<any>(null);
  const [scores, setScores] = useState({ A: 50, B: 50 });

  const isHintEnabled =
    (gameMode === "casual" || gameMode === "training") && isMyTurn && debateReady;

  const { data: aiHint = "" } = useQuery({
    queryKey: ["ai-hint", topic, position, locale, turnCount],
    queryFn: async () => {
      const res = await fetch("/api/ai/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          position,
          locale,
          messages: messagesRef.current.slice(-4).map((m) => ({
            sender: m.sender,
            content: m.content,
          })),
        }),
      });
      const data = await res.json();
      return (
        data.hint ||
        (locale === "en"
          ? "Structure your argument with a thesis and examples."
          : "Structurez votre argument avec une thèse et des exemples.")
      );
    },
    enabled: isHintEnabled,
    staleTime: Infinity,
    retry: false,
  });

  const { mutate: runLiveEvaluation, isPending: isEvaluating } = useMutation({
    mutationFn: async (userMsg: string) => {
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
        body: JSON.stringify({ debateContext, locale }),
      });
      if (!res.ok) throw new Error("Evaluation failed");
      return res.json();
    },
    onSuccess: (data) => {
      setLiveEvaluation(data);
      if (data.score_update) {
        const { player, new_score } = data.score_update;
        setScores((prev) => ({ ...prev, [player]: Math.max(0, Math.min(100, new_score)) }));
      }
    },
    onError: (e) => {
      console.error("Live evaluation failed:", e);
    },
  });

  return { aiHint, liveEvaluation, isEvaluating, scores, runLiveEvaluation };
}
