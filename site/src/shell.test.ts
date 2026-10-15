import { describe, expect, it } from "vitest";
import { openTable } from "./catalog";
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
    expect(parseCommand("radio", opens)).toMatchObject({ type: "nav", path: "/radio" });
    expect(parseCommand("contact", opens)).toMatchObject({ type: "nav", path: "/contact" });
    expect(parseCommand("blog", opens)).toMatchObject({ type: "nav", path: "/blog" });
    expect(parseCommand("links", opens)).toMatchObject({ type: "nav", path: "/links" });
    expect(parseCommand("login", opens)).toMatchObject({ type: "nav", path: "/admin/login" });
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
  });
});

describe("completion and history", () => {
  it("completes a single command and lists several", () => {
    expect(completions("jo", [])).toEqual(["jobs"]);
    expect(applyCompletion("jo", ["jobs"])).toBe("jobs ");
    expect(completions("open htb", ["htb", "maia"])).toEqual(["htb"]);
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
  });

  it("exposes every help command to tab", () => {
    expect(COMMANDS).toContain("writeups");
    expect(COMMANDS).not.toContain("sudo");
  });
});
