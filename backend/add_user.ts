#!/usr/bin/env -S deno run --allow-read --allow-write --unstable-fs

import db from "./db.ts";
import { hashPassword } from "./controllers.ts";

async function addUser(username: string, password: string) {
  try {
    // Check if user already exists
    const existingUser = [
      ...db.query("SELECT id FROM user WHERE username = ?", [username]),
    ][0];

    if (existingUser) {
      console.log(`❌ User '${username}' already exists!`);
      return;
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);

    db.query("INSERT INTO user (username, password_hash) VALUES (?, ?)", [
      username,
      hashedPassword,
    ]);

    console.log(`✅ User '${username}' created successfully!`);
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    console.log(`   Please change the password after first login.`);
  } catch (error) {
    console.error("❌ Error creating user:", error);
  }
}

async function listUsers() {
  try {
    // Try to get users with created_at, fallback to without if column doesn't exist
    let users;
    try {
      users = [
        ...db.query(
          "SELECT id, username, created_at FROM user ORDER BY id DESC"
        ),
      ];
    } catch (error) {
      // Fallback to basic query if created_at column doesn't exist
      users = [
        ...db.query("SELECT id, username FROM user ORDER BY id DESC"),
      ].map(([id, username]) => [id, username, null]);
    }

    console.log("\n📋 Current Users:");
    console.log("ID | Username | Created At");
    console.log("---|----------|-----------");

    users.forEach(([id, username, created_at]) => {
      const date = created_at
        ? new Date(created_at).toLocaleDateString()
        : "N/A";
      console.log(`${id}  | ${username.padEnd(8)} | ${date}`);
    });
  } catch (error) {
    console.error("❌ Error listing users:", error);
  }
}

async function deleteUser(username: string) {
  try {
    // Check if user exists
    const user = [
      ...db.query("SELECT id FROM user WHERE username = ?", [username]),
    ][0];

    if (!user) {
      console.log(`❌ User '${username}' not found!`);
      return;
    }

    const userId = user[0];

    // Prevent deleting the admin user
    if (userId === 1) {
      console.log("❌ Cannot delete admin user!");
      return;
    }

    db.query("DELETE FROM user WHERE id = ?", [userId]);
    console.log(`✅ User '${username}' deleted successfully!`);
  } catch (error) {
    console.error("❌ Error deleting user:", error);
  }
}

// Main execution
const args = Deno.args;

if (args.length === 0) {
  console.log(`
🔐 User Management Script

Usage:
  deno run add_user.ts list                    # List all users
  deno run add_user.ts add <username> <pass>   # Add new user
  deno run add_user.ts delete <username>       # Delete user

Examples:
  deno run add_user.ts list
  deno run add_user.ts add editor mypassword123
  deno run add_user.ts delete editor
`);
  Deno.exit(0);
}

const command = args[0];

switch (command) {
  case "list":
    await listUsers();
    break;
  case "add":
    if (args.length < 3) {
      console.log("❌ Usage: deno run add_user.ts add <username> <password>");
      Deno.exit(1);
    }
    await addUser(args[1], args[2]);
    break;
  case "delete":
    if (args.length < 2) {
      console.log("❌ Usage: deno run add_user.ts delete <username>");
      Deno.exit(1);
    }
    await deleteUser(args[1]);
    break;
  default:
    console.log("❌ Unknown command. Use 'list', 'add', or 'delete'");
    Deno.exit(1);
}
