// @vitest-environment happy-dom
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { setLang, t } from "../i18n";
import { APPS, bootDesktop } from "./desktop";

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

const day = 86_400_000;

describe("desktop with a recent blog post", () => {
  const original = window.matchMedia;

  beforeAll(async () => {
    window.matchMedia = media((query) => query.includes("pointer: fine"));
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) =>
        url === "/api/blog"
          ? Response.json({
              posts: [
                { slug: "new-one", title: "New", tags: "", created: new Date(Date.now() - 3 * day).toISOString() },
                { slug: "old-one", title: "Old", tags: "", created: new Date(Date.now() - 400 * day).toISOString() },
                { slug: "bad", title: "Bad", tags: "", created: 5 },
              ],
            })
          : new Response("{}", { status: 404 }),
      ),
    );
    sessionStorage.setItem("pkn-boot", "1");
    sessionStorage.removeItem("pkn-lang");
    history.replaceState({}, "", "/");
    document.body.innerHTML = '<div id="app"></div>';
    bootDesktop();
    await new Promise((resolve) => setTimeout(resolve, 20));
  });

  afterAll(() => {
    window.matchMedia = original;
    vi.unstubAllGlobals();
    setLang("en");
    document.body.replaceChildren();
  });

  it("puts a bubble with the count on the Blog icon and labels it for a screen reader", () => {
    const icon = document.querySelector<HTMLElement>('.desk-icon[data-app="blog"]');
    expect(icon?.querySelector(".icon-badge")?.textContent).toBe("1");
    expect(icon?.getAttribute("aria-label")).toBe("Blog, 1 new posts");
    expect(document.querySelectorAll(".icon-badge")).toHaveLength(1);
  });

  it("keeps the bubble and relabels it when the language changes", () => {
    setLang("es");
    document.querySelector<HTMLButtonElement>("#lang")?.click();
    document.querySelector<HTMLButtonElement>('[data-lang="es"]')?.click();
    const icon = document.querySelector<HTMLElement>('.desk-icon[data-app="blog"]');
    expect(icon?.querySelector(".icon-badge")).not.toBeNull();
    expect(icon?.getAttribute("aria-label")).toContain("publicaciones nuevas");
    setLang("en");
  });

  it("lists Games second to last on the desktop, right before Hack, with the tools loose", () => {
    const order = APPS.filter((app) => app.desk).map((app) => app.id);
    expect(order.at(-1)).toBe("hack");
    expect(order.at(-2)).toBe("games");
    for (const id of ["player", "convert", "math", "dice", "flip", "wheel"]) expect(order).toContain(id);
    expect(order).not.toContain("accessories");
  });

  it("translates the new blog, comment box, hack, and nugget labels", () => {
    const lines = [
      "Posts by Goben. The newest is on top.",
      "No posts yet. Check back soon.",
      "Back to the blog",
      "Leave a comment!",
      "Comment box for this site. Leave a comment about the portfolio. It stays on this page, and I can read it in the editor.",
      "Warning: this effect flashes, shakes, and glitches the screen. If you have photosensitive epilepsy or are sensitive to flashing images, do not press the button.",
      "Hey! You hacked me! My tie is changing colors!",
    ];
    for (const lang of ["es", "de", "fr"] as const) {
      setLang(lang);
      for (const line of lines) {
        expect(t(line), `${lang}: ${line.slice(0, 40)}`).not.toBe(line);
        expect(t(line)).not.toContain("—");
        expect(t(line)).not.toContain("ß");
      }
    }
    setLang("en");
  });
});
