// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";
import { hydrate, setNavigator } from "./client";
import { mountPad, paintNotes } from "./desktop/pad";
import { phoneLayout } from "./desktop/phone";
import { resetPortfolioData } from "./portfolio";

const CREATED = "2026-10-14T12:00:00.000Z";

async function flush(): Promise<void> {
  for (let i = 0; i < 30; i += 1) await Promise.resolve();
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});

describe("phone", () => {
  it("follows the narrow-screen query", () => {
    const original = window.matchMedia;
    const media = (matches: boolean): typeof window.matchMedia =>
      (() => ({
        matches,
        media: "",
        onchange: null,
        addListener() {},
        removeListener() {},
        addEventListener() {},
        removeEventListener() {},
        dispatchEvent() {
          return false;
        },
      })) as unknown as typeof window.matchMedia;
    window.matchMedia = media(true);
    expect(phoneLayout()).toBe(true);
    window.matchMedia = media(false);
    expect(phoneLayout()).toBe(false);
    window.matchMedia = original;
  });
});

describe("notepad", () => {
  it("paints a note as text", () => {
    const list = document.createElement("div");
    paintNotes(list, []);
    expect(list.textContent).toBe("No suggestions yet.");
    paintNotes(list, [
      {
        id: 1,
        name: "Ada",
        body: "hello <img src=x onerror=alert(1)>",
        created: CREATED,
      },
    ]);
    expect(list.querySelector(".notepad-body")?.textContent).toBe("hello <img src=x onerror=alert(1)>");
    expect(list.querySelectorAll("img")).toHaveLength(0);
    expect(list.querySelectorAll("script")).toHaveLength(0);
  });

  it("refuses markup before the browser sends it", async () => {
    const calls: string[] = [];
    vi.stubGlobal("fetch", async (input: RequestInfo | URL, init?: RequestInit) => {
      calls.push(`${init?.method ?? "GET"} ${String(input)}`);
      return json({ notes: [] });
    });
    const host = document.createElement("div");
    document.body.append(host);
    mountPad(host);
    await flush();
    const name = host.querySelector<HTMLInputElement>('input[aria-label="Name"]');
    const body = host.querySelector<HTMLTextAreaElement>("textarea");
    const button = host.querySelector<HTMLButtonElement>('button[type="submit"]');
    expect(name && body && button).toBeTruthy();
    expect(button?.textContent).toBe("Leave some feedback!!");
    expect(host.textContent).toContain("Feedback box for this site");
    name!.value = "Ada";
    body!.value = "hello <script>alert(1)</script>";
    host.querySelector("form")!.requestSubmit(button!);
    await flush();
    expect(host.querySelector(".err")?.textContent).toBe("The suggestion did not save.");
    expect(host.querySelector(".notepad-sheet")?.textContent).toBe("No suggestions yet.");
    expect(host.querySelectorAll("script")).toHaveLength(0);
    expect(host.querySelectorAll("img")).toHaveLength(0);
    expect(calls.some((call) => call.startsWith("POST"))).toBe(false);
  });
});

describe("answers that are not JSON", () => {
  it("says the store did not answer instead of throwing", async () => {
    const html = () => new Response("<!doctype html><title>x</title>", { status: 200, headers: { "content-type": "text/html" } });
    vi.stubGlobal("fetch", async () => html());
    const scope = document.createElement("div");
    const root = document.createElement("div");
    root.id = "dynamic";
    scope.append(root);
    hydrate("/blog", scope);
    await flush();
    expect(root.textContent).toContain("the blog store did not answer.");
    root.replaceChildren();
    hydrate("/blog/shift-note", scope);
    await flush();
    expect(root.textContent).toContain("no such post.");
    const host = document.createElement("div");
    document.body.append(host);
    mountPad(host);
    await flush();
    expect(host.textContent).toContain("The suggestions did not load.");
  });
});

describe("blog client", () => {
  it("skips a poisoned list row and escapes a post body", async () => {
    vi.stubGlobal("fetch", async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "/api/blog") {
        return json({
          posts: [
            { slug: "shift-note", title: "Shift note", tags: "soc", created: CREATED },
            { slug: "bad<script>", title: "Nope", tags: "soc", created: CREATED },
            { slug: "marked", title: "hello <script>", tags: "soc", created: CREATED },
            { slug: "tagged", title: "Tagged", tags: "<script>", created: CREATED },
            { slug: "dated", title: "Dated", tags: "", created: "2026-10-14<script>" },
            { slug: "blank", title: "Blank", tags: "", created: "not-a-date" },
          ],
        });
      }
      if (url === "/api/blog/shift-note") {
        return json({
          slug: "shift-note",
          title: "Shift <script>",
          tags: "soc",
          created: CREATED,
          content: "hello <script>alert(1)</script>\n\nsee [x](javascript:alert(1))\n\n- item",
        });
      }
      return new Response("no", { status: 404 });
    });

    const scope = document.createElement("div");
    const root = document.createElement("div");
    root.id = "dynamic";
    scope.append(root);
    hydrate("/blog", scope);
    await flush();
    const titles = [...root.querySelectorAll(".blog-card strong")].map((node) => node.textContent);
    expect(titles).toEqual(["Shift note", "Dated", "Blank"]);
    expect(root.textContent).toContain("2026-10-14");
    expect(root.textContent).not.toContain("not-a-date");
    expect(root.querySelectorAll(".blog-card")).toHaveLength(3);
    expect(root.querySelector(".blog-new")?.textContent).toBe("New");
    expect(root.querySelector(".blog-head h2")?.textContent).toBe("Blog");
    expect(root.textContent).not.toContain("<script>");
    expect(root.querySelectorAll("script")).toHaveLength(0);

    root.replaceChildren();
    hydrate("/blog/<script>", scope);
    await flush();
    expect(root.textContent).toContain("no such post.");
    expect(root.querySelector("script")).toBeNull();

    root.replaceChildren();
    hydrate("/blog/shift-note", scope);
    await flush();
    expect(root.querySelector("h2")?.textContent).toBe("post");
    expect(root.querySelectorAll("script")).toHaveLength(0);
    expect(root.querySelectorAll("a:not(.blog-back)")).toHaveLength(0);
    expect(root.querySelector("ul")).not.toBeNull();
    expect(root.innerHTML).toContain("&lt;script&gt;");
    expect(root.innerHTML).not.toContain("javascript:");
  });

  it("previews markdown as safe html and deletes a note on the second click", async () => {
    const calls: string[] = [];
    const visited: string[] = [];
    setNavigator((path) => {
      visited.push(path);
    });
    vi.stubGlobal("fetch", async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method ?? "GET";
      calls.push(`${method} ${url}`);
      if (url === "/api/session") return json({ user: "goben<img src=x onerror=alert(1)>" });
      if (url === "/api/blog") {
        return json({
          posts: [{ slug: "shift-note", title: "<script>", tags: "", created: CREATED }],
        });
      }
      if (url === "/api/comments" && method === "GET") {
        return json({
          notes: [
            { id: 1, name: "Ada", body: "hello there", created: CREATED },
            { id: 2, name: "Ada", body: "<img src=x onerror=alert(1)>", created: CREATED },
          ],
        });
      }
      if (url === "/api/comments/1" && method === "DELETE") return new Response(null, { status: 204 });
      return new Response("no", { status: 404 });
    });

    const scope = document.createElement("div");
    const root = document.createElement("div");
    root.id = "dynamic";
    scope.append(root);
    hydrate("/admin", scope);
    await flush();
    expect(root.querySelectorAll("img")).toHaveLength(0);
    expect(root.querySelectorAll("script")).toHaveLength(0);
    expect([...root.querySelectorAll("h2")].map((node) => node.textContent)).toContain("Suggestions");
    expect(root.textContent).not.toContain("Notepad");
    expect(root.textContent).toContain("goben<img src=x onerror=alert(1)>");
    expect(root.querySelector("a")?.textContent).toBe("<script>");

    const markdown = root.querySelector<HTMLTextAreaElement>('textarea[aria-label="Markdown"]');
    const preview = [...root.querySelectorAll("button")].find((button) => button.textContent === "preview");
    markdown!.value = "hello <svg/onload=alert(1)>";
    preview!.click();
    expect(root.querySelector(".note")?.textContent).toContain("hello");
    expect(root.querySelector(".note svg")).toBeNull();
    expect(root.querySelectorAll("script")).toHaveLength(0);

    const remove = root.querySelector<HTMLButtonElement>(".notepad button");
    expect(remove?.textContent).toBe("delete");
    expect(root.querySelector(".notepad-body")?.textContent).toBe("hello there");
    remove!.click();
    await flush();
    expect(remove!.textContent).toBe("delete, again");
    expect(calls.some((call) => call.startsWith("DELETE"))).toBe(false);
    remove!.click();
    await flush();
    expect(calls).toContain("DELETE /api/comments/1");
    expect(root.querySelector(".notepad-line")).toBeNull();
    expect(visited).toEqual([]);
  });

  it("renders the CV & experience tabs in admin, adds a job, and saves to /api/portfolio", async () => {
    const calls: string[] = [];
    vi.stubGlobal("fetch", async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method ?? "GET";
      calls.push(`${method} ${url}`);
      if (url === "/api/session") return json({ user: "goben" });
      if (url === "/api/portfolio" && method === "GET") return json({ state: null, updated: null });
      if (url === "/api/portfolio" && method === "PUT") return new Response(null, { status: 204 });
      if (url === "/api/blog") return json({ posts: [] });
      if (url === "/api/comments") return json({ notes: [] });
      if (url === "/api/contact") return json({ messages: [] });
      return new Response("no", { status: 404 });
    });

    try {
      const scope = document.createElement("div");
      const root = document.createElement("div");
      root.id = "dynamic";
      scope.append(root);
      hydrate("/admin", scope);
      await flush();

      const tabButtons = [...root.querySelectorAll<HTMLButtonElement>(".admin-tabs button")].map((b) => b.textContent);
      expect(tabButtons).toEqual([
        "Blog & Inbox",
        "Profile & Hero",
        "Experience (Jobs)",
        "Projects",
        "Skills & Courses",
        "Galleries & Nugget",
        "Account & Backup",
      ]);

      const toolLabels = [...root.querySelectorAll<HTMLButtonElement>(".editor-tools button")].map((b) => b.textContent);
      expect(toolLabels).toContain("upload image");
      expect(toolLabels).toContain("media library");

      const jobsTab = root.querySelector<HTMLButtonElement>('button[data-tab="jobs"]');
      jobsTab!.click();
      const addJobBtn = [...root.querySelectorAll<HTMLButtonElement>("button")].find(
        (b) => b.textContent === "+ Add new job / experience",
      );
      expect(addJobBtn).toBeTruthy();
      addJobBtn!.click();

      const saveCvBtn = [...root.querySelectorAll<HTMLButtonElement>(".admin-save-bar button")].find(
        (b) => b.textContent === "Save CV & Experience changes",
      );
      expect(saveCvBtn).toBeTruthy();
      saveCvBtn!.click();
      await flush();

      expect(calls).toContain("PUT /api/portfolio");
      expect(root.querySelector(".admin-save-bar")?.textContent).toContain("Saved!");
    } finally {
      resetPortfolioData();
    }
  });
});
