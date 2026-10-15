import { Router } from "./deps.ts";
import db from "./db.ts";
import {
  createJWT,
  verifyJWT,
  renderMarkdown,
  verifyPassword,
} from "./controllers.ts";

const router = new Router();

// JWT Auth middleware
async function requireAuth(ctx: any, next: any) {
  const auth = ctx.request.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Unauthorized" };
    return;
  }
  const token = auth.replace("Bearer ", "");
  const payload = await verifyJWT(token);
  if (!payload) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Invalid token" };
    return;
  }
  ctx.state.user = payload;
  await next();
}

// Login route (POST /api/auth)
router.post("/api/auth", async (ctx) => {
  try {
    const body = await ctx.request.body({ type: "json" }).value;
    const { username, password } = body;

    // Find user in DB
    const user = [
      ...db.query(
        "SELECT id, username, password_hash FROM user WHERE username = ?",
        [username]
      ),
    ][0];

    if (!user) {
      ctx.response.status = 401;
      ctx.response.body = { error: "Invalid credentials" };
      return;
    }
    // Secure: compare bcrypt hash
    const valid = await verifyPassword(password, user[2]);
    if (!valid) {
      ctx.response.status = 401;
      ctx.response.body = { error: "Invalid credentials" };
      return;
    }
    const token = await createJWT({ id: user[0], username: user[1] });
    ctx.response.body = { token };
  } catch (error) {
    console.error("Login error:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal server error" };
  }
});

// Protected dashboard route
router.get("/api/dashboard", requireAuth, (ctx) => {
  // Get blog and portfolio stats
  const blogCount = [...db.query("SELECT COUNT(*) FROM blog")][0][0];
  const portfolioCount = [...db.query("SELECT COUNT(*) FROM portfolio")][0][0];
  ctx.response.body = {
    user: ctx.state.user,
    stats: {
      blogPosts: blogCount,
      portfolioItems: portfolioCount,
    },
    message: `Welcome, ${ctx.state.user.username}`,
  };
});

// Log visits to main page
router.get("/", async (ctx) => {
  const ip =
    ctx.request.ip || ctx.request.headers.get("x-forwarded-for") || "unknown";
  const userAgent = ctx.request.headers.get("user-agent") || "unknown";
  db.query("INSERT INTO visits (ip, user_agent) VALUES (?, ?)", [
    ip,
    userAgent,
  ]);
  ctx.response.body = { status: "ok" };
});

// Analytics endpoint for dashboard
router.get("/api/analytics", requireAuth, (ctx) => {
  const total = [...db.query("SELECT COUNT(*) FROM visits")][0][0];
  const last10 = [
    ...db.query(
      "SELECT ip, user_agent, timestamp FROM visits ORDER BY timestamp DESC LIMIT 10"
    ),
  ].map(([ip, user_agent, timestamp]) => ({ ip, user_agent, timestamp }));

  ctx.response.body = { total, last10 };
});

// User Management Endpoints
// Get all users (admin only)
router.get("/api/users", requireAuth, (ctx) => {
  try {
    let users;
    try {
      users = [
        ...db.query(
          "SELECT id, username, created_at FROM user ORDER BY id DESC"
        ),
      ].map(([id, username, created_at]) => ({
        id,
        username,
        created_at,
      }));
    } catch (error) {
      // Fallback to basic query if created_at column doesn't exist
      users = [
        ...db.query("SELECT id, username FROM user ORDER BY id DESC"),
      ].map(([id, username]) => ({
        id,
        username,
        created_at: null,
      }));
    }
    ctx.response.body = { users };
  } catch (error) {
    console.error("Error fetching users:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Failed to fetch users" };
  }
});

// Create new user (admin only)
router.post("/api/users", requireAuth, async (ctx) => {
  try {
    const body = await ctx.request.body({ type: "json" }).value;
    const { username, password } = body;

    if (!username || !password) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Username and password are required" };
      return;
    }

    // Check if user already exists
    const existingUser = [
      ...db.query("SELECT id FROM user WHERE username = ?", [username]),
    ][0];

    if (existingUser) {
      ctx.response.status = 409;
      ctx.response.body = { error: "Username already exists" };
      return;
    }

    // Hash password and create user
    const { hashPassword } = await import("./controllers.ts");
    const hashedPassword = await hashPassword(password);

    db.query("INSERT INTO user (username, password_hash) VALUES (?, ?)", [
      username,
      hashedPassword,
    ]);

    ctx.response.status = 201;
    ctx.response.body = { message: "User created successfully", username };
  } catch (error) {
    console.error("Error creating user:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Failed to create user" };
  }
});

// Update user password (admin only)
router.put("/api/users/:id", requireAuth, async (ctx) => {
  try {
    const userId = parseInt(ctx.params.id);
    const body = await ctx.request.body({ type: "json" }).value;
    const { password } = body;

    if (!password) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Password is required" };
      return;
    }

    // Check if user exists
    const user = [...db.query("SELECT id FROM user WHERE id = ?", [userId])][0];

    if (!user) {
      ctx.response.status = 404;
      ctx.response.body = { error: "User not found" };
      return;
    }

    // Hash new password and update
    const { hashPassword } = await import("./controllers.ts");
    const hashedPassword = await hashPassword(password);

    db.query("UPDATE user SET password_hash = ? WHERE id = ?", [
      hashedPassword,
      userId,
    ]);

    ctx.response.body = { message: "User password updated successfully" };
  } catch (error) {
    console.error("Error updating user:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Failed to update user" };
  }
});

// Delete user (admin only)
router.delete("/api/users/:id", requireAuth, (ctx) => {
  try {
    const userId = parseInt(ctx.params.id);

    // Prevent deleting the admin user (assuming admin has ID 1)
    if (userId === 1) {
      ctx.response.status = 403;
      ctx.response.body = { error: "Cannot delete admin user" };
      return;
    }

    // Check if user exists
    const user = [...db.query("SELECT id FROM user WHERE id = ?", [userId])][0];

    if (!user) {
      ctx.response.status = 404;
      ctx.response.body = { error: "User not found" };
      return;
    }

    db.query("DELETE FROM user WHERE id = ?", [userId]);

    ctx.response.body = { message: "User deleted successfully" };
  } catch (error) {
    console.error("Error deleting user:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Failed to delete user" };
  }
});

// --- BLOG CRUD ---
// Create blog post (protected)
router.post("/api/blog", requireAuth, async (ctx) => {
  const { title, content, tags } = await ctx.request.body({ type: "json" })
    .value;
  db.query("INSERT INTO blog (title, content, tags) VALUES (?, ?, ?)", [
    title,
    content,
    tags || "",
  ]);
  ctx.response.body = { message: "Blog post created" };
});

// Get all blog posts (public, rendered)
router.get("/api/blog", async (ctx) => {
  const posts = [
    ...db.query(
      "SELECT id, title, content, created_at, tags FROM blog ORDER BY created_at DESC"
    ),
  ].map(([id, title, content, created_at, tags]) => ({
    id,
    title,
    content,
    created_at,
    tags: tags || "",
  })) as any[];
  // Render markdown for each post
  for (const post of posts) {
    post.html = await renderMarkdown(post.content);
  }
  ctx.response.body = posts;
});

// Get single blog post by id (public, rendered)
router.get("/api/blog/:id", async (ctx) => {
  const id = ctx.params.id;
  const row = [
    ...db.query(
      "SELECT id, title, content, created_at, tags FROM blog WHERE id = ?",
      [id]
    ),
  ][0];
  if (!row) {
    ctx.response.status = 404;
    ctx.response.body = { error: "Not found" };
    return;
  }
  const [pid, title, content, created_at, tags] = row;
  const html = await renderMarkdown(content);
  ctx.response.body = {
    id: pid,
    title,
    content,
    created_at,
    tags: tags || "",
    html,
  };
});

// Update blog post (protected)
router.put("/api/blog/:id", requireAuth, async (ctx) => {
  const id = ctx.params.id;
  const { title, content, tags } = await ctx.request.body({ type: "json" })
    .value;
  db.query("UPDATE blog SET title = ?, content = ?, tags = ? WHERE id = ?", [
    title,
    content,
    tags || "",
    id,
  ]);
  ctx.response.body = { message: "Blog post updated" };
});

// Delete blog post (protected)
router.delete("/api/blog/:id", requireAuth, (ctx) => {
  const id = ctx.params.id;
  db.query("DELETE FROM blog WHERE id = ?", [id]);
  ctx.response.body = { message: "Blog post deleted" };
});

// --- PORTFOLIO CRUD ---
// Create portfolio item (protected)
router.post("/api/portfolio", requireAuth, async (ctx) => {
  const { title, description, link, image } = await ctx.request.body({
    type: "json",
  }).value;
  db.query(
    "INSERT INTO portfolio (title, description, link, image) VALUES (?, ?, ?, ?)",
    [title, description, link, image]
  );
  ctx.response.body = { message: "Portfolio item created" };
});

// Get all portfolio items (public)
router.get("/api/portfolio", async (ctx) => {
  const items = [
    ...db.query(
      "SELECT id, title, description, link, image, created_at FROM portfolio ORDER BY created_at DESC"
    ),
  ].map(([id, title, description, link, image, created_at]) => ({
    id,
    title,
    description,
    link,
    image,
    created_at,
  }));
  ctx.response.body = items;
});

// Get single portfolio item by id (public)
router.get("/api/portfolio/:id", async (ctx) => {
  const id = ctx.params.id;
  const row = [
    ...db.query(
      "SELECT id, title, description, link, image, created_at FROM portfolio WHERE id = ?",
      [id]
    ),
  ][0];
  if (!row) {
    ctx.response.status = 404;
    ctx.response.body = { error: "Not found" };
    return;
  }
  const [pid, title, description, link, image, created_at] = row;
  ctx.response.body = { id: pid, title, description, link, image, created_at };
});

// Update portfolio item (protected)
router.put("/api/portfolio/:id", requireAuth, async (ctx) => {
  const id = ctx.params.id;
  const { title, description, link, image } = await ctx.request.body().value;
  db.query(
    "UPDATE portfolio SET title = ?, description = ?, link = ?, image = ? WHERE id = ?",
    [title, description, link, image, id]
  );
  ctx.response.body = { message: "Portfolio item updated" };
});

// Delete portfolio item (protected)
router.delete("/api/portfolio/:id", requireAuth, (ctx) => {
  const id = ctx.params.id;
  db.query("DELETE FROM portfolio WHERE id = ?", [id]);
  ctx.response.body = { message: "Portfolio item deleted" };
});

// --- BACKUP ENDPOINTS ---
// Create backup (protected)
router.post("/api/backup", requireAuth, async (ctx) => {
  try {
    const { exec } = await import("https://deno.land/x/exec/mod.ts");
    const result = await exec("cd /app && ./backup.sh backup");

    if (result.status.success) {
      ctx.response.body = {
        message: "Backup created successfully",
        output: result.output,
      };
    } else {
      ctx.response.status = 500;
      ctx.response.body = {
        error: "Backup failed",
        output: result.output,
      };
    }
  } catch (error) {
    console.error("Backup error:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Backup failed" };
  }
});

// List backups (protected)
router.get("/api/backup", requireAuth, async (ctx) => {
  try {
    const { exec } = await import("https://deno.land/x/exec/mod.ts");
    const result = await exec("cd /app && ./backup.sh list");

    ctx.response.body = {
      message: "Backup list retrieved",
      output: result.output,
    };
  } catch (error) {
    console.error("Backup list error:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Failed to list backups" };
  }
});

// Get backup statistics (protected)
router.get("/api/backup/stats", requireAuth, async (ctx) => {
  try {
    const { exec } = await import("https://deno.land/x/exec/mod.ts");
    const result = await exec("cd /app && ./backup.sh stats");

    ctx.response.body = {
      message: "Backup statistics retrieved",
      output: result.output,
    };
  } catch (error) {
    console.error("Backup stats error:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Failed to get backup statistics" };
  }
});

export default router;
