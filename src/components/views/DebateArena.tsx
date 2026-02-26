"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Send, ShieldAlert, Clock, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useApp } from "@/lib/store";

interface Message {
  id: string;
  sender: "user" | "opponent" | "system";
  content: string;
  timestamp: Date;
}

const TOPICS = [
  "L'intelligence artificielle est-elle une menace pour la créativité humaine ?",
  "Faut-il abolir la propriété privée ?",
  "La colonisation de Mars est-elle une priorité ?",
  "Le vote devrait-il être obligatoire ?",
];

const MAX_CHARS = 500;
const ROUND_TIME = 90;

export function DebateArena() {
  const { state, dispatch } = useApp();
  const { gameMode } = state;

  const [topic] = useState(TOPICS[Math.floor(Math.random() * TOPICS.length)]);
  const [position] = useState(Math.random() > 0.5 ? "POUR" : "CONTRE");
  const [messages, setMessages] = useState<Message[]>([
    { id: "0", sender: "system", content: "Le débat commence ! Vous avez la parole.", timestamp: new Date() },
  ]);
  const [inputText, setInputText] = useState("");
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [isMyTurn, setIsMyTurn] = useState(true);
  const [turnCount, setTurnCount] = useState(0);
  const [cheatCount, setCheatCount] = useState(0);
  const [showCheatWarning, setShowCheatWarning] = useState(false);
  const [aiHint, setAiHint] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Anti-Cheat: Visibility Change
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

  // Timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isMyTurn) {
      handleTurnSwitch();
    }
  }, [timeLeft, isMyTurn]);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Fetch AI hint for casual/training
  useEffect(() => {
    if ((gameMode === "casual" || gameMode === "training") && isMyTurn) {
      fetchAIHint();
    }
  }, [isMyTurn, gameMode]);

  const fetchAIHint = async () => {
    try {
      const res = await fetch("/api/ai/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          position,
          messages: messages.slice(-4).map((m) => ({
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

  const handleTurnSwitch = () => {
    setTimeLeft(ROUND_TIME);
    setIsMyTurn(!isMyTurn);
    setTurnCount((prev) => prev + 1);

    if (isMyTurn) {
      // AI response simulation
      setTimeout(() => {
        const aiResponses = [
          "C'est un point intéressant, mais avez-vous considéré l'aspect économique ?",
          "Je pense que votre argument repose sur une généralisation hâtive.",
          "En effet, mais les données historiques suggèrent le contraire.",
          "C'est un sophisme de la pente glissante. Restons sur les faits.",
          "Votre argument manque de sources concrètes pour être convaincant.",
        ];
        addMessage("opponent", aiResponses[Math.floor(Math.random() * aiResponses.length)]);
        setIsMyTurn(true);
        setTimeLeft(ROUND_TIME);
      }, 3000);
    }
  };

  const addMessage = (sender: "user" | "opponent" | "system", content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), sender, content, timestamp: new Date() },
    ]);
  };

  const handleSend = () => {
    if (!inputText.trim() || !isMyTurn) return;
    addMessage("user", inputText);
    setInputText("");
    handleTurnSwitch();
  };

  const handleEndDebate = async () => {
    // Analyze the debate
    if (state.currentDebateId) {
      try {
        const res = await fetch(`/api/debates/${state.currentDebateId}/analyze`, {
          method: "POST",
        });
        const analysis = await res.json();
        dispatch({ type: "SET_ANALYSIS", payload: { ...analysis, topic } });
      } catch {
        // Mock analysis if API fails
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
    dispatch({ type: "SET_VIEW", payload: "analysis" });
  };

  // End debate after 6 turns
  useEffect(() => {
    if (turnCount >= 6) {
      handleEndDebate();
    }
  }, [turnCount]);

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
        </div>

        <Button variant="destructive" onClick={handleEndDebate}>
          Terminer le débat
        </Button>
      </aside>

      {/* Center: Chat - Continuation */}
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
        </div>

        {/* Input */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="relative">
            <textarea
              className="w-full p-4 pr-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none text-slate-900 dark:text-white"
              rows={3}
              placeholder={isMyTurn ? "Votre argument..." : "Attendez votre tour..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value.slice(0, MAX_CHARS))}
              disabled={!isMyTurn}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <span className={cn("text-xs", inputText.length > MAX_CHARS * 0.9 ? "text-red-500" : "text-slate-400")}>
                {inputText.length}/{MAX_CHARS}
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

      {/* Right Sidebar: AI Assistant */}
      <aside className="w-1/5 bg-slate-100 dark:bg-slate-900/50 border-l border-slate-200 dark:border-slate-800 p-4">
        {gameMode === "casual" || gameMode === "training" ? (
          <div className="h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4 text-indigo-600 dark:text-indigo-400">
              <BrainCircuit className="w-5 h-5" />
              <h3 className="font-semibold">Assistant IA</h3>
            </div>
            <div className="bg-white/50 dark:bg-slate-800/50 p-3 rounded-lg text-sm text-slate-600 dark:text-slate-300 border border-indigo-100 dark:border-indigo-900/30">
              <p>💡 <strong>Conseil :</strong> {aiHint || "Chargement..."}</p>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-50">
            <ShieldAlert className="w-12 h-12 mb-2 text-slate-400" />
            <p className="text-center text-sm text-slate-500">Mode Classé<br />Assistant désactivé</p>
          </div>
        )}
      </aside>
    </div>
  );
}

