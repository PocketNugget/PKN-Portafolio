import db from "./db.ts";

console.log("=== Simple Database Test ===");

try {
  console.log("1. Testing database connection...");

  // Check if we can read from the database
  const users = [...db.query("SELECT * FROM user")];
  console.log("2. Current users in database:", users.length);

  // Try to insert a simple test record
  console.log("3. Testing insert...");
  db.query("INSERT INTO user (username, password_hash) VALUES (?, ?)", [
    "test_user_simple",
    "simple_hash",
  ]);
  console.log("4. Insert completed successfully!");

  // Check if the insert worked
  const users2 = [...db.query("SELECT * FROM user")];
  console.log("5. Users after insert:", users2.length);

  console.log("=== Test Complete ===");
} catch (error) {
  console.error("Error:", error);
}
