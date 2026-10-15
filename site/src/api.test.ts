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

  it("stores a public note as text and lets the editor delete it", async () => {
    const store = new MemoryStore();
    const hash = await authHash();
    const auth = { user: "goben", hash };
    const foreign = await handleApi(
      new Request("https://pocketnugget.com/api/comments", {
        method: "POST",
        headers: { origin: "https://evil.example", "content-type": "application/json" },
        body: JSON.stringify({ name: "Ada", body: "hi" }),
      }),
      store,
      auth,
      NOW,
    );
    expect(foreign.status).toBe(403);

    const badType = await handleApi(
      new Request("https://pocketnugget.com/api/comments", {
        method: "POST",
        headers: { origin: "https://pocketnugget.com", "content-type": "text/plain" },
        body: "nope",
      }),
      store,
      auth,
      NOW,
    );
    expect(badType.status).toBe(415);

    const created = await handleApi(
      post("/api/comments", { name: "Ada", body: "Tom & Jerry said \"hi\"\nsecond line" }),
      store,
      auth,
      NOW,
    );
    expect(created.status).toBe(201);
    const saved = (await created.json()) as { note: { id: number; body: string; created: string } };
    expect(saved.note.body).toBe("Tom & Jerry said \"hi\"\nsecond line");
    expect(saved.note.body).not.toContain("<");
    expect(saved.note.created).toBe("2026-10-14T12:00:00.000Z");

    const listed = await handleApi(new Request("https://pocketnugget.com/api/comments"), store, auth, NOW);
    expect(listed.headers.get("cache-control")).toBe("no-store");
    const notes = (await listed.json()) as { notes: { body: string; name: string }[] };
    expect(notes.notes).toHaveLength(1);
    expect(notes.notes[0].name).toBe("Ada");
    expect(notes.notes[0].body).toContain("Tom & Jerry");

    const markup = await handleApi(
      post("/api/comments", { name: "Ada", body: "hello <script>alert(1)</script>" }),
      store,
      auth,
      NOW,
    );
    expect(markup.status).toBe(400);
    const wide = await handleApi(post("/api/comments", { name: "Ada", body: "hello \uFF1Cscript\uFF1E" }), store, auth, NOW);
    expect(wide.status).toBe(400);
    const hidden = await handleApi(post("/api/comments", { name: "Ada", body: "hello <\u200Bscript>" }), store, auth, NOW);
    expect(hidden.status).toBe(400);

    const tooLong = await handleApi(post("/api/comments", { name: "Ada", body: "x".repeat(601) }), store, auth, NOW);
    expect(tooLong.status).toBe(400);
    const tooManyLines = await handleApi(
      post("/api/comments", { name: "Ada", body: "a\nb\nc\nd\ne\nf\ng\nh\ni" }),
      store,
      auth,
      NOW,
    );
    expect(tooManyLines.status).toBe(400);
    const control = await handleApi(post("/api/comments", { name: "Ada", body: "hi\u0007" }), store, auth, NOW);
    expect(control.status).toBe(400);

    const trap = await handleApi(
      post("/api/comments", { name: "Bot", body: "spam", company: "acme" }),
      store,
      auth,
      NOW,
    );
    expect(trap.status).toBe(201);
    const afterTrap = await handleApi(new Request("https://pocketnugget.com/api/comments"), store, auth, NOW);
    const kept = (await afterTrap.json()) as { notes: unknown[] };
    expect(kept.notes).toHaveLength(1);

    for (let i = 0; i < 8; i++) {
      const extra = await handleApi(post("/api/comments", { name: "Ada", body: `note ${i}` }), store, auth, NOW + i + 1);
      expect(extra.status).toBe(201);
    }
    const limited = await handleApi(post("/api/comments", { name: "Ada", body: "one more" }), store, auth, NOW + 20);
    expect(limited.status).toBe(429);
    const full = await handleApi(new Request("https://pocketnugget.com/api/comments"), store, auth, NOW);
    const rows = (await full.json()) as { notes: { body: string }[] };
    expect(rows.notes.some((note) => note.body === "one more")).toBe(false);

    const token = "token-token-token-token";
    await store.putSession(await sha256Hex(token), NOW + 60_000);
    const denied = await handleApi(
      new Request("https://pocketnugget.com/api/comments/1", {
        method: "DELETE",
        headers: { origin: "https://pocketnugget.com" },
      }),
      store,
      auth,
      NOW,
    );
    expect(denied.status).toBe(401);
    const removed = await handleApi(
      new Request("https://pocketnugget.com/api/comments/1", {
        method: "DELETE",
        headers: { origin: "https://pocketnugget.com", cookie: `pkn_session=${token}` },
      }),
      store,
      auth,
      NOW,
    );
    expect(removed.status).toBe(204);
    const missing = await handleApi(
      new Request("https://pocketnugget.com/api/comments/1", {
        method: "DELETE",
        headers: { origin: "https://pocketnugget.com", cookie: `pkn_session=${token}` },
      }),
      store,
      auth,
      NOW,
    );
    expect(missing.status).toBe(404);
  });

  it("rejects markup in a post title and still escapes markup inside the body", async () => {
    const store = new MemoryStore();
    const hash = await authHash();
    const auth = { user: "goben", hash };
    const token = "token-token-token-token";
    await store.putSession(await sha256Hex(token), NOW + 60_000);
    const badTitle = await handleApi(
      post("/api/blog", { title: "hello <script>", content: "plain text", tags: "soc" }, `pkn_session=${token}`),
      store,
      auth,
      NOW,
    );
    expect(badTitle.status).toBe(400);
    const badTags = await handleApi(
      post("/api/blog", { title: "Shift note", content: "plain text", tags: "<script>" }, `pkn_session=${token}`),
      store,
      auth,
      NOW,
    );
    expect(badTags.status).toBe(400);
    const created = await handleApi(
      post("/api/blog", { title: "Shift note", content: "hello <script>alert(1)</script>", tags: "soc" }, `pkn_session=${token}`),
      store,
      auth,
      NOW,
    );
    expect(created.status).toBe(201);
    const { slug } = (await created.json()) as { slug: string };
    const pub = await handleApi(new Request(`https://pocketnugget.com/api/blog/${slug}`), store, auth, NOW);
    const body = (await pub.json()) as { content: string; title: string };
    expect(body.content).toContain("<script>");
    expect(renderNote(body.content)).not.toMatch(/<script/i);
  });

  it("serves the api as unavailable when there is no store", async () => {
    const response = await handle(new Request("https://pocketnugget.com/api/blog"), env());
    expect(response.status).toBe(503);
    const map = await handle(new Request("https://pocketnugget.com/sitemap.xml"), env());
    expect(map.status).toBe(200);
    expect(await map.text()).toContain("https://pocketnugget.com/links");
  });
});
