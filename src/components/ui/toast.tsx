"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

export interface ToastData {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface ToastProps {
  toast: ToastData;
  onClose: () => void;
}

function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-xl min-w-[300px] max-w-[400px]"
    >
      <span className="text-2xl shrink-0">{toast.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-slate-900 dark:text-white text-sm">
          {toast.title}
        </div>
        <div className="text-slate-500 dark:text-slate-400 text-xs truncate">
          {toast.description}
        </div>
      </div>
      <button
        onClick={onClose}
        className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: ToastData[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      <AnimatePresence>
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onClose={() => onRemove(t.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}
