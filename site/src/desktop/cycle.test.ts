import { describe, expect, it } from "vitest";
import { createCycle, cycleAim, cycleLevel, cyclePace, stepCycle } from "./cycle";

describe("tron", () => {
  it("moves both bikes and refuses a reversal", () => {
    const start = createCycle();
    expect(cycleAim(start, "left").pending).toBeUndefined();
    expect(cycleAim(start, "up").pending).toBe("up");
    const moved = stepCycle(cycleAim(start, "up"));
    expect(start.you).toEqual({ x: 4, y: 8 });
    expect(moved.dead).toBe(false);
    expect(moved.you).toEqual({ x: 4, y: 7 });
    expect(moved.foe.x).toBe(22);
    expect(moved.score).toBe(1);
    expect(moved.level).toBe(1);
    expect(moved.trail[moved.you.y * moved.width + moved.you.x]).toBe(1);
  });

  it("dies on a wall or a trail", () => {
    const start = createCycle();
    const wall = stepCycle({ ...start, you: { x: start.width - 1, y: 2 }, youDir: "right" });
    expect(wall.dead).toBe(true);
    expect(stepCycle(wall)).toBe(wall);
    const trail = start.trail.slice();
    trail[2 * start.width + 6] = 1;
    const hit = stepCycle({ ...start, you: { x: 5, y: 2 }, youDir: "right", trail });
    expect(hit.dead).toBe(true);
  });

  it("scores a crashed bike and speeds up", () => {
    const start = createCycle();
    const trail = start.trail.slice();
    trail[start.foe.y * start.width + start.foe.x] = 0;
    const foe = { x: 1, y: 1 };
    trail[foe.y * start.width + foe.x] = 2;
    trail[1] = 2;
    trail[start.width] = 2;
    trail[start.width + 2] = 2;
    const next = stepCycle({ ...start, foe, foeDir: "up", trail });
    expect(next.dead).toBe(false);
    expect(next.score).toBe(16);
    expect(cycleLevel(0)).toBe(1);
    expect(cycleLevel(20)).toBe(2);
    expect(cyclePace(1)).toBeGreaterThan(cyclePace(6));
    expect(cyclePace(20)).toBe(68);
  });
});
