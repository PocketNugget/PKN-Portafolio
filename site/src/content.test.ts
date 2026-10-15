import { describe, expect, it } from "vitest";
import models from "../content/notes/model-files.md?raw";
import { jobs, projects, validateCatalog } from "./catalog";
import { assertSafeHtml, renderNote, renderedNotes } from "./notes";
import { sitemapXml } from "./paths";
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

  it("keeps the LinkedIn dates and leaves Apple undated", () => {
    expect(jobs.find((job) => job.id === "tbsek")?.date).toBe("July 2026 to present");
    expect(jobs.find((job) => job.id === "tbsek-jr")?.date).toBe("April 2025 to July 2026");
    expect(jobs.find((job) => job.id === "stem")?.date).toBe("February 2024 to June 2026");
    const apple = jobs.find((job) => job.id === "apple");
    expect(apple?.body.join(" ")).toContain("Cultural Vistas");
    expect(apple?.date).not.toMatch(/\d{4}/);
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
  });
});

describe("pages", () => {
  it("home matches the record and skips the stale claims", () => {
    const html = render("/");
    expect(html).toContain("9.0/10");
    expect(html).toContain("April 2025");
    expect(html).toContain("July 2026 to present");
    expect(html).toContain("Cultural Vistas");
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
  });

  it("lists every document path in the sitemap", () => {
    const xml = sitemapXml();
    expect(xml).toContain("https://pocketnugget.xyz/work/sdr");
    expect(xml).toContain("https://pocketnugget.xyz/notes/model-files");
    expect(xml).toContain("https://pocketnugget.xyz/blog");
    expect(xml).toContain("https://pocketnugget.xyz/links");
    expect(xml).not.toContain("/admin");
    expect(xml).not.toContain("—");
  });
});

describe("source notes on disk", () => {
  it("keeps the model-file note free of a reproduction", () => {
    expect(models).toContain("SafeTensors");
    expect(models.toLowerCase()).not.toContain("import pickle");
    expect(models).not.toContain("torch.load");
  });
});
