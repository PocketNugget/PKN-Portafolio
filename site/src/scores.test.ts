import { describe, expect, it } from "vitest";
import sql from "../migrations/0004_scores.sql?raw";
import { handleApi } from "./api";
import { parseScoreName } from "./scores";
import { MemoryStore } from "./store";

const NOW = Date.parse("2026-10-16T12:00:00.000Z");
const auth = { user: "", hash: "" };

function call(method: string, path: string, body?: unknown, origin = "https://pocketnugget.xyz"): Request {
  const headers = new Headers();
  if (origin) headers.set("origin", origin);
  if (body !== undefined) headers.set("content-type", "application/json");
  return new Request(`https://pocketnugget.xyz${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

describe("scores", () => {
  it("rejects a name that is not plain text", () => {
    expect(parseScoreName("<script>")).toBeNull();
    expect(parseScoreName("Ada")).toBe("Ada");
    expect(parseScoreName("a".repeat(17))).toBeNull();
  });

  it("keeps the better score and lists the top", async () => {
    const store = new MemoryStore();
    const foreign = await handleApi(
      call("POST", "/api/scores", { game: "snake", name: "Ada", score: 4, level: 2 }, "https://evil.example"),
      store,
      auth,
      NOW,
    );
    expect(foreign.status).toBe(403);
    const tagged = await handleApi(
      call("POST", "/api/scores", { game: "snake", name: "<b>Ada</b>", score: 4, level: 2 }),
      store,
      auth,
      NOW,
    );
    expect(tagged.status).toBe(400);
    const huge = await handleApi(
      call("POST", "/api/scores", { game: "snake", name: "Ada", score: 9000, level: 2 }),
      store,
      auth,
      NOW,
    );
    expect(huge.status).toBe(400);
    const saved = await handleApi(
      call("POST", "/api/scores", { game: "tron", name: "Ada", score: 40, level: 3 }),
      store,
      auth,
      NOW,
    );
    expect(saved.status).toBe(201);
    const lower = await handleApi(
      call("POST", "/api/scores", { game: "tron", name: "Ada", score: 10, level: 1 }),
      store,
      auth,
      NOW,
    );
    expect(lower.status).toBe(200);
    expect(await lower.json()).toMatchObject({ best: false, score: 40 });
    await handleApi(call("POST", "/api/scores", { game: "tron", name: "Bea", score: 80, level: 4 }), store, auth, NOW);
    const list = await handleApi(call("GET", "/api/scores?game=tron", undefined, ""), store, auth, NOW);
    expect(list.status).toBe(200);
    const body = (await list.json()) as { scores: { name: string; score: number }[] };
    expect(body.scores.map((row) => row.name)).toEqual(["Bea", "Ada"]);
    expect(JSON.stringify(body)).not.toContain("<");
    const missing = await handleApi(call("GET", "/api/scores?game=nope", undefined, ""), store, auth, NOW);
    expect(missing.status).toBe(400);
  });

  it("locks saves after the limit", async () => {
    const store = new MemoryStore();
    for (let i = 0; i < 10; i += 1) {
      const res = await handleApi(
        call("POST", "/api/scores", { game: "sweep", name: "Ada", score: i + 1, level: 1 }),
        store,
        auth,
        NOW + i,
      );
      expect(res.status).toBe(201);
    }
    const locked = await handleApi(
      call("POST", "/api/scores", { game: "sweep", name: "Ada", score: 30, level: 2 }),
      store,
      auth,
      NOW + 20,
    );
    expect(locked.status).toBe(429);
  });

  it("does not keep a visitor address in the score table", () => {
    const text = sql.toLowerCase();
    expect(text).toContain("primary key (game, name)");
    expect(text).not.toContain("address");
    expect(text).not.toContain("ip ");
  });
});
