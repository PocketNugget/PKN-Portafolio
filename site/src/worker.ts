import { decodeBase64Bytes, handleApi, type AuthConfig } from "./api";
import { buildInfo } from "./build-info";
import { allDocumentPaths, isDocumentPath, normalizePath, sitemapXml } from "./paths";
import { cleanPortfolioData } from "./portfolio";
import { SECURITY_TXT, withSecurity } from "./security";
import { D1Store, type D1Like, type Store } from "./store";

export interface Env {
  ASSETS: {
    fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
  };
  DB?: D1Like;
  ADMIN_USER?: string;
  ADMIN_PASSWORD_HASH?: string;
  ADMIN_TOTP_KEY?: string;
}

function authOf(env: Env): AuthConfig {
  return { user: env.ADMIN_USER ?? "", hash: env.ADMIN_PASSWORD_HASH ?? "", totpKey: env.ADMIN_TOTP_KEY ?? "" };
}

export async function handle(
  request: Request,
  env: Env,
  info: { commit: string; built: string } = buildInfo,
  store?: Store,
): Promise<Response> {
  const url = new URL(request.url);
  const db = store ?? (env.DB ? new D1Store(env.DB) : undefined);
  if (url.pathname === "/sitemap.xml" && (request.method === "GET" || request.method === "HEAD")) {
    let extra: string[] = [];
    if (db) {
      try {
        await db.ensure();
        extra = (await db.listPosts()).map((post) => `/blog/${post.slug}`);
        const saved = await db.getPortfolioState();
        if (saved?.data) {
          const parsed = cleanPortfolioData(JSON.parse(saved.data));
          const known = new Set(allDocumentPaths());
          for (const project of parsed?.projects ?? []) {
            const p = `/work/${project.slug}`;
            if (!known.has(p)) extra.push(p);
          }
        }
      } catch {
        extra = [];
      }
    }
    return withSecurity(
      new Response(sitemapXml(url.origin, extra), {
        headers: { "content-type": "application/xml; charset=utf-8" },
      }),
    );
  }
  if (url.pathname.startsWith("/api/")) {
    if (!db) {
      return withSecurity(
        new Response("store unavailable\n", {
          status: 503,
          headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
        }),
      );
    }
    try {
      await db.ensure();
      return withSecurity(await handleApi(request, db, authOf(env)));
    } catch {
      return withSecurity(
        new Response("store unavailable\n", {
          status: 500,
          headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
        }),
      );
    }
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    return withSecurity(
      new Response("method not allowed\n", {
        status: 405,
        headers: { "content-type": "text/plain; charset=utf-8" },
      }),
    );
  }
  if (url.pathname === "/build.json") {
    return withSecurity(
      Response.json(info, {
        headers: { "content-type": "application/json; charset=utf-8" },
      }),
    );
  }
  if (url.pathname === "/.well-known/security.txt") {
    return withSecurity(
      new Response(SECURITY_TXT, {
        headers: { "content-type": "text/plain; charset=utf-8" },
      }),
    );
  }
  const mediaMatch = /^\/media\/([A-Za-z0-9._-]+)$/.exec(url.pathname);
  if (mediaMatch && db) {
    try {
      await db.ensure();
      const row = await db.getMedia(mediaMatch[1]);
      if (row) {
        const bytes = decodeBase64Bytes(row.data);
        if (bytes) {
          return withSecurity(
            new Response(request.method === "HEAD" ? null : bytes as unknown as BodyInit, {
              status: 200,
              headers: {
                "content-type": row.mime,
                "cache-control": "public, max-age=31536000, immutable",
              },
            }),
            url.pathname,
          );
        }
      }
    } catch {
      /* fall through to static assets */
    }
  }
  let docOk = isDocumentPath(url.pathname);
  if (!docOk && db) {
    const workMatch = /^\/work\/([a-z0-9-]+)$/.exec(normalizePath(url.pathname));
    if (workMatch) {
      try {
        await db.ensure();
        const saved = await db.getPortfolioState();
        if (saved?.data) {
          const parsed = cleanPortfolioData(JSON.parse(saved.data));
          if (parsed?.projects.some((p) => p.slug === workMatch[1])) docOk = true;
        }
      } catch {
        docOk = false;
      }
    }
  }
  if (docOk) {
    const index = new URL("/index.html", url.origin);
    const response = await env.ASSETS.fetch(
      new Request(index.toString(), { method: request.method }),
    );
    return withSecurity(response);
  }
  return withSecurity(await env.ASSETS.fetch(request), url.pathname);
}

export default {
  fetch(request: Request, env: Env): Promise<Response> {
    return handle(request, env);
  },
};
