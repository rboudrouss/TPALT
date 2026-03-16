"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import type { DebateRecord } from "../hooks/useProfile";
import { formatRelativeDate } from "../hooks/useProfile";

const modeLabels: Record<string, string> = {
  training: "Training",
  casual: "Casual",
  ranked: "Classé",
};

interface DebateHistoryItemProps {
  debate: DebateRecord;
  userId: string;
}

function DebateHistoryItem({ debate: d, userId }: DebateHistoryItemProps) {
  const isPlayer1 = d.player1Id === userId;
  const opponent = isPlayer1 ? d.player2 : d.player1;
  const opponentName = opponent?.username ?? "IA_Coach";
  const userScore = isPlayer1 ? d.analysis?.player1Score : d.analysis?.player2Score;
  const result: "win" | "loss" | "draw" =
    d.winnerId === userId ? "win" : d.winnerId ? "loss" : "draw";

  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
      <div className="flex items-center gap-4">
        <div
          className={`p-2 rounded-lg ${
            result === "win"
              ? "bg-green-100 dark:bg-green-900/30"
              : result === "loss"
              ? "bg-red-100 dark:bg-red-900/30"
              : "bg-slate-100 dark:bg-slate-700"
          }`}
        >
          {result === "win" ? (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          ) : result === "loss" ? (
            <XCircle className="w-5 h-5 text-red-600" />
          ) : (
            <Clock className="w-5 h-5 text-slate-500" />
          )}
        </div>
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white">{d.topic}</h4>
          <div className="text-sm text-slate-500 flex items-center gap-2">
            vs {opponentName}{" "}
            <Badge variant="outline">{modeLabels[d.mode] ?? d.mode}</Badge>
            <Clock className="w-3 h-3" /> {formatRelativeDate(d.createdAt)}
          </div>
        </div>
      </div>
      <div className="text-right">
        {userScore != null ? (
          <div className="font-bold">{userScore}/100</div>
        ) : (
          <div className="text-slate-400 text-sm">N/A</div>
        )}
      </div>
    </div>
  );
}

interface HistoryTabProps {
  debates: DebateRecord[];
  userId: string;
  loading: boolean;
}

export default function HistoryTab({ debates, userId, loading }: HistoryTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique des débats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <p className="text-center text-slate-500 py-8">Chargement...</p>
        ) : debates.length === 0 ? (
          <p className="text-center text-slate-500 py-8">Aucun débat pour l'instant.</p>
        ) : (
          debates.map((d) => (
            <DebateHistoryItem key={d.id} debate={d} userId={userId} />
          ))
        )}
      </CardContent>
    </Card>
  );
}
