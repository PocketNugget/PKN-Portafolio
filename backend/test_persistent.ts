import db from "./db.ts";
import { hashPassword, verifyPassword } from "./controllers.ts";

console.log("=== Testing Database Persistence ===");

try {
  // Step 1: Check current state
  console.log("1. Current database state:");
  const users = [...db.query("SELECT * FROM user")];
  console.log(`   Users: ${users.length}`);

  // Step 2: Create admin user
  console.log("2. Creating admin user...");
  const hash = await hashPassword("password123");
  console.log(`   Hash length: ${hash.length}`);

  // Insert user
  db.query("INSERT INTO user (username, password_hash) VALUES (?, ?)", [
    "admin",
    hash,
  ]);
  console.log("   User inserted");

  // Step 3: Verify user was created
  console.log("3. Verifying user creation:");
  const users2 = [...db.query("SELECT * FROM user")];
  console.log(`   Users after insert: ${users2.length}`);

  if (users2.length > 0) {
    const user = users2[0];
    console.log(`   User ID: ${user[0]}`);
    console.log(`   Username: ${user[1]}`);
    console.log(`   Hash: ${user[2].substring(0, 20)}...`);

    // Step 4: Test password verification
    console.log("4. Testing password verification:");
    const valid = await verifyPassword("password123", user[2]);
    console.log(`   Password valid: ${valid}`);

    if (valid) {
      console.log("✅ SUCCESS: Login should work!");
      console.log("   Username: admin");
      console.log("   Password: password123");
    } else {
      console.log("❌ FAILED: Password verification failed");
    }
  } else {
    console.log("❌ FAILED: User was not created");
  }

  console.log("=== Test Complete ===");
} catch (error) {
  console.error("❌ ERROR:", error);
}
