import { t } from "../i18n";
import type { DeskApp } from "./host";
import { idleApp } from "./host";

/** Short lines from the catalog, told in the third person. Nothing new is added here. */
export const FACTS: string[] = [
  "Goben finished computer systems engineering at UDLAP, 2021 to 2025. The grade on the record is 9.0/10.",
  "Two seats at TBSeK. Part-time Jr. SOC from April 2025 to July 2026, then full-time SOC/MDR.",
  "The STEM lab server was a Mac Mini. Docker and Cloudflare Tunnels ran on it from February 2024 to June 2026.",
  "Hackztecs still meets weekly: TCP/IP, Wireshark, Nmap, Burp Suite, HTTP. He has chaired it since February 2024. More than 8 CTFs.",
  "Hack The Box University CTF 2025, Jingle Trouble, ended 52 of 1,014. Top 5%. The only Mexican university in the top 100.",
  "A different board: HTB Cyber Apocalypse CTF 2025. 51 of 77 challenges, 34,125 points, rank 293, top 3.5% worldwide, 3rd in Mexico.",
  "November 2024, team Los Zepedas took the ÖBB challenge at MAIA. First of 22. The prize was a trip to Austria.",
  "ColorScore, November 2025, first place at Enactus Changemakers with team Xcookers. SwiftUI, k-means, geometric marks.",
  "The MICAI 2024 paper Easy for Us, Complex for AI is in Springer LNCS 15246, pages 198 to 209. Co-authored with Zobeida Guzmán.",
  "Spanish is native. English is C1+. French is A2. German is A1.",
  "The search is MDR, SOC, and SRE work in Mexico, the United States, Austria, Ireland, and the Netherlands. A cybersecurity master's, Ireland included, is on that list.",
  "On the bench: a HackRF One and a Nuand bladeRF 2.0, mostly 2.4 to 5.8 GHz. Separately, an iMac G4 restoration.",
  "A coding agent can draft a change. He still has to read the diff.",
];

const TOOLS: { label: string; path: string }[] = [
  { label: "Player", path: "/player" },
  { label: "My Pictures", path: "/pictures" },
  { label: "Certificates", path: "/awards" },
  { label: "Converter", path: "/convert" },
  { label: "Sweep", path: "/sweep" },
  { label: "Nugget", path: "/buddy" },
];

export function mountFacts(host: HTMLElement, open: (path: string) => void): DeskApp {
  host.replaceChildren();
  const root = document.createElement("div");
  root.className = "facts-app";
  const lead = document.createElement("p");
  lead.textContent = "The same record as the rest of the site, told in short lines.";
  const list = document.createElement("ul");
  list.className = "ls";
  for (const fact of FACTS) {
    const item = document.createElement("li");
    item.textContent = t(fact);
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
