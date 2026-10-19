import { describe, expect, it } from "vitest";
import { notes, projects } from "../catalog";
import { APPS, initialRect } from "./desktop";

// Desk area is the viewport minus the taskbar: 48px on a desktop, 44px on a phone.
const VIEWS = [
  { name: "1280x800", w: 1280, h: 800 - 48, narrow: false },
  { name: "1440x900", w: 1440, h: 900 - 48, narrow: false },
  { name: "1920x1080", w: 1920, h: 1080 - 48, narrow: false },
  { name: "1024x768", w: 1024, h: 768 - 48, narrow: false },
  { name: "1366x768", w: 1366, h: 768 - 48, narrow: false },
  { name: "390x844", w: 390, h: 844 - 44, narrow: true },
  { name: "360x740", w: 360, h: 740 - 44, narrow: true },
  { name: "430x932", w: 430, h: 932 - 44, narrow: true },
  { name: "844x390", w: 844, h: 390 - 44, narrow: true },
];

const PATHS = [
  ...APPS.map((app) => app.path),
  ...projects.map((project) => `/work/${project.slug}`),
  ...notes.map((note) => `/notes/${note.slug}`),
];

describe("window geometry", () => {
  for (const view of VIEWS) {
    it(`every window fits whole and square to the pixel at ${view.name}`, () => {
      for (const path of PATHS) {
        for (let cascade = 0; cascade < 12; cascade += 1) {
          const r = initialRect(path, view.w, view.h, cascade, view.narrow);
          const where = `${path} #${cascade} ${JSON.stringify(r)}`;
          for (const value of [r.x, r.y, r.w, r.h]) expect(Number.isInteger(value), where).toBe(true);
          expect(r.x, where).toBeGreaterThanOrEqual(0);
          expect(r.y, where).toBeGreaterThanOrEqual(0);
          expect(r.x + r.w, where).toBeLessThanOrEqual(view.w);
          expect(r.y + r.h, where).toBeLessThanOrEqual(view.h);
          expect(r.w, where).toBeGreaterThanOrEqual(Math.min(240, view.w));
          expect(r.h, where).toBeGreaterThanOrEqual(Math.min(160, view.h));
        }
      }
    });
  }

  it("centers About on arrival on a desktop", () => {
    for (const view of VIEWS.filter((item) => !item.narrow)) {
      const r = initialRect("/", view.w, view.h, 0, false);
      expect(Math.abs(r.x - (view.w - r.x - r.w))).toBeLessThanOrEqual(1);
      expect(Math.abs(r.y - (view.h - r.y - r.h))).toBeLessThanOrEqual(1);
    }
  });

  it("fills the desk on a phone", () => {
    for (const view of VIEWS.filter((item) => item.narrow)) {
      expect(initialRect("/jobs", view.w, view.h, 3, true)).toEqual({ x: 0, y: 0, w: view.w, h: view.h });
    }
  });

  it("cascades later windows so title bars stay readable", () => {
    const first = initialRect("/jobs", 1280, 752, 1, false);
    const second = initialRect("/work", 1280, 752, 2, false);
    expect(second.x - first.x).toBe(22);
    expect(second.y - first.y).toBe(20);
  });
});
