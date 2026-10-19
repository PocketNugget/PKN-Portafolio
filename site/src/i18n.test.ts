import { afterEach, describe, expect, it } from "vitest";
import { bio, earlier, hero, jobs, projects, radio } from "./catalog";
import { FACTS, NUGGET_HACKED, NUGGET_LINES, NUGGET_RELIEF, NUGGET_SCARE, NUGGET_TIPS } from "./desktop/facts";
import { HACK_LINES, HACK_POPS } from "./desktop/hack";
import { AWARDS, PICTURES } from "./desktop/media";
import { getLang, setLang, t } from "./i18n";
import { noteBySlug, noteSource } from "./notes";
import { HELP } from "./shell";

describe("i18n", () => {
  afterEach(() => {
    setLang("en");
  });

  it("keeps English until a known language is selected", () => {
    expect(getLang()).toBe("en");
    expect(t("Suggestions")).toBe("Suggestions");
    setLang("nope");
    expect(getLang()).toBe("en");
    expect(t("Suggestions")).toBe("Suggestions");
    expect(t("this string is not translated")).toBe("this string is not translated");
  });

  it("translates the suggestions label", () => {
    setLang("es");
    expect(t("Suggestions")).toBe("Sugerencias");
    setLang("de");
    expect(t("Suggestions")).toBe("Vorschläge");
    setLang("fr");
    expect(t("Suggestions")).toBe("Suggestions");
    expect(t("A coding agent can draft a change. I still read the diff.")).toContain("diff");
  });

  it("translates the record and the nugget in every language", () => {
    const lines = [
      ...bio,
      hero.title,
      "In projects and the lab",
      "Known, not used at work",
      "I know them. I do not list them as work experience.",
      "Not earned and not work experience. These are what I am studying now.",
      hero.since,
      ...hero.roles,
      hero.open,
      ...hero.stats.map((stat) => stat.label),
      ...radio.paragraphs,
      ...earlier.map((item) => item.text),
      ...FACTS,
      ...NUGGET_LINES,
      NUGGET_SCARE,
      ...NUGGET_HACKED,
      NUGGET_RELIEF,
      ...Object.values(NUGGET_TIPS),
      ...HELP.map((line) => line.blurb),
      ...HACK_LINES,
      ...HACK_POPS.map((pop) => pop.body),
      ...[...PICTURES, ...AWARDS].map((shot) => shot.caption),
      ...["jingle-trouble", "model-files"].map((slug) => {
        const meta = noteBySlug(slug);
        if (!meta) throw new Error(slug);
        return noteSource(meta).replace(/\s+$/, "");
      }),
    ];
    for (const job of jobs) lines.push(job.role, job.place, job.date, job.summary, ...job.body);
    for (const project of projects) {
      lines.push(project.summary, project.date, ...project.body, ...(project.points ?? []));
      if (project.people) lines.push(project.people);
    }
    const skip = new Set(["Remote", "2024", "2025", "2026", "Goben Diego Constantino Aguirre."]);
    for (const lang of ["es", "de", "fr"] as const) {
      setLang(lang);
      for (const line of lines) {
        if (line.length < 12 || skip.has(line)) continue;
        const got = t(line);
        expect(got, `${lang}: ${line.slice(0, 72)}`).not.toBe(line);
        expect(got).not.toContain("—");
        expect(got).not.toContain("40%");
        expect(got).not.toContain("Azuany");
      }
      for (const line of NUGGET_LINES) expect(line.toLowerCase()).toContain("you");
    }
  });
});
