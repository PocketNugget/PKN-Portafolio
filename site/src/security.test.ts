import { describe, expect, it } from "vitest";
import { SECURITY_HEADERS, withSecurity } from "./security";

describe("security headers", () => {
  it("keeps the status and body and replaces a weak policy", async () => {
    const response = withSecurity(
      new Response("gone\n", {
        status: 404,
        statusText: "Missing",
        headers: {
          "content-type": "text/plain; charset=utf-8",
          "content-security-policy": "default-src * 'unsafe-inline' 'unsafe-eval'",
        },
      }),
    );
    expect(response.status).toBe(404);
    expect(response.statusText).toBe("Missing");
    expect(await response.text()).toBe("gone\n");
    expect(response.headers.get("content-type")).toBe("text/plain; charset=utf-8");
    const csp = response.headers.get("content-security-policy") ?? "";
    expect(csp).toBe(SECURITY_HEADERS["content-security-policy"]);
    expect(csp).not.toContain("unsafe-inline");
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).toContain("form-action 'none'");
    expect(response.headers.get("x-frame-options")).toBe("DENY");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
  });

  it("widens only the player asset path", () => {
    const player = withSecurity(new Response("ok"), "/vendor/webdeck-player/index.html");
    const csp = player.headers.get("content-security-policy") ?? "";
    expect(csp).toContain("https://www.youtube.com");
    expect(csp).toContain("frame-src https://www.youtube.com");
    expect(csp).toContain("frame-ancestors 'self'");
    expect(csp).not.toContain("unsafe-inline");
    expect(csp).not.toContain("unsafe-eval");
    expect(player.headers.get("x-frame-options")).toBe("SAMEORIGIN");
    const home = SECURITY_HEADERS["content-security-policy"] ?? "";
    expect(home).not.toContain("youtube.com");
    expect(home).toContain("frame-ancestors 'none'");
    expect(SECURITY_HEADERS["x-frame-options"]).toBe("DENY");
  });
});
