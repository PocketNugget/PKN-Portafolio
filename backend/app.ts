// Oak server entrypoint
import { Application, oakCors } from "./deps.ts";
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import router from "./routes.ts";

const app = new Application();

// CORS: allow frontend origin and credentials
app.use(
  oakCors({
    origin: Deno.env.get("FRONTEND_ORIGIN") || "http://localhost:3000",
    credentials: true,
  })
);

app.use(router.routes());
app.use(router.allowedMethods());

console.log("Server running on http://localhost:8000");
// For HTTPS in production, use a reverse proxy (nginx, Caddy, etc.) or Deno's native TLS options.
// Use environment variables for all secrets and config (see .env and dotenv import).
await app.listen({ port: 8000 });
