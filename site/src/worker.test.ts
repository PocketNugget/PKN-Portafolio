import { describe, expect, it } from "vitest";
import { MemoryStore } from "./store";
import { handle, type Env } from "./worker";

function env(): Env {
  return {
    ASSETS: {
      async fetch(input) {
        const url =
          typeof input === "string"
            ? input
            : input instanceof URL
              ? input.href
              : input.url;
        if (url.endsWith("/index.html") || url.endsWith("/favicon.png")) {
          return new Response("ok", {
            status: 200,
            headers: { "content-type": "text/html; charset=utf-8" },
          });
        }
        return new Response("missing", { status: 404 });
      },
    },
  };
}

describe("worker", () => {
  it("sends document routes to index.html with security headers", async () => {
    const response = await handle(
      new Request("https://pocketnugget.com/work/htb-university-2025"),
      env(),
    );
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("ok");
    const csp = response.headers.get("content-security-policy") ?? "";
    expect(csp).toContain("default-src 'self'");
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).not.toContain("unsafe-inline");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
  });

  it("404s an unknown path and rejects other methods", async () => {
    const missing = await handle(new Request("https://pocketnugget.com/nope"), env());
    expect(missing.status).toBe(404);
    const posted = await handle(
      new Request("https://pocketnugget.com/", { method: "POST" }),
      env(),
    );
    expect(posted.status).toBe(405);
  });

  it("serves build.json and security.txt", async () => {
    const build = await handle(new Request("https://pocketnugget.com/build.json"), env(), {
      commit: "abc",
      built: "2026-10-14T00:00:00.000Z",
    });
    expect(await build.json()).toEqual({
      commit: "abc",
      built: "2026-10-14T00:00:00.000Z",
    });
    const txt = await handle(
      new Request("https://pocketnugget.com/.well-known/security.txt"),
      env(),
    );
    const body = await txt.text();
    expect(body).toContain("Contact: mailto:goben.ca.pkn@hotmail.com");
    expect(body).toContain("Expires: 2027-10-14T00:00:00.000Z");
    expect(txt.headers.get("referrer-policy")).toBe("strict-origin-when-cross-origin");
  });

  it("keeps asset urls on the asset handler and hides a store error", async () => {
    const pad = await handle(new Request("https://pocketnugget.com/pad/"), env());
    expect(pad.status).toBe(200);
    expect(await pad.text()).toBe("ok");
    const media = await handle(new Request("https://pocketnugget.com/media/me.png"), env());
    expect(media.status).toBe(404);
    expect(await media.text()).toBe("missing");
    expect(media.headers.get("content-security-policy")).toContain("default-src 'self'");

    const store = new MemoryStore();
    await store.insertPost({
      slug: "shift-note",
      title: "Shift",
      content: "hi",
      tags: "",
      created: 1,
      updated: 1,
    });
    const map = await handle(new Request("https://pocketnugget.com/sitemap.xml"), env(), undefined, store);
    expect(await map.text()).toContain("https://pocketnugget.com/blog/shift-note");

    store.listPosts = async () => {
      throw new Error("secret detail");
    };
    const quiet = await handle(new Request("https://pocketnugget.com/sitemap.xml"), env(), undefined, store);
    expect(quiet.status).toBe(200);
    expect(await quiet.text()).not.toContain("secret detail");

    store.ensure = async () => {
      throw new Error("secret detail");
    };
    const down = await handle(new Request("https://pocketnugget.com/api/blog"), env(), undefined, store);
    expect(down.status).toBe(500);
    expect(await down.text()).toBe("store unavailable\n");
  });
});
