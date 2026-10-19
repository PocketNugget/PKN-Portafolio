import { t } from "../i18n";
import type { DeskApp } from "./host";
import { idleApp } from "./host";

export const DIE_SIDES = [4, 6, 8, 10, 12, 20] as const;

export function rollDie(sides: number, roll: () => number = Math.random): number {
  const count = DIE_SIDES.includes(sides as (typeof DIE_SIDES)[number]) ? sides : 6;
  return 1 + Math.floor(roll() * count);
}

export function flipCoin(roll: () => number = Math.random): "heads" | "tails" {
  return roll() < 0.5 ? "heads" : "tails";
}

export interface MathState {
  display: string;
  acc: number | null;
  op: "+" | "-" | "*" | "/" | null;
  fresh: boolean;
}

export function mathStart(): MathState {
  return { display: "0", acc: null, op: null, fresh: true };
}

function applyOp(left: number, op: "+" | "-" | "*" | "/", right: number): number {
  if (op === "+") return left + right;
  if (op === "-") return left - right;
  if (op === "*") return left * right;
  return right === 0 ? Number.NaN : left / right;
}

function show(value: number): string {
  if (!Number.isFinite(value)) return "error";
  const rounded = Math.round(value * 1e8) / 1e8;
  const text = String(rounded);
  return text.length > 14 ? rounded.toExponential(6) : text;
}

export function mathKey(state: MathState, key: string): MathState {
  if (key === "C") return mathStart();
  if (key === ".") {
    if (state.fresh) return { ...state, display: "0.", fresh: false };
    if (state.display.includes(".")) return state;
    return { ...state, display: `${state.display}.`, fresh: false };
  }
  if (/^[0-9]$/.test(key)) {
    if (state.fresh || state.display === "0") return { ...state, display: key, fresh: false };
    if (state.display.replace("-", "").length >= 12) return state;
    return { ...state, display: state.display + key, fresh: false };
  }
  if (key === "+" || key === "-" || key === "*" || key === "/") {
    const value = Number(state.display);
    if (!Number.isFinite(value)) return mathStart();
    if (state.acc === null || state.op === null || state.fresh) {
      return { ...state, acc: value, op: key, fresh: true };
    }
    const next = applyOp(state.acc, state.op, value);
    return { display: show(next), acc: Number.isFinite(next) ? next : null, op: key, fresh: true };
  }
  if (key === "=") {
    if (state.acc === null || state.op === null) return state;
    const next = applyOp(state.acc, state.op, Number(state.display));
    return { display: show(next), acc: null, op: null, fresh: true };
  }
  return state;
}

export function wheelNames(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .slice(0, 24);
}

/** The text with the winner's line taken out, so the next spin starts without them. */
export function wheelWithout(text: string, winner: number): string {
  let seen = -1;
  return text
    .split("\n")
    .filter((line) => {
      if (line.trim().length === 0) return true;
      seen += 1;
      return seen !== winner;
    })
    .join("\n");
}

export function wheelIndex(count: number, roll: () => number = Math.random): number {
  if (count <= 0) return -1;
  return Math.floor(roll() * count);
}

const WHEEL_COLORS = ["#ff3df0", "#2d9bff", "#ffb020", "#7a5cff", "#16c784", "#ff5a5a"];
const PIP: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

export function mountDice(host: HTMLElement): DeskApp {
  host.replaceChildren();
  const root = document.createElement("div");
  root.className = "tool-app tool-dice";
  const pick = document.createElement("label");
  pick.className = "field-row";
  pick.textContent = t("Sides");
  const select = document.createElement("select");
  select.setAttribute("aria-label", t("Sides"));
  for (const sides of DIE_SIDES) {
    const option = document.createElement("option");
    option.value = String(sides);
    option.textContent = `d${sides}`;
    if (sides === 6) option.selected = true;
    select.append(option);
  }
  pick.append(select);
  const face = document.createElement("div");
  face.className = "die";
  face.setAttribute("role", "img");
  face.setAttribute("aria-live", "polite");
  const roll = document.createElement("button");
  roll.type = "button";
  roll.textContent = t("Roll");
  root.append(pick, face, roll);
  host.append(root);
  const show = (value: number, sides: number) => {
    face.replaceChildren();
    face.setAttribute("aria-label", String(value));
    const pips = sides === 6 && value >= 1 && value <= 6;
    face.classList.toggle("pips", pips);
    if (!pips) {
      face.textContent = String(value);
      return;
    }
    const on = PIP[value] ?? [];
    for (let i = 0; i < 9; i += 1) {
      const pip = document.createElement("span");
      if (on.includes(i)) pip.className = "pip";
      face.append(pip);
    }
  };
  show(6, 6);
  let timer = 0;
  roll.addEventListener("click", () => {
    window.clearInterval(timer);
    const sides = Number(select.value);
    let ticks = 0;
    timer = window.setInterval(() => {
      ticks += 1;
      const value = rollDie(sides);
      show(value, sides);
      if (ticks < 8) return;
      window.clearInterval(timer);
      timer = 0;
      show(rollDie(sides), sides);
    }, 60);
  });
  return {
    pause() {},
    resume() {},
    destroy() {
      window.clearInterval(timer);
    },
  };
}

export function mountFlip(host: HTMLElement): DeskApp {
  host.replaceChildren();
  const root = document.createElement("div");
  root.className = "tool-app tool-flip";
  const face = document.createElement("div");
  face.className = "coin";
  face.textContent = t("heads");
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = t("Flip");
  root.append(face, button);
  host.append(root);
  let timer = 0;
  button.addEventListener("click", () => {
    window.clearTimeout(timer);
    face.classList.add("flipping");
    timer = window.setTimeout(() => {
      face.classList.remove("flipping");
      face.textContent = t(flipCoin());
    }, 420);
  });
  return {
    pause() {},
    resume() {},
    destroy() {
      window.clearTimeout(timer);
    },
  };
}

export function mountMath(host: HTMLElement): DeskApp {
  host.replaceChildren();
  let state = mathStart();
  const root = document.createElement("div");
  root.className = "tool-app tool-math";
  const display = document.createElement("output");
  display.className = "math-display";
  display.textContent = state.display;
  const keys = document.createElement("div");
  keys.className = "math-keys";
  for (const key of ["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", ".", "=", "+", "C"]) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = key;
    button.dataset.kind = "/*-+".includes(key) ? "op" : key === "=" ? "eq" : key === "C" ? "clear" : "num";
    button.addEventListener("click", () => {
      state = mathKey(state, key);
      display.textContent = state.display;
    });
    keys.append(button);
  }
  root.append(display, keys);
  host.append(root);
  return idleApp;
}

export function mountWheel(host: HTMLElement): DeskApp {
  host.replaceChildren();
  const root = document.createElement("div");
  root.className = "tool-app tool-wheel";
  const box = document.createElement("textarea");
  box.rows = 5;
  box.spellcheck = false;
  box.setAttribute("aria-label", t("Names, one on each line"));
  box.placeholder = t("One name on each line");
  const stage = document.createElement("div");
  stage.className = "wheel-stage";
  const canvas = document.createElement("canvas");
  canvas.width = 280;
  canvas.height = 280;
  canvas.className = "wheel-canvas";
  stage.append(canvas);
  const spin = document.createElement("button");
  spin.type = "button";
  spin.textContent = t("Spin");
  const result = document.createElement("p");
  result.className = "tool-face";
  result.textContent = t("Add names, then spin.");
  root.append(box, stage, spin, result);
  host.append(root);
  let frame = 0;
  const draw = (names: string[], angle: number) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const size = canvas.width;
    const radius = size / 2 - 8;
    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.rotate(angle);
    const count = Math.max(1, names.length);
    for (let i = 0; i < count; i += 1) {
      const start = (i / count) * Math.PI * 2;
      const end = ((i + 1) / count) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length] ?? "#000080";
      ctx.fill();
      ctx.strokeStyle = "#0b0b2a";
      ctx.lineWidth = 2;
      ctx.stroke();
      if (!names.length) continue;
      ctx.save();
      ctx.rotate((start + end) / 2);
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "#000";
      ctx.shadowBlur = 3;
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "right";
      const label = names[i] ?? "";
      ctx.fillText(label.slice(0, 16), radius - 10, 5);
      ctx.shadowBlur = 0;
      ctx.restore();
    }
    ctx.restore();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 14, 0, Math.PI * 2);
    ctx.fillStyle = "#0b0b2a";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#2df3ff";
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#0b0b2a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(size / 2, 26);
    ctx.lineTo(size / 2 - 10, 4);
    ctx.lineTo(size / 2 + 10, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };
  draw([], 0);
  spin.addEventListener("click", () => {
    const names = wheelNames(box.value);
    if (!names.length) {
      result.textContent = t("Add a name on each line.");
      draw([], 0);
      return;
    }
    window.cancelAnimationFrame(frame);
    const winner = wheelIndex(names.length);
    const slice = (Math.PI * 2) / names.length;
    const target = Math.PI * 2 * 4 + (Math.PI * 1.5 - (winner + 0.5) * slice);
    const started = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - started) / 2400);
      const eased = 1 - (1 - t) ** 3;
      draw(names, target * eased);
      if (t < 1) {
        frame = window.requestAnimationFrame(step);
        return;
      }
      result.textContent = names[winner] ?? "";
      box.value = wheelWithout(box.value, winner);
    };
    frame = window.requestAnimationFrame(step);
  });
  return {
    pause() {},
    resume() {},
    destroy() {
      window.cancelAnimationFrame(frame);
    },
  };
}
