import { describe, expect, it } from "vitest";
import { allDocumentPaths, isDocumentPath, normalizePath, sitemapXml } from "./paths";

describe("paths", () => {
  it("strips a query and a trailing slash", () => {
    expect(normalizePath("/jobs/")).toBe("/jobs");
    expect(normalizePath("/jobs?x=1#y")).toBe("/jobs");
    expect(normalizePath("jobs")).toBe("/");
    expect(normalizePath("/")).toBe("/");
  });

  it("treats desktop tools as pages and keeps them out of the sitemap", () => {
    expect(isDocumentPath("/pad/")).toBe(true);
    expect(isDocumentPath("/blog/shift-note")).toBe(true);
    expect(isDocumentPath("/blog/Shift")).toBe(false);
    expect(isDocumentPath("/blog/../admin")).toBe(false);
    expect(isDocumentPath("/work/no-such-project")).toBe(false);
    expect(isDocumentPath("/notes/model-files")).toBe(true);
    expect(isDocumentPath("/admin")).toBe(true);
    const xml = sitemapXml();
    expect(xml.startsWith("<?xml")).toBe(true);
    expect(xml).toContain("https://pocketnugget.xyz/notes/model-files");
    for (const path of allDocumentPaths()) {
      expect(xml).toContain(`https://pocketnugget.xyz${path}</loc>`);
      expect(path.startsWith("/admin")).toBe(false);
    }
    expect(xml).not.toContain("/admin");
    expect(xml).not.toContain("/pad</loc>");
  });

  it("escapes a poisoned extra path", () => {
    const xml = sitemapXml("https://pocketnugget.xyz", ["/blog/<script>"]);
    expect(xml).toContain("/blog/&lt;script&gt;");
    expect(xml).not.toContain("<script>");
    expect(sitemapXml("https://pocketnugget.xyz", ['/blog/a&b"c'])).toContain("/blog/a&amp;b&quot;c");
  });
});
