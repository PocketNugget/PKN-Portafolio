import db from "./db.ts";

console.log("Checking database contents...");

// Check users
const users = [...db.query("SELECT id, username, password_hash FROM user")];
console.log("Users in database:", users.length);
users.forEach((user, index) => {
  console.log(`User ${index + 1}:`, {
    id: user[0],
    username: user[1],
    password_hash: user[2] ? `${user[2].substring(0, 20)}...` : "null",
  });
});

// Check blog posts
const blogPosts = [...db.query("SELECT id, title FROM blog")];
console.log("Blog posts in database:", blogPosts.length);

// Check portfolio items
const portfolioItems = [...db.query("SELECT id, title FROM portfolio")];
console.log("Portfolio items in database:", portfolioItems.length);

console.log("Database check complete!");
