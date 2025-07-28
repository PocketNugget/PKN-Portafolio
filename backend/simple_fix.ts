import { Database } from "https://deno.land/x/sqlite3@0.11.2/mod.ts";
import { hash } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const db = new Database("/data/data.db");
const password = "Superfuckingbigpasswordforblog";
const hash_result = await hash(password);

db.prepare("UPDATE user SET password_hash = ? WHERE username = ?").run([
  hash_result,
  "admin",
]);
console.log("✅ Admin password updated to:", password);
db.close();
