"use client";
import { motion } from "motion/react";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Swords, Trophy } from "lucide-react";

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
}

function GameModeCard({ title, description, icon, onClick, delay }: GameModeCardProps) {
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
          <Button className="w-full" variant="outline">Jouer</Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

const GAME_MODES: { mode: GameMode; title: string; description: string; icon: React.ReactNode; delay: number }[] = [
  {
    mode: "training",
    title: "Entraînement",
    description: "Perfectionnez vos arguments contre une IA adaptative sans pression.",
    icon: <Bot className="h-10 w-10 text-emerald-500" />,
    delay: 0.1,
  },
  {
    mode: "casual",
    title: "Casual",
    description: "Débats amicaux. Sujet imposé, position libre. Idéal pour s'échauffer.",
    icon: <Swords className="h-10 w-10 text-amber-500" />,
    delay: 0.2,
  },
  {
    mode: "ranked",
    title: "Classé",
    description: "La compétition pure. Sujet et position imposés. Grimpez le classement Elo.",
    icon: <Trophy className="h-10 w-10 text-indigo-500" />,
    delay: 0.3,
  },
];

export function GameModeGrid({ onSelectMode }: GameModeGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {GAME_MODES.map(({ mode, title, description, icon, delay }) => (
        <GameModeCard
          key={mode}
          title={title}
          description={description}
          icon={icon}
          onClick={() => onSelectMode(mode)}
          delay={delay}
        />
      ))}
    </div>
  );
}
