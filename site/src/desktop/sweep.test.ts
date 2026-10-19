import { describe, expect, it } from "vitest";
import { createSweep, sweepCellLabel, sweepChord, sweepFlag, sweepOpen, sweepPoints, sweepTier, type SweepState } from "./sweep";

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

function fixed(mines: number[]): SweepState {
  // 3x3 with mines placed by hand and counts filled in, already armed.
  const state = createSweep(3, 3, mines.length);
  const cells = state.cells.map((cell, index) => ({ ...cell, mine: mines.includes(index) }));
  cells.forEach((cell, index) => {
    const x = index % 3;
    const y = Math.floor(index / 3);
    let near = 0;
    for (let dy = -1; dy <= 1; dy += 1) for (let dx = -1; dx <= 1; dx += 1) {
      if (!dx && !dy) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < 3 && ny < 3 && mines.includes(ny * 3 + nx)) near += 1;
    }
    cell.near = cell.mine ? 0 : near;
  });
  return { ...state, cells, armed: true };
}

describe("sweep, status quo controls", () => {
  it("chords an open number once its flags match", () => {
    let state = fixed([0]);
    state = sweepOpen(state, 4);
    expect(state.cells[4]?.open).toBe(true);
    expect(sweepChord(state, 4).cells[8]?.open).toBe(false);
    state = sweepFlag(state, 0);
    state = sweepChord(state, 4);
    expect(state.alive).toBe(true);
    expect(state.cells.filter((cell) => cell.open).length).toBe(8);
    expect(state.won).toBe(true);
  });

  it("loses on a chord when a flag is wrong", () => {
    let state = sweepOpen(fixed([0]), 4);
    state = sweepFlag(state, 2);
    state = sweepChord(state, 4);
    expect(state.alive).toBe(false);
  });

  it("names each cell by row, column, and what it shows", () => {
    let state = sweepOpen(fixed([0]), 4);
    expect(sweepCellLabel(state, 4)).toBe("Row 2, column 2: 1 near");
    expect(sweepCellLabel(state, 8)).toBe("Row 3, column 3: hidden");
    state = sweepFlag(state, 0);
    expect(sweepCellLabel(state, 0)).toBe("Row 1, column 1: flagged");
  });
});
