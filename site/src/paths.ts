import { notes, projects } from "./catalog.ts";

const PAGES = new Set([
  "/",
  "/help",
  "/jobs",
  "/work",
  "/notes",
  "/radio",
  "/certs",
  "/contact",
  "/colophon",
  "/blog",
  "/links",
]);

export function normalizePath(pathname: string): string {
  const bare = pathname.split(/[?#]/)[0] ?? "/";
  if (!bare.startsWith("/")) return "/";
  if (bare.length > 1 && bare.endsWith("/")) return bare.slice(0, -1);
  return bare;
}

export function isDocumentPath(pathname: string): boolean {
  const path = normalizePath(pathname);
  if (PAGES.has(path) || path === "/admin" || path === "/admin/login") return true;
  if (
    path === "/terminal" ||
    path === "/skills" ||
    path === "/display" ||
    path === "/player" ||
    path === "/pictures" ||
    path === "/awards" ||
    path === "/convert" ||
    path === "/facts" ||
    path === "/hack" ||
    path === "/buddy" ||
    path === "/run" ||
    path === "/find" ||
    path === "/pad"
  ) {
    return true;
  }
  if (/^\/blog\/[a-z0-9-]+$/.test(path)) return true;
  const work = /^\/work\/([a-z0-9-]+)$/.exec(path);
  if (work && projects.some((project) => project.slug === work[1])) return true;
  const note = /^\/notes\/([a-z0-9-]+)$/.exec(path);
  if (note && notes.some((item) => item.slug === note[1])) return true;
  return false;
}

export function allDocumentPaths(): string[] {
  return [
    ...PAGES,
    ...projects.map((project) => `/work/${project.slug}`),
    ...notes.map((note) => `/notes/${note.slug}`),
  ];
}

export function sitemapXml(origin = "https://pocketnugget.xyz", extra: string[] = []): string {
  const body = [...allDocumentPaths(), ...extra]
    .map((path) => `  <url><loc>${origin}${path}</loc></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}
