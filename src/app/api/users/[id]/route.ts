import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await db.user.findUnique({
      where: { id },
      include: {
        debatesAsPlayer1: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            player2: true,
            analysis: true,
          },
        },
        debatesAsPlayer2: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            player1: true,
            analysis: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Combine and sort debates
    const allDebates = [
      ...user.debatesAsPlayer1,
      ...user.debatesAsPlayer2,
    ].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, 10);

    return NextResponse.json({
      ...user,
      debates: allDebates,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

