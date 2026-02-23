import React from "react";
import { motion } from "motion/react";
import { Button } from "../ui/Button";
import { 
  ArrowLeft, 
  Brain, 
  Shield, 
  Target, 
  Sparkles, 
  Gavel, 
  Trophy, 
  BookOpen, 
  Users,
  Zap,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

interface ConceptProps {
  onBack: () => void;
  onGetStarted: () => void;
}

export function Concept({ onBack, onGetStarted }: ConceptProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900 text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080')] opacity-10 bg-cover bg-center" />
        
        <div className="relative z-10 container mx-auto px-4 py-20">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="text-white hover:bg-white/10 mb-8"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-amber-500/20 p-3 rounded-full border border-amber-500/30">
                <Gavel className="w-8 h-8 text-amber-400" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                RHETORICA
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">
              La première plateforme de débat compétitif avec analyse IA en temps réel de vos performances oratoires.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        
        {/* Concept Principal */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-slate-50">
            Le Concept
          </h2>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong className="text-slate-900 dark:text-slate-50">RHETORICA</strong> est bien plus qu'une plateforme de débat. 
              C'est un terrain d'entraînement intellectuel où chaque affrontement verbal devient une opportunité de progression. 
              Grâce à notre IA avancée, chaque argument est décortiqué, analysé et évalué selon des critères rhétoriques précis.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-4">
              Que vous soyez étudiant préparant un concours d'éloquence, passionné de philosophie ou simplement 
              curieux d'améliorer vos capacités argumentatives, RHETORICA vous offre un environnement stimulant 
              et bienveillant pour affûter votre pensée critique.
            </p>
          </div>
        </motion.section>

        {/* Comment ça marche */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold mb-8 text-slate-900 dark:text-slate-50">
            Comment ça marche ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StepCard 
              number="1"
              icon={<Target className="w-8 h-8 text-emerald-500" />}
              title="Choisissez votre mode"
              description="Entraînement avec IA, Casual avec sujet imposé, ou Classé pour la compétition pure."
            />
            <StepCard 
              number="2"
              icon={<Zap className="w-8 h-8 text-amber-500" />}
              title="Débattez en temps réel"
              description="3 minutes pour construire vos meilleurs arguments. Pas de pause, pas de recherche."
            />
            <StepCard 
              number="3"
              icon={<Sparkles className="w-8 h-8 text-indigo-500" />}
              title="Recevez votre analyse"
              description="L'IA évalue vos sophismes, biais cognitifs, qualité argumentative et véracité des faits."
            />
          </div>
        </motion.section>

        {/* Les 3 Modes de Jeu */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold mb-8 text-slate-900 dark:text-slate-50">
            Les Modes de Jeu
          </h2>
          <div className="space-y-6">
            <ModeCard
              icon={<BookOpen className="w-10 h-10 text-emerald-500" />}
              title="Entraînement"
              badge="Sans pression"
              description="Perfectionnez vos techniques rhétoriques face à une IA adaptative qui s'ajuste à votre niveau. Pas de classement, juste de la progression."
              features={[
                "IA qui s'adapte à votre niveau",
                "Feedback détaillé après chaque argument",
                "Aucun impact sur votre Elo"
              ]}
              color="emerald"
            />
            <ModeCard
              icon={<Users className="w-10 h-10 text-amber-500" />}
              title="Casual"
              badge="Humain vs Humain"
              description="Affrontez un joueur réel sur un sujet imposé, mais choisissez librement votre position (pour ou contre). Idéal pour découvrir de nouveaux adversaires."
              features={[
                "Matchmaking basé sur votre Elo",
                "Sujet imposé, position libre",
                "Variation Elo modérée"
              ]}
              color="amber"
            />
            <ModeCard
              icon={<Trophy className="w-10 h-10 text-indigo-500" />}
              title="Classé"
              badge="Compétitif"
              description="Le défi ultime : sujet ET position imposés. Défendez des idées qui ne sont pas toujours les vôtres. Montrez votre maîtrise rhétorique pure."
              features={[
                "Position assignée aléatoirement",
                "Elo à fort enjeu",
                "Classements et saisons"
              ]}
              color="indigo"
            />
          </div>
        </motion.section>

        {/* Analyse IA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-16 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 p-8 rounded-2xl border border-indigo-100 dark:border-indigo-900"
        >
          <div className="flex items-center gap-3 mb-6">
            <Brain className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              L'Analyse IA
            </h2>
          </div>
          <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
            Notre moteur d'analyse ne se contente pas de compter les mots. Il évalue la solidité 
            logique de vos arguments, détecte les sophismes, identifie les biais cognitifs et 
            vérifie même la véracité de vos affirmations factuelles.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnalysisFeature 
              icon={<CheckCircle2 className="w-5 h-5 text-green-500" />}
              title="Qualité Argumentative"
              description="Cohérence, pertinence, profondeur"
            />
            <AnalysisFeature 
              icon={<AlertTriangle className="w-5 h-5 text-orange-500" />}
              title="Détection de Sophismes"
              description="Ad hominem, faux dilemmes, pente glissante..."
            />
            <AnalysisFeature 
              icon={<Brain className="w-5 h-5 text-purple-500" />}
              title="Biais Cognitifs"
              description="Biais de confirmation, ancrage, disponibilité..."
            />
            <AnalysisFeature 
              icon={<Shield className="w-5 h-5 text-blue-500" />}
              title="Fact-Checking"
              description="Vérification des affirmations factuelles"
            />
          </div>
        </motion.section>

        {/* Anti-Triche */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-16"
        >
          <div className="bg-red-50 dark:bg-red-950/30 p-8 rounded-2xl border border-red-100 dark:border-red-900">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                Système Anti-Triche
              </h2>
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Pour garantir l'équité, RHETORICA surveille les changements d'onglet pendant les débats classés. 
              Toute tentative de recherche externe est détectée et sanctionnée. Le vrai débat se fait avec 
              vos connaissances, pas avec Google.
            </p>
          </div>
        </motion.section>

        {/* Public Cible */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold mb-8 text-slate-900 dark:text-slate-50">
            Pour Qui ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TargetCard 
              title="Étudiants"
              description="Préparez vos concours d'éloquence, Sciences Po, ou simplement développez votre esprit critique."
            />
            <TargetCard 
              title="Passionnés de Rhétorique"
              description="Affinez vos techniques argumentatives et découvrez les subtilités de l'art oratoire."
            />
            <TargetCard 
              title="Débatteurs Compétitifs"
              description="Entraînez-vous face à des adversaires de haut niveau et progressez dans le classement."
            />
          </div>
        </motion.section>

        {/* CTA Final */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-12 text-white"
        >
          <h2 className="text-3xl font-bold mb-4">Prêt à affûter votre rhétorique ?</h2>
          <p className="text-lg mb-8 opacity-90">
            Rejoignez une communauté de penseurs critiques et devenez un maître de l'argumentation.
          </p>
          <Button 
            size="lg"
            onClick={onGetStarted}
            className="bg-white text-amber-600 hover:bg-gray-100 px-8 py-6 text-lg rounded-full font-semibold shadow-lg"
          >
            Commencer maintenant
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

function StepCard({ number, icon, title, description }: any) {
  return (
    <div className="relative bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="absolute -top-4 -left-4 bg-amber-500 text-white font-bold text-xl w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
        {number}
      </div>
      <div className="mb-4 mt-2">{icon}</div>
      <h3 className="font-semibold text-lg mb-2 text-slate-900 dark:text-slate-50">{title}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}

function ModeCard({ icon, title, badge, description, features, color }: any) {
  const colorClasses = {
    emerald: "border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20",
    amber: "border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20",
    indigo: "border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20"
  };

  return (
    <div className={`p-6 rounded-xl border ${colorClasses[color]}`}>
      <div className="flex items-start gap-4 mb-4">
        <div>{icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-bold text-xl text-slate-900 dark:text-slate-50">{title}</h3>
            <span className="text-xs px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
              {badge}
            </span>
          </div>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{description}</p>
        </div>
      </div>
      <ul className="space-y-2 ml-14">
        {features.map((feature: string, i: number) => (
          <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}

function AnalysisFeature({ icon, title, description }: any) {
  return (
    <div className="flex items-start gap-3 bg-white/50 dark:bg-slate-900/50 p-4 rounded-lg">
      <div className="mt-0.5">{icon}</div>
      <div>
        <h4 className="font-semibold text-slate-900 dark:text-slate-50 mb-1">{title}</h4>
        <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
      </div>
    </div>
  );
}

function TargetCard({ title, description }: any) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="font-bold text-lg mb-3 text-slate-900 dark:text-slate-50">{title}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}
