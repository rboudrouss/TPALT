import { NextRequest, NextResponse } from "next/server";
import { getAIHint } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { topic, position, messages } = await request.json();

    if (!topic || !position) {
      return NextResponse.json(
        { error: "topic and position are required" },
        { status: 400 }
      );
    }

    const hint = await getAIHint(topic, position, messages || []);

    return NextResponse.json({ hint });
  } catch (error) {
    console.error("AI hint error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

