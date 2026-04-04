import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { LEADERBOARD_DEFAULT_LIMIT, LEADERBOARD_MAX_LIMIT } from "@/lib/const";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || String(LEADERBOARD_DEFAULT_LIMIT), 10), LEADERBOARD_MAX_LIMIT);

    const users = await db.user.findMany({
      select: {
        id: true,
        username: true,
        elo: true,
        level: true,
        wins: true,
        losses: true,
      },
      orderBy: { elo: "desc" },
      take: limit,
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
