// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";
import { mountClippy } from "./buddy";

afterEach(() => {
  document.body.replaceChildren();
  sessionStorage.clear();
});

describe("nugget on a phone", () => {
  it("closes its balloon after a few seconds so it does not sit on the icons, but keeps a scare open", () => {
    vi.useFakeTimers();
    const original = window.matchMedia;
    window.matchMedia = ((query: string) => ({ matches: query.includes("max-width: 700px"), media: query, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia;
    const desktop = document.createElement("div");
    desktop.id = "desktop";
    document.body.append(desktop);
    const nugget = mountClippy(desktop);
    const balloon = document.querySelector<HTMLElement>("#clippy .balloon");
    expect(balloon?.hidden).toBe(false);
    vi.advanceTimersByTime(9100);
    expect(balloon?.hidden).toBe(true);
    nugget.scare("Hey!");
    vi.advanceTimersByTime(20000);
    expect(balloon?.hidden).toBe(false);
    window.matchMedia = original;
    vi.useRealTimers();
  });
});

describe("nugget", () => {
  it("keeps its feet planted when the balloon closes", () => {
    const desktop = document.createElement("div");
    desktop.id = "desktop";
    desktop.style.cssText = "position:relative;width:390px;height:700px";
    document.body.append(desktop);
    mountClippy(desktop);
    const root = document.getElementById("clippy");
    if (!(root instanceof HTMLElement)) throw new Error("clippy");
    const parked = root.style.bottom;
    expect(root.style.top).toBe("auto");
    expect(parked).not.toBe("");
    const close = root.querySelector(".balloon-x");
    if (!(close instanceof HTMLButtonElement)) throw new Error("close");
    close.click();
    const balloon = root.querySelector(".balloon");
    expect(balloon instanceof HTMLElement && balloon.hidden).toBe(true);
    expect(root.style.top).toBe("auto");
    expect(root.style.bottom).toBe(parked);
    const pic = root.querySelector(".buddy-pic");
    if (!(pic instanceof HTMLElement)) throw new Error("pic");
    pic.click();
    expect(balloon instanceof HTMLElement && balloon.hidden).toBe(false);
    expect(root.style.bottom).toBe(parked);
  });
});
