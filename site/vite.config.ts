import { writeFileSync } from "node:fs";
import { defineConfig } from "vitest/config";
import { sitemapXml } from "./src/paths.ts";

export default defineConfig({
  plugins: [
    {
      name: "sitemap",
      buildStart() {
        writeFileSync(new URL("./public/sitemap.xml", import.meta.url), sitemapXml());
      },
    },
  ],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
