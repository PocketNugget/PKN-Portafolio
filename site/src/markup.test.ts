import { describe, expect, it } from "vitest";
import { assertSafeHtml, renderNote, safeUrl } from "./markup";

describe("markup", () => {
  it("allows http, mailto, and a local path", () => {
    expect(safeUrl("https://example.com/a")).toBe(true);
    expect(safeUrl("http://example.com/a")).toBe(true);
    expect(safeUrl("/work/sdr")).toBe(true);
    expect(safeUrl("/media/me.png")).toBe(true);
    expect(safeUrl("mailto:goben.ca.pkn@hotmail.com")).toBe(true);
    expect(safeUrl("https://www.youtube.com/@Nuggz_TV")).toBe(true);
  });

  it("rejects scriptable and ambiguous urls", () => {
    expect(safeUrl("")).toBe(false);
    expect(safeUrl(" https://example.com")).toBe(false);
    expect(safeUrl("javascript:alert(1)")).toBe(false);
    expect(safeUrl("//evil.example")).toBe(false);
    expect(safeUrl("data:text/html,hi")).toBe(false);
    expect(safeUrl("https://user:pass@evil.example/a")).toBe(false);
    expect(safeUrl("/work/../admin")).toBe(false);
    expect(safeUrl("/work/sdr?x=1")).toBe(false);
    expect(safeUrl("mailto:a@b.co?subject=x")).toBe(false);
    expect(safeUrl(`https://example.com/\n`)).toBe(false);
    expect(safeUrl("https://example.com/a\\b")).toBe(false);
    expect(safeUrl("a".repeat(301))).toBe(false);
  });

  it("renders lists, code, and only safe anchors", () => {
    expect(renderNote("- a\n- b <c>")).toBe("<ul><li>a</li><li>b &lt;c&gt;</li></ul>");
    expect(renderNote("use `<script>`")).toBe("<p>use <code>&lt;script&gt;</code></p>");
    expect(renderNote("see [home](/work/sdr)")).toBe('<p>see <a href="/work/sdr">home</a></p>');
    const mail = renderNote("see [me](mailto:goben.ca.pkn@hotmail.com)");
    expect(mail).toContain('href="mailto:goben.ca.pkn@hotmail.com"');
    expect(mail).toContain('rel="noreferrer noopener"');
    expect(renderNote("see [x](https://user:pass@evil.example/a)")).toBe("<p>see x</p>");
    expect(renderNote("see [x](mailto:a@b.co?subject=x)")).toBe("<p>see x</p>");
    expect(renderNote("Tom & Jerry")).toBe("<p>Tom &amp; Jerry</p>");
    expect(renderNote("")).toBe("<p></p>");
  });

  it("rejects html the renderer did not emit", () => {
    expect(() => assertSafeHtml("<p>5 < 10</p>")).toThrow(/rejected html/);
    expect(assertSafeHtml("<p>5 &lt; 10</p>")).toBe("<p>5 &lt; 10</p>");
    expect(() => assertSafeHtml("<p")).toThrow(/rejected html/);
    expect(() => assertSafeHtml('<a href="javascript:alert(1)">x</a>')).toThrow(/rejected html/);
    expect(() => assertSafeHtml('<a href="https://example.com" onclick="x">x</a>')).toThrow(/rejected html/);
    expect(assertSafeHtml('<a href="https://example.com/a" rel="noreferrer noopener">x</a>')).toContain("example.com");
  });
});
