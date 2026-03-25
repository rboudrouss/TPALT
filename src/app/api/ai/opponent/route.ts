import { NextResponse } from "next/server";
import { callGroq } from "@/lib/groq";
import {
  Difficulty,
  OPPONENT_DIFFICULTY_SETTINGS,
  getOpponentDifficultyPrompt,
  buildOpponentUserPrompt,
} from "@/lib/prompts";
import type { Locale } from "@/lib/i18n/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      topic,
      opponentPosition,
      userPosition,
      conversationHistory,
      difficulty = "medium",
      locale = "fr",
      apiUrl,
      modelName,
      apiKey,
    }: {
      topic: string;
      opponentPosition: string;
      userPosition: string;
      conversationHistory: { role: "user" | "opponent"; content: string }[];
      difficulty: Difficulty;
      locale: Locale;
      apiUrl?: string;
      modelName?: string;
      apiKey?: string;
    } = body;

    const systemPrompt = getOpponentDifficultyPrompt(difficulty, locale);
    const { temperature, max_tokens } = OPPONENT_DIFFICULTY_SETTINGS[difficulty] ?? OPPONENT_DIFFICULTY_SETTINGS.medium;

    const youLabel = locale === "en" ? "You" : "Toi";
    const opponentLabel = locale === "en" ? "Opponent" : "Adversaire";
    const noHistory = locale === "en" ? "No previous exchanges." : "Aucun échange précédent.";

    const historyText = conversationHistory.length > 0
      ? conversationHistory
          .map((m) => `${m.role === "user" ? opponentLabel : youLabel}: ${m.content}`)
          .join("\n")
      : noHistory;

    const userPrompt = buildOpponentUserPrompt(topic, opponentPosition, userPosition, historyText, locale);

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
      { reply: "That's an interesting point, but I'm not convinced. Your reasoning lacks concrete evidence." },
      { status: 200 }
    );
  }
}
