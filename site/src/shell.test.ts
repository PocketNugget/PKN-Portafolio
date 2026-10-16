import { describe, expect, it } from "vitest";
import { openTable } from "./catalog";
import { safeUrl } from "./markup";
import {
  COMMANDS,
  applyCompletion,
  completions,
  histDown,
  histUp,
  parseCommand,
  pushHist,
} from "./shell";

const opens = openTable();

describe("parseCommand", () => {
  it("maps the known commands", () => {
    expect(parseCommand("jobs", opens)).toMatchObject({ type: "nav", path: "/jobs" });
    expect(parseCommand("projects", opens)).toMatchObject({ type: "nav", path: "/work" });
    expect(parseCommand("skills", opens)).toMatchObject({ type: "nav", path: "/skills" });
    expect(parseCommand("certs", opens)).toMatchObject({ type: "nav", path: "/certs" });
    expect(parseCommand("awards", opens)).toMatchObject({ type: "nav", path: "/awards" });
    expect(parseCommand("writeups", opens)).toMatchObject({ type: "nav", path: "/notes" });
    expect(parseCommand("pictures", opens)).toMatchObject({ type: "nav", path: "/pictures" });
    expect(parseCommand("hack", opens)).toMatchObject({ type: "nav", path: "/hack" });
    expect(parseCommand("radio", opens)).toMatchObject({ type: "nav", path: "/radio" });
    expect(parseCommand("contact", opens)).toMatchObject({ type: "nav", path: "/contact" });
    expect(parseCommand("blog", opens)).toMatchObject({ type: "nav", path: "/blog" });
    expect(parseCommand("links", opens)).toMatchObject({ type: "nav", path: "/links" });
    expect(parseCommand("pad", opens)).toMatchObject({ type: "nav", path: "/pad" });
    expect(parseCommand("login", opens).type).toBe("error");
    expect(parseCommand("clear", opens)).toMatchObject({ type: "nav", path: "/", echo: "whoami" });
    expect(parseCommand("   ", opens)).toEqual({ type: "noop" });
  });

  it("rejects unknown commands with one line", () => {
    const step = parseCommand("nope", opens);
    expect(step).toMatchObject({ type: "error" });
    if (step.type === "error") {
      expect(step.message).toBe("nope: command not found. try `help`.");
    }
  });

  it("opens a project, a missing name, and an external profile", () => {
    expect(parseCommand("open htb", opens)).toMatchObject({
      type: "nav",
      path: "/work/htb-university-2025",
    });
    expect(parseCommand("open nope", opens)).toMatchObject({ type: "error" });
    expect(parseCommand("open", opens)).toMatchObject({ type: "error" });
    expect(parseCommand("open github", opens)).toMatchObject({
      type: "external",
      href: "https://github.com/PocketNugget",
    });
    expect(parseCommand("  JoBs  ", opens)).toMatchObject({ type: "nav", path: "/jobs" });
    expect(parseCommand("open  GitHub", opens)).toMatchObject({
      type: "external",
      href: "https://github.com/PocketNugget",
    });
    expect(parseCommand("open bad", { bad: "javascript:alert(1)" }).type).toBe("nav");
    for (const href of Object.values(opens)) expect(safeUrl(href)).toBe(true);
    for (const cmd of COMMANDS) {
      if (cmd === "open" || cmd === "snake" || cmd === "tetris" || cmd === "tron" || cmd === "exit") continue;
      expect(parseCommand(cmd, opens).type).toBe("nav");
    }
  });
});

describe("completion and history", () => {
  it("completes a single command and lists several", () => {
    expect(completions("jo", [])).toEqual(["jobs"]);
    expect(applyCompletion("jo", ["jobs"])).toBe("jobs ");
    expect(completions("open htb", ["htb", "maia"])).toEqual(["htb"]);
    expect(completions("open ", ["b", "a"])).toEqual(["a", "b"]);
    expect(completions("open htb extra", ["htb"])).toEqual([]);
    expect(completions("OPEN", [])).toEqual(["open"]);
    expect(applyCompletion("open h", ["htb"])).toBe("open htb ");
    const many = completions("c", []);
    expect(many).toEqual(["certs", "contact", "colophon", "clear"]);
  });

  it("walks history without duplicating the latest line", () => {
    let items = pushHist([], "jobs");
    items = pushHist(items, "jobs");
    items = pushHist(items, "radio");
    expect(items).toEqual(["jobs", "radio"]);
    const up = histUp(items, -1, "", "");
    expect(up.value).toBe("radio");
    const older = histUp(items, up.index, up.draft, up.value);
    expect(older.value).toBe("jobs");
    const back = histDown(items, older.index, older.draft);
    expect(back.value).toBe("radio");
    const live = histDown(items, items.length - 1, "draft");
    expect(live).toMatchObject({ index: -1, value: "draft" });
    expect(histUp([], -1, "", "now")).toEqual({ index: -1, draft: "", value: "now" });
    let capped: string[] = [];
    for (let i = 0; i < 90; i += 1) capped = pushHist(capped, `cmd${i}`);
    expect(capped).toHaveLength(80);
    expect(capped[0]).toBe("cmd10");
    expect(capped[79]).toBe("cmd89");
  });

  it("exposes every help command to tab", () => {
    expect(COMMANDS).toContain("writeups");
    expect(COMMANDS).toContain("pad");
    expect(COMMANDS).not.toContain("login");
    expect(COMMANDS).not.toContain("sudo");
  });
});
