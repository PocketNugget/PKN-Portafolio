// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";
import { hydrate, setNavigator } from "./client";
import { mountPad, paintNotes } from "./desktop/pad";
import { phoneLayout } from "./desktop/phone";

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
    expect(list.textContent).toBe("The pad is empty.");
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
    name!.value = "Ada";
    body!.value = "hello <script>alert(1)</script>";
    host.querySelector("form")!.requestSubmit(button!);
    await flush();
    expect(host.querySelector(".err")?.textContent).toBe("The pad did not save that.");
    expect(host.querySelector(".notepad-sheet")?.textContent).toBe("The pad is empty.");
    expect(host.querySelectorAll("script")).toHaveLength(0);
    expect(host.querySelectorAll("img")).toHaveLength(0);
    expect(calls.some((call) => call.startsWith("POST"))).toBe(false);
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
    const titles = [...root.querySelectorAll("a")].map((anchor) => anchor.textContent);
    expect(titles).toEqual(["Shift note", "Dated", "Blank"]);
    expect(root.textContent).toContain("2026-10-14");
    expect(root.textContent).not.toContain("not-a-date");
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
    expect(root.querySelectorAll("a")).toHaveLength(0);
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
});
