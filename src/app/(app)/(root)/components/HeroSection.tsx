"use client";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Gavel } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";

interface HeroSectionProps {
  onEnter: () => void;
}

export function HeroSection({ onEnter }: HeroSectionProps) {
  const { t } = useTranslation();

  return (
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
      <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">{t.landing.title}</h1>
      <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
        {t.landing.tagline}
      </p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8"
      >
        <Button
          size="lg"
          onClick={onEnter}
          className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-6 text-lg rounded-full font-semibold shadow-lg shadow-amber-900/20 group"
        >
          {t.landing.enterArena}
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </motion.div>
    </motion.div>
  );
}
