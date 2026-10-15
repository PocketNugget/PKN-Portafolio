export type Dir = "up" | "down" | "left" | "right";

export interface Point {
  x: number;
  y: number;
}

export interface SnakeState {
  width: number;
  height: number;
  body: Point[];
  dir: Dir;
  pending?: Dir;
  food: Point;
  score: number;
  dead: boolean;
  tick: number;
}

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

function placeFood(width: number, height: number, body: Point[]): Point {
  const used = new Set(body.map((point) => `${point.x},${point.y}`));
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (!used.has(`${x},${y}`)) return { x, y };
    }
  }
  return { x: 0, y: 0 };
}

export function createSnake(): SnakeState {
  return {
    width: 20,
    height: 12,
    body: [
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 },
    ],
    dir: "right",
    food: { x: 8, y: 5 },
    score: 0,
    dead: false,
    tick: 0,
  };
}

export function snakeAim(state: SnakeState, aim: Dir): SnakeState {
  if (state.dead) return state;
  if (OPPOSITE[state.dir] === aim) return state;
  if (state.pending && OPPOSITE[state.pending] === aim) return state;
  if (aim === (state.pending ?? state.dir)) return state;
  return { ...state, pending: aim };
}

export function stepSnake(state: SnakeState): SnakeState {
  if (state.dead) return state;
  const head = state.body[0];
  if (!head) return { ...state, dead: true };
  const dir = state.pending ?? state.dir;
  const delta = STEP[dir];
  const next = { x: head.x + delta.x, y: head.y + delta.y };
  const out =
    next.x < 0 || next.y < 0 || next.x >= state.width || next.y >= state.height;
  if (out) return { ...state, dir, pending: undefined, dead: true };
  const eat = next.x === state.food.x && next.y === state.food.y;
  const occupied = eat ? state.body : state.body.slice(0, -1);
  if (occupied.some((point) => point.x === next.x && point.y === next.y)) {
    return { ...state, dir, pending: undefined, dead: true };
  }
  const body = [next, ...state.body];
  if (!eat) body.pop();
  return {
    ...state,
    body,
    dir,
    pending: undefined,
    food: eat ? placeFood(state.width, state.height, body) : state.food,
    score: state.score + (eat ? 1 : 0),
    tick: state.tick + 1,
  };
}

export function snakeRender(state: SnakeState): string {
  const head = state.body[0];
  const rest = new Set(state.body.slice(1).map((point) => `${point.x},${point.y}`));
  const rows: string[] = [];
  for (let y = 0; y < state.height; y += 1) {
    let line = "";
    for (let x = 0; x < state.width; x += 1) {
      if (head && head.x === x && head.y === y) line += "@";
      else if (rest.has(`${x},${y}`)) line += "o";
      else if (state.food.x === x && state.food.y === y) line += "*";
      else line += " ";
    }
    rows.push(line);
  }
  const status = state.dead ? "game over. esc leaves" : "arrows move. esc leaves";
  return `${rows.join("\n")}\nscore ${state.score}  ${status}`;
}

export type Kind = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

const ORDER: Kind[] = ["T", "I", "O", "L", "J", "S", "Z"];

const ROT: Record<Kind, Point[][]> = {
  I: [
    [
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 3, y: 1 },
    ],
    [
      { x: 2, y: 0 },
      { x: 2, y: 1 },
      { x: 2, y: 2 },
      { x: 2, y: 3 },
    ],
    [
      { x: 0, y: 2 },
      { x: 1, y: 2 },
      { x: 2, y: 2 },
      { x: 3, y: 2 },
    ],
    [
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
      { x: 1, y: 3 },
    ],
  ],
  O: [
    [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ],
    [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ],
    [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ],
    [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ],
  ],
  T: [
    [
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ],
    [
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 1, y: 2 },
    ],
    [
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 1, y: 2 },
    ],
    [
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
    ],
  ],
  J: [
    [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ],
    [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
    ],
    [
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 2, y: 2 },
    ],
    [
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 2 },
      { x: 1, y: 2 },
    ],
  ],
  L: [
    [
      { x: 2, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ],
    [
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
      { x: 2, y: 2 },
    ],
    [
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 0, y: 2 },
    ],
    [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
    ],
  ],
  S: [
    [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ],
    [
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 2, y: 2 },
    ],
    [
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 0, y: 2 },
      { x: 1, y: 2 },
    ],
    [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
    ],
  ],
  Z: [
    [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ],
    [
      { x: 2, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 1, y: 2 },
    ],
    [
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
      { x: 2, y: 2 },
    ],
    [
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 0, y: 2 },
    ],
  ],
};

export interface TetrisState {
  width: number;
  height: number;
  grid: number[];
  kind: Kind;
  rot: number;
  x: number;
  y: number;
  queue: Kind[];
  score: number;
  lines: number;
  over: boolean;
}

export function clearLines(
  grid: number[],
  width: number,
  height: number,
): { grid: number[]; n: number } {
  const kept: number[][] = [];
  let n = 0;
  for (let y = 0; y < height; y += 1) {
    const row = grid.slice(y * width, (y + 1) * width);
    if (row.length === width && row.every((cell) => cell)) n += 1;
    else kept.push(row);
  }
  while (kept.length < height) kept.unshift(Array.from({ length: width }, () => 0));
  return { grid: kept.flat(), n };
}

function fits(state: TetrisState, kind: Kind, rot: number, x: number, y: number): boolean {
  for (const cell of ROT[kind][rot] ?? []) {
    const cx = cell.x + x;
    const cy = cell.y + y;
    if (cx < 0 || cx >= state.width || cy >= state.height) return false;
    if (cy >= 0 && state.grid[cy * state.width + cx]) return false;
  }
  return true;
}

function spawnX(kind: Kind, width: number): number {
  const cells = ROT[kind][0] ?? [];
  const min = Math.min(...cells.map((cell) => cell.x));
  const max = Math.max(...cells.map((cell) => cell.x));
  return Math.floor((width - (max - min + 1)) / 2) - min;
}

function spawn(state: TetrisState): TetrisState {
  const kind = state.queue[0] ?? "T";
  const queue = state.queue.slice(1);
  if (queue.length < ORDER.length) queue.push(...ORDER);
  const x = spawnX(kind, state.width);
  const next: TetrisState = { ...state, kind, rot: 0, x, y: 0, queue };
  if (!fits(next, kind, 0, x, 0)) return { ...next, over: true };
  return next;
}

export function createTetris(opts?: {
  width?: number;
  height?: number;
  queue?: Kind[];
  grid?: number[];
}): TetrisState {
  const width = opts?.width ?? 10;
  const height = opts?.height ?? 16;
  const grid = opts?.grid ? [...opts.grid] : Array.from({ length: width * height }, () => 0);
  const queue = opts?.queue ? [...opts.queue] : [...ORDER];
  return spawn({
    width,
    height,
    grid,
    kind: "T",
    rot: 0,
    x: 0,
    y: 0,
    queue,
    score: 0,
    lines: 0,
    over: false,
  });
}

function shift(state: TetrisState, dx: number, dy: number): TetrisState {
  if (state.over) return state;
  if (!fits(state, state.kind, state.rot, state.x + dx, state.y + dy)) return state;
  return { ...state, x: state.x + dx, y: state.y + dy };
}

export function tetrisLeft(state: TetrisState): TetrisState {
  return shift(state, -1, 0);
}

export function tetrisRight(state: TetrisState): TetrisState {
  return shift(state, 1, 0);
}

export function tetrisRotate(state: TetrisState): TetrisState {
  if (state.over) return state;
  const rot = (state.rot + 1) % 4;
  for (const kick of [0, -1, 1, -2, 2]) {
    if (fits(state, state.kind, rot, state.x + kick, state.y)) {
      return { ...state, rot, x: state.x + kick };
    }
  }
  return state;
}

function lock(state: TetrisState): TetrisState {
  const grid = state.grid.slice();
  for (const cell of ROT[state.kind][state.rot] ?? []) {
    const x = cell.x + state.x;
    const y = cell.y + state.y;
    if (y < 0) return { ...state, over: true };
    grid[y * state.width + x] = 1;
  }
  const cleared = clearLines(grid, state.width, state.height);
  return spawn({
    ...state,
    grid: cleared.grid,
    score: state.score + cleared.n * 100 + 4,
    lines: state.lines + cleared.n,
  });
}

export function tetrisDown(state: TetrisState): TetrisState {
  if (state.over) return state;
  if (fits(state, state.kind, state.rot, state.x, state.y + 1)) {
    return { ...state, y: state.y + 1 };
  }
  return lock(state);
}

export function tetrisTick(state: TetrisState): TetrisState {
  return tetrisDown(state);
}

export function tetrisHard(state: TetrisState): TetrisState {
  if (state.over) return state;
  let next = state;
  while (fits(next, next.kind, next.rot, next.x, next.y + 1)) {
    next = { ...next, y: next.y + 1 };
  }
  return lock(next);
}

export function tetrisActive(state: TetrisState): Point[] {
  if (state.over) return [];
  return (ROT[state.kind][state.rot] ?? []).map((cell) => ({
    x: cell.x + state.x,
    y: cell.y + state.y,
  }));
}

export function tetrisRender(state: TetrisState): string {
  const active = new Set<string>();
  if (!state.over) {
    for (const cell of ROT[state.kind][state.rot] ?? []) {
      const x = cell.x + state.x;
      const y = cell.y + state.y;
      if (y >= 0) active.add(`${x},${y}`);
    }
  }
  const rows: string[] = [];
  for (let y = 0; y < state.height; y += 1) {
    let line = "|";
    for (let x = 0; x < state.width; x += 1) {
      const filled = state.grid[y * state.width + x] || active.has(`${x},${y}`);
      line += filled ? "[]" : " .";
    }
    rows.push(`${line}|`);
  }
  const status = state.over ? "game over. esc leaves" : "arrows, space drops, esc leaves";
  return `${rows.join("\n")}\nscore ${state.score}  lines ${state.lines}  ${status}`;
}
