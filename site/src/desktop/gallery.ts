import { t } from "../i18n";
import type { DeskApp } from "./host";
import { idleApp } from "./host";
import type { Shot } from "./media";

export function mountGallery(host: HTMLElement, shots: Shot[], intro: string): DeskApp {
  host.replaceChildren();
  const root = document.createElement("div");
  root.className = "gallery";
  const lead = document.createElement("p");
  lead.textContent = t(intro);
  const count = document.createElement("p");
  count.className = "meta";
  count.textContent = shots.length === 1 ? t("1 file.") : t("N files.").replace("N", String(shots.length));
  const thumbs = document.createElement("div");
  thumbs.className = "thumbs";
  const viewer = document.createElement("div");
  viewer.className = "viewer";
  viewer.hidden = true;
  const img = document.createElement("img");
  img.className = "shot";
  img.alt = "";
  const cap = document.createElement("p");
  cap.className = "cap";
  const row = document.createElement("div");
  row.className = "field-row";
  const prev = button("Previous");
  const next = button("Next");
  const back = button("Thumbnails");
  row.append(prev, next, back);
  viewer.append(img, cap, row);
  root.append(lead, count, thumbs, viewer);
  host.append(root);

  let index = 0;

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
  }

  shots.forEach((shot, shotIndex) => {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "thumb";
    const thumb = document.createElement("img");
    thumb.src = shot.src;
    thumb.alt = t(shot.title);
    const name = document.createElement("span");
    name.textContent = t(shot.title);
    tile.append(thumb, name);
    tile.addEventListener("click", () => show(shotIndex));
    thumbs.append(tile);
  });

  prev.addEventListener("click", () => show(index - 1));
  next.addEventListener("click", () => show(index + 1));
  back.addEventListener("click", () => {
    viewer.hidden = true;
    thumbs.hidden = false;
    img.removeAttribute("src");
  });

  return idleApp;
}

function button(label: string): HTMLButtonElement {
  const el = document.createElement("button");
  el.type = "button";
  el.textContent = t(label);
  return el;
}
