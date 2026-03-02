import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getRandomTopic } from "@/lib/topics";

// Create a new debate
export async function POST(request: NextRequest) {
  try {
    const { playerId, mode } = await request.json();

    if (!playerId || !mode) {
      return NextResponse.json(
        { error: "playerId and mode are required" },
        { status: 400 }
      );
    }

    const topic = getRandomTopic();
    const positions = ["POUR", "CONTRE"];
    const player1Position = positions[Math.floor(Math.random() * 2)];

    const debate = await db.debate.create({
      data: {
        topic,
        mode,
        player1Id: playerId,
        player1Position,
        player2Position: player1Position === "POUR" ? "CONTRE" : "POUR",
        status: mode === "training" ? "active" : "waiting",
      },
    });

    return NextResponse.json(debate);
  } catch (error) {
    console.error("Create debate error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Get debates (for matchmaking)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode");
    const status = searchParams.get("status") || "waiting";

    const debates = await db.debate.findMany({
      where: {
        ...(mode && { mode }),
        status,
      },
      include: {
        player1: true,
        player2: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json(debates);
  } catch (error) {
    console.error("Get debates error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

