"use client";

import { RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { MAX_PLAYER_CHARS } from "@/lib/prompts";

interface Message {
  id: string;
  sender: "user" | "opponent" | "system";
  content: string;
  timestamp: Date;
}

interface ChatAreaProps {
  messages: Message[];
  isOpponentTyping: boolean;
  inputText: string;
  isMyTurn: boolean;
  scrollRef: RefObject<HTMLDivElement | null>;
  onInputChange: (value: string) => void;
  onSend: () => void;
}

export function ChatArea({
  messages,
  isOpponentTyping,
  inputText,
  isMyTurn,
  scrollRef,
  onInputChange,
  onSend,
}: ChatAreaProps) {
  return (
    <>
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

      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="relative">
          <textarea
            className="w-full p-4 pr-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none text-slate-900 dark:text-white"
            rows={3}
            placeholder={isMyTurn ? "Votre argument..." : "Attendez votre tour..."}
            value={inputText}
            onChange={(e) => onInputChange(e.target.value.slice(0, MAX_PLAYER_CHARS))}
            disabled={!isMyTurn}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
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
              onClick={onSend}
              disabled={!isMyTurn}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
