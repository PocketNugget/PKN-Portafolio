import type { DeskApp } from "./host";
import { idleApp } from "./host";

const LIMIT = 20000;

const OPS: { id: string; label: string }[] = [
  { id: "b64enc", label: "Base64 encode" },
  { id: "b64dec", label: "Base64 decode" },
  { id: "hexenc", label: "Hex encode" },
  { id: "hexdec", label: "Hex decode" },
  { id: "urlenc", label: "URL encode" },
  { id: "urldec", label: "URL decode" },
  { id: "binenc", label: "Text to binary" },
  { id: "md5", label: "MD5" },
  { id: "sha1", label: "SHA-1" },
  { id: "sha256", label: "SHA-256" },
];

const K = [
  0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
  0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
  0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
  0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
  0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c, 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
  0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
  0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
  0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1, 0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391,
];

const S = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14,
  20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10,
  15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
];

function rotl(x: number, c: number): number {
  return ((x << c) | (x >>> (32 - c))) >>> 0;
}

export function md5hex(input: Uint8Array): string {
  const n = input.length;
  const zeroCount = (56 - ((n + 1) % 64) + 64) % 64;
  const total = n + 1 + zeroCount + 8;
  const data = new Uint8Array(total);
  data.set(input);
  data[n] = 0x80;
  const view = new DataView(data.buffer);
  const bitLen = n * 8;
  view.setUint32(total - 8, bitLen >>> 0, true);
  view.setUint32(total - 4, Math.floor(bitLen / 0x100000000), true);

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  for (let off = 0; off < total; off += 64) {
    const m = new Uint32Array(16);
    for (let j = 0; j < 16; j += 1) m[j] = view.getUint32(off + j * 4, true);
    let a = a0;
    let b = b0;
    let c = c0;
    let d = d0;
    for (let i = 0; i < 64; i += 1) {
      let f = 0;
      let g = 0;
      if (i < 16) {
        f = (b & c) | (~b & d);
        g = i;
      } else if (i < 32) {
        f = (d & b) | (~d & c);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        f = b ^ c ^ d;
        g = (3 * i + 5) % 16;
      } else {
        f = c ^ (b | ~d);
        g = (7 * i) % 16;
      }
      f = (((f >>> 0) + a + (K[i] ?? 0) + (m[g] ?? 0)) >>> 0);
      const shift = S[i] ?? 0;
      a = d;
      d = c;
      c = b;
      b = (b + rotl(f, shift)) >>> 0;
    }
    a0 = (a0 + a) >>> 0;
    b0 = (b0 + b) >>> 0;
    c0 = (c0 + c) >>> 0;
    d0 = (d0 + d) >>> 0;
  }

  const out = new Uint8Array(16);
  const ov = new DataView(out.buffer);
  ov.setUint32(0, a0, true);
  ov.setUint32(4, b0, true);
  ov.setUint32(8, c0, true);
  ov.setUint32(12, d0, true);
  return hex(out);
}

function hex(bytes: Uint8Array): string {
  let out = "";
  for (const byte of bytes) out += byte.toString(16).padStart(2, "0");
  return out;
}

function utf8ToB64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  const size = 0x8000;
  for (let i = 0; i < bytes.length; i += size) {
    bin += String.fromCharCode(...bytes.subarray(i, i + size));
  }
  return btoa(bin);
}

function b64ToUtf8(text: string): string {
  const bin = atob(text.replace(/\s+/g, ""));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

function hexToBytes(text: string): Uint8Array {
  const cleaned = text.replace(/\s+/g, "");
  if (cleaned.length === 0 || cleaned.length % 2 !== 0 || /[^0-9a-f]/i.test(cleaned)) {
    throw new Error("bad hex");
  }
  const out = new Uint8Array(cleaned.length / 2);
  for (let i = 0; i < out.length; i += 1) out[i] = Number.parseInt(cleaned.slice(i * 2, i * 2 + 2), 16);
  return out;
}

async function digestHex(alg: "SHA-1" | "SHA-256", bytes: Uint8Array): Promise<string> {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  const buf = await crypto.subtle.digest(alg, copy);
  return hex(new Uint8Array(buf));
}

export async function convertText(op: string, input: string): Promise<string> {
  if (input.length > LIMIT) return `error: input is longer than ${LIMIT} characters.`;
  const bytes = new TextEncoder().encode(input);
  try {
    switch (op) {
      case "b64enc":
        return utf8ToB64(input);
      case "b64dec":
        return b64ToUtf8(input);
      case "hexenc":
        return hex(bytes);
      case "hexdec":
        return new TextDecoder("utf-8", { fatal: true }).decode(hexToBytes(input));
      case "urlenc":
        return encodeURIComponent(input);
      case "urldec":
        return decodeURIComponent(input);
      case "binenc":
        return [...bytes].map((byte) => byte.toString(2).padStart(8, "0")).join(" ");
      case "md5":
        return md5hex(bytes);
      case "sha1":
        return digestHex("SHA-1", bytes);
      case "sha256":
        return digestHex("SHA-256", bytes);
      default:
        return "error: unknown operation.";
    }
  } catch {
    return "error: that input could not be decoded.";
  }
}

export function mountConvert(host: HTMLElement): DeskApp {
  host.replaceChildren();
  const root = document.createElement("div");
  root.className = "convert-app";
  const pick = document.createElement("div");
  pick.className = "field-row";
  const opLabel = document.createElement("label");
  opLabel.htmlFor = "conv-op";
  opLabel.textContent = "Operation";
  const select = document.createElement("select");
  select.id = "conv-op";
  for (const op of OPS) {
    const option = document.createElement("option");
    option.value = op.id;
    option.textContent = op.label;
    select.append(option);
  }
  pick.append(opLabel, select);

  const input = area("Input", "conv-in", false);
  const go = document.createElement("button");
  go.type = "button";
  go.textContent = "Process";
  const output = area("Output", "conv-out", true);
  const note = document.createElement("p");
  note.className = "meta";
  note.textContent = "Runs in this page. Nothing is uploaded.";

  root.append(pick, input.wrap, go, output.wrap, note);
  host.append(root);

  let busy = false;
  go.addEventListener("click", () => {
    if (busy) return;
    busy = true;
    go.disabled = true;
    output.box.value = "";
    void convertText(select.value, input.box.value)
      .then((value) => {
        output.box.value = value;
      })
      .finally(() => {
        busy = false;
        go.disabled = false;
      });
  });

  return idleApp;
}

function area(
  label: string,
  id: string,
  readOnly: boolean,
): { wrap: HTMLDivElement; box: HTMLTextAreaElement } {
  const wrap = document.createElement("div");
  wrap.className = "field-row-stacked";
  const name = document.createElement("label");
  name.htmlFor = id;
  name.textContent = label;
  const box = document.createElement("textarea");
  box.id = id;
  box.rows = 5;
  box.spellcheck = false;
  if (readOnly) box.readOnly = true;
  wrap.append(name, box);
  return { wrap, box };
}
