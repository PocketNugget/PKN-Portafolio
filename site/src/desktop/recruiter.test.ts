// @vitest-environment happy-dom
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { hero } from "../catalog";
import { setLang } from "../i18n";
import { render } from "../render";
import { APPS, FOLDERS, bootDesktop, copyText, flagSvg, isDocPath } from "./desktop";
import { countAt, mountHero, withCount } from "./hero";

function media(matches: (query: string) => boolean): typeof window.matchMedia {
  return ((query: string) => ({
    matches: matches(query),
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {
      return false;
    },
  })) as unknown as typeof window.matchMedia;
}

function heroHost(): HTMLElement {
  const body = document.createElement("div");
  body.innerHTML = render("/");
  const host = body.querySelector(".hero");
  if (!(host instanceof HTMLElement)) throw new Error("hero missing");
  return host;
}

describe("hero numbers", () => {
  it("eases from zero to the record and never past it", () => {
    expect(countAt(34125, 0)).toBe(0);
    expect(countAt(34125, 36)).toBe(34125);
    expect(countAt(34125, 99)).toBe(34125);
    let last = 0;
    for (let step = 1; step <= 36; step += 1) {
      const value = countAt(52, step);
      expect(value).toBeGreaterThanOrEqual(last);
      expect(value).toBeLessThanOrEqual(52);
      last = value;
    }
  });

  it("keeps the suffix and the thousands comma", () => {
    expect(withCount("34,125", 1200)).toBe("1,200");
    expect(withCount("70%", 12)).toBe("12%");
    expect(withCount("8+", 3)).toBe("3+");
  });

  it("only counts stats taken from the catalog record", () => {
    const counted = hero.stats.filter((stat) => stat.count !== undefined);
    for (const stat of counted) expect(withCount(stat.big, stat.count ?? 0)).toBe(stat.big);
  });
});

describe("hero identity", () => {
  it("keeps the current role and the start date fixed while the highlights rotate", () => {
    const host = heroHost();
    expect(host.querySelector(".hero-title")?.textContent).toBe(hero.title);
    expect(host.querySelector(".hero-since")?.textContent).toContain("April 2025");
    expect(hero.roles).not.toContain(hero.title);
  });
});

describe("hero motion", () => {
  afterAll(() => {
    vi.useRealTimers();
  });

  it("shows the final record at once when motion is reduced", () => {
    const host = heroHost();
    const app = mountHero(host, true);
    expect(host.classList.contains("is-still")).toBe(true);
    expect(host.querySelector('b[data-count="34125"]')?.textContent).toBe("34,125");
    expect(host.querySelector(".hero-type")?.textContent).toBe(hero.roles[0]);
    app.destroy();
  });

  it("counts up to the record and types the next role", () => {
    vi.useFakeTimers();
    const host = heroHost();
    const app = mountHero(host, false);
    const big = host.querySelector('b[data-count="34125"]');
    expect(big?.textContent).toBe("0");
    vi.advanceTimersByTime(260 + 36 * 32 + 10);
    expect(big?.textContent).toBe("34,125");
    expect(host.querySelector('b[data-count="70"]')?.textContent).toBe("70%");
    expect(host.querySelector('b[data-count="8"]')?.textContent).toBe("8+");
    const typer = host.querySelector(".hero-type");
    vi.advanceTimersByTime(1900 + 60 * 22 + 200);
    expect(typer?.textContent).not.toBe(hero.roles[0]);
    expect((hero.roles[1] ?? "").startsWith(typer?.textContent ?? "x")).toBe(true);
    app.destroy();
    const frozen = typer?.textContent;
    vi.advanceTimersByTime(5000);
    expect(typer?.textContent).toBe(frozen);
    vi.useRealTimers();
  });
});

describe("desktop for a recruiter", () => {
  const original = window.matchMedia;

  beforeAll(() => {
    window.matchMedia = media((query) => query.includes("pointer: fine"));
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 404 })));
    sessionStorage.setItem("pkn-boot", "1");
    sessionStorage.removeItem("pkn-lang");
    history.replaceState({}, "", "/");
    document.body.innerHTML = '<div id="app"></div>';
    bootDesktop();
  });

  afterAll(() => {
    window.matchMedia = original;
    vi.unstubAllGlobals();
    setLang("en");
    document.body.replaceChildren();
  });

  const titles = () => [...document.querySelectorAll(".desk-win .title-bar-text")].map((el) => el.textContent);

  it("opens About Me with the hero on arrival", () => {
    expect(titles()).toEqual(["About Me"]);
    expect(document.querySelector(".desk-win .hero")).not.toBeNull();
    expect(document.querySelector('.desk-icon[data-app="about"]')?.classList.contains("attn")).toBe(true);
    expect(document.activeElement?.classList.contains("window-body")).toBe(true);
    expect(document.activeElement?.closest(".desk-win")?.querySelector(".hero")).not.toBeNull();
  });

  it("opens an icon with one click and does not duplicate it", () => {
    const jobs = document.querySelector<HTMLButtonElement>('.desk-icon[data-app="jobs"]');
    jobs?.click();
    expect(titles()).toEqual(["About Me", "Jobs"]);
    jobs?.click();
    jobs?.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
    expect(titles()).toEqual(["About Me", "Jobs"]);
  });

  it("shows the flag and picks a language from the menu", () => {
    const lang = document.querySelector<HTMLButtonElement>("#lang");
    const menu = document.querySelector<HTMLElement>("#lang-menu");
    expect(lang?.querySelector("svg.flag")).not.toBeNull();
    expect(lang?.textContent).toBe("EN");
    expect(menu?.hidden).toBe(true);
    lang?.click();
    expect(menu?.hidden).toBe(false);
    expect(lang?.getAttribute("aria-expanded")).toBe("true");
    const options = [...(menu?.querySelectorAll<HTMLButtonElement>("button[data-lang]") ?? [])];
    expect(options.map((item) => item.dataset.lang)).toEqual(["en", "es", "de", "fr"]);
    expect(options.every((item) => item.querySelector("svg.flag"))).toBe(true);
    expect(options[0]?.getAttribute("aria-checked")).toBe("true");
    options[1]?.click();
    expect(menu?.hidden).toBe(true);
    expect(sessionStorage.getItem("pkn-lang")).toBe("es");
    expect(lang?.textContent).toBe("ES");
    expect(titles()).toEqual(["Sobre mí", "Empleos"]);
    expect(document.querySelector(".desk-win .hero-langs")?.textContent).toContain("Inglés C1+");
    expect(document.querySelector(".desk-win .hero-open")?.textContent).toContain("Busco trabajo Abierto a puestos de SOC, MDR y SRE.");
  });

  it("closes the language menu with Escape and with an outside click", () => {
    const lang = document.querySelector<HTMLButtonElement>("#lang");
    const menu = document.querySelector<HTMLElement>("#lang-menu");
    lang?.click();
    expect(menu?.hidden).toBe(false);
    menu?.querySelector("button")?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(menu?.hidden).toBe(true);
    lang?.click();
    expect(menu?.hidden).toBe(false);
    document.querySelector("#desktop")?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(menu?.hidden).toBe(true);
  });

  it("keeps the games in one folder and the accessories in Start only", () => {
    const desk = [...document.querySelectorAll<HTMLElement>("#icons .desk-icon")].map((el) => el.dataset.app);
    expect(desk).toContain("games");
    expect(desk).not.toContain("accessories");
    for (const id of [...(FOLDERS["/games"] ?? []), ...(FOLDERS["/accessories"] ?? [])]) expect(desk).not.toContain(id);
    expect(desk.length).toBeLessThanOrEqual(16);
    document.querySelector<HTMLButtonElement>('.desk-icon[data-app="games"]')?.click();
    const folder = [...document.querySelectorAll(".desk-win")].at(-1);
    const items = [...(folder?.querySelectorAll<HTMLButtonElement>(".folder-item") ?? [])];
    expect(items.map((item) => item.dataset.app)).toEqual(["snake", "tetris", "tron", "sweep"]);
    expect(items.every((item) => item.querySelector("svg") && item.querySelector(".label")?.textContent)).toBe(true);
    expect(folder?.querySelector(".window-body")?.classList.contains("doc")).toBe(false);
    items[0]?.click();
    expect(titles()).toContain("Snake");
  });

  it("uses the reading face only in document windows", () => {
    const about = [...document.querySelectorAll(".desk-win")].find((win) => win.querySelector(".hero"));
    expect(about?.querySelector(".window-body")?.classList.contains("doc")).toBe(true);
    for (const path of ["/", "/jobs", "/work", "/work/maia", "/skills", "/certs", "/contact", "/notes/model-files", "/blog", "/colophon"]) {
      expect(isDocPath(path), path).toBe(true);
    }
    for (const path of ["/snake", "/tetris", "/sweep", "/math", "/games", "/accessories", "/terminal", "/pad", "/login", "/hack", "/player"]) {
      expect(isDocPath(path), path).toBe(false);
    }
    expect(APPS.filter((app) => app.desk).length).toBeLessThanOrEqual(16);
  });

  it("copies the email and says so, or says how to get it when copy fails", async () => {
    const button = document.createElement("button");
    button.dataset.copy = "goben.ca.pkn@hotmail.com";
    const writeText = vi.fn(async () => undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    expect(await copyText(button)).toBe(true);
    expect(writeText).toHaveBeenCalledWith("goben.ca.pkn@hotmail.com");
    expect(button.classList.contains("is-copied")).toBe(true);
    Object.defineProperty(navigator, "clipboard", { value: { writeText: vi.fn(async () => Promise.reject(new Error("blocked"))) }, configurable: true });
    expect(await copyText(button)).toBe(false);
    expect(button.textContent).toContain("goben.ca.pkn@hotmail.com");
  });

  it("draws a distinct flag for every language", () => {
    const flags = (["en", "es", "de", "fr"] as const).map((lang) => flagSvg(lang));
    expect(new Set(flags).size).toBe(4);
    for (const flag of flags) expect(flag).toContain('aria-hidden="true"');
  });
});
