"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Zap, Sword, Brain } from "lucide-react";
import { TrainingDifficulty } from "@/hooks/useApp";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/context";

const DIFFICULTY_META: {
  value: TrainingDifficulty;
  icon: React.ReactNode;
  color: string;
  border: string;
  selectedBg: string;
}[] = [
  {
    value: "easy",
    icon: <Zap className="w-6 h-6" />,
    color: "text-emerald-400",
    border: "border-emerald-700",
    selectedBg: "bg-emerald-900/40",
  },
  {
    value: "medium",
    icon: <Sword className="w-6 h-6" />,
    color: "text-amber-400",
    border: "border-amber-700",
    selectedBg: "bg-amber-900/40",
  },
  {
    value: "hard",
    icon: <Brain className="w-6 h-6" />,
    color: "text-red-400",
    border: "border-red-700",
    selectedBg: "bg-red-900/40",
  },
];

interface DifficultySelectorProps {
  onStart: (difficulty: TrainingDifficulty) => void;
  onCancel: () => void;
}

export function DifficultySelector({ onStart, onCancel }: DifficultySelectorProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<TrainingDifficulty>("medium");
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <h2 className="text-3xl font-bold text-center mb-2">{t.matchmaking.trainingMode}</h2>
        <p className="text-slate-400 text-center mb-8">
          {t.matchmaking.chooseDifficulty}
        </p>

        <div className="space-y-3 mb-8">
          {DIFFICULTY_META.map((d) => (
            <button
              key={d.value}
              onClick={() => setSelectedDifficulty(d.value)}
              className={cn(
                "w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4",
                selectedDifficulty === d.value
                  ? `${d.border} ${d.selectedBg}`
                  : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
              )}
            >
              <span className={cn("shrink-0", d.color)}>{d.icon}</span>
              <div>
                <p className={cn("font-bold text-base", d.color)}>
                  {t.common.difficultyLabels[d.value]}
                </p>
                <p className="text-sm text-slate-400">
                  {t.matchmaking.difficultyDescs[d.value]}
                </p>
              </div>
              {selectedDifficulty === d.value && (
                <span className={cn("ml-auto text-xs font-bold px-2 py-1 rounded-full border", d.color, d.border)}>
                  {t.matchmaking.selected}
                </span>
              )}
            </button>
          ))}
        </div>

        <Button
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 text-base"
          onClick={() => onStart(selectedDifficulty)}
        >
          {t.matchmaking.startTraining}
        </Button>
        <Button
          variant="ghost"
          onClick={onCancel}
          className="w-full mt-3 text-slate-400 hover:text-white"
        >
          {t.common.cancel}
        </Button>
      </motion.div>
    </div>
  );
}
