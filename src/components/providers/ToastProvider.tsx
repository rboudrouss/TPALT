"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { ToastContainer, ToastData } from "@/components/ui/toast";
import { ACHIEVEMENTS, GRAND_MAITRE } from "@/lib/achievements";

const ALL_ACHIEVEMENTS = [...ACHIEVEMENTS, GRAND_MAITRE];

interface ToastContextValue {
  checkAchievements: (userId: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToasts() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToasts must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const checkAchievements = useCallback((userId: string) => {
    fetch(`/api/users/${userId}/achievements`, { method: "POST" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.newlyUnlocked?.length) return;

        const newToasts: ToastData[] = data.newlyUnlocked.map(
          (achievementId: number, index: number) => {
            const def = ALL_ACHIEVEMENTS.find((a) => a.id === achievementId);
            return {
              id: `achievement-${achievementId}-${Date.now()}`,
              icon: def?.icon ?? "🏆",
              title: def?.name ?? "Succes debloque !",
              description: def?.description ?? "",
              _delay: index * 600,
            };
          }
        );

        // Stagger toast appearances
        newToasts.forEach((toast, i) => {
          setTimeout(() => {
            setToasts((prev) => [...prev, toast]);
          }, i * 600);
        });
      })
      .catch(() => {});
  }, []);

  return (
    <ToastContext.Provider value={{ checkAchievements }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}
