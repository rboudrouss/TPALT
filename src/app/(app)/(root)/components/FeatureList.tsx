"use client";
import { motion } from "motion/react";
import { Gavel, Sparkles, Users } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors backdrop-blur-sm">
      <div className="mb-4">{icon}</div>
      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

export function FeatureList() {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 1 }}
      className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-4xl mx-auto"
    >
      <Feature
        icon={<Sparkles className="w-6 h-6 text-amber-400" />}
        title={t.landing.features.ai.title}
        desc={t.landing.features.ai.desc}
      />
      <Feature
        icon={<Users className="w-6 h-6 text-amber-400" />}
        title={t.landing.features.matchmaking.title}
        desc={t.landing.features.matchmaking.desc}
      />
      <Feature
        icon={<Gavel className="w-6 h-6 text-amber-400" />}
        title={t.landing.features.topics.title}
        desc={t.landing.features.topics.desc}
      />
    </motion.div>
  );
}
