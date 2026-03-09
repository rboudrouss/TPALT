import { GoogleGenAI } from "@google/genai";
import { buildAnalyzeDebatePrompt, buildHintPrompt, buildFactCheckPrompt } from "@/lib/prompts";

let aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiInstance;
}

export interface DebateAnalysis {
  overallScore: number;
  argumentQuality: number;
  rhetoricStyle: number;
  logicalCoherence: number;
  factChecking: number;
  sophisms: { name: string; count: number; context: string }[];
  biases: { name: string; context: string }[];
  strengths: string[];
  weaknesses: string[];
  player1Score: number;
  player2Score: number;
}

export async function analyzeDebate(
  topic: string,
  messages: { sender: string; content: string }[]
): Promise<DebateAnalysis> {
  const prompt = buildAnalyzeDebatePrompt(topic, messages);

  try {
    const ai = getAI();
    if (!ai) {
      throw new Error("Gemini API key not configured");
    }
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const text = response.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response");
    }
    return JSON.parse(jsonMatch[0]) as DebateAnalysis;
  } catch (error) {
    console.error("Gemini API error:", error);
    // Return mock data if API fails
    return {
      overallScore: 75,
      argumentQuality: 80,
      rhetoricStyle: 70,
      logicalCoherence: 85,
      factChecking: 65,
      sophisms: [
        { name: "Ad Hominem", count: 1, context: "Attaque personnelle détectée" },
      ],
      biases: [{ name: "Biais de confirmation", context: "Recherche sélective d'arguments" }],
      strengths: ["Bonne structuration des arguments", "Usage pertinent d'exemples"],
      weaknesses: ["Manque de sources factuelles", "Quelques généralisations hâtives"],
      player1Score: 78,
      player2Score: 72,
    };
  }
}

export async function getAIHint(
  topic: string,
  position: string,
  lastMessages: { sender: string; content: string }[]
): Promise<string> {
  const prompt = buildHintPrompt(topic, position, lastMessages);

  try {
    const ai = getAI();
    if (!ai) {
      throw new Error("Gemini API key not configured");
    }
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });
    return response.text || "Structurez votre argument avec une thèse claire et des exemples concrets.";
  } catch {
    return "Utilisez la méthode S.E.X.I: Statement, Explanation, eXample, Impact.";
  }
}

export async function factCheck(claim: string): Promise<string> {
  const prompt = buildFactCheckPrompt(claim);

  try {
    const ai = getAI();
    if (!ai) {
      throw new Error("Gemini API key not configured");
    }
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });
    return response.text || "Vérification non disponible.";
  } catch {
    return "Vérification non disponible actuellement.";
  }
}

