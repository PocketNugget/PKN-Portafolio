import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { verifyPassword } from "./controllers.ts";

console.log("=== Checking User in Database ===");

try {
  console.log("1. Opening database...");
  const db = new DB("/data/data.db");

  console.log("2. Checking for dark-nugg user...");
  const users = [
    ...db.query(
      "SELECT id, username, password_hash FROM user WHERE username = ?",
      ["dark-nugg"]
    ),
  ];

  if (users.length === 0) {
    console.log("❌ User 'dark-nugg' not found!");
  } else {
    const user = users[0];
    console.log("✅ User found:", { id: user[0], username: user[1] });
    console.log("3. Password hash length:", user[2] ? user[2].length : "null");

    console.log("4. Testing password verification...");
    const password = "bL:;Io~xGso1&9MN0)rGfRhmR";
    const valid = await verifyPassword(password, user[2]);
    console.log("5. Password verification result:", valid);

    if (valid) {
      console.log("✅ Password verification works!");
    } else {
      console.log("❌ Password verification failed!");
    }
  }

  console.log("6. All users in database:");
  const allUsers = [...db.query("SELECT id, username FROM user")];
  allUsers.forEach((user, index) => {
    console.log(`   ${index + 1}. ID: ${user[0]}, Username: ${user[1]}`);
  });

  console.log("7. Closing database...");
  db.close();
} catch (error) {
  console.error("Error:", error);
}
