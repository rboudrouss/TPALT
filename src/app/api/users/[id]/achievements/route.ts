import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  ACHIEVEMENTS,
  GRAND_MAITRE,
  computeStats,
  evaluateAll,
  DebateSummary,
} from "@/lib/achievements";

async function fetchUserData(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      achievements: true,
      debatesAsPlayer1: {
        include: { analysis: { select: { player1Score: true, player2Score: true, sophisms: true } } },
      },
      debatesAsPlayer2: {
        include: { analysis: { select: { player1Score: true, player2Score: true, sophisms: true } } },
      },
    },
  });
  return user;
}

/**
 * GET /api/users/[id]/achievements
 * Returns the current achievement list (does NOT write to DB).
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const user = await fetchUserData(userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const debates: DebateSummary[] = [
      ...user.debatesAsPlayer1.map((d) => ({
        id: d.id, mode: d.mode, status: d.status,
        player1Id: d.player1Id, winnerId: d.winnerId, analysis: d.analysis,
      })),
      ...user.debatesAsPlayer2.map((d) => ({
        id: d.id, mode: d.mode, status: d.status,
        player1Id: d.player1Id, winnerId: d.winnerId, analysis: d.analysis,
      })),
    ];

    const stats = computeStats(debates, userId, user.wins, user.losses, user.elo, user.level, user.xp);
    const existingUnlocks = new Map(user.achievements.map((a) => [a.achievementId, a.unlockedAt]));
    const categories = evaluateAll(stats, existingUnlocks);

    return NextResponse.json(categories);
  } catch (error) {
    console.error("GET achievements error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/users/[id]/achievements
 * Evaluates all achievements, persists newly unlocked ones, returns updated list.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const user = await fetchUserData(userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const debates: DebateSummary[] = [
      ...user.debatesAsPlayer1.map((d) => ({
        id: d.id, mode: d.mode, status: d.status,
        player1Id: d.player1Id, winnerId: d.winnerId, analysis: d.analysis,
      })),
      ...user.debatesAsPlayer2.map((d) => ({
        id: d.id, mode: d.mode, status: d.status,
        player1Id: d.player1Id, winnerId: d.winnerId, analysis: d.analysis,
      })),
    ];

    const stats = computeStats(debates, userId, user.wins, user.losses, user.elo, user.level, user.xp);
    const existingUnlocks = new Map(user.achievements.map((a) => [a.achievementId, a.unlockedAt]));

    // Determine which achievements are now unlocked

    // Evaluate regular achievements first, then Grand Maître
    const regularUnlocks: number[] = [];
    for (const def of ACHIEVEMENTS) {
      if (existingUnlocks.has(def.id)) continue; // already persisted
      const { unlocked } = def.evaluate(stats);
      if (unlocked) regularUnlocks.push(def.id);
    }

    // Grand Maître check
    const totalUnlocked = regularUnlocks.length + existingUnlocks.size;
    const gmStats = { ...stats, othersUnlockedCount: totalUnlocked, othersTotal: ACHIEVEMENTS.length };
    const gmNowUnlocked = !existingUnlocks.has(GRAND_MAITRE.id) && GRAND_MAITRE.evaluate(gmStats).unlocked;
    if (gmNowUnlocked) regularUnlocks.push(GRAND_MAITRE.id);

    // Persist newly unlocked achievements via individual upserts
    if (regularUnlocks.length > 0) {
      await Promise.all(
        regularUnlocks.map((achievementId) =>
          db.userAchievement.upsert({
            where: { userId_achievementId: { userId, achievementId } },
            create: { userId, achievementId },
            update: {},
          })
        )
      );
      // Reload unlocks with the newly created timestamps
      const updated = await db.userAchievement.findMany({ where: { userId } });
      updated.forEach((a) => existingUnlocks.set(a.achievementId, a.unlockedAt));
    }

    const categories = evaluateAll(stats, existingUnlocks);
    return NextResponse.json({ categories, newlyUnlocked: regularUnlocks });
  } catch (error) {
    console.error("POST achievements error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
