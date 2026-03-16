"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { getRandomTopic } from "@/lib/topics";
import { useAntiCheat } from "./hooks/useAntiCheat";
import { useWebSocket } from "./hooks/useWebSocket";
import { useAIAssistant } from "./hooks/useAIAssistant";
import { Message, ROUND_TIME } from "./hooks/types";
import { DebateInfoSidebar } from "./components/DebateInfoSidebar";
import { CheatWarning } from "./components/CheatWarning";
import { ChatArea } from "./components/ChatArea";
import { RightSidebar } from "./components/RightSidebar";

export default function DebatePage() {
  const { state, dispatch } = useApp();
  const router = useRouter();
  const { gameMode, trainingDifficulty, currentDebateId, playerRole, user } = state;
  const isMultiplayer = gameMode === "casual" || gameMode === "ranked";

  useEffect(() => {
    if (!user) router.replace("/");
  }, [user, router]);

  // ── Core debate state ──────────────────────────────────────────────────────
  const [topic, setTopic] = useState(getRandomTopic);
  const [position, setPosition] = useState<"POUR" | "CONTRE">("POUR");
  const [opponentName, setOpponentName] = useState("Adversaire");
  const [messages, setMessages] = useState<Message[]>([
    { id: "0", sender: "system", content: "Connexion au débat...", timestamp: new Date() },
  ]);
  const [inputText, setInputText] = useState("");
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [isMyTurn, setIsMyTurn] = useState(!isMultiplayer);
  const [turnCount, setTurnCount] = useState(0);
  const [isOpponentTyping, setIsOpponentTyping] = useState(false);
  const [debateReady, setDebateReady] = useState(!isMultiplayer);

  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  // ── Sub-hooks ──────────────────────────────────────────────────────────────
  const { cheatCount, showCheatWarning } = useAntiCheat(gameMode);

  const { aiHint, liveEvaluation, isEvaluating, scores, runLiveEvaluation } = useAIAssistant({
    gameMode,
    isMyTurn,
    debateReady,
    topic,
    position,
    messagesRef,
    turnCount,
  });

  const handleEndDebateRef = useRef<(() => void) | null>(null);

  const { wsRef } = useWebSocket({
    isMultiplayer,
    currentDebateId,
    user,
    playerRole,
    setters: {
      setTopic,
      setPosition,
      setOpponentName,
      setMessages,
      setTurnCount,
      setIsMyTurn,
      setIsOpponentTyping,
      setDebateReady,
      setTimeLeft,
    },
    onDebateEnded: () => handleEndDebateRef.current?.(),
  });

  // ── Training: AI opponent response ─────────────────────────────────────────
  const fetchOpponentResponse = async () => {
    setIsOpponentTyping(true);
    const opponentPosition = position === "POUR" ? "CONTRE" : "POUR";
    const history = messagesRef.current
      .filter((m) => m.sender !== "system")
      .map((m) => ({ role: m.sender as "user" | "opponent", content: m.content }));

    try {
      const res = await fetch("/api/ai/opponent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          opponentPosition,
          userPosition: position,
          conversationHistory: history,
          difficulty: trainingDifficulty ?? "medium",
        }),
      });
      const data = await res.json();
      addMessage("opponent", data.reply || "Je maintiens ma position.");
    } catch {
      addMessage("opponent", "Je maintiens ma position. Votre argument ne me convainc pas.");
    } finally {
      setIsOpponentTyping(false);
      setIsMyTurn(true);
      setTimeLeft(ROUND_TIME);
    }
  };

  // ── Turn switch (training only) ────────────────────────────────────────────
  const handleTurnSwitch = () => {
    setTimeLeft(ROUND_TIME);
    setIsMyTurn((prev) => !prev);
    setTurnCount((prev) => prev + 1);
    if (isMyTurn && !isMultiplayer) {
      fetchOpponentResponse();
    }
  };

  // ── Timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!debateReady) return;
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isMyTurn) {
      if (isMultiplayer && currentDebateId && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "timeout", debateId: currentDebateId }));
      } else {
        handleTurnSwitch();
      }
    }
  }, [timeLeft, isMyTurn, debateReady]);

  // ── Scroll to bottom ───────────────────────────────────────────────────────
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const addMessage = (sender: "user" | "opponent" | "system", content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), sender, content, timestamp: new Date() },
    ]);
  };

  const handleSend = async () => {
    if (!inputText.trim() || !isMyTurn) return;
    const userMsg = inputText;
    setInputText("");

    if (isMultiplayer && currentDebateId && wsRef.current?.readyState === WebSocket.OPEN) {
      addMessage("user", userMsg);
      setIsOpponentTyping(true);
      setIsMyTurn(false);
      wsRef.current.send(
        JSON.stringify({ type: "message", debateId: currentDebateId, userId: user?.id, content: userMsg })
      );
      runLiveEvaluation(userMsg);
    } else {
      addMessage("user", userMsg);
      handleTurnSwitch();
      if (currentDebateId && user) {
        fetch(`/api/debates/${currentDebateId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ senderId: user.id, content: userMsg }),
        }).catch(() => console.error("Failed to persist message"));
      }
      runLiveEvaluation(userMsg);
    }
  };

  // ── End debate ─────────────────────────────────────────────────────────────
  const handleEndDebate = useCallback(async () => {
    wsRef.current?.close();
    wsRef.current = null;

    const analysisMessages = messagesRef.current
      .filter((m) => m.sender !== "system")
      .map((m) => ({
        sender: m.sender === "user" ? (user?.username ?? "Joueur") : opponentName,
        content: m.content,
      }));

    const fallbackAnalysis = {
      overallScore: 78,
      argumentQuality: 82,
      rhetoricStyle: 75,
      logicalCoherence: 85,
      factChecking: 70,
      sophisms: [{ name: "Ad Hominem", count: 1, context: "Tour 3" }],
      biases: [],
      strengths: ["Bonne structure argumentative"],
      weaknesses: ["Manque de sources"],
      topic,
    };

    if (currentDebateId) {
      try {
        const res = await fetch(`/api/debates/${currentDebateId}/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: analysisMessages, cheatCount }),
        });
        if (!res.ok) throw new Error(`Analyze failed: ${res.status}`);
        const analysis = await res.json();
        dispatch({ type: "SET_ANALYSIS", payload: { ...analysis, topic } });
      } catch {
        dispatch({ type: "SET_ANALYSIS", payload: fallbackAnalysis });
      }
    } else {
      dispatch({ type: "SET_ANALYSIS", payload: fallbackAnalysis });
    }

    router.push("/analysis");
  }, [currentDebateId, cheatCount, topic, user, opponentName, dispatch, router]);

  useEffect(() => {
    handleEndDebateRef.current = handleEndDebate;
  }, [handleEndDebate]);

  useEffect(() => {
    if (!isMultiplayer && turnCount >= 6) {
      handleEndDebate();
    }
  }, [turnCount, handleEndDebate, isMultiplayer]);

  // ── Render ─────────────────────────────────────────────────────────────────
  if (!user) return null;

  if (!debateReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <div className="animate-pulse text-slate-400">Connexion à l&apos;arène...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <DebateInfoSidebar
        topic={topic}
        position={position}
        timeLeft={timeLeft}
        turnCount={turnCount}
        gameMode={gameMode}
        trainingDifficulty={trainingDifficulty}
        isMultiplayer={isMultiplayer}
        opponentName={opponentName}
        isMyTurn={isMyTurn}
        onEndDebate={handleEndDebate}
      />

      <main className="flex-1 flex flex-col relative">
        <CheatWarning show={showCheatWarning} cheatCount={cheatCount} />
        <ChatArea
          messages={messages}
          isOpponentTyping={isOpponentTyping}
          inputText={inputText}
          isMyTurn={isMyTurn}
          scrollRef={scrollRef}
          onInputChange={setInputText}
          onSend={handleSend}
        />
      </main>

      <RightSidebar
        gameMode={gameMode}
        scores={scores}
        opponentName={opponentName}
        cheatCount={cheatCount}
        aiHint={aiHint}
        liveEvaluation={liveEvaluation}
        isEvaluating={isEvaluating}
      />
    </div>
  );
}
