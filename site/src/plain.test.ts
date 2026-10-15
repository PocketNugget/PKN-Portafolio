import { describe, expect, it } from "vitest";
import { readNotes } from "./desktop/pad";
import { cleanBlock, cleanLine } from "./plain";

describe("plain text", () => {
  it("keeps a normal note and drops markup", () => {
    expect(cleanLine("Ada", 40)).toBe("Ada");
    expect(cleanBlock("Tom & Jerry said \"hi\"\nsecond", 600, 8)).toBe("Tom & Jerry said \"hi\"\nsecond");
    expect(cleanBlock("hello <script>alert(1)</script>", 600, 8)).toBeNull();
    expect(cleanBlock("hello \uFF1Cscript\uFF1E", 600, 8)).toBeNull();
    expect(cleanBlock("hello <\u200Bscript>", 600, 8)).toBeNull();
    expect(cleanLine("Ada\u202E", 40)).toBe("Ada");
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
        ],
      }),
    ).toEqual([{ id: 1, name: "Ada", body: "Tom & Jerry", created }]);
  });
});
