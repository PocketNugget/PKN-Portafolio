import { describe, expect, it } from "vitest";
import { convertText, md5hex } from "./convert";

describe("converter", () => {
  it("hashes known strings", async () => {
    expect(md5hex(new Uint8Array())).toBe("d41d8cd98f00b204e9800998ecf8427e");
    expect(await convertText("md5", "abc")).toBe("900150983cd24fb0d6963f7d28e17f72");
    expect(await convertText("sha1", "abc")).toBe("a9993e364706816aba3e25717850c26c9cd0d89d");
    expect(await convertText("sha256", "abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });

  it("round-trips text encodings", async () => {
    expect(await convertText("b64enc", "hi")).toBe("aGk=");
    expect(await convertText("b64dec", "aGk=")).toBe("hi");
    expect(await convertText("hexenc", "hi")).toBe("6869");
    expect(await convertText("hexdec", "68 69")).toBe("hi");
    expect(await convertText("urlenc", "a b")).toBe("a%20b");
    expect(await convertText("urldec", "a%20b")).toBe("a b");
    expect(await convertText("binenc", "A")).toBe("01000001");
  });

  it("rejects a bad decode", async () => {
    expect(await convertText("hexdec", "zz")).toMatch(/^error:/);
    expect(await convertText("b64dec", "!!!!")).toMatch(/^error:/);
    expect(await convertText("urldec", "%")).toMatch(/^error:/);
    expect(await convertText("nope", "hi")).toBe("error: unknown operation.");
    expect(await convertText("b64enc", "a".repeat(20001))).toBe(
      "error: input is longer than 20000 characters.",
    );
  });
});
