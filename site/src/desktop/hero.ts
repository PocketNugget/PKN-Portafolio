import { hero } from "../catalog";
import { t } from "../i18n";
import type { DeskApp } from "./host";

const COUNT_STEPS = 36;
const COUNT_MS = 32;
const TYPE_MS = 48;
const ERASE_MS = 22;
const HOLD_MS = 1900;

export function countAt(target: number, step: number, steps = COUNT_STEPS): number {
  if (step >= steps) return target;
  const k = Math.max(0, step) / steps;
  return Math.round(target * (1 - (1 - k) ** 3));
}

export function withCount(big: string, value: number): string {
  return big.replace(/[\d,]+/, value.toLocaleString("en-US"));
}

export function mountHero(host: HTMLElement, still: boolean): DeskApp {
  const timers = new Set<number>();
  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };
  const counters = [...host.querySelectorAll<HTMLElement>(".hero-stat b[data-count]")];
  const typer = host.querySelector<HTMLElement>(".hero-type");
  const roles = hero.roles.map((line) => t(line));
  let paused = false;

  if (still) {
    host.classList.add("is-still");
    return { pause() {}, resume() {}, destroy() {} };
  }

  const finals = counters.map((el) => el.textContent ?? "");
  counters.forEach((el, index) => {
    el.textContent = withCount(finals[index] ?? "", 0);
  });
  let step = 0;
  const tick = () => {
    step += 1;
    counters.forEach((el, index) => {
      const target = Number(el.dataset.count ?? 0);
      el.textContent = withCount(finals[index] ?? "", countAt(target, step));
    });
    if (step < COUNT_STEPS) later(tick, COUNT_MS);
  };
  later(tick, 260);

  let role = 0;
  let shown = roles[0]?.length ?? 0;
  let erasing = true;
  const type = () => {
    if (!typer) return;
    if (paused) {
      later(type, 400);
      return;
    }
    const line = roles[role] ?? "";
    if (erasing) {
      shown -= 1;
      if (shown <= 0) {
        shown = 0;
        erasing = false;
        role = (role + 1) % roles.length;
      }
      typer.textContent = line.slice(0, shown);
      later(type, ERASE_MS);
      return;
    }
    const next = roles[role] ?? "";
    shown += 1;
    typer.textContent = next.slice(0, shown);
    if (shown >= next.length) {
      erasing = true;
      later(type, HOLD_MS);
      return;
    }
    later(type, TYPE_MS);
  };
  if (roles.length > 1) later(type, HOLD_MS);

  return {
    pause() {
      paused = true;
    },
    resume() {
      paused = false;
    },
    destroy() {
      for (const id of timers) window.clearTimeout(id);
      timers.clear();
    },
  };
}
