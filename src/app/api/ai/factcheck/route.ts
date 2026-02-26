import { NextRequest, NextResponse } from "next/server";
import { factCheck } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { claim } = await request.json();

    if (!claim) {
      return NextResponse.json({ error: "claim is required" }, { status: 400 });
    }

    const result = await factCheck(claim);

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Fact check error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

