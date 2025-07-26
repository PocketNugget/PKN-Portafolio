import db from "./db.ts";
import { hashPassword } from "./controllers.ts";

console.log("Checking database...");

// Check if user table exists and has users
const users = [...db.query("SELECT id, username FROM user")];
console.log("Current users:", users);

if (users.length === 0) {
  console.log("No users found. Creating admin user...");
  const hash = await hashPassword("password123");
  db.query("INSERT INTO user (username, password_hash) VALUES (?, ?)", [
    "admin",
    hash,
  ]);
  console.log("Admin user created!");
  console.log("Username: admin");
  console.log("Password: password123");
} else {
  console.log("Users found:", users);
}

console.log("Database check complete!");
