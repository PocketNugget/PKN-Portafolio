import { cleanLine } from "./plain";

export const GAMES = ["snake", "tetris", "sweep", "tron"] as const;

export type GameId = (typeof GAMES)[number];

export const NAME_MAX = 16;
export const LEVEL_CAP = 120;
export const TOP_N = 8;
export const SCORE_LIMIT = 10;

export const SCORE_CAP: Record<GameId, number> = {
  snake: 300,
  tetris: 100_000,
  sweep: 20_000,
  tron: 12_000,
};

const NAME_OK = /^[\p{L}\p{N}][\p{L}\p{N} ._-]{0,15}$/u;

export function parseGame(value: unknown): GameId | null {
  if (typeof value !== "string") return null;
  return (GAMES as readonly string[]).includes(value) ? (value as GameId) : null;
}

export function parseScoreName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const text = cleanLine(value, NAME_MAX);
  if (!text || !NAME_OK.test(text)) return null;
  return text;
}

export function parseLevel(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isInteger(value)) return null;
  if (value < 1 || value > LEVEL_CAP) return null;
  return value;
}

export function parseScore(game: GameId, value: unknown): number | null {
  if (typeof value !== "number" || !Number.isInteger(value)) return null;
  if (value < 1 || value > SCORE_CAP[game]) return null;
  return value;
}
