import { scrubInvisible } from "./plain";

const TOKEN = /\[([^\]]+)\]\(([^)\s]+)\)|`([^`]+)`/g;
const OPEN = /^<(p|h2|ul|li|code)>$/;
const CLOSE = /^<\/(p|h2|ul|li|code|a)>$/;
const ANCHOR = /^<a href="([^"]*)"(?: rel="noreferrer noopener")?>$/;

export function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function escapeAttr(value: string): string {
  return escapeHtml(value).replace(/'/g, "&#39;");
}

export function safeUrl(href: string): boolean {
  if (href.length === 0 || href.length > 300 || href !== href.trim()) return false;
  if (/[\u0000-\u001F\u007F\s<>"'\\]/.test(href)) return false;
  if (href.startsWith("//")) return false;
  let url: URL;
  try {
    url = new URL(href, "https://pocketnugget.xyz");
  } catch {
    return false;
  }
  if (url.username || url.password) return false;
  if (href.startsWith("/")) {
    return url.origin === "https://pocketnugget.xyz" && /^\/[A-Za-z0-9._~/-]*$/.test(href) && !href.includes("..");
  }
  if (url.protocol === "http:" || url.protocol === "https:") return /^https?:\/\//i.test(href);
  if (url.protocol === "mailto:") return /^mailto:[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(href);
  return false;
}

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
      if (safeUrl(href)) {
        const rel = href.startsWith("/") ? "" : ' rel="noreferrer noopener"';
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
  let rest = html;
  while (rest.length > 0) {
    if (rest[0] !== "<") {
      const end = rest.indexOf("<");
      const text = end === -1 ? rest : rest.slice(0, end);
      if (/[<>]/.test(text)) throw new Error("rejected html");
      rest = end === -1 ? "" : rest.slice(end);
      continue;
    }
    const end = rest.indexOf(">");
    if (end === -1) throw new Error("rejected html");
    const tag = rest.slice(0, end + 1);
    rest = rest.slice(end + 1);
    if (OPEN.test(tag) || CLOSE.test(tag)) continue;
    const anchor = ANCHOR.exec(tag);
    const href = anchor?.[1]?.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
    if (!anchor || !href || !safeUrl(href)) {
      throw new Error("rejected html");
    }
  }
  return html;
}

export function renderNote(md: string): string {
  const blocks = scrubInvisible(md).trim().split(/\n{2,}/);
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
