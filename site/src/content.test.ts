import { describe, expect, it } from "vitest";
import models from "../content/notes/model-files.md?raw";
import { jobs, projects, validateCatalog } from "./catalog";
import { assertSafeHtml, renderNote, renderedNotes } from "./notes";
import { isDocumentPath, sitemapXml } from "./paths";
import { render } from "./render";

describe("catalog", () => {
  it("accepts the shipped record", () => {
    expect(() => validateCatalog()).not.toThrow();
  });

  it("rejects a project with an empty date", () => {
    const saved = projects[0].date;
    projects[0].date = "  ";
    expect(() => validateCatalog()).toThrow(/no date/);
    projects[0].date = saved;
  });

  it("keeps the LinkedIn dates and does not list an Apple job", () => {
    expect(jobs.find((job) => job.id === "tbsek")?.date).toBe("July 2026 to present");
    expect(jobs.find((job) => job.id === "tbsek-jr")?.date).toBe("April 2025 to July 2026");
    expect(jobs.find((job) => job.id === "stem")?.date).toBe("February 2024 to June 2026");
    expect(jobs.some((job) => job.id === "apple" || job.org === "Apple")).toBe(false);
  });
});

describe("notes", () => {
  it("renders both notes without script or handlers", () => {
    for (const note of renderedNotes()) {
      expect(note.html).not.toMatch(/<\s*script/i);
      expect(note.html).not.toMatch(/\son\w+\s*=/i);
      expect(note.html.length).toBeGreaterThan(40);
    }
  });

  it("escapes raw html instead of executing it", () => {
    const html = renderNote("hello <script>alert(1)</script> `ok`");
    expect(html).not.toMatch(/<script/i);
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("<code>ok</code>");
  });

  it("rejects a handler that got past the renderer", () => {
    expect(() => assertSafeHtml('<a href="/" onclick="x">t</a>')).toThrow(/rejected/);
    expect(() => assertSafeHtml("<iframe src=https://example.com></iframe>")).toThrow(/rejected/);
    expect(() => assertSafeHtml("<svg/onload=alert(1)>")).toThrow(/rejected/);
  });

  it("drops script urls and escapes raw tags", () => {
    const scriptLink = renderNote("see [x](javascript:alert(1))");
    expect(scriptLink).not.toContain("javascript");
    expect(scriptLink).not.toContain("<a");
    expect(renderNote("see [x](//evil.example)")).toBe("<p>see x</p>");
    expect(renderNote("see [x](data:text/html,hi)")).toBe("<p>see x</p>");
    const linked = renderNote("see [x](https://example.com/a)");
    expect(linked).toContain('href="https://example.com/a"');
    expect(linked).toContain('rel="noreferrer noopener"');
    expect(renderNote("hello <svg/onload=alert(1)>")).not.toContain("<svg");
    expect(renderNote("# <script>alert(1)</script>")).toContain("&lt;script&gt;");
  });
});

describe("pages", () => {
  it("home matches the record and skips the stale claims", () => {
    const html = render("/");
    expect(html).toContain("9.0/10");
    expect(html).toContain("April 2025");
    expect(html).toContain("July 2026 to present");
    expect(html).not.toContain("Cultural Vistas");
    expect(html).not.toContain("J-1");
    expect(html).toContain("52 of 1,014");
    expect(html).toContain("34,125");
    expect(html).not.toContain("40%");
    expect(html).not.toContain("May to July 2026");
    expect(html).not.toContain("expected May 2026");
    expect(html).not.toContain("—");
  });

  it("puts the corrected jobs, certs, and links on their pages", () => {
    const jobsHtml = render("/jobs");
    expect(jobsHtml).toContain("February 2024 to June 2026");
    expect(jobsHtml).toContain("Angular");
    expect(jobsHtml).toContain("MySQL");
    expect(jobsHtml).not.toContain("40%");
    const certs = render("/certs");
    expect(certs).toContain("2021 to 2025");
    expect(certs).toContain("Metasploit Framework");
    expect(certs).toContain("macOS Fundamentals");
    const links = render("/links");
    expect(links).toContain("https://www.instagram.com/pocket_nugget/");
    expect(links).toContain("https://www.youtube.com/@Nuggz_TV");
    expect(links).not.toContain("222");
    const hackztecs = render("/work/hackztecs");
    expect(hackztecs).toContain("February 2024 to present");
    expect(hackztecs).toContain("CREATE-V");
    expect(hackztecs).toContain("May 2025");
    const skills = render("/skills");
    expect(skills).toContain("Splunk");
    expect(skills).toContain("read the diff");
    expect(skills.toLowerCase()).not.toContain("cylance");
  });

  it("lists every document path in the sitemap", () => {
    const xml = sitemapXml();
    expect(xml).toContain("https://pocketnugget.xyz/work/sdr");
    expect(xml).toContain("https://pocketnugget.xyz/notes/model-files");
    expect(xml).toContain("https://pocketnugget.xyz/blog");
    expect(xml).toContain("https://pocketnugget.xyz/links");
    expect(xml).not.toContain("/admin");
    expect(xml).not.toContain("/terminal");
    expect(xml).not.toContain("/skills");
    expect(xml).not.toContain("/display");
    expect(xml).not.toContain("—");
    expect(isDocumentPath("/terminal")).toBe(true);
    expect(isDocumentPath("/skills")).toBe(true);
    expect(isDocumentPath("/display")).toBe(true);
    for (const path of ["/player", "/pictures", "/awards", "/convert", "/facts", "/hack", "/buddy", "/run", "/find", "/pad"]) {
      expect(isDocumentPath(path)).toBe(true);
      expect(xml).not.toContain(`https://pocketnugget.xyz${path}</loc>`);
    }
  });
});

describe("source notes on disk", () => {
  it("keeps the model-file note free of a reproduction", () => {
    expect(models).toContain("SafeTensors");
    expect(models.toLowerCase()).not.toContain("import pickle");
    expect(models).not.toContain("torch.load");
  });
});
