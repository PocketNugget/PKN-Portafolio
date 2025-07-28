import "https://deno.land/std@0.224.0/dotenv/load.ts";
import db from "./db.ts";
import { hashPassword } from "./controllers.ts";

async function fixAdminPassword() {
  try {
    const password = "Superfuckingbigpasswordforblog";
    console.log("Fixing admin password to:", password);

    const hash = await hashPassword(password);

    // Update admin password directly
    db.query("UPDATE user SET password_hash = ? WHERE username = ?", [
      hash,
      "admin",
    ]);

    console.log("✅ Admin password fixed!");
    console.log("Username: admin");
    console.log("Password:", password);
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

fixAdminPassword();
