import { FACTS } from "./facts";
import { t } from "../i18n";

export interface Clippy {
  show(): void;
  hide(): void;
  tip(text?: string): void;
  nudge(): void;
  labels(): void;
}

export function mountClippy(desktop: HTMLElement): Clippy {
  const root = document.createElement("div");
  root.id = "clippy";
  root.className = "enter";
  root.hidden = sessionStorage.getItem("pkn-clippy") === "0";
  const pic = document.createElement("img");
  pic.className = "buddy-pic";
  pic.src = "/buddy/nugget.png";
  pic.alt = "";
  const balloon = document.createElement("div");
  balloon.className = "balloon";
  const close = document.createElement("button");
  close.type = "button";
  close.className = "balloon-x";
  close.textContent = "x";
  close.setAttribute("aria-label", t("Close tip"));
  const say = document.createElement("p");
  const next = document.createElement("button");
  next.type = "button";
  next.textContent = t("Next");
  balloon.append(close, say, next);
  root.append(balloon, pic);
  desktop.append(root);

  let index = 0;
  let lastRaw = "";
  let talkTimer = 0;
  let drag: { x: number; y: number; left: number; top: number } | null = null;

  function moveTo(left: number, top: number): void {
    root.style.right = "auto";
    root.style.bottom = "auto";
    root.style.left = `${left}px`;
    root.style.top = `${top}px`;
  }

  function placeDefault(): void {
    const narrow = window.innerWidth < 700;
    const height = root.offsetHeight || 240;
    const width = root.offsetWidth || 200;
    const areaH = Math.max(desktop.clientHeight, window.innerHeight - 40);
    const reserve = narrow ? 72 : 8;
    const top = Math.max(8, areaH - height - reserve);
    const left = narrow ? Math.max(8, desktop.clientWidth - width - 8) : 12;
    moveTo(left, top);
  }

  function talk(text: string): void {
    lastRaw = text;
    say.textContent = t(text);
    balloon.hidden = false;
    pic.classList.add("talk");
    window.clearTimeout(talkTimer);
    talkTimer = window.setTimeout(() => pic.classList.remove("talk"), 1400);
  }

  close.addEventListener("click", (event) => {
    event.stopPropagation();
    balloon.hidden = true;
    pic.classList.remove("talk");
  });
  next.addEventListener("click", (event) => {
    event.stopPropagation();
    index = (index + 1) % FACTS.length;
    talk(FACTS[index] ?? "");
  });
  pic.addEventListener("click", () => {
    if (balloon.hidden) talk(FACTS[index] ?? "");
    else next.click();
  });
  pic.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    const rect = root.getBoundingClientRect();
    const host = desktop.getBoundingClientRect();
    drag = { x: event.clientX, y: event.clientY, left: rect.left - host.left, top: rect.top - host.top };
    pic.setPointerCapture(event.pointerId);
  });
  pic.addEventListener("pointermove", (event) => {
    if (!drag) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (dx * dx + dy * dy < 9) return;
    root.style.left = `${Math.max(0, drag.left + dx)}px`;
    root.style.top = `${Math.max(0, drag.top + dy)}px`;
  });
  pic.addEventListener("pointerup", () => {
    drag = null;
  });

  function nudge(): void {
    if (root.hidden) return;
    const blocks = [...desktop.querySelectorAll("#social, #sticky, .desk-win:not(.is-min)")];
    const width = root.offsetWidth || 200;
    const height = root.offsetHeight || 240;
    const hits = (left: number, top: number) => {
      const host = desktop.getBoundingClientRect();
      const mine = { left: host.left + left, right: host.left + left + width, top: host.top + top, bottom: host.top + top + height };
      return blocks.some((el) => {
        const other = el.getBoundingClientRect();
        if (other.width < 2 || other.height < 2) return false;
        return mine.right > other.left && mine.left < other.right && mine.bottom > other.top && mine.top < other.bottom;
      });
    };
    const left = Number.parseFloat(root.style.left) || 0;
    const top = Number.parseFloat(root.style.top) || 0;
    if (!hits(left, top)) return;
    const spots = [
      { left: 12, top: Math.max(8, desktop.clientHeight - height - 8) },
      { left: Math.max(8, desktop.clientWidth - width - 8), top: 12 },
      { left: 12, top: 12 },
      { left: Math.max(8, desktop.clientWidth - width - 8), top: Math.max(8, desktop.clientHeight - height - 72) },
    ];
    for (const spot of spots) {
      if (hits(spot.left, spot.top)) continue;
      moveTo(spot.left, spot.top);
      return;
    }
    const narrow = window.innerWidth < 700;
    const areaH = Math.max(desktop.clientHeight, window.innerHeight - 40);
    const parkLeft = narrow ? Math.max(8, desktop.clientWidth - width - 8) : 12;
    moveTo(parkLeft, Math.max(8, areaH - height - 8));
  }

  placeDefault();
  pic.addEventListener("load", () => {
    placeDefault();
    nudge();
  });
  window.addEventListener("resize", () => {
    placeDefault();
    nudge();
  });
  if (!root.hidden) talk(FACTS[0] ?? "");

  return {
    show() {
      root.hidden = false;
      sessionStorage.setItem("pkn-clippy", "1");
      placeDefault();
      nudge();
      talk(FACTS[index] ?? "");
    },
    hide() {
      root.hidden = true;
      sessionStorage.setItem("pkn-clippy", "0");
      pic.classList.remove("talk");
    },
    tip(text) {
      if (root.hidden) return;
      talk(text ?? FACTS[index] ?? "");
    },
    nudge,
    labels() {
      next.textContent = t("Next");
      close.setAttribute("aria-label", t("Close tip"));
      if (!balloon.hidden && lastRaw) say.textContent = t(lastRaw);
    },
  };
}
