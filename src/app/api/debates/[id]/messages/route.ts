import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: debateId } = await params;
    const { senderId, content } = await request.json();

    if (!senderId || !content) {
      return NextResponse.json(
        { error: "senderId and content are required" },
        { status: 400 }
      );
    }

    const message = await db.message.create({
      data: {
        debateId,
        senderId,
        content,
      },
      include: {
        sender: true,
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Create message error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

