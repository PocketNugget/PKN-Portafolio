import { DB } from "https://deno.land/x/sqlite/mod.ts";

console.log("=== Testing New Database ===");

try {
  console.log("1. Creating new database...");
  const db = new DB("/data/test_new.db");

  console.log("2. Creating user table...");
  db.execute(`
    CREATE TABLE IF NOT EXISTS user (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    )
  `);

  console.log("3. Inserting test user...");
  db.query("INSERT INTO user (username, password_hash) VALUES (?, ?)", [
    "test_user_new",
    "test_hash_new",
  ]);

  console.log("4. Verifying insert...");
  const users = [...db.query("SELECT * FROM user")];
  console.log("5. Users in new database:", users.length);

  console.log("6. Closing database...");
  db.close();

  console.log("=== Test Complete ===");
} catch (error) {
  console.error("Error:", error);
}
