import { describe, expect, it } from "vitest";
import { createSweep, sweepFlag, sweepOpen, sweepPoints, sweepTier } from "./sweep";

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

  it("tightens the grid as the level rises", () => {
    const first = sweepTier(1);
    const next = sweepTier(2);
    const late = sweepTier(8);
    expect(first).toEqual({ width: 9, height: 9, mines: 10 });
    expect(next.mines).toBeGreaterThan(first.mines);
    expect(late.width).toBeGreaterThan(first.width);
    expect(late.mines).toBeGreaterThan(next.mines);
    expect(sweepPoints(10, 1, false)).toBe(10);
    expect(sweepPoints(10, 2, true)).toBe(70);
  });
});
