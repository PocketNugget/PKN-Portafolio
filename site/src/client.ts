import { renderAdminPanel } from "./admin";
import { isNew } from "./blog";
import { t } from "./i18n";
import { assertSafeHtml, renderNote } from "./notes";
import { normalizePath } from "./paths";
import { cleanLine, cleanTags } from "./plain";
import { applyPortfolioData } from "./portfolio";
import { drawQr } from "./qr";

type Go = (path: string) => void;

let go: Go = (path) => {
  location.assign(path);
};

let onPortfolioChanged: (() => void) | undefined;

export function setNavigator(fn: Go): void {
  go = fn;
}

export function setPortfolioChangeListener(fn: () => void): void {
  onPortfolioChanged = fn;
}

export async function syncPortfolio(): Promise<boolean> {
  try {
    const response = await api("/api/portfolio");
    if (!response.ok) return false;
    const data = (await readJson(response)) as { state?: unknown } | null;
    if (data?.state && applyPortfolioData(data.state)) {
      onPortfolioChanged?.();
      return true;
    }
  } catch {
    /* ignore when offline or unconfigured */
  }
  return false;
}

interface PostSummary {
  slug: string;
  title: string;
  tags: string;
  created: string;
  excerpt?: string;
}

interface PostFull extends PostSummary {
  content: string;
}

function el(tag: string, text?: string): HTMLElement {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  return node;
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function api(path: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);
  if (init?.body) headers.set("content-type", "application/json");
  return fetch(path, { ...init, headers, credentials: "same-origin" });
}

function line(parent: HTMLElement, text: string, className = "err"): void {
  const p = el("p", text);
  p.className = className;
  parent.append(p);
}

function dateLabel(iso: string): string {
  return /^\d{4}-\d{2}-\d{2}/.test(iso) ? iso.slice(0, 10) : "";
}

function tagChips(tags: string): HTMLElement | null {
  const names = tags
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag !== "");
  if (names.length === 0) return null;
  const row = document.createElement("span");
  row.className = "blog-tags";
  for (const name of names) row.append(el("span", name));
  return row;
}

async function renderBlogList(root: HTMLElement): Promise<void> {
  root.replaceChildren();
  const head = document.createElement("header");
  head.className = "blog-head";
  head.append(el("h2", t("Blog")), el("p", t("Posts by Goben. The newest is on top.")));
  root.append(head);
  const response = await api("/api/blog");
  if (!response.ok) {
    line(root, "the blog store did not answer.");
    return;
  }
  const data = (await readJson(response)) as { posts?: PostSummary[] } | null;
  if (!data || !Array.isArray(data.posts)) {
    line(root, "the blog store did not answer.");
    return;
  }
  if (data.posts.length === 0) {
    const empty = el("p", t("No posts yet. Check back soon."));
    empty.className = "blog-empty";
    root.append(empty);
    return;
  }
  const list = document.createElement("ul");
  list.className = "blog-list";
  const now = Date.now();
  for (const post of data.posts) {
    if (!/^[a-z0-9-]+$/.test(post.slug)) continue;
    const title = cleanLine(post.title, 160);
    const tags = cleanTags(post.tags);
    if (!title || tags === null) continue;
    const item = document.createElement("li");
    const card = document.createElement("a");
    card.className = "blog-card";
    card.href = `/blog/${post.slug}`;
    const top = document.createElement("span");
    top.className = "blog-top";
    if (isNew(post.created, now)) top.append(el("span", t("New")));
    top.lastElementChild?.classList.add("blog-new");
    top.append(el("time", dateLabel(post.created)));
    card.append(top, el("strong", title));
    const excerpt = cleanLine(post.excerpt ?? "", 160);
    if (excerpt) card.append(el("span", excerpt));
    const chips = tagChips(tags);
    if (chips) card.append(chips);
    card.append(el("span", `${t("Read")} >`));
    card.lastElementChild?.classList.add("blog-read");
    item.append(card);
    list.append(item);
  }
  root.append(list);
}

async function renderBlogPost(root: HTMLElement, slug: string): Promise<void> {
  root.replaceChildren();
  const response = await api(`/api/blog/${slug}`);
  if (response.status === 404) {
    line(root, "no such post.");
    return;
  }
  if (!response.ok) {
    line(root, "the blog store did not answer.");
    return;
  }
  const post = (await readJson(response)) as PostFull | null;
  if (!post || typeof post.slug !== "string" || !/^[a-z0-9-]+$/.test(post.slug)) {
    line(root, "no such post.");
    return;
  }
  const title = cleanLine(post.title, 160) ?? "post";
  const article = document.createElement("article");
  article.className = "note blog-post";
  const back = document.createElement("a");
  back.href = "/blog";
  back.className = "blog-back";
  back.textContent = `< ${t("Back to the blog")}`;
  article.append(back);
  article.append(el("h2", title));
  const meta = el("p", dateLabel(post.created));
  meta.className = "meta";
  article.append(meta);
  const chips = tagChips(cleanTags(post.tags) ?? "");
  if (chips) article.append(chips);
  const body = document.createElement("div");
  try {
    const html = renderNote(post.content);
    assertSafeHtml(html);
    body.innerHTML = html;
  } catch {
    body.textContent = "This post failed the HTML check.";
  }
  article.append(body);
  root.append(article);
}

function renderLogin(root: HTMLElement): void {
  root.replaceChildren();
  const form = document.createElement("form");
  form.className = "login";
  form.autocomplete = "off";
  const user = document.createElement("input");
  user.name = "username";
  user.autocomplete = "username";
  user.spellcheck = false;
  user.required = true;
  user.setAttribute("aria-label", "Username");
  user.placeholder = "username";
  const pass = document.createElement("input");
  pass.name = "password";
  pass.type = "password";
  pass.autocomplete = "current-password";
  pass.required = true;
  pass.setAttribute("aria-label", "Password");
  pass.placeholder = "password";
  const code = document.createElement("input");
  code.name = "code";
  code.inputMode = "numeric";
  code.autocomplete = "one-time-code";
  code.spellcheck = false;
  code.hidden = true;
  code.setAttribute("aria-label", "Code");
  code.placeholder = "6 digit code";
  const qrHost = document.createElement("div");
  const manual = el("p", "");
  manual.className = "meta";
  const button = document.createElement("button");
  button.type = "submit";
  button.textContent = "login";
  const status = el("p", "");
  status.className = "err";
  status.setAttribute("role", "status");
  form.append(user, pass, qrHost, manual, code, button, status);
  let pending = "";
  let phase: "password" | "code" = "password";
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    void (async () => {
      status.textContent = "";
      const password = phase === "code" ? pending : pass.value;
      const response = await api("/api/auth", {
        method: "POST",
        body: JSON.stringify({
          username: user.value,
          password,
          code: phase === "code" ? code.value.trim() : "",
        }),
      });
      if (response.status === 200) {
        const data = (await response.json()) as { step?: string; otpauth?: string };
        pending = password;
        pass.value = "";
        phase = "code";
        code.hidden = false;
        code.required = true;
        code.focus();
        qrHost.replaceChildren();
        manual.textContent = "";
        if (data.step === "enroll" && data.otpauth) {
          try {
            drawQr(qrHost, data.otpauth);
            manual.textContent = `Secret ${new URL(data.otpauth).searchParams.get("secret") ?? ""}`;
          } catch {
            manual.textContent = "Could not draw the QR. Type the secret from the login file.";
          }
        }
        status.textContent = "Enter the 6 digit code.";
        return;
      }
      pending = "";
      pass.value = "";
      if (response.status === 204) {
        go("/admin");
        return;
      }
      if (response.status === 429) status.textContent = "too many attempts.";
      else if (response.status === 503) status.textContent = "login is not configured.";
      else if (response.status >= 500) status.textContent = "the blog store did not answer.";
      else status.textContent = "no.";
    })();
  });
  root.append(form);
}

async function renderAdmin(root: HTMLElement): Promise<void> {
  await renderAdminPanel(root, go, () => onPortfolioChanged?.());
}

export function hydrate(pathname: string, scope: ParentNode = document): void {
  const root = scope.querySelector("#dynamic");
  if (!(root instanceof HTMLElement)) return;
  const path = normalizePath(pathname);
  if (path === "/blog") void renderBlogList(root);
  else if (path.startsWith("/blog/")) {
    const slug = path.slice("/blog/".length);
    if (/^[a-z0-9-]+$/.test(slug)) void renderBlogPost(root, slug);
    else line(root, "no such post.");
  }
  else if (path === "/login" || path === "/admin/login") renderLogin(root);
  else if (path === "/admin") void renderAdmin(root);
}
