import db from "./db.ts";
import { hashPassword } from "./controllers.ts";

const username = "dark-nugg";
const password = "bL:;Io~xGso1&9MN0)rGfRhmR";

console.log(`Adding user '${username}'...`);

try {
  const hash = await hashPassword(password);
  db.query("INSERT INTO user (username, password_hash) VALUES (?, ?)", [
    username,
    hash,
  ]);
  console.log(`User '${username}' added successfully.`);
} catch (error) {
  if (error.message && error.message.includes("UNIQUE constraint failed")) {
    console.log(`User '${username}' already exists.`);
  } else {
    console.error("Error:", error);
  }
}
