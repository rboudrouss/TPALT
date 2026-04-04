import { ELO_K_FACTOR, ELO_FLOOR, ELO_DIVISOR, CASUAL_ELO_WIN, CASUAL_ELO_LOSS } from "./const";

export { CASUAL_ELO_WIN, CASUAL_ELO_LOSS };

export function computeRankedElo(
  elo1: number,
  elo2: number,
  winnerId: string,
  player1Id: string
): { newElo1: number; newElo2: number } {
  const score1 = winnerId === player1Id ? 1 : 0;
  const expected1 = 1 / (1 + Math.pow(10, (elo2 - elo1) / ELO_DIVISOR));

  const newElo1 = Math.max(ELO_FLOOR, Math.round(elo1 + ELO_K_FACTOR * (score1 - expected1)));
  const newElo2 = Math.max(ELO_FLOOR, Math.round(elo2 + ELO_K_FACTOR * ((1 - score1) - (1 - expected1))));

  return { newElo1, newElo2 };
}
