import { afterEach, describe, expect, it } from "vitest";
import { getLang, setLang, t } from "./i18n";

describe("i18n", () => {
  afterEach(() => {
    setLang("en");
  });

  it("keeps English until a known language is selected", () => {
    expect(getLang()).toBe("en");
    expect(t("Notepad")).toBe("Notepad");
    setLang("nope");
    expect(getLang()).toBe("en");
    expect(t("Notepad")).toBe("Notepad");
    expect(t("this string is not translated")).toBe("this string is not translated");
  });

  it("translates the notepad label", () => {
    setLang("es");
    expect(t("Notepad")).toBe("Bloc de notas");
    setLang("de");
    expect(t("Notepad")).toBe("Notizblock");
    setLang("fr");
    expect(t("Notepad")).toBe("Bloc-notes");
    expect(t("A coding agent can draft a change. I still read the diff.")).toContain("diff");
  });
});
