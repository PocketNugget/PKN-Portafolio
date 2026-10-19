import { describe, expect, it } from "vitest";
import { handleApi, readCookie, slugify } from "./api";
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

  it("gives the list a plain excerpt of a post", async () => {
    const store = new MemoryStore();
    const auth = { user: "goben", hash: await authHash() };
    await store.insertPost({ slug: "plain", title: "Plain", content: "# Head\n\nSome **words** here.", tags: "", created: NOW, updated: NOW });
    const list = await handleApi(new Request("https://pocketnugget.com/api/blog"), store, auth, NOW);
    const posts = (await list.json()) as { posts: { slug: string; excerpt: string }[] };
    expect(posts.posts.find((item) => item.slug === "plain")?.excerpt).toBe("Some words here.");
  });

  it("slugifies titles and keeps a poisoned row from becoming html", async () => {
    expect(slugify("Señor!!!")).toBe("senor");
    expect(slugify("!!!")).toBe("post");
    expect(slugify("a".repeat(80))).toHaveLength(60);
    expect(readCookie("a=1; pkn_session=token-token-token-token; b=2", "pkn_session")).toBe(
      "token-token-token-token",
    );
    expect(readCookie(null, "pkn_session")).toBeNull();

    const store = new MemoryStore();
    const hash = await authHash();
    const auth = { user: "goben", hash };
    const token = "token-token-token-token";
    await store.putSession(await sha256Hex(token), NOW + 60_000);
    const cookie = `pkn_session=${token}`;
    const created = await handleApi(
      post("/api/blog", { title: "Señor!!!", content: "plain", tags: "" }, cookie),
      store,
      auth,
      NOW,
    );
    expect(created.status).toBe(201);
    expect(((await created.json()) as { slug: string }).slug).toBe("senor");
    const again = await handleApi(
      post("/api/blog", { title: "Señor!!!", content: "plain", tags: "" }, cookie),
      store,
      auth,
      NOW,
    );
    expect(((await again.json()) as { slug: string }).slug).toBe("senor-2");

    await store.insertPost({
      slug: "marked",
      title: "<script>",
      content: "x".repeat(40_001),
      tags: "<b>",
      created: NOW,
      updated: NOW,
    });
    await store.insertNote({ name: "<script>", body: "hi", created: NOW });
    const list = await handleApi(new Request("https://pocketnugget.com/api/blog"), store, auth, NOW);
    const posts = (await list.json()) as { posts: { slug: string; title: string; tags: string }[] };
    const marked = posts.posts.find((item) => item.slug === "marked");
    expect(marked).toEqual({ slug: "marked", title: "post", tags: "", created: "2026-10-14T12:00:00.000Z", excerpt: "" });
    const one = await handleApi(new Request("https://pocketnugget.com/api/blog/marked"), store, auth, NOW);
    expect(((await one.json()) as { content: string }).content).toBe("This post failed the HTML check.");
    const notes = await handleApi(new Request("https://pocketnugget.com/api/comments"), store, auth, NOW);
    const bodies = (await notes.json()) as { notes: { name: string }[] };
    expect(bodies.notes.some((note) => note.name.includes("<"))).toBe(false);

    const badJson = await handleApi(
      new Request("https://pocketnugget.com/api/comments", {
        method: "POST",
        headers: { origin: "https://pocketnugget.com", "content-type": "application/json" },
        body: "{",
      }),
      store,
      auth,
      NOW,
    );
    expect(badJson.status).toBe(400);
    const huge = await handleApi(
      new Request("https://pocketnugget.com/api/comments", {
        method: "POST",
        headers: { origin: "https://pocketnugget.com", "content-type": "application/json" },
        body: "x".repeat(100_001),
      }),
      store,
      auth,
      NOW,
    );
    expect(huge.status).toBe(413);
    expect(await store.countNoteAttempts(0)).toBe(0);

    const missing = await handleApi(
      new Request("https://pocketnugget.com/api/blog/missing", {
        method: "PUT",
        headers: {
          origin: "https://pocketnugget.com",
          "content-type": "application/json",
          cookie,
        },
        body: JSON.stringify({ title: "Hello", content: "text", tags: "" }),
      }),
      store,
      auth,
      NOW,
    );
    expect(missing.status).toBe(404);
    const removed = await handleApi(
      new Request("https://pocketnugget.com/api/blog/missing", {
        method: "DELETE",
        headers: { origin: "https://pocketnugget.com", cookie },
      }),
      store,
      auth,
      NOW,
    );
    expect(removed.status).toBe(404);
    expect(
      (
        await handleApi(
          new Request("https://pocketnugget.com/api/nope", { method: "DELETE" }),
          store,
          auth,
          NOW,
        )
      ).status,
    ).toBe(405);
    const odd = await handleApi(
      new Request("https://pocketnugget.com/api/comments/9999999999999999999", {
        method: "DELETE",
        headers: { origin: "https://pocketnugget.com", cookie },
      }),
      store,
      auth,
      NOW,
    );
    expect(odd.status).toBe(404);
  });

  it("expires a session, logs out, and changes the password", async () => {
    const store = await readyStore();
    const hash = await authHash();
    const auth = { user: "goben", hash, totpKey: TOTP_KEY };
    const token = "token-token-token-token";
    await store.putSession(await sha256Hex(token), NOW - 1);
    const stale = await handleApi(
      new Request("https://pocketnugget.com/api/session", {
        headers: { cookie: `pkn_session=${token}` },
      }),
      store,
      auth,
      NOW,
    );
    expect(stale.status).toBe(401);
    expect(await store.getSession(await sha256Hex(token))).toBeNull();

    await store.putSession(await sha256Hex(token), NOW + 60_000);
    const cookie = `pkn_session=${token}`;
    const short = await handleApi(
      post("/api/password", { current: PASSWORD, password: "short-password" }, cookie),
      store,
      auth,
      NOW,
    );
    expect(short.status).toBe(400);
    const wrong = await handleApi(
      post("/api/password", { current: "not-the-password", password: "a-new-password-ok" }, cookie),
      store,
      auth,
      NOW,
    );
    expect(wrong.status).toBe(401);
    const changed = await handleApi(
      post("/api/password", { current: PASSWORD, password: "a-new-password-ok" }, cookie),
      store,
      auth,
      NOW,
    );
    expect(changed.status).toBe(204);
    const row = await store.getAuth();
    expect(row?.passwordHash.startsWith("sha256$")).toBe(true);

    const bye = await handleApi(
      new Request("https://pocketnugget.com/api/logout", {
        method: "POST",
        headers: { origin: "https://pocketnugget.com", cookie },
      }),
      store,
      auth,
      NOW,
    );
    expect(bye.status).toBe(204);
    expect(bye.headers.get("set-cookie")).toContain("Max-Age=0");
    expect(await store.getSession(await sha256Hex(token))).toBeNull();
    const who = await handleApi(
      new Request("https://pocketnugget.com/api/session", { headers: { cookie } }),
      store,
      auth,
      NOW,
    );
    expect(who.status).toBe(401);
  });
});

describe("contact messages", () => {
  const post = (store: MemoryStore, body: unknown, at = NOW) =>
    handleApi(
      new Request("https://pocketnugget.com/api/contact", {
        method: "POST",
        headers: { origin: "https://pocketnugget.com", "content-type": "application/json" },
        body: JSON.stringify(body),
      }),
      store,
      { user: "goben", hash: "" },
      at,
    );

  it("saves a message, drops the trap, rejects bad input, and limits the rate", async () => {
    const store = new MemoryStore();
    const good = { name: "Ada", email: "ada@example.com", body: "Hello there", company: "" };
    expect((await post(store, good)).status).toBe(201);
    expect(store.messages).toHaveLength(1);
    expect((await post(store, { ...good, company: "spam" })).status).toBe(201);
    expect(store.messages).toHaveLength(1);
    expect((await post(store, { ...good, email: "nope" })).status).toBe(400);
    expect((await post(store, { ...good, body: "<b>x</b>" })).status).toBe(400);
    for (let i = 0; i < 4; i += 1) await post(store, good);
    expect((await post(store, good)).status).toBe(429);
  });

  it("lists and deletes only for a signed-in user", async () => {
    const store = new MemoryStore();
    await store.insertMessage({ name: "Ada", email: "ada@example.com", body: "Hi", created: NOW });
    const list = await handleApi(
      new Request("https://pocketnugget.com/api/contact"),
      store,
      { user: "goben", hash: "" },
      NOW,
    );
    expect(list.status).toBe(401);
    const del = await handleApi(
      new Request("https://pocketnugget.com/api/contact/1", {
        method: "DELETE",
        headers: { origin: "https://pocketnugget.com" },
      }),
      store,
      { user: "goben", hash: "" },
      NOW,
    );
    expect(del.status).toBe(401);
    expect(store.messages).toHaveLength(1);
  });

  it("counts the comments on the public list", async () => {
    const store = new MemoryStore();
    await store.insertNote({ name: "Ada", body: "Nice", created: NOW });
    const res = await handleApi(new Request("https://pocketnugget.com/api/comments"), store, { user: "", hash: "" }, NOW);
    expect(((await res.json()) as { count: number }).count).toBe(1);
  });
});
