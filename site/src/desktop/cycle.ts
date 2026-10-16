import type { Dir, Point } from "./games";

const OPPOSITE: Record<Dir, Dir> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

const STEP: Record<Dir, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const DIRS: Dir[] = ["up", "down", "left", "right"];

export const CYCLE_WIDTH = 28;
export const CYCLE_HEIGHT = 16;

export interface CycleState {
  width: number;
  height: number;
  you: Point;
  youDir: Dir;
  pending?: Dir;
  foe: Point;
  foeDir: Dir;
  foeAlive: boolean;
  trail: number[];
  score: number;
  level: number;
  tick: number;
  dead: boolean;
  won: boolean;
  fresh: number;
}

export function cycleLevel(tick: number): number {
  return 1 + Math.floor(Math.max(0, tick) / 20);
}

export function cyclePace(level: number): number {
  const step = Math.max(0, Math.floor(level) - 1);
  return Math.max(68, 156 - step * 10);
}

function at(state: CycleState, point: Point): number {
  return point.y * state.width + point.x;
}

function inside(state: CycleState, point: Point): boolean {
  return point.x >= 0 && point.y >= 0 && point.x < state.width && point.y < state.height;
}

function ahead(point: Point, dir: Dir): Point {
  const delta = STEP[dir];
  return { x: point.x + delta.x, y: point.y + delta.y };
}

function open(state: CycleState, point: Point, block: Point | null): boolean {
  if (!inside(state, point)) return false;
  if (block && block.x === point.x && block.y === point.y) return false;
  const mark = state.trail[at(state, point)];
  return mark === 0;
}

export function createCycle(): CycleState {
  const width = CYCLE_WIDTH;
  const height = CYCLE_HEIGHT;
  const you = { x: 4, y: 8 };
  const foe = { x: 23, y: 8 };
  const trail = Array.from({ length: width * height }, () => 0);
  trail[you.y * width + you.x] = 1;
  trail[foe.y * width + foe.x] = 2;
  return {
    width,
    height,
    you,
    youDir: "right",
    foe,
    foeDir: "left",
    foeAlive: true,
    trail,
    score: 0,
    level: 1,
    tick: 0,
    dead: false,
    won: false,
    fresh: 0,
  };
}

export function cycleAim(state: CycleState, aim: Dir): CycleState {
  if (state.dead || state.won) return state;
  if (OPPOSITE[state.youDir] === aim) return state;
  if (state.pending && OPPOSITE[state.pending] === aim) return state;
  if (aim === (state.pending ?? state.youDir)) return state;
  return { ...state, pending: aim };
}

function room(state: CycleState, from: Point, dir: Dir, block: Point | null): number {
  const seen = new Set<string>();
  const queue = [ahead(from, dir)];
  let count = 0;
  while (queue.length > 0 && count < 16) {
    const cell = queue.shift();
    if (!cell) break;
    const key = `${cell.x},${cell.y}`;
    if (seen.has(key) || !open(state, cell, block)) continue;
    seen.add(key);
    count += 1;
    for (const dirNext of DIRS) queue.push(ahead(cell, dirNext));
  }
  return count;
}

function chooseFoe(state: CycleState, block: Point): Dir {
  let best = state.foeDir;
  let bestScore = -1;
  for (const dir of DIRS) {
    if (dir === OPPOSITE[state.foeDir]) continue;
    const next = ahead(state.foe, dir);
    if (!open(state, next, block)) continue;
    let score = room(state, state.foe, dir, block);
    if (dir === state.foeDir) score += 2;
    if (state.level >= 3) {
      const now = Math.abs(state.foe.x - block.x) + Math.abs(state.foe.y - block.y);
      const later = Math.abs(next.x - block.x) + Math.abs(next.y - block.y);
      if (later < now) score += 3;
    }
    if (score > bestScore) {
      best = dir;
      bestScore = score;
    }
  }
  return best;
}

function respawn(state: CycleState, trail: number[], you: Point): { foe: Point; foeDir: Dir } | null {
  const look: CycleState = { ...state, trail, you };
  let pick: { foe: Point; foeDir: Dir; far: number } | null = null;
  for (let y = 1; y < state.height - 1; y += 2) {
    for (let x = 1; x < state.width - 1; x += 3) {
      const cell = { x, y };
      if (!open(look, cell, null)) continue;
      for (const dir of DIRS) {
        const first = ahead(cell, dir);
        const second = ahead(first, dir);
        if (!open(look, first, null) || !open(look, second, null)) continue;
        const far = Math.abs(x - you.x) + Math.abs(y - you.y);
        if (!pick || far > pick.far) pick = { foe: cell, foeDir: dir, far };
      }
    }
  }
  return pick ? { foe: pick.foe, foeDir: pick.foeDir } : null;
}

function dropYourTrail(trail: number[], keep: number): void {
  for (let index = 0; index < trail.length; index += 1) {
    if (trail[index] === 1) trail[index] = 0;
  }
  trail[keep] = 1;
}

export function stepCycle(state: CycleState): CycleState {
  if (state.dead || state.won) return state;
  const youDir = state.pending ?? state.youDir;
  const youNext = ahead(state.you, youDir);
  const youCrash = !open(state, youNext, null);
  const tick = state.tick + 1;
  const level = cycleLevel(tick);
  const score = state.score + state.level;
  const base: CycleState = {
    ...state,
    youDir,
    pending: undefined,
    tick,
    level,
    score,
    fresh: Math.max(0, state.fresh - 1),
  };
  let foeDir = state.foeDir;
  let foeNext = state.foe;
  if (state.foeAlive && !youCrash) {
    foeDir = chooseFoe(state, youNext);
    foeNext = ahead(state.foe, foeDir);
    if (foeNext.x === youNext.x && foeNext.y === youNext.y) {
      return { ...base, foeDir, dead: true, foeAlive: false };
    }
  }
  if (youCrash) return { ...base, dead: true };
  const trail = state.trail.slice();
  trail[at(state, youNext)] = 1;
  if (!state.foeAlive) return { ...base, trail, you: youNext, foeDir };
  if (!open(state, foeNext, youNext)) {
    dropYourTrail(trail, at(state, youNext));
    const spawned = respawn(state, trail, youNext);
    const bonus = score + 15 * state.level;
    if (!spawned) {
      return { ...base, trail, you: youNext, foeDir, foeAlive: false, score: bonus, won: true, fresh: 12 };
    }
    trail[at(state, spawned.foe)] = 2;
    return {
      ...base,
      trail,
      you: youNext,
      foe: spawned.foe,
      foeDir: spawned.foeDir,
      foeAlive: true,
      score: bonus,
      fresh: 12,
    };
  }
  trail[at(state, foeNext)] = 2;
  return { ...base, trail, you: youNext, foe: foeNext, foeDir };
}
