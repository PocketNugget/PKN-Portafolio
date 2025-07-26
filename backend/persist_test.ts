import db from "./db.ts";

console.log("=== Insert Test User ===");

try {
  db.query("INSERT INTO user (username, password_hash) VALUES (?, ?)", [
    "persist_test",
    "test_hash",
  ]);
  console.log("Inserted user 'persist_test'.");

  const users = [...db.query("SELECT id, username FROM user")];
  console.log("Current users:", users);
} catch (error) {
  console.error("Error:", error);
}
