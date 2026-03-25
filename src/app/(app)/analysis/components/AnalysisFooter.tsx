"use client";

import { Button } from "@/components/ui/button";
import { Home, ArrowRight } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";

interface AnalysisFooterProps {
  onHome: () => void;
  onNewMatch: () => void;
}

export function AnalysisFooter({ onHome, onNewMatch }: AnalysisFooterProps) {
  const { t } = useTranslation();

  return (
    <footer className="fixed bottom-0 left-0 right-0 p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-center gap-4 shadow-2xl">
      <Button variant="outline" size="lg" onClick={onHome} className="min-w-[150px]">
        <Home className="mr-2 w-4 h-4" />
        {t.analysis.home}
      </Button>
      <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 min-w-[200px]" onClick={onNewMatch}>
        {t.analysis.newMatch} <ArrowRight className="ml-2 w-4 h-4" />
      </Button>
    </footer>
  );
}
