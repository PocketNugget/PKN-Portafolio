import { scrubInvisible } from "./plain";

const TOKEN = /\[([^\]]+)\]\(([^)\s]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|\*([^*\s][^*]*)\*/g;
const OPEN = /^<(p|h2|h3|ul|ol|li|code|pre|blockquote|strong|em|hr)>$/;
const CLOSE = /^<\/(p|h2|h3|ul|ol|li|code|pre|blockquote|strong|em|a)>$/;
const IMAGE = /^<img src="([^"]*)" alt="([^"]*)" loading="lazy">$/;
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
    } else if (match[4] !== undefined) {
      parts.push(`<strong>${escapeHtml(match[4])}</strong>`);
    } else if (match[5] !== undefined) {
      parts.push(`<em>${escapeHtml(match[5])}</em>`);
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
    const image = IMAGE.exec(tag);
    if (image) {
      const src = image[1]?.replace(/&amp;/g, "&") ?? "";
      if (!src.startsWith("/") || !safeUrl(src)) throw new Error("rejected html");
      continue;
    }
    const anchor = ANCHOR.exec(tag);
    const href = anchor?.[1]?.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
    if (!anchor || !href || !safeUrl(href)) {
      throw new Error("rejected html");
    }
  }
  return html;
}

const BLOCK_START = /^(```|#{1,3} |> |[-*] |\d+\. |---+$|!\[)/;

export function renderNote(md: string): string {
  const lines = scrubInvisible(md)
    .trim()
    .split("\n")
    .map((line) => line.trimEnd());
  const html: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i] ?? "";
    if (line.trim() === "") {
      i += 1;
      continue;
    }
    if (line.startsWith("```")) {
      const code: string[] = [];
      i += 1;
      while (i < lines.length && !(lines[i] ?? "").startsWith("```")) {
        code.push(lines[i] ?? "");
        i += 1;
      }
      i += 1;
      html.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
      continue;
    }
    if (/^---+$/.test(line)) {
      html.push("<hr>");
      i += 1;
      continue;
    }
    const heading = /^(#{1,3}) (.*)$/.exec(line);
    if (heading) {
      const tag = heading[1] === "###" ? "h3" : "h2";
      html.push(`<${tag}>${inline((heading[2] ?? "").trim())}</${tag}>`);
      i += 1;
      continue;
    }
    const picture = /^!\[([^\]]*)\]\((\S+)\)$/.exec(line);
    if (picture && (picture[2] ?? "").startsWith("/") && safeUrl(picture[2] ?? "")) {
      html.push(`<img src="${escapeAttr(picture[2] ?? "")}" alt="${escapeAttr(picture[1] ?? "")}" loading="lazy">`);
      i += 1;
      continue;
    }
    if (line.startsWith("> ")) {
      const quote: string[] = [];
      while (i < lines.length && (lines[i] ?? "").startsWith("> ")) {
        quote.push((lines[i] ?? "").slice(2));
        i += 1;
      }
      html.push(`<blockquote><p>${inline(quote.join(" "))}</p></blockquote>`);
      continue;
    }
    const bullet = /^[-*] /;
    const numbered = /^\d+\. /;
    if (bullet.test(line) || numbered.test(line)) {
      const ordered = numbered.test(line);
      const kind = ordered ? numbered : bullet;
      const items: string[] = [];
      while (i < lines.length && kind.test(lines[i] ?? "")) {
        items.push(`<li>${inline((lines[i] ?? "").replace(kind, "").trim())}</li>`);
        i += 1;
      }
      const tag = ordered ? "ol" : "ul";
      html.push(`<${tag}>${items.join("")}</${tag}>`);
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && (lines[i] ?? "").trim() !== "" && (para.length === 0 || !BLOCK_START.test(lines[i] ?? ""))) {
      para.push((lines[i] ?? "").trim());
      i += 1;
    }
    html.push(`<p>${inline(para.join(" "))}</p>`);
  }
  if (html.length === 0) html.push("<p></p>");
  return assertSafeHtml(html.join(""));
}
