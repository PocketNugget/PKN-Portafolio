import {
  archive,
  bio,
  earlier,
  jobs,
  linkPage,
  notes,
  profiles,
  projects,
  radio,
  type Job,
  type Project,
} from "./catalog";
import { noteBySlug, noteSource, renderNote, escapeHtml } from "./notes";
import { HELP } from "./shell";
import { normalizePath } from "./paths";

const NAV = [
  ["whoami", "/"],
  ["jobs", "/jobs"],
  ["projects", "/work"],
  ["blog", "/blog"],
  ["links", "/links"],
  ["radio", "/radio"],
  ["writeups", "/notes"],
  ["certs", "/certs"],
  ["contact", "/contact"],
] as const;

function echo(command: string): string {
  return `<p class="echo"><span class="user">goben</span>@<span class="host">pkn</span><span class="cwd">:~$</span> ${escapeHtml(command)}</p>`;
}

function tools(list: string[]): string {
  if (list.length === 0) return "";
  return `<p class="tools">${list.map(escapeHtml).join(", ")}</p>`;
}

function links(list: { label: string; href: string }[]): string {
  if (list.length === 0) return "";
  return `<p class="links">${list
    .map((link) => {
      const rel = link.href.startsWith("/") ? "" : ' rel="noreferrer"';
      return `<a href="${escapeHtml(link.href)}"${rel}>${escapeHtml(link.label)}</a>`;
    })
    .join(" ")}</p>`;
}

function jobBlock(job: Job, full: boolean): string {
  const body = full
    ? job.body.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")
    : `<p>${escapeHtml(job.summary)}</p>`;
  return `<article class="block">
    <h2>${escapeHtml(job.role)}</h2>
    <p class="meta">${escapeHtml(job.org)} · ${escapeHtml(job.place)} · ${escapeHtml(job.date)}</p>
    ${body}
    ${full ? tools(job.tools) : ""}
  </article>`;
}

function projectBlock(project: Project, full: boolean): string {
  const title = full
    ? escapeHtml(project.title)
    : `<a href="/work/${project.slug}">${escapeHtml(project.title)}</a>`;
  const body = full
    ? project.body.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")
    : `<p>${escapeHtml(project.summary)}</p>`;
  const people = full && project.people ? `<p class="meta">${escapeHtml(project.people)}</p>` : "";
  return `<article class="block" id="${project.slug}">
    <p class="path">~/work/${escapeHtml(project.slug)}</p>
    <h2>${title}</h2>
    <p class="meta">${escapeHtml(project.date)}</p>
    ${body}
    ${people}
    ${tools(project.tools)}
    ${full ? links(project.links) : ""}
  </article>`;
}

function nav(path: string): string {
  const items = NAV.map(([label, href]) => {
    const current = path === href || (href !== "/" && path.startsWith(href)) ? ' aria-current="page"' : "";
    return `<a href="${href}" data-cmd="${label}"${current}>${label}</a>`;
  }).join("");
  return `<nav class="nav">${items}</nav>`;
}

function frame(path: string, command: string, body: string, error: string, errorClass: string): string {
  const err = error ? `<p class="${errorClass}" role="status">${escapeHtml(error)}</p>` : "";
  const shown = escapeHtml(command);
  return `<div class="frame">
    <header class="bar">
      <span class="bar-mark">pkn</span>
      <span class="bar-host"><span class="user">goben</span>@pocketnugget</span>
      <span class="bar-pane">0:${shown}*</span>
    </header>
    <aside class="rail">
      <img src="/nugg.png" width="40" height="40" alt="PocketNugget mark" />
      <div>
        <p class="who"><span class="user">goben</span><span class="dim">@pkn</span></p>
        <p class="where">~/pocketnugget</p>
      </div>
    </aside>
    <div class="stage">
      ${nav(path)}
      ${err}
      ${echo(command)}
      ${body}
      <p class="foot"><a href="/colophon" data-cmd="colophon">colophon</a></p>
    </div>
  </div>
  <form class="shell" id="shell" autocomplete="off">
    <div class="status" aria-hidden="true">
      <span>pkn</span>
      <span>0:${shown}*</span>
      <span class="status-host">pocketnugget.xyz</span>
    </div>
    <div class="promptline">
      <label for="cmd"><span class="user">goben</span>@<span class="host">pkn</span>:~$</label>
      <input id="cmd" name="cmd" spellcheck="false" autocapitalize="off" enterkeyhint="go" aria-label="Command" />
    </div>
  </form>`;
}

function home(): string {
  const lead = jobs
    .slice(0, 3)
    .map((job) => jobBlock(job, false))
    .join("");
  const head = projects
    .slice(0, 3)
    .map((project) => projectBlock(project, false))
    .join("");
  return `<p><img src="/nugg.png" width="32" height="32" alt="PocketNugget" /></p>
    ${bio.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
    <h2>Jobs</h2>
    ${lead}
    <h2>Projects</h2>
    ${head}
    <p>The rest is <a href="/work" data-cmd="projects">projects</a>. The radios are <a href="/radio" data-cmd="radio">radio</a>.</p>`;
}

function helpPage(): string {
  const rows = HELP.map(
    (line) =>
      `<tr><th>${escapeHtml(line.cmd)}</th><td>${escapeHtml(line.blurb)}</td></tr>`,
  ).join("");
  return `<table class="help"><tbody>${rows}</tbody></table>`;
}

function workPage(): string {
  const list = projects.map((project) => projectBlock(project, false)).join("");
  const old = earlier
    .map((item) => `<li><span class="meta">${escapeHtml(item.date)}</span> ${escapeHtml(item.text)}</li>`)
    .join("");
  const dump = archive
    .map(
      (item) =>
        `<li><a rel="noreferrer" href="${escapeHtml(item.href)}">${escapeHtml(item.name)}</a></li>`,
    )
    .join("");
  return `${list}
    <h2>Earlier</h2>
    <ul class="ls">${old}</ul>
    <h2>ls ~/archive</h2>
    <ul class="ls">${dump}</ul>`;
}

function notesPage(): string {
  const items = notes
    .map(
      (note) =>
        `<li><a href="/notes/${note.slug}">${escapeHtml(note.title)}</a> <span class="meta">${escapeHtml(note.date)}</span></li>`,
    )
    .join("");
  return `<ul class="ls">${items}</ul>
    <p>Finished challenge writeups live in <a rel="noreferrer" href="https://github.com/PocketNugget/Hacking-Writeups">Hacking-Writeups</a>. I am not pasting solve steps here.</p>`;
}

function certsPage(): string {
  return `<article class="block">
      <h2>UDLAP</h2>
      <p>Computer systems engineering, 2021 to 2025. Graduated. The internships required for the degree are done.</p>
    </article>
    <article class="block">
      <h2>Hack The Box</h2>
      <p>Using the Metasploit Framework, July 2025. macOS Fundamentals, July 2025. Other course badges are on LinkedIn.</p>
    </article>
    <article class="block">
      <h2>CompTIA Security+</h2>
      <p>In progress. Not earned.</p>
    </article>
    <article class="block">
      <h2>Languages</h2>
      <p>Spanish, native. English, C1+. French, A2. German, A1.</p>
    </article>
    <article class="block">
      <h2>ORCID</h2>
      <p><a rel="noreferrer" href="https://orcid.org/0009-0002-4819-7773">0009-0002-4819-7773</a></p>
    </article>`;
}

function linksPage(): string {
  const rows = linkPage
    .map(
      (link) =>
        `<li><a rel="noreferrer" href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a></li>`,
    )
    .join("");
  return `<p class="path">~/links</p><ul class="ls">${rows}</ul>`;
}

function dynamicPage(label: string): string {
  return `<div id="dynamic"><p>${label}</p></div>`;
}

function contactPage(): string {
  const rows = Object.values(profiles)
    .map(
      (profile) =>
        `<li><a rel="noreferrer" href="${escapeHtml(profile.href)}">${escapeHtml(profile.label)}</a></li>`,
    )
    .join("");
  return `<ul class="ls">${rows}</ul><p>No form. The address above is the one I read.</p>`;
}

function radioPage(): string {
  return radio.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("") +
    `<p><a href="/work/sdr">~/work/sdr</a></p>`;
}

function colophonPage(): string {
  return `<p>This site is a Vite build served by a Cloudflare Worker. The Worker adds the headers, <a href="/.well-known/security.txt">security.txt</a>, and <a href="/build.json">build.json</a>. Most pages are files. There is no contact form.</p>
    <p>The blog is the exception. Posts and session hashes live in D1. The password hash is a Worker secret. Sessions are HttpOnly cookies. Visitor addresses are not stored.</p>
    <p>The homelab is where Docker and Cloudflare Tunnels live, on a Raspberry Pi and on the STEM Mac Mini while that apprenticeship ran. I did not put Kubernetes in front of these pages. Naming a cluster here would not make the site safer. Terraform for the DNS zone can come later, against the real zone, not as a diagram.</p>
    <p>Scripts and styles are same-origin. The window font is Pixelated MS Sans Serif by lou on Fontstruct, shipped under CC BY-SA 3.0 with 98.css. It is not loaded from a third party. The only cookie is the editor session, and only after login. <code>scripts/check.sh</code> typechecks, runs the tests, and greps the build for the defaults I do not want shipped.</p>
    <p>A coding agent drafted parts of this, and then the check script and I read it. That is the same habit as the rest of the work: the tool can type, the diff still has to be mine.</p>`;
}

function skillsPage(): string {
  const seen = new Set<string>();
  const tools: string[] = [];
  for (const job of jobs) {
    for (const tool of job.tools) {
      if (seen.has(tool)) continue;
      seen.add(tool);
      tools.push(tool);
    }
  }
  return `<p>Tools from the jobs, in the order those jobs are listed.</p>
    <p>${tools.map(escapeHtml).join(", ")}</p>
    <h2>Languages</h2>
    <p>Spanish, native. English, C1+. French, A2. German, A1.</p>
    <h2>Agents</h2>
    <p>A coding agent can draft a change. I still read the diff before it ships. The pipelines I will talk about are the report scripts, the radio tools, and the prototypes already under projects.</p>`;
}

function notFound(): string {
  return `<p class="err">no such path. try \`help\`.</p>`;
}

export function documentBody(pathname: string): string {
  const path = normalizePath(pathname);
  if (path === "/") return home();
  if (path === "/help") return helpPage();
  if (path === "/jobs") return jobs.map((job) => jobBlock(job, true)).join("");
  if (path === "/work") return workPage();
  if (path.startsWith("/work/")) {
    const project = projects.find((item) => item.slug === path.slice("/work/".length));
    return project ? projectBlock(project, true) : notFound();
  }
  if (path === "/blog" || path.startsWith("/blog/")) return dynamicPage("Loading posts.");
  if (path === "/links") return linksPage();
  if (path === "/admin/login") return dynamicPage("Loading login.");
  if (path === "/admin") return dynamicPage("Loading editor.");
  if (path === "/notes") return notesPage();
  if (path.startsWith("/notes/")) {
    const meta = noteBySlug(path.slice("/notes/".length));
    return meta ? `<article class="note">${renderNote(noteSource(meta))}</article>` : notFound();
  }
  if (path === "/radio") return radioPage();
  if (path === "/certs") return certsPage();
  if (path === "/contact") return contactPage();
  if (path === "/colophon") return colophonPage();
  if (path === "/skills") return skillsPage();
  if (path === "/display") return `<div class="display-mount"></div>`;
  if (path === "/terminal") return `<div class="term-mount"></div>`;
  return notFound();
}

export function commandFor(pathname: string): string {
  const path = normalizePath(pathname);
  if (path === "/") return "whoami";
  if (path === "/jobs") return "jobs";
  if (path === "/work") return "projects";
  if (path.startsWith("/work/")) return `open ${path.slice("/work/".length)}`;
  if (path === "/blog" || path.startsWith("/blog/")) return "blog";
  if (path === "/links") return "links";
  if (path === "/admin" || path === "/admin/login") return "login";
  if (path === "/notes") return "writeups";
  if (path.startsWith("/notes/")) return `open ${path.slice("/notes/".length)}`;
  if (path === "/radio") return "radio";
  if (path === "/certs") return "certs";
  if (path === "/contact") return "contact";
  if (path === "/colophon") return "colophon";
  if (path === "/help") return "help";
  if (path === "/skills") return "skills";
  if (path === "/display") return "display";
  if (path === "/terminal") return "snake";
  return "help";
}

export function render(pathname: string, notice = "", tone: "err" | "hint" = "err"): string {
  const path = normalizePath(pathname);
  const errorClass = tone === "hint" ? "hint" : "err";
  return frame(path, commandFor(path), documentBody(path), notice, errorClass);
}
