import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { analyzeDebate } from "@/lib/gemini";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: debateId } = await params;

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

    // Format messages for analysis
    const formattedMessages = debate.messages.map((m) => ({
      sender: m.sender.username,
      content: m.content,
    }));

    // Analyze with Gemini
    const analysisResult = await analyzeDebate(debate.topic, formattedMessages);

    // Save analysis to database
    const analysis = await db.analysis.create({
      data: {
        debateId,
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
      },
    });

    // Update debate status
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

    // Update user stats
    if (debate.player1) {
      const isWinner = analysisResult.player1Score > analysisResult.player2Score;
      await db.user.update({
        where: { id: debate.player1Id },
        data: {
          wins: { increment: isWinner ? 1 : 0 },
          losses: { increment: isWinner ? 0 : 1 },
          elo: { increment: isWinner ? 15 : -10 },
          xp: { increment: analysisResult.player1Score },
        },
      });
    }

    if (debate.player2) {
      const isWinner = analysisResult.player2Score > analysisResult.player1Score;
      await db.user.update({
        where: { id: debate.player2Id! },
        data: {
          wins: { increment: isWinner ? 1 : 0 },
          losses: { increment: isWinner ? 0 : 1 },
          elo: { increment: isWinner ? 15 : -10 },
          xp: { increment: analysisResult.player2Score },
        },
      });
    }

    return NextResponse.json({
      ...analysis,
      sophisms: analysisResult.sophisms,
      biases: analysisResult.biases,
      strengths: analysisResult.strengths,
      weaknesses: analysisResult.weaknesses,
    });
  } catch (error) {
    console.error("Analyze debate error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

