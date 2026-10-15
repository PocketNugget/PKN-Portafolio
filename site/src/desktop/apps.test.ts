import { describe, expect, it } from "vitest";
import { FACTS } from "./facts";
import { ICONS } from "./icons";
import { AWARDS, PICTURES } from "./media";
import { TRACKS } from "./player";

describe("desktop media", () => {
  it("points every photo and certificate at /media", () => {
    const shots = [...PICTURES, ...AWARDS];
    expect(shots.length).toBeGreaterThan(10);
    const files = new Set(shots.map((shot) => shot.src));
    expect(files.has("/media/me.png")).toBe(true);
    expect(files.has("/media/htb-university-2025.jpg")).toBe(true);
    expect(files.has("/media/htb-apocalypse-2025.jpg")).toBe(true);
    for (const shot of shots) {
      expect(shot.src.startsWith("/media/")).toBe(true);
      expect(shot.title.length).toBeGreaterThan(0);
      expect(shot.caption).not.toContain("—");
      expect(shot.caption).not.toContain("40%");
    }
  });

  it("does not invent a 2024 Apocalypse ranking", () => {
    const shot = AWARDS.find((item) => item.src.endsWith("/htb-apocalypse-2024.jpg"));
    expect(shot?.caption).toContain("2024");
    expect(shot?.caption.toLowerCase()).not.toContain("rank");
  });

  it("keeps facts inside the existing record", () => {
    const text = FACTS.join("\n");
    expect(text).toContain("9.0/10");
    expect(text).toContain("52 of 1,014");
    expect(text).toContain("34,125");
    expect(text).toContain("read the diff");
    expect(text.toLowerCase()).not.toContain("cylance");
    expect(text).not.toContain("—");
    expect(text).not.toContain("40%");
    expect(text).not.toContain("J-1");
    expect(text).not.toContain("Cultural Vistas");
  });

  it("uses original player titles", () => {
    expect(TRACKS.length).toBeGreaterThan(1);
    for (const track of TRACKS) {
      expect(track.notes.length).toBeGreaterThan(3);
      expect(track.title.toLowerCase()).not.toContain("metallica");
    }
  });

  it("keeps icon markup free of handlers", () => {
    expect(Object.keys(ICONS).length).toBeGreaterThan(5);
    for (const svg of Object.values(ICONS)) {
      expect(svg.startsWith("<svg")).toBe(true);
      expect(svg).not.toMatch(/<script/i);
      expect(svg).not.toMatch(/\son\w+\s*=/i);
    }
  });
});
