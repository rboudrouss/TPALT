const K = 32;
const ELO_FLOOR = 100;

export function computeRankedElo(
  elo1: number,
  elo2: number,
  winnerId: string,
  player1Id: string
): { newElo1: number; newElo2: number } {
  const score1 = winnerId === player1Id ? 1 : 0;
  const expected1 = 1 / (1 + Math.pow(10, (elo2 - elo1) / 400));

  const newElo1 = Math.max(ELO_FLOOR, Math.round(elo1 + K * (score1 - expected1)));
  const newElo2 = Math.max(ELO_FLOOR, Math.round(elo2 + K * ((1 - score1) - (1 - expected1))));

  return { newElo1, newElo2 };
}

export const CASUAL_ELO_WIN = 15;
export const CASUAL_ELO_LOSS = -10;
