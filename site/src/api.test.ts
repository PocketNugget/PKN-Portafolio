import { describe, expect, it } from "vitest";
import { handleApi } from "./api";
import { sha256Hex } from "./password";
import { renderNote } from "./notes";
import { MemoryStore } from "./store";
import { handle, type Env } from "./worker";

const PASSWORD = "correct horse battery";
const NOW = Date.parse("2026-10-14T12:00:00.000Z");

async function authHash(): Promise<string> {
  return `sha256$${await sha256Hex(PASSWORD)}`;
}

function env(hash = ""): Env {
  return {
    ASSETS: {
      async fetch() {
        return new Response("ok", { status: 200 });
      },
    },
    ADMIN_USER: "goben",
    ADMIN_PASSWORD_HASH: hash,
  };
}

function post(path: string, body: unknown, cookie = ""): Request {
  const headers = new Headers({
    origin: "https://pocketnugget.com",
    "content-type": "application/json",
  });
  if (cookie) headers.set("cookie", cookie);
  return new Request(`https://pocketnugget.com${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

describe("blog api", () => {
  it("refuses a login that is not configured and a cross-site post", async () => {
    const store = new MemoryStore();
    const missing = await handle(post("/api/auth", { username: "goben", password: PASSWORD }), env(), undefined, store);
    expect(missing.status).toBe(503);
    const foreign = await handle(
      new Request("https://pocketnugget.com/api/auth", {
        method: "POST",
        headers: { origin: "https://evil.example", "content-type": "application/json" },
        body: JSON.stringify({ username: "goben", password: PASSWORD }),
      }),
      env(await authHash()),
      undefined,
      store,
    );
    expect(foreign.status).toBe(403);
  });

  it("sets an HttpOnly cookie and does not return the token", async () => {
    const store = new MemoryStore();
    const hash = await authHash();
    const bad = await handle(post("/api/auth", { username: "goben", password: "nope-nope-nope" }), env(hash), undefined, store);
    expect(bad.status).toBe(401);
    expect(await bad.text()).toBe("no\n");
    expect(bad.headers.get("set-cookie")).toBeNull();

    const ok = await handle(post("/api/auth", { username: "goben", password: PASSWORD }), env(hash), undefined, store);
    expect(ok.status).toBe(204);
    expect(await ok.text()).toBe("");
    const cookie = ok.headers.get("set-cookie") ?? "";
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Strict");
    expect(cookie).toContain("Secure");
    expect(cookie).not.toContain(PASSWORD);
    const token = /pkn_session=([^;]+)/.exec(cookie)?.[1] ?? "";
    expect(token.length).toBeGreaterThan(20);

    const denied = await handle(
      post("/api/blog", { title: "Shift note", content: "hello <script>alert(1)</script>", tags: "soc" }),
      env(hash),
      undefined,
      store,
    );
    expect(denied.status).toBe(401);

    const created = await handle(
      post("/api/blog", { title: "Shift note", content: "hello <script>alert(1)</script>", tags: "soc" }, `pkn_session=${token}`),
      env(hash),
      undefined,
      store,
    );
    expect(created.status).toBe(201);
    const { slug } = (await created.json()) as { slug: string };
    const pub = await handle(new Request(`https://pocketnugget.com/api/blog/${slug}`), env(hash), undefined, store);
    expect(pub.headers.get("content-type")).toContain("application/json");
    const body = (await pub.json()) as { content: string; title: string };
    expect(body.content).toContain("<script>");
    expect(renderNote(body.content)).not.toMatch(/<script/i);
    expect(pub.headers.get("cache-control")).toBe("no-store");
  });

  it("locks the login after repeated failures", async () => {
    const store = new MemoryStore();
    const hash = await authHash();
    const auth = { user: "goben", hash };
    for (let i = 0; i < 8; i++) {
      const response = await handleApi(post("/api/auth", { username: "goben", password: "wrong-password-1" }), store, auth, NOW);
      expect(response.status).toBe(401);
    }
    const locked = await handleApi(post("/api/auth", { username: "goben", password: PASSWORD }), store, auth, NOW + 1000);
    expect(locked.status).toBe(429);
  });

  it("serves the api as unavailable when there is no store", async () => {
    const response = await handle(new Request("https://pocketnugget.com/api/blog"), env());
    expect(response.status).toBe(503);
    const map = await handle(new Request("https://pocketnugget.com/sitemap.xml"), env());
    expect(map.status).toBe(200);
    expect(await map.text()).toContain("https://pocketnugget.com/links");
  });
});
