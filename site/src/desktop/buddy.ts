import { NUGGET_LINES, NUGGET_SCARE } from "./facts";
import { t } from "../i18n";
import { phoneLayout } from "./phone";

export interface Clippy {
  show(): void;
  hide(): void;
  tip(text?: string): void;
  scare(text?: string): void;
  calm(): void;
  nudge(): void;
  labels(): void;
}

let scareNow: ((text?: string) => void) | null = null;
let speakNow: ((text: string) => void) | null = null;
let calmNow: (() => void) | null = null;

export function scareClippy(text?: string): void {
  scareNow?.(text);
}

export function speakClippy(text: string): void {
  speakNow?.(text);
}

export function calmClippy(): void {
  calmNow?.();
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
  let dragged = false;
  let drag: { x: number; y: number; left: number; top: number } | null = null;

  function boxHeight(): number {
    return root.offsetHeight || (phoneLayout() ? 160 : 240);
  }

  // The picture sits at the bottom of the box. Anchoring that edge keeps the
  // nugget still while the balloon above it opens, grows, or closes.
  function moveTo(left: number, top: number): void {
    const hostH = desktop.clientHeight;
    root.style.right = "auto";
    root.style.left = `${left}px`;
    root.style.top = "auto";
    root.style.bottom = `${hostH - top - boxHeight()}px`;
  }

  function origin(): { left: number; top: number } {
    const left = Number.parseFloat(root.style.left) || 0;
    const bottom = Number.parseFloat(root.style.bottom);
    if (root.style.top === "auto" && Number.isFinite(bottom)) {
      return { left, top: desktop.clientHeight - bottom - boxHeight() };
    }
    return { left, top: Number.parseFloat(root.style.top) || 0 };
  }

  function bottomReserve(): number {
    if (!phoneLayout()) return 8;
    const social = desktop.querySelector("#social");
    const sticky = desktop.querySelector("#sticky");
    const socialH = social instanceof HTMLElement ? social.offsetHeight : 0;
    const stickyH = sticky instanceof HTMLElement && !sticky.hidden ? sticky.offsetHeight : 0;
    return socialH + stickyH + 8;
  }

  function rightSpot(): { left: number; top: number } {
    const narrow = phoneLayout();
    const height = boxHeight();
    const width = root.offsetWidth || (narrow ? 200 : 300);
    const left = Math.max(8, desktop.clientWidth - width - 8);
    const areaH = Math.max(desktop.clientHeight, window.innerHeight - 40);
    let top = Math.max(8, areaH - height - bottomReserve());
    if (!narrow) {
      const social = desktop.querySelector("#social");
      if (social instanceof HTMLElement) {
        const host = desktop.getBoundingClientRect();
        const band = social.getBoundingClientRect();
        const socialTop = band.top - host.top;
        if (socialTop > 40) top = Math.max(8, Math.min(top, socialTop - height - 8));
      }
    }
    return { left, top };
  }

  function placeDefault(): void {
    const spot = rightSpot();
    moveTo(spot.left, spot.top);
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
    index = (index + 1) % NUGGET_LINES.length;
    talk(NUGGET_LINES[index] ?? "");
  });
  pic.addEventListener("click", () => {
    if (dragged) {
      dragged = false;
      return;
    }
    if (balloon.hidden) talk(NUGGET_LINES[index] ?? "");
    else next.click();
  });
  pic.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    const here = origin();
    drag = { x: event.clientX, y: event.clientY, left: here.left, top: here.top };
    pic.setPointerCapture(event.pointerId);
  });
  pic.addEventListener("pointermove", (event) => {
    if (!drag) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (dx * dx + dy * dy < 9) return;
    dragged = true;
    moveTo(Math.max(0, drag.left + dx), Math.max(0, drag.top + dy));
  });
  pic.addEventListener("pointerup", () => {
    drag = null;
  });

  function nudge(): void {
    if (root.hidden) return;
    const blocks = [...desktop.querySelectorAll("#social, #sticky, .desk-win:not(.is-min)")];
    const width = root.offsetWidth || 300;
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
    const { left, top } = origin();
    if (!hits(left, top)) return;
    const parked = rightSpot();
    const spots = [
      parked,
      { left: parked.left, top: 12 },
      { left: parked.left, top: Math.max(8, (desktop.clientHeight - height) / 2) },
    ];
    for (const spot of spots) {
      if (hits(spot.left, spot.top)) continue;
      moveTo(spot.left, spot.top);
      return;
    }
    moveTo(parked.left, parked.top);
  }

  placeDefault();
  pic.addEventListener("load", () => {
    placeDefault();
    nudge();
  });
  const refit = () => {
    placeDefault();
    nudge();
  };
  window.addEventListener("resize", refit);
  window.visualViewport?.addEventListener("resize", refit);
  if (!root.hidden) talk(NUGGET_LINES[0] ?? "");

  function scare(text?: string): void {
    if (root.hidden) return;
    root.classList.add("is-scared");
    talk(text ?? NUGGET_SCARE);
  }

  function calm(): void {
    root.classList.remove("is-scared");
  }

  scareNow = scare;
  speakNow = (text) => {
    if (!root.hidden) talk(text);
  };
  calmNow = calm;

  return {
    show() {
      root.hidden = false;
      sessionStorage.setItem("pkn-clippy", "1");
      placeDefault();
      nudge();
      talk(NUGGET_LINES[index] ?? "");
    },
    hide() {
      root.hidden = true;
      sessionStorage.setItem("pkn-clippy", "0");
      pic.classList.remove("talk");
    },
    tip(text) {
      if (root.hidden) return;
      talk(text ?? NUGGET_LINES[index] ?? "");
    },
    scare,
    calm,
    nudge,
    labels() {
      next.textContent = t("Next");
      close.setAttribute("aria-label", t("Close tip"));
      if (!balloon.hidden && lastRaw) say.textContent = t(lastRaw);
    },
  };
}
