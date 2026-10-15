// Writes a new admin password and authenticator secret.
// Plaintext goes only to ~/Downloads/pkn-admin-login.txt.
// Run from site/: node scripts/seed-auth.mjs
// Add --apply to set the Worker secrets and the D1 row. This does not print the password.
import { spawnSync } from "node:child_process";
import { randomBytes, webcrypto } from "node:crypto";
import { chmodSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir, homedir } from "node:os";
import { join } from "node:path";

const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const CODE = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function base32(bytes) {
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

function b64(bytes) {
  return Buffer.from(bytes).toString("base64");
}

async function seal(keyB64, secret) {
  const raw = Buffer.from(keyB64, "base64");
  const key = await webcrypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt"]);
  const iv = randomBytes(12);
  const cipher = new Uint8Array(await webcrypto.subtle.encrypt({ name: "AES-GCM", iv }, key, secret));
  const packed = new Uint8Array(iv.length + cipher.length);
  packed.set(iv, 0);
  packed.set(cipher, iv.length);
  return b64(packed);
}

function code() {
  const bytes = randomBytes(8);
  let out = "";
  for (const byte of bytes) out += CODE[byte % CODE.length];
  return `${out.slice(0, 4)}-${out.slice(4)}`;
}

const password = randomBytes(24).toString("base64url");
const secret = randomBytes(20);
const totpKey = b64(randomBytes(32));
const codes = Array.from({ length: 8 }, code);
const otpauth = `otpauth://totp/PKN:goben?secret=${base32(secret)}&issuer=PKN`;
const passwordHash = `sha256$${await sha256(password)}`;
const recovery = JSON.stringify(await Promise.all(codes.map((item) => sha256(item))));
const cipher = await seal(totpKey, secret);

const file = join(homedir(), "Downloads", "pkn-admin-login.txt");
writeFileSync(
  file,
  `username: goben\npassword: ${password}\n\nrecovery codes:\n${codes.join("\n")}\n\notpauth:\n${otpauth}\n\nDelete this file after the authenticator shows a code.\n`,
  { mode: 0o600 },
);
chmodSync(file, 0o600);
process.stdout.write(`wrote ${file}\n`);

if (!process.argv.includes("--apply")) process.exit(0);

const wrangler = join(process.cwd(), "node_modules", ".bin", "wrangler");
const dir = mkdtempSync(join(tmpdir(), "pkn-auth-"));
const sqlFile = join(dir, "auth.sql");
const sql = `INSERT INTO auth (id, password_hash, totp_cipher, totp_ready, recovery) VALUES (1, '${passwordHash}', '${cipher}', 0, '${recovery.replaceAll("'", "''")}') ON CONFLICT(id) DO UPDATE SET password_hash = excluded.password_hash, totp_cipher = excluded.totp_cipher, totp_ready = 0, recovery = excluded.recovery;`;
writeFileSync(sqlFile, sql, { mode: 0o600 });

function put(name, value) {
  const result = spawnSync(wrangler, ["secret", "put", name], {
    cwd: process.cwd(),
    input: `${value}\n`,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    rmSync(dir, { recursive: true, force: true });
    const detail = `${result.stderr || ""}`.replaceAll(value, "[redacted]").trim().split("\n").slice(0, 6).join(" | ");
    process.stderr.write(`secret put ${name} failed\n${detail}\n`);
    process.exit(result.status ?? 1);
  }
}

const migrated = spawnSync(wrangler, ["d1", "migrations", "apply", "pkn", "--remote"], {
  cwd: process.cwd(),
  encoding: "utf8",
});
if (migrated.status !== 0) {
  rmSync(dir, { recursive: true, force: true });
  process.stderr.write("d1 migration failed\n");
  process.exit(migrated.status ?? 1);
}

put("ADMIN_PASSWORD_HASH", passwordHash);
put("ADMIN_TOTP_KEY", totpKey);

const inserted = spawnSync(wrangler, ["d1", "execute", "pkn", "--remote", `--file=${sqlFile}`], {
  cwd: process.cwd(),
  encoding: "utf8",
});
rmSync(dir, { recursive: true, force: true });
if (inserted.status !== 0) {
  process.stderr.write("d1 auth row failed\n");
  process.exit(inserted.status ?? 1);
}
process.stdout.write("applied\n");

async function sha256(value) {
  const buf = await webcrypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(buf)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
