import { GoogleGenAI } from "@google/genai";

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
  const prompt = `Tu es un expert en rhétorique et en analyse de débats. Analyse le débat suivant et fournis une évaluation détaillée.

Sujet du débat: "${topic}"

Messages du débat:
${messages.map((m) => `${m.sender}: ${m.content}`).join("\n")}

Réponds en JSON valide avec cette structure exacte:
{
  "overallScore": <score global de 0 à 100>,
  "argumentQuality": <qualité des arguments de 0 à 100>,
  "rhetoricStyle": <style rhétorique de 0 à 100>,
  "logicalCoherence": <cohérence logique de 0 à 100>,
  "factChecking": <exactitude factuelle de 0 à 100>,
  "sophisms": [{"name": "<nom du sophisme>", "count": <nombre>, "context": "<contexte>"}],
  "biases": [{"name": "<nom du biais>", "context": "<contexte>"}],
  "strengths": ["<point fort 1>", "<point fort 2>"],
  "weaknesses": ["<point faible 1>", "<point faible 2>"],
  "player1Score": <score joueur 1 de 0 à 100>,
  "player2Score": <score joueur 2 de 0 à 100>
}

Réponds UNIQUEMENT avec le JSON, sans markdown ni texte supplémentaire.`;

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
  const prompt = `Tu es un coach de débat. Le sujet est: "${topic}". 
Le joueur défend la position: "${position}".

Derniers messages:
${lastMessages.map((m) => `${m.sender}: ${m.content}`).join("\n")}

Donne un conseil court et utile (max 2 phrases) pour aider le joueur à améliorer son prochain argument. Pas de markdown.`;

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
  const prompt = `Vérifie rapidement cette affirmation: "${claim}"
Réponds en 1-2 phrases courtes indiquant si c'est vrai, faux, ou partiellement vrai. Pas de markdown.`;

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

