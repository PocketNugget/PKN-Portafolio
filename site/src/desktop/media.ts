export interface Shot {
  src: string;
  title: string;
  caption: string;
}

/** Files copied from the local photo folder into site/public/media. */
export const PICTURES: Shot[] = [
  {
    src: "/media/me.png",
    title: "Portrait",
    caption: "Goben Diego Constantino Aguirre.",
  },
  {
    src: "/media/hackztecs-2024.jpg",
    title: "Hackztecs 2024",
    caption: "Hackztecs, 2024.",
  },
  {
    src: "/media/hackztecs-autumn-2024.jpg",
    title: "Hackztecs autumn 2024",
    caption: "Hackztecs, autumn 2024.",
  },
  {
    src: "/media/hackztecs-spring-2026.jpg",
    title: "Hackztecs spring 2026",
    caption: "Hackztecs, spring 2026.",
  },
  {
    src: "/media/hackztecs-team.jpg",
    title: "Hackztecs",
    caption: "Hackztecs.",
  },
  {
    src: "/media/docker-course.jpg",
    title: "Docker session",
    caption: "Docker session at STEM UDLAP. Build a container, then bring Compose up.",
  },
  {
    src: "/media/hackmexico.jpg",
    title: "HackMexico",
    caption: "HackMexico with AngelHack, 2024.",
  },
  {
    src: "/media/paper-talk.jpg",
    title: "Paper talk",
    caption: "Presenting the MICAI 2024 paper.",
  },
  {
    src: "/media/paper-with-cert.jpg",
    title: "Paper and certificate",
    caption: "MICAI 2024 presentation, certificate in hand. Springer LNCS 15246.",
  },
  {
    src: "/media/austria-hackathon.jpg",
    title: "MAIA",
    caption:
      "MAIA, November 2024. Team Los Zepedas, first of 22 on the ÖBB challenge. The prize was a trip to Austria.",
  },
  {
    src: "/media/changemaker-2025.jpg",
    title: "ColorScore",
    caption: "ColorScore, November 2025. First place, Enactus Changemakers. Team Xcookers.",
  },
];

export const AWARDS: Shot[] = [
  {
    src: "/media/htb-university-2025.jpg",
    title: "HTB University CTF 2025",
    caption: "HTB University CTF 2025, Jingle Trouble. Hackztecs finished 52 of 1,014.",
  },
  {
    src: "/media/htb-apocalypse-2025.jpg",
    title: "HTB Cyber Apocalypse 2025",
    caption: "HTB Cyber Apocalypse CTF 2025. 51 of 77 challenges, 34,125 points, rank 293.",
  },
  {
    src: "/media/htb-apocalypse-2024.jpg",
    title: "HTB Cyber Apocalypse 2024",
    caption: "HTB Cyber Apocalypse CTF 2024 certificate. The 2024 score is not listed on this site.",
  },
  {
    src: "/media/htb-university-2024.jpg",
    title: "HTB University CTF 2024",
    caption: "HTB University CTF 2024 certificate.",
  },
  {
    src: "/media/htb-university-2023.jpg",
    title: "HTB University CTF 2023",
    caption: "HTB University CTF 2023 certificate.",
  },
  {
    src: "/media/paper-publication.jpg",
    title: "MICAI publication",
    caption: "Publication certificate for the MICAI 2024 paper. Springer LNCS 15246, pages 198 to 209.",
  },
  {
    src: "/media/paper-with-cert.jpg",
    title: "Paper and certificate",
    caption: "MICAI 2024 presentation, certificate in hand.",
  },
  {
    src: "/media/austria-hackathon.jpg",
    title: "MAIA",
    caption: "MAIA, November 2024. First of 22 teams on the ÖBB challenge.",
  },
  {
    src: "/media/changemaker-2025.jpg",
    title: "ColorScore",
    caption: "ColorScore, November 2025. First place at the Enactus Changemakers challenge.",
  },
];
