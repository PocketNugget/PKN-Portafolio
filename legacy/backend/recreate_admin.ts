import "https://deno.land/std@0.224.0/dotenv/load.ts";
import db from "./db.ts";
import { hashPassword } from "./controllers.ts";

async function recreateAdmin() {
  try {
    const password = Deno.env.get("DEFAULT_ADMIN_PASSWORD") || "admin123";
    console.log("Creating admin user with password:", password);

    const hash = await hashPassword(password);

    // Delete existing admin user
    db.query("DELETE FROM user WHERE username = ?", ["admin"]);

    // Create new admin user
    db.query("INSERT INTO user (username, password_hash) VALUES (?, ?)", [
      "admin",
      hash,
    ]);

    console.log("✅ Admin user recreated successfully!");
    console.log("Username: admin");
    console.log("Password:", password);
  } catch (error) {
    console.error("❌ Error recreating admin user:", error);
  }
}

recreateAdmin();
