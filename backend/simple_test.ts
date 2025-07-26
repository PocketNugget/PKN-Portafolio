import db from "./db.ts";

console.log("=== Simple Database Test ===");

try {
  // Test basic database operations
  console.log("1. Testing database connection...");

  // Create a test table
  db.execute(
    "CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT)"
  );
  console.log("2. Test table created");

  // Insert a test record
  db.query("INSERT INTO test (name) VALUES (?)", ["test_value"]);
  console.log("3. Test record inserted");

  // Query the test record
  const results = [...db.query("SELECT * FROM test")];
  console.log("4. Query results:", results);

  // Test user table
  console.log("5. Testing user table...");
  const users = [...db.query("SELECT * FROM user")];
  console.log("Users in database:", users.length);

  // Insert a test user
  db.query("INSERT INTO user (username, password_hash) VALUES (?, ?)", [
    "test_user",
    "test_hash",
  ]);
  console.log("6. Test user inserted");

  // Check users again
  const users2 = [...db.query("SELECT * FROM user")];
  console.log("Users after insert:", users2.length);

  console.log("=== Test Complete ===");
} catch (error) {
  console.error("Error:", error);
}
