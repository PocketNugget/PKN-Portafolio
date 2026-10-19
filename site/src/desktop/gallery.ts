import { t } from "../i18n";
import type { DeskApp } from "./host";
import { idleApp } from "./host";
import type { Shot } from "./media";

function button(label: string, className = ""): HTMLButtonElement {
  const el = document.createElement("button");
  el.type = "button";
  if (className) el.className = className;
  el.textContent = t(label);
  return el;
}

/** A photo folder in the 98 style: a grid of framed thumbnails, a viewer with a stage, and a status bar. */
export function mountGallery(host: HTMLElement, shots: Shot[], intro: string): DeskApp {
  host.replaceChildren();
  const root = document.createElement("div");
  root.className = "gallery";
  root.tabIndex = 0;

  const lead = document.createElement("p");
  lead.className = "gal-lead";
  lead.textContent = t(intro);

  const main = document.createElement("div");
  main.className = "gal-main";
  const thumbs = document.createElement("div");
  thumbs.className = "thumbs";

  const viewer = document.createElement("div");
  viewer.className = "viewer";
  viewer.hidden = true;
  const stage = document.createElement("div");
  stage.className = "gal-stage";
  const img = document.createElement("img");
  img.className = "shot";
  img.alt = "";
  const prev = button("Previous", "gal-arrow gal-prev");
  prev.textContent = "‹";
  prev.setAttribute("aria-label", t("Previous"));
  const next = button("Next", "gal-arrow gal-next");
  next.textContent = "›";
  next.setAttribute("aria-label", t("Next"));
  stage.append(prev, img, next);
  const cap = document.createElement("p");
  cap.className = "cap";
  const bar = document.createElement("div");
  bar.className = "field-row gal-bar";
  const back = button("Thumbnails");
  const prevText = button("Previous");
  const nextText = button("Next");
  bar.append(back, prevText, nextText);
  viewer.append(stage, cap, bar);
  main.append(thumbs, viewer);

  const status = document.createElement("div");
  status.className = "status-bar gal-status";
  const left = document.createElement("p");
  left.className = "status-bar-field";
  const right = document.createElement("p");
  right.className = "status-bar-field";
  status.append(left, right);

  root.append(lead, main, status);
  host.append(root);

  const count = shots.length === 1 ? t("1 file.") : t("N files.").replace("N", String(shots.length));
  let index = -1;
  const tiles: HTMLButtonElement[] = [];

  function paintStatus(): void {
    const shot = shots[index];
    if (viewer.hidden || !shot) {
      left.textContent = count;
      right.textContent = "";
      return;
    }
    left.textContent = t(shot.title);
    right.textContent = `${index + 1} / ${shots.length}`;
  }

  function mark(): void {
    tiles.forEach((tile, i) => tile.classList.toggle("on", i === index));
  }

  function show(nextIndex: number): void {
    if (shots.length === 0) return;
    index = (nextIndex + shots.length) % shots.length;
    const shot = shots[index];
    if (!shot) return;
    img.src = shot.src;
    img.alt = t(shot.title);
    cap.textContent = t(shot.caption);
    thumbs.hidden = true;
    viewer.hidden = false;
    for (const around of [index - 1, index + 1]) {
      const other = shots[(around + shots.length) % shots.length];
      if (other) new Image().src = other.src;
    }
    mark();
    paintStatus();
    root.focus({ preventScroll: true });
  }

  function list(): void {
    viewer.hidden = true;
    thumbs.hidden = false;
    img.removeAttribute("src");
    paintStatus();
    tiles[index]?.focus({ preventScroll: false });
  }

  shots.forEach((shot, shotIndex) => {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "thumb";
    const frame = document.createElement("span");
    frame.className = "thumb-frame";
    const thumb = document.createElement("img");
    thumb.src = shot.src;
    thumb.loading = "lazy";
    thumb.decoding = "async";
    thumb.alt = "";
    frame.append(thumb);
    const name = document.createElement("span");
    name.className = "thumb-name";
    name.textContent = t(shot.title);
    tile.append(frame, name);
    tile.addEventListener("click", () => show(shotIndex));
    thumbs.append(tile);
    tiles.push(tile);
  });

  prev.addEventListener("click", () => show(index - 1));
  next.addEventListener("click", () => show(index + 1));
  prevText.addEventListener("click", () => show(index - 1));
  nextText.addEventListener("click", () => show(index + 1));
  back.addEventListener("click", list);
  root.addEventListener("keydown", (event) => {
    if (viewer.hidden) return;
    if (event.key === "ArrowLeft") show(index - 1);
    else if (event.key === "ArrowRight") show(index + 1);
    else if (event.key === "Escape") list();
    else return;
    event.preventDefault();
    event.stopPropagation();
  });

  paintStatus();
  return idleApp;
}
