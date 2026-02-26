"use client";

import { createContext, useContext } from "react";

export interface User {
  id: string;
  username: string;
  elo: number;
  level: number;
  xp: number;
  wins: number;
  losses: number;
}

export interface AppState {
  user: User | null;
  currentView: "landing" | "dashboard" | "matchmaking" | "debate" | "analysis" | "profile";
  gameMode: "training" | "casual" | "ranked" | null;
  currentDebateId: string | null;
  analysisData: AnalysisData | null;
}

export interface AnalysisData {
  overallScore: number;
  argumentQuality: number;
  rhetoricStyle: number;
  logicalCoherence: number;
  factChecking: number;
  sophisms: { name: string; count: number; context: string }[];
  biases: { name: string; context: string }[];
  strengths: string[];
  weaknesses: string[];
  player1Score?: number;
  player2Score?: number;
  topic?: string;
}

export type AppAction =
  | { type: "SET_USER"; payload: User | null }
  | { type: "SET_VIEW"; payload: AppState["currentView"] }
  | { type: "SET_GAME_MODE"; payload: AppState["gameMode"] }
  | { type: "SET_DEBATE_ID"; payload: string | null }
  | { type: "SET_ANALYSIS"; payload: AnalysisData | null }
  | { type: "LOGOUT" };

export const initialState: AppState = {
  user: null,
  currentView: "landing",
  gameMode: null,
  currentDebateId: null,
  analysisData: null,
};

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };
    case "SET_VIEW":
      return { ...state, currentView: action.payload };
    case "SET_GAME_MODE":
      return { ...state, gameMode: action.payload };
    case "SET_DEBATE_ID":
      return { ...state, currentDebateId: action.payload };
    case "SET_ANALYSIS":
      return { ...state, analysisData: action.payload };
    case "LOGOUT":
      return { ...initialState };
    default:
      return state;
  }
}

export const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}

