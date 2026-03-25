"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/lib/store";
import { useTranslation } from "@/lib/i18n/context";
import { ReplayTranscript } from "./components/ReplayTranscript";
import { ReplayAnalysis } from "./components/ReplayAnalysis";

interface DebateData {
  id: string;
  topic: string;
  mode: string;
  status: string;
  player1Id: string;
  player2Id: string | null;
  player1Position: string | null;
  player2Position: string | null;
  winnerId: string | null;
  createdAt: string;
  player1: { id: string; username: string };
  player2: { id: string; username: string } | null;
  messages: {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
    sender: { id: string; username: string };
  }[];
  analysis: {
    overallScore: number;
    argumentQuality: number;
    rhetoricStyle: number;
    logicalCoherence: number;
    factChecking: number;
    sophisms: string;
    biases: string;
    strengths: string;
    weaknesses: string;
    player1Score: number | null;
    player2Score: number | null;
  } | null;
}

export default function ReplayPage() {
  const { state } = useApp();
  const router = useRouter();
  const { t } = useTranslation();
  const params = useParams();
  const debateId = params.id as string;

  const [debate, setDebate] = useState<DebateData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!state.user) router.replace("/");
  }, [state.user, router]);

  useEffect(() => {
    if (!debateId) return;
    fetch(`/api/debates/${debateId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setDebate(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [debateId]);

  if (!state.user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <p className="text-slate-500 animate-pulse">{t.common.loading}</p>
      </div>
    );
  }

  if (!debate) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-4">
        <p className="text-slate-500">{t.replay.notFound}</p>
        <Button variant="outline" onClick={() => router.push("/profile")}>
          {t.replay.backToProfile}
        </Button>
      </div>
    );
  }

  const isPlayer1 = debate.player1Id === state.user.id;
  const myPosition = isPlayer1 ? debate.player1Position : debate.player2Position;
  const opponent = isPlayer1 ? debate.player2 : debate.player1;
  const opponentName = opponent?.username ?? "IA Coach";
  const isWinner = debate.winnerId === state.user.id;
  const isDraw = !debate.winnerId;

  const positionLabel = myPosition === "POUR" ? t.common.for : myPosition === "CONTRE" ? t.common.against : myPosition;
  const resultLabel = isDraw ? t.common.draw : isWinner ? t.common.victory : t.common.defeat;

  const transcriptMessages = debate.messages.map((m) => ({
    id: m.id,
    sender: (m.senderId === state.user!.id ? "user" : "opponent") as "user" | "opponent",
    senderName:
      m.senderId === state.user!.id
        ? state.user!.username
        : opponentName,
    content: m.content,
    timestamp: new Date(m.createdAt),
  }));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/profile")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {debate.topic}
              </h1>
              <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
                <Badge variant="outline">{t.common.modeLabels[debate.mode as keyof typeof t.common.modeLabels] ?? debate.mode}</Badge>
                {myPosition && (
                  <Badge
                    className={
                      myPosition === "POUR"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }
                  >
                    {positionLabel}
                  </Badge>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(debate.createdAt).toLocaleDateString(t.dateLocale, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <span>vs {opponentName}</span>
                {debate.status === "finished" && (
                  <Badge
                    className={
                      isDraw
                        ? "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                        : isWinner
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }
                  >
                    {resultLabel}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6 p-8">
        <div className="lg:col-span-3">
          <ReplayTranscript messages={transcriptMessages} />
        </div>
        <div className="lg:col-span-2">
          <ReplayAnalysis analysis={debate.analysis} />
        </div>
      </main>
    </div>
  );
}
