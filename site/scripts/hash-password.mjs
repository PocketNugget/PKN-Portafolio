import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const password = readFileSync(0, "utf8").replace(/\r?\n$/, "");
if (password.length < 16 || password.length > 200) {
  console.error("use 16 to 200 characters. a good one is: openssl rand -base64 24");
  process.exit(1);
}

const hex = createHash("sha256").update(password, "utf8").digest("hex");
process.stdout.write(`sha256$${hex}\n`);
