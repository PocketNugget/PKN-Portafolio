import { describe, expect, it } from "vitest";
import { bash, columns, helpLines, listing, wrapText } from "./bash";

const env = { now: new Date(2026, 0, 2, 3, 4, 5), history: ["ls", "pwd"], cols: 40 };

describe("bash-style commands", () => {
  it("lists every command and wraps to the width", () => {
    for (const row of listing(40)) expect(row.length).toBeLessThanOrEqual(40);
    expect(listing(40).join("\n")).toContain("hack");
    expect(listing(40).join("\n")).toContain("neofetch");
    for (const row of helpLines(30)) expect(row.length).toBeLessThanOrEqual(30);
    for (const row of columns(["alpha", "beta", "gamma"], 14)) expect(row.length).toBeLessThanOrEqual(14);
    for (const row of wrapText("one two three four five six seven", 12, 2)) expect(row.length).toBeLessThanOrEqual(12);
  });

  it("answers the pretend system", () => {
    expect(bash("pwd", env)).toEqual(["/home/goben"]);
    expect(bash("echo hi $USER", env)).toEqual(["hi goben"]);
    expect(bash("cat nope.txt", env)?.[0]).toContain("No such file");
    expect(bash("cat about.txt", env)?.length).toBeGreaterThan(0);
    expect(bash("ls -l", env)?.[1]).toContain("-r--r--r--");
    expect(bash("history", env)?.[1]).toContain("pwd");
    expect(bash("date", env)?.[0]).toContain("03:04:05");
    expect(bash("sudo ls", env)?.[0]).toContain("sudoers");
    expect(bash("rm -rf /", env)?.[0]).toContain("read-only");
    expect(bash("touch a", env)?.[0]).toContain("read-only");
    expect(bash("man cat", env)?.join(" ")).toContain("print a file");
    expect(bash("man zzz", env)?.[0]).toContain("No manual entry");
    expect(bash("nothing", env)).toBeNull();
  });
});
