import { DB } from "https://deno.land/x/sqlite/mod.ts";

console.log("=== Testing Database Connection ===");

try {
  console.log("1. Opening database...");
  const db = new DB("/data/data.db");

  console.log("2. Testing read...");
  const users = [...db.query("SELECT * FROM user")];
  console.log("3. Found users:", users.length);

  console.log("4. Testing write...");
  db.query("INSERT INTO user (username, password_hash) VALUES (?, ?)", [
    "test_connection_user",
    "test_hash",
  ]);
  console.log("5. Write completed!");

  console.log("6. Closing database...");
  db.close();

  console.log("=== Test Complete ===");
} catch (error) {
  console.error("Error:", error);
}
