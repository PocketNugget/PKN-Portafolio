// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";
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

describe("game windows", () => {
  it("restarts snake and saves a name after the run", async () => {
    vi.useFakeTimers();
    const fetchMock = stubScores();
    document.body.innerHTML = `<div class="term-mount"></div>`;
    const host = document.querySelector(".term-mount");
    if (!(host instanceof HTMLElement)) throw new Error("host");
    const term = new Terminal(host, { openPath() {}, close() {} }, "snake");
    await flush();
    expect(host.querySelector("[data-role='again']")).toBeInstanceOf(HTMLButtonElement);
    expect(host.querySelector(".play-status")?.textContent).toContain("Level 1");
    expect(host.textContent).toContain("Ada");
    const form = host.querySelector(".top-form");
    if (!(form instanceof HTMLFormElement)) throw new Error("form");
    expect(form.hidden).toBe(true);
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
    term.onKey("Again", false);
    expect(host.querySelector(".play-status")?.textContent).toContain("Score 0");
    expect(form.hidden).toBe(true);
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
    expect(host.querySelector(".play-cell.you")).toBeTruthy();
    expect(host.querySelector(".play-cell.foe")).toBeTruthy();
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
