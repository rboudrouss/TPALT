"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/hooks/useApp";

export function useLogout() {
  const { dispatch } = useApp();
  const router = useRouter();

  return useCallback(() => {
    dispatch({ type: "LOGOUT" });
    router.push("/");
  }, [dispatch, router]);
}
