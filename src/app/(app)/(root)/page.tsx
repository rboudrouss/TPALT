"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import type { User } from "@/lib/store";
import { HeroSection } from "./components/HeroSection";
import { LoginForm } from "./components/LoginForm";
import { FeatureList } from "./components/FeatureList";

export default function Home() {
  const { state, dispatch } = useApp();
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (state.user) router.replace("/dashboard");
  }, [state.user, router]);

  const handleSuccess = (user: User) => {
    dispatch({ type: "SET_USER", payload: user });
    router.push("/dashboard");
  };

  if (state.user) return null;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-black overflow-hidden">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1920')" }}
      />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/80 to-transparent" />
      <div className="relative z-20 container mx-auto px-4 text-center">
        {!showLogin ? (
          <HeroSection onEnter={() => setShowLogin(true)} />
        ) : (
          <LoginForm onSuccess={handleSuccess} />
        )}
        <FeatureList />
      </div>
    </div>
  );
}
