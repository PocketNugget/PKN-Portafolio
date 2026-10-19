import { queueTurn, type Dir, type Point } from "./games";

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

export const CYCLE_WIDTH = 64;
export const CYCLE_HEIGHT = 48;
export const CYCLE_ROUNDS = 5;

export interface Foe {
  pos: Point;
  dir: Dir;
  alive: boolean;
}

/** Trail marks: 0 empty, 1 you, 2 the first enemy, 3 the second. */
export interface CycleState {
  width: number;
  height: number;
  you: Point;
  youDir: Dir;
  pending?: Dir;
  buffered?: Dir;
  foes: Foe[];
  /** Where each bike turned, you first. The drawing joins these into one line per bike. */
  corners: Point[][];
  trail: number[];
  score: number;
  level: number;
  rounds: number;
  tick: number;
  dead: boolean;
  won: boolean;
  fresh: number;
}

export function cycleLevel(tick: number, rounds = 0): number {
  return 1 + Math.max(0, Math.floor(rounds)) + Math.floor(Math.max(0, tick) / 100);
}

export function cyclePace(level: number): number {
  const step = Math.max(0, Math.floor(level) - 1);
  return Math.max(62, 110 - step * 8);
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
  return state.trail[at(state, point)] === 0;
}

function startFoes(): Foe[] {
  return [
    { pos: { x: CYCLE_WIDTH - 9, y: 12 }, dir: "left", alive: true },
    { pos: { x: CYCLE_WIDTH - 9, y: CYCLE_HEIGHT - 13 }, dir: "left", alive: true },
  ];
}

function startGrid(width: number, height: number, foes: Foe[], you: Point): number[] {
  const trail = Array.from({ length: width * height }, () => 0);
  trail[you.y * width + you.x] = 1;
  foes.forEach((foe, index) => {
    trail[foe.pos.y * width + foe.pos.x] = index + 2;
  });
  return trail;
}

function startCorners(you: Point, foes: Foe[]): Point[][] {
  return [[you], ...foes.map((foe) => [foe.pos])];
}

export function createCycle(): CycleState {
  const width = CYCLE_WIDTH;
  const height = CYCLE_HEIGHT;
  const you = { x: 8, y: Math.floor(height / 2) };
  const foes = startFoes();
  return {
    width,
    height,
    you,
    youDir: "right",
    foes,
    corners: startCorners(you, foes),
    trail: startGrid(width, height, foes, you),
    score: 0,
    level: 1,
    rounds: 0,
    tick: 0,
    dead: false,
    won: false,
    fresh: 0,
  };
}

export function cycleAim(state: CycleState, aim: Dir): CycleState {
  if (state.dead || state.won) return state;
  const next = queueTurn(state.youDir, state.pending, state.buffered, aim);
  if (!next) return state;
  return { ...state, pending: next.pending, buffered: next.buffered };
}

function room(state: CycleState, from: Point, dir: Dir, block: Point | null): number {
  const seen = new Set<number>();
  const queue = [ahead(from, dir)];
  let count = 0;
  while (queue.length > 0 && count < 48) {
    const cell = queue.shift();
    if (!cell || !open(state, cell, block)) continue;
    const key = at(state, cell);
    if (seen.has(key)) continue;
    seen.add(key);
    count += 1;
    for (const dirNext of DIRS) queue.push(ahead(cell, dirNext));
  }
  return count;
}

function distance(a: Point, b: Point): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

/** The first enemy hunts: it aims for the cell ahead of you. The second one plays for open space. */
function chooseFoe(state: CycleState, foe: Foe, index: number, youNext: Point): Dir {
  let best = foe.dir;
  let bestScore = -1;
  const lead = { x: youNext.x, y: youNext.y };
  if (index === 0) {
    for (let step = 0; step < 6; step += 1) {
      const probe = ahead(lead, state.youDir);
      if (!inside(state, probe)) break;
      lead.x = probe.x;
      lead.y = probe.y;
    }
  }
  for (const dir of DIRS) {
    if (dir === OPPOSITE[foe.dir]) continue;
    const next = ahead(foe.pos, dir);
    if (!open(state, next, youNext)) continue;
    let score = room(state, foe.pos, dir, youNext) * 2;
    if (dir === foe.dir) score += 3;
    if (index === 0) {
      if (distance(next, lead) < distance(foe.pos, lead)) score += 6;
    } else if (state.level >= 3 && distance(next, youNext) < distance(foe.pos, youNext)) {
      score += 3;
    }
    if (score > bestScore) {
      best = dir;
      bestScore = score;
    }
  }
  return best;
}

export function stepCycle(state: CycleState): CycleState {
  if (state.dead || state.won) return state;
  const youDir = state.pending ?? state.youDir;
  const queued = state.buffered;
  const youNext = ahead(state.you, youDir);
  const tick = state.tick + 1;
  const level = cycleLevel(tick, state.rounds);
  const base: CycleState = {
    ...state,
    youDir,
    pending: queued,
    buffered: undefined,
    tick,
    level,
    score: state.score + state.level,
    fresh: Math.max(0, state.fresh - 1),
  };
  if (!open(state, youNext, null)) return { ...base, dead: true };

  const trail = state.trail.slice();
  const nexts = state.foes.map((foe, index) => {
    if (!foe.alive) return { dir: foe.dir, next: foe.pos };
    const dir = chooseFoe(state, foe, index, youNext);
    return { dir, next: ahead(foe.pos, dir) };
  });
  let rammed = false;
  const alive = state.foes.map((foe) => foe.alive);
  nexts.forEach((move, index) => {
    if (!alive[index]) return;
    if (move.next.x === youNext.x && move.next.y === youNext.y) {
      rammed = true;
      alive[index] = false;
    } else if (!open(state, move.next, null)) alive[index] = false;
  });
  nexts.forEach((move, index) => {
    if (!alive[index]) return;
    nexts.forEach((other, otherIndex) => {
      if (otherIndex <= index || !alive[otherIndex]) return;
      if (other.next.x === move.next.x && other.next.y === move.next.y) {
        alive[index] = false;
        alive[otherIndex] = false;
      }
    });
  });
  if (rammed) return { ...base, dead: true };

  trail[at(state, youNext)] = 1;
  const foes: Foe[] = state.foes.map((foe, index) => {
    const move = nexts[index];
    if (!move || !foe.alive) return foe;
    if (!alive[index]) return { ...foe, dir: move.dir, alive: false };
    trail[at(state, move.next)] = index + 2;
    return { pos: move.next, dir: move.dir, alive: true };
  });
  let crashed = 0;
  state.foes.forEach((foe, index) => {
    if (!foe.alive || alive[index]) return;
    crashed += 1;
    for (let cell = 0; cell < trail.length; cell += 1) if (trail[cell] === index + 2) trail[cell] = 0;
  });
  const score = base.score + crashed * 25 * state.level;
  const corners = state.corners.map((line) => line.slice());
  if (youDir !== state.youDir) corners[0]?.push(state.you);
  state.foes.forEach((foe, index) => {
    const move = nexts[index];
    if (move && foe.alive && alive[index] && move.dir !== foe.dir) corners[index + 1]?.push(foe.pos);
    if (foe.alive && !alive[index]) corners[index + 1] = [];
  });
  const moved: CycleState = { ...base, you: youNext, foes, corners, trail, score, fresh: crashed > 0 ? 12 : base.fresh };
  if (foes.some((foe) => foe.alive)) return moved;

  const rounds = state.rounds + 1;
  const bonus = score + 100 * state.level;
  if (rounds >= CYCLE_ROUNDS) return { ...moved, rounds, score: bonus, won: true, fresh: 12 };
  const you = { x: 8, y: Math.floor(state.height / 2) };
  const fresh = startFoes();
  return {
    ...moved,
    you,
    youDir: "right",
    pending: undefined,
    buffered: undefined,
    foes: fresh,
    corners: startCorners(you, fresh),
    trail: startGrid(state.width, state.height, fresh, you),
    rounds,
    level: cycleLevel(tick, rounds),
    score: bonus,
    fresh: 12,
  };
}
