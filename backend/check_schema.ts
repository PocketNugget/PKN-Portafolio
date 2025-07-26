import db from "./db.ts";

console.log("=== Checking Database Schema ===");

try {
  // Check if tables exist
  console.log("1. Checking tables...");

  const tables = [
    ...db.query("SELECT name FROM sqlite_master WHERE type='table'"),
  ];
  console.log(
    "Tables found:",
    tables.map((t) => t[0])
  );

  // Check user table schema
  if (tables.some((t) => t[0] === "user")) {
    console.log("2. User table exists, checking schema...");
    const schema = [...db.query("PRAGMA table_info(user)")];
    console.log("User table schema:", schema);

    // Check if there are any users
    const users = [...db.query("SELECT * FROM user")];
    console.log("3. Users in user table:", users.length);
    if (users.length > 0) {
      console.log("User data:", users);
    }
  } else {
    console.log("2. User table does not exist!");
  }

  // Check blog table
  if (tables.some((t) => t[0] === "blog")) {
    console.log("4. Blog table exists");
  } else {
    console.log("4. Blog table does not exist!");
  }

  // Check portfolio table
  if (tables.some((t) => t[0] === "portfolio")) {
    console.log("5. Portfolio table exists");
  } else {
    console.log("5. Portfolio table does not exist!");
  }

  console.log("=== Schema Check Complete ===");
} catch (error) {
  console.error("Error:", error);
}
