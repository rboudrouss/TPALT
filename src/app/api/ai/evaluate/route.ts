import { NextResponse } from "next/server";
import { callGroq } from "@/lib/groq";
import { EVALUATE_SYSTEM_PROMPT } from "@/lib/prompts";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { debateContext, apiUrl, modelName, apiKey } = body;

    const result = await callGroq(
      [
        { role: "system", content: EVALUATE_SYSTEM_PROMPT },
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
