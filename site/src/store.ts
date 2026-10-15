export interface Post {
  slug: string;
  title: string;
  content: string;
  tags: string;
  created: number;
  updated: number;
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
}

interface D1Statement {
  bind(...values: unknown[]): D1Statement;
  all<T>(): Promise<{ results?: T[] }>;
  first<T>(): Promise<T | null>;
  run(): Promise<unknown>;
}

export interface D1Like {
  prepare(sql: string): D1Statement;
  exec(query: string): Promise<unknown>;
}

const SCHEMA = [
  "CREATE TABLE IF NOT EXISTS posts (slug TEXT PRIMARY KEY, title TEXT NOT NULL, content TEXT NOT NULL, tags TEXT NOT NULL DEFAULT '', created INTEGER NOT NULL, updated INTEGER NOT NULL)",
  "CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, expires INTEGER NOT NULL)",
  "CREATE TABLE IF NOT EXISTS login_attempts (id INTEGER PRIMARY KEY AUTOINCREMENT, at INTEGER NOT NULL)",
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
}

export class MemoryStore implements Store {
  posts: Post[] = [];
  sessions = new Map<string, number>();
  attempts: number[] = [];

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
}
