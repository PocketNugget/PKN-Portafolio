import { describe, expect, it } from "vitest";
import html from "../index.html?raw";

function meta(attr: "name" | "property", key: string): string {
  const match = new RegExp(`<meta\\s+${attr}="${key.replace(/[:.]/g, "\\$&")}"\\s+content="([^"]*)"`).exec(html);
  return match?.[1] ?? "";
}

describe("index.html for link previews and search", () => {
  it("names the person and the current role", () => {
    expect(html).toContain("<title>Goben Diego Constantino Aguirre · SOC/MDR analyst</title>");
    expect(meta("name", "description")).toContain("SOC/MDR analyst at TBSeK");
    expect(meta("name", "description")).toContain("52 of 1,014");
  });

  it("has Open Graph and a large Twitter card", () => {
    expect(meta("property", "og:title")).toContain("Goben Diego Constantino Aguirre");
    expect(meta("property", "og:image")).toBe("https://pocketnugget.xyz/og.png");
    expect(meta("property", "og:image:width")).toBe("1200");
    expect(meta("property", "og:image:height")).toBe("630");
    expect(meta("name", "twitter:card")).toBe("summary_large_image");
  });

  it("carries valid Person data without private values", () => {
    const block = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html)?.[1] ?? "";
    const person = JSON.parse(block) as { "@type": string; name: string; jobTitle: string; sameAs: string[] };
    expect(person["@type"]).toBe("Person");
    expect(person.name).toBe("Goben Diego Constantino Aguirre");
    expect(person.jobTitle).toBe("SOC/MDR analyst");
    expect(person.sameAs).toContain("https://github.com/PocketNugget");
    expect(person.sameAs).toContain("https://orcid.org/0009-0002-4819-7773");
    expect(html).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    expect(html).not.toContain("—");
    expect(html).not.toMatch(/Netherlands|Ireland|Austria/);
  });
});
