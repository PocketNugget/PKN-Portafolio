import {
  archive,
  bio,
  courses,
  customTranslations,
  earlier,
  FACTS,
  hero,
  jobs,
  linkPage,
  NUGGET_LINES,
  NUGGET_TIPS,
  profiles,
  projectKind,
  projects,
  radio,
  skillGroups,
  skillNotes,
  type ArchiveItem,
  type CourseItem,
  type HeroStat,
  type Job,
  type Link,
  type Project,
  type ProjectKind,
} from "./catalog";
import { AWARDS, PICTURES, type Shot } from "./desktop/media";
import { safeUrl } from "./markup";
import { cleanLine, scrubInvisible } from "./plain";

export const BUILTIN_MEDIA: string[] = [
  "/media/me.png",
  "/media/austria-hackathon.jpg",
  "/media/changemaker-2025.jpg",
  "/media/docker-course.jpg",
  "/media/hackmexico.jpg",
  "/media/hackztecs-2024.jpg",
  "/media/hackztecs-autumn-2024.jpg",
  "/media/hackztecs-spring-2026.jpg",
  "/media/hackztecs-team.jpg",
  "/media/htb-apocalypse-2024.jpg",
  "/media/htb-apocalypse-2025.jpg",
  "/media/htb-university-2023.jpg",
  "/media/htb-university-2024.jpg",
  "/media/htb-university-2025.jpg",
  "/media/paper-publication.jpg",
  "/media/paper-talk.jpg",
  "/media/paper-with-cert.jpg",
];

export interface ProjectWithKind extends Project {
  kind: ProjectKind;
}

export interface EarlierItem {
  date: string;
  text: string;
  image?: string;
}

export interface HeroData {
  name: string;
  avatar: string;
  title: string;
  focus: string;
  since: string;
  roles: string[];
  langs: string;
  stats: HeroStat[];
  ticker: string[];
}

export interface SkillGroupsData {
  lab: string[];
  known: string[];
  learning: string[];
  languages: string;
  agents: string;
}

export interface PortfolioData {
  hero: HeroData;
  bio: string[];
  jobs: Job[];
  projects: ProjectWithKind[];
  earlier: EarlierItem[];
  archive: ArchiveItem[];
  skillGroups: SkillGroupsData;
  courses: CourseItem[];
  profiles: Record<"email" | "github" | "linkedin" | "x", Link>;
  linkPage: Link[];
  radio: { title: string; paragraphs: string[] };
  pictures: Shot[];
  awards: Shot[];
  facts: string[];
  nuggetLines: string[];
  nuggetTips: Record<string, string>;
  translations: Record<"es" | "de" | "fr", Record<string, string>>;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function getPortfolioData(): PortfolioData {
  const base: Omit<PortfolioData, "translations"> = {
    hero: clone(hero),
    bio: clone(bio),
    jobs: clone(jobs),
    projects: projects.map((p) => ({
      ...clone(p),
      kind: projectKind[p.slug] ?? "apps",
    })),
    earlier: clone(earlier),
    archive: clone(archive),
    skillGroups: {
      lab: [...skillGroups.lab],
      known: [...skillGroups.known],
      learning: [...skillGroups.learning],
      languages: skillNotes.languages,
      agents: skillNotes.agents,
    },
    courses: clone(courses),
    profiles: clone(profiles),
    linkPage: clone(linkPage),
    radio: clone(radio),
    pictures: clone(PICTURES),
    awards: clone(AWARDS),
    facts: clone(FACTS),
    nuggetLines: clone(NUGGET_LINES),
    nuggetTips: clone(NUGGET_TIPS),
  };

  return {
    ...base,
    translations: {
      es: { ...customTranslations.es },
      de: { ...customTranslations.de },
      fr: { ...customTranslations.fr },
    },
  };
}

const DEFAULT_SNAPSHOT: PortfolioData = getPortfolioData();

export function getDefaultPortfolioData(): PortfolioData {
  return clone(DEFAULT_SNAPSHOT);
}

function cleanText(val: unknown, max = 1200): string | null {
  if (typeof val !== "string") return null;
  const s = scrubInvisible(val).replace(/\r\n?/g, "\n").replace(/\s+/g, " ").trim();
  if (!s || s.length > max) return null;
  return s;
}

function cleanOptionalText(val: unknown, max = 1200): string {
  if (typeof val !== "string") return "";
  const s = scrubInvisible(val).replace(/\r\n?/g, "\n").replace(/\s+/g, " ").trim();
  return s.slice(0, max);
}

function cleanMediaPath(val: unknown): string | undefined {
  if (typeof val !== "string") return undefined;
  const s = val.trim();
  if (!s) return undefined;
  if (/^\/media\/[A-Za-z0-9._-]+$/.test(s) && !s.includes("..")) return s;
  return undefined;
}

function cleanStringList(val: unknown, maxItems = 60, maxLen = 1200): string[] {
  if (!Array.isArray(val)) return [];
  const out: string[] = [];
  for (const item of val) {
    const cleaned = cleanText(item, maxLen);
    if (cleaned) out.push(cleaned);
    if (out.length >= maxItems) break;
  }
  return out;
}

function cleanLinks(val: unknown, maxItems = 12): Link[] {
  if (!Array.isArray(val)) return [];
  const out: Link[] = [];
  for (const item of val) {
    if (!item || typeof item !== "object") continue;
    const rec = item as { label?: unknown; href?: unknown };
    const label = cleanLine(typeof rec.label === "string" ? rec.label : "", 120);
    const href = typeof rec.href === "string" ? rec.href.trim() : "";
    if (!label || !safeUrl(href)) continue;
    out.push({ label, href });
    if (out.length >= maxItems) break;
  }
  return out;
}

function cleanSlug(val: unknown, fallback = "item"): string {
  if (typeof val !== "string") return fallback;
  const s = val
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return s && /^[a-z0-9-]+$/.test(s) ? s : fallback;
}

export function cleanPortfolioData(raw: unknown): PortfolioData | null {
  if (!raw || typeof raw !== "object") return null;
  const input = raw as Partial<Record<keyof PortfolioData, unknown>>;
  const fallback = getDefaultPortfolioData();

  // 1. Hero
  let heroOut: HeroData = fallback.hero;
  if (input.hero && typeof input.hero === "object") {
    const h = input.hero as Partial<Record<keyof HeroData, unknown>>;
    const name = cleanText(h.name, 120) ?? fallback.hero.name;
    const avatar = cleanMediaPath(h.avatar) ?? fallback.hero.avatar;
    const title = cleanText(h.title, 200) ?? fallback.hero.title;
    const focus = cleanText(h.focus, 300) ?? fallback.hero.focus;
    const since = cleanText(h.since, 300) ?? fallback.hero.since;
    const langs = cleanText(h.langs, 240) ?? fallback.hero.langs;
    const roles = cleanStringList(h.roles, 16, 160);
    const ticker = cleanStringList(h.ticker, 40, 80);
    const stats: HeroStat[] = [];
    if (Array.isArray(h.stats)) {
      for (const item of h.stats) {
        if (!item || typeof item !== "object") continue;
        const st = item as Partial<Record<keyof HeroStat, unknown>>;
        const big = cleanText(st.big, 40);
        const unit = cleanText(st.unit, 60);
        const label = cleanText(st.label, 300);
        const href = typeof st.href === "string" && safeUrl(st.href.trim()) ? st.href.trim() : "/work";
        const cmd = cleanText(st.cmd, 80) ?? "projects";
        const count =
          typeof st.count === "number" && Number.isFinite(st.count) && st.count > 0
            ? Math.round(st.count)
            : undefined;
        if (big && unit && label) {
          stats.push({ big, ...(count !== undefined ? { count } : {}), unit, label, href, cmd });
        }
        if (stats.length >= 12) break;
      }
    }
    heroOut = {
      name,
      avatar,
      title,
      focus,
      since,
      langs,
      roles: roles.length > 0 ? roles : fallback.hero.roles,
      stats: stats.length > 0 ? stats : fallback.hero.stats,
      ticker: ticker.length > 0 ? ticker : fallback.hero.ticker,
    };
  }

  // 2. Bio
  const bioList = cleanStringList(input.bio, 12, 1000);
  const bioOut = bioList.length > 0 ? bioList : fallback.bio;

  // 3. Jobs
  let jobsOut: Job[] = fallback.jobs;
  if (Array.isArray(input.jobs)) {
    const parsed: Job[] = [];
    const seenIds = new Set<string>();
    for (const item of input.jobs) {
      if (!item || typeof item !== "object") continue;
      const j = item as Partial<Record<keyof Job, unknown>>;
      const role = cleanText(j.role, 160);
      const org = cleanText(j.org, 160);
      const place = cleanText(j.place, 160);
      const date = cleanText(j.date, 120);
      const summary = cleanText(j.summary, 500);
      if (!role || !org || !place || !date || !summary) continue;
      let id = cleanSlug(j.id, cleanSlug(`${org}-${role}`, "job"));
      let seq = 2;
      while (seenIds.has(id)) {
        id = `${cleanSlug(j.id, "job").slice(0, 50)}-${seq++}`;
      }
      seenIds.add(id);
      const body = cleanStringList(j.body, 15, 1200);
      const tools = cleanStringList(j.tools, 30, 80);
      const image = cleanMediaPath(j.image);
      parsed.push({
        id,
        role,
        org,
        place,
        date,
        summary,
        body,
        tools,
        ...(image ? { image } : {}),
      });
      if (parsed.length >= 40) break;
    }
    if (parsed.length > 0) jobsOut = parsed;
  }

  // 4. Projects
  let projectsOut: ProjectWithKind[] = fallback.projects;
  if (Array.isArray(input.projects)) {
    const parsed: ProjectWithKind[] = [];
    const seenSlugs = new Set<string>();
    for (const item of input.projects) {
      if (!item || typeof item !== "object") continue;
      const p = item as Partial<Record<keyof ProjectWithKind, unknown>>;
      const title = cleanText(p.title, 160);
      const date = cleanText(p.date, 120);
      const summary = cleanText(p.summary, 600);
      if (!title || !date || !summary) continue;
      let slug = cleanSlug(p.slug, cleanSlug(title, "project"));
      let seq = 2;
      while (seenSlugs.has(slug)) {
        slug = `${cleanSlug(p.slug, "project").slice(0, 50)}-${seq++}`;
      }
      seenSlugs.add(slug);
      const kind: ProjectKind =
        p.kind === "detection" || p.kind === "research" || p.kind === "hackathon" || p.kind === "apps"
          ? p.kind
          : "apps";
      const body = cleanStringList(p.body, 20, 1200);
      const points = cleanStringList(p.points, 25, 400);
      const tools = cleanStringList(p.tools, 30, 80);
      const links = cleanLinks(p.links, 10);
      const people = cleanOptionalText(p.people, 400);
      const aliases = cleanStringList(p.aliases, 12, 40)
        .map((a) => cleanSlug(a, ""))
        .filter((a) => a.length > 0 && a !== slug);
      const image = cleanMediaPath(p.image);
      parsed.push({
        slug,
        title,
        date,
        summary,
        body,
        ...(points.length > 0 ? { points } : {}),
        tools,
        links,
        people,
        aliases,
        ...(image ? { image } : {}),
        kind,
      });
      if (parsed.length >= 60) break;
    }
    if (parsed.length > 0) projectsOut = parsed;
  }

  // 5. Earlier
  let earlierOut: EarlierItem[] = fallback.earlier;
  if (Array.isArray(input.earlier)) {
    const parsed: EarlierItem[] = [];
    for (const item of input.earlier) {
      if (!item || typeof item !== "object") continue;
      const e = item as Partial<Record<keyof EarlierItem, unknown>>;
      const date = cleanText(e.date, 80);
      const text = cleanText(e.text, 600);
      if (!date || !text) continue;
      const image = cleanMediaPath(e.image);
      parsed.push({ date, text, ...(image ? { image } : {}) });
      if (parsed.length >= 30) break;
    }
    earlierOut = parsed;
  }

  // 6. Archive
  let archiveOut: ArchiveItem[] = fallback.archive;
  if (Array.isArray(input.archive)) {
    const parsed: ArchiveItem[] = [];
    for (const item of input.archive) {
      if (!item || typeof item !== "object") continue;
      const a = item as Partial<Record<keyof ArchiveItem, unknown>>;
      const name = cleanText(a.name, 120);
      const href = typeof a.href === "string" && safeUrl(a.href.trim()) ? a.href.trim() : "";
      if (!name || !href) continue;
      parsed.push({ name, href });
      if (parsed.length >= 80) break;
    }
    archiveOut = parsed;
  }

  // 7. SkillGroups
  let skillsOut: SkillGroupsData = fallback.skillGroups;
  if (input.skillGroups && typeof input.skillGroups === "object") {
    const sg = input.skillGroups as Partial<Record<keyof SkillGroupsData, unknown>>;
    skillsOut = {
      lab: Array.isArray(sg.lab) ? cleanStringList(sg.lab, 80, 80) : fallback.skillGroups.lab,
      known: Array.isArray(sg.known) ? cleanStringList(sg.known, 50, 80) : fallback.skillGroups.known,
      learning: Array.isArray(sg.learning) ? cleanStringList(sg.learning, 50, 80) : fallback.skillGroups.learning,
      languages: cleanText(sg.languages, 400) ?? fallback.skillGroups.languages,
      agents: cleanText(sg.agents, 600) ?? fallback.skillGroups.agents,
    };
  }

  // 8. Courses (/certs)
  let coursesOut: CourseItem[] = fallback.courses;
  if (Array.isArray(input.courses)) {
    const parsed: CourseItem[] = [];
    for (const item of input.courses) {
      if (!item || typeof item !== "object") continue;
      const c = item as Partial<Record<keyof CourseItem, unknown>>;
      const title = cleanText(c.title, 160);
      if (!title) continue;
      const id = cleanSlug(c.id, cleanSlug(title, "course"));
      const body = cleanOptionalText(c.body, 800);
      const linkLabel = cleanOptionalText(c.linkLabel, 120);
      const linkHref =
        typeof c.linkHref === "string" && safeUrl(c.linkHref.trim()) ? c.linkHref.trim() : "";
      parsed.push({
        id,
        title,
        body,
        ...(linkLabel && linkHref ? { linkLabel, linkHref } : {}),
      });
      if (parsed.length >= 30) break;
    }
    if (parsed.length > 0) coursesOut = parsed;
  }

  // 9. Profiles & LinkPage
  const profilesOut: Record<"email" | "github" | "linkedin" | "x", Link> = clone(fallback.profiles);
  if (input.profiles && typeof input.profiles === "object") {
    const pr = input.profiles as Partial<Record<"email" | "github" | "linkedin" | "x", unknown>>;
    for (const key of ["email", "github", "linkedin", "x"] as const) {
      const entry = pr[key];
      if (entry && typeof entry === "object") {
        const rec = entry as { label?: unknown; href?: unknown };
        const label = cleanText(rec.label, 120);
        const href = typeof rec.href === "string" && safeUrl(rec.href.trim()) ? rec.href.trim() : "";
        if (label && href) profilesOut[key] = { label, href };
      }
    }
  }
  const linkPageList = cleanLinks(input.linkPage, 20);
  const linkPageOut = linkPageList.length > 0 ? linkPageList : fallback.linkPage;

  // 10. Radio
  let radioOut = fallback.radio;
  if (input.radio && typeof input.radio === "object") {
    const r = input.radio as { title?: unknown; paragraphs?: unknown };
    const title = cleanText(r.title, 160) ?? fallback.radio.title;
    const paragraphs = cleanStringList(r.paragraphs, 12, 1000);
    radioOut = {
      title,
      paragraphs: paragraphs.length > 0 ? paragraphs : fallback.radio.paragraphs,
    };
  }

  // 11. Pictures & Awards
  const cleanShots = (val: unknown, def: Shot[]): Shot[] => {
    if (!Array.isArray(val)) return def;
    const out: Shot[] = [];
    for (const item of val) {
      if (!item || typeof item !== "object") continue;
      const sh = item as Partial<Record<keyof Shot, unknown>>;
      const src = cleanMediaPath(sh.src);
      const title = cleanText(sh.title, 120);
      const caption = cleanText(sh.caption, 500);
      if (src && title && caption) out.push({ src, title, caption });
      if (out.length >= 60) break;
    }
    return out;
  };
  const picturesOut = cleanShots(input.pictures, fallback.pictures);
  const awardsOut = cleanShots(input.awards, fallback.awards);

  // 12. Facts & Nugget
  const factsList = Array.isArray(input.facts) ? cleanStringList(input.facts, 40, 400) : fallback.facts;
  const factsOut = factsList.length > 0 ? factsList : fallback.facts;
  const nuggetList = Array.isArray(input.nuggetLines)
    ? cleanStringList(input.nuggetLines, 40, 500)
    : fallback.nuggetLines;
  const nuggetLinesOut = nuggetList.length > 0 ? nuggetList : fallback.nuggetLines;

  const nuggetTipsOut: Record<string, string> = { ...fallback.nuggetTips };
  if (input.nuggetTips && typeof input.nuggetTips === "object") {
    for (const [k, v] of Object.entries(input.nuggetTips as Record<string, unknown>)) {
      if (k.startsWith("/") && k.length <= 40) {
        const cleaned = cleanText(v, 500);
        if (cleaned) nuggetTipsOut[k] = cleaned;
      }
    }
  }

  // 13. Translations
  const translationsOut: Record<"es" | "de" | "fr", Record<string, string>> = {
    es: {},
    de: {},
    fr: {},
  };
  if (input.translations && typeof input.translations === "object") {
    const tr = input.translations as Partial<Record<"es" | "de" | "fr", unknown>>;
    for (const lang of ["es", "de", "fr"] as const) {
      const table = tr[lang];
      if (!table || typeof table !== "object") continue;
      for (const [k, v] of Object.entries(table as Record<string, unknown>)) {
        const key = cleanText(k, 1200);
        const val = cleanText(v, 1400);
        if (key && val) translationsOut[lang][key] = val;
      }
    }
  }

  return {
    hero: heroOut,
    bio: bioOut,
    jobs: jobsOut,
    projects: projectsOut,
    earlier: earlierOut,
    archive: archiveOut,
    skillGroups: skillsOut,
    courses: coursesOut,
    profiles: profilesOut,
    linkPage: linkPageOut,
    radio: radioOut,
    pictures: picturesOut,
    awards: awardsOut,
    facts: factsOut,
    nuggetLines: nuggetLinesOut,
    nuggetTips: nuggetTipsOut,
    translations: translationsOut,
  };
}

export function applyPortfolioData(raw: unknown): boolean {
  const data = cleanPortfolioData(raw);
  if (!data) return false;

  // Update hero in-place
  hero.name = data.hero.name;
  hero.avatar = data.hero.avatar;
  hero.title = data.hero.title;
  hero.focus = data.hero.focus;
  hero.since = data.hero.since;
  hero.langs = data.hero.langs;
  hero.roles.splice(0, hero.roles.length, ...data.hero.roles);
  hero.stats.splice(0, hero.stats.length, ...data.hero.stats);
  hero.ticker.splice(0, hero.ticker.length, ...data.hero.ticker);

  // Update bio in-place
  bio.splice(0, bio.length, ...data.bio);

  // Update jobs in-place
  jobs.splice(0, jobs.length, ...data.jobs);

  // Update projects and projectKind in-place
  for (const key of Object.keys(projectKind)) delete projectKind[key];
  const bareProjects: Project[] = data.projects.map(({ kind, ...rest }) => {
    projectKind[rest.slug] = kind;
    return rest;
  });
  projects.splice(0, projects.length, ...bareProjects);

  // Update earlier & archive in-place
  earlier.splice(0, earlier.length, ...data.earlier);
  archive.splice(0, archive.length, ...data.archive);

  // Update skillGroups & skillNotes in-place
  skillGroups.lab.splice(0, skillGroups.lab.length, ...data.skillGroups.lab);
  skillGroups.known.splice(0, skillGroups.known.length, ...data.skillGroups.known);
  skillGroups.learning.splice(0, skillGroups.learning.length, ...data.skillGroups.learning);
  skillNotes.languages = data.skillGroups.languages;
  skillNotes.agents = data.skillGroups.agents;

  // Update courses in-place
  courses.splice(0, courses.length, ...data.courses);

  // Update profiles & linkPage in-place
  profiles.email = { ...data.profiles.email };
  profiles.github = { ...data.profiles.github };
  profiles.linkedin = { ...data.profiles.linkedin };
  profiles.x = { ...data.profiles.x };
  linkPage.splice(0, linkPage.length, ...data.linkPage);

  // Update radio in-place
  radio.title = data.radio.title;
  radio.paragraphs.splice(0, radio.paragraphs.length, ...data.radio.paragraphs);

  // Update PICTURES & AWARDS in-place
  PICTURES.splice(0, PICTURES.length, ...data.pictures);
  AWARDS.splice(0, AWARDS.length, ...data.awards);

  // Update FACTS, NUGGET_LINES, NUGGET_TIPS in-place
  FACTS.splice(0, FACTS.length, ...data.facts);
  NUGGET_LINES.splice(0, NUGGET_LINES.length, ...data.nuggetLines);
  for (const key of Object.keys(NUGGET_TIPS)) delete NUGGET_TIPS[key];
  Object.assign(NUGGET_TIPS, data.nuggetTips);

  // Update custom translations
  for (const lang of ["es", "de", "fr"] as const) {
    customTranslations[lang] = { ...data.translations[lang] };
  }

  return true;
}

export function resetPortfolioData(): void {
  applyPortfolioData(DEFAULT_SNAPSHOT);
  customTranslations.es = {};
  customTranslations.de = {};
  customTranslations.fr = {};
}
