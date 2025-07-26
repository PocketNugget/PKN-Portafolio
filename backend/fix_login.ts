import db from "./db.ts";
import { hashPassword, verifyPassword } from "./controllers.ts";

console.log("=== Fixing Login Issue ===");

// Check current database state
console.log("1. Checking current database state...");
const users = [...db.query("SELECT id, username FROM user")];
console.log(`Current users: ${users.length}`);

// Create admin user if it doesn't exist
console.log("2. Creating admin user...");
const hash = await hashPassword("password123");
console.log("Password hashed successfully");

// Delete existing admin user if exists
db.query("DELETE FROM user WHERE username = ?", ["admin"]);

// Insert new admin user
db.query("INSERT INTO user (username, password_hash) VALUES (?, ?)", [
  "admin",
  hash,
]);
console.log("Admin user inserted");

// Verify the user was created
console.log("3. Verifying user creation...");
const newUsers = [
  ...db.query(
    "SELECT id, username, password_hash FROM user WHERE username = ?",
    ["admin"]
  ),
];
console.log(`Users found: ${newUsers.length}`);

if (newUsers.length > 0) {
  const user = newUsers[0];
  console.log("User details:", {
    id: user[0],
    username: user[1],
    hashLength: user[2] ? user[2].length : 0,
  });

  // Test password verification
  console.log("4. Testing password verification...");
  const valid = await verifyPassword("password123", user[2]);
  console.log(`Password verification result: ${valid}`);

  if (valid) {
    console.log("✅ Login should work now!");
    console.log("Username: admin");
    console.log("Password: password123");
  } else {
    console.log("❌ Password verification failed");
  }
} else {
  console.log("❌ User was not created");
}

console.log("=== Fix Complete ===");
