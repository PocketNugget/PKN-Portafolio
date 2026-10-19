import { describe, expect, it } from "vitest";
import { excerptOf, isNew, newPostCount } from "./blog";

const now = Date.parse("2026-10-19T12:00:00Z");

describe("blog", () => {
  it("counts a post as new for four months", () => {
    expect(isNew("2026-10-01T00:00:00.000Z", now)).toBe(true);
    expect(isNew("2026-06-20T00:00:00.000Z", now)).toBe(true);
    expect(isNew("2026-06-10T00:00:00.000Z", now)).toBe(false);
    expect(isNew("not a date", now)).toBe(false);
    expect(isNew("2027-03-01T00:00:00.000Z", now)).toBe(false);
    expect(newPostCount([{ created: "2026-10-10T00:00:00Z" }, { created: "2025-01-01T00:00:00Z" }, { created: "2026-09-01T00:00:00Z" }], now)).toBe(2);
    expect(newPostCount([], now)).toBe(0);
  });

  it("takes a plain excerpt", () => {
    expect(excerptOf("# Title\n\nSome **bold** and [a link](/work) here.")).toBe("Some bold and a link here.");
    expect(excerptOf("```\ncode\n```\n\nafter")).toBe("code");
    expect(excerptOf("")).toBe("");
    expect(excerptOf("word ".repeat(60), 20).endsWith("...")).toBe(true);
    expect(excerptOf("word ".repeat(60), 20).length).toBeLessThanOrEqual(23);
  });
});
