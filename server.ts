import "dotenv/config";
import { createServer, IncomingMessage } from "http";
import next from "next";
import { WebSocketServer, WebSocket } from "ws";
import { Duplex } from "stream";
import { PrismaClient } from "./src/app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { getRandomTopic } from "./src/lib/topics";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./prisma/dev.db",
});
const db = new PrismaClient({ adapter });

type PlayerRole = "player1" | "player2";
type HeartbeatWS = WebSocket & { isAlive: boolean };

interface Room {
  currentTurn: PlayerRole | null;
  players: Map<PlayerRole, { ws: WebSocket; userId: string }>;
  messageCount: number;
}

const rooms = new Map<string, Room>();

// ── Matchmaking queue ─────────────────────────────────────────────────────────
interface QueueEntry {
  ws: WebSocket;
  userId: string;
  locale: string;
}
// mode -> waiting players
const matchmakingQueues = new Map<string, QueueEntry[]>();

function removeFromQueue(mode: string, userId: string) {
  const queue = matchmakingQueues.get(mode);
  if (!queue) return;
  const idx = queue.findIndex((e) => e.userId === userId);
  if (idx >= 0) queue.splice(idx, 1);
}

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

  // ── Heartbeat ─────────────────────────────────────────────────────────────
  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((client) => {
      const ws = client as HeartbeatWS;
      if (!ws.isAlive) { ws.terminate(); return; }
      ws.isAlive = false;
      ws.ping();
    });
  }, 15_000);
  wss.on("close", () => clearInterval(heartbeatInterval));

  server.on("upgrade", (req: IncomingMessage, socket: Duplex, head: Buffer) => {
    const { pathname } = new URL(req.url || "/", "http://localhost");
    if (pathname === "/ws") {
      wss.handleUpgrade(req, socket as any, head, (ws) => {
        wss.emit("connection", ws, req);
      });
    }
    // Other upgrade paths (Next.js HMR etc.) are left untouched
  });

  wss.on("connection", (rawWs: WebSocket) => {
    const ws = rawWs as HeartbeatWS;
    ws.isAlive = true;
    ws.on("pong", () => { ws.isAlive = true; });

    let connDebateId: string | null = null;
    let connRole: PlayerRole | null = null;
    let connQueued: { mode: string; userId: string } | null = null;

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

        // ── queue (matchmaking) ───────────────────────────────────────────
        if (msg.type === "queue") {
          const { userId, mode, locale } = msg;
          if (!userId || !mode) return;

          if (!matchmakingQueues.has(mode)) matchmakingQueues.set(mode, []);
          const queue = matchmakingQueues.get(mode)!;

          // Don't add twice
          if (queue.find((e) => e.userId === userId)) return;

          const opponentIdx = queue.findIndex((e) => e.userId !== userId);

          if (opponentIdx >= 0) {
            // Match found — create debate atomically on the server
            const opponent = queue.splice(opponentIdx, 1)[0];
            connQueued = null;

            const topic = getRandomTopic(locale ?? opponent.locale ?? "fr");
            const player1Position = Math.random() < 0.5 ? "POUR" : "CONTRE";

            const debate = await db.debate.create({
              data: {
                topic,
                mode,
                player1Id: opponent.userId,
                player1Position,
                player2Position: player1Position === "POUR" ? "CONTRE" : "POUR",
                player2Id: userId,
                status: "active",
                startedAt: new Date(),
              },
            });

            console.log(`[MM] matched ${opponent.userId.slice(-4)} vs ${userId.slice(-4)} → debate ${debate.id.slice(-6)}`);
            send(opponent.ws, { type: "matched", debateId: debate.id, playerRole: "player1" });
            send(ws, { type: "matched", debateId: debate.id, playerRole: "player2" });
          } else {
            // No opponent yet — join the queue
            queue.push({ ws, userId, locale: locale ?? "fr" });
            connQueued = { mode, userId };
            console.log(`[MM] ${userId.slice(-4)} queued for ${mode} | queue size=${queue.length}`);
            send(ws, { type: "queued" });
          }
        }

        // ── cancel_queue ──────────────────────────────────────────────────
        if (msg.type === "cancel_queue") {
          if (connQueued) {
            removeFromQueue(connQueued.mode, connQueued.userId);
            console.log(`[MM] ${connQueued.userId.slice(-4)} left queue for ${connQueued.mode}`);
            connQueued = null;
          }
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
      if (connQueued) {
        removeFromQueue(connQueued.mode, connQueued.userId);
        console.log(`[MM] ${connQueued.userId.slice(-4)} disconnected — removed from queue`);
      }
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
