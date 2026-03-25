"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ScoreCard } from "@/app/(app)/analysis/components/ScoreCard";
import { SkillBreakdown } from "@/app/(app)/analysis/components/SkillBreakdown";
import { SophismsCard } from "@/app/(app)/analysis/components/SophismsCard";
import { StrengthsCard } from "@/app/(app)/analysis/components/StrengthsCard";
import { useTranslation } from "@/lib/i18n/context";

interface ReplayAnalysisProps {
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

function safeParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

export function ReplayAnalysis({ analysis }: ReplayAnalysisProps) {
  const { t } = useTranslation();

  if (!analysis) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-slate-500">
          {t.analysis.unavailable}
        </CardContent>
      </Card>
    );
  }

  const scoreLabel =
    analysis.overallScore >= 80
      ? t.analysis.excellent
      : analysis.overallScore >= 60
        ? t.analysis.good
        : t.analysis.needsWork;

  const sophisms = safeParse<{ name: string; count: number; context: string }[]>(
    analysis.sophisms,
    []
  );
  const strengths = safeParse<string[]>(analysis.strengths, []);

  return (
    <div className="space-y-6">
      <ScoreCard score={analysis.overallScore} scoreLabel={scoreLabel} />
      <SkillBreakdown
        argumentQuality={analysis.argumentQuality}
        rhetoricStyle={analysis.rhetoricStyle}
        logicalCoherence={analysis.logicalCoherence}
        factChecking={analysis.factChecking}
      />
      <div className="grid grid-cols-1 gap-6">
        <SophismsCard sophisms={sophisms} />
        <StrengthsCard strengths={strengths} />
      </div>
    </div>
  );
}
