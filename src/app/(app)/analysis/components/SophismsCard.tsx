"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface Sophism {
  name: string;
  count: number;
  context: string;
}

interface SophismsCardProps {
  sophisms: Sophism[];
}

export function SophismsCard({ sophisms }: SophismsCardProps) {
  return (
    <Card className="border-red-100 bg-red-50/50 dark:bg-red-900/10 dark:border-red-900/30">
      <CardHeader>
        <CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-2 text-lg">
          <AlertTriangle className="w-5 h-5" />
          Sophismes Détectés
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {sophisms.length > 0 ? (
            sophisms.map((f, i) => (
              <li
                key={i}
                className="text-sm text-red-900 dark:text-red-200 bg-white dark:bg-red-950/30 p-3 rounded border border-red-100 dark:border-red-900/20"
              >
                <span className="font-bold block">{f.name} (x{f.count})</span>
                <span className="opacity-80 text-xs">{f.context}</span>
              </li>
            ))
          ) : (
            <li className="text-sm text-emerald-700">Aucun sophisme détecté !</li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}
