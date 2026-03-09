import { NextResponse } from "next/server";
import {
  Difficulty,
  OPPONENT_DIFFICULTY_PROMPTS,
  OPPONENT_DIFFICULTY_SETTINGS,
  buildOpponentUserPrompt,
} from "@/lib/prompts";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      topic,
      opponentPosition,
      userPosition,
      conversationHistory,
      difficulty = "medium",
      apiUrl,
      modelName,
      apiKey,
    }: {
      topic: string;
      opponentPosition: string;
      userPosition: string;
      conversationHistory: { role: "user" | "opponent"; content: string }[];
      difficulty: Difficulty;
      apiUrl?: string;
      modelName?: string;
      apiKey?: string;
    } = body;

    const url = apiUrl || process.env.LLM_API_URL || "https://api.groq.com/openai/v1/chat/completions";
    const model = modelName || process.env.LLM_MODEL || "llama-3.3-70b-versatile";
    const key = apiKey || process.env.LLM_API_KEY || "your_api_key_here";

    const systemPrompt = OPPONENT_DIFFICULTY_PROMPTS[difficulty] ?? OPPONENT_DIFFICULTY_PROMPTS.medium;
    const { temperature, max_tokens } = OPPONENT_DIFFICULTY_SETTINGS[difficulty] ?? OPPONENT_DIFFICULTY_SETTINGS.medium;

    const historyText = conversationHistory.length > 0
      ? conversationHistory
          .map((m) => `${m.role === "user" ? "Adversaire" : "Toi"}: ${m.content}`)
          .join("\n")
      : "Aucun échange précédent.";

    const userPrompt = buildOpponentUserPrompt(topic, opponentPosition, userPosition, historyText);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature,
        max_tokens,
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM API Error: ${response.statusText}`);
    }

    const data = await response.json();
    const reply: string = data.choices[0].message.content.trim();

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Opponent generation error:", error);
    // Graceful fallback so the debate isn't blocked
    return NextResponse.json(
      { reply: "C'est un point intéressant, mais je ne suis pas convaincu. Votre raisonnement manque de preuves concrètes." },
      { status: 200 }
    );
  }
}
