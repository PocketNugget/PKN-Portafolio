import { t } from "../i18n";
import type { DeskApp } from "./host";

export const HACK_LINES = [
  "Connecting to the mainframe...",
  "The mainframe is a folder of HTML.",
  "Bypassing the screensaver...",
  "The screensaver was a cloud.",
  "Splashing the wrong colors on the icons...",
  "The labels came back half eaten.",
  "Done. The desk stays messy until you hit Reset.",
  "Nothing left this page. Files, accounts, and the network were never touched.",
];

export const HACK_POPS: { x: number; y: number; title: string; body: string }[] = [
  { x: 10, y: 12, title: "Error", body: "KERNEL.DLL is a nugget. This is fine." },
  { x: 10, y: 124, title: "Warning", body: "nugget.exe asked for a raise. Denied, politely." },
  { x: 10, y: 236, title: "System", body: "Access granted to the tie. The tie has no privileges." },
  { x: 10, y: 408, title: "Error", body: "ICON.PAL ate its own colors." },
  { x: 10, y: 520, title: "Warning", body: "The taskbar forgot which gray it was." },
];

const GLYPHS = "█▓▒#@$%&*?/01";

export function mountHack(host: HTMLElement, layer: HTMLElement, desktop: HTMLElement): DeskApp {
  host.replaceChildren();
  const root = document.createElement("div");
  root.className = "hack-app";
  const lead = document.createElement("p");
  lead.textContent = t(
    "A fake hack. It messes up the colors on this page until you hit Reset. It does not touch files, accounts, or the network.",
  );
  const log = document.createElement("pre");
  log.className = "hack-log";
  const row = document.createElement("div");
  row.className = "field-row";
  const go = document.createElement("button");
  go.type = "button";
  go.textContent = t("Hackear el sistema");
  const reset = document.createElement("button");
  reset.type = "button";
  reset.textContent = t("Reset");
  row.append(go, reset);
  root.append(lead, log, row);
  host.append(root);

  let token = 0;
  let timer = 0;
  let tear: HTMLElement | null = null;
  const pops: HTMLElement[] = [];

  function shell(): HTMLElement {
    return document.getElementById("app") ?? desktop;
  }

  function targets(): HTMLElement[] {
    return [...desktop.querySelectorAll<HTMLElement>(".desk-icon, a.social-link")];
  }

  function corruptOnce(): void {
    for (const node of targets()) {
      node.style.setProperty("--hack-hue", `${Math.floor(Math.random() * 360)}deg`);
      node.classList.add("is-corrupt");
      node.classList.toggle("is-invert", Math.random() < 0.38);
      node.classList.toggle("is-slice", Math.random() < 0.42);
      const label = node.querySelector(".label, span");
      if (!(label instanceof HTMLElement)) continue;
      if (!label.dataset.hackClean) label.dataset.hackClean = label.textContent ?? "";
      const clean = label.dataset.hackClean ?? "";
      let out = "";
      for (const ch of clean) {
        if (ch === " ") {
          out += " ";
          continue;
        }
        const roll = Math.random();
        const glyph = GLYPHS[Math.floor(Math.random() * GLYPHS.length)] ?? "#";
        out += roll < 0.62 ? glyph : ch;
      }
      label.textContent = out;
    }
    const pic = document.querySelector("#clippy .buddy-pic");
    if (pic instanceof HTMLElement) pic.style.setProperty("--hack-hue", `${Math.floor(Math.random() * 360)}deg`);
  }

  function showTear(): void {
    if (tear) return;
    tear = document.createElement("div");
    tear.className = "hack-tear";
    tear.setAttribute("aria-hidden", "true");
    for (let i = 0; i < 5; i += 1) tear.append(document.createElement("span"));
    const windows = desktop.querySelector("#windows");
    if (windows) desktop.insertBefore(tear, windows);
    else desktop.append(tear);
  }

  function clearFx(): void {
    window.clearInterval(timer);
    timer = 0;
    shell().classList.remove("is-hacked");
    desktop.classList.remove("is-glitch");
    tear?.remove();
    tear = null;
    for (const node of targets()) {
      node.classList.remove("is-corrupt", "is-invert", "is-slice");
      node.style.removeProperty("--hack-hue");
      const label = node.querySelector(".label, span");
      if (label instanceof HTMLElement && label.dataset.hackClean) {
        label.textContent = label.dataset.hackClean;
        delete label.dataset.hackClean;
      }
    }
    const pic = document.querySelector("#clippy .buddy-pic");
    if (pic instanceof HTMLElement) pic.style.removeProperty("--hack-hue");
    for (const pop of pops) pop.remove();
    pops.length = 0;
    for (const extra of layer.querySelectorAll(".hack-pop")) extra.remove();
  }

  function engage(): void {
    shell().classList.add("is-hacked");
    desktop.classList.add("is-glitch");
    showTear();
    corruptOnce();
    window.clearInterval(timer);
    timer = window.setInterval(corruptOnce, 170);
  }

  function wait(ms: number, generation: number): Promise<boolean> {
    return new Promise((resolve) => {
      window.setTimeout(() => resolve(generation === token), ms);
    });
  }

  function popAt(spec: (typeof HACK_POPS)[number]): void {
    const win = document.createElement("div");
    win.className = "window hack-pop";
    const maxX = Math.max(8, layer.clientWidth - 220);
    const maxY = Math.max(8, layer.clientHeight - 120);
    const jitterX = Math.floor(Math.random() * 16) - 8;
    const jitterY = Math.floor(Math.random() * 16) - 8;
    win.style.left = `${Math.min(Math.max(8, spec.x + jitterX), maxX)}px`;
    win.style.top = `${Math.min(Math.max(8, spec.y + jitterY), maxY)}px`;
    const title = document.createElement("div");
    title.className = "title-bar";
    const text = document.createElement("div");
    text.className = "title-bar-text";
    text.textContent = t(spec.title);
    const controls = document.createElement("div");
    controls.className = "title-bar-controls";
    const close = document.createElement("button");
    close.type = "button";
    close.setAttribute("aria-label", t("Close"));
    close.addEventListener("click", () => {
      win.remove();
      const index = pops.indexOf(win);
      if (index >= 0) pops.splice(index, 1);
    });
    controls.append(close);
    title.append(text, controls);
    const body = document.createElement("div");
    body.className = "window-body";
    const line = document.createElement("p");
    line.textContent = t(spec.body);
    body.append(line);
    win.append(title, body);
    layer.append(win);
    pops.push(win);
  }

  async function run(generation: number): Promise<void> {
    log.textContent = "";
    engage();
    const spoken = HACK_LINES.map((line) => t(line));
    for (let i = 0; i < spoken.length; i += 1) {
      const line = spoken[i] ?? "";
      for (let n = 1; n <= line.length; n += 1) {
        const alive = await wait(12, generation);
        if (!alive) return;
        log.textContent = `${spoken.slice(0, i).join("\n")}${i ? "\n" : ""}${line.slice(0, n)}`;
      }
      const pop = HACK_POPS[i];
      if (pop) popAt(pop);
      const alive = await wait(180, generation);
      if (!alive) return;
    }
  }

  go.addEventListener("click", () => {
    token += 1;
    clearFx();
    void run(token);
  });
  reset.addEventListener("click", () => {
    token += 1;
    clearFx();
    log.textContent = t("Reset. The desktop is the same as before.");
  });

  return {
    pause() {},
    resume() {},
    destroy() {
      token += 1;
      clearFx();
    },
  };
}
