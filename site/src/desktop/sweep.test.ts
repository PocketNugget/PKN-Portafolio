import { describe, expect, it } from "vitest";
import { createSweep, sweepFlag, sweepOpen } from "./sweep";

describe("sweep", () => {
  it("keeps the first open cell off a mine", () => {
    const opened = sweepOpen(createSweep(9, 9, 10), 0, () => 0.99);
    expect(opened.armed).toBe(true);
    expect(opened.cells[0]?.mine).toBe(false);
    expect(opened.cells[0]?.open).toBe(true);
    expect(opened.alive).toBe(true);
    expect(opened.cells.filter((cell) => cell.mine)).toHaveLength(10);
  });

  it("does not open a flagged cell", () => {
    const flagged = sweepFlag(createSweep(), 4);
    expect(flagged.cells[4]?.flag).toBe(true);
    expect(flagged.cells[4]?.open).toBe(false);
    const opened = sweepOpen(flagged, 4, () => 0);
    expect(opened.cells[4]?.open).toBe(false);
    expect(opened.armed).toBe(false);
  });

  it("floods an empty board", () => {
    const opened = sweepOpen(createSweep(3, 3, 0), 4, () => 0);
    expect(opened.cells.every((cell) => cell.open)).toBe(true);
    expect(opened.won).toBe(true);
    expect(opened.alive).toBe(true);
  });
});
