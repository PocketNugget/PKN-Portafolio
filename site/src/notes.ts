import jingle from "../content/notes/jingle-trouble.md?raw";
import models from "../content/notes/model-files.md?raw";
import { notes, type NoteMeta } from "./catalog";

const files: Record<string, string> = {
  "jingle-trouble.md": jingle,
  "model-files.md": models,
};

export function noteSource(meta: NoteMeta): string {
  const src = files[meta.file];
  if (!src) throw new Error(`missing note file ${meta.file}`);
  return src;
}

export function noteBySlug(slug: string): NoteMeta | undefined {
  return notes.find((note) => note.slug === slug);
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(value: string): string {
  return escapeHtml(value).replace(/'/g, "&#39;");
}

const TOKEN = /\[([^\]]+)\]\(([^)\s]+)\)|`([^`]+)`/g;

function inline(text: string): string {
  const parts: string[] = [];
  let last = 0;
  for (const match of text.matchAll(TOKEN)) {
    const index = match.index ?? 0;
    parts.push(escapeHtml(text.slice(last, index)));
    if (match[3] !== undefined) {
      parts.push(`<code>${escapeHtml(match[3])}</code>`);
    } else {
      const label = escapeHtml(match[1]);
      const href = match[2];
      if (/^(https?:\/\/|mailto:|\/)/.test(href)) {
        const rel = href.startsWith("/") ? "" : ' rel="noreferrer"';
        parts.push(`<a href="${escapeAttr(href)}"${rel}>${label}</a>`);
      } else {
        parts.push(label);
      }
    }
    last = index + match[0].length;
  }
  parts.push(escapeHtml(text.slice(last)));
  return parts.join("");
}

export function assertSafeHtml(html: string): string {
  if (/<\s*script/i.test(html) || /\son\w+\s*=/i.test(html) || /javascript\s*:/i.test(html)) {
    throw new Error("rejected html");
  }
  return html;
}

export function renderNote(md: string): string {
  const blocks = md.replace(/\r\n/g, "\n").trim().split(/\n{2,}/);
  const html: string[] = [];
  for (const block of blocks) {
    const lines = block.split("\n").map((line) => line.trimEnd());
    if (lines.every((line) => line.startsWith("- "))) {
      const items = lines.map((line) => `<li>${inline(line.slice(2).trim())}</li>`).join("");
      html.push(`<ul>${items}</ul>`);
      continue;
    }
    const first = lines[0] ?? "";
    if (first.startsWith("## ")) {
      html.push(`<h2>${inline(first.slice(3))}</h2>`);
      continue;
    }
    if (first.startsWith("# ")) {
      html.push(`<h2>${inline(first.slice(2))}</h2>`);
      continue;
    }
    html.push(`<p>${inline(lines.join(" "))}</p>`);
  }
  return assertSafeHtml(html.join(""));
}

export function renderedNotes(): { slug: string; html: string }[] {
  return notes.map((note) => ({
    slug: note.slug,
    html: renderNote(noteSource(note)),
  }));
}
