import { describe, expect, it } from "vitest";
import {
  clearLines,
  createSnake,
  createTetris,
  pieceBag,
  tetrisHold,
  tetrisPreview,
  placeFood,
  snakeAim,
  snakeLevel,
  snakePace,
  snakeRender,
  stepSnake,
  tetrisDown,
  tetrisHard,
  tetrisLeft,
  tetrisLevel,
  tetrisPace,
  tetrisRender,
  tetrisRotate,
  tetrisTick,
} from "./games";

describe("snake", () => {
  it("moves, eats, and refuses a reversal", () => {
    const start = createSnake(() => 0);
    expect(start.food).toEqual({ x: 0, y: 0 });
    const moved = stepSnake(start);
    expect(moved.dead).toBe(false);
    expect(moved.body[0]).toEqual({ x: 6, y: 5 });
    expect(moved.body).toHaveLength(start.body.length);
    expect(moved.score).toBe(0);

    const ate = stepSnake({ ...start, food: { x: 6, y: 5 } });
    expect(ate.score).toBe(1);
    expect(ate.body).toHaveLength(start.body.length + 1);
    expect(ate.body[0]).toEqual({ x: 6, y: 5 });

    expect(snakeAim(start, "left").pending).toBeUndefined();
    const turned = snakeAim(snakeAim(start, "up"), "left");
    expect(turned.pending).toBe("up");
    expect(turned.buffered).toBe("left");
    expect(snakeAim(turned, "right")).toBe(turned);
    const once = stepSnake(turned);
    expect(once.body[0]).toEqual({ x: 5, y: 4 });
    expect(once.pending).toBe("left");
    expect(stepSnake(once).body[0]).toEqual({ x: 4, y: 4 });
  });

  it("places the next bite on a random open cell", () => {
    const start = createSnake(() => 0);
    const eating = { ...start, food: { x: 6, y: 5 } };
    const low = stepSnake(eating, () => 0).food;
    const high = stepSnake(eating, () => 0.999).food;
    expect(low).not.toEqual(high);
    expect(placeFood(start.width, start.height, eating.body, () => 0)).toEqual(low);
    for (const spot of [low, high]) {
      expect(eating.body.some((point) => point.x === spot.x && point.y === spot.y)).toBe(false);
    }
  });

  it("dies on a wall and on its body", () => {
    const start = createSnake();
    const wall = stepSnake({
      ...start,
      body: [
        { x: start.width - 1, y: 1 },
        { x: start.width - 2, y: 1 },
        { x: start.width - 3, y: 1 },
      ],
      dir: "right",
      food: { x: 0, y: 0 },
    });
    expect(wall.dead).toBe(true);

    const bite = stepSnake({
      ...start,
      body: [
        { x: 2, y: 2 },
        { x: 3, y: 2 },
        { x: 3, y: 3 },
        { x: 2, y: 3 },
        { x: 1, y: 3 },
      ],
      dir: "down",
      food: { x: 0, y: 0 },
    });
    expect(bite.dead).toBe(true);
    expect(stepSnake(wall)).toBe(wall);
    expect(snakeAim(wall, "up")).toBe(wall);
    expect(snakeRender(wall)).toContain("game over. r restarts. esc leaves");
    expect(snakeRender(start)).toContain("@");
    expect(snakeRender(start)).toContain("*");
    expect(snakeRender(start)).toContain("level 1");
  });

  it("speeds up as the score rises", () => {
    expect(snakeLevel(0)).toBe(1);
    expect(snakeLevel(3)).toBe(2);
    expect(snakePace(1)).toBeGreaterThan(snakePace(2));
    expect(snakePace(2)).toBeGreaterThan(snakePace(8));
    expect(snakePace(40)).toBe(60);
  });
});

describe("tetris", () => {
  it("clears a full line and keeps the row below it", () => {
    const cleared = clearLines(
      [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0],
      4,
      4,
    );
    expect(cleared.n).toBe(1);
    expect(cleared.grid.slice(12)).toEqual([0, 1, 0, 0]);
  });

  it("locks a hard drop and rotates without leaving the board", () => {
    const start = createTetris({
      width: 6,
      height: 8,
      queue: ["O", "I", "T", "L", "J", "S", "Z"],
    });
    const dropped = tetrisHard(start);
    expect(dropped.over).toBe(false);
    expect(dropped.kind).toBe("I");
    expect(dropped.score).toBe(4);
    expect(dropped.grid.reduce((sum, cell) => sum + cell, 0)).toBe(4);
    expect(tetrisRender(dropped)).toContain("[]");

    const turned = tetrisRotate(start);
    expect(turned.rot).toBe(1);
    let shoved = start;
    for (let i = 0; i < 20; i += 1) shoved = tetrisLeft(shoved);
    expect(shoved.x).toBeGreaterThanOrEqual(-1);
    expect(tetrisRender(shoved)).toContain("[]");

    const nudged = tetrisDown(start);
    expect(nudged.y).toBe(start.y + 1);
    expect(tetrisTick(nudged).y).toBe(start.y + 2);

    const blocked = createTetris({
      width: 4,
      height: 4,
      queue: ["O", "I", "T", "L", "J", "S", "Z"],
      grid: Array.from({ length: 16 }, () => 1),
    });
    expect(blocked.over).toBe(true);
    expect(tetrisLeft(blocked)).toBe(blocked);
    expect(tetrisRender(blocked)).toContain("game over. r restarts. esc leaves");
    expect(tetrisLevel(0)).toBe(1);
    expect(tetrisLevel(2)).toBe(2);
    expect(tetrisPace(1)).toBeGreaterThan(tetrisPace(4));
    expect(tetrisPace(30)).toBe(80);
  });

  it("deals every piece once per bag, in a different order each game", () => {
    const kinds = ["I", "J", "L", "O", "S", "T", "Z"];
    expect([...pieceBag()].sort()).toEqual(kinds);
    const orders = new Set<string>();
    for (let i = 0; i < 12; i += 1) orders.add(createTetris().queue.slice(0, 7).join(""));
    expect(orders.size).toBeGreaterThan(1);
    expect(pieceBag(() => 0).join("")).not.toBe(pieceBag(() => 0.999).join(""));
    let state = createTetris();
    const seen: string[] = [state.kind];
    for (let i = 0; i < 6; i += 1) {
      state = tetrisHard({ ...state, grid: Array.from({ length: state.width * state.height }, () => 0), y: 0 });
      seen.push(state.kind);
    }
    expect(state.queue.length).toBeGreaterThanOrEqual(7);
  });

  it("holds a piece once per drop, swaps it back later, and shows it in a 4 by 4 box", () => {
    const start = createTetris({ width: 10, height: 16, queue: ["O", "I", "T", "L", "J", "S", "Z"] });
    expect(start.hold).toBeNull();
    expect(start.canHold).toBe(true);
    const held = tetrisHold(start);
    expect(held.hold).toBe("O");
    expect(held.kind).toBe("I");
    expect(held.canHold).toBe(false);
    expect(tetrisHold(held)).toBe(held);
    const dropped = tetrisHard(held);
    expect(dropped.canHold).toBe(true);
    const swapped = tetrisHold(dropped);
    expect(swapped.kind).toBe("O");
    expect(swapped.hold).toBe(dropped.kind);
    expect(swapped.y).toBe(0);
    for (const kind of ["I", "O", "T", "S", "Z", "J", "L"] as const) {
      const cells = tetrisPreview(kind);
      expect(cells).toHaveLength(4);
      expect(Math.min(...cells.map((cell) => cell.x))).toBe(0);
      expect(Math.min(...cells.map((cell) => cell.y))).toBe(0);
      expect(Math.max(...cells.map((cell) => Math.max(cell.x, cell.y)))).toBeLessThan(4);
    }
    expect(tetrisHold({ ...start, over: true }).hold).toBeNull();
  });
});
