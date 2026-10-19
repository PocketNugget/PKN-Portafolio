// UI audit across Chromium, WebKit (Safari's engine), and Firefox with Playwright. Opens every
// window at web, tablet, and phone sizes and fails on anything crooked or hard to read: windows
// outside the desk, sideways overflow, clipped title bars, non-square game cells, small targets,
// small type, a missing reading face, or axe WCAG 2.2 AA violations.
//
//   npm run build && ./node_modules/.bin/vite preview --port 4173 &
//   PLAYWRIGHT=/path/to/node_modules/playwright/index.js \
//     node scripts/ui-audit.mjs http://localhost:4173 [chromium,webkit,firefox] [shots-dir]
//
// Playwright is not a site dependency. Point PLAYWRIGHT at any install that has the browsers.
// axe-core is fetched pinned from cdnjs.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const base = process.argv[2] ?? "http://localhost:4173";
const engines = (process.argv[3] ?? "chromium,webkit,firefox").split(",");
const shots = process.argv[4] ?? "";
const pw = await import(process.env.PLAYWRIGHT ? pathToFileURL(process.env.PLAYWRIGHT).href : "playwright");
const AXE = await (await fetch("https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js")).text();

const VIEWS = [
  { name: "web-1280x800", w: 1280, h: 800, touch: false },
  { name: "web-1366x768", w: 1366, h: 768, touch: false },
  { name: "web-1440x900", w: 1440, h: 900, touch: false },
  { name: "web-1920x1080", w: 1920, h: 1080, touch: false },
  { name: "web-1024x768", w: 1024, h: 768, touch: false },
  { name: "tablet-820x1180", w: 820, h: 1180, touch: true },
  { name: "phone-390x844", w: 390, h: 844, touch: true },
  { name: "phone-360x740", w: 360, h: 740, touch: true },
  { name: "phone-430x932", w: 430, h: 932, touch: true },
  { name: "phone-land-844x390", w: 844, h: 390, touch: true },
];

const PATHS = [
  "/", "/jobs", "/work", "/skills", "/notes", "/certs", "/blog", "/pad", "/contact", "/terminal", "/games",
  "/accessories", "/pictures", "/awards", "/radio", "/links", "/help", "/display", "/colophon", "/legal", "/facts",
  "/run", "/find", "/snake", "/tetris", "/tron", "/sweep", "/player", "/convert", "/dice", "/flip", "/math", "/wheel",
];
const SHOT = new Set(["/", "/jobs", "/work/maia", "/games", "/contact", "/tetris", "/skills"]);
// Game grids are dense by design; AA (24px) still applies, the 44px touch goal does not.
const DENSE = new Set(["/sweep"]);

const failures = [];
const notes = [];
const fail = (where, what, detail) => failures.push(`[${where}] ${what}: ${detail}`);
if (shots) mkdirSync(shots, { recursive: true });

const deskCheck = () => {
  const area = document.querySelector("#desktop").getBoundingClientRect();
  const bar = document.querySelector("#taskbar").getBoundingClientRect();
  const strip = document.querySelector("#icons").getBoundingClientRect();
  const icons = [...document.querySelectorAll("#icons .desk-icon")]
    .map((el) => ({ id: el.dataset.app, r: el.getBoundingClientRect(), svg: el.querySelector("svg").getBoundingClientRect(), label: el.querySelector(".label") }))
    .filter((icon) => icon.r.width && icon.r.bottom > strip.top + 1 && icon.r.top < strip.bottom - 1);
  const social = [...document.querySelectorAll("#social a")].map((el) => el.getBoundingClientRect());
  const hit = (a, b) => a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1;
  const out = [];
  // The phone icon strip scrolls; only the part of an icon inside the strip is on screen.
  for (const icon of icons) icon.r = new DOMRect(icon.r.left, Math.max(icon.r.top, strip.top), icon.r.width, Math.max(0, Math.min(icon.r.bottom, strip.bottom) - Math.max(icon.r.top, strip.top)));
  for (const icon of icons) {
    if (icon.r.left < area.left - 1 || icon.r.right > area.right + 1) out.push(icon.id + " outside the desk");
    for (const other of icons) if (other !== icon && hit(icon.r, other.r)) out.push(icon.id + " overlaps " + other.id);
    for (const s of social) if (hit(icon.r, s)) out.push(icon.id + " overlaps the social row");
    const size = parseFloat(getComputedStyle(icon.label).fontSize);
    if (size < 12) out.push(icon.id + " label " + size + "px");
  }
  for (const item of document.querySelectorAll("#taskbar button, #clock")) {
    const r = item.getBoundingClientRect();
    if (r.width && (r.top < bar.top - 1 || r.bottom > bar.bottom + 1 || r.right > bar.right + 1)) out.push("taskbar item " + (item.id || item.className) + " spills out of the bar");
    const size = parseFloat(getComputedStyle(item).fontSize);
    if (r.width && size < 13) out.push("taskbar " + (item.id || item.className) + " text " + size + "px");
  }
  const balloon = document.querySelector("#clippy .balloon p");
  if (balloon && balloon.getBoundingClientRect().width && parseFloat(getComputedStyle(balloon).fontSize) < 14) out.push("nugget balloon text " + getComputedStyle(balloon).fontSize);
  return { out: [...new Set(out)], icon: icons[0] ? Math.round(icons[0].svg.width) : 0, count: icons.length };
};

const arrivalCheck = () => {
  const wins = [...document.querySelectorAll(".desk-win")];
  const area = document.querySelector("#desktop").getBoundingClientRect();
  const about = wins.find((w) => w.querySelector(".hero"));
  if (!about) return { error: "About did not open" };
  const r = about.getBoundingClientRect();
  const seen = (sel) => {
    const e = about.querySelector(sel);
    if (!e) return "missing";
    const b = e.getBoundingClientRect();
    if (b.bottom > innerHeight || b.top < 0) return "below the fold";
    const top = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2);
    return top && (e === top || e.contains(top)) ? "ok" : "covered by " + (top?.id || top?.className);
  };
  return {
    count: wins.length,
    dx: Math.round(r.left - area.left - (area.right - r.right)),
    dy: Math.round(r.top - area.top - (area.bottom - r.bottom)),
    max: about.classList.contains("max"),
    name: seen(".hero-name"),
    role: seen(".hero-role"),
    open: seen(".hero-open"),
    mail: seen(".hero-mail"),
  };
};

const windowCheck = async ({ touch, dense }) => {
  const win = [...document.querySelectorAll(".desk-win")].at(-1);
  if (!win) return { out: ["no window opened"] };
  const area = document.querySelector("#desktop").getBoundingClientRect();
  const r = win.getBoundingClientRect();
  const body = win.querySelector(".window-body");
  const title = win.querySelector(".title-bar");
  const out = [];
  const phone = matchMedia("(max-width: 700px), (pointer: coarse) and (max-height: 500px)").matches;
  const name = (el) => (el.className && typeof el.className === "string" ? el.className.split(" ")[0] : el.tagName) + "[" + (el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 14) + "]";
  if (r.left < area.left - 1 || r.top < area.top - 1 || r.right > area.right + 1 || r.bottom > area.bottom + 1) out.push("window outside the desk " + [r.left, r.top, r.right, r.bottom].map(Math.round).join(","));
  for (const v of [r.left - area.left, r.top - area.top, r.width, r.height]) if (Math.abs(v - Math.round(v)) > 0.05) { out.push("window on a fraction of a pixel " + v.toFixed(2)); break; }
  const tr = title.getBoundingClientRect();
  for (const b of title.querySelectorAll(".title-bar-controls button")) {
    const br = b.getBoundingClientRect();
    if (!br.width) continue;
    if (br.right > tr.right + 1 || br.left < tr.left - 1 || br.bottom > tr.bottom + 1) out.push("title-bar button out of the bar");
    if (br.width < 24 || br.height < 24) out.push("title-bar button " + b.getAttribute("aria-label") + " " + Math.round(br.width) + "x" + Math.round(br.height));
  }
  const titleText = title.querySelector(".title-bar-text");
  if (parseFloat(getComputedStyle(titleText).fontSize) < 14) out.push("title text " + getComputedStyle(titleText).fontSize);
  if (body.scrollWidth > body.clientWidth + 1) out.push("body scrolls sideways by " + (body.scrollWidth - body.clientWidth) + "px");
  const br = body.getBoundingClientRect();
  const clipped = (el) => {
    for (let p = el.parentElement; p && p !== body; p = p.parentElement) if (/(auto|scroll|hidden|clip)/.test(getComputedStyle(p).overflowX)) return true;
    return false;
  };
  const wide = [...body.querySelectorAll("*")]
    .filter((el) => { const e = el.getBoundingClientRect(); return e.width > 0 && e.right > br.right + 1 && !clipped(el); })
    .slice(0, 3)
    .map((el) => name(el) + " +" + Math.round(el.getBoundingClientRect().right - br.right));
  if (wide.length) out.push("content past the right edge: " + wide.join(", "));
  for (const img of body.querySelectorAll("img[src]")) {
    if (img.complete && img.naturalWidth === 0) out.push("broken image " + img.getAttribute("src"));
    if (img.getBoundingClientRect().width > br.width + 1) out.push("image wider than the window " + img.getAttribute("src"));
  }
  const board = body.querySelector(".play-board");
  if (board && board.firstElementChild) {
    const cell = board.firstElementChild.getBoundingClientRect();
    if (Math.abs(cell.width - cell.height) > 1) out.push("game cells not square " + cell.width.toFixed(1) + "x" + cell.height.toFixed(1));
  }
  const small = [...win.querySelectorAll("a[href], button, input, select, textarea")]
    .filter((el) => {
      const e = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      if (!e.width || !e.height || s.visibility === "hidden" || el.closest("[aria-hidden=true], .title-bar")) return false;
      if (e.bottom < br.top || e.top > br.bottom) return false;
      if (el.tagName === "A" && s.display === "inline" && el.closest("p, li, dd, td")) return false;
      const goal = (phone || touch) && !dense ? 44 : 24;
      return e.height < goal - 0.5 || e.width < goal - 0.5;
    })
    .slice(0, 4)
    .map((el) => name(el) + " " + Math.round(el.getBoundingClientRect().width) + "x" + Math.round(el.getBoundingClientRect().height));
  if (small.length) out.push("small targets: " + small.join(", "));
  const tiny = [...body.querySelectorAll("p, li, dt, dd, a, button, label, legend, span, b, td, th, h1, h2, h3, h4, input, select")]
    .filter((el) => {
      const e = el.getBoundingClientRect();
      if (!e.width || !e.height || el.closest("[aria-hidden=true]") || !el.textContent.trim()) return false;
      if (e.bottom < br.top || e.top > br.bottom) return false;
      return parseFloat(getComputedStyle(el).fontSize) < 13;
    })
    .slice(0, 4)
    .map((el) => name(el) + " " + getComputedStyle(el).fontSize);
  if (tiny.length) out.push("small type: " + tiny.join(", "));
  if (body.classList.contains("doc")) {
    const p = [...body.querySelectorAll("p")].find((el) => !el.closest(".hero-top, .hero-stats") && !el.matches(".meta, .path, .tools, .links") && el.textContent.trim().length > 40);
    if (p) {
      const s = getComputedStyle(p);
      if (!/Tahoma|Verdana|Segoe|DejaVu/.test(s.fontFamily)) out.push("reading face missing: " + s.fontFamily);
      if (parseFloat(s.fontSize) < 16) out.push("reading text " + s.fontSize);
      if (parseFloat(s.lineHeight) / parseFloat(s.fontSize) < 1.4) out.push("reading line height " + s.lineHeight);
    }
  }
  const res = await window.axe.run(win, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] } });
  for (const v of res.violations) out.push("axe " + v.id + " x" + v.nodes.length + ": " + v.nodes.slice(0, 2).map((n) => n.target.join(" ")).join(" | "));
  return { out };
};

for (const engine of engines) {
  const browser = await pw[engine].launch();
  for (const view of VIEWS) {
    const where = `${engine} ${view.name}`;
    const options = { viewport: { width: view.w, height: view.h }, hasTouch: view.touch, reducedMotion: "reduce" };
    if (engine !== "firefox") options.isMobile = view.touch && view.w < 700;
    const context = await browser.newContext(options);
    const page = await context.newPage();
    const errors = [];
    // Errors thrown by YouTube's own frames are not this site's code.
    page.on("pageerror", (error) => {
      const text = String(error.message).split("\n")[0];
      if (!/doubleclick|googleads|youtube\.com/.test(text)) errors.push(text);
    });
    await page.goto(`${base}/`);
    await page.evaluate(() => {
      sessionStorage.clear();
      sessionStorage.setItem("pkn-boot", "1");
    });
    await page.goto(`${base}/`);
    await page.waitForSelector(".desk-win .hero");
    await page.waitForTimeout(500);
    await page.addScriptTag({ content: AXE });
    const desk = await page.evaluate(deskCheck);
    for (const item of desk.out) fail(where, "desk", item);
    notes.push(`[${where}] ${desk.count} desk icons at ${desk.icon}px`);
    const arrival = await page.evaluate(arrivalCheck);
    if (arrival.error) fail(where, "arrival", arrival.error);
    else {
      if (arrival.count !== 1) fail(where, "arrival", `${arrival.count} windows open instead of 1`);
      if (!arrival.max && (Math.abs(arrival.dx) > 2 || Math.abs(arrival.dy) > 2)) fail(where, "arrival", `About is off center by ${arrival.dx}, ${arrival.dy}`);
      for (const key of ["name", "role", "open", "mail"]) if (arrival[key] !== "ok") fail(where, "5-second test", `${key} ${arrival[key]}`);
    }
    if (shots) await page.screenshot({ path: join(shots, `${engine}-${view.name}-0-arrival.png`) });
    const work = await page.evaluate(() => [...new Set([...document.querySelectorAll("#print-pack a[href^='/work/']")].map((a) => a.getAttribute("href")))]);
    for (const path of [...PATHS, ...work, "/notes/jingle-trouble", "/notes/model-files", "/hack"]) {
      await page.evaluate((href) => {
        let n = 0;
        while (document.querySelector(".desk-win") && n < 30) {
          document.querySelector(".desk-win .title-bar-controls button[aria-label=Close]").click();
          n += 1;
        }
        const a = document.createElement("a");
        a.href = href;
        document.body.append(a);
        a.click();
        a.remove();
      }, path);
      await page.waitForTimeout(path === "/blog" || path === "/player" || path === "/pad" ? 700 : 300);
      const res = await page.evaluate(windowCheck, { touch: view.touch, dense: DENSE.has(path) });
      for (const item of res.out) fail(where, path, item);
      if (shots && SHOT.has(path)) await page.screenshot({ path: join(shots, `${engine}-${view.name}-${path.replace(/\//g, "_")}.png`) });
    }
    for (const error of new Set(errors)) fail(where, "js", error);
    await context.close();
  }
  await browser.close();
}

for (const line of notes) console.log(line);
if (failures.length) {
  console.log(`\n${failures.length} UI failures`);
  for (const line of failures) console.log(" - " + line);
  if (shots) writeFileSync(join(shots, "failures.txt"), failures.join("\n"));
  process.exit(1);
}
console.log("\nUI audit: 0 failures");
