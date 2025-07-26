import db from "./db.ts";

const username = "dark-nugg";
const password = "bL:;Io~xGso1&9MN0)rGfRhmR";

console.log(`Adding user '${username}' with simple hash...`);

try {
  // Use a simple hash for testing
  const simpleHash = `simple_hash_${Date.now()}`;

  console.log("1. Inserting user...");
  db.query("INSERT INTO user (username, password_hash) VALUES (?, ?)", [
    username,
    simpleHash,
  ]);
  console.log("2. User inserted successfully!");

  // Verify the user was created
  console.log("3. Verifying user creation...");
  const users = [
    ...db.query("SELECT id, username FROM user WHERE username = ?", [username]),
  ];
  console.log("4. Users found:", users.length);

  if (users.length > 0) {
    console.log(`✅ User '${username}' created successfully!`);
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
    console.log(
      "Note: This uses a simple hash for testing. Use the proper add_user.ts script for production."
    );
  } else {
    console.log("❌ User was not created!");
  }
} catch (error) {
  if (error.message && error.message.includes("UNIQUE constraint failed")) {
    console.log(`User '${username}' already exists.`);
  } else {
    console.error("Error:", error);
  }
}
