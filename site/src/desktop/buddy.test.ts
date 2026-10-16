// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from "vitest";
import { mountClippy } from "./buddy";

afterEach(() => {
  document.body.replaceChildren();
  sessionStorage.clear();
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
