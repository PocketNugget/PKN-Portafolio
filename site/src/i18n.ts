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
  Facts: "Datos",
  Hack: "Hack",
  Nugget: "Nugget",
  Help: "Ayuda",
  Display: "Pantalla",
  Colophon: "Colofón",
  Login: "Entrar",
  Run: "Ejecutar",
  Find: "Buscar",
  Notepad: "Bloc de notas",
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
  "I have been at TBSeK since April 2025. Part-time Jr. SOC analyst until July 2026, then full-time SOC/MDR analyst, remote from Mexico City. Splunk and the rest of the shift stack, incident notes, and Python and Node.js so the reports took less of the shift. About 70% less.":
    "Estoy en TBSeK desde abril de 2025. Analista SOC junior de medio tiempo hasta julio de 2026, y después analista SOC/MDR de tiempo completo, remoto desde la Ciudad de México. Splunk y el resto del turno, notas de incidente, y Python y Node.js para que los reportes ocuparan menos del turno. Cerca de 70% menos.",
  "STEM UDLAP was February 2024 to June 2026: the MICAI paper, and the lab server on a Mac Mini with Docker and Cloudflare Tunnels. I write Python against a HackRF One and a bladeRF. I chair Hackztecs, after coming in as a member under Juan Pablo Morales Durante.":
    "STEM UDLAP fue de febrero de 2024 a junio de 2026: el paper de MICAI y el servidor del laboratorio en una Mac Mini con Docker y Cloudflare Tunnels. Escribo Python contra un HackRF One y un bladeRF. Presido Hackztecs, después de entrar como miembro con Juan Pablo Morales Durante.",
  "I am looking at MDR, SOC, and SRE roles in Mexico, the United States, Austria, Ireland, and the Netherlands. A cybersecurity master's, Ireland included, is on that same list.":
    "Busco puestos de MDR, SOC y SRE en México, Estados Unidos, Austria, Irlanda y Países Bajos. Una maestría en ciberseguridad, Irlanda incluida, está en esa misma lista.",
  "Goben Diego Constantino Aguirre. Computer systems engineering at UDLAP, 2021 to 2025, graduated, 9.0/10.":
    "Goben Diego Constantino Aguirre. Ingeniería en sistemas computacionales en la UDLAP, 2021 a 2025, titulado, 9.0/10.",
  "Full-time SOC/MDR analyst at TBSeK since July 2026, remote from Mexico City. The part-time Jr. SOC seat was April 2025 to July 2026.":
    "Analista SOC/MDR de tiempo completo en TBSeK desde julio de 2026, remoto desde la Ciudad de México. El puesto junior de medio tiempo fue de abril de 2025 a julio de 2026.",
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
  Facts: "Fakten",
  Hack: "Hack",
  Help: "Hilfe",
  Display: "Anzeige",
  Colophon: "Kolophon",
  Login: "Anmeldung",
  Run: "Ausführen",
  Find: "Suchen",
  Notepad: "Notizblock",
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
  "I have been at TBSeK since April 2025. Part-time Jr. SOC analyst until July 2026, then full-time SOC/MDR analyst, remote from Mexico City. Splunk and the rest of the shift stack, incident notes, and Python and Node.js so the reports took less of the shift. About 70% less.":
    "Seit April 2025 bei TBSeK. Teilzeit als Jr. SOC Analyst bis Juli 2026, danach Vollzeit SOC/MDR, remote aus Mexiko-Stadt. Splunk und der Rest der Schicht, Vorfallsnotizen, Python und Node.js, damit Berichte weniger Schichtzeit brauchen. Etwa 70% weniger.",
  "I am looking at MDR, SOC, and SRE roles in Mexico, the United States, Austria, Ireland, and the Netherlands. A cybersecurity master's, Ireland included, is on that same list.":
    "Ich suche MDR-, SOC- und SRE-Rollen in Mexiko, den USA, Österreich, Irland und den Niederlanden. Ein Master in Cybersicherheit, Irland inklusive, steht auf derselben Liste.",
  "A coding agent can draft a change. I still read the diff.":
    "Ein Coding-Agent kann eine Änderung entwerfen. Ich lese den Diff trotzdem.",
  "Spanish, native. English, C1+. French, A2. German, A1.":
    "Spanisch, Muttersprache. Englisch, C1+. Französisch, A2. Deutsch, A1.",
  "No form. The address above is the one I read.":
    "Kein Formular. Die Adresse oben lese ich.",
  "STEM UDLAP was February 2024 to June 2026: the MICAI paper, and the lab server on a Mac Mini with Docker and Cloudflare Tunnels. I write Python against a HackRF One and a bladeRF. I chair Hackztecs, after coming in as a member under Juan Pablo Morales Durante.":
    "STEM UDLAP war Februar 2024 bis Juni 2026: das MICAI-Paper und der Laborserver auf einem Mac Mini mit Docker und Cloudflare Tunnels. Ich schreibe Python gegen ein HackRF One und ein bladeRF. Ich leite Hackztecs, nachdem ich als Mitglied bei Juan Pablo Morales Durante angefangen habe.",
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
  Facts: "Faits",
  Hack: "Hack",
  Help: "Aide",
  Display: "Affichage",
  Colophon: "Colophon",
  Login: "Connexion",
  Run: "Exécuter",
  Find: "Chercher",
  Notepad: "Bloc-notes",
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
  "I have been at TBSeK since April 2025. Part-time Jr. SOC analyst until July 2026, then full-time SOC/MDR analyst, remote from Mexico City. Splunk and the rest of the shift stack, incident notes, and Python and Node.js so the reports took less of the shift. About 70% less.":
    "Chez TBSeK depuis avril 2025. Analyste SOC junior à temps partiel jusqu'en juillet 2026, puis analyste SOC/MDR à temps plein, à distance depuis Mexico. Splunk et le reste du shift, notes d'incident, Python et Node.js pour que les rapports prennent moins du shift. Environ 70% de moins.",
  "I am looking at MDR, SOC, and SRE roles in Mexico, the United States, Austria, Ireland, and the Netherlands. A cybersecurity master's, Ireland included, is on that same list.":
    "Je cherche des postes MDR, SOC et SRE au Mexique, aux États-Unis, en Autriche, en Irlande et aux Pays-Bas. Un master en cybersécurité, Irlande comprise, est sur la même liste.",
  "A coding agent can draft a change. I still read the diff.":
    "Un agent de code peut rédiger un changement. Je lis quand même le diff.",
  "Spanish, native. English, C1+. French, A2. German, A1.":
    "Espagnol, langue maternelle. Anglais, C1+. Français, A2. Allemand, A1.",
  "No form. The address above is the one I read.":
    "Pas de formulaire. L'adresse ci-dessus est celle que je lis.",
  "STEM UDLAP was February 2024 to June 2026: the MICAI paper, and the lab server on a Mac Mini with Docker and Cloudflare Tunnels. I write Python against a HackRF One and a bladeRF. I chair Hackztecs, after coming in as a member under Juan Pablo Morales Durante.":
    "STEM UDLAP, de février 2024 à juin 2026: le papier MICAI et le serveur du labo sur un Mac Mini avec Docker et Cloudflare Tunnels. J'écris du Python contre un HackRF One et un bladeRF. Je préside Hackztecs, après être entré comme membre avec Juan Pablo Morales Durante.",
  "Show Nugget": "Afficher Nugget",
  "Hide Nugget": "Masquer Nugget",
  "Close tip": "Fermer",
  "Arrange icons": "Ranger les icônes",
  "Display Properties": "Propriétés d'affichage",
};

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
