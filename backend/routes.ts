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

export default router;
