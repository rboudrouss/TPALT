// ---------------------------------------------------------------------------
// Achievement definitions — single source of truth.
// This file is used both server-side (API route) and client-side (Profile view).
// ---------------------------------------------------------------------------

// ── Input types ─────────────────────────────────────────────────────────────

export interface DebateSummary {
  id: string;
  mode: string;
  status: string;
  player1Id: string;
  winnerId: string | null;
  analysis?: {
    player1Score: number | null;
    player2Score: number | null;
    sophisms: string; // JSON string
  } | null;
}

/** Flat stats object derived from raw DB data. Passed to every evaluate(). */
export interface AchievementStats {
  totalDebates: number;        // all modes
  rankedWins: number;          // casual + ranked wins only
  wins: number;                // user.wins from DB (casual + ranked)
  losses: number;
  elo: number;
  level: number;
  xp: number;
  maxStreak: number;           // best consecutive wins (not training)
  avgScore: number;            // raw 0–100 across all analysed debates
  hasSophismFreeDebate: boolean;
  hasPerfectScore: boolean;    // any debate score ≥ 95
  playedModes: string[];       // distinct modes played
  maxAdHominem: number;        // highest ad-hominem count in a single debate
  // Populated after all other achievements are evaluated:
  othersUnlockedCount: number;
  othersTotal: number;
}

// ── Output types ─────────────────────────────────────────────────────────────

export interface AchievementDefinition {
  id: number;
  category: string;
  name: string;
  description: string;
  icon: string;
  /**
   * Returns whether the achievement is currently unlocked, and
   * progress data for the progress bar while locked.
   */
  evaluate: (stats: AchievementStats) => {
    unlocked: boolean;
    progress: number;       // 0–100
    progressLabel: string;  // e.g. "3 / 10"
  };
}

export interface AchievementResult {
  id: number;
  category: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt: string | null; // ISO date string persisted in DB
  progress: number;
  progressLabel: string;
}

// ── Helper ───────────────────────────────────────────────────────────────────

function bar(current: number, target: number) {
  return {
    progress: Math.min(99, Math.round((current / target) * 100)),
    progressLabel: `${current} / ${target}`,
  };
}

// ── Definitions ──────────────────────────────────────────────────────────────

/** All achievements except Grand Maître (id 99). */
export const ACHIEVEMENTS: AchievementDefinition[] = [
  // ── Premiers pas ──────────────────────────────────────────────────────────
  {
    id: 1, category: "Premiers pas",
    name: "Premier Débat", description: "Participer à un premier débat", icon: "🎤",
    evaluate: ({ totalDebates }) => ({
      unlocked: totalDebates >= 1,
      ...bar(totalDebates, 1),
    }),
  },
  {
    id: 2, category: "Premiers pas",
    name: "Première Victoire", description: "Remporter son tout premier débat compétitif", icon: "⭐",
    evaluate: ({ rankedWins }) => ({
      unlocked: rankedWins >= 1,
      ...bar(rankedWins, 1),
    }),
  },
  {
    id: 3, category: "Premiers pas",
    name: "Explorateur", description: "Jouer dans les 3 modes (Training, Casual, Classé)", icon: "🗺️",
    evaluate: ({ playedModes }) => {
      const count = ["training", "casual", "ranked"].filter((m) => playedModes.includes(m)).length;
      return { unlocked: count >= 3, ...bar(count, 3) };
    },
  },
  {
    id: 4, category: "Premiers pas",
    name: "Assidu", description: "Jouer 10 débats toutes catégories", icon: "📅",
    evaluate: ({ totalDebates }) => ({
      unlocked: totalDebates >= 10,
      ...bar(totalDebates, 10),
    }),
  },

  // ── Victoires ─────────────────────────────────────────────────────────────
  {
    id: 5, category: "Victoires",
    name: "Combattant", description: "Remporter 5 victoires classées", icon: "⚔️",
    evaluate: ({ rankedWins }) => ({ unlocked: rankedWins >= 5, ...bar(rankedWins, 5) }),
  },
  {
    id: 6, category: "Victoires",
    name: "Vétéran", description: "Remporter 25 victoires classées", icon: "🎖️",
    evaluate: ({ rankedWins }) => ({ unlocked: rankedWins >= 25, ...bar(rankedWins, 25) }),
  },
  {
    id: 7, category: "Victoires",
    name: "Champion", description: "Remporter 50 victoires classées", icon: "🏆",
    evaluate: ({ rankedWins }) => ({ unlocked: rankedWins >= 50, ...bar(rankedWins, 50) }),
  },
  {
    id: 8, category: "Victoires",
    name: "Légende", description: "Remporter 100 victoires classées", icon: "👑",
    evaluate: ({ rankedWins }) => ({ unlocked: rankedWins >= 100, ...bar(rankedWins, 100) }),
  },

  // ── Séries ────────────────────────────────────────────────────────────────
  {
    id: 9, category: "Séries",
    name: "En Route", description: "Enchaîner 2 victoires d'affilée", icon: "🔗",
    evaluate: ({ maxStreak }) => ({ unlocked: maxStreak >= 2, ...bar(maxStreak, 2) }),
  },
  {
    id: 10, category: "Séries",
    name: "Série de 5", description: "Enchaîner 5 victoires d'affilée", icon: "🔥",
    evaluate: ({ maxStreak }) => ({ unlocked: maxStreak >= 5, ...bar(maxStreak, 5) }),
  },
  {
    id: 11, category: "Séries",
    name: "Inarrêtable", description: "Enchaîner 10 victoires d'affilée", icon: "💥",
    evaluate: ({ maxStreak }) => ({ unlocked: maxStreak >= 10, ...bar(maxStreak, 10) }),
  },
  {
    id: 12, category: "Séries",
    name: "Implacable", description: "Enchaîner 20 victoires d'affilée", icon: "🌪️",
    evaluate: ({ maxStreak }) => ({ unlocked: maxStreak >= 20, ...bar(maxStreak, 20) }),
  },

  // ── Qualité ───────────────────────────────────────────────────────────────
  {
    id: 13, category: "Qualité",
    name: "Orateur", description: "Atteindre un score moyen de 70/100", icon: "🎙️",
    evaluate: ({ avgScore }) => ({
      unlocked: avgScore >= 70,
      ...bar(Math.round(avgScore), 70),
    }),
  },
  {
    id: 14, category: "Qualité",
    name: "Expert", description: "Atteindre un score moyen de 85/100", icon: "🧠",
    evaluate: ({ avgScore }) => ({
      unlocked: avgScore >= 85,
      ...bar(Math.round(avgScore), 85),
    }),
  },
  {
    id: 15, category: "Qualité",
    name: "Sans Sophisme", description: "Terminer un débat sans aucun sophisme détecté", icon: "✨",
    evaluate: ({ hasSophismFreeDebate }) => ({
      unlocked: hasSophismFreeDebate,
      progress: hasSophismFreeDebate ? 100 : 0,
      progressLabel: hasSophismFreeDebate ? "" : "0 / 1",
    }),
  },
  {
    id: 16, category: "Qualité",
    name: "Quasi-Parfait", description: "Obtenir un score ≥ 95/100 dans un débat", icon: "💎",
    evaluate: ({ hasPerfectScore, avgScore }) => ({
      unlocked: hasPerfectScore,
      ...bar(Math.round(avgScore), 95),
    }),
  },
  {
    id: 24, category: "Qualité",
    name: "Maître du Vitriol", description: "Lancer 10 ad hominems dans un seul débat", icon: "🤡",
    evaluate: ({ maxAdHominem }) => ({
      unlocked: maxAdHominem >= 10,
      ...bar(maxAdHominem, 10),
    }),
  },

  // ── Progression ───────────────────────────────────────────────────────────
  {
    id: 17, category: "Progression",
    name: "Apprenti", description: "Atteindre 1 300 Elo", icon: "📈",
    evaluate: ({ elo }) => ({ unlocked: elo >= 1300, ...bar(elo, 1300) }),
  },
  {
    id: 18, category: "Progression",
    name: "Confirmé", description: "Atteindre 1 500 Elo", icon: "🥈",
    evaluate: ({ elo }) => ({ unlocked: elo >= 1500, ...bar(elo, 1500) }),
  },
  {
    id: 19, category: "Progression",
    name: "Maître", description: "Atteindre 1 800 Elo", icon: "🥇",
    evaluate: ({ elo }) => ({ unlocked: elo >= 1800, ...bar(elo, 1800) }),
  },
  {
    id: 20, category: "Progression",
    name: "Élite", description: "Atteindre 2 000 Elo", icon: "🏅",
    evaluate: ({ elo }) => ({ unlocked: elo >= 2000, ...bar(elo, 2000) }),
  },
  {
    id: 21, category: "Progression",
    name: "Niveau 5", description: "Atteindre le niveau 5", icon: "🌱",
    evaluate: ({ level }) => ({ unlocked: level >= 5, ...bar(level, 5) }),
  },
  {
    id: 22, category: "Progression",
    name: "Niveau 10", description: "Atteindre le niveau 10", icon: "🌿",
    evaluate: ({ level }) => ({ unlocked: level >= 10, ...bar(level, 10) }),
  },
  {
    id: 23, category: "Progression",
    name: "Niveau 25", description: "Atteindre le niveau 25", icon: "🌳",
    evaluate: ({ level }) => ({ unlocked: level >= 25, ...bar(level, 25) }),
  },
];

/** The meta-achievement — must be evaluated after all others. */
export const GRAND_MAITRE: AchievementDefinition = {
  id: 99, category: "Ultime",
  name: "Grand Maître", description: "Débloquer tous les autres succès", icon: "🌟",
  evaluate: ({ othersUnlockedCount, othersTotal }) => ({
    unlocked: othersTotal > 0 && othersUnlockedCount >= othersTotal,
    ...bar(othersUnlockedCount, othersTotal || 1),
  }),
};

// ── Stats computation ─────────────────────────────────────────────────────────

/** Derive an AchievementStats object from raw debates fetched from the DB. */
export function computeStats(
  debates: DebateSummary[],
  userId: string,
  wins: number,
  losses: number,
  elo: number,
  level: number,
  xp: number,
): AchievementStats {
  const rankedDebates = debates.filter((d) => d.mode !== "training");

  // Max consecutive wins (ranked/casual only)
  const finishedRanked = [...rankedDebates]
    .filter((d) => d.status === "finished")
    .sort((a, b) => new Date(a.id).getTime() - new Date(b.id).getTime()); // stable by id since no createdAt here
  let maxStreak = 0, cur = 0;
  for (const d of finishedRanked) {
    if (d.winnerId === userId) { cur++; maxStreak = Math.max(maxStreak, cur); }
    else cur = 0;
  }

  // Average score across all analysed debates
  const scores = debates.flatMap((d) => {
    if (!d.analysis) return [];
    const s = d.player1Id === userId ? d.analysis.player1Score : d.analysis.player2Score;
    return s != null ? [s] : [];
  });
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  const hasSophismFreeDebate = debates.some((d) => {
    if (!d.analysis?.sophisms) return false;
    try { return (JSON.parse(d.analysis.sophisms) as unknown[]).length === 0; }
    catch { return false; }
  });

  const hasPerfectScore = debates.some((d) => {
    const s = d.player1Id === userId ? d.analysis?.player1Score : d.analysis?.player2Score;
    return s != null && s >= 95;
  });

  const maxAdHominem = debates.reduce((best, d) => {
    if (!d.analysis?.sophisms) return best;
    try {
      const sophisms = JSON.parse(d.analysis.sophisms) as { name: string; count: number }[];
      const ah = sophisms.find((s) => s.name.toLowerCase().includes("hominem"));
      return Math.max(best, ah?.count ?? 0);
    } catch { return best; }
  }, 0);

  const rankedWins = rankedDebates.filter((d) => d.winnerId === userId).length;

  return {
    totalDebates: debates.length,
    rankedWins,
    wins,
    losses,
    elo,
    level,
    xp,
    maxStreak,
    avgScore,
    hasSophismFreeDebate,
    hasPerfectScore,
    playedModes: [...new Set(debates.map((d) => d.mode))],
    maxAdHominem,
    othersUnlockedCount: 0,
    othersTotal: 0,
  };
}

/**
 * Evaluate every achievement (including Grand Maître) against the given stats.
 * Returns results ordered by category, with existing DB unlock dates merged in.
 */
export function evaluateAll(
  stats: AchievementStats,
  existingUnlocks: Map<number, Date>, // achievementId → unlockedAt from DB
): { category: string; items: AchievementResult[] }[] {
  // Evaluate main achievements
  const regular = ACHIEVEMENTS.map((def): AchievementResult => {
    const { unlocked, progress, progressLabel } = def.evaluate(stats);
    const dbDate = existingUnlocks.get(def.id);
    return {
      id: def.id,
      category: def.category,
      name: def.name,
      description: def.description,
      icon: def.icon,
      unlocked,
      unlockedAt: dbDate ? dbDate.toISOString() : null,
      progress: unlocked ? 100 : progress,
      progressLabel: unlocked ? "" : progressLabel,
    };
  });

  // Feed Grand Maître with the count of other unlocked achievements
  const othersUnlockedCount = regular.filter((r) => r.unlocked).length;
  const grandStats: AchievementStats = {
    ...stats,
    othersUnlockedCount,
    othersTotal: ACHIEVEMENTS.length,
  };
  const gm = GRAND_MAITRE;
  const gmResult = gm.evaluate(grandStats);
  const gmDbDate = existingUnlocks.get(gm.id);
  const grandMaitre: AchievementResult = {
    id: gm.id,
    category: gm.category,
    name: gm.name,
    description: gm.description,
    icon: gm.icon,
    unlocked: gmResult.unlocked,
    unlockedAt: gmDbDate ? gmDbDate.toISOString() : null,
    progress: gmResult.unlocked ? 100 : gmResult.progress,
    progressLabel: gmResult.unlocked ? "" : gmResult.progressLabel,
  };

  // Group by category (preserving order of first appearance)
  const all = [...regular, grandMaitre];
  const map = new Map<string, AchievementResult[]>();
  for (const r of all) {
    if (!map.has(r.category)) map.set(r.category, []);
    map.get(r.category)!.push(r);
  }

  return [...map.entries()].map(([category, items]) => ({ category, items }));
}
