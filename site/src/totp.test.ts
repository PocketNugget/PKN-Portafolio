import { describe, expect, it } from "vitest";
import { base32Encode, openSecret, otpauthUri, sealSecret, totpAt, totpMatches } from "./totp";

const SECRET = new TextEncoder().encode("12345678901234567890");
const KEY = btoa(String.fromCharCode(...new Uint8Array(32).fill(9)));

describe("totp", () => {
  it("matches the RFC 6238 SHA-1 vectors at 6 digits", async () => {
    expect(await totpAt(SECRET, 59)).toBe("287082");
    expect(await totpAt(SECRET, 1111111109)).toBe("081804");
    expect(await totpAt(SECRET, 1111111111)).toBe("050471");
    expect(await totpAt(SECRET, 1234567890)).toBe("005924");
    expect(await totpAt(SECRET, 2000000000)).toBe("279037");
    expect(await totpMatches(SECRET, "287082", 59)).toBe(true);
    expect(await totpMatches(SECRET, "000000", 59)).toBe(false);
  });

  it("round-trips the sealed secret into an otpauth URI", async () => {
    const sealed = await sealSecret(KEY, SECRET);
    const opened = await openSecret(KEY, sealed);
    expect([...opened]).toEqual([...SECRET]);
    expect(base32Encode(new TextEncoder().encode("foo"))).toBe("MZXW6");
    expect(otpauthUri(SECRET)).toContain("otpauth://totp/PKN:goben?secret=");
    expect(otpauthUri(SECRET)).toContain("&issuer=PKN");
  });
});
