const STEP = 30;
const DIGITS = 6;

export async function totpAt(secret: Uint8Array, unixSeconds: number): Promise<string> {
  const counter = Math.floor(unixSeconds / STEP);
  return hotp(secret, counter, DIGITS);
}

export async function totpMatches(secret: Uint8Array, code: string, unixSeconds: number): Promise<boolean> {
  if (!/^\d{6}$/.test(code)) return false;
  for (const offset of [-1, 0, 1]) {
    const got = await totpAt(secret, unixSeconds + offset * STEP);
    if (safeCode(got, code)) return true;
  }
  return false;
}

function safeCode(left: string, right: string): boolean {
  let diff = left.length === right.length ? 0 : 1;
  const length = Math.max(left.length, right.length);
  for (let i = 0; i < length; i++) diff |= (left.charCodeAt(i) || 0) ^ (right.charCodeAt(i) || 0);
  return diff === 0;
}

function asBuffer(src: Uint8Array): ArrayBuffer {
  const out = new ArrayBuffer(src.byteLength);
  new Uint8Array(out).set(src);
  return out;
}

async function hotp(secret: Uint8Array, counter: number, digits: number): Promise<string> {
  const msg = new Uint8Array(8);
  let rest = counter;
  for (let i = 7; i >= 0; i--) {
    msg[i] = rest & 0xff;
    rest = Math.floor(rest / 256);
  }
  const key = await crypto.subtle.importKey("raw", asBuffer(secret), { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, msg));
  const offset = (sig[sig.length - 1] ?? 0) & 0x0f;
  const bin =
    ((sig[offset] ?? 0) & 0x7f) * 0x1000000 +
    ((sig[offset + 1] ?? 0) & 0xff) * 0x10000 +
    ((sig[offset + 2] ?? 0) & 0xff) * 0x100 +
    ((sig[offset + 3] ?? 0) & 0xff);
  return String(bin % 1_000_000).padStart(digits, "0");
}

const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function base32Encode(bytes: Uint8Array): string {
  let value = 0;
  let bits = 0;
  let out = "";
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += B32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31];
  return out;
}

export function otpauthUri(secret: Uint8Array): string {
  return `otpauth://totp/PKN:goben?secret=${base32Encode(secret)}&issuer=PKN`;
}

function decodeKey(keyB64: string): Uint8Array {
  const raw = atob(keyB64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

function encodeBytes(bytes: Uint8Array): string {
  let raw = "";
  for (const byte of bytes) raw += String.fromCharCode(byte);
  return btoa(raw);
}

export async function sealSecret(keyB64: string, secret: Uint8Array): Promise<string> {
  const keyBytes = decodeKey(keyB64);
  if (keyBytes.length !== 32) throw new Error("totp key");
  const key = await crypto.subtle.importKey("raw", asBuffer(keyBytes), "AES-GCM", false, ["encrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, asBuffer(secret)));
  const packed = new Uint8Array(iv.length + cipher.length);
  packed.set(iv, 0);
  packed.set(cipher, iv.length);
  return encodeBytes(packed);
}

export async function openSecret(keyB64: string, packedB64: string): Promise<Uint8Array> {
  const keyBytes = decodeKey(keyB64);
  const packed = decodeKey(packedB64);
  if (keyBytes.length !== 32 || packed.length < 13) throw new Error("totp cipher");
  const key = await crypto.subtle.importKey("raw", asBuffer(keyBytes), "AES-GCM", false, ["decrypt"]);
  const iv = packed.slice(0, 12);
  const cipher = packed.slice(12);
  return new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv: asBuffer(iv) }, key, asBuffer(cipher)));
}
