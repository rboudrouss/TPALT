// ── Debate mechanics ──────────────────────────────────────────────────────────

/** Seconds allocated per turn */
export const ROUND_TIME = 90;

/** Number of turns each player gets per debate */
export const MAX_TURNS = 6;

/** Total messages before a debate ends (MAX_TURNS × 2 players) */
export const MAX_MESSAGES = MAX_TURNS * 2;

// ── Message limits ────────────────────────────────────────────────────────────

/** Maximum characters a player can type per message */
export const MAX_PLAYER_CHARS = 500;

/** Maximum words in an AI opponent response */
export const MAX_AI_WORDS = 120;

// ── ELO system ────────────────────────────────────────────────────────────────

/** K-factor controlling rating volatility in ranked ELO calculation */
export const ELO_K_FACTOR = 32;

/** Minimum ELO rating — no player can fall below this */
export const ELO_FLOOR = 100;

/** ELO divisor used in the expected-score formula (standard = 400) */
export const ELO_DIVISOR = 400;

/** ELO gained on a casual mode win */
export const CASUAL_ELO_WIN = 15;

/** ELO lost on a casual mode loss */
export const CASUAL_ELO_LOSS = -10;

// ── Matchmaking ───────────────────────────────────────────────────────────────

/** Initial ELO search window for ranked matchmaking */
export const MM_ELO_WINDOW_BASE = 150;

/** ELO window increase per expansion interval */
export const MM_ELO_WINDOW_INCREMENT = 50;

/** Seconds between each window expansion */
export const MM_ELO_WINDOW_EXPAND_SECS = 10;

/** Maximum ELO search window */
export const MM_ELO_WINDOW_MAX = 500;

/** WebSocket heartbeat ping interval (ms) */
export const WS_HEARTBEAT_INTERVAL_MS = 15_000;

// ── Scoring / XP ──────────────────────────────────────────────────────────────

/** XP required to gain one level */
export const XP_PER_LEVEL = 500;

/** Number of anti-cheat triggers before a score penalty is applied */
export const CHEAT_THRESHOLD = 3;

/** Score points deducted as anti-cheat penalty */
export const CHEAT_PENALTY = 30;

// ── UI timing ─────────────────────────────────────────────────────────────────

/** How long toast notifications are visible (ms) */
export const TOAST_DURATION_MS = 5_000;

/** How long the cheat-warning overlay is shown (ms) */
export const CHEAT_WARNING_DURATION_MS = 3_000;

/** Redirect delay on the analysis page when no data is present (ms) */
export const ANALYSIS_REDIRECT_DELAY_MS = 2_000;

// ── Leaderboard ───────────────────────────────────────────────────────────────

export const LEADERBOARD_DEFAULT_LIMIT = 50;
export const LEADERBOARD_MAX_LIMIT = 100;
