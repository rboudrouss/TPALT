import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { analyzeDebate } from "@/lib/groq";
import { CASUAL_ELO_WIN, CASUAL_ELO_LOSS } from "@/lib/elo";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: debateId } = await params;
    const body = await request.json().catch(() => ({}));
    const { messages: bodyMessages, cheatCount = 0, locale = "fr" } = body as {
      messages?: { sender: string; content: string }[];
      cheatCount?: number;
      locale?: "fr" | "en";
    };

    const debate = await db.debate.findUnique({
      where: { id: debateId },
      include: {
        messages: {
          include: { sender: true },
          orderBy: { createdAt: "asc" },
        },
        player1: true,
        player2: true,
      },
    });

    if (!debate) {
      return NextResponse.json({ error: "Debate not found" }, { status: 404 });
    }

    // Use messages from request body if provided (training mode),
    // otherwise fall back to DB messages (multiplayer mode)
    const formattedMessages: { sender: string; content: string }[] =
      bodyMessages && bodyMessages.length > 0
        ? bodyMessages
        : debate.messages.map((m) => ({
            sender: m.sender.username,
            content: m.content,
          }));

    const { analysis: rawAnalysis, aiGenerated } = await analyzeDebate(debate.topic, formattedMessages, locale);

    // Apply anti-cheat penalty in ranked mode
    const player1Score =
      debate.mode === "ranked" && cheatCount >= 3
        ? Math.max(0, rawAnalysis.player1Score - 30)
        : rawAnalysis.player1Score;
    const player2Score = rawAnalysis.player2Score;

    const analysisResult = { ...rawAnalysis, player1Score, player2Score };

    const analysisData = {
      overallScore: analysisResult.overallScore,
      argumentQuality: analysisResult.argumentQuality,
      rhetoricStyle: analysisResult.rhetoricStyle,
      logicalCoherence: analysisResult.logicalCoherence,
      factChecking: analysisResult.factChecking,
      sophisms: JSON.stringify(analysisResult.sophisms),
      biases: JSON.stringify(analysisResult.biases),
      strengths: JSON.stringify(analysisResult.strengths),
      weaknesses: JSON.stringify(analysisResult.weaknesses),
      player1Score: analysisResult.player1Score,
      player2Score: analysisResult.player2Score,
    };

    const analysis = await db.analysis.upsert({
      where: { debateId },
      create: { debateId, ...analysisData },
      update: analysisData,
    });

    await db.debate.update({
      where: { id: debateId },
      data: {
        status: "finished",
        finishedAt: new Date(),
        winnerId:
          analysisResult.player1Score > analysisResult.player2Score
            ? debate.player1Id
            : debate.player2Id,
      },
    });

    // Update user stats — training mode does not affect wins/losses/elo/xp
    if (debate.mode !== "training") {
      if (debate.player1) {
        const isWinner = analysisResult.player1Score > analysisResult.player2Score;
        const p1 = await db.user.findUnique({ where: { id: debate.player1Id } });
        const newXp = (p1?.xp ?? 0) + analysisResult.player1Score;
        const newLevel = Math.floor(newXp / 500) + 1;
        await db.user.update({
          where: { id: debate.player1Id },
          data: {
            wins: { increment: isWinner ? 1 : 0 },
            losses: { increment: isWinner ? 0 : 1 },
            elo: { increment: isWinner ? CASUAL_ELO_WIN : CASUAL_ELO_LOSS },
            xp: newXp,
            level: newLevel,
          },
        });
      }

      if (debate.player2) {
        const isWinner = analysisResult.player2Score > analysisResult.player1Score;
        const p2 = await db.user.findUnique({ where: { id: debate.player2Id! } });
        const newXp = (p2?.xp ?? 0) + analysisResult.player2Score;
        const newLevel = Math.floor(newXp / 500) + 1;
        await db.user.update({
          where: { id: debate.player2Id! },
          data: {
            wins: { increment: isWinner ? 1 : 0 },
            losses: { increment: isWinner ? 0 : 1 },
            elo: { increment: isWinner ? CASUAL_ELO_WIN : CASUAL_ELO_LOSS },
            xp: newXp,
            level: newLevel,
          },
        });
      }
    }

    return NextResponse.json({
      ...analysis,
      sophisms: analysisResult.sophisms,
      biases: analysisResult.biases,
      strengths: analysisResult.strengths,
      weaknesses: analysisResult.weaknesses,
      aiGenerated,
    });
  } catch (error) {
    console.error("Analyze debate error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
