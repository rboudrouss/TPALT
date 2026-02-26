"use client";

import { useReducer, ReactNode, useEffect } from "react";
import { AppContext, appReducer, initialState, User } from "@/lib/store";

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Restore user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("rhetorica_user");
    if (savedUser) {
      try {
        const user: User = JSON.parse(savedUser);
        dispatch({ type: "SET_USER", payload: user });
        dispatch({ type: "SET_VIEW", payload: "dashboard" });
      } catch {
        localStorage.removeItem("rhetorica_user");
      }
    }
  }, []);

  // Save user to localStorage when it changes
  useEffect(() => {
    if (state.user) {
      localStorage.setItem("rhetorica_user", JSON.stringify(state.user));
    } else {
      localStorage.removeItem("rhetorica_user");
    }
  }, [state.user]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

