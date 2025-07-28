import db from "./db.ts";

db.query("DELETE FROM user WHERE username = ?", ["admin"]);
console.log("✅ Admin user deleted. Restart the backend to recreate it.");
