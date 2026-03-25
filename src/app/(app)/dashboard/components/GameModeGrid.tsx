"use client";
import { motion } from "motion/react";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Swords, Trophy } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";

type GameMode = "training" | "casual" | "ranked";

interface GameModeGridProps {
  onSelectMode: (mode: GameMode) => void;
}

interface GameModeCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  delay: number;
  playLabel: string;
}

function GameModeCard({ title, description, icon, onClick, delay, playLabel }: GameModeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -5 }}
    >
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer" onClick={onClick}>
        <CardHeader>
          <div className="mb-4">{icon}</div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button className="w-full" variant="outline">{playLabel}</Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

export function GameModeGrid({ onSelectMode }: GameModeGridProps) {
  const { t } = useTranslation();

  const modes: { mode: GameMode; icon: React.ReactNode; delay: number }[] = [
    { mode: "training", icon: <Bot className="h-10 w-10 text-emerald-500" />, delay: 0.1 },
    { mode: "casual", icon: <Swords className="h-10 w-10 text-amber-500" />, delay: 0.2 },
    { mode: "ranked", icon: <Trophy className="h-10 w-10 text-indigo-500" />, delay: 0.3 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {modes.map(({ mode, icon, delay }) => (
        <GameModeCard
          key={mode}
          title={t.dashboard.gameModes[mode].title}
          description={t.dashboard.gameModes[mode].desc}
          icon={icon}
          onClick={() => onSelectMode(mode)}
          delay={delay}
          playLabel={t.common.play}
        />
      ))}
    </div>
  );
}
