import { t } from "../i18n";
import { mountBoard, type BoardHandle } from "./board";
import type { DeskApp } from "./host";

export interface SweepCell {
  mine: boolean;
  open: boolean;
  flag: boolean;
  near: number;
}

export interface SweepState {
  width: number;
  height: number;
  mines: number;
  cells: SweepCell[];
  alive: boolean;
  won: boolean;
  armed: boolean;
}

export function createSweep(width = 9, height = 9, mines = 10): SweepState {
  const count = width * height;
  const cells = Array.from({ length: count }, () => ({
    mine: false,
    open: false,
    flag: false,
    near: 0,
  }));
  return {
    width,
    height,
    mines: Math.min(mines, Math.max(0, count - 1)),
    cells,
    alive: true,
    won: false,
    armed: false,
  };
}

function neighbors(state: SweepState, index: number): number[] {
  const x = index % state.width;
  const y = Math.floor(index / state.width);
  const found: number[] = [];
  for (let dy = -1; dy <= 1; dy += 1) {
    for (let dx = -1; dx <= 1; dx += 1) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= state.width || ny >= state.height) continue;
      found.push(ny * state.width + nx);
    }
  }
  return found;
}

function arm(state: SweepState, safe: number, rand: () => number): SweepState {
  const spots = state.cells.map((_, index) => index).filter((index) => index !== safe);
  for (let i = spots.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    const left = spots[i];
    const right = spots[j];
    if (left === undefined || right === undefined) continue;
    spots[i] = right;
    spots[j] = left;
  }
  const cells = state.cells.map((cell) => ({ ...cell, mine: false, near: 0 }));
  for (const index of spots.slice(0, state.mines)) {
    const cell = cells[index];
    if (cell) cell.mine = true;
  }
  cells.forEach((cell, index) => {
    if (cell.mine) return;
    cell.near = neighbors(state, index).filter((near) => cells[near]?.mine).length;
  });
  return { ...state, cells, armed: true };
}

function reveal(state: SweepState, index: number): SweepState {
  const cells = state.cells.map((cell) => ({ ...cell }));
  const start = cells[index];
  if (!start || start.open || start.flag) return state;
  const queue = [index];
  while (queue.length) {
    const current = queue.pop();
    if (current === undefined) break;
    const cell = cells[current];
    if (!cell || cell.open || cell.flag) continue;
    cell.open = true;
    if (cell.mine || cell.near > 0) continue;
    for (const near of neighbors(state, current)) queue.push(near);
  }
  const won = cells.every((cell) => cell.mine || cell.open);
  return { ...state, cells, won, alive: state.alive };
}

export function sweepOpen(state: SweepState, index: number, rand: () => number = Math.random): SweepState {
  if (!state.alive || state.won) return state;
  const cell = state.cells[index];
  if (!cell || cell.open || cell.flag) return state;
  const armed = state.armed ? state : arm(state, index, rand);
  const after = armed.cells[index];
  if (after?.mine) {
    const cells = armed.cells.map((item) => ({ ...item, open: item.mine ? true : item.open }));
    return { ...armed, cells, alive: false };
  }
  return reveal(armed, index);
}

export function sweepFlag(state: SweepState, index: number): SweepState {
  if (!state.alive || state.won) return state;
  const cell = state.cells[index];
  if (!cell || cell.open) return state;
  const cells = state.cells.map((item, itemIndex) =>
    itemIndex === index ? { ...item, flag: !item.flag } : item,
  );
  return { ...state, cells };
}

/** Classic chord: on an open number whose flags already match, open every other neighbor. */
export function sweepChord(state: SweepState, index: number): SweepState {
  if (!state.alive || state.won) return state;
  const cell = state.cells[index];
  if (!cell || !cell.open || cell.near === 0) return state;
  const around = neighbors(state, index);
  const flags = around.filter((near) => state.cells[near]?.flag).length;
  if (flags !== cell.near) return state;
  let next = state;
  for (const near of around) {
    const target = next.cells[near];
    if (!target || target.open || target.flag) continue;
    if (target.mine) {
      const cells = next.cells.map((item) => ({ ...item, open: item.mine ? true : item.open }));
      return { ...next, cells, alive: false };
    }
    next = reveal(next, near);
  }
  return next;
}

/** What a screen reader hears for one cell. */
export function sweepCellLabel(state: SweepState, index: number): string {
  const cell = state.cells[index];
  const row = Math.floor(index / state.width) + 1;
  const col = (index % state.width) + 1;
  const where = `${t("Row")} ${row}, ${t("column")} ${col}`;
  if (!cell) return where;
  if (cell.open && cell.mine) return `${where}: ${t("mine")}`;
  if (cell.open) return `${where}: ${cell.near ? `${cell.near} ${t("near")}` : t("empty")}`;
  if (cell.flag) return `${where}: ${t("flagged")}`;
  return `${where}: ${t("hidden")}`;
}

export function sweepFlagsLeft(state: SweepState): number {
  const flags = state.cells.filter((cell) => cell.flag).length;
  return state.mines - flags;
}

export const SWEEP_MAX = 8;

const SWEEP_TIERS: { width: number; height: number; mines: number }[] = [
  { width: 9, height: 9, mines: 10 },
  { width: 9, height: 9, mines: 15 },
  { width: 10, height: 10, mines: 20 },
  { width: 12, height: 12, mines: 28 },
  { width: 12, height: 12, mines: 34 },
  { width: 14, height: 14, mines: 42 },
  { width: 14, height: 14, mines: 48 },
  { width: 16, height: 16, mines: 55 },
];

export function sweepTier(level: number): { width: number; height: number; mines: number } {
  const index = Math.max(0, Math.min(SWEEP_TIERS.length - 1, Math.floor(level) - 1));
  return SWEEP_TIERS[index] ?? SWEEP_TIERS[0]!;
}

export function sweepSafeOpen(state: SweepState): number {
  return state.cells.filter((cell) => cell.open && !cell.mine).length;
}

export function sweepPoints(opened: number, level: number, won: boolean): number {
  const lv = Math.max(1, Math.floor(level));
  return Math.max(0, opened) * lv + (won ? 25 * lv : 0);
}

function sweepBoard(level: number): SweepState {
  const tier = sweepTier(level);
  return createSweep(tier.width, tier.height, tier.mines);
}

export function mountSweep(host: HTMLElement): DeskApp {
  host.replaceChildren();
  let level = 1;
  let bank = 0;
  let rose = false;
  let state = sweepBoard(level);
  let flagMode = false;
  let seconds = 0;
  let timer = 0;
  let suppressUntil = 0;
  const root = document.createElement("div");
  root.className = "sweep-app";
  const bar = document.createElement("div");
  bar.className = "sweep-bar";
  const mines = document.createElement("span");
  mines.className = "sweep-readout";
  const clock = document.createElement("span");
  clock.className = "sweep-readout";
  const flag = document.createElement("button");
  flag.type = "button";
  flag.textContent = t("Flag");
  const again = document.createElement("button");
  again.type = "button";
  again.dataset.role = "again";
  again.textContent = t("Again");
  const status = document.createElement("p");
  status.className = "meta";
  const grid = document.createElement("div");
  grid.className = "sweep-grid";
  bar.append(mines, clock, flag, again);
  root.append(bar, status, grid);
  host.append(root);
  const board: BoardHandle = mountBoard(root, "sweep");
  const total = () => {
    const last = state.won && level >= SWEEP_MAX;
    if (!state.armed && state.alive && !state.won) return bank;
    return bank + sweepPoints(sweepSafeOpen(state), level, last);
  };

  const stop = () => {
    if (!timer) return;
    window.clearInterval(timer);
    timer = 0;
  };
  const start = () => {
    if (timer || !state.armed || !state.alive || state.won) return;
    timer = window.setInterval(() => {
      seconds += 1;
      paint();
    }, 1000);
  };
  let focus = 0;
  let built = "";
  const coarse = () => matchMedia("(pointer: coarse), (max-width: 700px)").matches;
  const act = (index: number, mark: boolean) => {
    rose = false;
    const cell = state.cells[index];
    if (mark) state = sweepFlag(state, index);
    else if (cell?.open) state = sweepChord(state, index);
    else state = flagMode ? sweepFlag(state, index) : sweepOpen(state, index);
    if (state.won && level < SWEEP_MAX) {
      bank += sweepPoints(sweepSafeOpen(state), level, true);
      level += 1;
      state = sweepBoard(level);
      seconds = 0;
      stop();
      rose = true;
      focus = 0;
    } else if (!state.alive || state.won) stop();
    else start();
    paint();
  };
  const build = () => {
    built = `${state.width}x${state.height}`;
    grid.style.gridTemplateColumns = `repeat(${state.width}, minmax(0, 1fr))`;
    grid.setAttribute("role", "group");
    grid.setAttribute("aria-label", t("Minefield"));
    grid.replaceChildren();
    state.cells.forEach((_, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "sweep-cell";
      button.dataset.index = String(index);
      let hold = 0;
      const clearHold = () => {
        if (!hold) return;
        window.clearTimeout(hold);
        hold = 0;
      };
      button.addEventListener("pointerdown", (event) => {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        focus = index;
        clearHold();
        hold = window.setTimeout(() => {
          hold = 0;
          suppressUntil = performance.now() + 400;
          act(index, true);
        }, 380);
      });
      button.addEventListener("pointerup", clearHold);
      button.addEventListener("pointercancel", clearHold);
      button.addEventListener("click", () => {
        clearHold();
        if (performance.now() < suppressUntil) return;
        focus = index;
        act(index, false);
      });
      button.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        focus = index;
        act(index, true);
      });
      grid.append(button);
    });
  };
  grid.addEventListener("keydown", (event) => {
    const moves: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    const move = moves[event.key];
    if (move) {
      event.preventDefault();
      event.stopPropagation();
      const x = Math.min(state.width - 1, Math.max(0, (focus % state.width) + move[0]));
      const y = Math.min(state.height - 1, Math.max(0, Math.floor(focus / state.width) + move[1]));
      focus = y * state.width + x;
      paint();
      grid.querySelector<HTMLButtonElement>(`[data-index="${focus}"]`)?.focus();
      return;
    }
    if (event.key === "f" || event.key === "F") {
      event.preventDefault();
      act(focus, true);
      grid.querySelector<HTMLButtonElement>(`[data-index="${focus}"]`)?.focus();
    }
  });
  const paint = () => {
    const left = sweepFlagsLeft(state);
    mines.textContent = String(left).padStart(3, "0");
    mines.setAttribute("aria-label", `${t("Mines")} ${left}`);
    clock.textContent = String(seconds).padStart(3, "0");
    clock.setAttribute("aria-label", `${seconds}s`);
    flag.setAttribute("aria-pressed", String(flagMode));
    const done = !state.alive || (state.won && level >= SWEEP_MAX);
    const message = rose
      ? t("Clear. The next grid is tighter.")
      : state.won
        ? t("You cleared the last grid.")
        : state.alive
          ? coarse()
            ? t("Tap opens. Hold a cell or turn on Flag to mark a mine.")
            : t("Click opens, right-click flags. Arrows and F work too.")
          : t("A mine. Again starts over.");
    status.textContent = `${t("Score")} ${total()}  ${t("Level")} ${level}  ${message}`;
    board.setOffer(total(), level, done);
    if (built !== `${state.width}x${state.height}` || grid.childElementCount !== state.cells.length) build();
    const buttons = grid.querySelectorAll<HTMLButtonElement>(".sweep-cell");
    state.cells.forEach((cell, index) => {
      const button = buttons[index];
      if (!button) return;
      button.className = "sweep-cell";
      if (cell.open) button.classList.add("open");
      if (cell.mine && cell.open) button.classList.add("mine");
      if (cell.flag && !cell.open) button.classList.add("flag");
      if (cell.open && !cell.mine && cell.near) button.classList.add(`n${cell.near}`);
      const text = cell.flag && !cell.open ? "\u2691" : cell.open && cell.mine ? "\u2739" : cell.open && cell.near ? String(cell.near) : "";
      if (button.textContent !== text) button.textContent = text;
      const label = sweepCellLabel(state, index);
      if (button.getAttribute("aria-label") !== label) button.setAttribute("aria-label", label);
      button.tabIndex = index === focus ? 0 : -1;
    });
  };
  flag.addEventListener("click", () => {
    flagMode = !flagMode;
    paint();
  });
  again.addEventListener("click", () => {
    stop();
    level = 1;
    bank = 0;
    rose = false;
    state = sweepBoard(level);
    seconds = 0;
    flagMode = false;
    focus = 0;
    paint();
  });
  paint();
  return {
    pause() {
      stop();
    },
    resume() {
      start();
    },
    destroy() {
      stop();
      board.destroy();
    },
  };
}
