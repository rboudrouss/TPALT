import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Simple auth - create or get user by username
export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    if (!username || typeof username !== "string" || username.length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters" },
        { status: 400 }
      );
    }

    // Find or create user
    let user = await db.user.findUnique({
      where: { username },
    });

    if (!user) {
      user = await db.user.create({
        data: { username },
      });
    }

    return NextResponse.json({
      id: user.id,
      username: user.username,
      elo: user.elo,
      level: user.level,
      xp: user.xp,
      wins: user.wins,
      losses: user.losses,
    });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

