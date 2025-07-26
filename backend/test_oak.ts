import { Application, Router } from "./deps.ts";

const app = new Application();
const router = new Router();

router.post("/test", async (ctx) => {
  console.log("Request received");
  console.log("ctx.request.body:", typeof ctx.request.body);
  console.log("ctx.request.body():", typeof ctx.request.body());

  try {
    const body = await ctx.request.body().value;
    console.log("Body value:", body);
    ctx.response.body = { success: true, body };
  } catch (error) {
    console.log("Error:", error);
    ctx.response.body = { error: error.message };
  }
});

app.use(router.routes());
app.use(router.allowedMethods());

console.log("Test server running on http://localhost:8001");
await app.listen({ port: 8001 });
