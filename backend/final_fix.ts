import db from "./db.ts";
import { hashPassword, verifyPassword } from "./controllers.ts";

console.log("=== Final Login Fix ===");

try {
  // Step 1: Create admin user
  console.log("1. Creating admin user...");
  const hash = await hashPassword("password123");

  // Clear any existing admin user
  db.query("DELETE FROM user WHERE username = ?", ["admin"]);

  // Insert new admin user
  db.query("INSERT INTO user (username, password_hash) VALUES (?, ?)", [
    "admin",
    hash,
  ]);

  console.log("Admin user created with hash length:", hash.length);

  // Step 2: Verify user was created
  console.log("2. Verifying user creation...");
  const users = [
    ...db.query(
      "SELECT id, username, password_hash FROM user WHERE username = ?",
      ["admin"]
    ),
  ];

  if (users.length === 0) {
    console.log("❌ User was not created!");
  } else {
    const user = users[0];
    console.log("✅ User found:", { id: user[0], username: user[1] });

    // Step 3: Test password verification
    console.log("3. Testing password verification...");
    const valid = await verifyPassword("password123", user[2]);
    console.log("Password verification result:", valid);

    if (valid) {
      console.log("✅ Login should work!");
      console.log("Username: admin");
      console.log("Password: password123");
      console.log("Try logging in at: http://localhost:3000/admin/login");
    } else {
      console.log("❌ Password verification failed");
    }

    // Step 4: Test the actual login logic
    console.log("4. Testing login logic...");
    const testUser = [
      ...db.query(
        "SELECT id, username, password_hash FROM user WHERE username = ?",
        ["admin"]
      ),
    ][0];

    if (testUser) {
      const testValid = await verifyPassword("password123", testUser[2]);
      console.log("Login logic test result:", testValid);
    }
  }

  console.log("=== Fix Complete ===");
} catch (error) {
  console.error("Error:", error);
}
