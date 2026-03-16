import { NextResponse } from "next/server";
import { callGroq } from "@/lib/groq";
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

    const systemPrompt = OPPONENT_DIFFICULTY_PROMPTS[difficulty] ?? OPPONENT_DIFFICULTY_PROMPTS.medium;
    const { temperature, max_tokens } = OPPONENT_DIFFICULTY_SETTINGS[difficulty] ?? OPPONENT_DIFFICULTY_SETTINGS.medium;

    const historyText = conversationHistory.length > 0
      ? conversationHistory
          .map((m) => `${m.role === "user" ? "Adversaire" : "Toi"}: ${m.content}`)
          .join("\n")
      : "Aucun échange précédent.";

    const userPrompt = buildOpponentUserPrompt(topic, opponentPosition, userPosition, historyText);

    const reply = await callGroq(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      { url: apiUrl, model: modelName, apiKey, temperature, max_tokens }
    );

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Opponent generation error:", error);
    return NextResponse.json(
      { reply: "C'est un point intéressant, mais je ne suis pas convaincu. Votre raisonnement manque de preuves concrètes." },
      { status: 200 }
    );
  }
}
