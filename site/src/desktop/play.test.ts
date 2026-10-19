// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";
import { placeFood } from "./games";
import { mountSweep } from "./sweep";
import { Terminal } from "./term";

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});

function stubScores(): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
    if (init?.method === "POST") {
      return new Response(JSON.stringify({ best: true, name: "Ada", score: 1, level: 1 }), {
        status: 201,
        headers: { "content-type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ scores: [{ name: "Ada", score: 9, level: 2 }] }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  });
  vi.stubGlobal("fetch", fetchMock);
  window.fetch = fetchMock as typeof window.fetch;
  return fetchMock;
}

async function flush(): Promise<void> {
  for (let i = 0; i < 6; i += 1) await Promise.resolve();
}

function rollForFood(x: number, y: number): number {
  const body = [
    { x: 5, y: 5 },
    { x: 4, y: 5 },
    { x: 3, y: 5 },
  ];
  const open = 20 * 12 - body.length;
  for (let index = 0; index < open; index += 1) {
    const roll = (index + 0.5) / open;
    const food = placeFood(20, 12, body, () => roll);
    if (food.x === x && food.y === y) return roll;
  }
  throw new Error("food roll missing");
}

describe("game windows", () => {
  it("restarts snake and saves a name after the run", async () => {
    vi.useFakeTimers();
    const rolls = [rollForFood(8, 5), 0.01];
    let rollAt = 0;
    vi.spyOn(Math, "random").mockImplementation(() => rolls[Math.min(rollAt++, rolls.length - 1)] ?? 0.01);
    const fetchMock = stubScores();
    document.body.innerHTML = `<div class="term-mount"></div>`;
    const host = document.querySelector(".term-mount");
    if (!(host instanceof HTMLElement)) throw new Error("host");
    const term = new Terminal(host, { openPath() {}, close() {} }, "snake");
    await flush();
    expect(host.querySelector("[data-role='again']")).toBeInstanceOf(HTMLButtonElement);
    expect(host.querySelector(".play-status")?.textContent).toContain("Level 1");
    expect(host.querySelector(".play-status")?.textContent).toContain("r restarts");
    expect(host.textContent).toContain("Ada");
    const form = host.querySelector(".top-form");
    if (!(form instanceof HTMLFormElement)) throw new Error("form");
    expect(form.hidden).toBe(true);
    term.onKey("Start", false);
    for (let i = 0; i < 3; i += 1) vi.advanceTimersByTime(200);
    term.onKey("ArrowUp", false);
    for (let i = 0; i < 10; i += 1) vi.advanceTimersByTime(200);
    expect(host.querySelector(".play-status")?.textContent).toContain("game over");
    expect(form.hidden).toBe(false);
    const input = form.querySelector("input");
    if (!(input instanceof HTMLInputElement)) throw new Error("input");
    input.value = "Ada";
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    await flush();
    const posted = fetchMock.mock.calls.find((call) => call[1]?.method === "POST");
    expect(JSON.parse(String(posted?.[1]?.body))).toMatchObject({ game: "snake", name: "Ada", score: 1 });
    term.onKey("r", false);
    expect(host.querySelector(".play-status")?.textContent).toContain("Score 0");
    expect(form.hidden).toBe(true);
    term.destroy();
  });

  it("keeps a turn when the arrow key repeats", () => {
    vi.useFakeTimers();
    stubScores();
    vi.spyOn(Math, "random").mockReturnValue(0);
    document.body.innerHTML = `<div class="term-mount"></div>`;
    const host = document.querySelector(".term-mount");
    if (!(host instanceof HTMLElement)) throw new Error("host");
    const term = new Terminal(host, { openPath() {}, close() {} }, "snake");
    term.onKey("Start", false);
    term.onKey("ArrowUp", false);
    term.onKey("ArrowRight", true);
    vi.advanceTimersByTime(200);
    const cells = [...host.querySelectorAll(".play-cell")];
    expect(cells.findIndex((cell) => cell.classList.contains("head"))).toBe(4 * 20 + 5);
    term.destroy();
  });

  it("starts tron with a bike and an again button", () => {
    vi.useFakeTimers();
    stubScores();
    document.body.innerHTML = `<div class="term-mount"></div>`;
    const host = document.querySelector(".term-mount");
    if (!(host instanceof HTMLElement)) throw new Error("host");
    const term = new Terminal(host, { openPath() {}, close() {} }, "tron");
    expect(host.classList.contains("is-cycle")).toBe(true);
    expect(host.querySelector("canvas.play-canvas")).toBeInstanceOf(HTMLCanvasElement);
    term.onKey("Enter", false);
    vi.advanceTimersByTime(200);
    expect(host.querySelector(".play-status")?.textContent).toContain("Score 1");
    term.onKey("Again", false);
    expect(host.querySelector(".play-status")?.textContent).toContain("Score 0");
    term.onKey("ArrowUp", false);
    vi.advanceTimersByTime(200);
    expect(host.querySelector(".play-status")?.textContent).not.toContain("game over");
    term.destroy();
  });

  it("shows sweep level one and starts over from again", () => {
    stubScores();
    const host = document.createElement("div");
    document.body.append(host);
    const app = mountSweep(host);
    const status = host.querySelector(".meta");
    expect(status?.textContent).toContain("Level 1");
    expect(status?.textContent).toContain("Score 0");
    const again = host.querySelector("[data-role='again']");
    expect(again?.textContent).toBe("Again");
    again?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(host.querySelector(".meta")?.textContent).toContain("Level 1");
    app.destroy();
  });
});

function mountGame(mode: "snake" | "tetris" | "tron"): { host: HTMLElement; term: Terminal } {
  document.body.innerHTML = `<div class="term-mount"></div>`;
  const host = document.querySelector(".term-mount");
  if (!(host instanceof HTMLElement)) throw new Error("host");
  return { host, term: new Terminal(host, { openPath() {}, close() {} }, mode) };
}

describe("game flow", () => {
  it("waits on a Start box instead of running before the player is ready", () => {
    vi.useFakeTimers();
    stubScores();
    vi.spyOn(Math, "random").mockReturnValue(0);
    const { host, term } = mountGame("snake");
    const over = host.querySelector<HTMLElement>(".play-over");
    expect(over?.hidden).toBe(false);
    expect(over?.dataset.state).toBe("ready");
    expect(over?.querySelector(".play-over-title")?.textContent).toBe("Snake");
    expect(over?.querySelector(".play-over-go")?.textContent).toBe("Play");
    expect(over?.querySelector(".play-over-text")?.textContent).toContain("WASD");
    const head = () => [...host.querySelectorAll(".play-cell")].findIndex((cell) => cell.classList.contains("head"));
    const before = head();
    vi.advanceTimersByTime(2000);
    expect(head()).toBe(before);
    over?.querySelector<HTMLButtonElement>(".play-over-go")?.click();
    expect(over?.hidden).toBe(true);
    vi.advanceTimersByTime(200);
    expect(head()).toBe(before + 1);
    expect(host.querySelector(".play-live")?.textContent).toContain("Snake");
    term.destroy();
  });

  it("pauses with P or the button, shows Resume, and resumes with Enter", () => {
    vi.useFakeTimers();
    stubScores();
    vi.spyOn(Math, "random").mockReturnValue(0);
    const { host, term } = mountGame("snake");
    term.onKey("Start", false);
    const pause = host.querySelector<HTMLButtonElement>(".pad-act button[data-key='p']");
    term.onKey("p", false);
    const over = host.querySelector<HTMLElement>(".play-over");
    expect(over?.dataset.state).toBe("paused");
    expect(over?.querySelector(".play-over-go")?.textContent).toBe("Resume");
    expect(pause?.textContent).toBe("Resume");
    expect(pause?.getAttribute("aria-pressed")).toBe("true");
    expect(host.querySelector(".play-live")?.textContent).toBe("Paused");
    term.onKey("Enter", false);
    expect(over?.hidden).toBe(true);
    expect(pause?.textContent).toBe("Pause");
    expect(pause?.getAttribute("aria-pressed")).toBe("false");
    term.destroy();
  });

  it("ends on a Game over box whose Play again starts a fresh run at once", () => {
    vi.useFakeTimers();
    stubScores();
    vi.spyOn(Math, "random").mockReturnValue(0);
    const { host, term } = mountGame("snake");
    term.onKey("Start", false);
    term.onKey("w", false);
    for (let i = 0; i < 12; i += 1) vi.advanceTimersByTime(200);
    const over = host.querySelector<HTMLElement>(".play-over");
    expect(over?.dataset.state).toBe("over");
    expect(over?.querySelector(".play-over-title")?.textContent).toBe("Game over");
    expect(over?.querySelector(".play-over-go")?.textContent).toBe("Play again");
    expect(host.querySelector(".play-live")?.textContent).toContain("Game over");
    over?.querySelector<HTMLButtonElement>(".play-over-go")?.click();
    expect(over?.hidden).toBe(true);
    expect(host.querySelector(".play-status")?.textContent).toContain("Score 0");
    expect(host.querySelector(".play-status")?.textContent).not.toContain("game over");
    term.destroy();
  });

  it("steers with WASD the same as the arrows", () => {
    vi.useFakeTimers();
    stubScores();
    vi.spyOn(Math, "random").mockReturnValue(0);
    const { host, term } = mountGame("snake");
    term.onKey("Start", false);
    expect(term.onKey("W", false)).toBe(true);
    vi.advanceTimersByTime(200);
    const cells = [...host.querySelectorAll(".play-cell")];
    expect(cells.findIndex((cell) => cell.classList.contains("head"))).toBe(4 * 20 + 5);
    term.destroy();
  });

  it("pauses itself when the tab is hidden", () => {
    vi.useFakeTimers();
    stubScores();
    const { host, term } = mountGame("tron");
    term.onKey("Start", false);
    Object.defineProperty(document, "hidden", { value: true, configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
    expect(host.querySelector<HTMLElement>(".play-over")?.dataset.state).toBe("paused");
    Object.defineProperty(document, "hidden", { value: false, configurable: true });
    term.destroy();
  });

  it("draws the Tetris landing ghost and names the next piece", () => {
    vi.useFakeTimers();
    stubScores();
    const { host, term } = mountGame("tetris");
    term.onKey(" ", false);
    expect(host.querySelector<HTMLElement>(".play-over")?.hidden).toBe(true);
    expect(host.querySelectorAll(".play-cell.ghost").length).toBe(4);
    expect(host.querySelector(".play-status")?.textContent).toMatch(/Next [IOTSZJL]/);
    term.destroy();
  });

  it("leaves the game from the box's Exit button", () => {
    vi.useFakeTimers();
    stubScores();
    const { host, term } = mountGame("tetris");
    host.querySelector<HTMLButtonElement>(".play-over-exit")?.click();
    expect(host.classList.contains("playing")).toBe(false);
    expect(host.querySelector<HTMLElement>(".play-over")?.hidden).toBe(true);
    term.destroy();
  });
});

describe("sweep window", () => {
  it("keeps the same cell buttons while the clock ticks, so focus stays put", () => {
    vi.useFakeTimers();
    stubScores();
    const host = document.createElement("div");
    document.body.append(host);
    const app = mountSweep(host);
    const first = host.querySelector<HTMLButtonElement>(".sweep-cell");
    first?.click();
    first?.focus();
    vi.advanceTimersByTime(3000);
    expect(host.querySelector(".sweep-cell")).toBe(first);
    expect(document.activeElement).toBe(first);
    expect(host.querySelector(".sweep-readout:nth-child(2)")?.textContent).not.toBe("000");
    app.destroy();
  });

  it("moves with the arrows, flags with F, and keeps one cell in the tab order", () => {
    stubScores();
    const host = document.createElement("div");
    document.body.append(host);
    const app = mountSweep(host);
    const grid = host.querySelector<HTMLElement>(".sweep-grid");
    expect(grid?.getAttribute("role")).toBe("group");
    const tabbable = () => [...host.querySelectorAll<HTMLButtonElement>(".sweep-cell")].filter((cell) => cell.tabIndex === 0);
    expect(tabbable()).toHaveLength(1);
    grid?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    grid?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    expect(tabbable()[0]?.dataset.index).toBe("10");
    grid?.dispatchEvent(new KeyboardEvent("keydown", { key: "f", bubbles: true }));
    const cell = host.querySelector<HTMLButtonElement>('.sweep-cell[data-index="10"]');
    expect(cell?.classList.contains("flag")).toBe(true);
    expect(cell?.getAttribute("aria-label")).toBe("Row 2, column 2: flagged");
    expect(host.querySelector(".sweep-readout")?.textContent).toBe("009");
    app.destroy();
  });

  it("flags with a right click", () => {
    stubScores();
    const host = document.createElement("div");
    document.body.append(host);
    const app = mountSweep(host);
    const cell = host.querySelector<HTMLButtonElement>('.sweep-cell[data-index="3"]');
    cell?.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true }));
    expect(host.querySelector('.sweep-cell[data-index="3"]')?.classList.contains("flag")).toBe(true);
    app.destroy();
  });
});
