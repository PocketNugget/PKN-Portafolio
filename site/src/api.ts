import { excerptOf } from "./blog";
import { renderNote } from "./markup";
import { randomToken, safeEqual, sha256Hex, verifyPassword } from "./password";
import { cleanBlock, cleanLine, cleanTags, NOTE_BODY_MAX, NOTE_LINES, NOTE_NAME_MAX, scrubInvisible } from "./plain";
import { parseGame, parseLevel, parseScore, parseScoreName, SCORE_LIMIT, TOP_N } from "./scores";
import type { Message, Note, Store } from "./store";
import { openSecret, otpauthUri, totpMatches } from "./totp";

const COOKIE = "pkn_session";
const WINDOW_MS = 15 * 60 * 1000;
const LOCK_AFTER = 8;
const NOTE_LIMIT = 10;
const MESSAGE_LIMIT = 5;
const MESSAGE_BODY_MAX = 1500;
const MESSAGE_LINES = 20;
const EMAIL_MAX = 120;
const SESSION_MS = 12 * 60 * 60 * 1000;
const MAX_BODY = 100_000;

export interface AuthConfig {
  user: string;
  hash: string;
  totpKey?: string;
}

function text(status: number, body: string, extra?: Headers): Response {
  const headers = extra ?? new Headers();
  headers.set("content-type", "text/plain; charset=utf-8");
  headers.set("cache-control", "no-store");
  return new Response(status === 204 ? null : body, { status, headers });
}

function json(status: number, value: unknown, extra?: Headers): Response {
  const headers = extra ?? new Headers();
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("cache-control", "no-store");
  return Response.json(value, { status, headers });
}

function cookieHeader(request: Request): string | null {
  return request.headers.get("cookie");
}

export function readCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    if (trimmed.slice(0, eq) === name) return trimmed.slice(eq + 1);
  }
  return null;
}

function sessionCookie(token: string, request: Request, maxAge: number): string {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${COOKIE}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${secure}`;
}

function originOk(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  return origin === new URL(request.url).origin;
}

function configured(auth: AuthConfig): boolean {
  return auth.user.length > 0 && /^sha256\$[0-9a-f]{64}$/.test(auth.hash);
}

async function readJson(request: Request): Promise<unknown | Response> {
  if (!(request.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) {
    return text(415, "content-type must be application/json\n");
  }
  const raw = await request.text();
  if (raw.length > MAX_BODY) return text(413, "too large\n");
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return text(400, "bad json\n");
  }
}

function noteName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return cleanLine(value, NOTE_NAME_MAX);
}

function noteBody(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return cleanBlock(value, NOTE_BODY_MAX, NOTE_LINES);
}

function markdown(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const cleaned = scrubInvisible(value).trim();
  if (!cleaned || cleaned.length > 40_000) return null;
  try {
    renderNote(cleaned);
  } catch {
    return null;
  }
  return cleaned;
}

function publicMarkdown(value: string): string {
  return markdown(value) ?? "This post failed the HTML check.";
}

function publicNote(note: Note) {
  const name = cleanLine(note.name, NOTE_NAME_MAX);
  const body = cleanBlock(note.body, NOTE_BODY_MAX, NOTE_LINES);
  if (!name || !body || !Number.isSafeInteger(note.id) || note.id < 1) return null;
  return {
    id: note.id,
    name,
    body,
    created: new Date(note.created).toISOString(),
  };
}

function messageEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const mail = cleanLine(value, EMAIL_MAX);
  if (!mail || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail)) return null;
  return mail;
}

function publicMessage(message: Message) {
  const name = cleanLine(message.name, NOTE_NAME_MAX);
  const email = cleanLine(message.email, EMAIL_MAX);
  const body = cleanBlock(message.body, MESSAGE_BODY_MAX, MESSAGE_LINES);
  if (!name || !email || !body || !Number.isSafeInteger(message.id) || message.id < 1) return null;
  return { id: message.id, name, email, body, created: new Date(message.created).toISOString() };
}

async function createMessage(request: Request, store: Store, now: number): Promise<Response> {
  if (!originOk(request)) return text(403, "bad origin\n");
  const body = await readJson(request);
  if (body instanceof Response) return body;
  const record = body as { name?: unknown; email?: unknown; body?: unknown; company?: unknown };
  const trap = typeof record.company === "string" && record.company.trim().length > 0;
  await store.clearMessageAttempts(now - WINDOW_MS);
  const full = (await store.countMessageAttempts(now - WINDOW_MS)) >= MESSAGE_LIMIT;
  if (trap) {
    if (!full) await store.addMessageAttempt(now);
    return json(201, { ok: true });
  }
  const name = noteName(record.name);
  const email = messageEmail(record.email);
  const written = typeof record.body === "string" ? cleanBlock(record.body, MESSAGE_BODY_MAX, MESSAGE_LINES) : null;
  if (!name || !email || !written) return text(400, "name, email and message are required\n");
  if (full) return text(429, "too many messages\n");
  await store.insertMessage({ name, email, body: written, created: now });
  await store.addMessageAttempt(now);
  return json(201, { ok: true });
}

async function saveScore(request: Request, store: Store, now: number): Promise<Response> {
  if (!originOk(request)) return text(403, "bad origin\n");
  const body = await readJson(request);
  if (body instanceof Response) return body;
  const record = body as { game?: unknown; name?: unknown; score?: unknown; level?: unknown };
  const game = parseGame(record.game);
  const name = parseScoreName(record.name);
  const level = parseLevel(record.level);
  const score = game ? parseScore(game, record.score) : null;
  if (!game || !name || level === null || score === null) return text(400, "bad score\n");
  await store.clearScoreAttempts(now - WINDOW_MS);
  if ((await store.countScoreAttempts(now - WINDOW_MS)) >= SCORE_LIMIT) return text(429, "too many scores\n");
  await store.addScoreAttempt(now);
  const saved = await store.saveScore({ game, name, score, level, created: now });
  return json(saved.best ? 201 : 200, {
    best: saved.best,
    name: saved.name,
    score: saved.score,
    level: saved.level,
  });
}

async function createNote(request: Request, store: Store, now: number): Promise<Response> {
  if (!originOk(request)) return text(403, "bad origin\n");
  const body = await readJson(request);
  if (body instanceof Response) return body;
  const record = body as { name?: unknown; body?: unknown; company?: unknown };
  const trap = typeof record.company === "string" && record.company.trim().length > 0;
  await store.clearNoteAttempts(now - WINDOW_MS);
  const full = (await store.countNoteAttempts(now - WINDOW_MS)) >= NOTE_LIMIT;
  if (trap) {
    if (!full) await store.addNoteAttempt(now);
    return json(201, { note: { id: 0, name: "ok", body: "", created: new Date(now).toISOString() } });
  }
  const name = noteName(record.name);
  const written = noteBody(record.body);
  if (!name || !written) return text(400, "name and note are required\n");
  if (full) return text(429, "too many notes\n");
  const saved = await store.insertNote({ name, body: written, created: now });
  await store.addNoteAttempt(now);
  return json(201, { note: publicNote(saved) });
}

export function slugify(title: string): string {
  const slug = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return slug || "post";
}

async function sessionUser(request: Request, store: Store, auth: AuthConfig, now: number): Promise<boolean> {
  const token = readCookie(cookieHeader(request), COOKIE);
  if (!token || token.length < 20 || token.length > 80) return false;
  const tokenHash = await sha256Hex(token);
  const expires = await store.getSession(tokenHash);
  if (!expires || expires < now) {
    if (expires) await store.deleteSession(tokenHash);
    return false;
  }
  return configured(auth);
}

async function requireUser(request: Request, store: Store, auth: AuthConfig, now: number): Promise<Response | null> {
  if (!originOk(request)) return text(403, "bad origin\n");
  if (!(await sessionUser(request, store, auth, now))) return text(401, "no\n");
  return null;
}

function hashOk(value: string): boolean {
  return /^sha256\$[0-9a-f]{64}$/.test(value);
}

async function activeHash(store: Store, auth: AuthConfig): Promise<string> {
  const row = await store.getAuth();
  if (row && hashOk(row.passwordHash)) return row.passwordHash;
  return auth.hash;
}

async function issueSession(request: Request, store: Store, now: number): Promise<Response> {
  await store.clearAttempts(now + 1);
  const token = randomToken();
  await store.putSession(await sha256Hex(token), now + SESSION_MS);
  const headers = new Headers();
  headers.set("set-cookie", sessionCookie(token, request, SESSION_MS / 1000));
  return text(204, "", headers);
}

async function login(request: Request, store: Store, auth: AuthConfig, now: number): Promise<Response> {
  if (!originOk(request)) return text(403, "bad origin\n");
  const body = await readJson(request);
  if (body instanceof Response) return body;
  const hash = await activeHash(store, auth);
  if (!configured({ user: auth.user, hash })) return text(503, "login is not configured\n");
  await store.clearAttempts(now - 24 * 60 * 60 * 1000);
  if ((await store.countAttempts(now - WINDOW_MS)) >= LOCK_AFTER) return text(429, "too many attempts\n");
  const record = body as { username?: unknown; password?: unknown; code?: unknown };
  const username = typeof record.username === "string" ? record.username : "";
  const password = typeof record.password === "string" ? record.password : "";
  const code = typeof record.code === "string" ? record.code.trim() : "";
  if (username.length > 64 || password.length < 1 || password.length > 200 || code.length > 64) {
    await store.addAttempt(now);
    return text(401, "no\n");
  }
  const userOk = safeEqual(username, auth.user);
  const passOk = await verifyPassword(password, hash);
  if (!userOk || !passOk) {
    await store.addAttempt(now);
    return text(401, "no\n");
  }
  const row = await store.getAuth();
  if (!auth.totpKey || !row?.totpCipher) return text(503, "login is not configured\n");
  let secret: Uint8Array;
  try {
    secret = await openSecret(auth.totpKey, row.totpCipher);
  } catch {
    return text(503, "login is not configured\n");
  }
  if (!code) {
    if (row.totpReady) return json(200, { step: "code" });
    return json(200, { step: "enroll", otpauth: otpauthUri(secret) });
  }
  const normalized = code.replace(/\s+/g, "").toUpperCase();
  const recovered = await store.consumeRecovery(await sha256Hex(normalized));
  const codeOk = recovered || (await totpMatches(secret, code, Math.floor(now / 1000)));
  if (!codeOk) {
    await store.addAttempt(now);
    return text(401, "no\n");
  }
  if (!row.totpReady) await store.markTotpReady();
  return issueSession(request, store, now);
}

async function changePassword(request: Request, store: Store, auth: AuthConfig, now: number): Promise<Response> {
  const denied = await requireUser(request, store, auth, now);
  if (denied) return denied;
  const body = await readJson(request);
  if (body instanceof Response) return body;
  if ((await store.countAttempts(now - WINDOW_MS)) >= LOCK_AFTER) return text(429, "too many attempts\n");
  const record = body as { current?: unknown; password?: unknown };
  const current = typeof record.current === "string" ? record.current : "";
  const next = typeof record.password === "string" ? record.password : "";
  if (current.length < 1 || current.length > 200 || next.length < 16 || next.length > 200) {
    return text(400, "password too short\n");
  }
  const hash = await activeHash(store, auth);
  if (!(await verifyPassword(current, hash))) {
    await store.addAttempt(now);
    return text(401, "no\n");
  }
  const ok = await store.setPasswordHash(`sha256$${await sha256Hex(next)}`);
  if (!ok) return text(503, "login is not configured\n");
  return text(204, "");
}

async function logout(request: Request, store: Store): Promise<Response> {
  if (!originOk(request)) return text(403, "bad origin\n");
  const token = readCookie(cookieHeader(request), COOKIE);
  if (token) await store.deleteSession(await sha256Hex(token));
  const headers = new Headers();
  headers.set("set-cookie", sessionCookie("", request, 0));
  return text(204, "", headers);
}

function publicPost(post: { slug: string; title: string; tags: string; created: number; content?: string }) {
  return {
    excerpt: post.content && markdown(post.content) !== null ? excerptOf(post.content) : "",
    slug: post.slug,
    title: cleanLine(post.title, 160) ?? "post",
    tags: cleanTags(post.tags) ?? "",
    created: new Date(post.created).toISOString(),
  };
}

async function create(request: Request, store: Store, auth: AuthConfig, now: number): Promise<Response> {
  const denied = await requireUser(request, store, auth, now);
  if (denied) return denied;
  const body = await readJson(request);
  if (body instanceof Response) return body;
  const record = body as { title?: unknown; content?: unknown; tags?: unknown };
  const title = typeof record.title === "string" ? cleanLine(record.title, 160) : null;
  const content = markdown(record.content);
  const tags = cleanTags(typeof record.tags === "string" ? record.tags : "");
  if (!title || !content || tags === null) return text(400, "title and content are required\n");
  let slug = slugify(title);
  let n = 2;
  while (await store.getPost(slug)) {
    slug = `${slugify(title).slice(0, 54)}-${n}`;
    n += 1;
    if (n > 50) return text(409, "slug collision\n");
  }
  await store.insertPost({ slug, title, content, tags, created: now, updated: now });
  return json(201, { slug });
}

async function update(request: Request, store: Store, auth: AuthConfig, now: number, slug: string): Promise<Response> {
  const denied = await requireUser(request, store, auth, now);
  if (denied) return denied;
  const body = await readJson(request);
  if (body instanceof Response) return body;
  const record = body as { title?: unknown; content?: unknown; tags?: unknown };
  const title = typeof record.title === "string" ? cleanLine(record.title, 160) : null;
  const content = markdown(record.content);
  const tags = cleanTags(typeof record.tags === "string" ? record.tags : "");
  if (!title || !content || tags === null) return text(400, "title and content are required\n");
  const ok = await store.updatePost(slug, { title, content, tags, updated: now });
  if (!ok) return text(404, "no such post\n");
  return text(204, "");
}

export async function handleApi(
  request: Request,
  store: Store,
  auth: AuthConfig,
  now = Date.now(),
): Promise<Response> {
  const url = new URL(request.url);
  const method = request.method;
  const path = url.pathname;

  if (path === "/api/auth" && method === "POST") return login(request, store, auth, now);
  if (path === "/api/password" && method === "POST") return changePassword(request, store, auth, now);
  if (path === "/api/logout" && method === "POST") return logout(request, store);
  if (path === "/api/session" && method === "GET") {
    if (!(await sessionUser(request, store, auth, now))) return text(401, "no\n");
    return json(200, { user: auth.user });
  }
  if (path === "/api/blog" && method === "GET") {
    const posts = await store.listPosts();
    return json(200, { posts: posts.map(publicPost) });
  }
  if (path === "/api/blog" && method === "POST") return create(request, store, auth, now);
  if (path === "/api/comments" && method === "GET") {
    const notes = (await store.listNotes(80)).map(publicNote).filter((note) => note !== null);
    return json(200, { notes, count: await store.countNotes() });
  }
  if (path === "/api/comments" && method === "POST") return createNote(request, store, now);
  if (path === "/api/contact" && method === "POST") return createMessage(request, store, now);
  if (path === "/api/contact" && method === "GET") {
    if (!(await sessionUser(request, store, auth, now))) return text(401, "no\n");
    const messages = (await store.listMessages(200)).map(publicMessage).filter((message) => message !== null);
    return json(200, { messages });
  }
  const message = /^\/api\/contact\/([1-9]\d*)$/.exec(path);
  if (message) {
    if (method !== "DELETE") return text(405, "method not allowed\n");
    const denied = await requireUser(request, store, auth, now);
    if (denied) return denied;
    const id = Number(message[1]);
    if (!Number.isSafeInteger(id) || !(await store.deleteMessage(id))) return text(404, "no such message\n");
    return text(204, "");
  }
  if (path === "/api/scores" && method === "GET") {
    const game = parseGame(url.searchParams.get("game"));
    if (!game) return text(400, "bad game\n");
    const scores = await store.listScores(game, TOP_N);
    return json(200, {
      scores: scores
        .map((row) => {
          const name = parseScoreName(row.name);
          if (!name || !Number.isInteger(row.score) || !Number.isInteger(row.level)) return null;
          return { name, score: row.score, level: row.level };
        })
        .filter((row) => row !== null),
    });
  }
  if (path === "/api/scores" && method === "POST") return saveScore(request, store, now);

  const comment = /^\/api\/comments\/([1-9]\d*)$/.exec(path);
  if (comment) {
    if (method !== "DELETE") return text(405, "method not allowed\n");
    const denied = await requireUser(request, store, auth, now);
    if (denied) return denied;
    const id = Number(comment[1]);
    if (!Number.isSafeInteger(id)) return text(404, "no such note\n");
    const removed = await store.deleteNote(id);
    if (!removed) return text(404, "no such note\n");
    return text(204, "");
  }

  const one = /^\/api\/blog\/([a-z0-9-]+)$/.exec(path);
  if (!one) {
    if (path.startsWith("/api/")) return text(method === "GET" || method === "HEAD" ? 404 : 405, "no\n");
    return text(404, "no\n");
  }
  const slug = one[1];
  if (method === "GET") {
    const post = await store.getPost(slug);
    if (!post) return text(404, "no such post\n");
    return json(200, {
      ...publicPost(post),
      content: publicMarkdown(post.content),
      updated: new Date(post.updated).toISOString(),
    });
  }
  if (method === "PUT") return update(request, store, auth, now, slug);
  if (method === "DELETE") {
    const denied = await requireUser(request, store, auth, now);
    if (denied) return denied;
    const ok = await store.deletePost(slug);
    if (!ok) return text(404, "no such post\n");
    return text(204, "");
  }
  return text(405, "method not allowed\n");
}
