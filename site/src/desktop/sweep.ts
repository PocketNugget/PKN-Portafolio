import { t } from "../i18n";
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

export function sweepFlagsLeft(state: SweepState): number {
  const flags = state.cells.filter((cell) => cell.flag).length;
  return state.mines - flags;
}

export function mountSweep(host: HTMLElement): DeskApp {
  host.replaceChildren();
  let state = createSweep();
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
  again.textContent = t("New");
  const status = document.createElement("p");
  status.className = "meta";
  const grid = document.createElement("div");
  grid.className = "sweep-grid";
  bar.append(mines, clock, flag, again);
  root.append(bar, status, grid);
  host.append(root);

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
  const paint = () => {
    const left = sweepFlagsLeft(state);
    mines.textContent = String(left).padStart(3, "0");
    mines.setAttribute("aria-label", `${t("Mines")} ${left}`);
    clock.textContent = String(seconds).padStart(3, "0");
    clock.setAttribute("aria-label", `${seconds}s`);
    flag.setAttribute("aria-pressed", String(flagMode));
    status.textContent = state.won
      ? t("Clear.")
      : state.alive
        ? `${t("Open a cell. Flag marks a guess.")} ${t("Hold a cell to flag it.")}`
        : t("A mine. New starts again.");
    grid.replaceChildren();
    state.cells.forEach((cell, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "sweep-cell";
      if (cell.open) button.classList.add("open");
      if (cell.mine && cell.open) button.classList.add("mine");
      button.textContent = cell.flag && !cell.open ? "F" : cell.open && cell.mine ? "*" : cell.open && cell.near ? String(cell.near) : "";
      button.setAttribute("aria-label", `Cell ${index + 1}`);
      let hold = 0;
      const clearHold = () => {
        if (!hold) return;
        window.clearTimeout(hold);
        hold = 0;
      };
      button.addEventListener("pointerdown", (event) => {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        clearHold();
        hold = window.setTimeout(() => {
          hold = 0;
          state = sweepFlag(state, index);
          suppressUntil = performance.now() + 400;
          if (!state.alive || state.won) stop();
          paint();
        }, 380);
      });
      button.addEventListener("pointerup", clearHold);
      button.addEventListener("pointercancel", clearHold);
      button.addEventListener("click", () => {
        clearHold();
        if (performance.now() < suppressUntil) return;
        state = flagMode ? sweepFlag(state, index) : sweepOpen(state, index);
        if (!state.alive || state.won) stop();
        else start();
        paint();
      });
      button.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        state = sweepFlag(state, index);
        paint();
      });
      grid.append(button);
    });
  };
  flag.addEventListener("click", () => {
    flagMode = !flagMode;
    paint();
  });
  again.addEventListener("click", () => {
    stop();
    state = createSweep();
    seconds = 0;
    flagMode = false;
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
    },
  };
}
