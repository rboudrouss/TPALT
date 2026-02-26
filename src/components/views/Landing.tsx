"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Gavel, Sparkles, Users } from "lucide-react";
import { useApp } from "@/lib/store";

export function Landing() {
  const { dispatch } = useApp();
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (username.length < 3) {
      setError("Le nom doit contenir au moins 3 caractères");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      if (!res.ok) {
        throw new Error("Erreur de connexion");
      }

      const user = await res.json();
      dispatch({ type: "SET_USER", payload: user });
      dispatch({ type: "SET_VIEW", payload: "dashboard" });
    } catch {
      setError("Erreur de connexion. Réessayez.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-black overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1920')",
        }}
      />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/80 to-transparent" />

      {/* Content */}
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
            Maîtrisez l&apos;art du débat. Affrontez des esprits affûtés, recevez
            une analyse IA de vos arguments et progressez vers l&apos;excellence
            oratoire.
          </p>
        </motion.div>

        {!showLogin ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              size="lg"
              onClick={() => setShowLogin(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-6 text-lg rounded-full font-semibold shadow-lg shadow-amber-900/20 group"
            >
              Entrer dans l&apos;arène
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-sm mx-auto bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20"
          >
            <h2 className="text-xl font-semibold text-white mb-4">
              Choisissez votre nom
            </h2>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Votre pseudonyme..."
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 mb-4"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
            <Button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-amber-600 hover:bg-amber-700"
            >
              {isLoading ? "Connexion..." : "Commencer"}
            </Button>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-4xl mx-auto"
        >
          <Feature
            icon={<Sparkles className="w-6 h-6 text-amber-400" />}
            title="Analyse IA"
            desc="Sophismes, biais cognitifs et qualité argumentative analysés en temps réel."
          />
          <Feature
            icon={<Users className="w-6 h-6 text-amber-400" />}
            title="Matchmaking Élo"
            desc="Affrontez des adversaires de votre niveau et grimpez les échelons."
          />
          <Feature
            icon={<Gavel className="w-6 h-6 text-amber-400" />}
            title="Sujets Variés"
            desc="Politique, philosophie, société... Des thèmes pour tous les goûts."
          />
        </motion.div>
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors backdrop-blur-sm">
      <div className="mb-4">{icon}</div>
      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

