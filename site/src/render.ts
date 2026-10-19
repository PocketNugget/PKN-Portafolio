import {
  archive,
  bio,
  earlier,
  hero,
  jobs,
  linkPage,
  notes,
  profiles,
  projectKind,
  projects,
  radio,
  skillGroups,
  type Job,
  type Project,
} from "./catalog";
import { t } from "./i18n";
import { safeUrl } from "./markup";
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
  return `<p class="tools">${list.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</p>`;
}

function points(list: string[] | undefined): string {
  if (!list || list.length === 0) return "";
  return `<ul class="points">${list.map((item) => `<li>${tx(item)}</li>`).join("")}</ul>`;
}

function anchor(href: string, label: string): string {
  if (!safeUrl(href)) return tx(label);
  const rel = href.startsWith("/") ? "" : ' rel="noreferrer noopener"';
  return `<a href="${escapeHtml(href)}"${rel}>${tx(label)}</a>`;
}

function links(list: { label: string; href: string }[]): string {
  if (list.length === 0) return "";
  const bits = list.map((link) => {
    if (!safeUrl(link.href)) return tx(link.label);
    return anchor(link.href, link.label);
  });
  return `<p class="links">${bits.join(" ")}</p>`;
}

function tx(value: string): string {
  return escapeHtml(t(value));
}

function shot(src: string | undefined): string {
  if (!src || !/^\/media\/[A-Za-z0-9._-]+$/.test(src)) return "";
  return `<img class="shot" src="${escapeHtml(src)}" alt="" loading="lazy" decoding="async" />`;
}

function jobBlock(job: Job, full: boolean): string {
  const body = full
    ? `<p>${tx(job.summary)}</p>${job.body.map((paragraph) => `<p>${tx(paragraph)}</p>`).join("")}`
    : `<p>${tx(job.summary)}</p>`;
  return `<article class="block"${full ? ` id="job-${escapeHtml(job.id)}"` : ""}>
    <h2>${tx(job.role)}</h2>
    <p class="meta">${escapeHtml(job.org)} · ${tx(job.place)} · ${tx(job.date)}</p>
    ${shot(job.image)}
    ${body}
    ${full ? tools(job.tools) : ""}
  </article>`;
}

function glance(project: Project): string {
  const rows = [
    ["In short", tx(project.summary)],
    ["When", tx(project.date)],
    ["Stack", project.tools.length ? project.tools.map((tool) => escapeHtml(tool)).join(", ") : ""],
    ["Links", links(project.links)],
  ].filter(([, value]) => value);
  const items = rows.map(([label, value]) => `<dt>${tx(label ?? "")}</dt><dd>${value}</dd>`).join("");
  return `<fieldset class="glance"><legend>${tx("At a glance")}</legend><dl>${items}</dl></fieldset>`;
}

function projectBlock(project: Project, full: boolean): string {
  const title = full ? tx(project.title) : anchor(`/work/${project.slug}`, project.title);
  const people = full && project.people ? `<p class="meta">${tx(project.people)}</p>` : "";
  const kind = projectKind[project.slug] ?? "apps";
  if (full) {
    return `<article class="block" id="${project.slug}" data-kind="${kind}">
    <p class="path">~/work/${escapeHtml(project.slug)}</p>
    <h2>${title}</h2>
    ${glance(project)}
    ${shot(project.image)}
    ${project.body.map((paragraph) => `<p>${tx(paragraph)}</p>`).join("")}
    ${points(project.points)}
    ${people}
  </article>`;
  }
  return `<article class="block" id="${project.slug}" data-kind="${kind}">
    <p class="path">~/work/${escapeHtml(project.slug)}</p>
    <h2>${title}</h2>
    <p class="meta">${tx(project.date)}</p>
    ${links(project.links)}
    ${shot(project.image)}
    <p>${tx(project.summary)}</p>
    ${tools(project.tools)}
  </article>`;
}

function jobsPage(): string {
  const rows = jobs
    .map(
      (job) =>
        `<li><a href="#job-${escapeHtml(job.id)}"><b>${tx(job.role)}</b> <span class="org">${escapeHtml(job.org)}</span> <span class="when">${tx(job.date)}</span></a></li>`,
    )
    .join("");
  return `<nav class="timeline" aria-label="${tx("At a glance")}"><h2>${tx("At a glance")}</h2><ol>${rows}</ol></nav>
    ${jobs.map((job) => jobBlock(job, true)).join("")}`;
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
      <input id="cmd" name="cmd" spellcheck="false" autocapitalize="off" enterkeyhint="go" aria-label="${tx("Command")}" />
    </div>
  </form>`;
}

function pathLink(href: string, cmd: string, label: string): string {
  return `<a class="about-go" href="${href}" data-cmd="${cmd}">${tx(label)}</a>`;
}

function heroBlock(): string {
  const out = (href: string, label: string) =>
    `<a class="hero-go" href="${escapeHtml(href)}" target="_blank" rel="noreferrer noopener">${tx(label)}</a>`;
  const stats = hero.stats
    .map(
      (stat) =>
        `<a class="hero-stat" href="${escapeHtml(stat.href)}" data-cmd="${escapeHtml(stat.cmd)}"><b${stat.count ? ` data-count="${stat.count}"` : ""}>${escapeHtml(stat.big)}</b><span class="hero-unit">${tx(stat.unit)}</span><span class="hero-label">${tx(stat.label)}</span></a>`,
    )
    .join("");
  const tape = hero.ticker.map((item) => `<span>${escapeHtml(item)}</span>`).join("");
  return `<section class="hero">
      <div class="hero-top">
        <img class="hero-pic" src="/media/me.png" width="116" height="116" alt="Goben Diego Constantino Aguirre" decoding="async" />
        <div class="hero-id">
          <p class="hero-prompt"><span class="user">goben</span>@<span class="host">pkn</span>:~$ whoami</p>
          <p class="hero-name">Goben Diego Constantino Aguirre</p>
          <p class="hero-title">${tx(hero.title)}</p>
          <p class="hero-since">${tx(hero.since)}</p>
          <p class="hero-focus">${tx(hero.focus)}</p>
          <p class="hero-role"><span class="hero-type">${tx(hero.roles[0] ?? "")}</span><span class="hero-caret" aria-hidden="true"></span></p>
          <p class="hero-langs">${tx(hero.langs)}</p>
        </div>
      </div>
      <nav class="hero-cta">
        <a class="hero-go hero-mail" href="${escapeHtml(profiles.email.href)}">${tx("Email me")}</a>
        <button type="button" class="hero-go copy-mail" data-copy="${escapeHtml(profiles.email.label)}">${tx("Copy email")}</button>
        ${out(profiles.linkedin.href, "LinkedIn")}
        ${out(profiles.github.href, "GitHub")}
        <a class="hero-go hero-jobs" href="/jobs" data-cmd="jobs">${tx("See the jobs")}</a>
      </nav>
      <div class="hero-stats">${stats}</div>
      <div class="hero-ticker" aria-hidden="true"><div class="hero-tape"><span class="hero-half">${tape}</span><span class="hero-half hero-again">${tape}</span></div></div>
    </section>`;
}

function home(): string {
  const next = [
    ["/jobs", "jobs", "Jobs"],
    ["/work", "projects", "Projects"],
    ["/skills", "skills", "Skills"],
    ["/certs", "certs", "Courses"],
    ["/contact", "contact", "Contact"],
  ] as const;
  const more = [
    ["/awards", "awards", "Certificates"],
    ["/notes", "writeups", "Notes"],
    ["/pictures", "pictures", "My Pictures"],
    ["/radio", "radio", "Radio"],
  ] as const;
  const row = (items: readonly (readonly [string, string, string])[], extra = "") =>
    `<nav class="about-path${extra ? ` ${extra}` : ""}">${items.map(([href, cmd, label]) => pathLink(href, cmd, label)).join("")}</nav>`;
  return `${heroBlock()}
    <h2>${tx("Profile")}</h2>
    ${bio.map((paragraph) => `<p>${tx(paragraph)}</p>`).join("")}
    <h2>${tx("Read next")}</h2>
    <p>${tx("Open these in order. Jobs first, then the work, then the tools. Courses and Contact close it.")}</p>
    ${row(next, "about-main")}
    <h2>${tx("Also")}</h2>
    ${row(more)}`;
}

function helpPage(): string {
  const rows = HELP.map(
    (line) =>
      `<tr><th>${escapeHtml(line.cmd)}</th><td>${tx(line.blurb)}</td></tr>`,
  ).join("");
  return `<table class="help"><tbody>${rows}</tbody></table>`;
}

function workPage(): string {
  const list = projects.map((project) => projectBlock(project, false)).join("");
  const old = earlier
    .map(
      (item) =>
        `<li><span class="meta">${tx(item.date)}</span> ${tx(item.text)}${item.image ? shot(item.image) : ""}</li>`,
    )
    .join("");
  const dump = archive
    .map(
      (item) =>
        `<li>${anchor(item.href, item.name)}</li>`,
    )
    .join("");
  return `<h2>${tx("Work")}</h2>
    <p>${tx("Projects I will talk about in an interview. Older one-liners sit under Earlier.")}</p>
    <label class="field-row">${tx("Show")}
      <select id="work-filter" aria-label="${tx("Filter projects")}">
        <option value="all">${tx("All")}</option>
        <option value="detection">${tx("Detection")}</option>
        <option value="research">${tx("Research")}</option>
        <option value="hackathon">${tx("Hackathon")}</option>
        <option value="apps">${tx("Apps")}</option>
      </select>
    </label>
    ${list}
    <h2>${tx("Earlier")}</h2>
    <ul class="ls">${old}</ul>
    <h2>ls ~/archive</h2>
    <ul class="ls">${dump}</ul>`;
}

function notesPage(): string {
  const items = notes
    .map(
      (note) =>
        `<li>${anchor(`/notes/${note.slug}`, note.title)} <span class="meta">${tx(note.date)}</span></li>`,
    )
    .join("");
  return `<ul class="ls">${items}</ul>
    <p>${tx("Finished challenge writeups live in Hacking-Writeups. I am not pasting solve steps here.")}</p>
    <p><a rel="noreferrer noopener" href="https://github.com/PocketNugget/Hacking-Writeups">Hacking-Writeups</a></p>`;
}

function certsPage(): string {
  return `<article class="block">
      <h2>UDLAP</h2>
      <p>${tx("Computer systems engineering, 2021 to 2025. Graduated. The internships required for the degree are done.")}</p>
    </article>
    <article class="block">
      <h2>Hack The Box</h2>
      <p>${tx("Using the Metasploit Framework, July 2025. macOS Fundamentals, July 2025. Other course badges are on LinkedIn. Scans of event certificates are in Certificates.")}</p>
      <p><a href="/awards">${tx("Certificates")}</a></p>
    </article>
    <article class="block">
      <h2>CompTIA Security+</h2>
      <p>${tx("In progress. Not earned.")}</p>
    </article>
    <article class="block">
      <h2>AWS Cloud Practitioner, GCP, Terraform</h2>
      <p>${tx("In progress. Not earned.")}</p>
    </article>
    <article class="block">
      <h2>${tx("Languages")}</h2>
      <p>${tx("Spanish, native. English, C1+. French, A2. German, A1.")}</p>
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
        `<li>${anchor(link.href, link.label)}</li>`,
    )
    .join("");
  return `<p class="path">~/links</p><ul class="ls">${rows}</ul>`;
}

function dynamicPage(label: string): string {
  return `<div id="dynamic"><p>${tx(label)}</p></div>`;
}

function contactPage(): string {
  const rows = Object.values(profiles)
    .map(
      (profile) =>
        `<li>${anchor(profile.href, profile.label)}</li>`,
    )
    .join("");
  return `<ul class="ls">${rows}</ul>
    <p><button type="button" class="copy-mail" data-copy="${escapeHtml(profiles.email.label)}">${tx("Copy email")}</button></p>
    <p>${tx("Or send a message here. It lands in my editor, and I read it.")}</p>
    <form class="contact-form" novalidate>
      <label>${tx("Name")}<input name="name" maxlength="40" autocomplete="name" required></label>
      <label>${tx("Email")}<input name="email" type="email" maxlength="120" autocomplete="email" required></label>
      <label>${tx("Message")}<textarea name="message" rows="5" maxlength="1500" required></textarea></label>
      <div class="notepad-hp" aria-hidden="true"><input name="company" tabindex="-1" autocomplete="off"></div>
      <p><button type="submit">${tx("Send message")}</button></p>
      <p class="contact-status err" role="status"></p>
    </form>`;
}

function radioPage(): string {
  return radio.paragraphs.map((paragraph) => `<p>${tx(paragraph)}</p>`).join("") +
    `<p><a href="/work/sdr">~/work/sdr</a></p>`;
}

function legalPage(): string {
  const lines = [
    "This page is a plain account of what the site uses. It is not a legal opinion.",
    "The words and the photos are mine, except where a credit says otherwise.",
    "The window chrome is 98.css 0.1.21, MIT, by Jordan Scales. This site is not affiliated with Microsoft. Windows is their mark.",
    "The window font is Pixelated MS Sans Serif by lou on Fontstruct, CC BY-SA 3.0, served from this site.",
    "The music window is Webdeck Player v1.0.2 by Chris, MIT. The player opens on Floral Radio, a mix that starts on Floral Shoppe, by Macintosh Plus, played in YouTube's own player. The list also has Floral Shoppe itself, Magic Ways, by Tatsuro Yamashita, a mix that starts on that video, and Permaculture, by MTHRBORD. This site does not host those files. Winamp, Minesweeper, Tetris, Tron, and YouTube are other people's marks.",
    "The site does not rebroadcast a radio station. SomaFM and TuneIn are not embedded here.",
    "Posts, suggestions, game score names, and session hashes live in D1. Visitor addresses are not stored. The only cookie is the editor session, and only after login.",
    "Copyright questions go to the address in security.txt: goben.ca.pkn@hotmail.com.",
  ];
  return `${lines.map((line) => `<p>${tx(line)}</p>`).join("")}
    <p><a href="/.well-known/security.txt">security.txt</a></p>`;
}

function colophonPage(): string {
  const lines = [
    "This site is a Vite build served by a Cloudflare Worker. The Worker adds the headers, security.txt, and build.json. Most pages are files. The contact form is the exception.",
    "The blog, the opinion page, the contact form, and the game scores are the exception. Posts, comments, contact messages, game score names, and session hashes live in D1. The password hash is a Worker secret. Sessions are HttpOnly cookies. Visitor addresses are not stored.",
    "Licenses, marks, and the music player are on the legal page.",
    "The homelab is where Docker and Cloudflare Tunnels live, on a Raspberry Pi and on the STEM Mac Mini while that apprenticeship ran. I did not put Kubernetes in front of these pages. Naming a cluster here would not make the site safer. Terraform for the DNS zone can come later, against the real zone, not as a diagram.",
    "Scripts and styles are same-origin. The window font is Pixelated MS Sans Serif by lou on Fontstruct, shipped under CC BY-SA 3.0 with 98.css. It is not loaded from a third party. The only cookie is the editor session, and only after login. scripts/check.sh typechecks, runs the tests, and greps the build for the defaults I do not want shipped.",
    "A coding agent drafted parts of this, and then the check script and I read it. That is the same habit as the rest of the work: the tool can type, the diff still has to be mine.",
  ];
  return `${lines.map((line) => `<p>${tx(line)}</p>`).join("")}
    <p><a href="/.well-known/security.txt">security.txt</a> · <a href="/build.json">build.json</a> · <a href="/legal" data-cmd="legal">${tx("Legal")}</a></p>`;
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
  const items = tools.map((tool) => `<li>${escapeHtml(tool)}</li>`).join("");
  const list = (names: string[]) => `<ul class="ls chips">${names.map((name) => `<li>${escapeHtml(name)}</li>`).join("")}</ul>`;
  return `<h2>${tx("Tools")}</h2>
    <p>${tx("Tools from the jobs, in the order those jobs are listed.")}</p>
    <ul class="ls chips">${items}</ul>
    <h2>${tx("In projects and the lab")}</h2>
    ${list(skillGroups.lab.filter((name) => !seen.has(name)))}
    <h2>${tx("Known, not used at work")}</h2>
    <p>${tx("I know them. I do not list them as work experience.")}</p>
    ${list(skillGroups.known)}
    <h2>${tx("Learning")}</h2>
    <p>${tx("Not earned and not work experience. These are what I am studying now.")}</p>
    ${list(skillGroups.learning)}
    <h2>${tx("Languages")}</h2>
    <p>${tx("Spanish, native. English, C1+. French, A2. German, A1.")}</p>
    <h2>${tx("Agents")}</h2>
    <p>${tx("A coding agent can draft a change. I still read the diff. The pipelines I will talk about are the report scripts, the radio tools, and the prototypes already under projects.")}</p>`;
}

function notFound(): string {
  return '<p class="err">' + tx("no such path. try `help`.") + "</p>";
}

export function documentBody(pathname: string): string {
  const path = normalizePath(pathname);
  if (path === "/") return home();
  if (path === "/help") return helpPage();
  if (path === "/jobs") return jobsPage();
  if (path === "/work") return workPage();
  if (path.startsWith("/work/")) {
    const project = projects.find((item) => item.slug === path.slice("/work/".length));
    return project ? projectBlock(project, true) : notFound();
  }
  if (path === "/blog" || path.startsWith("/blog/")) return dynamicPage("Loading posts.");
  if (path === "/links") return linksPage();
  if (path === "/login" || path === "/admin/login") return dynamicPage("Loading login.");
  if (path === "/admin") return dynamicPage("Loading editor.");
  if (path === "/notes") return notesPage();
  if (path.startsWith("/notes/")) {
    const meta = noteBySlug(path.slice("/notes/".length));
    return meta ? `<article class="note">${renderNote(t(noteSource(meta).replace(/\s+$/, "")))}</article>` : notFound();
  }
  if (path === "/radio") return radioPage();
  if (path === "/certs") return certsPage();
  if (path === "/contact") return contactPage();
  if (path === "/colophon") return colophonPage();
  if (path === "/legal") return legalPage();
  if (path === "/skills") return skillsPage();
  if (path === "/display") return `<div class="display-mount"></div>`;
  if (path === "/terminal") return `<div class="term-mount"></div>`;
  if (path === "/pictures" || path === "/awards") return `<div class="gallery-mount"></div>`;
  if (path === "/player") return `<div class="player-mount"></div>`;
  if (path === "/convert") return `<div class="convert-mount"></div>`;
  if (path === "/facts") return `<div class="facts-mount"></div>`;
  if (path === "/hack") return `<div class="hack-mount"></div>`;
  if (path === "/buddy") return `<p>${tx("The assistant is on the desktop.")}</p>`;
  if (path === "/run") return `<div class="run-mount"></div>`;
  if (path === "/find") return `<div class="find-mount"></div>`;
  if (path === "/pad") return `<div class="notepad-mount"></div>`;
  if (path === "/sweep") return `<div class="sweep-mount"></div>`;
  if (path === "/dice") return `<div class="dice-mount"></div>`;
  if (path === "/flip") return `<div class="flip-mount"></div>`;
  if (path === "/math") return `<div class="math-mount"></div>`;
  if (path === "/wheel") return `<div class="wheel-mount"></div>`;
  if (path === "/snake" || path === "/tetris" || path === "/tron") return `<div class="term-mount"></div>`;
  if (path === "/games" || path === "/accessories") return `<div class="folder-mount" data-folder="${path.slice(1)}"></div>`;
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
  if (path === "/admin" || path === "/admin/login" || path === "/login") return "login";
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
  if (path === "/player") return "player";
  if (path === "/pictures") return "pictures";
  if (path === "/awards") return "awards";
  if (path === "/convert") return "encode";
  if (path === "/facts") return "facts";
  if (path === "/hack") return "hack";
  if (path === "/buddy") return "buddy";
  if (path === "/run") return "run";
  if (path === "/find") return "find";
  if (path === "/pad") return "pad";
  if (path === "/legal") return "legal";
  if (path === "/sweep") return "sweep";
  if (path === "/dice") return "dice";
  if (path === "/flip") return "flip";
  if (path === "/math") return "math";
  if (path === "/wheel") return "wheel";
  if (path === "/snake") return "snake";
  if (path === "/tetris") return "tetris";
  if (path === "/tron") return "tron";
  if (path === "/games") return "games";
  if (path === "/accessories") return "accessories";
  return "help";
}

export function render(pathname: string, notice = "", tone: "err" | "hint" = "err"): string {
  const path = normalizePath(pathname);
  const errorClass = tone === "hint" ? "hint" : "err";
  return frame(path, commandFor(path), documentBody(path), notice, errorClass);
}
