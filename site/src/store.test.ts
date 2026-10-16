import { describe, expect, it } from "vitest";
import { D1Store, MemoryStore, type D1Like } from "./store";

const NASTY = "Robert'); DROP TABLE comments;--";

interface PostRow {
  slug: string;
  title: string;
  content: string;
  tags: string;
  created: number;
  updated: number;
}

interface NoteRow {
  id: number;
  name: string;
  body: string;
  created: number;
}

interface AuthSql {
  password_hash: string;
  totp_cipher: string;
  totp_ready: number;
  recovery: string;
}

class FakeDb {
  posts: PostRow[] = [];
  sessions = new Map<string, number>();
  attempts: number[] = [];
  notes: NoteRow[] = [];
  noteAttempts: number[] = [];
  auth: AuthSql | null = null;
  execs: string[] = [];
  calls: { sql: string; binds: unknown[] }[] = [];
  forceZeroId = false;
  private noteId = 1;

  async exec(query: string): Promise<void> {
    this.execs.push(query);
  }

  prepare(sql: string) {
    let binds: unknown[] = [];
    const run = async () => {
      this.calls.push({ sql, binds: [...binds] });
      return this.execute(sql, binds);
    };
    const stmt = {
      bind(...values: unknown[]) {
        binds = values;
        return stmt;
      },
      all: async () => ({ results: this.read(sql, binds) }),
      first: async () => this.read(sql, binds)[0] ?? null,
      run,
    };
    return stmt;
  }

  private read(sql: string, binds: unknown[]): any[] {
    this.calls.push({ sql, binds: [...binds] });
    if (sql.startsWith("SELECT slug, title")) {
      if (sql.includes("WHERE slug = ?")) {
        return this.posts.filter((post) => post.slug === binds[0]);
      }
      return [...this.posts].sort((a, b) => b.created - a.created);
    }
    if (sql.startsWith("SELECT COUNT(*) AS n FROM login_attempts")) {
      const since = Number(binds[0]);
      return [{ n: this.attempts.filter((at) => at >= since).length }];
    }
    if (sql.startsWith("SELECT COUNT(*) AS n FROM comment_attempts")) {
      const since = Number(binds[0]);
      return [{ n: this.noteAttempts.filter((at) => at >= since).length }];
    }
    if (sql.startsWith("SELECT expires FROM sessions")) {
      const expires = this.sessions.get(String(binds[0]));
      return expires === undefined ? [] : [{ expires }];
    }
    if (sql.startsWith("SELECT password_hash")) {
      return this.auth ? [this.auth] : [];
    }
    if (sql.startsWith("SELECT id, name, body, created FROM comments")) {
      const cap = Number(binds[0]);
      return [...this.notes]
        .sort((a, b) => b.created - a.created || b.id - a.id)
        .slice(0, cap);
    }
    if (sql.startsWith("SELECT id FROM comments WHERE created = ?")) {
      const found = this.notes.filter((note) => note.created === binds[0]).sort((a, b) => b.id - a.id);
      return found[0] ? [{ id: found[0].id }] : [];
    }
    if (sql.startsWith("SELECT id FROM comments WHERE id = ?")) {
      const found = this.notes.find((note) => note.id === binds[0]);
      return found ? [{ id: found.id }] : [];
    }
    throw new Error(`unread sql: ${sql}`);
  }

  private execute(sql: string, binds: unknown[]): { meta?: { last_row_id?: number } } {
    if (sql.startsWith("INSERT INTO posts")) {
      this.posts.push({
        slug: String(binds[0]),
        title: String(binds[1]),
        content: String(binds[2]),
        tags: String(binds[3]),
        created: Number(binds[4]),
        updated: Number(binds[5]),
      });
      return {};
    }
    if (sql.startsWith("UPDATE posts")) {
      const post = this.posts.find((item) => item.slug === binds[4]);
      if (post) {
        post.title = String(binds[0]);
        post.content = String(binds[1]);
        post.tags = String(binds[2]);
        post.updated = Number(binds[3]);
      }
      return {};
    }
    if (sql.startsWith("DELETE FROM posts")) {
      this.posts = this.posts.filter((post) => post.slug !== binds[0]);
      return {};
    }
    if (sql.startsWith("INSERT INTO login_attempts")) {
      this.attempts.push(Number(binds[0]));
      return {};
    }
    if (sql.startsWith("DELETE FROM login_attempts")) {
      const before = Number(binds[0]);
      this.attempts = this.attempts.filter((at) => at >= before);
      return {};
    }
    if (sql.startsWith("INSERT INTO sessions")) {
      this.sessions.set(String(binds[0]), Number(binds[1]));
      return {};
    }
    if (sql.startsWith("DELETE FROM sessions")) {
      this.sessions.delete(String(binds[0]));
      return {};
    }
    if (sql.startsWith("INSERT INTO auth")) {
      this.auth = {
        password_hash: String(binds[0]),
        totp_cipher: String(binds[1]),
        totp_ready: Number(binds[2]),
        recovery: String(binds[3]),
      };
      return {};
    }
    if (sql.startsWith("UPDATE auth SET password_hash")) {
      if (this.auth) this.auth.password_hash = String(binds[0]);
      return {};
    }
    if (sql.startsWith("UPDATE auth SET totp_ready")) {
      if (this.auth) this.auth.totp_ready = 1;
      return {};
    }
    if (sql.startsWith("INSERT INTO comments")) {
      const id = this.noteId;
      this.noteId += 1;
      this.notes.push({
        id,
        name: String(binds[0]),
        body: String(binds[1]),
        created: Number(binds[2]),
      });
      return { meta: { last_row_id: this.forceZeroId ? 0 : id } };
    }
    if (sql.startsWith("DELETE FROM comments")) {
      this.notes = this.notes.filter((note) => note.id !== binds[0]);
      return {};
    }
    if (sql.startsWith("INSERT INTO comment_attempts")) {
      this.noteAttempts.push(Number(binds[0]));
      return {};
    }
    if (sql.startsWith("DELETE FROM comment_attempts")) {
      const before = Number(binds[0]);
      this.noteAttempts = this.noteAttempts.filter((at) => at >= before);
      return {};
    }
    throw new Error(`unrun sql: ${sql}`);
  }
}

describe("memory store", () => {
  it("orders posts and notes and drops old attempts", async () => {
    const store = new MemoryStore();
    await store.insertPost({ slug: "old", title: "Old", content: "a", tags: "", created: 1, updated: 1 });
    await store.insertPost({ slug: "new", title: "New", content: "b", tags: "", created: 2, updated: 2 });
    expect((await store.listPosts()).map((post) => post.slug)).toEqual(["new", "old"]);
    expect(await store.updatePost("missing", { title: "x", content: "y", tags: "", updated: 3 })).toBe(false);
    expect(await store.deletePost("missing")).toBe(false);
    expect(await store.updatePost("old", { title: "Older", content: "c", tags: "soc", updated: 4 })).toBe(true);
    expect((await store.getPost("old"))?.title).toBe("Older");
    expect(await store.deletePost("old")).toBe(true);

    await store.addAttempt(10);
    await store.addAttempt(20);
    expect(await store.countAttempts(15)).toBe(1);
    await store.clearAttempts(20);
    expect(await store.countAttempts(0)).toBe(1);

    await store.insertNote({ name: "Ada", body: "first", created: 1 });
    await store.insertNote({ name: "Bea", body: "second", created: 1 });
    const notes = await store.listNotes(1);
    expect(notes.map((note) => note.name)).toEqual(["Bea"]);
    expect(await store.listNotes(0)).toEqual([]);
    expect((await store.listNotes(500)).length).toBe(2);
    expect(await store.deleteNote(99)).toBe(false);
    expect(await store.deleteNote(notes[0].id)).toBe(true);
  });

  it("copies auth rows and spends a recovery code once", async () => {
    const store = new MemoryStore();
    expect(await store.setPasswordHash("sha256$" + "ab".repeat(32))).toBe(false);
    await store.saveAuth({
      passwordHash: "sha256$" + "cd".repeat(32),
      totpCipher: "cipher",
      totpReady: 0,
      recovery: ["one", "two"],
    });
    const row = await store.getAuth();
    row?.recovery.push("three");
    expect((await store.getAuth())?.recovery).toEqual(["one", "two"]);
    expect(await store.consumeRecovery("one")).toBe(true);
    expect(await store.consumeRecovery("one")).toBe(false);
    await store.markTotpReady();
    expect((await store.getAuth())?.totpReady).toBe(1);
    await store.putSession("hash", 50);
    expect(await store.getSession("hash")).toBe(50);
    await store.deleteSession("hash");
    expect(await store.getSession("hash")).toBeNull();
  });
});

describe("d1 store", () => {
  it("keeps visitor text in bound values", async () => {
    const db = new FakeDb();
    const store = new D1Store(db as unknown as D1Like);
    await store.ensure();
    expect(db.execs).toHaveLength(8);
    expect(db.execs).toContain(
      "CREATE TABLE IF NOT EXISTS comments (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, body TEXT NOT NULL, created INTEGER NOT NULL)",
    );
    expect(db.execs.join("\n").toLowerCase()).toContain("create table if not exists scores");
    expect(db.execs.join("\n").toLowerCase()).not.toContain("address");

    await store.insertPost({
      slug: "shift-note",
      title: NASTY,
      content: NASTY,
      tags: NASTY,
      created: 1,
      updated: 1,
    });
    const saved = await store.insertNote({ name: NASTY, body: NASTY, created: 4 });
    expect(saved).toEqual({ id: 1, name: NASTY, body: NASTY, created: 4 });
    expect((await store.listNotes(500))[0]?.body).toBe(NASTY);
    expect(db.calls.at(-1)?.binds).toEqual([80]);
    expect(db.calls.some((call) => call.sql.includes(NASTY) || call.sql.includes("DROP TABLE"))).toBe(false);
    expect(db.calls.some((call) => call.binds.includes(NASTY))).toBe(true);

    await store.listNotes(-4);
    expect(db.calls.at(-1)?.binds).toEqual([0]);
    db.forceZeroId = true;
    const fallback = await store.insertNote({ name: "Ada", body: "hi", created: 9 });
    expect(fallback.id).toBe(2);

    await store.saveAuth({
      passwordHash: "sha256$" + "ab".repeat(32),
      totpCipher: "cipher",
      totpReady: 0,
      recovery: ["one"],
    });
    expect(await store.consumeRecovery("one")).toBe(true);
    expect((await store.getAuth())?.recovery).toEqual([]);
    if (db.auth) db.auth.recovery = "[1,\"ok\",null]";
    expect((await store.getAuth())?.recovery).toEqual(["ok"]);
    if (db.auth) db.auth.recovery = "nope";
    expect((await store.getAuth())?.recovery).toEqual([]);
  });
});
