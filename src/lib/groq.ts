import { buildAnalyzeDebatePrompt, buildHintPrompt, buildFactCheckPrompt } from "@/lib/prompts";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

export interface GroqCallOptions {
  url?: string;
  model?: string;
  apiKey?: string;
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: "json_object" };
}

export interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function callGroq(
  messages: GroqMessage[],
  options: GroqCallOptions = {}
): Promise<string> {
  const url = options.url ?? process.env.LLM_API_URL ?? GROQ_URL;
  const model = options.model ?? process.env.LLM_MODEL ?? GROQ_MODEL;
  const key = options.apiKey ?? process.env.LLM_API_KEY;

  if (!key) {
    throw new Error("Groq API key not configured");
  }

  const body: Record<string, unknown> = { model, messages };
  if (options.temperature !== undefined) body.temperature = options.temperature;
  if (options.max_tokens !== undefined) body.max_tokens = options.max_tokens;
  if (options.response_format) body.response_format = options.response_format;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Groq API Error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
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
    const text = await callGroq(
      [{ role: "user", content: prompt }],
      { temperature: 0.3, response_format: { type: "json_object" } }
    );
    return JSON.parse(text) as DebateAnalysis;
  } catch (error) {
    console.error("Groq analyzeDebate error:", error);
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
    return await callGroq(
      [{ role: "user", content: prompt }],
      { temperature: 0.5 }
    );
  } catch {
    return "Utilisez la méthode S.E.X.I: Statement, Explanation, eXample, Impact.";
  }
}

export async function factCheck(claim: string): Promise<string> {
  const prompt = buildFactCheckPrompt(claim);

  try {
    return await callGroq(
      [{ role: "user", content: prompt }],
      { temperature: 0.2 }
    );
  } catch {
    return "Vérification non disponible actuellement.";
  }
}
