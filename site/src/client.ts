import { isNew } from "./blog";
import { t } from "./i18n";
import { readNotes } from "./desktop/pad";
import { assertSafeHtml, renderNote } from "./notes";
import { normalizePath } from "./paths";
import { cleanLine, cleanTags } from "./plain";
import { drawQr } from "./qr";

type Go = (path: string) => void;

let go: Go = (path) => {
  location.assign(path);
};

export function setNavigator(fn: Go): void {
  go = fn;
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

function field(label: string, node: HTMLInputElement | HTMLTextAreaElement): HTMLElement {
  const wrap = document.createElement("label");
  wrap.append(el("span", label), node);
  return wrap;
}

async function renderAdmin(root: HTMLElement): Promise<void> {
  root.replaceChildren();
  const session = await api("/api/session");
  if (session.status === 401) {
    const anchor = document.createElement("a");
    anchor.href = "/login";
    anchor.textContent = "login";
    const note = el("p", "No session. ");
    note.append(anchor);
    root.append(note);
    return;
  }
  if (!session.ok) {
    line(root, "the blog store did not answer.");
    return;
  }
  const who = (await session.json()) as { user: string };
  root.append(el("p", who.user));

  const form = document.createElement("form");
  form.className = "editor";
  const title = document.createElement("input");
  title.required = true;
  title.maxLength = 160;
  title.setAttribute("aria-label", "Title");
  const tags = document.createElement("input");
  tags.maxLength = 200;
  tags.setAttribute("aria-label", "Tags");
  const content = document.createElement("textarea");
  content.required = true;
  content.maxLength = 40000;
  content.setAttribute("aria-label", "Markdown");
  const save = document.createElement("button");
  save.type = "submit";
  save.textContent = "save";
  const status = el("p", "");
  status.className = "err";
  status.setAttribute("role", "status");
  const previewBtn = document.createElement("button");
  previewBtn.type = "button";
  previewBtn.textContent = "preview";
  const preview = document.createElement("div");
  preview.className = "note blog-post";
  const paint = () => {
    preview.replaceChildren();
    try {
      const html = renderNote(content.value);
      assertSafeHtml(html);
      preview.innerHTML = html;
    } catch {
      preview.textContent = "This post failed the HTML check.";
    }
  };
  previewBtn.addEventListener("click", paint);
  content.addEventListener("input", paint);
  const wrap = (before: string, after: string, sample: string) => {
    const from = content.selectionStart;
    const to = content.selectionEnd;
    const picked = content.value.slice(from, to) || sample;
    content.setRangeText(`${before}${picked}${after}`, from, to, "select");
    content.focus();
    paint();
  };
  const tools = document.createElement("div");
  tools.className = "editor-tools";
  const buttons: [string, () => void][] = [
    ["bold", () => wrap("**", "**", "bold")],
    ["italic", () => wrap("*", "*", "italic")],
    ["heading", () => wrap("## ", "", "Heading")],
    ["subheading", () => wrap("### ", "", "Subheading")],
    ["list", () => wrap("- ", "", "item")],
    ["numbered", () => wrap("1. ", "", "item")],
    ["quote", () => wrap("> ", "", "quote")],
    ["code", () => wrap("`", "`", "code")],
    ["code block", () => wrap("```\n", "\n```", "code")],
    ["link", () => wrap("[", "](https://)", "text")],
    ["image", () => wrap("![", "](/media/)", "description")],
    ["rule", () => wrap("\n---\n", "", "")],
  ];
  for (const [label, run] of buttons) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.addEventListener("click", run);
    tools.append(button);
  }
  const help = el(
    "p",
    "Markdown: # heading, ### subheading, **bold**, *italic*, - list, 1. numbered, > quote, `code`, ``` code block, [text](url), ![alt](/media/file.jpg) for a local image, --- rule.",
  );
  help.className = "meta";
  form.append(field("title", title), field("tags", tags), tools, field("markdown", content), help, save, previewBtn, status, preview);

  const params = new URLSearchParams(location.search);
  const editing = params.get("slug");
  if (editing && /^[a-z0-9-]+$/.test(editing)) {
    const existing = await api(`/api/blog/${editing}`);
    if (existing.ok) {
      const post = (await existing.json()) as PostFull;
      title.value = post.title;
      tags.value = post.tags;
      content.value = post.content;
      save.textContent = "update";
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    void (async () => {
      status.textContent = "";
      const payload = JSON.stringify({
        title: title.value,
        tags: tags.value,
        content: content.value,
      });
      const response = editing
        ? await api(`/api/blog/${editing}`, { method: "PUT", body: payload })
        : await api("/api/blog", { method: "POST", body: payload });
      if (response.status === 201) {
        const created = (await response.json()) as { slug: string };
        go(`/blog/${created.slug}`);
        return;
      }
      if (response.status === 204) {
        go(`/blog/${editing}`);
        return;
      }
      status.textContent = response.status === 401 ? "session ended." : "save failed.";
    })();
  });

  const list = document.createElement("ul");
  list.className = "ls";
  const posts = await api("/api/blog");
  let armed = "";
  if (posts.ok) {
    const data = (await posts.json()) as { posts: PostSummary[] };
    for (const post of data.posts) {
      const item = document.createElement("li");
      const open = document.createElement("a");
      open.href = `/blog/${post.slug}`;
      open.textContent = post.title;
      const edit = document.createElement("a");
      edit.href = `/admin?slug=${post.slug}`;
      edit.textContent = "edit";
      const remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "delete";
      remove.addEventListener("click", () => {
        void (async () => {
          if (armed !== post.slug) {
            armed = post.slug;
            remove.textContent = "delete, again";
            return;
          }
          const response = await api(`/api/blog/${post.slug}`, { method: "DELETE" });
          if (response.status === 204) go("/admin");
          else status.textContent = "delete failed.";
        })();
      });
      item.append(open, document.createTextNode(" "), edit, document.createTextNode(" "), remove);
      list.append(item);
    }
  }

  const logout = document.createElement("button");
  logout.type = "button";
  logout.textContent = "logout";
  logout.addEventListener("click", () => {
    void (async () => {
      await api("/api/logout", { method: "POST" });
      go("/");
    })();
  });

  const passForm = document.createElement("form");
  passForm.className = "editor";
  const current = document.createElement("input");
  current.type = "password";
  current.autocomplete = "current-password";
  current.required = true;
  current.setAttribute("aria-label", "Current password");
  const next = document.createElement("input");
  next.type = "password";
  next.autocomplete = "new-password";
  next.required = true;
  next.minLength = 16;
  next.setAttribute("aria-label", "New password");
  const change = document.createElement("button");
  change.type = "submit";
  change.textContent = "change password";
  const passStatus = el("p", "");
  passStatus.className = "err";
  passForm.append(field("current password", current), field("new password", next), change, passStatus);
  passForm.addEventListener("submit", (event) => {
    event.preventDefault();
    void (async () => {
      passStatus.textContent = "";
      const response = await api("/api/password", {
        method: "POST",
        body: JSON.stringify({ current: current.value, password: next.value }),
      });
      current.value = "";
      next.value = "";
      if (response.status === 204) passStatus.textContent = "password updated.";
      else if (response.status === 400) passStatus.textContent = "use 16 to 200 characters.";
      else passStatus.textContent = "password change failed.";
    })();
  });

  const notesHead = el("h2", "Suggestions");
  const notesWrap = document.createElement("div");
  notesWrap.className = "notepad";
  const noteResponse = await api("/api/comments");
  let armedNote = 0;
  if (!noteResponse.ok) {
    notesWrap.append(el("p", "The suggestions did not load."));
  } else {
    const notes = readNotes(await noteResponse.json());
    if (notes.length === 0) notesWrap.append(el("p", "No suggestions yet."));
    for (const note of notes) {
      const row = document.createElement("article");
      row.className = "notepad-line";
      const who = el("p", `${note.name}  ${note.created.slice(0, 10)}`);
      who.className = "notepad-who";
      const text = el("p", note.body);
      text.className = "notepad-body";
      const remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "delete";
      remove.addEventListener("click", () => {
        void (async () => {
          if (armedNote !== note.id) {
            armedNote = note.id;
            remove.textContent = "delete, again";
            return;
          }
          const response = await api(`/api/comments/${note.id}`, { method: "DELETE" });
          if (response.status === 204) row.remove();
          else status.textContent = "delete failed.";
        })();
      });
      row.append(who, text, remove);
      notesWrap.append(row);
    }
  }

  const mailHead = el("h2", "Messages");
  const mailWrap = document.createElement("div");
  mailWrap.className = "notepad";
  const mailResponse = await api("/api/contact");
  let armedMail = 0;
  if (!mailResponse.ok) {
    mailWrap.append(el("p", "The messages did not load."));
  } else {
    const data = (await readJson(mailResponse)) as { messages?: unknown } | null;
    const mails = Array.isArray(data?.messages) ? (data.messages as Record<string, unknown>[]) : [];
    if (mails.length === 0) mailWrap.append(el("p", "No messages yet."));
    for (const mail of mails) {
      const id = typeof mail.id === "number" ? mail.id : 0;
      if (!id || typeof mail.name !== "string" || typeof mail.email !== "string" || typeof mail.body !== "string") continue;
      const created = typeof mail.created === "string" ? dateLabel(mail.created) : "";
      const row = document.createElement("article");
      row.className = "notepad-line";
      const who = el("p", `${mail.name}  ${created}`);
      who.className = "notepad-who";
      const reply = document.createElement("a");
      reply.href = `mailto:${encodeURIComponent(mail.email).replace(/%40/g, "@")}`;
      reply.textContent = mail.email;
      const text = el("p", mail.body);
      text.className = "notepad-body";
      const remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "delete";
      remove.addEventListener("click", () => {
        void (async () => {
          if (armedMail !== id) {
            armedMail = id;
            remove.textContent = "delete, again";
            return;
          }
          const response = await api(`/api/contact/${id}`, { method: "DELETE" });
          if (response.status === 204) row.remove();
          else status.textContent = "delete failed.";
        })();
      });
      row.append(who, reply, text, remove);
      mailWrap.append(row);
    }
  }

  root.append(form, el("h2", "posts"), list, mailHead, mailWrap, notesHead, notesWrap, passForm, logout);
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
