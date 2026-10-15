import { describe, expect, it } from "vitest";
import { handleApi } from "./api";
import { sha256Hex } from "./password";
import { renderNote } from "./notes";
import { MemoryStore } from "./store";
import { sealSecret, totpAt } from "./totp";
import { handle, type Env } from "./worker";

const PASSWORD = "correct horse battery";
const NOW = Date.parse("2026-10-14T12:00:00.000Z");
const SECRET = new TextEncoder().encode("12345678901234567890");
const TOTP_KEY = btoa(String.fromCharCode(...new Uint8Array(32).fill(4)));

async function authHash(): Promise<string> {
  return `sha256$${await sha256Hex(PASSWORD)}`;
}

function env(hash = "", totpKey = ""): Env {
  return {
    ASSETS: {
      async fetch() {
        return new Response("ok", { status: 200 });
      },
    },
    ADMIN_USER: "goben",
    ADMIN_PASSWORD_HASH: hash,
    ADMIN_TOTP_KEY: totpKey,
  };
}

async function readyStore(ready = 1, recovery: string[] = []): Promise<MemoryStore> {
  const store = new MemoryStore();
  const hashes: string[] = [];
  for (const code of recovery) hashes.push(await sha256Hex(code));
  await store.saveAuth({
    passwordHash: "",
    totpCipher: await sealSecret(TOTP_KEY, SECRET),
    totpReady: ready,
    recovery: hashes,
  });
  return store;
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
    const store = await readyStore();
    const hash = await authHash();
    const bad = await handle(post("/api/auth", { username: "goben", password: "nope-nope-nope" }), env(hash, TOTP_KEY), undefined, store);
    expect(bad.status).toBe(401);
    expect(await bad.text()).toBe("no\n");
    expect(bad.headers.get("set-cookie")).toBeNull();

    const code = await totpAt(SECRET, Math.floor(Date.now() / 1000));
    const ok = await handle(
      post("/api/auth", { username: "goben", password: PASSWORD, code }),
      env(hash, TOTP_KEY),
      undefined,
      store,
    );
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
      env(hash, TOTP_KEY),
      undefined,
      store,
    );
    expect(denied.status).toBe(401);

    const created = await handle(
      post("/api/blog", { title: "Shift note", content: "hello <script>alert(1)</script>", tags: "soc" }, `pkn_session=${token}`),
      env(hash, TOTP_KEY),
      undefined,
      store,
    );
    expect(created.status).toBe(201);
    const { slug } = (await created.json()) as { slug: string };
    const pub = await handle(new Request(`https://pocketnugget.com/api/blog/${slug}`), env(hash, TOTP_KEY), undefined, store);
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

  it("enrolls with a one-time URI, then accepts a code and a recovery code once", async () => {
    const store = await readyStore(0, ["ABCD-EFGH"]);
    const hash = await authHash();
    const auth = { user: "goben", hash, totpKey: TOTP_KEY };
    const first = await handleApi(post("/api/auth", { username: "goben", password: PASSWORD }), store, auth, NOW);
    expect(first.status).toBe(200);
    expect(first.headers.get("set-cookie")).toBeNull();
    const body = (await first.json()) as { step: string; otpauth?: string };
    expect(body.step).toBe("enroll");
    expect(body.otpauth).toContain("otpauth://totp/");
    const code = await totpAt(SECRET, Math.floor(NOW / 1000));
    const session = await handleApi(post("/api/auth", { username: "goben", password: PASSWORD, code }), store, auth, NOW);
    expect(session.status).toBe(204);
    const again = await handleApi(post("/api/auth", { username: "goben", password: PASSWORD }), store, auth, NOW);
    const next = (await again.json()) as { step: string; otpauth?: string };
    expect(next.step).toBe("code");
    expect(next.otpauth).toBeUndefined();
    const recovered = await handleApi(
      post("/api/auth", { username: "goben", password: PASSWORD, code: "abcd-efgh" }),
      store,
      auth,
      NOW,
    );
    expect(recovered.status).toBe(204);
    const spent = await handleApi(
      post("/api/auth", { username: "goben", password: PASSWORD, code: "ABCD-EFGH" }),
      store,
      auth,
      NOW,
    );
    expect(spent.status).toBe(401);
  });

  it("locks after repeated bad codes", async () => {
    const store = await readyStore();
    const hash = await authHash();
    const auth = { user: "goben", hash, totpKey: TOTP_KEY };
    for (let i = 0; i < 8; i++) {
      const response = await handleApi(
        post("/api/auth", { username: "goben", password: PASSWORD, code: "000000" }),
        store,
        auth,
        NOW,
      );
      expect(response.status).toBe(401);
    }
    const locked = await handleApi(post("/api/auth", { username: "goben", password: PASSWORD, code: "000000" }), store, auth, NOW);
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
