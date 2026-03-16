import "dotenv/config";
import { createServer, IncomingMessage } from "http";
import next from "next";
import { WebSocketServer, WebSocket } from "ws";
import { Duplex } from "stream";
import { PrismaClient } from "./src/app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./prisma/dev.db",
});
const db = new PrismaClient({ adapter });

type PlayerRole = "player1" | "player2";

interface Room {
  currentTurn: PlayerRole | null;
  players: Map<PlayerRole, { ws: WebSocket; userId: string }>;
  messageCount: number;
}

const rooms = new Map<string, Room>();

function getOrCreateRoom(debateId: string): Room {
  if (!rooms.has(debateId)) {
    rooms.set(debateId, { currentTurn: null, players: new Map(), messageCount: 0 });
  }
  return rooms.get(debateId)!;
}

function deduceTurn(messages: any[], player1Id: string): PlayerRole {
  if (messages.length === 0) return Math.random() < 0.5 ? "player1" : "player2";
  const last = messages[messages.length - 1];
  return last.senderId === player1Id ? "player2" : "player1";
}

function send(ws: WebSocket, data: object) {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(data));
}

function broadcast(room: Room, data: object) {
  const json = JSON.stringify(data);
  for (const p of room.players.values()) {
    if (p.ws.readyState === WebSocket.OPEN) p.ws.send(json);
  }
}

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  // Use noServer mode so upgrade events don't conflict with Next.js HMR
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req: IncomingMessage, socket: Duplex, head: Buffer) => {
    const { pathname } = new URL(req.url || "/", "http://localhost");
    if (pathname === "/ws") {
      wss.handleUpgrade(req, socket as any, head, (ws) => {
        wss.emit("connection", ws, req);
      });
    }
    // Other upgrade paths (Next.js HMR etc.) are left untouched
  });

  wss.on("connection", (ws: WebSocket) => {
    let connDebateId: string | null = null;
    let connRole: PlayerRole | null = null;

    ws.on("message", async (raw) => {
      let msg: any;
      try { msg = JSON.parse(raw.toString()); } catch { return; }

      try {

        // ── join ──────────────────────────────────────────────────────────
        if (msg.type === "join") {
          const { debateId, userId } = msg;
          if (!debateId || !userId) return;

          const debate = await db.debate.findUnique({
            where: { id: debateId },
            include: {
              messages: { orderBy: { createdAt: "asc" }, include: { sender: true } },
              player1: true,
              player2: true,
            },
          });

          if (!debate) { send(ws, { type: "error", message: "Debate not found" }); return; }

          let role: PlayerRole | null = null;
          if (debate.player1Id === userId) role = "player1";
          else if (debate.player2Id === userId) role = "player2";
          if (!role) { send(ws, { type: "error", message: "Not a participant" }); return; }

          connDebateId = debateId;
          connRole = role;

          const room = getOrCreateRoom(debateId);
          room.players.set(role, { ws, userId });
          room.messageCount = debate.messages.length;

          if (!room.currentTurn) {
            room.currentTurn = deduceTurn(debate.messages, debate.player1Id);
          }

          console.log(`[WS] ${role} joined ${debateId.slice(-6)} | turn=${room.currentTurn} | players=${room.players.size}`);

          send(ws, { type: "state", debate, role, currentTurn: room.currentTurn });

          if (room.players.size === 2 && debate.status === "active") {
            console.log(`[WS] debate_ready → turn=${room.currentTurn}`);
            broadcast(room, { type: "debate_ready", currentTurn: room.currentTurn });
          }
        }

        // ── message ───────────────────────────────────────────────────────
        if (msg.type === "message") {
          const { debateId, userId, content } = msg;
          if (!content?.trim() || !debateId || !userId) return;

          const room = rooms.get(debateId);
          if (!room || !connRole) {
            console.warn(`[WS] message dropped: room=${!!room} connRole=${connRole}`);
            return;
          }

          console.log(`[WS] message from ${connRole} | currentTurn=${room.currentTurn} | players=${room.players.size}`);

          if (room.currentTurn !== connRole) {
            send(ws, { type: "error", code: "NOT_YOUR_TURN", message: "Ce n'est pas votre tour" });
            return;
          }

          const nextTurn: PlayerRole = connRole === "player1" ? "player2" : "player1";
          room.currentTurn = nextTurn;
          room.messageCount += 1;

          // Broadcast immediately — don't block on DB write
          broadcast(room, {
            type: "new_message",
            message: {
              id: `tmp_${Date.now()}`,
              content,
              senderId: userId,
              createdAt: new Date().toISOString(),
            },
            currentTurn: nextTurn,
            messageCount: room.messageCount,
          });

          console.log(`[WS] broadcast → ${room.players.size} player(s), nextTurn=${nextTurn}`);

          if (room.messageCount >= 6) broadcast(room, { type: "debate_ended" });

          db.message.create({ data: { debateId, senderId: userId, content } })
            .catch(err => console.error("[WS] save message failed:", err));
        }

        // ── timeout ───────────────────────────────────────────────────────
        if (msg.type === "timeout") {
          const { debateId } = msg;
          const room = rooms.get(debateId);
          if (!room || !connRole || room.currentTurn !== connRole) return;

          const nextTurn: PlayerRole = connRole === "player1" ? "player2" : "player1";
          room.currentTurn = nextTurn;
          broadcast(room, { type: "turn_changed", currentTurn: nextTurn });
        }

      } catch (err) {
        console.error("[WS] handler error:", err);
        send(ws, { type: "error", message: "Internal server error" });
      }
    });

    ws.on("close", () => {
      if (connDebateId && connRole) {
        const room = rooms.get(connDebateId);
        if (room) {
          room.players.delete(connRole);
          console.log(`[WS] ${connRole} disconnected from ${connDebateId.slice(-6)} | players left=${room.players.size}`);
        }
      }
    });
  });

  const port = parseInt(process.env.PORT || "3000", 10);
  server.listen(port, () => console.log(`> Ready on http://localhost:${port}`));
});
