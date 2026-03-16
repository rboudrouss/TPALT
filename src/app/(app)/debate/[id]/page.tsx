"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Send, ShieldAlert, Clock, BrainCircuit, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useApp } from "@/lib/store";
import { getRandomTopic } from "@/lib/topics";
import { MAX_PLAYER_CHARS } from "@/lib/prompts";

const DIFFICULTY_LABELS: Record<string, { label: string; color: string }> = {
  easy: { label: "Débutant", color: "text-emerald-400" },
  medium: { label: "Intermédiaire", color: "text-amber-400" },
  hard: { label: "Expert", color: "text-red-400" },
};

interface Message {
  id: string;
  sender: "user" | "opponent" | "system";
  content: string;
  timestamp: Date;
}

const ROUND_TIME = 90;

const EVENT_TYPE_LABELS: Record<string, string> = {
  claim: "Affirmation",
  evidence: "Preuve",
  nuance: "Nuance",
  counter_argument: "Contre-argument",
  sophism: "Sophisme",
  ad_hominem: "Ad Hominem",
  irrelevance: "Hors-sujet",
  repetition: "Répétition",
  wrong_side: "Mauvais camp ⚠️",
};

export default function DebatePage() {
  const { state, dispatch } = useApp();
  const router = useRouter();
  const { gameMode, trainingDifficulty, currentDebateId, playerRole, user } = state;
  const isMultiplayer = gameMode === "casual" || gameMode === "ranked";

  useEffect(() => {
    if (!user) router.replace("/");
  }, [user, router]);

  // ── Shared state ──────────────────────────────────────────────────────────
  const [topic, setTopic] = useState(getRandomTopic);
  const [position, setPosition] = useState<"POUR" | "CONTRE">("POUR");
  const [opponentName, setOpponentName] = useState("Adversaire");
  const [messages, setMessages] = useState<Message[]>([
    { id: "0", sender: "system", content: "Connexion au débat...", timestamp: new Date() },
  ]);
  const [inputText, setInputText] = useState("");
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [isMyTurn, setIsMyTurn] = useState(!isMultiplayer); // multiplayer: wait for server
  const [turnCount, setTurnCount] = useState(0);
  const [cheatCount, setCheatCount] = useState(0);
  const [showCheatWarning, setShowCheatWarning] = useState(false);
  const [aiHint, setAiHint] = useState("");
  const [liveEvaluation, setLiveEvaluation] = useState<any>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isOpponentTyping, setIsOpponentTyping] = useState(false);
  const [scores, setScores] = useState({ A: 50, B: 50 });
  const [debateReady, setDebateReady] = useState(!isMultiplayer);

  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const wsRef = useRef<WebSocket | null>(null);
  const handleEndDebateRef = useRef<(() => void) | null>(null);

  // ── Multiplayer: WebSocket connection ────────────────────────────────────
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
        // Load debate metadata — debateReady is set only by debate_ready event
        const debate = msg.debate;
        setTopic(debate.topic);
        const myPos = playerRole === "player1" ? debate.player1Position : debate.player2Position;
        setPosition(myPos ?? "POUR");
        const opponent = playerRole === "player1" ? debate.player2 : debate.player1;
        if (opponent) setOpponentName(opponent.username);

        if (debate.messages && debate.messages.length > 0) {
          const loaded: Message[] = debate.messages.map((m: any) => ({
            id: m.id,
            sender: m.senderId === user.id ? "user" : "opponent",
            content: m.content,
            timestamp: new Date(m.createdAt),
          }));
          setMessages([
            { id: "0", sender: "system", content: "Connexion au débat...", timestamp: new Date() },
            ...loaded,
          ]);
          setTurnCount(debate.messages.length);
        }
      }

      if (msg.type === "debate_ready") {
        const isFirst = msg.currentTurn === playerRole;
        setIsMyTurn(isFirst);
        setIsOpponentTyping(!isFirst);
        setDebateReady(true);
        setMessages((prev) => {
          // Replace initial "Connexion..." message
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
        setTimeLeft(ROUND_TIME);
      }

      if (msg.type === "new_message") {
        const m = msg.message;
        const isMyMsg = m.senderId === user.id;

        if (!isMyMsg) {
          // Opponent's message arrived
          setIsOpponentTyping(false);
          setMessages((prev) => [
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
        setIsMyTurn(nowMyTurn);
        setIsOpponentTyping(!nowMyTurn);
        setTurnCount(msg.messageCount);
        setTimeLeft(ROUND_TIME);
      }

      if (msg.type === "turn_changed") {
        const nowMyTurn = msg.currentTurn === playerRole;
        setIsMyTurn(nowMyTurn);
        setIsOpponentTyping(!nowMyTurn);
        setTimeLeft(ROUND_TIME);
      }

      if (msg.type === "debate_ended") {
        handleEndDebateRef.current?.();
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

  // ── Anti-Cheat: Visibility Change ─────────────────────────────────────────
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && gameMode === "ranked") {
        setCheatCount((prev) => prev + 1);
        setShowCheatWarning(true);
        setTimeout(() => setShowCheatWarning(false), 3000);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [gameMode]);

  // ── Timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!debateReady) return;
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isMyTurn) {
      if (isMultiplayer && currentDebateId && wsRef.current?.readyState === WebSocket.OPEN) {
        // Notify server that this player's turn timed out
        wsRef.current.send(JSON.stringify({ type: "timeout", debateId: currentDebateId }));
      } else {
        handleTurnSwitch();
      }
    }
  }, [timeLeft, isMyTurn, debateReady]);

  // ── Scroll to bottom ──────────────────────────────────────────────────────
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // ── Fetch AI hint (training & casual) ────────────────────────────────────
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

  // ── Training only: turn switch ────────────────────────────────────────────
  const handleTurnSwitch = () => {
    setTimeLeft(ROUND_TIME);
    setIsMyTurn((prev) => !prev);
    setTurnCount((prev) => prev + 1);

    if (isMyTurn && !isMultiplayer) {
      fetchOpponentResponse();
    }
  };

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
      // Optimistically add message locally
      addMessage("user", userMsg);
      setIsOpponentTyping(true);
      setIsMyTurn(false);

      // Send via WebSocket — server will persist, flip turn, and broadcast
      wsRef.current.send(
        JSON.stringify({ type: "message", debateId: currentDebateId, userId: user?.id, content: userMsg })
      );

      // Live evaluation (fire-and-forget)
      runLiveEvaluation(userMsg);
    } else {
      // Training mode: local flow
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
        context_history: (() => {
          const nonSystem = messagesRef.current.filter((m) => m.sender !== "system");
          return nonSystem.slice(-4).map((m) => ({
            player: m.sender === "user" ? "A" : "B",
            message: m.content,
          }));
        })(),
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
          const clamped = Math.max(0, Math.min(100, new_score));
          setScores((prev) => ({ ...prev, [player]: clamped }));
        }
      }
    } catch (e) {
      console.error("Live evaluation failed:", e);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleEndDebate = useCallback(async () => {
    wsRef.current?.close();
    wsRef.current = null;

    const analysisMessages = messagesRef.current
      .filter((m) => m.sender !== "system")
      .map((m) => ({
        sender: m.sender === "user" ? (user?.username ?? "Joueur") : opponentName,
        content: m.content,
      }));

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
        dispatch({
          type: "SET_ANALYSIS",
          payload: {
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
          },
        });
      }
    } else {
      dispatch({
        type: "SET_ANALYSIS",
        payload: {
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
        },
      });
    }
    router.push("/analysis");
  }, [currentDebateId, cheatCount, topic, user, opponentName, dispatch, router]);

  // Keep ref up to date so the WS onmessage closure always calls the latest version
  useEffect(() => {
    handleEndDebateRef.current = handleEndDebate;
  }, [handleEndDebate]);

  // End debate after 6 turns (training mode — multiplayer is handled by WS event)
  useEffect(() => {
    if (!isMultiplayer && turnCount >= 6) {
      handleEndDebate();
    }
  }, [turnCount, handleEndDebate, isMultiplayer]);

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
      {/* Left Sidebar */}
      <aside className="w-1/4 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold mb-6 text-slate-800 dark:text-slate-100">Informations</h2>

          <div className="mb-8">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Sujet</h3>
            <p className="text-lg font-medium text-slate-900 dark:text-white leading-relaxed">{topic}</p>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Position</h3>
            <span className={cn(
              "px-3 py-1 rounded-full text-sm font-bold",
              position === "POUR" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
            )}>
              {position}
            </span>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
              <Clock className="inline w-4 h-4 mr-1" />
              Temps Restant
            </h3>
            <div className={cn(
              "text-4xl font-mono font-bold",
              timeLeft < 15 ? "text-red-500" : "text-slate-900 dark:text-white"
            )}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Tour</h3>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{turnCount + 1}/6</div>
          </div>

          {gameMode === "training" && trainingDifficulty && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Difficulté IA</h3>
              <span className={cn("font-bold text-sm", DIFFICULTY_LABELS[trainingDifficulty]?.color)}>
                {DIFFICULTY_LABELS[trainingDifficulty]?.label}
              </span>
            </div>
          )}

          {isMultiplayer && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Adversaire</h3>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <User className="w-4 h-4" />
                <span className="font-medium">{opponentName}</span>
              </div>
            </div>
          )}

          {isMultiplayer && (
            <div className="mb-4">
              <div className={cn(
                "text-xs font-semibold px-3 py-1.5 rounded-full text-center",
                isMyTurn
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                  : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
              )}>
                {isMyTurn ? "Votre tour" : `Tour de ${opponentName}`}
              </div>
            </div>
          )}
        </div>

        <Button variant="destructive" onClick={handleEndDebate}>
          Terminer le débat
        </Button>
      </aside>

      {/* Center: Chat */}
      <main className="flex-1 flex flex-col relative">
        {showCheatWarning && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 left-0 right-0 mx-auto w-max z-50 bg-red-600 text-white px-6 py-3 rounded-full flex items-center shadow-lg"
          >
            <ShieldAlert className="mr-2" />
            Attention : Focus perdu ! ({cheatCount})
          </motion.div>
        )}

        <div
          className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-slate-950/50"
          ref={scrollRef}
        >
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex w-full",
                msg.sender === "user" ? "justify-end" : "justify-start",
                msg.sender === "system" && "justify-center"
              )}
            >
              {msg.sender === "system" ? (
                <span className="text-xs text-slate-400 bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded-full">
                  {msg.content}
                </span>
              ) : (
                <div className={cn(
                  "max-w-[70%] rounded-2xl p-4 shadow-sm",
                  msg.sender === "user"
                    ? "bg-indigo-600 text-white rounded-br-none"
                    : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-none"
                )}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <span className="text-[10px] opacity-70 mt-2 block text-right">
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              )}
            </motion.div>
          ))}

          {isOpponentTyping && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-1.5">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </motion.div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="relative">
            <textarea
              className="w-full p-4 pr-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none text-slate-900 dark:text-white"
              rows={3}
              placeholder={isMyTurn ? "Votre argument..." : "Attendez votre tour..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value.slice(0, MAX_PLAYER_CHARS))}
              disabled={!isMyTurn}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <span className={cn("text-xs", inputText.length > MAX_PLAYER_CHARS * 0.9 ? "text-red-500" : "text-slate-400")}>
                {inputText.length}/{MAX_PLAYER_CHARS}
              </span>
              <Button
                size="icon"
                className={cn("rounded-full h-8 w-8", isMyTurn ? "bg-indigo-600 hover:bg-indigo-700" : "bg-slate-400")}
                onClick={handleSend}
                disabled={!isMyTurn}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="w-1/5 bg-slate-100 dark:bg-slate-900/50 border-l border-slate-200 dark:border-slate-800 p-4 overflow-y-auto">
        {gameMode === "ranked" ? (
          // Ranked: show live scores instead of AI assistant
          <div className="h-full flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="font-semibold">Mode Classé</h3>
            </div>
            <div className="bg-white/50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-500">Vous</span>
                <span className="font-bold text-indigo-600">{scores.A}</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-indigo-500 h-2 rounded-full transition-all"
                  style={{ width: `${scores.A}%` }}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-500">{opponentName}</span>
                <span className="font-bold text-slate-500">{scores.B}</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-slate-400 h-2 rounded-full transition-all"
                  style={{ width: `${scores.B}%` }}
                />
              </div>
            </div>
            {cheatCount > 0 && (
              <div className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-200 dark:border-red-800">
                ⚠️ {cheatCount} infraction{cheatCount > 1 ? "s" : ""} détectée{cheatCount > 1 ? "s" : ""}
                {cheatCount >= 3 && " — pénalité appliquée"}
              </div>
            )}
          </div>
        ) : (
          // Training / Casual: AI assistant + live evaluation
          <div className="h-full flex flex-col gap-4">
            <div>
              <div className="flex items-center gap-2 mb-4 text-indigo-600 dark:text-indigo-400">
                <BrainCircuit className="w-5 h-5" />
                <h3 className="font-semibold">Assistant IA</h3>
              </div>
              <div className="bg-white/50 dark:bg-slate-800/50 p-3 rounded-lg text-sm text-slate-600 dark:text-slate-300 border border-indigo-100 dark:border-indigo-900/30">
                <p>💡 <strong>Conseil :</strong> {aiHint || "Chargement..."}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="font-semibold">Analyse du dernier coup</h3>
              </div>

              <div className="bg-white/50 dark:bg-slate-800/50 p-3 rounded-lg text-sm border border-slate-200 dark:border-slate-700 min-h-[150px]">
                {isEvaluating ? (
                  <div className="animate-pulse text-slate-400 flex items-center justify-center h-full text-xs italic">
                    Analyse de l&apos;argument...
                  </div>
                ) : liveEvaluation?.evaluation_summary ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-900 p-2 rounded">
                      <span className="text-xs uppercase font-medium text-slate-500">Qualité</span>
                      <span className={cn(
                        "font-bold capitalize",
                        liveEvaluation.evaluation_summary.move_quality === "brilliant" ? "text-purple-600" :
                        liveEvaluation.evaluation_summary.move_quality === "excellent" ? "text-green-600" :
                        liveEvaluation.evaluation_summary.move_quality === "blunder" ? "text-red-600" : "text-blue-600"
                      )}>
                        {liveEvaluation.evaluation_summary.move_quality}
                      </span>
                    </div>

                    <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-900 p-2 rounded">
                      <span className="text-xs uppercase font-medium text-slate-500">Score Delta</span>
                      <span className={cn(
                        "font-bold",
                        liveEvaluation.score_update?.delta > 0 ? "text-green-600" : "text-red-500"
                      )}>
                        {liveEvaluation.score_update?.delta > 0 ? "+" : ""}{liveEvaluation.score_update?.delta ?? 0}
                      </span>
                    </div>

                    {liveEvaluation.events && liveEvaluation.events.length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs font-semibold text-slate-500 mb-1 block">Événements Détectés :</span>
                        <ul className="space-y-1">
                          {liveEvaluation.events.map((ev: any, idx: number) => (
                            <li key={idx} className="text-xs p-1.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 flex justify-between items-start">
                              <div>
                                <span className={cn(
                                  "font-bold block mb-0.5",
                                  ev.type === "sophism" || ev.type === "ad_hominem" || ev.type === "wrong_side"
                                    ? "text-red-500"
                                    : "text-indigo-500"
                                )}>
                                  {EVENT_TYPE_LABELS[ev.type] ?? ev.type}
                                </span>
                                <span className="text-slate-600 dark:text-slate-300">{ev.description}</span>
                              </div>
                              <span className={cn(
                                "ml-2 px-1.5 py-0.5 rounded-full text-[10px] whitespace-nowrap capitalize",
                                ev.severity === "high" ? "bg-red-100 text-red-600" :
                                ev.severity === "medium" ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" :
                                "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-300"
                              )}>{ev.severity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-slate-400 flex items-center justify-center h-full text-xs italic">
                    Envoyez un argument pour voir l&apos;analyse.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
