import db from "./db.ts";
import { hashPassword } from "./controllers.ts";

console.log("Creating admin user...");

try {
  const hash = await hashPassword("password123");
  console.log("Password hashed successfully");

  db.query("INSERT INTO user (username, password_hash) VALUES (?, ?)", [
    "admin",
    hash,
  ]);

  console.log("Admin user created successfully!");
  console.log("Username: admin");
  console.log("Password: password123");

  // Verify the user was created
  const users = [
    ...db.query("SELECT id, username FROM user WHERE username = ?", ["admin"]),
  ];
  console.log("Verification - users found:", users.length);
} catch (error) {
  console.error("Error creating admin user:", error);
}
