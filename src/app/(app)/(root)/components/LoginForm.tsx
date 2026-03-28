"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { User } from "@/hooks/useApp";
import { useTranslation } from "@/lib/i18n/context";

interface LoginFormProps {
  onSuccess: (user: User) => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (username.length < 3) {
      setError(t.landing.nameMinLength);
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
      if (!res.ok) throw new Error("Connection error");
      const user = await res.json();
      onSuccess(user);
    } catch {
      setError(t.landing.connectionError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-sm mx-auto bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20"
    >
      <h2 className="text-xl font-semibold text-white mb-4">{t.landing.chooseName}</h2>
      <Input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder={t.landing.placeholder}
        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 mb-4"
        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
      />
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      <Button onClick={handleLogin} disabled={isLoading} className="w-full bg-amber-600 hover:bg-amber-700">
        {isLoading ? t.landing.connecting : t.landing.start}
      </Button>
    </motion.div>
  );
}
