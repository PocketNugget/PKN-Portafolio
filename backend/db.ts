import { DB } from "./deps.ts";

// Open a database (creates file if not exists)
const db = new DB("/data/data.db");

// Example: create tables if not exist
// Blog table: id, title, content, created_at
// Portfolio table: id, title, description, link, image, created_at
// User table: id, username, password_hash

db.execute(`
  CREATE TABLE IF NOT EXISTS blog (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

db.execute(`
  CREATE TABLE IF NOT EXISTS portfolio (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    link TEXT,
    image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Add missing columns if they don't exist (for existing databases)
try {
  db.execute("ALTER TABLE portfolio ADD COLUMN link TEXT;");
} catch (error) {
  // Column already exists, ignore error
}

try {
  db.execute("ALTER TABLE portfolio ADD COLUMN image TEXT;");
} catch (error) {
  // Column already exists, ignore error
}

try {
  db.execute("ALTER TABLE blog ADD COLUMN tags TEXT;");
} catch (error) {
  // Column already exists, ignore error
}

db.execute(`
  CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Add created_at column to existing user table if it doesn't exist
try {
  db.execute(
    "ALTER TABLE user ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP;"
  );
} catch (error) {
  // Column already exists, ignore error
}

db.execute(`
  CREATE TABLE IF NOT EXISTS visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip TEXT,
    user_agent TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

export default db;
