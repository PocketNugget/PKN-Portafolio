export interface Link {
  label: string;
  href: string;
}

export interface Job {
  id: string;
  role: string;
  org: string;
  place: string;
  date: string;
  summary: string;
  body: string[];
  tools: string[];
}

export interface Project {
  slug: string;
  title: string;
  date: string;
  summary: string;
  body: string[];
  tools: string[];
  links: Link[];
  people: string;
  aliases: string[];
}

export interface NoteMeta {
  slug: string;
  title: string;
  date: string;
  file: string;
}

export interface ArchiveItem {
  name: string;
  href: string;
}

export const profiles = {
  email: {
    label: "goben.ca.pkn@hotmail.com",
    href: "mailto:goben.ca.pkn@hotmail.com",
  },
  github: {
    label: "GitHub",
    href: "https://github.com/PocketNugget",
  },
  linkedin: {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/goben-diego/",
  },
  x: {
    label: "X",
    href: "https://x.com/cyberpkn",
  },
} as const;

export const linkPage: { label: string; href: string }[] = [
  profiles.email,
  profiles.github,
  profiles.linkedin,
  profiles.x,
  { label: "Instagram", href: "https://www.instagram.com/pocket_nugget/" },
  { label: "YouTube", href: "https://www.youtube.com/@Nuggz_TV" },
];

export const jobs: Job[] = [
  {
    id: "tbsek",
    role: "SOC/MDR analyst",
    org: "TBSeK",
    place: "Mexico City, remote",
    date: "July 2026 to present",
    summary:
      "Full-time. Alert triage on SIEM, EDR, and network tools, plus the scripts that feed the shift.",
    body: [
      "Full-time since July 2026, remote from Mexico City. I watch alerts from the SIEM, EDR, and network tools, correlate them, and escalate the ones that need an owner.",
      "On a live case I help with detection, evidence, and the first containment steps. I also write in-house scripts for the parts of the shift that were the same every time.",
    ],
    tools: ["Splunk", "Darktrace", "CrowdStrike", "Cisco AMP", "Cisco Umbrella", "GroupIB", "Wireshark"],
  },
  {
    id: "tbsek-jr",
    role: "Jr. SOC analyst",
    org: "TBSeK",
    place: "Mexico City, remote",
    date: "April 2025 to July 2026",
    summary:
      "Part-time. Reporting automation in Python and Node.js, about 70% less time on those reports.",
    body: [
      "Part-time from April 2025 until the full-time role. I triaged alerts across 7 or more client environments and wrote the follow-up until someone owned the case. False positives got filtered. The ones that stayed followed the incident-response playbook.",
      "The repetitive report work went into Python, Node.js, Streamlit, and Selenium. That cut report time by about 70%. OSINT for this seat included dark-web checks for leaked credentials and impersonation.",
    ],
    tools: ["Splunk", "Python", "Node.js", "Streamlit", "Selenium", "Datadog"],
  },
  {
    id: "apple",
    role: "J-1 intern",
    org: "Apple",
    place: "Sponsored by Cultural Vistas",
    date: "J-1, Cultural Vistas",
    summary:
      "J-1 intern at Apple, sponsored by Cultural Vistas. Dates and team are not listed here yet.",
    body: [
      "J-1 intern at Apple, sponsored by Cultural Vistas. I am not going to invent the dates, the team, or a project name.",
    ],
    tools: [],
  },
  {
    id: "stem",
    role: "Researcher and developer",
    org: "STEM UDLAP",
    place: "Puebla, Mexico, hybrid",
    date: "February 2024 to June 2026",
    summary:
      "Apprenticeship. The MICAI paper, the public dataset, and the lab server on a Mac Mini.",
    body: [
      "Apprenticeship from February 2024 to June 2026. The paper and the dataset are on open coherence-paper. The lab server was a Mac Mini. Cloudflare Tunnels published the registration services. Older Angular and Node apps moved into Docker so the host was not the deploy step. Access rules and a basic hardening pass sat on the same box.",
      "I also taught a hands-on Docker session at UDLAP: one container, then Compose. The notes are on the Hackztecs page. Type open hackztecs.",
    ],
    tools: ["Linux", "Docker", "Cloudflare Tunnels", "Mac Mini"],
  },
  {
    id: "tsystems",
    role: "Software engineer intern",
    org: "T-Systems",
    place: "Puebla, Mexico",
    date: "April 2024 to July 2024",
    summary: "Part-time. A course platform with an Angular front and MySQL behind it.",
    body: [
      "Part-time, hybrid in Puebla. I built a course platform so people could track training. Angular on the front, MySQL behind it. Some of the progress was game-like. I wrote the docs and used the team's Git process.",
    ],
    tools: ["Angular", "MySQL", "Git"],
  },
];

export const projects: Project[] = [
  {
    slug: "tbsek-reports",
    title: "Shift reports at TBSeK",
    date: "April 2025 to July 2026",
    summary:
      "Python and Node.js for the part of MDR triage that was the same every time: collect, format, file.",
    body: [
      "The alerts were not the slow part. The writeup after the alert was. I scripted the collection and the report shape in Python, with Node.js where the existing tools already spoke it, plus Streamlit for the bits an analyst had to see and Selenium where a console had no export.",
      "Report time dropped by about 70%. No client names on this page, and no alert contents.",
    ],
    tools: ["Python", "Node.js", "Streamlit", "Selenium", "Splunk"],
    links: [],
    people: "",
    aliases: ["tbsek", "reports", "soc"],
  },
  {
    slug: "htb-university-2025",
    title: "HTB University CTF 2025, Jingle Trouble",
    date: "November 2025",
    summary:
      "Hackztecs finished 52 of 1,014. Top 5%. Only Mexican university in the top 100.",
    body: [
      "Hack The Box University CTF 2025 was called Jingle Trouble. We finished 52 of 1,014 teams. That is the top 5%, and UDLAP was the only Mexican university in the top 100. It was my first top-100 finish at a University CTF.",
      "I was president of Hackztecs for it. The work we sat down to was web, network, and forensics, with Burp Suite and Ghidra open. The solves stay off this site.",
    ],
    tools: ["Burp Suite", "Ghidra", "web", "network", "forensics"],
    links: [],
    people:
      "With Georgina Zerón, Natalia María Caballero Garza, Daniel Martínez Maimone, Juan Francisco Cruz Baquedano, and Juan Pablo Morales Durante.",
    aliases: ["htb", "jingle", "university"],
  },
  {
    slug: "cyber-apocalypse-2025",
    title: "HTB Cyber Apocalypse CTF 2025",
    date: "2025",
    summary:
      "51 of 77 challenges, 34,125 points, rank 293. Top 3.5% worldwide and 3rd in Mexico.",
    body: [
      "This is a different event from Jingle Trouble. Hackztecs solved 51 of 77 challenges, scored 34,125 points, and finished rank 293. That was the top 3.5% worldwide and 3rd in Mexico.",
      "I started in the group as a member, under Juan Pablo Morales Durante, and later chaired it. The Apocalypse board was part of that stretch, along with more than 8 CTFs.",
    ],
    tools: ["CTF"],
    links: [],
    people:
      "With Juan Pablo Morales Durante, Azuany Mila, Georgina Zerón, and Daniel Martínez Maimone.",
    aliases: ["apocalypse", "htb-apocalypse"],
  },
  {
    slug: "sdr",
    title: "Bench radio",
    date: "Ongoing",
    summary:
      "HackRF One and a Nuand bladeRF 2.0. Sweeps and link tests on radios I have on the bench, mostly 2.4 to 5.8 GHz.",
    body: [
      "I use a HackRF One and a Nuand bladeRF 2.0 for sweeps, signal generation, and link tests. Most of that sits between 2.4 and 5.8 GHz. The Python tools are aimed at Autel drone links on 2.4 and 5 GHz, on links I am testing myself.",
      "I also like spectrum gear that fits in a bag. None of this is a guide to someone else's aircraft.",
    ],
    tools: ["Python", "HackRF One", "bladeRF 2.0"],
    links: [],
    people: "",
    aliases: ["hackrf", "bladerf", "radio", "autel"],
  },
  {
    slug: "cryptographic-toolkit",
    title: "Cryptographic Toolkit",
    date: "2025",
    summary:
      "Python solvers that show the steps, from classical ciphers through modern constructions. MIT license.",
    body: [
      "A Python toolkit I use to learn ciphers by implementing them, with the steps written down. Classical first, then the modern ones. It is a study repo, not a service.",
    ],
    tools: ["Python"],
    links: [
      {
        label: "Repository",
        href: "https://github.com/PocketNugget/Cryptographic-Toolkit",
      },
    ],
    people: "",
    aliases: ["crypto", "ciphers"],
  },
  {
    slug: "hacking-writeups",
    title: "Hacking writeups",
    date: "2025",
    summary:
      "Finished challenges, written up after the fact. The public repo is the archive.",
    body: [
      "Writeups for challenges I have already finished: web, Android, and some binary work. I link the repo instead of pasting solve chains here.",
    ],
    tools: ["Writeups"],
    links: [
      {
        label: "Repository",
        href: "https://github.com/PocketNugget/Hacking-Writeups",
      },
    ],
    people: "",
    aliases: ["writeups", "writeup"],
  },
  {
    slug: "iot-edr",
    title: "IOT-EDR",
    date: "2025",
    summary: "A simulated IoT EDR. Python. Not a product, and not deployed on anyone's network.",
    body: [
      "A simulation of what an endpoint agent would notice on a small device network. Useful for thinking about detections. It does not watch a real fleet.",
    ],
    tools: ["Python"],
    links: [
      {
        label: "Repository",
        href: "https://github.com/PocketNugget/IOT-EDR",
      },
    ],
    people: "",
    aliases: ["edr", "iot"],
  },
  {
    slug: "wifi2go",
    title: "Wifi2Go",
    date: "2026",
    summary: "A captive portal you pay to join. TypeScript.",
    body: [
      "Pay-to-join captive portal. The interesting part is the boundary between the open network and the session that has paid, not a marketing site in front of it.",
    ],
    tools: ["TypeScript"],
    links: [
      {
        label: "Repository",
        href: "https://github.com/PocketNugget/Wifi2Go",
      },
    ],
    people: "",
    aliases: ["wifi", "captive"],
  },
  {
    slug: "homelab",
    title: "Homelab and this site",
    date: "2024 to 2026",
    summary:
      "Raspberry Pi, Docker, Cloudflare Tunnels at home. This site is a Worker on purpose.",
    body: [
      "At home the machines are a Raspberry Pi and Docker, with Cloudflare Tunnels when something has to be reachable. The previous version of this portfolio was that stack: React, a Deno API, and a SQLite file.",
      "This version is a Worker. The pages are files. Login and the blog use D1. The colophon lists what is stored. A cluster in front of these pages would only be there so I could name it.",
    ],
    tools: ["Docker", "Raspberry Pi", "Cloudflare Tunnels", "Workers"],
    links: [
      {
        label: "Previous repo",
        href: "https://github.com/PocketNugget/PKN-Portafolio",
      },
      { label: "Colophon", href: "/colophon" },
    ],
    people: "",
    aliases: ["homelab", "lab", "pi", "site"],
  },
  {
    slug: "maia",
    title: "MAIA",
    date: "November 2024",
    summary:
      "First of 22 teams at the AI and Mobility Hackathon. Mobility incidents in, three budgeted options out.",
    body: [
      "Team Los Zepedas won the ÖBB challenge at the AI and Mobility Hackathon in Mexico City, run by ABA and Advantage Austria. First of 22 teams. The prize was a trip to Austria.",
      "MAIA takes mobility incidents from social posts and from reports staff already file, classifies them, and looks for causes that keep showing up. For each problem it drafts three options at different budgets, with a rough impact and a feasibility note. It was a hackathon prototype, built fast, not a transit system.",
    ],
    tools: ["Python", "prototyping"],
    links: [
      {
        label: "Fork",
        href: "https://github.com/PocketNugget/MAIA_Mobility-AI-Analytics",
      },
    ],
    people:
      "With Azuany Mila, Jorge Venegas, Nina Maeva Mazadiego Cortes, Humberto Zepeda González, and Hector Zepeda González. Mentors: Florian Bauer, J. Adolfo Carril Paniagua, and Alejandro Najera.",
    aliases: ["maia", "obb", "zepedas"],
  },
  {
    slug: "coherence-paper",
    title: "Easy for Us, Complex for AI",
    date: "October 2024",
    summary:
      "Springer LNCS paper from MICAI 2024. People spot broken generated images that the metrics still score as fine.",
    body: [
      "Co-authored with Azuany Mila and Zobeida Guzmán. We presented it at MICAI 2024, with UDLAP, INAOE, and SMIA, and Springer published it in LNCS 15246, pages 198 to 209.",
      "The survey covers realism metrics for VAEs, GANs, and diffusion models. The gap is Moravec's paradox in miniature: a person sees that a scene does not hold together, and the number does not. The image set that went with the work is 4,368 PNGs built from COCO.",
    ],
    tools: ["Research"],
    links: [
      {
        label: "DOI",
        href: "https://doi.org/10.1007/978-3-031-75540-8_15",
      },
      {
        label: "Dataset",
        href: "https://github.com/PocketNugget/Coherence-assessment-of-generated-realistic-images",
      },
      {
        label: "ORCID",
        href: "https://orcid.org/0009-0002-4819-7773",
      },
    ],
    people: "With Azuany Mila and Zobeida Guzmán.",
    aliases: ["paper", "springer", "micai", "dataset"],
  },
  {
    slug: "conisoft-2025",
    title: "CONISOFT 2025 workshop",
    date: "2025",
    summary:
      "Model files are code. Pickle, .pt, and .pth can run when loaded. SafeTensors and a disposable VM are the boring fix.",
    body: [
      "At UABCS in La Paz, with Azuany Mila and Dr. Zobeida Guzmán, under the IEEE Computer Society. The session was called \"Models under attack: backdoors, manipulation, and analysis of malicious AI.\"",
      "Python's docs say pickle is not safe. A weight file that is secretly a pickle runs code on load. We talked about that supply path and about the fixes: SafeTensors, or load the old file inside a container or a VM with no credentials mounted. The note on this site stops there on purpose.",
    ],
    tools: ["SafeTensors", "Docker", "Python"],
    links: [{ label: "Note", href: "/notes/model-files" }],
    people: "With Azuany Mila and Dr. Zobeida Guzmán.",
    aliases: ["conisoft", "pickle", "safetensors"],
  },
  {
    slug: "colorscore",
    title: "ColorScore",
    date: "November 2025",
    summary:
      "First place, Enactus Changemakers, accessibility track. Shapes on players when the shirts look the same.",
    body: [
      "Team Xcookers, for UDLAP, at the Changemakers Social Challenge. The theme was the 2026 World Cup. The failure mode is simple: two kits with no regulation on contrast, so a color-blind viewer cannot tell the sides apart.",
      "ColorScore is a SwiftUI app. On-device detection finds the players. K-means splits them into teams. Each team gets a geometric mark, drawn with Apple's frameworks, so the broadcast does not depend on the dye.",
    ],
    tools: ["Swift", "SwiftUI", "Core ML"],
    links: [],
    people:
      "With Azuany Mila, Nina Maeva Mazadiego Cortes, and Daniela Renée Ramírez. Guidance from Zobeida Guzmán, support from Humberto Zepeda González.",
    aliases: ["colorscore", "enactus", "xcookers"],
  },
  {
    slug: "wayzt",
    title: "WayZT",
    date: "February 2024 to March 2024",
    summary:
      "First place at a SwiftUI hackathon. The app names the waste and points at a recycling site.",
    body: [
      "An iOS app from a SwiftUI hackathon. A model classifies the waste. MapKit shows where to take it. Older than the 2026 resumes, and the repo is still public.",
    ],
    tools: ["Swift", "SwiftUI", "MapKit"],
    links: [
      {
        label: "Repository",
        href: "https://github.com/PocketNugget/WayZT",
      },
    ],
    people: "",
    aliases: ["wayzt"],
  },
  {
    slug: "where2skate",
    title: "Where2Skate",
    date: "January 2025 to May 2025",
    summary:
      "Android app for skateparks and street spots. Kotlin, Compose, Firebase, Maps.",
    body: [
      "Find a park, rate it, drop a street spot. Firebase auth, Cloud Firestore, Google Maps, Jetpack Compose.",
    ],
    tools: ["Kotlin", "Jetpack Compose", "Firebase", "Google Maps"],
    links: [
      {
        label: "Repository",
        href: "https://github.com/PocketNugget/Where2Skate",
      },
    ],
    people: "",
    aliases: ["skate", "where2skate"],
  },
  {
    slug: "hackztecs",
    title: "Hackztecs",
    date: "February 2024 to present",
    summary:
      "President of the UDLAP security group since February 2024. Member first, under Juan Pablo Morales Durante. More than 8 CTFs.",
    body: [
      "I joined knowing little and stayed. Juan Pablo Morales Durante was president before me and is the person who pulled me into this work. I have chaired the group since February 2024. We have entered more than 8 CTFs. Weekly sessions covered TCP/IP, Wireshark, Nmap, Burp Suite, and HTTP. The solves stay off this site.",
      "I also ran a Docker crash course at STEM UDLAP: build a container, then bring Compose up. I was treasurer of the computer science student council from August 2024 to May 2025, including the budget for CREATE-V.",
    ],
    tools: ["CTF", "Docker"],
    links: [
      {
        label: "Docker session notes",
        href: "https://lnkd.in/g-i5bp9C",
      },
    ],
    people: "",
    aliases: ["hackztecs", "docker-session"],
  },
];

export const earlier: { date: string; text: string }[] = [
  {
    date: "2024",
    text: "Vendimia, at Swift Change Makers (Enactus, a Banorte challenge), with Rodrigo Espíritu Berra, André Francois Duhamel Gutiérrez, and Alan Pérez Hernández.",
  },
  {
    date: "2024",
    text: "HackMexico with AngelHack. Crypto and interface work, with Juan Pablo Morales Durante, Carlos Javier Galán Zavala, and Gil Andrei Sotomayor Figueroa.",
  },
  {
    date: "2024",
    text: "CodeRush at Tec de Monterrey, Puebla, with Algorithmia Group Puebla Tec.",
  },
];

export const archive: ArchiveItem[] = [
  ["Pet-care", "https://github.com/PocketNugget/Pet-care"],
  ["MayaVision", "https://github.com/PocketNugget/MayaVision"],
  ["MindBloom", "https://github.com/PocketNugget/MindBloom"],
  ["QrStudentApp", "https://github.com/PocketNugget/QrStudentApp"],
  ["Lexical-Analyzer", "https://github.com/PocketNugget/Lexical-Analyzer"],
  ["house-of-the-leaves", "https://github.com/PocketNugget/house-of-the-leaves"],
  [
    "Genetic-Algorithm-Travelling-salesman-solution",
    "https://github.com/PocketNugget/Genetic-Algorithm-Travelling-salesman-solution",
  ],
  [
    "Enactus-hackathon-spring-2024",
    "https://github.com/PocketNugget/Enactus-hackathon-spring-2024",
  ],
  [
    "Operative-systems-class-activities",
    "https://github.com/PocketNugget/Operative-systems-class-activities",
  ],
  ["CAKE", "https://github.com/PocketNugget/CAKE"],
  ["AI-Class-Activities", "https://github.com/PocketNugget/AI-Class-Activities"],
  ["Q-Learning", "https://github.com/PocketNugget/Q-Learning"],
  ["CardboardSoft", "https://github.com/PocketNugget/CardboardSoft"],
  ["Bash-codes-activity", "https://github.com/PocketNugget/Bash-codes-activity"],
  [
    "Cannibals-and-Missionaries-",
    "https://github.com/PocketNugget/Cannibals-and-Missionaries-",
  ],
  ["Advanced-Room-Assign", "https://github.com/PocketNugget/Advanced-Room-Assign"],
  ["LibStats", "https://github.com/PocketNugget/LibStats"],
  ["Connect-4-JavaSwing", "https://github.com/PocketNugget/Connect-4-JavaSwing"],
  ["RoomAssign", "https://github.com/PocketNugget/RoomAssign"],
  ["Guessing-game-JS", "https://github.com/PocketNugget/Guessing-game-JS"],
  ["SmartHub", "https://github.com/PocketNugget/SmartHub"],
  ["Bank-Queue-Sim", "https://github.com/PocketNugget/Bank-Queue-Sim"],
  ["UCRI", "https://github.com/PocketNugget/UCRI"],
  ["ScheduleManagement", "https://github.com/PocketNugget/ScheduleManagement"],
].map(([name, href]) => ({ name, href }));

export const notes: NoteMeta[] = [
  {
    slug: "jingle-trouble",
    title: "Jingle Trouble",
    date: "November 2025",
    file: "jingle-trouble.md",
  },
  {
    slug: "model-files",
    title: "Model files are code",
    date: "2025",
    file: "model-files.md",
  },
];

export const radio = {
  title: "Radio and the G4",
  paragraphs: [
    "HackRF One and a Nuand bladeRF 2.0. I sweep, generate, and test links, mostly from 2.4 to 5.8 GHz. The Python in that folder is for Autel drone links on 2.4 and 5 GHz, on hardware I have on the bench.",
    "I like portable spectrum gear for the same reason I like a shell: the state fits on one screen. Separately, I am restoring an iMac G4. The lamp hinge is the whole personality of that machine, and it is slow work.",
  ],
};

export const bio = [
  "Goben Diego Constantino Aguirre. I finished computer systems engineering at UDLAP, 2021 to 2025, with a 9.0/10. Internships included.",
  "I have been at TBSeK since April 2025. Part-time Jr. SOC analyst until July 2026, then full-time SOC/MDR analyst, remote from Mexico City. Splunk and the rest of the shift stack, incident notes, and Python and Node.js so the reports took less of the shift. About 70% less. Before TBSeK I was a J-1 intern at Apple through Cultural Vistas.",
  "STEM UDLAP was February 2024 to June 2026: the MICAI paper, and the lab server on a Mac Mini with Docker and Cloudflare Tunnels. I write Python against a HackRF One and a bladeRF. I chair Hackztecs, after coming in as a member under Juan Pablo Morales Durante.",
  "I am looking at MDR, SOC, and SRE roles in Mexico, the United States, Austria, Ireland, and the Netherlands. A cybersecurity master's, Ireland included, is on that same list.",
];

const GH = "https://github.com/PocketNugget";

export function openTable(): Record<string, string> {
  const table: Record<string, string> = {
    github: profiles.github.href,
    linkedin: profiles.linkedin.href,
    email: profiles.email.href,
    mail: profiles.email.href,
    x: profiles.x.href,
    twitter: profiles.x.href,
    orcid: "https://orcid.org/0009-0002-4819-7773",
    instagram: "https://www.instagram.com/pocket_nugget/",
    youtube: "https://www.youtube.com/@Nuggz_TV",
  };
  for (const project of projects) {
    table[project.slug] = `/work/${project.slug}`;
    for (const alias of project.aliases) {
      table[alias] = `/work/${project.slug}`;
    }
  }
  for (const note of notes) {
    table[note.slug] = `/notes/${note.slug}`;
  }
  for (const item of archive) {
    table[item.name.toLowerCase()] = item.href;
  }
  table.repo = GH;
  return table;
}

export function validateCatalog(): void {
  const slugs = new Set<string>();
  for (const project of projects) {
    if (!project.date.trim()) {
      throw new Error(`project ${project.slug} has no date`);
    }
    if (slugs.has(project.slug)) {
      throw new Error(`duplicate slug ${project.slug}`);
    }
    slugs.add(project.slug);
    if (!/^[a-z0-9-]+$/.test(project.slug)) {
      throw new Error(`bad slug ${project.slug}`);
    }
  }
  for (const job of jobs) {
    if (!job.date.trim()) throw new Error(`job ${job.id} has no date`);
  }
  const noteSlugs = new Set<string>();
  for (const note of notes) {
    if (!note.date.trim()) throw new Error(`note ${note.slug} has no date`);
    if (noteSlugs.has(note.slug)) throw new Error(`duplicate note ${note.slug}`);
    noteSlugs.add(note.slug);
  }
  const opens = openTable();
  if (opens.htb !== "/work/htb-university-2025") {
    throw new Error("open alias htb drifted");
  }
}
