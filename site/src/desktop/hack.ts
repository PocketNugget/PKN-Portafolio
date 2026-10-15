import type { DeskApp } from "./host";

const LINES = [
  "Connecting to the mainframe...",
  "The mainframe is a folder of HTML.",
  "Bypassing the screensaver...",
  "The screensaver was a cloud.",
  "Reading the shift notes...",
  "Done. The system was never in danger.",
  "It is still a portfolio. The nugget in the tie put the pixels back.",
];

const POPS: { x: number; y: number; title: string; body: string }[] = [
  { x: 28, y: 40, title: "Error", body: "KERNEL.DLL is a nugget. This is fine." },
  { x: 160, y: 88, title: "Warning", body: "nugget.exe asked for a raise. Denied, politely." },
  { x: 70, y: 150, title: "System", body: "Access granted to the tie. The tie has no privileges." },
];

export function mountHack(host: HTMLElement, layer: HTMLElement, desktop: HTMLElement): DeskApp {
  host.replaceChildren();
  const root = document.createElement("div");
  root.className = "hack-app";
  const lead = document.createElement("p");
  lead.textContent = "A fake hack. It does not touch files, accounts, or the network.";
  const log = document.createElement("pre");
  log.className = "hack-log";
  const row = document.createElement("div");
  row.className = "field-row";
  const go = document.createElement("button");
  go.type = "button";
  go.textContent = "Hackear el sistema";
  const reset = document.createElement("button");
  reset.type = "button";
  reset.textContent = "Reset";
  row.append(go, reset);
  root.append(lead, log, row);
  host.append(root);

  let token = 0;
  const pops: HTMLElement[] = [];

  function clearFx(): void {
    desktop.classList.remove("is-glitch");
    for (const pop of pops) pop.remove();
    pops.length = 0;
    for (const extra of layer.querySelectorAll(".hack-pop")) extra.remove();
  }

  function wait(ms: number, generation: number): Promise<boolean> {
    return new Promise((resolve) => {
      window.setTimeout(() => resolve(generation === token), ms);
    });
  }

  function popAt(spec: (typeof POPS)[number]): void {
    const win = document.createElement("div");
    win.className = "window hack-pop";
    const maxX = Math.max(8, layer.clientWidth - 220);
    const maxY = Math.max(8, layer.clientHeight - 120);
    win.style.left = `${Math.min(spec.x, maxX)}px`;
    win.style.top = `${Math.min(spec.y, maxY)}px`;
    const title = document.createElement("div");
    title.className = "title-bar";
    const text = document.createElement("div");
    text.className = "title-bar-text";
    text.textContent = spec.title;
    const controls = document.createElement("div");
    controls.className = "title-bar-controls";
    const close = document.createElement("button");
    close.type = "button";
    close.setAttribute("aria-label", "Close");
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
    line.textContent = spec.body;
    body.append(line);
    win.append(title, body);
    layer.append(win);
    pops.push(win);
  }

  async function run(generation: number): Promise<void> {
    log.textContent = "";
    for (let i = 0; i < LINES.length; i += 1) {
      const line = LINES[i] ?? "";
      for (let n = 1; n <= line.length; n += 1) {
        const alive = await wait(16, generation);
        if (!alive) return;
        log.textContent = `${LINES.slice(0, i).join("\n")}${i ? "\n" : ""}${line.slice(0, n)}`;
      }
      if (i === 1) {
        desktop.classList.add("is-glitch");
        popAt(POPS[0]!);
      }
      if (i === 3) popAt(POPS[1]!);
      if (i === 4) popAt(POPS[2]!);
      const alive = await wait(280, generation);
      if (!alive) return;
    }
    const alive = await wait(700, generation);
    if (!alive) return;
    clearFx();
  }

  go.addEventListener("click", () => {
    token += 1;
    clearFx();
    void run(token);
  });
  reset.addEventListener("click", () => {
    token += 1;
    clearFx();
    log.textContent = "Reset. The desktop is the same as before.";
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
