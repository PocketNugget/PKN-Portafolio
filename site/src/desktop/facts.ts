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
  "The search is SOC, MDR, and SRE work. A cybersecurity master's is also on the list.",
  "On the bench: a HackRF One and a Nuand bladeRF 2.0, mostly 2.4 to 5.8 GHz. Separately, an iMac G4 restoration.",
  "A coding agent can draft a change. He still has to read the diff.",
];

/** Spoken by the nugget, to the visitor. Same record as FACTS. Nothing new is added. */
export const NUGGET_LINES: string[] = [
  "You are looking at Goben's desk. I will guide you, and I will drop fun facts about him and tips while you move through the site. He finished computer systems engineering at UDLAP, 2021 to 2025. The grade on the record is 9.0/10.",
  "If you open Jobs, you get two seats at TBSeK. Part-time Jr. SOC from April 2025 to July 2026, then full-time SOC/MDR.",
  "If you want the lab story, the STEM server was a Mac Mini. He ran Docker and Cloudflare Tunnels on it from February 2024 to June 2026.",
  "You can ask about Hackztecs. It still meets weekly: TCP/IP, Wireshark, Nmap, Burp Suite, HTTP. He has chaired it since February 2024. More than 8 CTFs.",
  "The University board you will see under Projects is Jingle Trouble. Hackztecs finished 52 of 1,014. Top 5%. The only Mexican university in the top 100.",
  "Do not mix that up when you read the next board. Cyber Apocalypse CTF 2025 is different: 51 of 77 challenges, 34,125 points, rank 293, top 3.5% worldwide, 3rd in Mexico.",
  "November 2024, if you are looking at MAIA: team Los Zepedas took the ÖBB challenge. First of 22. The prize was a trip to Austria. The hackathon was in Mexico City.",
  "You can open ColorScore under Projects. November 2025, first place at Enactus Changemakers with team Xcookers. SwiftUI, k-means, geometric marks.",
  "There is a paper if you need it. MICAI 2024, Easy for Us, Complex for AI, Springer LNCS 15246, pages 198 to 209. He wrote it with Zobeida Guzmán.",
  "Languages, since you will ask: Spanish is native. English is C1+. French is A2. German is A1.",
  "If you are hiring, he is open to SOC, MDR, and SRE work. A cybersecurity master's is also on the list.",
  "On the bench, if you open Radio: a HackRF One and a Nuand bladeRF 2.0, mostly 2.4 to 5.8 GHz. The iMac G4 restoration is a separate pile.",
  "One habit you should know. A coding agent can draft a change. He still has to read the diff.",
];

export const NUGGET_SCARE = "I hope you do not hack me.";

export const NUGGET_TIPS: Record<string, string> = {
  "/": "Start with Jobs, then Projects, then Skills. Courses and Contact sit on that same row. Hit Next if you want another line from me.",
  "/jobs": "You are on the jobs. Full-time SOC/MDR at TBSeK, July 2026 to present. The junior seat before that was part-time. STEM and T-Systems are further down.",
  "/work": "You are on the projects he will talk about. The two HTB boards are different events, so read both.",
  "/skills": "You are on the tool list from the jobs. A coding agent can draft a change. He still has to read the diff.",
  "/certs": "You are on the courses. The named ones are Metasploit and macOS Fundamentals, both July 2025. Security+ is in progress, not earned.",
  "/contact": "You are on contact. There is no form. The address he reads is the mail link above.",
  "/awards": "You are looking at the scans. If a year has no rank in the record, you will not find one invented here.",
  "/pictures": "You are in the photos. The portrait is the same one on About.",
  "/notes": "You are on the notes. Two short ones. Solve steps stay in the repo, not on this page.",
  "/radio": "You are on the radio page. HackRF One, bladeRF, and the iMac G4. He will tell you it is bench work, not a guide.",
  "/tron": "You are on the light cycle. Two bikes hunt you. Steer, and do not cross a trail. A bike that crashes leaves its trail as a wall. Clear five grids to win. Press r to restart.",
};

const TOOLS: { label: string; path: string }[] = [
  { label: "Player", path: "/player" },
  { label: "My Pictures", path: "/pictures" },
  { label: "Certificates", path: "/awards" },
  { label: "Converter", path: "/convert" },
  { label: "Sweep", path: "/sweep" },
  { label: "Tron", path: "/tron" },
  { label: "Nugget", path: "/buddy" },
];

export function mountFacts(host: HTMLElement, open: (path: string) => void): DeskApp {
  host.replaceChildren();
  const root = document.createElement("div");
  root.className = "facts-app";
  const lead = document.createElement("p");
  lead.textContent = t("The same record as the rest of the site, told in short lines.");
  const list = document.createElement("ul");
  list.className = "ls";
  for (const fact of FACTS) {
    const item = document.createElement("li");
    item.textContent = t(fact);
    list.append(item);
  }
  const heading = document.createElement("h2");
  heading.textContent = t("Tools");
  const row = document.createElement("div");
  row.className = "tool-row";
  for (const tool of TOOLS) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = t(tool.label);
    button.addEventListener("click", () => open(tool.path));
    row.append(button);
  }
  root.append(lead, list, heading, row);
  host.append(root);
  return idleApp;
}
