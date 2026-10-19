// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { mathKey, mathStart, mountMath, rollDie, wheelNames, wheelWithout } from "./tools";

describe("desk tools", () => {
  it("applies calculator keys from left to right", () => {
    let state = mathStart();
    for (const key of ["2", "+", "3", "*", "4", "="]) state = mathKey(state, key);
    expect(state.display).toBe("20");
  });

  it("shows error when a divide hits zero", () => {
    let state = mathStart();
    for (const key of ["1", "/", "0", "="]) state = mathKey(state, key);
    expect(state.display).toBe("error");
  });

  it("rolls a one from a zero roll", () => {
    expect(rollDie(6, () => 0)).toBe(1);
    expect(rollDie(99, () => 0)).toBe(1);
  });

  it("takes the winner off the list and keeps the rest", () => {
    expect(wheelWithout("Ana\nBo\n\nCy", 1)).toBe("Ana\n\nCy");
    expect(wheelWithout("Ana", 0)).toBe("");
    expect(wheelNames(wheelWithout(" a \n b \n c", 0))).toEqual(["b", "c"]);
  });

  it("keeps at most 24 wheel names", () => {
    const text = Array.from({ length: 30 }, (_, index) => `n${index}`).join("\n");
    expect(wheelNames(text)).toHaveLength(24);
    expect(wheelNames(" a \n\n b ")).toEqual(["a", "b"]);
  });

  it("marks calculator keys so numbers, operators, equals, and clear can be colored", () => {
    const host = document.createElement("div");
    mountMath(host);
    const kind = (label: string) => [...host.querySelectorAll("button")].find((button) => button.textContent === label)?.dataset.kind;
    expect(kind("7")).toBe("num");
    expect(kind("+")).toBe("op");
    expect(kind("/")).toBe("op");
    expect(kind("=")).toBe("eq");
    expect(kind("C")).toBe("clear");
  });
});
