import db from "./db.ts";
import { hashPassword } from "./controllers.ts";

const password = "Superfuckingbigpasswordforblog";
const hash_result = await hashPassword(password);

db.query("UPDATE user SET password_hash = ? WHERE username = ?", [
  hash_result,
  "admin",
]);
console.log("✅ Admin password updated to:", password);
