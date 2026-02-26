import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

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
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const debate = await db.debate.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(debate);
  } catch (error) {
    console.error("Update debate error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

