import { extraDe, extraEs, extraFr } from "./i18n-extra";

export type Lang = "en" | "es" | "de" | "fr";

const LANGS: Lang[] = ["en", "es", "de", "fr"];

let current: Lang = "en";

const es: Record<string, string> = {
  "About Me": "Sobre mí",
  Jobs: "Empleos",
  Projects: "Proyectos",
  Skills: "Habilidades",
  Radio: "Radio",
  Notes: "Notas",
  Courses: "Cursos",
  Blog: "Blog",
  "My Links": "Enlaces",
  Contact: "Contacto",
  Terminal: "Terminal",
  "My Pictures": "Mis fotos",
  Certificates: "Certificados",
  Player: "Reproductor",
  Converter: "Conversor",
  Dice: "Dados",
  Flip: "Moneda",
  Calculator: "Calculadora",
  Wheel: "Ruleta",
  Sweep: "Sweep",
  Snake: "Snake",
  Tetris: "Tetris",
  Legal: "Legal",
  Remote: "Remoto",
  Facts: "Datos",
  Hack: "Hack",
  Nugget: "Nugget",
  Help: "Ayuda",
  Display: "Pantalla",
  Colophon: "Colofón",
  Login: "Entrar",
  Run: "Ejecutar",
  Find: "Buscar",
  Suggestions: "Sugerencias",
  Start: "Inicio",
  Next: "Siguiente",
  Profile: "Perfil",
  "Selected work": "Trabajo elegido",
  Work: "Trabajo",
  Earlier: "Antes",
  Tools: "Herramientas",
  Languages: "Idiomas",
  Agents: "Agentes",
  Show: "Ver",
  All: "Todo",
  Detection: "Detección",
  Research: "Investigación",
  Hackathon: "Hackathon",
  Apps: "Apps",
  "Goben Diego Constantino Aguirre. I finished computer systems engineering at UDLAP, 2021 to 2025, with a 9.0/10. Internships included.":
    "Goben Diego Constantino Aguirre. Terminé ingeniería en sistemas computacionales en la UDLAP, 2021 a 2025, con 9.0/10. Las prácticas del título están hechas.",
  "I have been at TBSeK since April 2025. The part-time Jr. SOC seat ran until July 2026: alert triage for 7 or more clients, playbooks, false positives, and Python and Node.js that cut report time by about 70%. The full-time SOC/MDR seat is Splunk, Darktrace, CrowdStrike, Cisco AMP, Cisco Umbrella, and GroupIB, plus correlation and the first containment steps.":
    "Estoy en TBSeK desde abril de 2025. El puesto junior de medio tiempo siguió hasta julio de 2026: triage de alertas para 7 o más clientes, playbooks, falsos positivos, y Python y Node.js que bajaron el tiempo de reportes cerca de 70%. El puesto SOC/MDR de tiempo completo es Splunk, Darktrace, CrowdStrike, Cisco AMP, Cisco Umbrella y GroupIB, más correlación y los primeros pasos de contención.",
  "STEM UDLAP was February 2024 to June 2026. I wrote the MICAI paper, published the dataset, and kept the lab server on a Mac Mini. Cloudflare Tunnels published the registration services. Older Angular and Node apps moved into Docker. I also taught a hands-on Docker session: one container, then Compose.":
    "STEM UDLAP fue de febrero de 2024 a junio de 2026. Escribí el paper de MICAI, publiqué el dataset y mantuve el servidor del laboratorio en una Mac Mini. Cloudflare Tunnels publicó los servicios de registro. Las apps viejas de Angular y Node pasaron a Docker. También di una sesión práctica de Docker: un contenedor, luego Compose.",
  "T-Systems was a part-time internship in Puebla, April 2024 to July 2024. I built a course platform in Angular, with MySQL behind it, so people could track training. Some of the progress was game-like. I wrote the docs and used the team's Git process.":
    "T-Systems fue una práctica de medio tiempo en Puebla, de abril a julio de 2024. Armé una plataforma de cursos en Angular, con MySQL detrás, para seguir la capacitación. Parte del avance tenía forma de juego. Escribí la documentación y usé el Git del equipo.",
  "I write Python against a HackRF One and a bladeRF. I chair Hackztecs, after coming in as a member under Juan Pablo Morales Durante.":
    "Escribo Python contra un HackRF One y un bladeRF. Presido Hackztecs, después de entrar como miembro con Juan Pablo Morales Durante.",
  "Goben Diego Constantino Aguirre. Computer systems engineering at UDLAP, 2021 to 2025, graduated, 9.0/10.":
    "Goben Diego Constantino Aguirre. Ingeniería en sistemas computacionales en la UDLAP, 2021 a 2025, titulado, 9.0/10.",
  "Two seats at TBSeK. Part-time Jr. SOC from April 2025 to July 2026, then full-time SOC/MDR.":
    "Dos puestos en TBSeK. SOC junior de medio tiempo de abril de 2025 a julio de 2026, y después SOC/MDR de tiempo completo.",
  "A coding agent can draft a change. He still has to read the diff.":
    "Un agente de código puede redactar un cambio. Él todavía tiene que leer el diff.",
  "Goben finished computer systems engineering at UDLAP, 2021 to 2025. The grade on the record is 9.0/10.":
    "Goben terminó ingeniería en sistemas computacionales en la UDLAP, 2021 a 2025. La nota del expediente es 9.0/10.",
  "The STEM lab server was a Mac Mini. Docker and Cloudflare Tunnels ran on it from February 2024 to June 2026.":
    "El servidor del laboratorio de STEM era una Mac Mini. Docker y Cloudflare Tunnels corrieron ahí de febrero de 2024 a junio de 2026.",
  "Hackztecs still meets weekly: TCP/IP, Wireshark, Nmap, Burp Suite, HTTP. He has chaired it since February 2024. More than 8 CTFs.":
    "Hackztecs sigue reuniéndose cada semana: TCP/IP, Wireshark, Nmap, Burp Suite, HTTP. Lo preside desde febrero de 2024. Más de 8 CTFs.",
  "The MICAI 2024 paper Easy for Us, Complex for AI is in Springer LNCS 15246, pages 198 to 209. Co-authored with Zobeida Guzmán.":
    "El paper de MICAI 2024, Easy for Us, Complex for AI, está en Springer LNCS 15246, páginas 198 a 209. Coautoría con Zobeida Guzmán.",
  "A coding agent can draft a change. I still read the diff.":
    "Un agente de código puede redactar un cambio. Yo sigo leyendo el diff.",
  "Spanish, native. English, C1+. French, A2. German, A1.":
    "Español, nativo. Inglés, C1+. Francés, A2. Alemán, A1.",
  "No form. The address above is the one I read.":
    "No hay formulario. La dirección de arriba es la que leo.",
  "Tools from the jobs, in the order those jobs are listed.":
    "Herramientas de los empleos, en el orden en que están listados.",
  "Projects I will talk about in an interview. Older one-liners sit under Earlier.":
    "Proyectos de los que voy a hablar en una entrevista. Lo anterior está en Antes.",
  "Show Nugget": "Mostrar Nugget",
  "Hide Nugget": "Ocultar Nugget",
  "Close tip": "Cerrar",
  "Arrange icons": "Ordenar iconos",
  "Display Properties": "Propiedades de pantalla",
};

const de: Record<string, string> = {
  "About Me": "Über mich",
  Jobs: "Jobs",
  Projects: "Projekte",
  Skills: "Kenntnisse",
  Radio: "Funk",
  Notes: "Notizen",
  Courses: "Kurse",
  Blog: "Blog",
  "My Links": "Links",
  Contact: "Kontakt",
  Terminal: "Terminal",
  "My Pictures": "Bilder",
  Certificates: "Zertifikate",
  Player: "Player",
  Converter: "Konverter",
  Dice: "Würfel",
  Flip: "Münze",
  Calculator: "Rechner",
  Wheel: "Rad",
  Sweep: "Sweep",
  Snake: "Snake",
  Tetris: "Tetris",
  Legal: "Recht",
  Remote: "Remote",
  Facts: "Fakten",
  Hack: "Hack",
  Help: "Hilfe",
  Display: "Anzeige",
  Colophon: "Kolophon",
  Login: "Anmeldung",
  Run: "Ausführen",
  Find: "Suchen",
  Suggestions: "Vorschläge",
  Start: "Start",
  Next: "Weiter",
  Profile: "Profil",
  "Selected work": "Ausgewählte Arbeit",
  Work: "Arbeit",
  Earlier: "Früher",
  Tools: "Werkzeuge",
  Languages: "Sprachen",
  Agents: "Agenten",
  Show: "Zeigen",
  All: "Alle",
  Detection: "Erkennung",
  Research: "Forschung",
  Hackathon: "Hackathon",
  Apps: "Apps",
  "Goben Diego Constantino Aguirre. I finished computer systems engineering at UDLAP, 2021 to 2025, with a 9.0/10. Internships included.":
    "Goben Diego Constantino Aguirre. Studium der Computeringenieurwissenschaften an der UDLAP, 2021 bis 2025, 9.0/10. Die Pflichtpraktika sind fertig.",
  "I have been at TBSeK since April 2025. The part-time Jr. SOC seat ran until July 2026: alert triage for 7 or more clients, playbooks, false positives, and Python and Node.js that cut report time by about 70%. The full-time SOC/MDR seat is Splunk, Darktrace, CrowdStrike, Cisco AMP, Cisco Umbrella, and GroupIB, plus correlation and the first containment steps.":
    "Seit April 2025 bei TBSeK. Teilzeit als Jr. SOC bis Juli 2026: Alerts für 7 oder mehr Kunden, Playbooks, False Positives, und Python und Node.js, die die Berichtszeit um etwa 70% senkten. Die Vollzeitstelle SOC/MDR ist Splunk, Darktrace, CrowdStrike, Cisco AMP, Cisco Umbrella und GroupIB, plus Korrelation und die ersten Containment-Schritte.",
  "A coding agent can draft a change. I still read the diff.":
    "Ein Coding-Agent kann eine Änderung entwerfen. Ich lese den Diff trotzdem.",
  "Spanish, native. English, C1+. French, A2. German, A1.":
    "Spanisch, Muttersprache. Englisch, C1+. Französisch, A2. Deutsch, A1.",
  "No form. The address above is the one I read.":
    "Kein Formular. Die Adresse oben lese ich.",
  "STEM UDLAP was February 2024 to June 2026. I wrote the MICAI paper, published the dataset, and kept the lab server on a Mac Mini. Cloudflare Tunnels published the registration services. Older Angular and Node apps moved into Docker. I also taught a hands-on Docker session: one container, then Compose.":
    "STEM UDLAP war Februar 2024 bis Juni 2026. Ich schrieb das MICAI-Paper, veröffentlichte das Dataset und hielt den Laborserver auf einem Mac Mini. Cloudflare Tunnels veröffentlichte die Registrierung. Ältere Angular- und Node-Apps kamen nach Docker. Ich gab auch eine Docker-Sitzung: ein Container, dann Compose.",
  "T-Systems was a part-time internship in Puebla, April 2024 to July 2024. I built a course platform in Angular, with MySQL behind it, so people could track training. Some of the progress was game-like. I wrote the docs and used the team's Git process.":
    "T-Systems war ein Teilzeitpraktikum in Puebla, April 2024 bis Juli 2024. Ich baute eine Kursplattform in Angular, mit MySQL dahinter, damit Leute Schulungen verfolgen konnten. Ein Teil des Fortschritts war spielartig. Ich schrieb die Doku und nutzte das Git des Teams.",
  "I write Python against a HackRF One and a bladeRF. I chair Hackztecs, after coming in as a member under Juan Pablo Morales Durante.":
    "Ich schreibe Python gegen ein HackRF One und ein bladeRF. Ich leite Hackztecs, nachdem ich als Mitglied bei Juan Pablo Morales Durante angefangen habe.",
  "Show Nugget": "Nugget zeigen",
  "Hide Nugget": "Nugget verstecken",
  "Close tip": "Tipp schliessen",
  "Arrange icons": "Icons anordnen",
  "Display Properties": "Anzeigeeigenschaften",
};

const fr: Record<string, string> = {
  "About Me": "À propos",
  Jobs: "Postes",
  Projects: "Projets",
  Skills: "Compétences",
  Radio: "Radio",
  Notes: "Notes",
  Courses: "Cours",
  Blog: "Blog",
  "My Links": "Liens",
  Contact: "Contact",
  Terminal: "Terminal",
  "My Pictures": "Photos",
  Certificates: "Certificats",
  Player: "Lecteur",
  Converter: "Convertisseur",
  Dice: "Dés",
  Flip: "Pièce",
  Calculator: "Calcul",
  Wheel: "Roue",
  Sweep: "Sweep",
  Snake: "Snake",
  Tetris: "Tetris",
  Legal: "Mentions",
  Remote: "Distant",
  Facts: "Faits",
  Hack: "Hack",
  Help: "Aide",
  Display: "Affichage",
  Colophon: "Colophon",
  Login: "Connexion",
  Run: "Exécuter",
  Find: "Chercher",
  Suggestions: "Suggestions",
  Start: "Démarrer",
  Next: "Suivant",
  Profile: "Profil",
  "Selected work": "Travaux choisis",
  Work: "Travail",
  Earlier: "Avant",
  Tools: "Outils",
  Languages: "Langues",
  Agents: "Agents",
  Show: "Voir",
  All: "Tout",
  Detection: "Détection",
  Research: "Recherche",
  Hackathon: "Hackathon",
  Apps: "Apps",
  "Goben Diego Constantino Aguirre. I finished computer systems engineering at UDLAP, 2021 to 2025, with a 9.0/10. Internships included.":
    "Goben Diego Constantino Aguirre. Diplôme d'ingénierie en systèmes informatiques à l'UDLAP, 2021 à 2025, 9.0/10. Les stages du diplôme sont faits.",
  "I have been at TBSeK since April 2025. The part-time Jr. SOC seat ran until July 2026: alert triage for 7 or more clients, playbooks, false positives, and Python and Node.js that cut report time by about 70%. The full-time SOC/MDR seat is Splunk, Darktrace, CrowdStrike, Cisco AMP, Cisco Umbrella, and GroupIB, plus correlation and the first containment steps.":
    "Chez TBSeK depuis avril 2025. Le poste junior à temps partiel a duré jusqu'en juillet 2026: triage d'alertes pour 7 clients ou plus, playbooks, faux positifs, et Python et Node.js qui ont baissé le temps des rapports d'environ 70%. Le poste SOC/MDR à temps plein, c'est Splunk, Darktrace, CrowdStrike, Cisco AMP, Cisco Umbrella et GroupIB, plus la corrélation et les premiers pas de confinement.",
  "A coding agent can draft a change. I still read the diff.":
    "Un agent de code peut rédiger un changement. Je lis quand même le diff.",
  "Spanish, native. English, C1+. French, A2. German, A1.":
    "Espagnol, langue maternelle. Anglais, C1+. Français, A2. Allemand, A1.",
  "No form. The address above is the one I read.":
    "Pas de formulaire. L'adresse ci-dessus est celle que je lis.",
  "STEM UDLAP was February 2024 to June 2026. I wrote the MICAI paper, published the dataset, and kept the lab server on a Mac Mini. Cloudflare Tunnels published the registration services. Older Angular and Node apps moved into Docker. I also taught a hands-on Docker session: one container, then Compose.":
    "STEM UDLAP, de février 2024 à juin 2026. J'ai écrit le papier MICAI, publié le jeu de données et gardé le serveur du labo sur un Mac Mini. Cloudflare Tunnels a publié les services d'inscription. Les vieilles apps Angular et Node sont passées dans Docker. J'ai aussi donné une séance Docker: un conteneur, puis Compose.",
  "T-Systems was a part-time internship in Puebla, April 2024 to July 2024. I built a course platform in Angular, with MySQL behind it, so people could track training. Some of the progress was game-like. I wrote the docs and used the team's Git process.":
    "T-Systems était un stage à temps partiel à Puebla, d'avril à juillet 2024. J'ai construit une plateforme de cours en Angular, avec MySQL derrière, pour suivre la formation. Une partie de la progression ressemblait à un jeu. J'ai écrit la doc et suivi le Git de l'équipe.",
  "I write Python against a HackRF One and a bladeRF. I chair Hackztecs, after coming in as a member under Juan Pablo Morales Durante.":
    "J'écris du Python contre un HackRF One et un bladeRF. Je préside Hackztecs, après être entré comme membre avec Juan Pablo Morales Durante.",
  "Show Nugget": "Afficher Nugget",
  "Hide Nugget": "Masquer Nugget",
  "Close tip": "Fermer",
  "Arrange icons": "Ranger les icônes",
  "Display Properties": "Propriétés d'affichage",
};

Object.assign(es, extraEs);
Object.assign(de, extraDe);
Object.assign(fr, extraFr);

const tables: Record<Exclude<Lang, "en">, Record<string, string>> = { es, de, fr };

export function getLang(): Lang {
  return current;
}

export function setLang(lang: string): void {
  current = LANGS.includes(lang as Lang) ? (lang as Lang) : "en";
}

export function t(text: string): string {
  if (current === "en") return text;
  return tables[current][text] ?? text;
}
