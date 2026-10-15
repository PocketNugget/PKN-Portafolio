import { describe, expect, it } from "vitest";
import { qrMatrix } from "./qr";

const HI_MASK_0 = `111111100110001111111
100000101010001000001
101110100010101011101
101110100101101011101
101110101001101011101
100000100001001000001
111111101010101111111
000000000010000000000
101010100000100010010
010010011001010101111
010111111101011101111
000001011111110111010
111100101101011100100
000000001110001000110
111111100100100010011
100000100110001000111
101110101010101010101
101110100111010101010
101110101011011101101
100000100111110111010
111111101001011101111`;

describe("qr", () => {
  it("builds a version 1 byte code", () => {
    const rows = qrMatrix("Hi", 0).map((row) => row.map((bit) => (bit ? "1" : "0")).join(""));
    expect(rows.join("\n")).toBe(HI_MASK_0);
  });

  it("grows for a longer byte string", () => {
    const matrix = qrMatrix("b".repeat(90));
    expect(matrix.length).toBe(41);
    expect(matrix.every((row) => row.length === matrix.length)).toBe(true);
  });

  it("refuses a string that does not fit", () => {
    expect(() => qrMatrix("b".repeat(200))).toThrow(/qr too long/);
  });
});
