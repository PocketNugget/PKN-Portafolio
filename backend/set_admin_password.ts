import db from "./db.ts";
import { hashPassword } from "./controllers.ts";

// Usage: deno run --allow-read --allow-write --allow-env set_admin_password.ts <username> <password>
if (Deno.args.length < 2) {
  console.error(
    "Usage: deno run --allow-read --allow-write --allow-env set_admin_password.ts <username> <password>"
  );
  Deno.exit(1);
}

const [username, password] = Deno.args;
const hash = await hashPassword(password);

// Check if user exists
const user = [
  ...db.query("SELECT id FROM user WHERE username = ?", [username]),
][0];
if (user) {
  db.query("UPDATE user SET password_hash = ? WHERE username = ?", [
    hash,
    username,
  ]);
  console.log(`Updated password for user '${username}'.`);
} else {
  db.query("INSERT INTO user (username, password_hash) VALUES (?, ?)", [
    username,
    hash,
  ]);
  console.log(`Created user '${username}' with secure password.`);
}
