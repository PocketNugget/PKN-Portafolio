// @vitest-environment happy-dom
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { setLang } from "../i18n";
import { bootDesktop } from "./desktop";

describe("first visit in a Spanish browser", () => {
  beforeAll(() => {
    vi.spyOn(navigator, "languages", "get").mockReturnValue(["es-MX", "en-US"]);
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 404 })));
    window.matchMedia = ((query: string) => ({ matches: query.includes("pointer: fine"), media: query, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia;
    sessionStorage.clear();
    sessionStorage.setItem("pkn-boot", "1");
    history.replaceState({}, "", "/");
    document.body.innerHTML = '<div id="app"></div>';
    bootDesktop();
  });

  afterAll(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    setLang("en");
    document.body.replaceChildren();
  });

  it("opens in Spanish without being asked, and remembers it for the tab", () => {
    expect(document.documentElement.lang).toBe("es");
    expect(document.querySelector("#lang")?.textContent).toBe("ES");
    expect(document.querySelector(".desk-win .title-bar-text")?.textContent).toBe("Sobre mí");
    expect(document.querySelector('.desk-icon[data-app="jobs"] .label')?.textContent).toBe("Empleos");
  });

  it("keeps a language the visitor picked over the browser's", () => {
    sessionStorage.setItem("pkn-lang", "de");
    document.body.innerHTML = '<div id="app"></div>';
    bootDesktop();
    expect(document.documentElement.lang).toBe("de");
  });
});
