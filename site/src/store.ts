export interface Post {
  slug: string;
  title: string;
  content: string;
  tags: string;
  created: number;
  updated: number;
}

export interface AuthRow {
  passwordHash: string;
  totpCipher: string;
  totpReady: number;
  recovery: string[];
}

export interface Note {
  id: number;
  name: string;
  body: string;
  created: number;
}

export interface Message {
  id: number;
  name: string;
  email: string;
  body: string;
  created: number;
}

export interface ScoreRow {
  game: string;
  name: string;
  score: number;
  level: number;
  created: number;
}

export interface SavedScore extends ScoreRow {
  best: boolean;
}

export interface Store {
  ensure(): Promise<void>;
  listPosts(): Promise<Post[]>;
  getPost(slug: string): Promise<Post | null>;
  insertPost(post: Post): Promise<void>;
  updatePost(slug: string, fields: Pick<Post, "title" | "content" | "tags" | "updated">): Promise<boolean>;
  deletePost(slug: string): Promise<boolean>;
  countAttempts(since: number): Promise<number>;
  addAttempt(at: number): Promise<void>;
  clearAttempts(before: number): Promise<void>;
  putSession(tokenHash: string, expires: number): Promise<void>;
  getSession(tokenHash: string): Promise<number | null>;
  deleteSession(tokenHash: string): Promise<void>;
  getAuth(): Promise<AuthRow | null>;
  saveAuth(row: AuthRow): Promise<void>;
  setPasswordHash(hash: string): Promise<boolean>;
  markTotpReady(): Promise<void>;
  consumeRecovery(hash: string): Promise<boolean>;
  listNotes(limit: number): Promise<Note[]>;
  insertNote(note: Omit<Note, "id">): Promise<Note>;
  deleteNote(id: number): Promise<boolean>;
  countNotes(): Promise<number>;
  listMessages(limit: number): Promise<Message[]>;
  insertMessage(message: Omit<Message, "id">): Promise<Message>;
  deleteMessage(id: number): Promise<boolean>;
  countMessageAttempts(since: number): Promise<number>;
  addMessageAttempt(at: number): Promise<void>;
  clearMessageAttempts(before: number): Promise<void>;
  countNoteAttempts(since: number): Promise<number>;
  addNoteAttempt(at: number): Promise<void>;
  clearNoteAttempts(before: number): Promise<void>;
  listScores(game: string, limit: number): Promise<ScoreRow[]>;
  saveScore(row: ScoreRow): Promise<SavedScore>;
  countScoreAttempts(since: number): Promise<number>;
  addScoreAttempt(at: number): Promise<void>;
  clearScoreAttempts(before: number): Promise<void>;
}

interface D1Statement {
  bind(...values: unknown[]): D1Statement;
  all<T>(): Promise<{ results?: T[] }>;
  first<T>(): Promise<T | null>;
  run(): Promise<{ meta?: { last_row_id?: number } }>;
}

export interface D1Like {
  prepare(sql: string): D1Statement;
  exec(query: string): Promise<unknown>;
}

const SCHEMA = [
  "CREATE TABLE IF NOT EXISTS posts (slug TEXT PRIMARY KEY, title TEXT NOT NULL, content TEXT NOT NULL, tags TEXT NOT NULL DEFAULT '', created INTEGER NOT NULL, updated INTEGER NOT NULL)",
  "CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, expires INTEGER NOT NULL)",
  "CREATE TABLE IF NOT EXISTS login_attempts (id INTEGER PRIMARY KEY AUTOINCREMENT, at INTEGER NOT NULL)",
  "CREATE TABLE IF NOT EXISTS auth (id INTEGER PRIMARY KEY CHECK (id = 1), password_hash TEXT NOT NULL DEFAULT '', totp_cipher TEXT NOT NULL DEFAULT '', totp_ready INTEGER NOT NULL DEFAULT 0, recovery TEXT NOT NULL DEFAULT '[]')",
  "CREATE TABLE IF NOT EXISTS comments (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, body TEXT NOT NULL, created INTEGER NOT NULL)",
  "CREATE TABLE IF NOT EXISTS comment_attempts (id INTEGER PRIMARY KEY AUTOINCREMENT, at INTEGER NOT NULL)",
  "CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL, body TEXT NOT NULL, created INTEGER NOT NULL)",
  "CREATE TABLE IF NOT EXISTS message_attempts (id INTEGER PRIMARY KEY AUTOINCREMENT, at INTEGER NOT NULL)",
  "CREATE TABLE IF NOT EXISTS scores (game TEXT NOT NULL, name TEXT NOT NULL, score INTEGER NOT NULL, level INTEGER NOT NULL, created INTEGER NOT NULL, PRIMARY KEY (game, name))",
  "CREATE TABLE IF NOT EXISTS score_attempts (id INTEGER PRIMARY KEY AUTOINCREMENT, at INTEGER NOT NULL)",
];

export class D1Store implements Store {
  constructor(private readonly db: D1Like) {}

  async ensure(): Promise<void> {
    for (const sql of SCHEMA) await this.db.exec(sql);
  }

  async listPosts(): Promise<Post[]> {
    const rows = await this.db
      .prepare("SELECT slug, title, content, tags, created, updated FROM posts ORDER BY created DESC")
      .all<Post>();
    return rows.results ?? [];
  }

  async getPost(slug: string): Promise<Post | null> {
    return this.db
      .prepare("SELECT slug, title, content, tags, created, updated FROM posts WHERE slug = ?")
      .bind(slug)
      .first<Post>();
  }

  async insertPost(post: Post): Promise<void> {
    await this.db
      .prepare("INSERT INTO posts (slug, title, content, tags, created, updated) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(post.slug, post.title, post.content, post.tags, post.created, post.updated)
      .run();
  }

  async updatePost(slug: string, fields: Pick<Post, "title" | "content" | "tags" | "updated">): Promise<boolean> {
    const existing = await this.getPost(slug);
    if (!existing) return false;
    await this.db
      .prepare("UPDATE posts SET title = ?, content = ?, tags = ?, updated = ? WHERE slug = ?")
      .bind(fields.title, fields.content, fields.tags, fields.updated, slug)
      .run();
    return true;
  }

  async deletePost(slug: string): Promise<boolean> {
    const existing = await this.getPost(slug);
    if (!existing) return false;
    await this.db.prepare("DELETE FROM posts WHERE slug = ?").bind(slug).run();
    return true;
  }

  async countAttempts(since: number): Promise<number> {
    const row = await this.db
      .prepare("SELECT COUNT(*) AS n FROM login_attempts WHERE at >= ?")
      .bind(since)
      .first<{ n: number }>();
    return row?.n ?? 0;
  }

  async addAttempt(at: number): Promise<void> {
    await this.db.prepare("INSERT INTO login_attempts (at) VALUES (?)").bind(at).run();
  }

  async clearAttempts(before: number): Promise<void> {
    await this.db.prepare("DELETE FROM login_attempts WHERE at < ?").bind(before).run();
  }

  async putSession(tokenHash: string, expires: number): Promise<void> {
    await this.db
      .prepare("INSERT INTO sessions (token_hash, expires) VALUES (?, ?)")
      .bind(tokenHash, expires)
      .run();
  }

  async getSession(tokenHash: string): Promise<number | null> {
    const row = await this.db
      .prepare("SELECT expires FROM sessions WHERE token_hash = ?")
      .bind(tokenHash)
      .first<{ expires: number }>();
    return row?.expires ?? null;
  }

  async deleteSession(tokenHash: string): Promise<void> {
    await this.db.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(tokenHash).run();
  }

  async getAuth(): Promise<AuthRow | null> {
    const row = await this.db
      .prepare("SELECT password_hash, totp_cipher, totp_ready, recovery FROM auth WHERE id = 1")
      .first<{ password_hash: string; totp_cipher: string; totp_ready: number; recovery: string }>();
    if (!row) return null;
    return decodeAuth(row.password_hash, row.totp_cipher, row.totp_ready, row.recovery);
  }

  async saveAuth(row: AuthRow): Promise<void> {
    const recovery = JSON.stringify(row.recovery);
    await this.db
      .prepare(
        "INSERT INTO auth (id, password_hash, totp_cipher, totp_ready, recovery) VALUES (1, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET password_hash = excluded.password_hash, totp_cipher = excluded.totp_cipher, totp_ready = excluded.totp_ready, recovery = excluded.recovery",
      )
      .bind(row.passwordHash, row.totpCipher, row.totpReady, recovery)
      .run();
  }

  async setPasswordHash(hash: string): Promise<boolean> {
    const existing = await this.getAuth();
    if (!existing) return false;
    await this.db.prepare("UPDATE auth SET password_hash = ? WHERE id = 1").bind(hash).run();
    return true;
  }

  async markTotpReady(): Promise<void> {
    await this.db.prepare("UPDATE auth SET totp_ready = 1 WHERE id = 1").run();
  }

  async consumeRecovery(hash: string): Promise<boolean> {
    const row = await this.getAuth();
    if (!row || !row.recovery.includes(hash)) return false;
    row.recovery = row.recovery.filter((item) => item !== hash);
    await this.saveAuth(row);
    return true;
  }

  async listNotes(limit: number): Promise<Note[]> {
    const cap = Math.max(0, Math.min(80, limit));
    const rows = await this.db
      .prepare("SELECT id, name, body, created FROM comments ORDER BY created DESC, id DESC LIMIT ?")
      .bind(cap)
      .all<Note>();
    return rows.results ?? [];
  }

  async insertNote(note: Omit<Note, "id">): Promise<Note> {
    const result = await this.db
      .prepare("INSERT INTO comments (name, body, created) VALUES (?, ?, ?)")
      .bind(note.name, note.body, note.created)
      .run();
    const id = result.meta?.last_row_id;
    if (id && id > 0) return { id, ...note };
    const row = await this.db
      .prepare("SELECT id FROM comments WHERE created = ? ORDER BY id DESC LIMIT 1")
      .bind(note.created)
      .first<{ id: number }>();
    return { id: row?.id ?? 0, ...note };
  }

  async deleteNote(id: number): Promise<boolean> {
    const existing = await this.db.prepare("SELECT id FROM comments WHERE id = ?").bind(id).first<{ id: number }>();
    if (!existing) return false;
    await this.db.prepare("DELETE FROM comments WHERE id = ?").bind(id).run();
    return true;
  }

  async countNotes(): Promise<number> {
    const row = await this.db.prepare("SELECT COUNT(*) AS n FROM comments").first<{ n: number }>();
    return row?.n ?? 0;
  }

  async listMessages(limit: number): Promise<Message[]> {
    const cap = Math.max(0, Math.min(200, limit));
    const rows = await this.db
      .prepare("SELECT id, name, email, body, created FROM messages ORDER BY created DESC, id DESC LIMIT ?")
      .bind(cap)
      .all<Message>();
    return rows.results ?? [];
  }

  async insertMessage(message: Omit<Message, "id">): Promise<Message> {
    const result = await this.db
      .prepare("INSERT INTO messages (name, email, body, created) VALUES (?, ?, ?, ?)")
      .bind(message.name, message.email, message.body, message.created)
      .run();
    const id = result.meta?.last_row_id;
    if (id && id > 0) return { id, ...message };
    const row = await this.db
      .prepare("SELECT id FROM messages WHERE created = ? ORDER BY id DESC LIMIT 1")
      .bind(message.created)
      .first<{ id: number }>();
    return { id: row?.id ?? 0, ...message };
  }

  async deleteMessage(id: number): Promise<boolean> {
    const existing = await this.db.prepare("SELECT id FROM messages WHERE id = ?").bind(id).first<{ id: number }>();
    if (!existing) return false;
    await this.db.prepare("DELETE FROM messages WHERE id = ?").bind(id).run();
    return true;
  }

  async countMessageAttempts(since: number): Promise<number> {
    const row = await this.db
      .prepare("SELECT COUNT(*) AS n FROM message_attempts WHERE at >= ?")
      .bind(since)
      .first<{ n: number }>();
    return row?.n ?? 0;
  }

  async addMessageAttempt(at: number): Promise<void> {
    await this.db.prepare("INSERT INTO message_attempts (at) VALUES (?)").bind(at).run();
  }

  async clearMessageAttempts(before: number): Promise<void> {
    await this.db.prepare("DELETE FROM message_attempts WHERE at < ?").bind(before).run();
  }

  async countNoteAttempts(since: number): Promise<number> {
    const row = await this.db
      .prepare("SELECT COUNT(*) AS n FROM comment_attempts WHERE at >= ?")
      .bind(since)
      .first<{ n: number }>();
    return row?.n ?? 0;
  }

  async addNoteAttempt(at: number): Promise<void> {
    await this.db.prepare("INSERT INTO comment_attempts (at) VALUES (?)").bind(at).run();
  }

  async clearNoteAttempts(before: number): Promise<void> {
    await this.db.prepare("DELETE FROM comment_attempts WHERE at < ?").bind(before).run();
  }

  async listScores(game: string, limit: number): Promise<ScoreRow[]> {
    const cap = Math.max(0, Math.min(8, limit));
    const rows = await this.db
      .prepare(
        "SELECT game, name, score, level, created FROM scores WHERE game = ? ORDER BY score DESC, created ASC LIMIT ?",
      )
      .bind(game, cap)
      .all<ScoreRow>();
    return rows.results ?? [];
  }

  async saveScore(row: ScoreRow): Promise<SavedScore> {
    const existing = await this.db
      .prepare("SELECT game, name, score, level, created FROM scores WHERE game = ? AND name = ?")
      .bind(row.game, row.name)
      .first<ScoreRow>();
    if (existing && existing.score >= row.score) return { ...existing, best: false };
    if (!existing) {
      const countRow = await this.db
        .prepare("SELECT COUNT(*) AS n FROM scores WHERE game = ?")
        .bind(row.game)
        .first<{ n: number }>();
      if ((countRow?.n ?? 0) >= 80) {
        const low = await this.db
          .prepare("SELECT name, score FROM scores WHERE game = ? ORDER BY score ASC, created DESC LIMIT 1")
          .bind(row.game)
          .first<{ name: string; score: number }>();
        if (!low || row.score <= low.score) return { ...row, best: false };
        await this.db.prepare("DELETE FROM scores WHERE game = ? AND name = ?").bind(row.game, low.name).run();
      }
    }
    await this.db
      .prepare(
        "INSERT INTO scores (game, name, score, level, created) VALUES (?, ?, ?, ?, ?) ON CONFLICT(game, name) DO UPDATE SET score = excluded.score, level = excluded.level, created = excluded.created",
      )
      .bind(row.game, row.name, row.score, row.level, row.created)
      .run();
    return { ...row, best: true };
  }

  async countScoreAttempts(since: number): Promise<number> {
    const row = await this.db
      .prepare("SELECT COUNT(*) AS n FROM score_attempts WHERE at >= ?")
      .bind(since)
      .first<{ n: number }>();
    return row?.n ?? 0;
  }

  async addScoreAttempt(at: number): Promise<void> {
    await this.db.prepare("INSERT INTO score_attempts (at) VALUES (?)").bind(at).run();
  }

  async clearScoreAttempts(before: number): Promise<void> {
    await this.db.prepare("DELETE FROM score_attempts WHERE at < ?").bind(before).run();
  }
}

function decodeAuth(passwordHash: string, totpCipher: string, totpReady: number, recovery: string): AuthRow {
  let codes: string[] = [];
  try {
    const parsed = JSON.parse(recovery) as unknown;
    if (Array.isArray(parsed)) codes = parsed.filter((item): item is string => typeof item === "string");
  } catch {
    codes = [];
  }
  return { passwordHash, totpCipher, totpReady, recovery: codes };
}

export class MemoryStore implements Store {
  posts: Post[] = [];
  sessions = new Map<string, number>();
  attempts: number[] = [];
  auth: AuthRow | null = null;
  notes: Note[] = [];
  noteAttempts: number[] = [];
  messages: Message[] = [];
  messageAttempts: number[] = [];
  scores: ScoreRow[] = [];
  scoreAttempts: number[] = [];
  private noteSeq = 1;
  private messageSeq = 1;

  async ensure(): Promise<void> {}

  async listPosts(): Promise<Post[]> {
    return [...this.posts].sort((a, b) => b.created - a.created);
  }

  async getPost(slug: string): Promise<Post | null> {
    return this.posts.find((post) => post.slug === slug) ?? null;
  }

  async insertPost(post: Post): Promise<void> {
    this.posts.push(post);
  }

  async updatePost(slug: string, fields: Pick<Post, "title" | "content" | "tags" | "updated">): Promise<boolean> {
    const post = await this.getPost(slug);
    if (!post) return false;
    post.title = fields.title;
    post.content = fields.content;
    post.tags = fields.tags;
    post.updated = fields.updated;
    return true;
  }

  async deletePost(slug: string): Promise<boolean> {
    const before = this.posts.length;
    this.posts = this.posts.filter((post) => post.slug !== slug);
    return this.posts.length !== before;
  }

  async countAttempts(since: number): Promise<number> {
    return this.attempts.filter((at) => at >= since).length;
  }

  async addAttempt(at: number): Promise<void> {
    this.attempts.push(at);
  }

  async clearAttempts(before: number): Promise<void> {
    this.attempts = this.attempts.filter((at) => at >= before);
  }

  async putSession(tokenHash: string, expires: number): Promise<void> {
    this.sessions.set(tokenHash, expires);
  }

  async getSession(tokenHash: string): Promise<number | null> {
    return this.sessions.get(tokenHash) ?? null;
  }

  async deleteSession(tokenHash: string): Promise<void> {
    this.sessions.delete(tokenHash);
  }

  async getAuth(): Promise<AuthRow | null> {
    if (!this.auth) return null;
    return { ...this.auth, recovery: [...this.auth.recovery] };
  }

  async saveAuth(row: AuthRow): Promise<void> {
    this.auth = { ...row, recovery: [...row.recovery] };
  }

  async setPasswordHash(hash: string): Promise<boolean> {
    if (!this.auth) return false;
    this.auth.passwordHash = hash;
    return true;
  }

  async markTotpReady(): Promise<void> {
    if (this.auth) this.auth.totpReady = 1;
  }

  async consumeRecovery(hash: string): Promise<boolean> {
    if (!this.auth || !this.auth.recovery.includes(hash)) return false;
    this.auth.recovery = this.auth.recovery.filter((item) => item !== hash);
    return true;
  }

  async listNotes(limit: number): Promise<Note[]> {
    const cap = Math.max(0, Math.min(80, limit));
    return [...this.notes].sort((a, b) => b.created - a.created || b.id - a.id).slice(0, cap);
  }

  async insertNote(note: Omit<Note, "id">): Promise<Note> {
    const saved = { ...note, id: this.noteSeq };
    this.noteSeq += 1;
    this.notes.push(saved);
    return saved;
  }

  async deleteNote(id: number): Promise<boolean> {
    const before = this.notes.length;
    this.notes = this.notes.filter((note) => note.id !== id);
    return this.notes.length !== before;
  }

  async countNotes(): Promise<number> {
    return this.notes.length;
  }

  async listMessages(limit: number): Promise<Message[]> {
    const cap = Math.max(0, Math.min(200, limit));
    return [...this.messages].sort((a, b) => b.created - a.created || b.id - a.id).slice(0, cap);
  }

  async insertMessage(message: Omit<Message, "id">): Promise<Message> {
    const saved = { ...message, id: this.messageSeq };
    this.messageSeq += 1;
    this.messages.push(saved);
    return saved;
  }

  async deleteMessage(id: number): Promise<boolean> {
    const before = this.messages.length;
    this.messages = this.messages.filter((message) => message.id !== id);
    return this.messages.length !== before;
  }

  async countMessageAttempts(since: number): Promise<number> {
    return this.messageAttempts.filter((at) => at >= since).length;
  }

  async addMessageAttempt(at: number): Promise<void> {
    this.messageAttempts.push(at);
  }

  async clearMessageAttempts(before: number): Promise<void> {
    this.messageAttempts = this.messageAttempts.filter((at) => at >= before);
  }

  async countNoteAttempts(since: number): Promise<number> {
    return this.noteAttempts.filter((at) => at >= since).length;
  }

  async addNoteAttempt(at: number): Promise<void> {
    this.noteAttempts.push(at);
  }

  async clearNoteAttempts(before: number): Promise<void> {
    this.noteAttempts = this.noteAttempts.filter((at) => at >= before);
  }

  async listScores(game: string, limit: number): Promise<ScoreRow[]> {
    const cap = Math.max(0, Math.min(8, limit));
    return this.scores
      .filter((row) => row.game === game)
      .sort((a, b) => b.score - a.score || a.created - b.created)
      .slice(0, cap)
      .map((row) => ({ ...row }));
  }

  async saveScore(row: ScoreRow): Promise<SavedScore> {
    const existing = this.scores.find((item) => item.game === row.game && item.name === row.name);
    if (existing && existing.score >= row.score) return { ...existing, best: false };
    if (!existing) {
      const mine = this.scores.filter((item) => item.game === row.game);
      if (mine.length >= 80) {
        const low = [...mine].sort((a, b) => a.score - b.score || b.created - a.created)[0];
        if (!low || row.score <= low.score) return { ...row, best: false };
        this.scores = this.scores.filter((item) => item !== low);
      }
    }
    this.scores = this.scores.filter((item) => !(item.game === row.game && item.name === row.name));
    const saved = { ...row };
    this.scores.push(saved);
    return { ...saved, best: true };
  }

  async countScoreAttempts(since: number): Promise<number> {
    return this.scoreAttempts.filter((at) => at >= since).length;
  }

  async addScoreAttempt(at: number): Promise<void> {
    this.scoreAttempts.push(at);
  }

  async clearScoreAttempts(before: number): Promise<void> {
    this.scoreAttempts = this.scoreAttempts.filter((at) => at >= before);
  }
}
