import { describe, expect, it } from "vitest";
import script from "../../public/vendor/webdeck-player/script.js?raw";
import { FACTS, NUGGET_LINES, NUGGET_SCARE, NUGGET_TIPS } from "./facts";
import { ICONS } from "./icons";
import { AWARDS, PICTURES } from "./media";
import { PLAYER_PAGE } from "./player";

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

  it("has the nugget speak to the visitor from the same record", () => {
    expect(NUGGET_LINES).toHaveLength(FACTS.length);
    const spoken = NUGGET_LINES.join("\n");
    expect(spoken).toContain("9.0/10");
    expect(spoken).toContain("52 of 1,014");
    expect(spoken).toContain("34,125");
    expect(spoken).toContain("read the diff");
    expect(spoken).not.toContain("—");
    expect(spoken).not.toContain("40%");
    expect(spoken).not.toContain("J-1");
    expect(spoken).not.toContain("Cultural Vistas");
    expect(spoken).not.toContain("Azuany");
    for (const line of NUGGET_LINES) expect(line.toLowerCase()).toContain("you");
    expect(NUGGET_LINES[0]).toContain("You are looking at Goben's desk.");
    expect(NUGGET_LINES[0].toLowerCase()).toContain("guide you");
    expect(NUGGET_LINES[0].toLowerCase()).toContain("fun facts");
    expect(NUGGET_LINES[0].toLowerCase()).toContain("tips");
    expect(NUGGET_SCARE.toLowerCase()).toContain("you");
    expect(NUGGET_SCARE.toLowerCase()).toContain("hack");
    expect(NUGGET_SCARE).not.toMatch(/fake|falso/i);
    expect(NUGGET_TIPS["/"]).toMatch(/Jobs/);
    expect(NUGGET_TIPS["/jobs"]?.toLowerCase()).toContain("you");
    expect(NUGGET_TIPS["/jobs"]).not.toContain("Mexico City");
    expect(NUGGET_TIPS["/hack"]).toBeUndefined();
  });

  it("opens Floral Radio in the silver theme through the vendored player", () => {
    expect(PLAYER_PAGE).toBe("/vendor/webdeck-player/index.html");
    expect(script).toContain("srYi1mTO5kA");
    expect(script).toContain("bAgmGZ9iQ2Y");
    expect(script).toContain("RDbAgmGZ9iQ2Y");
    expect(script).toContain("JfCNwhWWdCs");
    expect(script).toContain('currentTheme = "SILVER"');
    expect(script).toContain('currentPlaylist = "Floral Radio"');
    expect(script).toContain("playlistSelector.value = currentPlaylist");
    expect(script).toContain("loadVideoById");
    expect(script).toContain("controls");
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
