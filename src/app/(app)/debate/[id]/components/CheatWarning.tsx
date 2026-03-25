"use client";

import { ShieldAlert } from "lucide-react";
import { motion } from "motion/react";
import { useTranslation, fmt } from "@/lib/i18n/context";

interface CheatWarningProps {
  show: boolean;
  cheatCount: number;
}

export function CheatWarning({ show, cheatCount }: CheatWarningProps) {
  const { t } = useTranslation();

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-4 left-0 right-0 mx-auto w-max z-50 bg-red-600 text-white px-6 py-3 rounded-full flex items-center shadow-lg"
    >
      <ShieldAlert className="mr-2" />
      {fmt(t.debate.cheatWarning, { count: cheatCount })}
    </motion.div>
  );
}
