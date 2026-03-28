"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/hooks/useApp";

export function useForceLogin() {
  const { state } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!state.user) router.replace("/");
  }, [state.user, router]);

  return state.user;
}
