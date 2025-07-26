import db from "./db.ts";
import { hashPassword, verifyPassword } from "./controllers.ts";

console.log("Testing login logic...");

// Create admin user
console.log("Creating admin user...");
const hash = await hashPassword("password123");
db.query("INSERT INTO user (username, password_hash) VALUES (?, ?)", [
  "admin",
  hash,
]);
console.log("Admin user created");

// Test login
console.log("Testing login...");
const user = [
  ...db.query(
    "SELECT id, username, password_hash FROM user WHERE username = ?",
    ["admin"]
  ),
][0];

if (user) {
  console.log("User found:", { id: user[0], username: user[1] });

  // Test password verification
  const valid = await verifyPassword("password123", user[2]);
  console.log("Password verification result:", valid);

  if (valid) {
    console.log("✅ Login should work!");
  } else {
    console.log("❌ Password verification failed");
  }
} else {
  console.log("❌ User not found");
}

console.log("Test complete!");
