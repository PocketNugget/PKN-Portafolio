import { linkPage, notes, openTable, profiles, projects } from "../catalog";
import { hydrate, setNavigator } from "../client";
import { getLang, setLang, t, type Lang } from "../i18n";
import { normalizePath } from "../paths";
import { documentBody } from "../render";
import { parseCommand } from "../shell";
import { mountClippy } from "./buddy";
import { mountConvert } from "./convert";
import { mountFind, mountRun } from "./extras";
import { mountPad } from "./pad";
import { mountFacts } from "./facts";
import { mountGallery } from "./gallery";
import { mountHack } from "./hack";
import type { DeskApp } from "./host";
import { ICONS } from "./icons";
import { NUGGET_TIPS } from "./facts";
import { AWARDS, PICTURES } from "./media";
import { phoneLayout } from "./phone";
import { mountPlayer } from "./player";
import { mountSweep } from "./sweep";
import { Terminal } from "./term";
import { mountDice, mountFlip, mountMath, mountWheel } from "./tools";

interface App {
  id: string;
  label: string;
  path: string;
  icon: string;
  desk: boolean;
}

interface Spot {
  x: number;
  y: number;
}

interface LayoutSave {
  w: number;
  h: number;
  spots: Record<string, Spot>;
}

const CELL_W = 152;
const CELL_H = 156;
const SOCIAL_W = 560;
const SOCIAL_H = 120;

interface Win {
  id: number;
  path: string;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rx: number;
  ry: number;
  rw: number;
  rh: number;
  z: number;
  min: boolean;
  max: boolean;
  el: HTMLDivElement;
  term: Terminal | null;
  host: DeskApp | null;
}

const APPS: App[] = [
  { id: "about", label: "About Me", path: "/", icon: "about", desk: true },
  { id: "jobs", label: "Jobs", path: "/jobs", icon: "jobs", desk: true },
  { id: "projects", label: "Projects", path: "/work", icon: "projects", desk: true },
  { id: "skills", label: "Skills", path: "/skills", icon: "skills", desk: true },
  { id: "radio", label: "Radio", path: "/radio", icon: "radio", desk: false },
  { id: "notes", label: "Notes", path: "/notes", icon: "notes", desk: true },
  { id: "certs", label: "Courses", path: "/certs", icon: "certs", desk: true },
  { id: "blog", label: "Blog", path: "/blog", icon: "blog", desk: true },
  { id: "pad", label: "Suggestions", path: "/pad", icon: "pad", desk: true },
  { id: "links", label: "My Links", path: "/links", icon: "links", desk: false },
  { id: "contact", label: "Contact", path: "/contact", icon: "contact", desk: true },
  { id: "terminal", label: "Terminal", path: "/terminal", icon: "terminal", desk: true },
  { id: "snake", label: "Snake", path: "/snake", icon: "snake", desk: true },
  { id: "tetris", label: "Tetris", path: "/tetris", icon: "tetris", desk: true },
  { id: "sweep", label: "Sweep", path: "/sweep", icon: "sweep", desk: true },
  { id: "tron", label: "Tron", path: "/tron", icon: "tron", desk: true },
  { id: "pictures", label: "My Pictures", path: "/pictures", icon: "pictures", desk: true },
  { id: "awards", label: "Certificates", path: "/awards", icon: "awards", desk: true },
  { id: "player", label: "Player", path: "/player", icon: "player", desk: true },
  { id: "convert", label: "Converter", path: "/convert", icon: "convert", desk: true },
  { id: "dice", label: "Dice", path: "/dice", icon: "dice", desk: true },
  { id: "flip", label: "Flip", path: "/flip", icon: "flip", desk: true },
  { id: "math", label: "Calculator", path: "/math", icon: "math", desk: true },
  { id: "wheel", label: "Wheel", path: "/wheel", icon: "wheel", desk: true },
  { id: "facts", label: "Facts", path: "/facts", icon: "facts", desk: false },
  { id: "hack", label: "Hack", path: "/hack", icon: "hack", desk: true },
  { id: "buddy", label: "Nugget", path: "/buddy", icon: "buddy", desk: false },
  { id: "help", label: "Help", path: "/help", icon: "help", desk: false },
  { id: "display", label: "Display", path: "/display", icon: "display", desk: false },
  { id: "colophon", label: "Colophon", path: "/colophon", icon: "colophon", desk: false },
  { id: "legal", label: "Legal", path: "/legal", icon: "legal", desk: false },
  { id: "login", label: "Login", path: "/login", icon: "login", desk: false },
  { id: "run", label: "Run", path: "/run", icon: "terminal", desk: false },
  { id: "find", label: "Find", path: "/find", icon: "notes", desk: false },
];

const MENU_GROUPS = [
  ["about", "jobs", "projects", "skills"],
  ["notes", "certs", "blog", "pad", "links", "contact"],
  ["terminal", "snake", "tetris", "sweep", "tron", "help", "display", "run", "find", "colophon", "legal"],
  ["pictures", "awards", "player", "convert", "dice", "flip", "math", "wheel", "facts", "hack", "buddy"],
];

const WALLPAPERS = [
  { id: "sky", label: "Sky" },
  { id: "teal", label: "Teal" },
  { id: "clouds", label: "Clouds" },
  { id: "navy", label: "Navy" },
];

const SIZES: Record<string, [number, number]> = {
  "/player": [618, 286],
  "/pictures": [640, 480],
  "/awards": [640, 480],
  "/convert": [480, 480],
  "/sweep": [560, 640],
  "/dice": [320, 420],
  "/flip": [300, 400],
  "/math": [320, 460],
  "/wheel": [420, 560],
  "/snake": [760, 620],
  "/tetris": [480, 700],
  "/tron": [860, 600],
  "/legal": [560, 520],
  "/": [720, 700],
  "/jobs": [720, 640],
  "/work": [760, 680],
  "/skills": [560, 480],
  "/certs": [560, 460],
  "/contact": [440, 340],
  "/facts": [500, 440],
  "/hack": [480, 360],
  "/run": [320, 160],
  "/find": [420, 320],
  "/pad": [420, 480],
  "/login": [360, 520],
  "/admin/login": [360, 520],
  "/admin": [560, 640],
};

const SOCIAL: { label: string; href: string; icon: string }[] = [
  { label: "GitHub", href: profiles.github.href, icon: "/social/github.png" },
  { label: "LinkedIn", href: profiles.linkedin.href, icon: "/social/linkedin.png" },
  { label: "X", href: profiles.x.href, icon: "/social/x.png" },
  { label: "Instagram", href: linkPage.find((item) => item.label === "Instagram")?.href ?? "", icon: "/social/instagram.png" },
  { label: "YouTube", href: linkPage.find((item) => item.label === "YouTube")?.href ?? "", icon: "/social/youtube.png" },
];

const opens = openTable();

function sessionGet(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function sessionSet(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    /* storage can be blocked; the desktop still runs */
  }
}

function titleFor(path: string): string {
  const app = APPS.find((item) => item.path === path);
  if (app) return t(app.label === "Display" ? "Display Properties" : app.label);
  if (path.startsWith("/work/")) {
    const slug = path.slice("/work/".length);
    return t(projects.find((item) => item.slug === slug)?.title ?? "Project");
  }
  if (path.startsWith("/notes/")) {
    const slug = path.slice("/notes/".length);
    return t(notes.find((item) => item.slug === slug)?.title ?? "Note");
  }
  if (path.startsWith("/blog/")) return t("Blog");
  if (path === "/admin") return t("Editor");
  return t("Window");
}

function control(label: string): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.setAttribute("aria-label", label);
  return button;
}

function fitViewport(): void {
  const view = window.visualViewport;
  const height = Math.round(view?.height ?? window.innerHeight);
  const top = Math.round(view?.offsetTop ?? 0);
  document.documentElement.style.setProperty("--app-h", `${height}px`);
  document.documentElement.style.setProperty("--app-top", `${top}px`);
}

export function bootDesktop(): void {
  fitViewport();
  setLang(sessionGet("pkn-lang") ?? "en");
  document.documentElement.lang = getLang();
  const app = document.querySelector("#app");
  if (!(app instanceof HTMLElement)) return;

  const boot = document.createElement("div");
  boot.id = "boot";
  boot.innerHTML = `<div class="window boot-window">
      <div class="title-bar"><div class="title-bar-text">${t("Starting PocketNugget")}</div></div>
      <div class="window-body">
        <p>${t("Loading the desktop.")}</p>
        <div class="progress-indicator" role="progressbar" aria-label="${t("Boot")}"><span class="progress-indicator-bar" id="boot-bar"></span></div>
        <p class="meta">${t("Click to skip.")}</p>
      </div>
    </div>`;

  const desktop = document.createElement("div");
  desktop.id = "desktop";
  const wallpaper = document.createElement("div");
  wallpaper.id = "wallpaper";
  const icons = document.createElement("div");
  icons.id = "icons";
  const social = document.createElement("div");
  social.id = "social";
  const windowsLayer = document.createElement("div");
  windowsLayer.id = "windows";
  desktop.append(wallpaper, icons, social, windowsLayer);

  const taskbar = document.createElement("div");
  taskbar.id = "taskbar";
  const start = document.createElement("button");
  start.type = "button";
  start.className = "start-btn";
  start.innerHTML = `<span class="k-mark">K</span><span class="start-label"></span>`;
  const startLabel = start.querySelector(".start-label");
  if (startLabel) startLabel.textContent = t("Start");
  const lang = document.createElement("button");
  lang.type = "button";
  lang.id = "lang";
  lang.textContent = getLang().toUpperCase();
  lang.setAttribute("aria-label", t("Language"));
  const tasks = document.createElement("div");
  tasks.id = "tasks";
  const clock = document.createElement("div");
  clock.id = "clock";
  taskbar.append(start, tasks, lang, clock);

  const menu = document.createElement("div");
  menu.id = "start-menu";
  const brand = document.createElement("div");
  brand.className = "menu-brand";
  brand.textContent = "Goben";
  const menuList = document.createElement("div");
  menuList.className = "menu-list";
  menu.append(brand, menuList);

  app.replaceChildren(boot, desktop, taskbar, menu);

  const windows: Win[] = [];
  let clippy: ReturnType<typeof mountClippy> | null = null;
  let idleAt = Date.now();
  const tipped = new Set<string>();
  let seq = 0;
  let zTop = 2;
  let activeId = 0;
  let selected = "";
  let bootTimer = 0;
  const deskIds = APPS.filter((item) => item.desk).map((item) => item.id);
  const opening = deskArea();
  const spots = readLayout(deskIds, opening.w, opening.h);
  let laidW = opening.w;
  let laidH = opening.h;

  function wallpaperId(): string {
    const saved = sessionGet("pkn-wall");
    return WALLPAPERS.some((item) => item.id === saved) ? saved ?? "sky" : "sky";
  }

  function applyWallpaper(id: string): void {
    const safe = WALLPAPERS.some((item) => item.id === id) ? id : "sky";
    for (const item of WALLPAPERS) desktop.classList.remove(`wp-${item.id}`);
    desktop.classList.add(`wp-${safe}`);
    sessionSet("pkn-wall", safe);
    for (const input of desktop.querySelectorAll<HTMLInputElement>("input[name=wallpaper]")) {
      input.checked = input.value === safe;
    }
  }

  function mountDisplay(host: HTMLElement): void {
    const current = wallpaperId();
    const rows = WALLPAPERS.map((item) => {
      const checked = item.id === current ? " checked" : "";
      return `<div class="field-row"><input type="radio" name="wallpaper" id="wp-${item.id}" value="${item.id}"${checked}><label for="wp-${item.id}">${t(item.label)}</label></div>`;
    }).join("");
    host.innerHTML = `<fieldset><legend>${t("Wallpaper")}</legend>${rows}</fieldset>
      <p class="meta">${t("Files live in public/wallpapers. Sky is the photo. Teal and Clouds are the older drawings. This tab remembers the choice. It is not a cookie.")}</p>`;
    host.addEventListener("change", (event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement && target.name === "wallpaper") applyWallpaper(target.value);
    });
  }

  function paintClock(): void {
    const now = new Date();
    const hour = now.getHours();
    const minute = String(now.getMinutes()).padStart(2, "0");
    const suffix = hour >= 12 ? "PM" : "AM";
    const shown = hour % 12 || 12;
    clock.textContent = `${shown}:${minute} ${suffix}`;
    clock.title = now.toDateString();
  }

  function layoutIcons(): void {
    const narrow = phoneLayout();
    for (const button of icons.querySelectorAll<HTMLButtonElement>(".desk-icon")) {
      const spot = spots[button.dataset.app ?? ""];
      if (!spot || narrow) {
        button.style.left = "";
        button.style.top = "";
        continue;
      }
      button.style.left = `${spot.x}px`;
      button.style.top = `${spot.y}px`;
    }
  }

  function saveLayout(): void {
    const size = deskArea();
    const blob: LayoutSave = { w: size.w, h: size.h, spots };
    sessionSet("pkn-icons", JSON.stringify(blob));
  }

  function reflowIcons(force = false): void {
    const size = deskArea();
    if (!force && size.w === laidW && size.h === laidH) {
      layoutIcons();
      return;
    }
    laidW = size.w;
    laidH = size.h;
    const next = gridFor(deskIds, size.w, size.h);
    for (const key of Object.keys(spots)) delete spots[key];
    Object.assign(spots, next);
    saveLayout();
    layoutIcons();
  }

  function deskArea(): { w: number; h: number } {
    return {
      w: desktop.clientWidth || window.innerWidth,
      h: desktop.clientHeight || Math.max(200, window.innerHeight - 40),
    };
  }

  function paintSelection(): void {
    for (const button of icons.querySelectorAll<HTMLButtonElement>(".desk-icon")) {
      button.classList.toggle("selected", button.dataset.app === selected);
    }
  }

  function renderTasks(): void {
    tasks.replaceChildren();
    for (const win of windows) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "task-btn";
      if (win.id === activeId && !win.min) button.classList.add("down");
      button.textContent = win.title;
      button.setAttribute("aria-pressed", String(win.id === activeId && !win.min));
      button.addEventListener("click", () => {
        if (win.id === activeId && !win.min) minimize(win);
        else {
          win.min = false;
          win.el.classList.remove("is-min");
          win.term?.resume();
          win.host?.resume();
          focusWindow(win);
          place(win);
        }
      });
      tasks.append(button);
    }
  }

  function place(win: Win): void {
    const narrow = phoneLayout();
    win.el.style.right = "";
    win.el.style.bottom = "";
    win.el.style.maxHeight = "";
    if (win.max || narrow) {
      win.el.classList.add("max");
      win.el.style.left = "0";
      win.el.style.width = "100%";
      if (narrow && win.path === "/hack") {
        win.el.style.top = "auto";
        win.el.style.bottom = "0";
        win.el.style.height = "auto";
        win.el.style.maxHeight = "54%";
        return;
      }
      if (narrow && win.path === "/player") {
        const width = Math.max(1, desktop.clientWidth);
        const deckH = Math.ceil(((width - 18) * 250) / 600);
        win.el.style.top = "0";
        win.el.style.height = `${Math.min(desktop.clientHeight, deckH + 56)}px`;
        return;
      }
      win.el.style.top = "0";
      win.el.style.height = "100%";
      return;
    }
    win.el.classList.remove("max");
    win.el.style.left = `${win.x}px`;
    win.el.style.top = `${win.y}px`;
    win.el.style.width = `${win.w}px`;
    win.el.style.height = `${win.h}px`;
  }

  function clamp(win: Win): void {
    const areaW = Math.max(1, desktop.clientWidth);
    const areaH = Math.max(1, desktop.clientHeight);
    win.w = Math.max(Math.min(240, areaW), Math.min(win.w, areaW));
    win.h = Math.max(Math.min(160, areaH), Math.min(win.h, areaH));
    win.x = Math.min(Math.max(0, win.x), Math.max(0, areaW - 48));
    win.y = Math.min(Math.max(0, win.y), Math.max(0, areaH - 28));
  }

  function focusWindow(win: Win): void {
    zTop += 1;
    win.z = zTop;
    win.el.style.zIndex = String(zTop);
    activeId = win.id;
    for (const item of windows) {
      item.el.querySelector(".title-bar")?.classList.toggle("inactive", item.id !== win.id);
    }
    renderTasks();
  }

  function fill(win: Win): void {
    const body = win.el.querySelector(".window-body");
    if (!(body instanceof HTMLElement)) return;
    win.term?.destroy();
    win.term = null;
    win.host?.destroy();
    win.host = null;
    body.innerHTML = documentBody(win.path);
    if (body.querySelector("#dynamic")) hydrate(win.path, body);
    const display = body.querySelector(".display-mount");
    if (display instanceof HTMLElement) mountDisplay(display);
    const gallery = body.querySelector(".gallery-mount");
    if (gallery instanceof HTMLElement) {
      const shots = win.path === "/awards" ? AWARDS : PICTURES;
      const intro =
        win.path === "/awards"
          ? "Scans copied into this site. A year with no ranking in the record does not get one here."
          : "Photos copied into this site from the local folder, so they load with the page.";
      win.host = mountGallery(gallery, shots, intro);
    }
    const playerHost = body.querySelector(".player-mount");
    if (playerHost instanceof HTMLElement) win.host = mountPlayer(playerHost);
    const convertHost = body.querySelector(".convert-mount");
    if (convertHost instanceof HTMLElement) win.host = mountConvert(convertHost);
    const sweepHost = body.querySelector(".sweep-mount");
    if (sweepHost instanceof HTMLElement) win.host = mountSweep(sweepHost);
    const diceHost = body.querySelector(".dice-mount");
    if (diceHost instanceof HTMLElement) win.host = mountDice(diceHost);
    const flipHost = body.querySelector(".flip-mount");
    if (flipHost instanceof HTMLElement) win.host = mountFlip(flipHost);
    const mathHost = body.querySelector(".math-mount");
    if (mathHost instanceof HTMLElement) win.host = mountMath(mathHost);
    const wheelHost = body.querySelector(".wheel-mount");
    if (wheelHost instanceof HTMLElement) win.host = mountWheel(wheelHost);
    const factsHost = body.querySelector(".facts-mount");
    if (factsHost instanceof HTMLElement) win.host = mountFacts(factsHost, (href) => openHref(href));
    const hackHost = body.querySelector(".hack-mount");
    if (hackHost instanceof HTMLElement) win.host = mountHack(hackHost, windowsLayer, desktop);
    const runHost = body.querySelector(".run-mount");
    if (runHost instanceof HTMLElement) win.host = mountRun(runHost, (href) => openHref(href));
    const findHost = body.querySelector(".find-mount");
    if (findHost instanceof HTMLElement) win.host = mountFind(findHost, (href) => openHref(href));
    const padHost = body.querySelector(".notepad-mount");
    if (padHost instanceof HTMLElement) win.host = mountPad(padHost);
    const filter = body.querySelector("#work-filter");
    if (filter instanceof HTMLSelectElement) {
      filter.addEventListener("change", () => {
        for (const article of body.querySelectorAll<HTMLElement>("article[data-kind]")) {
          article.hidden = filter.value !== "all" && article.dataset.kind !== filter.value;
        }
      });
    }
    const termHost = body.querySelector(".term-mount");
    if (termHost instanceof HTMLElement) {
      const start =
        win.path === "/snake" ? "snake" : win.path === "/tetris" ? "tetris" : win.path === "/tron" ? "tron" : undefined;
      win.term = new Terminal(
        termHost,
        {
          openPath: (href) => openHref(href),
          close: () => closeWindow(win.id),
        },
        start,
      );
      if (matchMedia("(pointer: fine)").matches) win.term.focusInput();
    }
  }

  function minimize(win: Win): void {
    win.min = true;
    win.el.classList.add("is-min");
    win.term?.pause();
    win.host?.pause();
    const next = [...windows].reverse().find((item) => item.id !== win.id && !item.min);
    if (next) focusWindow(next);
    else {
      activeId = 0;
      for (const item of windows) item.el.querySelector(".title-bar")?.classList.add("inactive");
      renderTasks();
    }
  }

  function toggleMax(win: Win): void {
    const button = win.el.querySelector(".title-bar-controls button:nth-child(2)");
    if (win.max) {
      win.max = false;
      win.x = win.rx;
      win.y = win.ry;
      win.w = win.rw;
      win.h = win.rh;
      if (button) button.setAttribute("aria-label", "Maximize");
    } else {
      win.rx = win.x;
      win.ry = win.y;
      win.rw = win.w;
      win.rh = win.h;
      win.max = true;
      if (button) button.setAttribute("aria-label", "Restore");
    }
    place(win);
  }

  function closeWindow(id: number, quiet = false): void {
    const index = windows.findIndex((win) => win.id === id);
    if (index < 0) return;
    const win = windows[index];
    if (!win) return;
    win.term?.destroy();
    win.host?.destroy();
    win.el.remove();
    windows.splice(index, 1);
    const next = [...windows].reverse().find((item) => !item.min);
    if (next) {
      focusWindow(next);
      if (!quiet) history.replaceState({}, "", next.path);
    } else {
      activeId = 0;
      renderTasks();
      if (!quiet) history.replaceState({}, "", "/");
    }
  }

  function closePath(path: string): void {
    const win = windows.find((item) => item.path === path);
    if (win) closeWindow(win.id, true);
  }

  function bindDrag(win: Win, title: HTMLElement): void {
    title.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      if (event.target instanceof Element && event.target.closest("button")) return;
      focusWindow(win);
      if (win.max || phoneLayout()) return;
      const startX = event.clientX;
      const startY = event.clientY;
      const origX = win.x;
      const origY = win.y;
      title.setPointerCapture(event.pointerId);
      const move = (ev: PointerEvent) => {
        win.x = origX + ev.clientX - startX;
        win.y = origY + ev.clientY - startY;
        clamp(win);
        place(win);
      };
      const up = () => {
        title.removeEventListener("pointermove", move);
        title.removeEventListener("pointerup", up);
      };
      title.addEventListener("pointermove", move);
      title.addEventListener("pointerup", up);
    });
    title.addEventListener("dblclick", (event) => {
      if (event.target instanceof Element && event.target.closest("button")) return;
      toggleMax(win);
    });
  }

  function bindResize(win: Win, handle: HTMLElement): void {
    handle.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || win.max || phoneLayout()) return;
      event.stopPropagation();
      focusWindow(win);
      const edge = handle.dataset.edge ?? "";
      const startX = event.clientX;
      const startY = event.clientY;
      const orig = { x: win.x, y: win.y, w: win.w, h: win.h };
      handle.setPointerCapture(event.pointerId);
      const move = (ev: PointerEvent) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        let { x, y, w, h } = orig;
        if (edge.includes("e")) w = orig.w + dx;
        if (edge.includes("s")) h = orig.h + dy;
        if (edge.includes("w")) {
          w = orig.w - dx;
          x = orig.x + dx;
        }
        if (edge.includes("n")) {
          h = orig.h - dy;
          y = orig.y + dy;
        }
        win.x = x;
        win.y = y;
        win.w = w;
        win.h = h;
        clamp(win);
        place(win);
      };
      const up = () => {
        handle.removeEventListener("pointermove", move);
        handle.removeEventListener("pointerup", up);
      };
      handle.addEventListener("pointermove", move);
      handle.addEventListener("pointerup", up);
    });
  }

  function build(path: string): Win {
    const narrow = phoneLayout();
    const areaW = desktop.clientWidth || window.innerWidth;
    const areaH = desktop.clientHeight || window.innerHeight - 30;
    const cascade = windows.length;
    const preset = SIZES[path] ?? (path.startsWith("/work/") ? SIZES["/work"] : undefined);
    const wantW = preset?.[0] ?? 560;
    const wantH = preset?.[1] ?? 420;
    const fittedW = Math.min(wantW, Math.max(240, areaW - 36));
    const fittedH = Math.min(wantH, Math.max(180, areaH - 36));
    const parkHack = path === "/hack" && !narrow;
    const win: Win = {
      id: ++seq,
      path,
      title: titleFor(path),
      x: parkHack ? Math.min(220, Math.max(8, areaW - fittedW - 220)) : narrow ? 0 : 24 + (cascade % 8) * 22,
      y: parkHack ? 36 : narrow ? 0 : 12 + (cascade % 8) * 20,
      w: narrow ? areaW : fittedW,
      h: narrow ? areaH : fittedH,
      rx: 0,
      ry: 0,
      rw: 0,
      rh: 0,
      z: 0,
      min: false,
      max: narrow,
      el: document.createElement("div"),
      term: null,
      host: null,
    };
    win.rx = win.x;
    win.ry = win.y;
    win.rw = win.w;
    win.rh = win.h;
    win.el.className = "window desk-win";
    if (narrow) win.el.classList.add("max");
    const title = document.createElement("div");
    title.className = "title-bar";
    const text = document.createElement("div");
    text.className = "title-bar-text";
    text.textContent = win.title;
    const controls = document.createElement("div");
    controls.className = "title-bar-controls";
    const minBtn = control("Minimize");
    const maxBtn = control(narrow ? "Restore" : "Maximize");
    if (narrow) maxBtn.hidden = true;
    const closeBtn = control("Close");
    controls.append(minBtn, maxBtn, closeBtn);
    title.append(text, controls);
    const body = document.createElement("div");
    body.className = "window-body";
    win.el.append(title, body);
    for (const edge of ["n", "s", "e", "w", "nw", "ne", "sw", "se"]) {
      const handle = document.createElement("div");
      handle.className = `rz rz-${edge}`;
      handle.dataset.edge = edge;
      bindResize(win, handle);
      win.el.append(handle);
    }
    minBtn.addEventListener("click", () => minimize(win));
    maxBtn.addEventListener("click", () => toggleMax(win));
    closeBtn.addEventListener("click", () => closeWindow(win.id));
    bindDrag(win, title);
    win.el.addEventListener("pointerdown", () => {
      if (activeId !== win.id) focusWindow(win);
      if (win.term?.inGame()) win.term.focusBoard();
    });
    place(win);
    return win;
  }

  function openWindow(path: string): void {
    const existing = windows.find((win) => win.path === path);
    if (existing) {
      if (path === "/admin" || path === "/blog") fill(existing);
      if (existing.min) {
        existing.min = false;
        existing.el.classList.remove("is-min");
        existing.term?.resume();
        existing.host?.resume();
      }
      focusWindow(existing);
      place(existing);
      return;
    }
    const win = build(path);
    windows.push(win);
    windowsLayer.append(win.el);
    fill(win);
    focusWindow(win);
    maybeTip(path);
    clippy?.nudge();
    requestAnimationFrame(() => clippy?.nudge());
  }

  function maybeTip(path: string): void {
    if (!clippy || tipped.has(path)) return;
    if (path === "/hack") {
      clippy.scare();
      return;
    }
    const line = NUGGET_TIPS[path];
    if (!line) return;
    tipped.add(path);
    clippy.tip(line);
  }

  function openHref(href: string, push = true): void {
    menu.classList.remove("open");
    const url = new URL(href, location.origin);
    const path = normalizePath(url.pathname);
    if (path === "/buddy") {
      clippy?.show();
      if (push && location.pathname !== "/buddy") history.pushState({}, "", "/buddy");
      return;
    }
    if (path === "/login" || path === "/admin/login") {
      void (async () => {
        let dest = "/login";
        try {
          const response = await fetch("/api/session", { credentials: "same-origin" });
          if (response.ok) dest = "/admin";
        } catch {
          dest = "/login";
        }
        if (location.pathname !== dest) {
          if (push) history.pushState({}, "", dest);
          else history.replaceState({}, "", dest);
        }
        openWindow(dest);
      })();
      return;
    }
    const full = `${url.pathname}${url.search}`;
    if (push && `${location.pathname}${location.search}` !== full) history.pushState({}, "", full);
    openWindow(path);
  }

  function loadDesktop(): void {
    for (const item of APPS) {
      if (!item.desk) continue;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "desk-icon";
      button.dataset.app = item.id;
      button.innerHTML = `${ICONS[item.icon] ?? ""}\n<span class="label"></span>`;
      const label = button.querySelector(".label");
      if (label) label.textContent = t(item.label);
      button.addEventListener("pointerdown", (event) => {
        if (event.button !== 0) return;
        if (!matchMedia("(pointer: fine)").matches || phoneLayout()) return;
        const origin = spots[item.id] ?? { x: 8, y: 8 };
        const startX = event.clientX;
        const startY = event.clientY;
        let dragging = false;
        const move = (ev: PointerEvent) => {
          const dx = ev.clientX - startX;
          const dy = ev.clientY - startY;
          if (!dragging && dx * dx + dy * dy < 16) return;
          dragging = true;
          spots[item.id] = { x: origin.x + dx, y: origin.y + dy };
          layoutIcons();
        };
        const up = () => {
          button.removeEventListener("pointermove", move);
          button.removeEventListener("pointerup", up);
          if (!dragging) return;
          button.dataset.dragged = "1";
          saveLayout();
        };
        button.addEventListener("pointermove", move);
        button.addEventListener("pointerup", up);
      });
      button.addEventListener("click", () => {
        if (button.dataset.dragged === "1") {
          button.dataset.dragged = "";
          return;
        }
        selected = item.id;
        paintSelection();
        if (matchMedia("(pointer: coarse)").matches || phoneLayout()) openHref(item.path);
      });
      button.addEventListener("dblclick", () => {
        if (matchMedia("(pointer: fine)").matches && !phoneLayout()) openHref(item.path);
      });
      icons.append(button);
    }
    layoutIcons();
  }

  function loadSocial(): void {
    for (const item of SOCIAL) {
      if (!item.href) continue;
      const link = document.createElement("a");
      link.className = "social-link";
      link.href = item.href;
      link.target = "_blank";
      link.rel = "noreferrer noopener";
      const img = document.createElement("img");
      img.src = item.icon;
      img.alt = "";
      img.width = 32;
      img.height = 32;
      const label = document.createElement("span");
      label.textContent = item.label;
      link.append(img, label);
      social.append(link);
    }
  }

  function loadMenu(): void {
    menuList.replaceChildren();
    MENU_GROUPS.forEach((group, index) => {
      if (index > 0) {
        const rule = document.createElement("div");
        rule.className = "menu-gap";
        menuList.append(rule);
      }
      for (const id of group) {
        const item = APPS.find((appItem) => appItem.id === id);
        if (!item) continue;
        const button = document.createElement("button");
        button.type = "button";
        button.className = "menu-item";
        button.innerHTML = `${ICONS[item.icon] ?? ""}<span></span>`;
        const span = button.querySelector("span");
        if (item.id === "buddy") {
          const nuggetLabel = () => (sessionGet("pkn-clippy") === "0" ? t("Show Nugget") : t("Hide Nugget"));
          if (span) span.textContent = nuggetLabel();
          button.addEventListener("click", () => {
            menu.classList.remove("open");
            const node = document.getElementById("clippy");
            if (node?.hidden) clippy?.show();
            else clippy?.hide();
            if (span) span.textContent = document.getElementById("clippy")?.hidden ? t("Show Nugget") : t("Hide Nugget");
          });
          menuList.append(button);
          return;
        }
        if (span) span.textContent = t(item.label);
        button.addEventListener("click", () => openHref(item.path));
        menuList.append(button);
      }
    });
  }

  function finishBoot(): void {
    if (boot.hidden) return;
    window.clearInterval(bootTimer);
    boot.hidden = true;
    sessionSet("pkn-boot", "1");
    idleAt = Date.now();
    const path = normalizePath(location.pathname);
    if (path !== "/") openHref(`${location.pathname}${location.search}`, false);
  }

  function arrangeIcons(): void {
    reflowIcons(true);
  }

  function paintPrint(): void {
    printPack.replaceChildren();
    for (const path of ["/", "/jobs", "/work"]) {
      const section = document.createElement("section");
      section.innerHTML = documentBody(path);
      printPack.append(section);
    }
  }

  function applyLang(next: Lang): void {
    setLang(next);
    sessionSet("pkn-lang", getLang());
    document.documentElement.lang = getLang();
    lang.textContent = getLang().toUpperCase();
    if (startLabel) startLabel.textContent = t("Start");
    loadMenu();
    for (const button of deskMenu.querySelectorAll<HTMLButtonElement>("button")) {
      const key = button.dataset.label;
      if (key) button.textContent = t(key);
    }
    for (const win of windows) {
      win.title = titleFor(win.path);
      const text = win.el.querySelector(".title-bar-text");
      if (text) text.textContent = win.title;
      fill(win);
    }
    for (const button of icons.querySelectorAll<HTMLButtonElement>(".desk-icon")) {
      const item = APPS.find((appItem) => appItem.id === button.dataset.app);
      const label = button.querySelector(".label");
      if (item && label) label.textContent = t(item.label);
    }
    renderTasks();
    clippy?.labels();
    paintPrint();
  }

  const printPack = document.createElement("div");
  printPack.id = "print-pack";
  const saver = document.createElement("div");
  saver.id = "saver";
  saver.hidden = true;
  const saverPic = document.createElement("img");
  saverPic.src = "/buddy/nugget.png";
  saverPic.alt = "";
  saver.append(saverPic);
  saverPic.style.left = "12px";
  saverPic.style.top = "12px";
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let saverFrame = 0;
  let saverX = 12;
  let saverY = 12;
  let saverVx = 0.11;
  let saverVy = 0.07;
  let saverLast = 0;
  function saverStep(now: number): void {
    saverFrame = 0;
    if (saver.hidden || reducedMotion) return;
    const dt = saverLast ? Math.min(34, now - saverLast) : 16;
    saverLast = now;
    const maxX = Math.max(0, saver.clientWidth - saverPic.offsetWidth);
    const maxY = Math.max(0, saver.clientHeight - saverPic.offsetHeight);
    saverX += saverVx * dt;
    saverY += saverVy * dt;
    let hitX = false;
    let hitY = false;
    if (saverX <= 0) {
      saverX = 0;
      hitX = true;
    } else if (saverX >= maxX) {
      saverX = maxX;
      hitX = true;
    }
    if (saverY <= 0) {
      saverY = 0;
      hitY = true;
    } else if (saverY >= maxY) {
      saverY = maxY;
      hitY = true;
    }
    if (hitX) saverVx = -saverVx;
    if (hitY) saverVy = -saverVy;
    saverPic.style.left = `${saverX}px`;
    saverPic.style.top = `${saverY}px`;
    saverFrame = window.requestAnimationFrame(saverStep);
  }
  function showSaver(): void {
    if (!saver.hidden) return;
    saver.hidden = false;
    if (reducedMotion) {
      saverPic.style.left = "12px";
      saverPic.style.top = "12px";
      return;
    }
    saverLast = 0;
    if (!saverFrame) saverFrame = window.requestAnimationFrame(saverStep);
  }
  function hideSaver(): void {
    saver.hidden = true;
    if (saverFrame) window.cancelAnimationFrame(saverFrame);
    saverFrame = 0;
    saverLast = 0;
  }
  const deskMenu = document.createElement("div");
  deskMenu.id = "desk-menu";
  deskMenu.hidden = true;
  for (const [label, action] of [
    ["Arrange icons", arrangeIcons],
    ["Display", () => openHref("/display")],
    ["Run", () => openHref("/run")],
  ] as const) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.label = label;
    button.textContent = t(label);
    button.addEventListener("click", () => {
      deskMenu.hidden = true;
      action();
    });
    deskMenu.append(button);
  }
  app.append(printPack, saver, deskMenu);

  applyWallpaper(wallpaperId());
  loadDesktop();
  loadSocial();
  loadMenu();
  clippy = mountClippy(desktop);
  clippy.nudge();
  paintPrint();
  paintClock();
  window.setInterval(paintClock, 10000);

  const langs: Lang[] = ["en", "es", "de", "fr"];
  lang.addEventListener("click", () => {
    const index = langs.indexOf(getLang());
    applyLang(langs[(index + 1) % langs.length] ?? "en");
  });
  setNavigator((dest) => {
    if (dest === "/admin") {
      closePath("/login");
      closePath("/admin/login");
    }
    if (dest === "/" || dest === "/login" || dest === "/admin/login") closePath("/admin");
    openHref(dest);
  });
  const wake = (event: Event) => {
    idleAt = Date.now();
    hideSaver();
    const target = event.target;
    if (target instanceof Node && deskMenu.contains(target)) return;
    deskMenu.hidden = true;
  };
  document.addEventListener("pointerdown", wake);
  document.addEventListener("keydown", wake);
  window.setInterval(() => {
    if (!boot.hidden || document.hidden) return;
    if (Date.now() - idleAt > 90_000) showSaver();
  }, 5000);
  desktop.addEventListener("contextmenu", (event) => {
    const target = event.target;
    if (target !== desktop && target !== wallpaper && target !== icons) return;
    event.preventDefault();
    deskMenu.hidden = false;
    const host = app.getBoundingClientRect();
    deskMenu.style.left = `${Math.min(Math.max(0, event.clientX - host.left), Math.max(0, host.width - 180))}px`;
    deskMenu.style.top = `${Math.min(Math.max(0, event.clientY - host.top), Math.max(0, host.height - 120))}px`;
  });

  start.addEventListener("click", (event) => {
    event.stopPropagation();
    menu.classList.toggle("open");
  });
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (menu.contains(target) || start.contains(target)) return;
    menu.classList.remove("open");
  });
  desktop.addEventListener("pointerdown", (event) => {
    if (event.target !== desktop && event.target !== icons) return;
    selected = "";
    paintSelection();
  });
  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!(event.target instanceof Element)) return;
    const anchor = event.target.closest("a");
    if (!anchor) return;
    const href = anchor.getAttribute("href") ?? "";
    if (!href.startsWith("/") || href.startsWith("//")) return;
    const internal =
      !href.includes(".") ||
      href.startsWith("/work/") ||
      href.startsWith("/notes/") ||
      href.startsWith("/blog/");
    if (!internal) return;
    event.preventDefault();
    const cmd = anchor.dataset.cmd;
    if (cmd) {
      const step = parseCommand(cmd, opens);
      if (step.type === "nav") openHref(step.path);
      if (step.type === "external") location.assign(step.href);
      return;
    }
    openHref(href);
  });
  document.addEventListener("keyup", (event) => {
    const win = windows.find((item) => item.id === activeId);
    if (win?.term?.inGame()) win.term.onKeyUp(event.key);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.classList.contains("open")) {
      menu.classList.remove("open");
      event.preventDefault();
      return;
    }
    const win = windows.find((item) => item.id === activeId);
    if (win?.term?.inGame()) {
      if (event.target instanceof HTMLElement && event.target.closest("input, textarea")) return;
      if (win.term.onKey(event.key, event.repeat)) event.preventDefault();
      return;
    }
    const target = event.target;
    if (target instanceof HTMLElement && (target.closest("input, textarea") || target.isContentEditable)) return;
    if (event.key === "Enter" && selected) {
      const item = APPS.find((appItem) => appItem.id === selected);
      if (item) openHref(item.path);
    }
  });
  window.addEventListener("popstate", () => {
    const path = normalizePath(location.pathname);
    if (path === "/") return;
    openHref(`${location.pathname}${location.search}`, false);
  });
  const refit = (reflow: boolean) => {
    fitViewport();
    if (reflow) reflowIcons();
    else layoutIcons();
    for (const win of windows) {
      const maxBtn = win.el.querySelectorAll(".title-bar-controls button")[1];
      if (maxBtn instanceof HTMLButtonElement) maxBtn.hidden = phoneLayout();
      if (!win.max) clamp(win);
      place(win);
    }
  };
  window.addEventListener("resize", () => refit(true));
  window.visualViewport?.addEventListener("resize", () => refit(true));
  window.visualViewport?.addEventListener("scroll", () => refit(false));

  if (sessionGet("pkn-boot") === "1") {
    boot.hidden = true;
    const path = normalizePath(location.pathname);
    if (path !== "/") openHref(`${location.pathname}${location.search}`, false);
  } else {
    const bar = boot.querySelector("#boot-bar");
    const steps = [8, 19, 33, 52, 71, 86, 100];
    let step = 0;
    if (bar instanceof HTMLElement) bar.style.width = `${steps[0]}%`;
    boot.addEventListener("pointerdown", () => finishBoot(), { once: true });
    bootTimer = window.setInterval(() => {
      step += 1;
      const width = steps[step] ?? 100;
      if (bar instanceof HTMLElement) bar.style.width = `${width}%`;
      if (step >= steps.length - 1) finishBoot();
    }, 180);
  }
}

function gridFor(ids: string[], areaW: number, areaH: number): Record<string, Spot> {
  const width = Math.max(CELL_W, areaW);
  const height = Math.max(CELL_H, areaH);
  const rows = Math.max(1, Math.floor((height - 8) / CELL_H));
  const cells: Spot[] = [];
  const maxCols = Math.max(1, Math.ceil(ids.length / rows) + 6);
  for (let col = 0; col < maxCols && cells.length < ids.length; col += 1) {
    for (let row = 0; row < rows && cells.length < ids.length; row += 1) {
      const x = 8 + col * CELL_W;
      const y = 8 + row * CELL_H;
      if (x + 48 > width) continue;
      if (x + CELL_W > width - SOCIAL_W && y + CELL_H > height - SOCIAL_H) continue;
      cells.push({ x, y });
    }
  }
  const laid: Record<string, Spot> = {};
  ids.forEach((id, index) => {
    laid[id] = cells[index] ?? { x: 8, y: 8 };
  });
  return laid;
}

function readLayout(ids: string[], areaW: number, areaH: number): Record<string, Spot> {
  const fresh = gridFor(ids, areaW, areaH);
  const raw = sessionGet("pkn-icons");
  if (!raw) return fresh;
  try {
    const parsed = JSON.parse(raw) as Partial<LayoutSave>;
    if (parsed.w !== areaW || parsed.h !== areaH || !parsed.spots) return fresh;
    for (const id of ids) {
      const spot = parsed.spots[id];
      if (!spot || typeof spot.x !== "number" || typeof spot.y !== "number") continue;
      if (spot.x < -40 || spot.y < -40 || spot.x > areaW || spot.y > areaH) continue;
      fresh[id] = { x: spot.x, y: spot.y };
    }
  } catch {
    /* ignore a bad saved layout */
  }
  return fresh;
}
