import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { hashPassword } from "./controllers.ts";

console.log("=== Initializing Fresh Database ===");

try {
  console.log("1. Creating new database...");
  const db = new DB("/data/data.db");

  console.log("2. Creating user table...");
  db.execute(`
    CREATE TABLE IF NOT EXISTS user (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    )
  `);

  console.log("3. Creating blog table...");
  db.execute(`
    CREATE TABLE IF NOT EXISTS blog (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log("4. Creating portfolio table...");
  db.execute(`
    CREATE TABLE IF NOT EXISTS portfolio (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      image_url TEXT,
      project_url TEXT,
      github_url TEXT,
      technologies TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log("5. Adding dark-nugg user...");
  const username = "dark-nugg";
  const password = "bL:;Io~xGso1&9MN0)rGfRhmR";

  const hash = await hashPassword(password);
  db.query("INSERT INTO user (username, password_hash) VALUES (?, ?)", [
    username,
    hash,
  ]);

  console.log("6. Verifying user creation...");
  const users = [...db.query("SELECT id, username FROM user")];
  console.log("7. Users in database:", users.length);

  console.log("8. Closing database...");
  db.close();

  console.log("=== Database Initialization Complete ===");
  console.log(`✅ User '${username}' created successfully!`);
  console.log(`Username: ${username}`);
  console.log(`Password: ${password}`);
} catch (error) {
  console.error("Error:", error);
}
