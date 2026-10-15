import { describe, expect, it } from "vitest";
import {
  clearLines,
  createSnake,
  createTetris,
  snakeAim,
  snakeRender,
  stepSnake,
  tetrisHard,
  tetrisLeft,
  tetrisRender,
  tetrisRotate,
} from "./games";

describe("snake", () => {
  it("moves, eats, and refuses a reversal", () => {
    const start = createSnake();
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
    expect(snakeAim(start, "up").pending).toBe("up");
    expect(stepSnake(snakeAim(start, "up")).body[0]).toEqual({ x: 5, y: 4 });
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
    expect(snakeRender(start)).toContain("@");
    expect(snakeRender(start)).toContain("*");
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
    expect(dropped.grid.reduce((sum, cell) => sum + cell, 0)).toBe(4);
    expect(tetrisRender(dropped)).toContain("[]");

    const turned = tetrisRotate(start);
    expect(turned.rot).toBe(1);
    let shoved = start;
    for (let i = 0; i < 20; i += 1) shoved = tetrisLeft(shoved);
    expect(shoved.x).toBeGreaterThanOrEqual(-1);
    expect(tetrisRender(shoved)).toContain("[]");
  });
});
