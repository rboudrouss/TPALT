import React, { useState, useEffect, useRef } from "react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Send, AlertTriangle, ShieldAlert, Clock, User, Bot, BrainCircuit } from "lucide-react";
import { cn } from "../../lib/utils";
import { motion } from "motion/react";

interface DebateArenaProps {
  mode: "training" | "casual" | "ranked";
  onFinish: (result: any) => void;
}

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
const ROUND_TIME = 60; // seconds

export function DebateArena({ mode, onFinish }: DebateArenaProps) {
  const [topic] = useState(TOPICS[Math.floor(Math.random() * TOPICS.length)]);
  const [messages, setMessages] = useState<Message[]>([
    { id: "0", sender: "system", content: "Le débat commence ! Vous avez la parole.", timestamp: new Date() },
  ]);
  const [inputText, setInputText] = useState("");
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [isMyTurn, setIsMyTurn] = useState(true);
  const [cheatCount, setCheatCount] = useState(0);
  const [showCheatWarning, setShowCheatWarning] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Anti-Cheat: Visibility Change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && mode === "ranked") {
        setCheatCount((prev) => prev + 1);
        setShowCheatWarning(true);
        setTimeout(() => setShowCheatWarning(false), 3000);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [mode]);

  // Timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Time's up for turn logic could go here
      handleTurnSwitch();
    }
  }, [timeLeft]);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleTurnSwitch = () => {
    setTimeLeft(ROUND_TIME);
    setIsMyTurn(!isMyTurn);
    if (isMyTurn) {
        // AI Turn Simulation
        setTimeout(() => {
            const aiResponses = [
                "C'est un point intéressant, mais avez-vous considéré l'aspect économique ?",
                "Je pense que votre argument repose sur une généralisation hâtive.",
                "En effet, mais les données historiques suggèrent le contraire.",
                "C'est un sophisme de la pente glissante. Restons sur les faits.",
            ];
            const response = aiResponses[Math.floor(Math.random() * aiResponses.length)];
            addMessage("opponent", response);
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

  const handleEndDebate = () => {
      onFinish({
          topic,
          messages,
          cheatCount,
          mode
      });
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Left Sidebar: Info */}
      <aside className="w-1/4 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold mb-6 text-slate-800 dark:text-slate-100">Informations</h2>
          
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Sujet</h3>
            <p className="text-lg font-medium text-slate-900 dark:text-white leading-relaxed">{topic}</p>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Position</h3>
            <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-sm font-bold">POUR</span>
            </div>
          </div>

          <div className="mb-8">
             <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Temps Restant</h3>
             <div className={cn("text-4xl font-mono font-bold", timeLeft < 10 ? "text-red-500" : "text-slate-900 dark:text-white")}>
                00:{timeLeft.toString().padStart(2, '0')}
             </div>
          </div>
        </div>

        <Button variant="outline" className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200" onClick={handleEndDebate}>
            Abandonner / Finir
        </Button>
      </aside>

      {/* Center: Chat */}
      <main className="flex-1 flex flex-col relative">
        {/* Anti-Cheat Warning */}
        {showCheatWarning && (
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-4 left-0 right-0 mx-auto w-max z-50 bg-red-600 text-white px-6 py-3 rounded-full flex items-center shadow-lg"
            >
                <ShieldAlert className="mr-2" />
                Attention : Focus perdu ! Cela pourrait affecter votre score.
            </motion.div>
        )}

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-slate-950/50" ref={scrollRef}>
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
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    )}
                </motion.div>
            ))}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <div className="relative">
                <textarea
                    className="w-full p-4 pr-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                    rows={3}
                    placeholder={isMyTurn ? "Votre argument..." : "Attendez votre tour..."}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value.slice(0, MAX_CHARS))}
                    disabled={!isMyTurn}
                    onKeyDown={(e) => {
                        if(e.key === 'Enter' && !e.shiftKey) {
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

      {/* Right Sidebar: AI Assistant (Casual Mode Only) or Status */}
      <aside className="w-1/5 bg-slate-100 dark:bg-slate-900/50 border-l border-slate-200 dark:border-slate-800 p-4">
        {mode === "casual" || mode === "training" ? (
            <div className="h-full flex flex-col">
                <div className="flex items-center gap-2 mb-4 text-indigo-600 dark:text-indigo-400">
                    <BrainCircuit className="w-5 h-5" />
                    <h3 className="font-semibold">Assistant IA</h3>
                </div>
                <div className="bg-white/50 dark:bg-slate-800/50 p-3 rounded-lg text-sm text-slate-600 dark:text-slate-300 mb-4 border border-indigo-100 dark:border-indigo-900/30">
                    <p className="mb-2">💡 <strong>Conseil :</strong> Essayez d'utiliser la méthode S.E.X.I (Statement, Explanation, eXample, Impact) pour structurer votre prochain argument.</p>
                </div>
                 <div className="bg-white/50 dark:bg-slate-800/50 p-3 rounded-lg text-sm text-slate-600 dark:text-slate-300 border border-indigo-100 dark:border-indigo-900/30">
                    <p>🔍 <strong>Fact check :</strong> L'adversaire a mentionné une date incorrecte. La Révolution française a commencé en 1789, pas 1798.</p>
                </div>
            </div>
        ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-50">
                <ShieldAlert className="w-12 h-12 mb-2 text-slate-400" />
                <p className="text-center text-sm text-slate-500">Mode Classé<br/>Assistant désactivé</p>
            </div>
        )}
      </aside>
    </div>
  );
}
