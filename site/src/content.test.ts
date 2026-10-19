import { describe, expect, it } from "vitest";
import models from "../content/notes/model-files.md?raw";
import { hero, jobs, openTable, projects, validateCatalog } from "./catalog";
import { safeUrl } from "./markup";
import { assertSafeHtml, escapeHtml, renderNote, renderedNotes } from "./notes";
import { allDocumentPaths, isDocumentPath, sitemapXml } from "./paths";
import { commandFor, documentBody, render } from "./render";

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
    for (const href of Object.values(openTable())) expect(safeUrl(href)).toBe(true);
  });

  it("drops an unsafe project link and image", () => {
    const project = projects[0];
    const links = project.links;
    const image = project.image;
    project.links = [
      { label: "Click", href: "javascript:alert(1)" },
      { label: "User", href: "https://user:pass@evil.example/a" },
      { label: "Slash", href: "//evil.example" },
    ];
    project.image = "/media/../secret.png";
    try {
      const html = render(`/work/${project.slug}`);
      expect(html).toContain("Click");
      expect(html).toContain("User");
      expect(html).toContain("Slash");
      expect(html).not.toContain("javascript:");
      expect(html).not.toContain("secret.png");
      expect(html).not.toContain('href="https://user:pass@evil.example/a"');
      expect(html).toContain('<p class="links">Click User Slash</p>');
      expect(html).not.toMatch(/<script/i);
    } finally {
      project.links = links;
      project.image = image;
    }
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
    expect(html).toContain("about-go");
    expect(html).toContain('href="/jobs"');
    expect(html).toContain('href="/skills"');
    expect(html).toContain('href="/contact"');
    expect([...html.matchAll(/class="about-go" href="[^"]+" data-cmd="([^"]+)"/g)].map((match) => match[1])).toEqual([
      "jobs",
      "projects",
      "skills",
      "certs",
      "contact",
      "awards",
      "writeups",
      "pictures",
      "radio",
    ]);
    expect(documentBody("/hack")).toContain("hack-mount");
    expect(html).toContain("9.0/10");
    expect(html).toContain("April 2025");
    expect(html).toContain("July 2026 to present");
    expect(html).not.toContain("Cultural Vistas");
    expect(html).not.toContain("J-1");
    expect(html).toContain("52 of 1,014");
    expect(html).toContain("34,125");
    expect(html).toContain('class="hero"');
    expect(html).not.toContain("Open to work");
    expect(html).not.toContain("hero-open");
    expect(html).toContain("Springer");
    expect(html).toContain('href="mailto:goben.ca.pkn@hotmail.com"');
    expect(html).toContain('href="https://www.linkedin.com/in/goben-diego/" target="_blank" rel="noreferrer noopener"');
    expect(html).toContain('href="https://github.com/PocketNugget" target="_blank" rel="noreferrer noopener"');
    expect(html).toContain('href="/work/htb-university-2025" data-cmd="open htb-university-2025"');
    expect(html).toContain('data-count="34125"');
    expect(html.indexOf('class="hero"')).toBeLessThan(html.indexOf("Profile"));
    expect(html).not.toContain("40%");
    expect(html).not.toContain("May to July 2026");
    expect(html).not.toContain("expected May 2026");
    expect(html).not.toContain("—");
    for (const path of allDocumentPaths()) {
      const page = render(path);
      expect(page).not.toMatch(/<script/i);
      expect(page).not.toContain("javascript:");
      expect(page).not.toMatch(/\son\w+\s*=/i);
    }
    expect(commandFor("/pad")).toBe("pad");
    expect(commandFor("/convert")).toBe("encode");
    expect(commandFor("/terminal")).toBe("snake");
    expect(commandFor("/notes/model-files")).toBe("open model-files");
    expect(documentBody("/pad")).toContain("notepad-mount");
    expect(documentBody("/no-such")).toContain("no such path");
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
    const work = render("/work");
    expect(work).not.toContain("Shift reports at TBSeK");
    expect(work).toContain("https://lnkd.in/p/ew9RXUKh");
    expect(work).toContain("https://dl.acm.org/doi/10.1007/978-3-031-75540-8_15");
    expect(work).toContain("https://github.com/PocketNugget/WayZT");
    expect(work).toContain("https://github.com/PocketNugget/Coherence-assessment-of-generated-realistic-images");
    expect(work.indexOf('id="homelab"')).toBeLessThan(work.indexOf('id="maia"'));
    expect(work.indexOf('id="maia"')).toBeLessThan(work.indexOf('id="coherence-paper"'));
    expect(work.indexOf('id="coherence-paper"')).toBeLessThan(work.indexOf('id="wayzt"'));
    expect(work.indexOf('id="wayzt"')).toBeLessThan(work.indexOf('id="where2skate"'));
    expect(work.indexOf('id="where2skate"')).toBeLessThan(work.indexOf('id="hacking-writeups"'));
    expect(work.indexOf('id="hacking-writeups"')).toBeLessThan(work.indexOf('id="wifi2go"'));
    expect(work.indexOf('id="wifi2go"')).toBeLessThan(work.indexOf('id="htb-university-2025"'));
    expect(work).toContain("https://github.com/PocketNugget/PKN-Portafolio");
    expect(work).toContain("https://github.com/PocketNugget/MAIA_Mobility-AI-Analytics");
    expect(work).toContain("https://github.com/PocketNugget/Where2Skate");
    expect(work).toContain("https://github.com/PocketNugget/Hacking-Writeups");
    expect(work).toContain("https://github.com/PocketNugget/Wifi2Go");
    expect(work).not.toContain("admin123");
    expect(work).not.toContain("otpauth");
    const portfolio = render("/work/homelab");
    expect(portfolio).toContain("Content-Security-Policy");
    expect(portfolio).toContain("prod branch");
    expect(portfolio).toContain("SameSite=Strict");
    expect(portfolio).toContain("Workers Builds");
    expect(portfolio).toContain("legacy/");
    expect(portfolio).toContain("I did not put Kubernetes");
    expect(render("/work/wifi2go")).toContain("campus network");
    expect(render("/work/wifi2go")).not.toContain("admin123");
    expect(render("/work/maia")).toContain("Mexico City");
    expect(render("/work/maia")).toContain("Next.js");
    expect(render("/work/wayzt")).toContain("Core ML");
    expect(render("/work/coherence-paper")).toContain("198 to 209");
    expect(render("/work/coherence-paper")).toContain("https://dl.acm.org/doi/10.1007/978-3-031-75540-8_15");
    const hackztecs = render("/work/hackztecs");
    expect(hackztecs).toContain("February 2024 to present");
    expect(hackztecs).toContain("CREATE-V");
    expect(hackztecs).toContain("May 2025");
    const skills = render("/skills");
    expect(skills).toContain("Splunk");
    expect(skills).toContain("read the diff");
    expect(skills.toLowerCase()).not.toContain("cylance");
    expect(skills).toContain("Kubernetes");
    expect(skills).toContain("Not earned and not work experience");
    const learning = skills.slice(skills.indexOf("Learning"));
    for (const name of ["Security+", "AWS Cloud Practitioner", "GCP", "Terraform"]) expect(learning).toContain(name);
    const atWork = skills.slice(0, skills.indexOf("In projects and the lab"));
    for (const name of ["Kubernetes", "Terraform", "AWS", "Ansible"]) expect(atWork).not.toContain(name);
  });

  it("lists every document path in the sitemap", () => {
    const xml = sitemapXml();
    expect(xml).toContain("https://pocketnugget.xyz/work/sdr");
    expect(xml).toContain("https://pocketnugget.xyz/notes/model-files");
    expect(xml).toContain("https://pocketnugget.xyz/blog");
    expect(xml).toContain("https://pocketnugget.xyz/links");
    expect(xml).not.toContain("/admin");
    expect(xml).not.toContain("/login");
    expect(xml).not.toContain("/terminal");
    expect(xml).not.toContain("/skills");
    expect(xml).not.toContain("/display");
    expect(xml).not.toContain("—");
    expect(isDocumentPath("/terminal")).toBe(true);
    expect(isDocumentPath("/skills")).toBe(true);
    expect(isDocumentPath("/display")).toBe(true);
    expect(xml).toContain("https://pocketnugget.xyz/legal");
    for (const path of [
      "/player",
      "/pictures",
      "/awards",
      "/convert",
      "/facts",
      "/hack",
      "/buddy",
      "/run",
      "/find",
      "/pad",
      "/login",
      "/sweep",
      "/dice",
      "/flip",
      "/math",
      "/wheel",
      "/snake",
      "/tetris",
      "/tron",
    ]) {
      expect(isDocumentPath(path)).toBe(true);
      expect(xml).not.toContain(`https://pocketnugget.xyz${path}</loc>`);
    }
    expect(documentBody("/login")).toContain("Loading login.");
    expect(commandFor("/login")).toBe("login");
    expect(render("/help")).not.toContain(">login<");
    expect(render("/colophon")).toContain("suggestions");
  });
});

describe("source notes on disk", () => {
  it("keeps the model-file note free of a reproduction", () => {
    expect(models).toContain("SafeTensors");
    expect(models.toLowerCase()).not.toContain("import pickle");
    expect(models).not.toContain("torch.load");
  });
});

describe("recruiter pages", () => {
  it("opens Jobs with an at-a-glance list in catalog order that links to each job", () => {
    const html = render("/jobs");
    const glance = html.slice(html.indexOf('class="timeline"'), html.indexOf("</nav>", html.indexOf('class="timeline"')));
    const ids = [...glance.matchAll(/href="#job-([a-z-]+)"/g)].map((match) => match[1]);
    expect(ids).toEqual(jobs.map((job) => job.id));
    for (const job of jobs) {
      expect(html).toContain(`id="job-${job.id}"`);
      expect(glance).toContain(job.role);
      expect(glance).toContain(job.date);
    }
    expect(html.indexOf('class="timeline"')).toBeLessThan(html.indexOf('id="job-tbsek"'));
  });

  it("puts an at-a-glance box on every full project page", () => {
    for (const project of projects) {
      const html = render(`/work/${project.slug}`);
      expect(html, project.slug).toContain('<fieldset class="glance"><legend>At a glance</legend>');
      expect(html, project.slug).toContain(`<dt>In short</dt><dd>${escapeHtml(project.summary)}`);
      expect(html.indexOf("glance"), project.slug).toBeLessThan(html.indexOf("<p>", html.indexOf("</fieldset>")));
    }
  });

  it("keeps the home versatile: no target countries, languages and copy email present", () => {
    const html = render("/");
    expect(html).not.toMatch(/Netherlands|Ireland/);
    expect(html).toContain(hero.langs);
    expect(html).toContain('class="hero-go copy-mail" data-copy="goben.ca.pkn@hotmail.com"');
    expect(render("/contact")).toContain('class="copy-mail" data-copy="goben.ca.pkn@hotmail.com"');
  });

  it("serves the two folders as pages that stay out of the sitemap", () => {
    for (const path of ["/games", "/accessories"]) {
      expect(isDocumentPath(path)).toBe(true);
      expect(documentBody(path)).toContain(`data-folder="${path.slice(1)}"`);
      expect(sitemapXml()).not.toContain(`pocketnugget.xyz${path}<`);
    }
  });
});
