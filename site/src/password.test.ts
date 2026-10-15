import { describe, expect, it } from "vitest";
import { randomToken, safeEqual, sha256Hex, verifyPassword } from "./password";

describe("password", () => {
  it("hashes the known SHA-256 vector and compares whole strings", async () => {
    expect(await sha256Hex("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
    expect(safeEqual("same", "same")).toBe(true);
    expect(safeEqual("", "")).toBe(true);
    expect(safeEqual("á", "á")).toBe(true);
    expect(safeEqual("á", "a")).toBe(false);
    expect(safeEqual("abc", "abd")).toBe(false);
    expect(safeEqual("a", "ab")).toBe(false);
  });

  it("accepts only a lowercase sha256 record", async () => {
    const hex = await sha256Hex("correct horse");
    expect(await verifyPassword("correct horse", `sha256$${hex}`)).toBe(true);
    expect(await verifyPassword("wrong horse", `sha256$${hex}`)).toBe(false);
    expect(await verifyPassword("correct horse", `sha256$${hex.toUpperCase()}`)).toBe(false);
    expect(await verifyPassword("correct horse", hex)).toBe(false);
    expect(await verifyPassword("correct horse", "sha256$abcd")).toBe(false);
    expect(await verifyPassword("correct horse", "md5$abcd")).toBe(false);
  });

  it("makes a url-safe session token", () => {
    const first = randomToken();
    const second = randomToken();
    expect(first).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(second).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(first).not.toBe(second);
  });
});
