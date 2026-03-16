"use client";

import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ScoreCardProps {
  score: number;
  scoreLabel: string;
}

export function ScoreCard({ score, scoreLabel }: ScoreCardProps) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="md:col-span-1"
    >
      <Card className="h-full bg-indigo-600 text-white border-none shadow-xl">
        <CardHeader>
          <CardTitle className="text-indigo-100">Score Global</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64">
          <div className="text-8xl font-bold tracking-tighter">{score}</div>
          <div className="text-indigo-200 mt-4 text-xl font-medium">{scoreLabel}</div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
