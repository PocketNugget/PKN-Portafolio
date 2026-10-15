import { describe, expect, it } from "vitest";
import { readNotes } from "./desktop/pad";
import { cleanBlock, cleanLine, cleanTags } from "./plain";

describe("plain text", () => {
  it("keeps a normal note and drops markup", () => {
    expect(cleanLine("Ada", 40)).toBe("Ada");
    expect(cleanBlock("Tom & Jerry said \"hi\"\nsecond", 600, 8)).toBe("Tom & Jerry said \"hi\"\nsecond");
    expect(cleanBlock("hello <script>alert(1)</script>", 600, 8)).toBeNull();
    expect(cleanBlock("hello \uFF1Cscript\uFF1E", 600, 8)).toBeNull();
    expect(cleanBlock("hello <\u200Bscript>", 600, 8)).toBeNull();
    expect(cleanLine("Ada\u202E", 40)).toBe("Ada");
    expect(cleanLine("A\u200Bda", 40)).toBe("Ada");
    expect(cleanLine("\uFF11", 40)).toBe("1");
    expect(cleanLine("   ", 40)).toBeNull();
    expect(cleanLine("a\nb", 40)).toBeNull();
    expect(cleanLine("a".repeat(41), 40)).toBeNull();
    expect(cleanBlock("a\tb", 600, 8)).toBe("a b");
    expect(cleanBlock("a\rb", 600, 8)).toBe("a\nb");
    expect(cleanBlock("a\0b", 600, 8)).toBe("ab");
    expect(cleanBlock("a\nb\nc\nd\ne\nf\ng\nh", 600, 8)?.split("\n")).toHaveLength(8);
    expect(cleanBlock("a\nb\nc\nd\ne\nf\ng\nh\ni", 600, 8)).toBeNull();
    expect(cleanTags("")).toBe("");
    expect(cleanTags("soc\nnotes")).toBe("soc notes");
    expect(cleanTags("<script>")).toBeNull();
    expect(cleanTags("a".repeat(201))).toBeNull();
    expect(cleanTags("bell\u0007")).toBeNull();
  });

  it("does not keep a note the page would treat as html", () => {
    const created = "2026-10-14T12:00:00.000Z";
    expect(
      readNotes({
        notes: [
          { id: 1, name: "Ada", body: "Tom & Jerry", created },
          { id: 2, name: "Ada", body: "<img src=x onerror=alert(1)>", created },
          { id: 0, name: "Ada", body: "nope", created },
          { id: 3, name: "<script>", body: "hi", created },
          { id: 1.5, name: "Ada", body: "hi", created },
          { id: 4, name: "Ada", body: "hi", created: "2026-10-14" },
          { id: "5", name: "Ada", body: "hi", created },
        ],
      }),
    ).toEqual([{ id: 1, name: "Ada", body: "Tom & Jerry", created }]);
    expect(readNotes(null)).toEqual([]);
    expect(readNotes({ notes: "nope" })).toEqual([]);
  });
});
