import { buildAnalyzeDebatePrompt, buildHintPrompt, buildFactCheckPrompt } from "@/lib/prompts";
import type { Locale } from "./i18n/types";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

function isAIDisabled(): boolean {
  if (process.env.DISABLE_IA === "true") return true;
  if (process.env.DISABLE_IA === "false") return false;
  return !process.env.LLM_API_KEY;
}

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
  if (isAIDisabled()) {
    console.warn("[callGroq] AI disabled — returning stub");
    const stub = options.response_format?.type === "json_object"
      ? '{"stub":true}'
      : "AI response disabled (stub mode).";
    return stub;
  }

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

export const STUB_ANALYSIS: DebateAnalysis = {
  overallScore: 75,
  argumentQuality: 80,
  rhetoricStyle: 70,
  logicalCoherence: 85,
  factChecking: 65,
  sophisms: [{ name: "Ad Hominem", count: 1, context: "Personal attack detected" }],
  biases: [{ name: "Confirmation bias", context: "Selective argument search" }],
  strengths: ["Good argument structure", "Relevant use of examples"],
  weaknesses: ["Lack of factual sources", "Some hasty generalizations"],
  player1Score: 78,
  player2Score: 72,
};

function clampScore(v: unknown): number {
  const n = Number(v);
  if (isNaN(n)) return 50;
  if (n >= 0 && n <= 10) return Math.round(n * 10);
  return Math.max(0, Math.min(100, Math.round(n)));
}

function validateAnalysis(raw: unknown): DebateAnalysis {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    overallScore: clampScore(obj.overallScore),
    argumentQuality: clampScore(obj.argumentQuality),
    rhetoricStyle: clampScore(obj.rhetoricStyle),
    logicalCoherence: clampScore(obj.logicalCoherence),
    factChecking: clampScore(obj.factChecking),
    sophisms: Array.isArray(obj.sophisms) ? obj.sophisms : [],
    biases: Array.isArray(obj.biases) ? obj.biases : [],
    strengths: Array.isArray(obj.strengths) ? obj.strengths : [],
    weaknesses: Array.isArray(obj.weaknesses) ? obj.weaknesses : [],
    player1Score: clampScore(obj.player1Score),
    player2Score: clampScore(obj.player2Score),
  };
}

export interface AnalyzeResult {
  analysis: DebateAnalysis;
  aiGenerated: boolean;
}

export async function analyzeDebate(
  topic: string,
  messages: { sender: string; content: string }[],
  locale: Locale = "fr",
): Promise<AnalyzeResult> {
  if (isAIDisabled()) {
    console.warn("[analyzeDebate] AI disabled — returning stub");
    return { analysis: STUB_ANALYSIS, aiGenerated: false };
  }

  const prompt = buildAnalyzeDebatePrompt(topic, messages, locale);
  let rawText = "";

  try {
    rawText = await callGroq(
      [{ role: "user", content: prompt }],
      { temperature: 0.3, response_format: { type: "json_object" } }
    );
    const parsed = JSON.parse(rawText);
    const analysis = validateAnalysis(parsed);
    return { analysis, aiGenerated: true };
  } catch (error) {
    console.error("[analyzeDebate] Error:", error);
    console.error("[analyzeDebate] Raw response:", rawText);
    return { analysis: STUB_ANALYSIS, aiGenerated: false };
  }
}

export async function getAIHint(
  topic: string,
  position: string,
  lastMessages: { sender: string; content: string }[],
  locale: Locale = "fr",
): Promise<string> {
  const prompt = buildHintPrompt(topic, position, lastMessages, locale);

  try {
    return await callGroq(
      [{ role: "user", content: prompt }],
      { temperature: 0.5 }
    );
  } catch {
    return locale === "en"
      ? "Use the S.E.X.I method: Statement, Explanation, eXample, Impact."
      : "Utilisez la méthode S.E.X.I: Statement, Explanation, eXample, Impact.";
  }
}

export async function factCheck(claim: string, locale: Locale = "fr"): Promise<string> {
  const prompt = buildFactCheckPrompt(claim, locale);

  try {
    return await callGroq(
      [{ role: "user", content: prompt }],
      { temperature: 0.2 }
    );
  } catch {
    return locale === "en"
      ? "Verification not available at the moment."
      : "Vérification non disponible actuellement.";
  }
}
