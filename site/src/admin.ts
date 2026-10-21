import { readNotes } from "./desktop/pad";
import { getTranslationsFor } from "./i18n";
import { assertSafeHtml, renderNote } from "./notes";
import {
  applyPortfolioData,
  BUILTIN_MEDIA,
  getPortfolioData,
  resetPortfolioData,
  type PortfolioData,
} from "./portfolio";
import type { ProjectKind } from "./catalog";

type Go = (path: string) => void;

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

interface UploadedMedia {
  name: string;
  url: string;
  mime: string;
  size: number;
  created: string;
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, text?: string, className?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
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

function dateLabel(iso: string): string {
  return /^\d{4}-\d{2}-\d{2}/.test(iso) ? iso.slice(0, 10) : "";
}

function field(label: string, node: HTMLElement): HTMLElement {
  const wrap = document.createElement("label");
  wrap.className = "admin-field";
  wrap.append(el("span", label), node);
  return wrap;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("read failed"));
    reader.readAsDataURL(file);
  });
}

export async function compressImageFile(file: File): Promise<{ name: string; data: string }> {
  const rawUrl = await fileToDataUrl(file);
  if (!rawUrl) throw new Error("empty file");
  if (file.type === "image/gif" || typeof Image === "undefined" || typeof document === "undefined") {
    return { name: file.name || "image", data: rawUrl };
  }
  return new Promise((resolve) => {
    const img = new Image();
    const timer = setTimeout(() => {
      resolve({ name: file.name || "image", data: rawUrl });
    }, 1500);
    img.onload = () => {
      clearTimeout(timer);
      try {
        const maxSide = 1400;
        let w = img.naturalWidth || img.width || 800;
        let h = img.naturalHeight || img.height || 600;
        if (w > maxSide || h > maxSide) {
          if (w >= h) {
            h = Math.max(1, Math.round((h * maxSide) / w));
            w = maxSide;
          } else {
            w = Math.max(1, Math.round((w * maxSide) / h));
            h = maxSide;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve({ name: file.name || "image", data: rawUrl });
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        let out = canvas.toDataURL("image/webp", 0.84);
        if (!out.startsWith("data:image/webp")) {
          out = canvas.toDataURL("image/jpeg", 0.86);
        }
        if (out && out.startsWith("data:image/") && out.length < rawUrl.length) {
          resolve({ name: file.name || "image", data: out });
        } else {
          resolve({ name: file.name || "image", data: rawUrl });
        }
      } catch {
        resolve({ name: file.name || "image", data: rawUrl });
      }
    };
    img.onerror = () => {
      clearTimeout(timer);
      resolve({ name: file.name || "image", data: rawUrl });
    };
    img.src = rawUrl;
  });
}

export async function uploadImageFile(file: File): Promise<UploadedMedia | null> {
  try {
    const compressed = await compressImageFile(file);
    const response = await api("/api/media", {
      method: "POST",
      body: JSON.stringify({ name: compressed.name, data: compressed.data }),
    });
    if (!response.ok) return null;
    return (await readJson(response)) as UploadedMedia | null;
  } catch {
    return null;
  }
}

function createMediaPickerModal(onPick: (url: string) => void): HTMLElement {
  const box = el("div", undefined, "media-picker");
  const status = el("p", "Loading media...", "meta");
  const grid = el("div", undefined, "media-grid");
  box.append(status, grid);

  void (async () => {
    const res = await api("/api/media");
    if (!res.ok) {
      status.textContent = "Could not load media library.";
      return;
    }
    const data = (await readJson(res)) as { uploaded?: UploadedMedia[]; builtin?: string[] } | null;
    const uploaded = Array.isArray(data?.uploaded) ? data.uploaded : [];
    const builtin = Array.isArray(data?.builtin) ? data.builtin : BUILTIN_MEDIA;
    status.textContent = `Uploaded: ${uploaded.length} · Built-in: ${builtin.length}`;

    const addTile = (url: string, label: string, removableName?: string) => {
      const card = el("div", undefined, "media-tile");
      const pickBtn = el("button", label, "media-pick-btn");
      pickBtn.type = "button";
      pickBtn.title = url;
      pickBtn.addEventListener("click", () => onPick(url));
      const pathSpan = el("span", url, "meta");
      card.append(pickBtn, pathSpan);
      if (removableName) {
        const delBtn = el("button", "delete", "media-del-btn");
        delBtn.type = "button";
        let armed = false;
        delBtn.addEventListener("click", () => {
          void (async () => {
            if (!armed) {
              armed = true;
              delBtn.textContent = "confirm";
              return;
            }
            const delRes = await api(`/api/media/${encodeURIComponent(removableName)}`, { method: "DELETE" });
            if (delRes.status === 204) card.remove();
          })();
        });
        card.append(delBtn);
      }
      grid.append(card);
    };

    for (const item of uploaded) {
      addTile(item.url, `[Uploaded] ${item.name} (${Math.max(1, Math.round(item.size / 1024))} KB)`, item.name);
    }
    for (const path of builtin) {
      addTile(path, path.replace("/media/", ""));
    }
  })();

  return box;
}

function createImageField(
  label: string,
  initial: string | undefined,
  onChange: (next: string) => void,
): HTMLElement {
  const wrap = el("div", undefined, "admin-image-field");
  const input = document.createElement("input");
  input.value = initial ?? "";
  input.placeholder = "/media/photo.jpg";
  input.addEventListener("input", () => onChange(input.value.trim()));

  const controls = el("div", undefined, "editor-tools");
  const uploadBtn = el("button", "upload image");
  uploadBtn.type = "button";
  const libraryBtn = el("button", "choose existing");
  libraryBtn.type = "button";
  const clearBtn = el("button", "clear");
  clearBtn.type = "button";

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/png,image/jpeg,image/webp,image/gif";
  fileInput.hidden = true;

  const status = el("span", "", "meta");
  const pickerHost = el("div");

  uploadBtn.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    status.textContent = "Uploading...";
    void (async () => {
      const uploaded = await uploadImageFile(file);
      fileInput.value = "";
      if (!uploaded) {
        status.textContent = "Upload failed.";
        return;
      }
      input.value = uploaded.url;
      onChange(uploaded.url);
      status.textContent = `Uploaded ${uploaded.url}`;
    })();
  });

  libraryBtn.addEventListener("click", () => {
    if (pickerHost.childElementCount > 0) {
      pickerHost.replaceChildren();
      return;
    }
    pickerHost.replaceChildren(
      createMediaPickerModal((pickedUrl) => {
        input.value = pickedUrl;
        onChange(pickedUrl);
        pickerHost.replaceChildren();
      }),
    );
  });

  clearBtn.addEventListener("click", () => {
    input.value = "";
    onChange("");
    status.textContent = "";
  });

  controls.append(uploadBtn, libraryBtn, clearBtn, fileInput, status);
  wrap.append(field(label, input), controls, pickerHost);
  return wrap;
}

function createChipsEditor(
  label: string,
  items: string[],
  onChange: (next: string[]) => void,
  extraAction?: { label: string; onItem: (item: string, idx: number) => void },
): HTMLElement {
  const wrap = el("fieldset", undefined, "admin-fieldset");
  wrap.append(el("legend", label));
  const chipsRow = el("div", undefined, "admin-chips");
  const addRow = el("div", undefined, "admin-row");
  const input = document.createElement("input");
  input.placeholder = "Add item (or comma-separated list)...";
  const addBtn = el("button", "+ add");
  addBtn.type = "button";

  const paint = () => {
    chipsRow.replaceChildren();
    if (items.length === 0) {
      chipsRow.append(el("span", "None.", "meta"));
    }
    items.forEach((item, idx) => {
      const chip = el("span", undefined, "admin-chip");
      chip.append(el("span", item));
      if (idx > 0) {
        const left = el("button", "←", "chip-btn");
        left.type = "button";
        left.title = "Move left";
        left.addEventListener("click", () => {
          const prev = items[idx - 1];
          if (prev === undefined) return;
          items[idx - 1] = item;
          items[idx] = prev;
          onChange(items);
          paint();
        });
        chip.append(left);
      }
      if (extraAction) {
        const moveBtn = el("button", extraAction.label, "chip-btn");
        moveBtn.type = "button";
        moveBtn.addEventListener("click", () => {
          extraAction.onItem(item, idx);
          paint();
        });
        chip.append(moveBtn);
      }
      const del = el("button", "x", "chip-btn");
      del.type = "button";
      del.title = `Remove ${item}`;
      del.addEventListener("click", () => {
        items.splice(idx, 1);
        onChange(items);
        paint();
      });
      chip.append(del);
      chipsRow.append(chip);
    });
  };

  const commitAdd = () => {
    const parts = input.value
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !items.includes(s));
    if (parts.length === 0) return;
    items.push(...parts);
    input.value = "";
    onChange(items);
    paint();
  };

  addBtn.addEventListener("click", commitAdd);
  input.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") {
      ev.preventDefault();
      commitAdd();
    }
  });

  addRow.append(input, addBtn);
  wrap.append(chipsRow, addRow);
  paint();
  return wrap;
}

function createLinesEditor(
  label: string,
  lines: string[],
  onChange: (next: string[]) => void,
  multiline = true,
): HTMLElement {
  const wrap = el("fieldset", undefined, "admin-fieldset");
  wrap.append(el("legend", label));
  const listHost = el("div", undefined, "admin-stack");
  const addBtn = el("button", "+ add line");
  addBtn.type = "button";

  const paint = () => {
    listHost.replaceChildren();
    lines.forEach((lineText, idx) => {
      const row = el("div", undefined, "admin-line-item");
      const ctrl = multiline ? document.createElement("textarea") : document.createElement("input");
      if (ctrl instanceof HTMLTextAreaElement) ctrl.rows = 2;
      ctrl.value = lineText;
      ctrl.addEventListener("input", () => {
        lines[idx] = ctrl.value;
        onChange(lines);
      });
      const actions = el("div", undefined, "editor-tools");
      const up = el("button", "up");
      up.type = "button";
      up.disabled = idx === 0;
      up.addEventListener("click", () => {
        const tmp = lines[idx - 1];
        if (tmp === undefined) return;
        lines[idx - 1] = lines[idx] ?? "";
        lines[idx] = tmp;
        onChange(lines);
        paint();
      });
      const down = el("button", "down");
      down.type = "button";
      down.disabled = idx === lines.length - 1;
      down.addEventListener("click", () => {
        const tmp = lines[idx + 1];
        if (tmp === undefined) return;
        lines[idx + 1] = lines[idx] ?? "";
        lines[idx] = tmp;
        onChange(lines);
        paint();
      });
      const del = el("button", "remove");
      del.type = "button";
      del.addEventListener("click", () => {
        lines.splice(idx, 1);
        onChange(lines);
        paint();
      });
      actions.append(up, down, del);
      row.append(ctrl, actions);
      listHost.append(row);
    });
  };

  addBtn.addEventListener("click", () => {
    lines.push("");
    onChange(lines);
    paint();
  });

  wrap.append(listHost, addBtn);
  paint();
  return wrap;
}

function createTranslationEditor(
  draft: PortfolioData,
  getStrings: () => { label: string; text: string }[],
): HTMLElement {
  const details = document.createElement("details");
  details.className = "admin-i18n";
  const summary = el("summary", "Translations (ES / DE / FR) - optional, falls back to base text");
  const body = el("div", undefined, "admin-stack");
  details.append(summary, body);

  let activeLang: "es" | "de" | "fr" = "es";

  const renderFields = () => {
    body.replaceChildren();
    const langBar = el("div", undefined, "editor-tools");
    for (const [code, name] of [
      ["es", "Espanol (ES)"],
      ["de", "Deutsch (DE)"],
      ["fr", "Francais (FR)"],
    ] as const) {
      const btn = el("button", name, code === activeLang ? "active-tab" : "");
      btn.type = "button";
      btn.addEventListener("click", () => {
        activeLang = code;
        renderFields();
      });
      langBar.append(btn);
    }
    body.append(langBar);

    const entries = getStrings().filter((item) => item.text.trim().length > 0);
    if (entries.length === 0) {
      body.append(el("p", "Fill in the base text first to add translations.", "meta"));
      return;
    }
    for (const entry of entries) {
      const key = entry.text.trim();
      const existing = getTranslationsFor(key)[activeLang];
      const input = key.length > 90 ? document.createElement("textarea") : document.createElement("input");
      if (input instanceof HTMLTextAreaElement) input.rows = 2;
      input.placeholder = existing ? `Default [${activeLang.toUpperCase()}]: ${existing}` : `Fallback: ${key}`;
      input.value = draft.translations[activeLang][key] ?? existing ?? "";
      input.addEventListener("input", () => {
        const val = input.value.trim();
        if (val) draft.translations[activeLang][key] = val;
        else delete draft.translations[activeLang][key];
      });
      body.append(field(`${entry.label} [${activeLang.toUpperCase()}]`, input));
    }
  };

  details.addEventListener("toggle", () => {
    if (details.open) renderFields();
  });

  return details;
}

export async function renderAdminPanel(
  root: HTMLElement,
  go: Go,
  onPortfolioChange?: () => void,
): Promise<void> {
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
    root.append(el("p", "the blog store did not answer.", "err"));
    return;
  }
  const who = (await session.json()) as { user: string };

  // Fetch portfolio state from D1 if available
  try {
    const pfRes = await api("/api/portfolio");
    if (pfRes.ok) {
      const pfData = (await readJson(pfRes)) as { state?: unknown } | null;
      if (pfData?.state) {
        applyPortfolioData(pfData.state);
      }
    }
  } catch {
    /* keep current in-memory portfolio state */
  }

  let draft: PortfolioData = getPortfolioData();

  const headerBar = el("div", undefined, "admin-header");
  headerBar.append(el("p", who.user, "admin-user"));

  const tabBar = el("div", undefined, "admin-tabs");
  const cvSaveBar = el("div", undefined, "admin-save-bar");
  const saveCvBtn = el("button", "Save CV & Experience changes");
  saveCvBtn.type = "button";
  const cvStatus = el("span", "", "meta");
  cvSaveBar.append(saveCvBtn, cvStatus);

  const savePortfolioNow = async () => {
    cvStatus.textContent = "Saving...";
    cvStatus.className = "meta";
    const res = await api("/api/portfolio", {
      method: "PUT",
      body: JSON.stringify(draft),
    });
    if (res.status === 204) {
      applyPortfolioData(draft);
      draft = getPortfolioData();
      cvStatus.textContent = "Saved! All desktop windows updated.";
      onPortfolioChange?.();
    } else if (res.status === 401) {
      cvStatus.textContent = "Session ended. Log in again.";
      cvStatus.className = "err";
    } else {
      cvStatus.textContent = "Could not save changes.";
      cvStatus.className = "err";
    }
  };
  saveCvBtn.addEventListener("click", () => void savePortfolioNow());

  const panels: Record<string, HTMLElement> = {
    blog: el("section", undefined, "admin-panel"),
    profile: el("section", undefined, "admin-panel"),
    jobs: el("section", undefined, "admin-panel"),
    projects: el("section", undefined, "admin-panel"),
    skills: el("section", undefined, "admin-panel"),
    galleries: el("section", undefined, "admin-panel"),
    account: el("section", undefined, "admin-panel"),
  };

  const tabDefs: [string, string][] = [
    ["blog", "Blog & Inbox"],
    ["profile", "Profile & Hero"],
    ["jobs", "Experience (Jobs)"],
    ["projects", "Projects"],
    ["skills", "Skills & Courses"],
    ["galleries", "Galleries & Nugget"],
    ["account", "Account & Backup"],
  ];

  let activeTab = "blog";
  const switchTab = (id: string) => {
    activeTab = id;
    for (const [key, panel] of Object.entries(panels)) {
      panel.hidden = key !== id;
    }
    cvSaveBar.hidden = id === "blog" || id === "account";
    for (const btn of tabBar.querySelectorAll<HTMLButtonElement>("button[data-tab]")) {
      btn.classList.toggle("active-tab", btn.dataset.tab === id);
    }
  };

  for (const [id, label] of tabDefs) {
    const btn = el("button", label);
    btn.type = "button";
    btn.dataset.tab = id;
    btn.addEventListener("click", () => switchTab(id));
    tabBar.append(btn);
  }

  // ============================================================================
  // TAB 1: BLOG & INBOX (Suggestions + Messages)
  // ============================================================================
  const buildBlogPanel = async (host: HTMLElement) => {
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
    const status = el("p", "", "err");
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

    const insertImageMarkdown = (url: string, altText = "image") => {
      const cleanAlt = altText.replace(/[\[\]\r\n]+/g, " ").trim() || "image";
      const prefix = content.selectionStart > 0 && content.value[content.selectionStart - 1] !== "\n" ? "\n" : "";
      const suffix = "\n";
      wrap(`${prefix}![${cleanAlt}](${url})${suffix}`, "", "");
    };

    const blogFileInput = document.createElement("input");
    blogFileInput.type = "file";
    blogFileInput.accept = "image/png,image/jpeg,image/webp,image/gif";
    blogFileInput.hidden = true;

    const mediaLibraryHost = el("div");

    const handleBlogFileUpload = async (file: File) => {
      status.textContent = "Uploading image...";
      const uploaded = await uploadImageFile(file);
      if (!uploaded) {
        status.textContent = "Image upload failed.";
        return;
      }
      status.textContent = `Uploaded ${uploaded.url}`;
      const baseAlt = file.name.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ") || "image";
      insertImageMarkdown(uploaded.url, baseAlt);
    };

    blogFileInput.addEventListener("change", () => {
      const file = blogFileInput.files?.[0];
      blogFileInput.value = "";
      if (file) void handleBlogFileUpload(file);
    });

    content.addEventListener("dragover", (ev) => {
      if (ev.dataTransfer?.types.includes("Files")) {
        ev.preventDefault();
      }
    });
    content.addEventListener("drop", (ev) => {
      const file = ev.dataTransfer?.files?.[0];
      if (file && file.type.startsWith("image/")) {
        ev.preventDefault();
        void handleBlogFileUpload(file);
      }
    });
    content.addEventListener("paste", (ev) => {
      const items = ev.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            ev.preventDefault();
            void handleBlogFileUpload(file);
            return;
          }
        }
      }
    });

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
      ["upload image", () => blogFileInput.click()],
      [
        "media library",
        () => {
          if (mediaLibraryHost.childElementCount > 0) {
            mediaLibraryHost.replaceChildren();
            return;
          }
          mediaLibraryHost.replaceChildren(
            createMediaPickerModal((pickedUrl) => {
              insertImageMarkdown(pickedUrl, pickedUrl.replace("/media/", "").replace(/\.[a-z0-9]+$/i, ""));
              mediaLibraryHost.replaceChildren();
            }),
          );
        },
      ],
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
      "Markdown: # heading, ### subheading, **bold**, *italic*, - list, 1. numbered, > quote, `code`, ``` code block, [text](url), ![alt](/media/file.jpg) or use 'upload image' / drag & drop / paste an image directly.",
      "meta",
    );
    form.append(
      field("title", title),
      field("tags", tags),
      tools,
      blogFileInput,
      mediaLibraryHost,
      field("markdown", content),
      help,
      save,
      previewBtn,
      status,
      preview,
    );

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
      const data = (await readJson(posts)) as { posts?: PostSummary[] } | null;
      for (const post of data?.posts ?? []) {
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

    const notesHead = el("h2", "Suggestions");
    const notesWrap = document.createElement("div");
    notesWrap.className = "notepad";
    const noteResponse = await api("/api/comments");
    let armedNote = 0;
    if (!noteResponse.ok) {
      notesWrap.append(el("p", "The suggestions did not load."));
    } else {
      const notes = readNotes(await readJson(noteResponse));
      if (notes.length === 0) notesWrap.append(el("p", "No suggestions yet."));
      for (const note of notes) {
        const row = document.createElement("article");
        row.className = "notepad-line";
        const whoLine = el("p", `${note.name}  ${note.created.slice(0, 10)}`, "notepad-who");
        const text = el("p", note.body, "notepad-body");
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
        row.append(whoLine, text, remove);
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
        if (!id || typeof mail.name !== "string" || typeof mail.email !== "string" || typeof mail.body !== "string") {
          continue;
        }
        const created = typeof mail.created === "string" ? dateLabel(mail.created) : "";
        const row = document.createElement("article");
        row.className = "notepad-line";
        const whoLine = el("p", `${mail.name}  ${created}`, "notepad-who");
        const reply = document.createElement("a");
        reply.href = `mailto:${encodeURIComponent(mail.email).replace(/%40/g, "@")}`;
        reply.textContent = mail.email;
        const text = el("p", mail.body, "notepad-body");
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
        row.append(whoLine, reply, text, remove);
        mailWrap.append(row);
      }
    }

    host.append(form, el("h2", "posts"), list, notesHead, notesWrap, mailHead, mailWrap);
  };

  // ============================================================================
  // TAB 2: PROFILE & HERO (About Me, Bio, Stats, Links, Radio)
  // ============================================================================
  const buildProfilePanel = (host: HTMLElement) => {
    host.replaceChildren();
    const heroBox = el("fieldset", undefined, "admin-fieldset");
    heroBox.append(el("legend", "Hero & Identity (About Me)"));

    const nameIn = document.createElement("input");
    nameIn.value = draft.hero.name;
    nameIn.addEventListener("input", () => {
      draft.hero.name = nameIn.value;
    });

    const titleIn = document.createElement("input");
    titleIn.value = draft.hero.title;
    titleIn.addEventListener("input", () => {
      draft.hero.title = titleIn.value;
    });

    const focusIn = document.createElement("input");
    focusIn.value = draft.hero.focus;
    focusIn.addEventListener("input", () => {
      draft.hero.focus = focusIn.value;
    });

    const sinceIn = document.createElement("input");
    sinceIn.value = draft.hero.since;
    sinceIn.addEventListener("input", () => {
      draft.hero.since = sinceIn.value;
    });

    const langsIn = document.createElement("input");
    langsIn.value = draft.hero.langs;
    langsIn.addEventListener("input", () => {
      draft.hero.langs = langsIn.value;
    });

    const avatarField = createImageField("Avatar photo (/media/...)", draft.hero.avatar, (next) => {
      draft.hero.avatar = next || "/media/me.png";
    });

    heroBox.append(
      field("Full name", nameIn),
      avatarField,
      field("Current role / headline", titleIn),
      field("Focus line", focusIn),
      field("Since / education line", sinceIn),
      field("Languages summary", langsIn),
      createLinesEditor("Rotating roles (typewriter)", draft.hero.roles, (next) => {
        draft.hero.roles = next;
      }, false),
      createChipsEditor("Tech ticker tape", draft.hero.ticker, (next) => {
        draft.hero.ticker = next;
      }),
    );

    // Hero stats editor
    const statsBox = el("fieldset", undefined, "admin-fieldset");
    statsBox.append(el("legend", "Hero Highlight Stats"));
    const statsList = el("div", undefined, "admin-stack");
    const addStatBtn = el("button", "+ Add stat card");
    addStatBtn.type = "button";

    const paintStats = () => {
      statsList.replaceChildren();
      draft.hero.stats.forEach((stat, idx) => {
        const card = el("div", undefined, "admin-card");
        const row1 = el("div", undefined, "admin-grid-3");
        const bigIn = document.createElement("input");
        bigIn.value = stat.big;
        bigIn.placeholder = "52 or 1st";
        bigIn.addEventListener("input", () => {
          stat.big = bigIn.value;
        });
        const countIn = document.createElement("input");
        countIn.type = "number";
        countIn.value = stat.count !== undefined ? String(stat.count) : "";
        countIn.placeholder = "Optional count";
        countIn.addEventListener("input", () => {
          const n = Number(countIn.value);
          if (countIn.value.trim() && Number.isFinite(n) && n > 0) stat.count = Math.round(n);
          else delete stat.count;
        });
        const unitIn = document.createElement("input");
        unitIn.value = stat.unit;
        unitIn.placeholder = "of 1,014";
        unitIn.addEventListener("input", () => {
          stat.unit = unitIn.value;
        });
        row1.append(field("Big number/text", bigIn), field("Animated number", countIn), field("Unit", unitIn));

        const labelIn = document.createElement("input");
        labelIn.value = stat.label;
        labelIn.addEventListener("input", () => {
          stat.label = labelIn.value;
        });

        const row2 = el("div", undefined, "admin-grid-2");
        const hrefIn = document.createElement("input");
        hrefIn.value = stat.href;
        hrefIn.addEventListener("input", () => {
          stat.href = hrefIn.value;
        });
        const cmdIn = document.createElement("input");
        cmdIn.value = stat.cmd;
        cmdIn.addEventListener("input", () => {
          stat.cmd = cmdIn.value;
        });
        row2.append(field("Link href", hrefIn), field("Terminal command", cmdIn));

        const delStat = el("button", "Remove stat");
        delStat.type = "button";
        delStat.addEventListener("click", () => {
          draft.hero.stats.splice(idx, 1);
          paintStats();
        });
        card.append(row1, field("Description", labelIn), row2, delStat);
        statsList.append(card);
      });
    };
    addStatBtn.addEventListener("click", () => {
      draft.hero.stats.push({
        big: "NEW",
        unit: "metric",
        label: "New achievement.",
        href: "/work",
        cmd: "projects",
      });
      paintStats();
    });
    paintStats();
    statsBox.append(statsList, addStatBtn);

    // Bio editor
    const bioBox = createLinesEditor("Biography Paragraphs (Profile section on About Me)", draft.bio, (next) => {
      draft.bio = next;
    });

    // Social & Contact Links
    const linksBox = el("fieldset", undefined, "admin-fieldset");
    linksBox.append(el("legend", "Primary Profiles & My Links"));
    for (const key of ["email", "github", "linkedin", "x"] as const) {
      const row = el("div", undefined, "admin-grid-2");
      const lbl = document.createElement("input");
      lbl.value = draft.profiles[key].label;
      lbl.addEventListener("input", () => {
        draft.profiles[key].label = lbl.value;
      });
      const hr = document.createElement("input");
      hr.value = draft.profiles[key].href;
      hr.addEventListener("input", () => {
        draft.profiles[key].href = hr.value;
      });
      row.append(field(`${key.toUpperCase()} label`, lbl), field(`${key.toUpperCase()} URL`, hr));
      linksBox.append(row);
    }

    const linkPageHost = el("div", undefined, "admin-stack");
    const addLinkBtn = el("button", "+ Add link to /links");
    addLinkBtn.type = "button";
    const paintLinkPage = () => {
      linkPageHost.replaceChildren();
      draft.linkPage.forEach((lnk, idx) => {
        const row = el("div", undefined, "admin-grid-3");
        const lIn = document.createElement("input");
        lIn.value = lnk.label;
        lIn.addEventListener("input", () => {
          lnk.label = lIn.value;
        });
        const hIn = document.createElement("input");
        hIn.value = lnk.href;
        hIn.addEventListener("input", () => {
          lnk.href = hIn.value;
        });
        const rm = el("button", "Remove");
        rm.type = "button";
        rm.addEventListener("click", () => {
          draft.linkPage.splice(idx, 1);
          paintLinkPage();
        });
        row.append(field("Label", lIn), field("URL", hIn), rm);
        linkPageHost.append(row);
      });
    };
    addLinkBtn.addEventListener("click", () => {
      draft.linkPage.push({ label: "Link", href: "https://" });
      paintLinkPage();
    });
    paintLinkPage();
    linksBox.append(el("h3", "All items on /links page"), linkPageHost, addLinkBtn);

    // Radio section
    const radioBox = el("fieldset", undefined, "admin-fieldset");
    radioBox.append(el("legend", "Radio Page (/radio)"));
    const radioTitle = document.createElement("input");
    radioTitle.value = draft.radio.title;
    radioTitle.addEventListener("input", () => {
      draft.radio.title = radioTitle.value;
    });
    radioBox.append(
      field("Radio title", radioTitle),
      createLinesEditor("Radio paragraphs", draft.radio.paragraphs, (next) => {
        draft.radio.paragraphs = next;
      }),
    );

    const profileI18n = createTranslationEditor(draft, () => [
      { label: "Headline", text: draft.hero.title },
      { label: "Focus", text: draft.hero.focus },
      { label: "Since", text: draft.hero.since },
      { label: "Languages", text: draft.hero.langs },
      ...draft.hero.roles.map((r, i) => ({ label: `Role #${i + 1}`, text: r })),
      ...draft.hero.stats.flatMap((s, i) => [
        { label: `Stat #${i + 1} unit`, text: s.unit },
        { label: `Stat #${i + 1} label`, text: s.label },
      ]),
      ...draft.bio.map((p, i) => ({ label: `Bio paragraph #${i + 1}`, text: p })),
      { label: "Radio title", text: draft.radio.title },
      ...draft.radio.paragraphs.map((p, i) => ({ label: `Radio paragraph #${i + 1}`, text: p })),
    ]);

    host.append(heroBox, statsBox, bioBox, linksBox, radioBox, profileI18n);
  };

  // ============================================================================
  // TAB 3: EXPERIENCE / JOBS
  // ============================================================================
  const buildJobsPanel = (host: HTMLElement) => {
    host.replaceChildren();
    const topRow = el("div", undefined, "admin-row");
    const addJobBtn = el("button", "+ Add new job / experience");
    addJobBtn.type = "button";
    topRow.append(
      el("p", "Add, edit, or reorder your work experience. Tools listed in jobs automatically appear on Skills.", "meta"),
      addJobBtn,
    );

    const jobsList = el("div", undefined, "admin-stack");

    const paintJobs = () => {
      jobsList.replaceChildren();
      draft.jobs.forEach((job, idx) => {
        const details = document.createElement("details");
        details.className = "admin-card";
        if (idx === 0) details.open = true;
        const summary = el("summary", `${idx + 1}. ${job.role || "New role"} · ${job.org || "Org"} (${job.date || "Date"})`);
        const body = el("div", undefined, "admin-stack");

        const moveRow = el("div", undefined, "editor-tools");
        const upBtn = el("button", "Move up");
        upBtn.type = "button";
        upBtn.disabled = idx === 0;
        upBtn.addEventListener("click", () => {
          const prev = draft.jobs[idx - 1];
          if (!prev) return;
          draft.jobs[idx - 1] = job;
          draft.jobs[idx] = prev;
          paintJobs();
        });
        const downBtn = el("button", "Move down");
        downBtn.type = "button";
        downBtn.disabled = idx === draft.jobs.length - 1;
        downBtn.addEventListener("click", () => {
          const next = draft.jobs[idx + 1];
          if (!next) return;
          draft.jobs[idx + 1] = job;
          draft.jobs[idx] = next;
          paintJobs();
        });
        const delBtn = el("button", "Delete job");
        delBtn.type = "button";
        let armed = false;
        delBtn.addEventListener("click", () => {
          if (!armed) {
            armed = true;
            delBtn.textContent = "Confirm delete job";
            return;
          }
          draft.jobs.splice(idx, 1);
          paintJobs();
        });
        moveRow.append(upBtn, downBtn, delBtn);

        const refreshSummary = () => {
          summary.textContent = `${idx + 1}. ${job.role || "New role"} · ${job.org || "Org"} (${job.date || "Date"})`;
        };

        const grid = el("div", undefined, "admin-grid-2");
        const idIn = document.createElement("input");
        idIn.value = job.id;
        idIn.addEventListener("input", () => {
          job.id = idIn.value.trim();
        });
        const roleIn = document.createElement("input");
        roleIn.value = job.role;
        roleIn.addEventListener("input", () => {
          job.role = roleIn.value;
          refreshSummary();
        });
        const orgIn = document.createElement("input");
        orgIn.value = job.org;
        orgIn.addEventListener("input", () => {
          job.org = orgIn.value;
          refreshSummary();
        });
        const placeIn = document.createElement("input");
        placeIn.value = job.place;
        placeIn.addEventListener("input", () => {
          job.place = placeIn.value;
        });
        const dateIn = document.createElement("input");
        dateIn.value = job.date;
        dateIn.addEventListener("input", () => {
          job.date = dateIn.value;
          refreshSummary();
        });
        grid.append(
          field("ID (anchor slug)", idIn),
          field("Role / Title", roleIn),
          field("Organization / Company", orgIn),
          field("Place (e.g. Remote)", placeIn),
          field("Dates (e.g. July 2026 to present)", dateIn),
        );

        const sumIn = document.createElement("textarea");
        sumIn.rows = 2;
        sumIn.value = job.summary;
        sumIn.addEventListener("input", () => {
          job.summary = sumIn.value;
        });

        const bodyLines = createLinesEditor("Detail paragraphs", job.body, (next) => {
          job.body = next;
        });
        const toolsChips = createChipsEditor("Tools used in this role", job.tools, (next) => {
          job.tools = next;
        });
        const imgField = createImageField("Optional photo (/media/...)", job.image, (next) => {
          if (next) job.image = next;
          else delete job.image;
        });

        const jobI18n = createTranslationEditor(draft, () => [
          { label: "Role", text: job.role },
          { label: "Place", text: job.place },
          { label: "Date", text: job.date },
          { label: "Summary", text: job.summary },
          ...job.body.map((b, i) => ({ label: `Paragraph #${i + 1}`, text: b })),
        ]);

        body.append(moveRow, grid, field("Short summary", sumIn), bodyLines, toolsChips, imgField, jobI18n);
        details.append(summary, body);
        jobsList.append(details);
      });
    };

    addJobBtn.addEventListener("click", () => {
      draft.jobs.unshift({
        id: `job-${Date.now().toString(36).slice(-4)}`,
        role: "New role",
        org: "Company",
        place: "Remote",
        date: "2026 to present",
        summary: "Summary of responsibilities and impact.",
        body: ["First detail paragraph about this position."],
        tools: [],
      });
      paintJobs();
    });

    paintJobs();
    host.append(topRow, jobsList);
  };

  // ============================================================================
  // TAB 4: PROJECTS (Main projects, Earlier, Archive)
  // ============================================================================
  const buildProjectsPanel = (host: HTMLElement) => {
    host.replaceChildren();
    const topRow = el("div", undefined, "admin-row");
    const addProjBtn = el("button", "+ Add new project");
    addProjBtn.type = "button";
    topRow.append(el("p", "Manage main interview projects, earlier hackathon entries, and archive repositories.", "meta"), addProjBtn);

    const projList = el("div", undefined, "admin-stack");

    const paintProjects = () => {
      projList.replaceChildren();
      draft.projects.forEach((proj, idx) => {
        const details = document.createElement("details");
        details.className = "admin-card";
        if (idx === 0) details.open = true;
        const summary = el("summary", `${idx + 1}. ${proj.title || "Project"} [/work/${proj.slug}] (${proj.kind})`);
        const body = el("div", undefined, "admin-stack");

        const refreshSummary = () => {
          summary.textContent = `${idx + 1}. ${proj.title || "Project"} [/work/${proj.slug}] (${proj.kind})`;
        };

        const moveRow = el("div", undefined, "editor-tools");
        const upBtn = el("button", "Move up");
        upBtn.type = "button";
        upBtn.disabled = idx === 0;
        upBtn.addEventListener("click", () => {
          const prev = draft.projects[idx - 1];
          if (!prev) return;
          draft.projects[idx - 1] = proj;
          draft.projects[idx] = prev;
          paintProjects();
        });
        const downBtn = el("button", "Move down");
        downBtn.type = "button";
        downBtn.disabled = idx === draft.projects.length - 1;
        downBtn.addEventListener("click", () => {
          const next = draft.projects[idx + 1];
          if (!next) return;
          draft.projects[idx + 1] = proj;
          draft.projects[idx] = next;
          paintProjects();
        });
        const delBtn = el("button", "Delete project");
        delBtn.type = "button";
        let armed = false;
        delBtn.addEventListener("click", () => {
          if (!armed) {
            armed = true;
            delBtn.textContent = "Confirm delete project";
            return;
          }
          draft.projects.splice(idx, 1);
          paintProjects();
        });
        moveRow.append(upBtn, downBtn, delBtn);

        const grid = el("div", undefined, "admin-grid-2");
        const titleIn = document.createElement("input");
        titleIn.value = proj.title;
        titleIn.addEventListener("input", () => {
          proj.title = titleIn.value;
          refreshSummary();
        });
        const slugIn = document.createElement("input");
        slugIn.value = proj.slug;
        slugIn.addEventListener("input", () => {
          proj.slug = slugIn.value.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-");
          refreshSummary();
        });
        const dateIn = document.createElement("input");
        dateIn.value = proj.date;
        dateIn.addEventListener("input", () => {
          proj.date = dateIn.value;
        });
        const kindSelect = document.createElement("select");
        for (const k of ["apps", "detection", "research", "hackathon"] as ProjectKind[]) {
          const opt = document.createElement("option");
          opt.value = k;
          opt.textContent = k;
          opt.selected = proj.kind === k;
          kindSelect.append(opt);
        }
        kindSelect.addEventListener("change", () => {
          proj.kind = kindSelect.value as ProjectKind;
          refreshSummary();
        });
        grid.append(
          field("Title", titleIn),
          field("Slug (/work/<slug>)", slugIn),
          field("Date", dateIn),
          field("Category", kindSelect),
        );

        const sumIn = document.createElement("textarea");
        sumIn.rows = 2;
        sumIn.value = proj.summary;
        sumIn.addEventListener("input", () => {
          proj.summary = sumIn.value;
        });

        const peopleIn = document.createElement("input");
        peopleIn.value = proj.people;
        peopleIn.placeholder = "Optional collaborators / mentors";
        peopleIn.addEventListener("input", () => {
          proj.people = peopleIn.value;
        });

        const bodyLines = createLinesEditor("Body paragraphs", proj.body, (next) => {
          proj.body = next;
        });

        const pointsArr = proj.points ?? [];
        const pointsLines = createLinesEditor("Bullet points (optional)", pointsArr, (next) => {
          if (next.length > 0) proj.points = next;
          else delete proj.points;
        }, false);

        const toolsChips = createChipsEditor("Stack / Tools", proj.tools, (next) => {
          proj.tools = next;
        });

        const aliasChips = createChipsEditor("Terminal 'open' aliases", proj.aliases, (next) => {
          proj.aliases = next;
        });

        // Project links editor
        const linksBox = el("fieldset", undefined, "admin-fieldset");
        linksBox.append(el("legend", "Project Links"));
        const linksStack = el("div", undefined, "admin-stack");
        const addProjLink = el("button", "+ Add link");
        addProjLink.type = "button";
        const paintProjLinks = () => {
          linksStack.replaceChildren();
          proj.links.forEach((lnk, lIdx) => {
            const row = el("div", undefined, "admin-grid-3");
            const lIn = document.createElement("input");
            lIn.value = lnk.label;
            lIn.placeholder = "Repository";
            lIn.addEventListener("input", () => {
              lnk.label = lIn.value;
            });
            const hIn = document.createElement("input");
            hIn.value = lnk.href;
            hIn.placeholder = "https://github.com/...";
            hIn.addEventListener("input", () => {
              lnk.href = hIn.value;
            });
            const rm = el("button", "Remove");
            rm.type = "button";
            rm.addEventListener("click", () => {
              proj.links.splice(lIdx, 1);
              paintProjLinks();
            });
            row.append(field("Label", lIn), field("URL", hIn), rm);
            linksStack.append(row);
          });
        };
        addProjLink.addEventListener("click", () => {
          proj.links.push({ label: "Repository", href: "https://github.com/PocketNugget/" });
          paintProjLinks();
        });
        paintProjLinks();
        linksBox.append(linksStack, addProjLink);

        const imgField = createImageField("Project image (/media/...)", proj.image, (next) => {
          if (next) proj.image = next;
          else delete proj.image;
        });

        const projI18n = createTranslationEditor(draft, () => [
          { label: "Title", text: proj.title },
          { label: "Date", text: proj.date },
          { label: "Summary", text: proj.summary },
          ...(proj.people ? [{ label: "People", text: proj.people }] : []),
          ...proj.body.map((b, i) => ({ label: `Body paragraph #${i + 1}`, text: b })),
          ...(proj.points ?? []).map((pt, i) => ({ label: `Point #${i + 1}`, text: pt })),
        ]);

        body.append(
          moveRow,
          grid,
          field("Short summary", sumIn),
          field("Collaborators / People", peopleIn),
          bodyLines,
          pointsLines,
          toolsChips,
          linksBox,
          aliasChips,
          imgField,
          projI18n,
        );
        details.append(summary, body);
        projList.append(details);
      });
    };

    addProjBtn.addEventListener("click", () => {
      draft.projects.unshift({
        slug: `project-${Date.now().toString(36).slice(-4)}`,
        title: "New Project",
        date: "2026",
        kind: "apps",
        summary: "Short summary of what this project does.",
        body: ["Detailed explanation of the architecture and results."],
        tools: ["TypeScript"],
        links: [],
        people: "",
        aliases: [],
      });
      paintProjects();
    });
    paintProjects();

    // Earlier section
    const earlierBox = el("fieldset", undefined, "admin-fieldset");
    earlierBox.append(el("legend", "Earlier One-Liners (under /work)"));
    const earlierList = el("div", undefined, "admin-stack");
    const addEarlierBtn = el("button", "+ Add earlier item");
    addEarlierBtn.type = "button";
    const paintEarlier = () => {
      earlierList.replaceChildren();
      draft.earlier.forEach((item, idx) => {
        const card = el("div", undefined, "admin-card");
        const dateIn = document.createElement("input");
        dateIn.value = item.date;
        dateIn.addEventListener("input", () => {
          item.date = dateIn.value;
        });
        const textIn = document.createElement("textarea");
        textIn.rows = 2;
        textIn.value = item.text;
        textIn.addEventListener("input", () => {
          item.text = textIn.value;
        });
        const imgField = createImageField("Optional image", item.image, (next) => {
          if (next) item.image = next;
          else delete item.image;
        });
        const rm = el("button", "Remove");
        rm.type = "button";
        rm.addEventListener("click", () => {
          draft.earlier.splice(idx, 1);
          paintEarlier();
        });
        card.append(field("Year / Date", dateIn), field("Description", textIn), imgField, rm);
        earlierList.append(card);
      });
    };
    addEarlierBtn.addEventListener("click", () => {
      draft.earlier.push({ date: "2026", text: "New entry." });
      paintEarlier();
    });
    paintEarlier();
    earlierBox.append(earlierList, addEarlierBtn);

    // Archive section
    const archiveBox = el("fieldset", undefined, "admin-fieldset");
    archiveBox.append(el("legend", "Archive Repositories (ls ~/archive)"));
    const archiveList = el("div", undefined, "admin-stack");
    const addArchBtn = el("button", "+ Add archive repo");
    addArchBtn.type = "button";
    const paintArchive = () => {
      archiveList.replaceChildren();
      draft.archive.forEach((item, idx) => {
        const row = el("div", undefined, "admin-grid-3");
        const nIn = document.createElement("input");
        nIn.value = item.name;
        nIn.addEventListener("input", () => {
          item.name = nIn.value;
        });
        const hIn = document.createElement("input");
        hIn.value = item.href;
        hIn.addEventListener("input", () => {
          item.href = hIn.value;
        });
        const rm = el("button", "Remove");
        rm.type = "button";
        rm.addEventListener("click", () => {
          draft.archive.splice(idx, 1);
          paintArchive();
        });
        row.append(field("Name", nIn), field("URL", hIn), rm);
        archiveList.append(row);
      });
    };
    addArchBtn.addEventListener("click", () => {
      draft.archive.unshift({ name: "New-Repo", href: "https://github.com/PocketNugget/" });
      paintArchive();
    });
    paintArchive();
    archiveBox.append(archiveList, addArchBtn);

    host.append(topRow, projList, earlierBox, archiveBox);
  };

  // ============================================================================
  // TAB 5: SKILLS & COURSES (/skills and /certs)
  // ============================================================================
  const buildSkillsPanel = (host: HTMLElement) => {
    host.replaceChildren();

    const jobTools = [...new Set(draft.jobs.flatMap((j) => j.tools))];
    const jobNote = el(
      "p",
      `Tools automatically derived from your Jobs (${jobTools.length}): ${jobTools.join(", ") || "none"}.`,
      "meta",
    );

    const labHost = el("div");
    const knownHost = el("div");
    const learningHost = el("div");

    const renderSkillBoxes = () => {
      labHost.replaceChildren(
        createChipsEditor("In projects and the lab (skillGroups.lab)", draft.skillGroups.lab, (next) => {
          draft.skillGroups.lab = next;
        }),
      );
      knownHost.replaceChildren(
        createChipsEditor("Known, not used at work (skillGroups.known)", draft.skillGroups.known, (next) => {
          draft.skillGroups.known = next;
        }),
      );
      learningHost.replaceChildren(
        createChipsEditor(
          "Currently learning (skillGroups.learning) - click '-> Lab' when mastered",
          draft.skillGroups.learning,
          (next) => {
            draft.skillGroups.learning = next;
          },
          {
            label: "-> Lab",
            onItem: (skill, idx) => {
              draft.skillGroups.learning.splice(idx, 1);
              if (!draft.skillGroups.lab.includes(skill)) draft.skillGroups.lab.push(skill);
              renderSkillBoxes();
            },
          },
        ),
      );
    };
    renderSkillBoxes();

    const notesBox = el("fieldset", undefined, "admin-fieldset");
    notesBox.append(el("legend", "Skills Page Notes (Languages & Agents)"));
    const langTxt = document.createElement("input");
    langTxt.value = draft.skillGroups.languages;
    langTxt.addEventListener("input", () => {
      draft.skillGroups.languages = langTxt.value;
    });
    const agentTxt = document.createElement("textarea");
    agentTxt.rows = 2;
    agentTxt.value = draft.skillGroups.agents;
    agentTxt.addEventListener("input", () => {
      draft.skillGroups.agents = agentTxt.value;
    });
    notesBox.append(field("Languages line", langTxt), field("Agents note", agentTxt));

    // Courses & Certifications (/certs)
    const coursesBox = el("fieldset", undefined, "admin-fieldset");
    coursesBox.append(el("legend", "Education, Courses & Certifications (/certs)"));
    const coursesList = el("div", undefined, "admin-stack");
    const addCourseBtn = el("button", "+ Add course / certification block");
    addCourseBtn.type = "button";

    const paintCourses = () => {
      coursesList.replaceChildren();
      draft.courses.forEach((course, idx) => {
        const card = el("div", undefined, "admin-card");
        const moveRow = el("div", undefined, "editor-tools");
        const up = el("button", "Move up");
        up.type = "button";
        up.disabled = idx === 0;
        up.addEventListener("click", () => {
          const prev = draft.courses[idx - 1];
          if (!prev) return;
          draft.courses[idx - 1] = course;
          draft.courses[idx] = prev;
          paintCourses();
        });
        const down = el("button", "Move down");
        down.type = "button";
        down.disabled = idx === draft.courses.length - 1;
        down.addEventListener("click", () => {
          const next = draft.courses[idx + 1];
          if (!next) return;
          draft.courses[idx + 1] = course;
          draft.courses[idx] = next;
          paintCourses();
        });
        const rm = el("button", "Remove block");
        rm.type = "button";
        rm.addEventListener("click", () => {
          draft.courses.splice(idx, 1);
          paintCourses();
        });
        moveRow.append(up, down, rm);

        const titleIn = document.createElement("input");
        titleIn.value = course.title;
        titleIn.addEventListener("input", () => {
          course.title = titleIn.value;
        });
        const bodyIn = document.createElement("textarea");
        bodyIn.rows = 2;
        bodyIn.value = course.body;
        bodyIn.addEventListener("input", () => {
          course.body = bodyIn.value;
        });

        const linkRow = el("div", undefined, "admin-grid-2");
        const lLabel = document.createElement("input");
        lLabel.value = course.linkLabel ?? "";
        lLabel.placeholder = "Optional link label";
        lLabel.addEventListener("input", () => {
          if (lLabel.value.trim()) course.linkLabel = lLabel.value.trim();
          else delete course.linkLabel;
        });
        const lHref = document.createElement("input");
        lHref.value = course.linkHref ?? "";
        lHref.placeholder = "Optional URL or /awards";
        lHref.addEventListener("input", () => {
          if (lHref.value.trim()) course.linkHref = lHref.value.trim();
          else delete course.linkHref;
        });
        linkRow.append(field("Link label", lLabel), field("Link href", lHref));

        const courseI18n = createTranslationEditor(draft, () => [
          { label: "Course title", text: course.title },
          { label: "Course description", text: course.body },
        ]);

        card.append(moveRow, field("Heading", titleIn), field("Description", bodyIn), linkRow, courseI18n);
        coursesList.append(card);
      });
    };

    addCourseBtn.addEventListener("click", () => {
      draft.courses.push({
        id: `course-${Date.now().toString(36).slice(-4)}`,
        title: "New Certification",
        body: "Earned in 2026.",
      });
      paintCourses();
    });
    paintCourses();
    coursesBox.append(coursesList, addCourseBtn);

    host.append(jobNote, labHost, knownHost, learningHost, notesBox, coursesBox);
  };

  // ============================================================================
  // TAB 6: GALLERIES & NUGGET (My Pictures, Certificates, Facts, Nugget)
  // ============================================================================
  const buildGalleriesPanel = (host: HTMLElement) => {
    host.replaceChildren();

    const makeShotSection = (heading: string, list: PortfolioData["pictures"]) => {
      const box = el("fieldset", undefined, "admin-fieldset");
      box.append(el("legend", heading));
      const stack = el("div", undefined, "admin-stack");
      const addBtn = el("button", "+ Add image entry");
      addBtn.type = "button";

      const paint = () => {
        stack.replaceChildren();
        list.forEach((shot, idx) => {
          const card = el("div", undefined, "admin-card");
          const moveRow = el("div", undefined, "editor-tools");
          const up = el("button", "Move up");
          up.type = "button";
          up.disabled = idx === 0;
          up.addEventListener("click", () => {
            const prev = list[idx - 1];
            if (!prev) return;
            list[idx - 1] = shot;
            list[idx] = prev;
            paint();
          });
          const down = el("button", "Move down");
          down.type = "button";
          down.disabled = idx === list.length - 1;
          down.addEventListener("click", () => {
            const next = list[idx + 1];
            if (!next) return;
            list[idx + 1] = shot;
            list[idx] = next;
            paint();
          });
          const rm = el("button", "Remove");
          rm.type = "button";
          rm.addEventListener("click", () => {
            list.splice(idx, 1);
            paint();
          });
          moveRow.append(up, down, rm);

          const titleIn = document.createElement("input");
          titleIn.value = shot.title;
          titleIn.addEventListener("input", () => {
            shot.title = titleIn.value;
          });
          const capIn = document.createElement("textarea");
          capIn.rows = 2;
          capIn.value = shot.caption;
          capIn.addEventListener("input", () => {
            shot.caption = capIn.value;
          });
          const imgField = createImageField("Image file (/media/...)", shot.src, (next) => {
            shot.src = next;
          });
          const shotI18n = createTranslationEditor(draft, () => [
            { label: "Title", text: shot.title },
            { label: "Caption", text: shot.caption },
          ]);

          card.append(moveRow, field("Title", titleIn), field("Caption", capIn), imgField, shotI18n);
          stack.append(card);
        });
      };

      addBtn.addEventListener("click", () => {
        list.unshift({
          src: "/media/me.png",
          title: "New Photo",
          caption: "Caption for this photo.",
        });
        paint();
      });
      paint();
      box.append(stack, addBtn);
      return box;
    };

    const factsBox = createLinesEditor("Facts Window Lines (/facts)", draft.facts, (next) => {
      draft.facts = next;
    });
    const nuggetBox = createLinesEditor(
      "Nugget Assistant Lines (must include the word 'you' for tests)",
      draft.nuggetLines,
      (next) => {
        draft.nuggetLines = next;
      },
    );
    const factsI18n = createTranslationEditor(draft, () => [
      ...draft.facts.map((f, i) => ({ label: `Fact #${i + 1}`, text: f })),
      ...draft.nuggetLines.map((n, i) => ({ label: `Nugget #${i + 1}`, text: n })),
    ]);

    host.append(
      makeShotSection("My Pictures Gallery (/pictures)", draft.pictures),
      makeShotSection("Certificates Gallery (/awards)", draft.awards),
      factsBox,
      nuggetBox,
      factsI18n,
    );
  };

  // ============================================================================
  // TAB 7: ACCOUNT & BACKUP (Password, Export/Import JSON, Reset, Logout)
  // ============================================================================
  const buildAccountPanel = (host: HTMLElement) => {
    host.replaceChildren();

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
    const passStatus = el("p", "", "err");
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

    const backupBox = el("fieldset", undefined, "admin-fieldset");
    backupBox.append(el("legend", "CV & Portfolio Backup / Restore"));
    const backupTools = el("div", undefined, "editor-tools");
    const exportBtn = el("button", "Export CV JSON");
    exportBtn.type = "button";
    const importBtn = el("button", "Import CV JSON");
    importBtn.type = "button";
    const resetBtn = el("button", "Reset to built-in catalog");
    resetBtn.type = "button";
    const importInput = document.createElement("input");
    importInput.type = "file";
    importInput.accept = "application/json";
    importInput.hidden = true;
    const backupStatus = el("p", "", "meta");

    exportBtn.addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(draft, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pkn-portfolio-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });

    importBtn.addEventListener("click", () => importInput.click());
    importInput.addEventListener("change", () => {
      const file = importInput.files?.[0];
      importInput.value = "";
      if (!file) return;
      void (async () => {
        try {
          const text = await file.text();
          const parsed = JSON.parse(text) as unknown;
          if (!applyPortfolioData(parsed)) {
            backupStatus.textContent = "Invalid portfolio JSON file.";
            return;
          }
          draft = getPortfolioData();
          rebuildCvTabs();
          await savePortfolioNow();
          backupStatus.textContent = "Imported and saved!";
        } catch {
          backupStatus.textContent = "Could not parse JSON file.";
        }
      })();
    });

    let resetArmed = false;
    resetBtn.addEventListener("click", () => {
      void (async () => {
        if (!resetArmed) {
          resetArmed = true;
          resetBtn.textContent = "Confirm reset to defaults";
          return;
        }
        resetArmed = false;
        resetBtn.textContent = "Reset to built-in catalog";
        const res = await api("/api/portfolio", { method: "DELETE" });
        if (res.status === 204) {
          resetPortfolioData();
          draft = getPortfolioData();
          rebuildCvTabs();
          onPortfolioChange?.();
          backupStatus.textContent = "Restored default catalog.";
        }
      })();
    });

    backupTools.append(exportBtn, importBtn, resetBtn, importInput);
    backupBox.append(backupTools, backupStatus);

    const logout = document.createElement("button");
    logout.type = "button";
    logout.textContent = "logout";
    logout.addEventListener("click", () => {
      void (async () => {
        await api("/api/logout", { method: "POST" });
        go("/");
      })();
    });

    host.append(passForm, backupBox, logout);
  };

  const rebuildCvTabs = () => {
    buildProfilePanel(panels.profile);
    buildJobsPanel(panels.jobs);
    buildProjectsPanel(panels.projects);
    buildSkillsPanel(panels.skills);
    buildGalleriesPanel(panels.galleries);
  };

  await buildBlogPanel(panels.blog);
  rebuildCvTabs();
  buildAccountPanel(panels.account);

  root.append(
    headerBar,
    tabBar,
    cvSaveBar,
    panels.blog,
    panels.profile,
    panels.jobs,
    panels.projects,
    panels.skills,
    panels.galleries,
    panels.account,
  );
  switchTab(activeTab);
}
