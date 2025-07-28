import "https://deno.land/std@0.224.0/dotenv/load.ts";
import db from "./db.ts";
import { hashPassword } from "./controllers.ts";

async function resetAdminPassword() {
  try {
    const newPassword = Deno.env.get("DEFAULT_ADMIN_PASSWORD") || "admin123";
    console.log("Resetting admin password to:", newPassword);

    const hash = await hashPassword(newPassword);

    // Update the admin user's password
    db.query("UPDATE user SET password_hash = ? WHERE username = ?", [
      hash,
      "admin",
    ]);

    console.log("✅ Admin password updated successfully!");
    console.log("Username: admin");
    console.log("Password:", newPassword);
  } catch (error) {
    console.error("❌ Error resetting admin password:", error);
  }
}

resetAdminPassword();
