"use client";

import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";

interface SkillBreakdownProps {
  argumentQuality: number;
  rhetoricStyle: number;
  logicalCoherence: number;
  factChecking: number;
}

function SkillBar({ label, percentage, color }: { label: string; percentage: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
        <span className="text-sm font-medium text-slate-900 dark:text-white">{percentage}%</span>
      </div>
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: 0.5 }}
          className={`h-2.5 rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

export function SkillBreakdown({ argumentQuality, rhetoricStyle, logicalCoherence, factChecking }: SkillBreakdownProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-500" />
          {t.analysis.evaluationCriteria}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <SkillBar label={t.analysis.argumentQuality} percentage={argumentQuality} color="bg-emerald-500" />
        <SkillBar label={t.analysis.rhetoricStyle} percentage={rhetoricStyle} color="bg-blue-500" />
        <SkillBar label={t.analysis.logicalCoherence} percentage={logicalCoherence} color="bg-violet-500" />
        <SkillBar label={t.analysis.factChecking} percentage={factChecking} color="bg-amber-500" />
      </CardContent>
    </Card>
  );
}
