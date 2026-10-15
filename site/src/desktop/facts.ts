import type { DeskApp } from "./host";
import { idleApp } from "./host";

/** Short lines that already appear in the catalog. Nothing new is added here. */
export const FACTS: string[] = [
  "Goben Diego Constantino Aguirre. Computer systems engineering at UDLAP, 2021 to 2025, graduated, 9.0/10.",
  "Full-time SOC/MDR analyst at TBSeK since July 2026, remote from Mexico City. The part-time Jr. SOC seat was April 2025 to July 2026.",
  "J-1 intern at Apple, sponsored by Cultural Vistas. Dates, team, and project are not listed.",
  "STEM UDLAP, researcher and developer, February 2024 to June 2026. The lab server was a Mac Mini, with Docker and Cloudflare Tunnels.",
  "Hackztecs president since February 2024. Weekly sessions on TCP/IP, Wireshark, Nmap, Burp Suite, and HTTP. More than 8 CTFs.",
  "HTB University CTF 2025, Jingle Trouble: 52 of 1,014, top 5%, only Mexican university in the top 100.",
  "HTB Cyber Apocalypse CTF 2025: 51 of 77 challenges, 34,125 points, rank 293, top 3.5% worldwide, 3rd in Mexico. A different event from Jingle Trouble.",
  "MAIA, November 2024, team Los Zepedas, first of 22 on the ÖBB challenge. A hackathon prototype.",
  "ColorScore, November 2025, first place, Enactus Changemakers, team Xcookers. SwiftUI, k-means, geometric marks.",
  "Paper with Azuany Mila and Zobeida Guzmán: Easy for Us, Complex for AI. MICAI 2024, Springer LNCS 15246, pages 198 to 209.",
  "Spanish, native. English, C1+. French, A2. German, A1.",
  "Looking at MDR, SOC, and SRE roles in Mexico, the United States, Austria, Ireland, and the Netherlands. A cybersecurity master's, Ireland included, is on that list.",
  "HackRF One and a Nuand bladeRF 2.0 on the bench, mostly 2.4 to 5.8 GHz. Separately, an iMac G4 restoration.",
  "A coding agent can draft a change. I still read the diff.",
];

const TOOLS: { label: string; path: string }[] = [
  { label: "Player", path: "/player" },
  { label: "My Pictures", path: "/pictures" },
  { label: "Certificates", path: "/awards" },
  { label: "Converter", path: "/convert" },
  { label: "Hack", path: "/hack" },
  { label: "Nugget", path: "/buddy" },
];

export function mountFacts(host: HTMLElement, open: (path: string) => void): DeskApp {
  host.replaceChildren();
  const root = document.createElement("div");
  root.className = "facts-app";
  const lead = document.createElement("p");
  lead.textContent = "The same record as the rest of the site, in short lines.";
  const list = document.createElement("ul");
  list.className = "ls";
  for (const fact of FACTS) {
    const item = document.createElement("li");
    item.textContent = fact;
    list.append(item);
  }
  const heading = document.createElement("h2");
  heading.textContent = "Tools";
  const row = document.createElement("div");
  row.className = "tool-row";
  for (const tool of TOOLS) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = tool.label;
    button.addEventListener("click", () => open(tool.path));
    row.append(button);
  }
  root.append(lead, list, heading, row);
  host.append(root);
  return idleApp;
}
