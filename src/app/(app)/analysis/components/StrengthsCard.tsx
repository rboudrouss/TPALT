"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

interface StrengthsCardProps {
  strengths: string[];
}

export function StrengthsCard({ strengths }: StrengthsCardProps) {
  return (
    <Card className="border-emerald-100 bg-emerald-50/50 dark:bg-emerald-900/10 dark:border-emerald-900/30">
      <CardHeader>
        <CardTitle className="text-emerald-700 dark:text-emerald-400 flex items-center gap-2 text-lg">
          <CheckCircle className="w-5 h-5" />
          Points Forts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {strengths.map((s, i) => (
            <li key={i} className="text-sm text-emerald-900 dark:text-emerald-200 flex gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
              {s}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
