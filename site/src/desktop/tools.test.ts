import { describe, expect, it } from "vitest";
import { mathKey, mathStart, rollDie, wheelNames } from "./tools";

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

  it("keeps at most 24 wheel names", () => {
    const text = Array.from({ length: 30 }, (_, index) => `n${index}`).join("\n");
    expect(wheelNames(text)).toHaveLength(24);
    expect(wheelNames(" a \n\n b ")).toEqual(["a", "b"]);
  });
});
