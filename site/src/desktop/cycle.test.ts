import { describe, expect, it } from "vitest";
import { CYCLE_ROUNDS, createCycle, cycleAim, cycleLevel, cyclePace, stepCycle } from "./cycle";

describe("tron", () => {
  it("starts on a large grid with you and two enemies", () => {
    const start = createCycle();
    expect(start.width * start.height).toBeGreaterThanOrEqual(3000);
    expect(start.foes).toHaveLength(2);
    expect(start.trail.filter((cell) => cell === 2)).toHaveLength(1);
    expect(start.trail.filter((cell) => cell === 3)).toHaveLength(1);
  });

  it("moves every bike and refuses a reversal", () => {
    const start = createCycle();
    expect(cycleAim(start, "left").pending).toBeUndefined();
    const turned = cycleAim(cycleAim(start, "up"), "right");
    expect(turned.pending).toBe("up");
    expect(turned.buffered).toBe("right");
    const moved = stepCycle(cycleAim(start, "up"));
    const y = start.you.y;
    expect(moved.dead).toBe(false);
    expect(moved.you).toEqual({ x: start.you.x, y: y - 1 });
    expect(moved.score).toBe(1);
    expect(moved.level).toBe(1);
    expect(moved.trail[moved.you.y * moved.width + moved.you.x]).toBe(1);
    expect(moved.trail[y * moved.width + start.you.x]).toBe(1);
    expect(moved.foes.every((foe, index) => foe.pos.x !== start.foes[index]?.pos.x || foe.pos.y !== start.foes[index]?.pos.y)).toBe(true);
    expect(moved.foes.every((foe) => foe.alive)).toBe(true);
  });

  it("remembers each turn so the trail can be drawn as one line", () => {
    const start = createCycle();
    expect(start.corners).toHaveLength(3);
    expect(start.corners[0]).toEqual([start.you]);
    const straight = stepCycle(start);
    expect(straight.corners[0]).toEqual([start.you]);
    const turned = stepCycle(cycleAim(start, "up"));
    expect(turned.corners[0]).toEqual([start.you, start.you]);
    expect(start.corners[0]).toEqual([start.you]);
  });

  it("dies on a wall or a trail", () => {
    const start = createCycle();
    const wall = stepCycle({ ...start, you: { x: start.width - 1, y: 2 }, youDir: "right" });
    expect(wall.dead).toBe(true);
    expect(stepCycle(wall)).toBe(wall);
    const trail = start.trail.slice();
    trail[2 * start.width + 6] = 1;
    expect(stepCycle({ ...start, you: { x: 5, y: 2 }, youDir: "right", trail }).dead).toBe(true);
  });

  it("scores a crashed enemy and wipes its light trail", () => {
    const start = createCycle();
    const trail = start.trail.slice();
    const first = start.foes[0];
    if (!first) throw new Error("foe");
    trail[first.pos.y * start.width + first.pos.x] = 0;
    const pos = { x: 1, y: 1 };
    trail[pos.y * start.width + pos.x] = 2;
    trail[1] = 2;
    trail[start.width] = 2;
    trail[start.width + 2] = 2;
    const next = stepCycle({ ...start, foes: [{ pos, dir: "up", alive: true }, ...start.foes.slice(1)], trail });
    expect(next.dead).toBe(false);
    expect(next.foes[0]?.alive).toBe(false);
    expect(next.foes[1]?.alive).toBe(true);
    expect(next.score).toBe(26);
    expect(next.fresh).toBe(12);
    expect(next.trail.filter((cell) => cell === 2)).toHaveLength(0);
    expect(next.corners[1]).toEqual([]);
    expect(next.trail.filter((cell) => cell === 3)).toHaveLength(2);
  });

  it("starts a faster round when both enemies are gone and wins after the last one", () => {
    const start = createCycle();
    const trail = start.trail.slice();
    const walled = start.foes.map((foe) => ({ ...foe, alive: true }));
    for (const foe of walled) {
      for (const [dx, dy] of [[-1, 0], [0, -1], [0, 1]] as const) trail[(foe.pos.y + dy) * start.width + foe.pos.x + dx] = 1;
    }
    const round = stepCycle({ ...start, foes: walled, trail, rounds: 0 });
    expect(round.rounds).toBe(1);
    expect(round.level).toBe(2);
    expect(round.you).toEqual({ x: 8, y: Math.floor(start.height / 2) });
    expect(round.trail.filter((cell) => cell !== 0)).toHaveLength(3);
    const last = stepCycle({ ...start, foes: walled, trail, rounds: CYCLE_ROUNDS - 1 });
    expect(last.won).toBe(true);
    expect(cycleLevel(0)).toBe(1);
    expect(cycleLevel(100)).toBe(2);
    expect(cycleLevel(0, 2)).toBe(3);
    expect(cyclePace(1)).toBeGreaterThan(cyclePace(6));
    expect(cyclePace(30)).toBe(62);
  });
});
