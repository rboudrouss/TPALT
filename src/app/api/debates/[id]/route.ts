import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { computeRankedElo } from "@/lib/elo";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const debate = await db.debate.findUnique({
      where: { id },
      include: {
        player1: true,
        player2: true,
        messages: {
          orderBy: { createdAt: "asc" },
          include: { sender: true },
        },
        analysis: true,
      },
    });

    if (!debate) {
      return NextResponse.json({ error: "Debate not found" }, { status: 404 });
    }

    return NextResponse.json(debate);
  } catch (error) {
    console.error("Get debate error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await _request.json();

    const debate = await db.debate.update({
      where: { id },
      data: body,
    });

    // Apply ELO changes when a ranked debate is resolved
    if (body.winnerId && debate.mode === "ranked" && debate.player1Id && debate.player2Id) {
      await applyElo(debate.player1Id, debate.player2Id, body.winnerId);
    }

    return NextResponse.json(debate);
  } catch (error) {
    console.error("Update debate error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function applyElo(player1Id: string, player2Id: string, winnerId: string) {
  const [p1, p2] = await Promise.all([
    db.user.findUnique({ where: { id: player1Id }, select: { elo: true } }),
    db.user.findUnique({ where: { id: player2Id }, select: { elo: true } }),
  ]);
  if (!p1 || !p2) return;

  const score1 = winnerId === player1Id ? 1 : 0;
  const { newElo1, newElo2 } = computeRankedElo(p1.elo, p2.elo, winnerId, player1Id);

  await Promise.all([
    db.user.update({ where: { id: player1Id }, data: { elo: newElo1, wins: { increment: score1 }, losses: { increment: 1 - score1 } } }),
    db.user.update({ where: { id: player2Id }, data: { elo: newElo2, wins: { increment: 1 - score1 }, losses: { increment: score1 } } }),
  ]);
}

