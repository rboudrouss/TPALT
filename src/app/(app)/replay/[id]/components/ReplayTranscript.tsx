"use client";

import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/context";

interface ReplayMessage {
  id: string;
  sender: "user" | "opponent";
  senderName: string;
  content: string;
  timestamp: Date;
}

interface ReplayTranscriptProps {
  messages: ReplayMessage[];
}

export function ReplayTranscript({ messages }: ReplayTranscriptProps) {
  const { t } = useTranslation();

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-500" />
          {t.replay.transcript}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-center text-slate-500 py-8">{t.replay.noMessages}</p>
        ) : (
          messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "flex w-full",
                msg.sender === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div className={cn("max-w-[80%]")}>
                <div
                  className={cn(
                    "text-xs font-medium mb-1",
                    msg.sender === "user"
                      ? "text-right text-indigo-600 dark:text-indigo-400"
                      : "text-left text-slate-500"
                  )}
                >
                  {msg.senderName}
                </div>
                <div
                  className={cn(
                    "rounded-2xl p-4 shadow-sm",
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white rounded-br-none"
                      : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-none"
                  )}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <span className="text-[10px] opacity-70 mt-2 block text-right">
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
