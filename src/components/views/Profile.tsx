import React, { useState } from "react";
import { motion } from "motion/react";
import { Button } from "../ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { 
  ArrowLeft, 
  Trophy, 
  TrendingUp, 
  Target, 
  Brain,
  Award,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  BarChart3,
  Flame,
  Medal,
  ChevronRight
} from "lucide-react";
import { Badge } from "../../app/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../app/components/ui/tabs";
import { Progress } from "../../app/components/ui/progress";

interface ProfileProps {
  onBack: () => void;
  username: string;
}

// Mock data pour la démo
const mockUser = {
  username: "Orateur_42",
  elo: 1250,
  rank: "#247",
  joinDate: "15 janvier 2025",
  totalDebates: 47,
  wins: 28,
  losses: 19,
  winRate: 60,
  averageScore: 8.5,
  streak: 5,
  bestStreak: 12,
  totalArguments: 423,
  sophismsDetected: 34,
  level: 12,
  xp: 3450,
  xpToNext: 4000,
};

const mockBadges = [
  { id: 1, name: "Premier Débat", icon: "🎤", unlocked: true, date: "15 jan 2025" },
  { id: 2, name: "10 Victoires", icon: "🏆", unlocked: true, date: "22 jan 2025" },
  { id: 3, name: "Série de 5", icon: "🔥", unlocked: true, date: "05 fév 2025" },
  { id: 4, name: "Rhétoricien", icon: "📚", unlocked: true, date: "10 fév 2025" },
  { id: 5, name: "Sans Sophisme", icon: "✨", unlocked: false, date: null },
  { id: 6, name: "50 Débats", icon: "🎯", unlocked: false, date: null },
  { id: 7, name: "Top 100", icon: "👑", unlocked: false, date: null },
  { id: 8, name: "Maître Logique", icon: "🧠", unlocked: false, date: null },
];

const mockHistory = [
  {
    id: 1,
    opponent: "Philosophe_99",
    topic: "L'IA devrait-elle avoir des droits ?",
    position: "Pour",
    result: "win",
    score: 9.2,
    eloChange: +15,
    date: "16 fév 2026",
    mode: "Classé"
  },
  {
    id: 2,
    opponent: "Debater_007",
    topic: "La peine de mort est-elle justifiable ?",
    position: "Contre",
    result: "win",
    score: 8.8,
    eloChange: +12,
    date: "15 fév 2026",
    mode: "Classé"
  },
  {
    id: 3,
    opponent: "Rhetorician_X",
    topic: "Le vote devrait-il être obligatoire ?",
    position: "Pour",
    result: "loss",
    score: 7.1,
    eloChange: -18,
    date: "14 fév 2026",
    mode: "Casual"
  },
  {
    id: 4,
    opponent: "Logic_Master",
    topic: "Les réseaux sociaux nuisent à la démocratie",
    position: "Contre",
    result: "win",
    score: 9.0,
    eloChange: +14,
    date: "13 fév 2026",
    mode: "Classé"
  },
  {
    id: 5,
    opponent: "Argus_Prime",
    topic: "L'art contemporain a-t-il perdu son sens ?",
    position: "Pour",
    result: "win",
    score: 8.5,
    eloChange: +10,
    date: "12 fév 2026",
    mode: "Casual"
  },
];

const mockStats = {
  topicsDebated: 32,
  favoritePosition: "Pour (57%)",
  averageDebateTime: "2min 45s",
  mostDebatedTopic: "Politique",
  bestScore: 9.5,
  sophistryRate: 8, // % d'arguments contenant un sophisme
};

export function Profile({ onBack, username }: ProfileProps) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      {/* Header avec gradient */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516131206008-dd041a9764fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080')] opacity-10 bg-cover bg-center" />
        
        <div className="relative z-10 container mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="text-white hover:bg-white/10 mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-4xl font-bold shadow-xl">
                {mockUser.username.charAt(0)}
              </div>
              
              {/* User Info */}
              <div>
                <h1 className="text-3xl font-bold mb-2">{mockUser.username}</h1>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Trophy className="w-4 h-4" />
                    <span>Niveau {mockUser.level}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Inscrit le {mockUser.joinDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Elo & Rank */}
            <div className="flex gap-6">
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/20">
                <div className="text-3xl font-bold">{mockUser.elo}</div>
                <div className="text-sm opacity-90">Elo</div>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/20">
                <div className="text-3xl font-bold">{mockUser.rank}</div>
                <div className="text-sm opacity-90">Classement</div>
              </div>
            </div>
          </div>

          {/* Level Progress */}
          <div className="mt-6 max-w-md">
            <div className="flex justify-between text-sm mb-2">
              <span>Niveau {mockUser.level}</span>
              <span>{mockUser.xp} / {mockUser.xpToNext} XP</span>
            </div>
            <Progress value={(mockUser.xp / mockUser.xpToNext) * 100} className="h-2" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 -mt-8 relative z-20">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 mb-8 bg-white dark:bg-slate-900 shadow-lg">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
            <TabsTrigger value="achievements">Succès</TabsTrigger>
          </TabsList>

          {/* Vue d'ensemble */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats principales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard
                icon={<BarChart3 className="w-6 h-6 text-blue-500" />}
                label="Débats totaux"
                value={mockUser.totalDebates.toString()}
                trend="+3 cette semaine"
              />
              <StatCard
                icon={<Target className="w-6 h-6 text-green-500" />}
                label="Taux de victoire"
                value={`${mockUser.winRate}%`}
                trend={`${mockUser.wins}V - ${mockUser.losses}D`}
              />
              <StatCard
                icon={<Brain className="w-6 h-6 text-purple-500" />}
                label="Score moyen"
                value={`${mockUser.averageScore}/10`}
                trend="Excellent"
              />
              <StatCard
                icon={<Flame className="w-6 h-6 text-orange-500" />}
                label="Série actuelle"
                value={`${mockUser.streak} débats`}
                trend={`Record: ${mockUser.bestStreak}`}
              />
            </div>

            {/* Graphique de performance (mock) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Évolution de l'Elo (30 derniers jours)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end gap-2 justify-between">
                  {[1180, 1195, 1185, 1200, 1190, 1210, 1205, 1220, 1215, 1230, 1225, 1240, 1235, 1250].map((elo, i) => (
                    <div key={i} className="flex-1 bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t" style={{ height: `${((elo - 1150) / 150) * 100}%` }} title={`${elo}`} />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-4">
                  <span>Il y a 30 jours</span>
                  <span>Aujourd'hui</span>
                </div>
              </CardContent>
            </Card>

            {/* Statistiques détaillées */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Statistiques détaillées</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <DetailStat label="Sujets débattus" value={mockStats.topicsDebated} />
                  <DetailStat label="Position préférée" value={mockStats.favoritePosition} />
                  <DetailStat label="Temps moyen par débat" value={mockStats.averageDebateTime} />
                  <DetailStat label="Thème le plus débattu" value={mockStats.mostDebatedTopic} />
                  <DetailStat label="Meilleur score" value={mockStats.bestScore} />
                  <DetailStat 
                    label="Taux de sophismes" 
                    value={`${mockStats.sophistryRate}%`}
                    highlight={mockStats.sophistryRate < 10 ? "good" : "bad"}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Points forts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <StrengthBar label="Cohérence logique" value={88} color="blue" />
                  <StrengthBar label="Rhétorique" value={92} color="purple" />
                  <StrengthBar label="Culture générale" value={75} color="green" />
                  <StrengthBar label="Réfutation" value={85} color="orange" />
                  <StrengthBar label="Éloquence" value={90} color="pink" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Historique */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Historique des débats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockHistory.map((debate) => (
                    <DebateHistoryItem key={debate.id} debate={debate} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Succès */}
          <TabsContent value="achievements">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {mockBadges.map((badge) => (
                <BadgeCard key={badge.id} badge={badge} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, trend }: any) {
  return (
    <Card className="shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
            {icon}
          </div>
        </div>
        <div className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-1">{value}</div>
        <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">{label}</div>
        <div className="text-xs text-green-600 dark:text-green-400 font-medium">{trend}</div>
      </CardContent>
    </Card>
  );
}

function DetailStat({ label, value, highlight }: any) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-slate-600 dark:text-slate-400">{label}</span>
      <span className={`font-semibold ${
        highlight === "good" ? "text-green-600 dark:text-green-400" :
        highlight === "bad" ? "text-red-600 dark:text-red-400" :
        "text-slate-900 dark:text-slate-50"
      }`}>
        {value}
      </span>
    </div>
  );
}

function StrengthBar({ label, value, color }: any) {
  const colorClasses = {
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    green: "bg-green-500",
    orange: "bg-orange-500",
    pink: "bg-pink-500"
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-700 dark:text-slate-300">{label}</span>
        <span className="font-semibold text-slate-900 dark:text-slate-50">{value}%</span>
      </div>
      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div 
          className={`h-full ${colorClasses[color]} rounded-full transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function DebateHistoryItem({ debate }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors group cursor-pointer"
    >
      <div className="flex items-center gap-4 flex-1">
        {/* Result Icon */}
        <div className={`p-2 rounded-lg ${
          debate.result === "win" 
            ? "bg-green-100 dark:bg-green-900/30" 
            : "bg-red-100 dark:bg-red-900/30"
        }`}>
          {debate.result === "win" ? (
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          )}
        </div>

        {/* Debate Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-slate-900 dark:text-slate-50 truncate">
              {debate.topic}
            </h4>
            <Badge variant="outline" className="text-xs">
              {debate.mode}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
            <span>vs {debate.opponent}</span>
            <span>•</span>
            <span>{debate.position}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {debate.date}
            </span>
          </div>
        </div>

        {/* Score & Elo */}
        <div className="text-right hidden md:block">
          <div className="font-bold text-lg text-slate-900 dark:text-slate-50">{debate.score}/10</div>
          <div className={`text-sm font-semibold ${
            debate.eloChange > 0 
              ? "text-green-600 dark:text-green-400" 
              : "text-red-600 dark:text-red-400"
          }`}>
            {debate.eloChange > 0 ? "+" : ""}{debate.eloChange} Elo
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
      </div>
    </motion.div>
  );
}

function BadgeCard({ badge }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: badge.unlocked ? 1.05 : 1 }}
      className={`p-6 rounded-xl border ${
        badge.unlocked 
          ? "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800" 
          : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-50"
      } text-center`}
    >
      <div className={`text-5xl mb-3 ${badge.unlocked ? "" : "grayscale"}`}>
        {badge.icon}
      </div>
      <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-1">{badge.name}</h3>
      {badge.unlocked ? (
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Débloqué le {badge.date}
        </p>
      ) : (
        <p className="text-xs text-slate-500 dark:text-slate-500">Verrouillé</p>
      )}
    </motion.div>
  );
}
