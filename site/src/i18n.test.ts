import { afterEach, describe, expect, it } from "vitest";
import { getLang, setLang, t } from "./i18n";

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
});
