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
  return `<p class="echo"><b>goben@pkn</b>:~$ ${escapeHtml(command)}</p>`;
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
  return `<div class="frame">
    <aside class="rail">
      <img src="/nugg.png" width="36" height="36" alt="PocketNugget mark" />
      <p><span class="host">goben</span>@pkn<span class="dim">:~</span></p>
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
    <label for="cmd">goben@pkn:~$</label>
    <input id="cmd" name="cmd" spellcheck="false" autocapitalize="off" enterkeyhint="go" aria-label="Command" />
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
  return `${bio.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
    ${echo("jobs")}
    ${lead}
    ${echo("projects | head -n 3")}
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
    <p>Scripts, styles, and fonts are same-origin. IBM Plex is in the bundle, not loaded from a third party. The only cookie is the editor session, and only after login. <code>scripts/check.sh</code> typechecks, runs the tests, and greps the build for the defaults I do not want shipped.</p>
    <p>A coding agent drafted parts of this, and then the check script and I read it. That is the same habit as the rest of the work: the tool can type, the diff still has to be mine.</p>`;
}

function notFound(): string {
  return `<p class="err">no such path. try \`help\`.</p>`;
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
  return "help";
}

export function render(pathname: string, notice = "", tone: "err" | "hint" = "err"): string {
  const path = normalizePath(pathname);
  const error = notice;
  const errorClass = tone === "hint" ? "hint" : "err";
  let body = "";
  if (path === "/") body = home();
  else if (path === "/help") body = helpPage();
  else if (path === "/jobs") body = jobs.map((job) => jobBlock(job, true)).join("");
  else if (path === "/work") body = workPage();
  else if (path.startsWith("/work/")) {
    const project = projects.find((item) => item.slug === path.slice("/work/".length));
    body = project ? projectBlock(project, true) : notFound();
  } else if (path === "/blog" || path.startsWith("/blog/")) body = dynamicPage("Loading posts.");
  else if (path === "/links") body = linksPage();
  else if (path === "/admin/login") body = dynamicPage("Loading login.");
  else if (path === "/admin") body = dynamicPage("Loading editor.");
  else if (path === "/notes") body = notesPage();
  else if (path.startsWith("/notes/")) {
    const meta = noteBySlug(path.slice("/notes/".length));
    body = meta
      ? `<article class="note">${renderNote(noteSource(meta))}</article>`
      : notFound();
  } else if (path === "/radio") body = radioPage();
  else if (path === "/certs") body = certsPage();
  else if (path === "/contact") body = contactPage();
  else if (path === "/colophon") body = colophonPage();
  else body = notFound();
  return frame(path, commandFor(path), body, error, errorClass);
}
