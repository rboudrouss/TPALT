import React from "react";
import { motion } from "motion/react";
import { Button } from "../ui/Button";
import { ArrowRight, Gavel, Sparkles } from "lucide-react";

interface LandingProps {
  onLogin: () => void;
  onConcept?: () => void;
}

export function Landing({ onLogin, onConcept }: LandingProps) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-black overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1708548172199-72f7796d4206?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaWJyYXJ5JTIwYm9va3MlMjBkYXJrJTIwYWNhZGVtaWF8ZW58MXx8fHwxNzcxMjU1NDg4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')" }}
      />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/80 to-transparent" />

      {/* Hero Content */}
      <div className="relative z-20 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-white/10 p-4 rounded-full backdrop-blur-sm border border-white/20">
              <Gavel className="w-12 h-12 text-amber-500" />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            RHETORICA
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
            Maîtrisez l'art du débat. Affrontez des esprits affûtés, recevez une analyse IA de vos arguments et progressez vers l'excellence oratoire.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button 
            size="lg" 
            onClick={onLogin}
            className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-6 text-lg rounded-full font-semibold shadow-lg shadow-amber-900/20 group transition-all"
          >
            Entrer dans l'arène
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            onClick={onConcept}
            className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-full font-semibold backdrop-blur-sm"
          >
            Découvrir le concept
          </Button>
        </motion.div>

        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-4xl mx-auto"
        >
            <Feature 
                icon={<Sparkles className="w-6 h-6 text-amber-400" />}
                title="IA Analyse"
                desc="Sophismes, biais cognitifs et qualité argumentative analysés en temps réel."
            />
            <Feature 
                icon={<Gavel className="w-6 h-6 text-amber-400" />}
                title="Matchmaking Élo"
                desc="Affrontez des adversaires de votre niveau et grimpez les échelons."
            />
            <Feature 
                icon={<div className="font-serif italic text-amber-400 text-xl">" "</div>}
                title="Sujets Variés"
                desc="Politique, philosophie, société... Des thèmes pour tous les goûts."
            />
        </motion.div>
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors backdrop-blur-sm">
            <div className="mb-4">{icon}</div>
            <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
        </div>
    )
}