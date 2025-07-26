import db from "./db.ts";

console.log("=== Testing Database Write ===");

try {
  // Check current state
  const users = [...db.query("SELECT * FROM user")];
  console.log("Current users:", users.length);

  // Write a test record
  console.log("Writing test record...");
  db.query("INSERT INTO user (username, password_hash) VALUES (?, ?)", [
    "test_user",
    "test_hash",
  ]);

  // Check if it was written
  const users2 = [...db.query("SELECT * FROM user")];
  console.log("Users after write:", users2.length);

  if (users2.length > users.length) {
    console.log("✅ Database write successful!");
  } else {
    console.log("❌ Database write failed!");
  }

  // Show all users
  console.log("All users:", users2);
} catch (error) {
  console.error("Error:", error);
}
