import { NextResponse } from "next/server";
import { callGroq } from "@/lib/groq";
import { getEvaluateSystemPrompt } from "@/lib/prompts";
import type { Locale } from "@/lib/i18n/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { debateContext, locale = "fr", apiUrl, modelName, apiKey } = body as {
      debateContext: unknown;
      locale?: Locale;
      apiUrl?: string;
      modelName?: string;
      apiKey?: string;
    };

    const result = await callGroq(
      [
        { role: "system", content: getEvaluateSystemPrompt(locale) },
        { role: "user", content: `Here is the current debate state and the new message to evaluate:\n${JSON.stringify(debateContext)}` },
      ],
      { url: apiUrl, model: modelName, apiKey, temperature: 0.2, response_format: { type: "json_object" } }
    );

    return NextResponse.json(JSON.parse(result));
  } catch (error) {
    console.error("Evaluation Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
