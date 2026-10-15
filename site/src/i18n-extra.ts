import jingle from "../content/notes/jingle-trouble.md?raw";
import models from "../content/notes/model-files.md?raw";

/** English key, then Spanish, German, and French. The nugget lines address the visitor. */

const rows: readonly (readonly [string, string, string, string])[] = [
  [
    "Goben Diego Constantino Aguirre. I finished computer systems engineering at UDLAP, 2021 to 2025, with a 9.0/10.",
    "Goben Diego Constantino Aguirre. Terminé ingeniería en sistemas computacionales en la UDLAP, de 2021 a 2025, con 9.0/10.",
    "Goben Diego Constantino Aguirre. Ich habe das Studium der Computeringenieurwissenschaften an der UDLAP abgeschlossen, 2021 bis 2025, mit 9.0/10.",
    "Goben Diego Constantino Aguirre. J'ai terminé l'ingénierie en systèmes informatiques à l'UDLAP, de 2021 à 2025, avec 9.0/10.",
  ],
  [
    "SOC/MDR analyst at TBSeK, full-time, July 2026 to present. The junior seat was part-time from April 2025. I am looking at MDR, SOC, and SRE roles in Mexico, the United States, Austria, Ireland, and the Netherlands.",
    "Analista SOC/MDR en TBSeK, tiempo completo, de julio de 2026 a la fecha. El puesto junior fue de medio tiempo desde abril de 2025. Busco puestos de MDR, SOC y SRE en México, Estados Unidos, Austria, Irlanda y Países Bajos.",
    "SOC/MDR-Analyst bei TBSeK, Vollzeit, Juli 2026 bis heute. Die Junior-Stelle war Teilzeit ab April 2025. Ich suche MDR-, SOC- und SRE-Rollen in Mexiko, den USA, Österreich, Irland und den Niederlanden.",
    "Analyste SOC/MDR chez TBSeK, temps plein, de juillet 2026 à aujourd'hui. Le poste junior était à temps partiel depuis avril 2025. Je cherche des postes MDR, SOC et SRE au Mexique, aux États-Unis, en Autriche, en Irlande et aux Pays-Bas.",
  ],
  [
    "Hack The Box University CTF 2025 finished 52 of 1,014. HTB Cyber Apocalypse CTF 2025 scored 34,125 points.",
    "Hack The Box University CTF 2025 quedó 52 de 1,014. HTB Cyber Apocalypse CTF 2025 sumó 34,125 puntos.",
    "Hack The Box University CTF 2025 endete als 52 von 1,014. HTB Cyber Apocalypse CTF 2025 kam auf 34,125 Punkte.",
    "Hack The Box University CTF 2025 a fini 52e sur 1,014. HTB Cyber Apocalypse CTF 2025 a marqué 34,125 points.",
  ],
  [
    "Read next",
    "Sigue por aquí",
    "Lies als Nächstes",
    "Lis ensuite",
  ],
  [
    "Open these in order. Jobs first, then the work, then the tools. Courses and Contact close it.",
    "Ábralos en este orden. Primero los empleos, luego el trabajo, luego las herramientas. Cursos y Contacto cierran el recorrido.",
    "Öffnen Sie sie in dieser Reihenfolge. Zuerst die Jobs, dann die Arbeit, dann die Werkzeuge. Kurse und Kontakt schliessen ab.",
    "Ouvrez-les dans cet ordre. D'abord les postes, puis le travail, puis les outils. Les cours et le contact ferment le parcours.",
  ],
  ["Also", "También", "Ausserdem", "Aussi"],
  ["About", "Sobre mí", "Über mich", "À propos"],
  ["SOC/MDR analyst", "Analista SOC/MDR", "SOC/MDR-Analyst", "Analyste SOC/MDR"],
  ["Jr. SOC analyst", "Analista SOC junior", "Jr. SOC-Analyst", "Analyste SOC junior"],
  ["Researcher and developer", "Investigador y desarrollador", "Forscher und Entwickler", "Chercheur et développeur"],
  ["Software engineer intern", "Practicante de ingeniería de software", "Praktikant Softwareentwicklung", "Stagiaire ingénieur logiciel"],
  ["Puebla, Mexico, hybrid", "Puebla, México, híbrido", "Puebla, Mexiko, hybrid", "Puebla, Mexique, hybride"],
  ["Puebla, Mexico", "Puebla, México", "Puebla, Mexiko", "Puebla, Mexique"],
  ["July 2026 to present", "julio de 2026 a la fecha", "Juli 2026 bis heute", "juillet 2026 à aujourd'hui"],
  ["April 2025 to July 2026", "abril de 2025 a julio de 2026", "April 2025 bis Juli 2026", "avril 2025 à juillet 2026"],
  ["February 2024 to June 2026", "febrero de 2024 a junio de 2026", "Februar 2024 bis Juni 2026", "février 2024 à juin 2026"],
  ["April 2024 to July 2024", "abril de 2024 a julio de 2024", "April 2024 bis Juli 2024", "avril 2024 à juillet 2024"],
  ["November 2025", "noviembre de 2025", "im November 2025", "novembre 2025"],
  ["November 2024", "noviembre de 2024", "im November 2024", "novembre 2024"],
  ["October 2024", "octubre de 2024", "im Oktober 2024", "octobre 2024"],
  ["February 2024 to March 2024", "febrero de 2024 a marzo de 2024", "Februar 2024 bis März 2024", "février 2024 à mars 2024"],
  ["January 2025 to May 2025", "enero de 2025 a mayo de 2025", "Januar 2025 bis Mai 2025", "janvier 2025 à mai 2025"],
  ["February 2024 to present", "febrero de 2024 a la fecha", "Februar 2024 bis heute", "février 2024 à aujourd'hui"],
  ["2024 to 2026", "2024 a 2026", "2024 bis 2026", "2024 à 2026"],
  ["Ongoing", "En curso", "Laufend", "En cours"],
  [
    "Full-time. Alert triage on SIEM, EDR, and network tools, plus the scripts that feed the shift.",
    "Tiempo completo. Triage de alertas en SIEM, EDR y herramientas de red, más los scripts que alimentan el turno.",
    "Vollzeit. Alert-Triage auf SIEM, EDR und Netzwerkwerkzeugen, plus die Skripte für die Schicht.",
    "Temps plein. Triage d'alertes sur le SIEM, l'EDR et les outils réseau, plus les scripts qui nourrissent le shift.",
  ],
  [
    "Full-time since July 2026. I watch alerts from Splunk, Darktrace, CrowdStrike, Cisco AMP, Cisco Umbrella, and GroupIB, correlate them, and open Wireshark when the packet is the question. The ones that need an owner get escalated.",
    "Tiempo completo desde julio de 2026. Veo alertas de Splunk, Darktrace, CrowdStrike, Cisco AMP, Cisco Umbrella y GroupIB, las correlaciono y abro Wireshark cuando la pregunta es el paquete. Las que necesitan dueño se escalan.",
    "Vollzeit seit Juli 2026. Ich sehe Alerts aus Splunk, Darktrace, CrowdStrike, Cisco AMP, Cisco Umbrella und GroupIB, korreliere sie und öffne Wireshark, wenn das Paket die Frage ist. Was einen Owner braucht, wird eskaliert.",
    "Temps plein depuis juillet 2026. Je suis les alertes de Splunk, Darktrace, CrowdStrike, Cisco AMP, Cisco Umbrella et GroupIB, je les corrèle, et j'ouvre Wireshark quand la question est le paquet. Celles qui ont besoin d'un owner sont escaladées.",
  ],
  [
    "On a live case I help with detection, evidence, and the first containment steps. The parts of the shift that were the same every time went into in-house scripts.",
    "En un caso vivo ayudo con la detección, la evidencia y los primeros pasos de contención. Lo que se repetía en cada turno pasó a scripts internos.",
    "In einem laufenden Fall helfe ich bei Erkennung, Beweisen und den ersten Containment-Schritten. Was in jeder Schicht gleich war, steckt in internen Skripten.",
    "Sur un cas en cours j'aide à la détection, aux preuves et aux premiers pas de confinement. Ce qui se répétait à chaque shift est passé dans des scripts internes.",
  ],
  [
    "Part-time. Reporting automation in Python and Node.js, about 70% less time on those reports.",
    "Medio tiempo. Automatización de reportes en Python y Node.js, cerca de 70% menos tiempo en esos reportes.",
    "Teilzeit. Berichte automatisiert mit Python und Node.js, etwa 70% weniger Zeit für diese Berichte.",
    "Temps partiel. Automatisation des rapports en Python et Node.js, environ 70% de temps en moins sur ces rapports.",
  ],
  [
    "Part-time from April 2025 until the full-time role. I triaged alerts across 7 or more client environments and wrote the follow-up until someone owned the case. False positives got filtered. The ones that stayed followed the incident-response playbook.",
    "Medio tiempo desde abril de 2025 hasta el puesto de tiempo completo. Hice triage de alertas en 7 o más entornos de clientes y escribí el seguimiento hasta que alguien tomaba el caso. Los falsos positivos se filtraban. Los que se quedaban seguían el playbook de respuesta a incidentes.",
    "Teilzeit von April 2025 bis zur Vollzeitstelle. Ich triagierte Alerts in 7 oder mehr Kundenumgebungen und schrieb das Follow-up, bis jemand den Fall hatte. False Positives wurden gefiltert. Was blieb, folgte dem Incident-Response-Playbook.",
    "Temps partiel d'avril 2025 jusqu'au poste à temps plein. J'ai trié des alertes sur 7 environnements clients ou plus et écrit le suivi jusqu'à ce que quelqu'un prenne le cas. Les faux positifs étaient filtrés. Ce qui restait suivait le playbook de réponse à incident.",
  ],
  [
    "The repetitive report work went into Python, Node.js, Streamlit, and Selenium. That cut report time by about 70%. OSINT for this seat included dark-web checks for leaked credentials and impersonation.",
    "El trabajo repetido de reportes pasó a Python, Node.js, Streamlit y Selenium. Eso bajó el tiempo de reportes cerca de 70%. El OSINT de este puesto incluyó revisiones en la dark web por credenciales filtradas y suplantación.",
    "Die wiederkehrende Berichtsarbeit ging in Python, Node.js, Streamlit und Selenium. Das senkte die Berichtszeit um etwa 70%. OSINT für diese Stelle umfasste Dark-Web-Prüfungen auf geleakte Zugangsdaten und Identitätsmissbrauch.",
    "Le travail répétitif des rapports est passé dans Python, Node.js, Streamlit et Selenium. Cela a baissé le temps des rapports d'environ 70%. L'OSINT de ce poste incluait des vérifications sur le dark web pour des identifiants fuis et de l'usurpation.",
  ],
  [
    "Apprenticeship. The MICAI paper, the public dataset, and the lab server on a Mac Mini.",
    "Aprendizaje. El paper de MICAI, el dataset público y el servidor del laboratorio en una Mac Mini.",
    "Ausbildung. Das MICAI-Paper, das öffentliche Dataset und der Laborserver auf einem Mac Mini.",
    "Apprentissage. Le papier MICAI, le jeu de données public et le serveur du labo sur un Mac Mini.",
  ],
  [
    "Apprenticeship from February 2024 to June 2026. The paper and the dataset are on open coherence-paper. I stood the lab server up on a Mac Mini, published the registration services with Cloudflare Tunnels, and moved the older Angular and Node apps into Docker so the host was not the deploy step. Access rules and a basic hardening pass sat on the same box.",
    "Aprendizaje de febrero de 2024 a junio de 2026. El paper y el dataset están en coherence-paper. Levanté el servidor del laboratorio en una Mac Mini, publiqué los servicios de registro con Cloudflare Tunnels y pasé las apps viejas de Angular y Node a Docker para que el host no fuera el paso de deploy. Las reglas de acceso y un endurecimiento básico quedaron en la misma máquina.",
    "Ausbildung von Februar 2024 bis Juni 2026. Paper und Dataset stehen unter coherence-paper. Ich stellte den Laborserver auf einem Mac Mini auf, veröffentlichte die Registrierung mit Cloudflare Tunnels und zog die älteren Angular- und Node-Apps nach Docker, damit der Host nicht der Deploy-Schritt war. Zugriffsregeln und ein einfaches Hardening lagen auf derselben Maschine.",
    "Apprentissage de février 2024 à juin 2026. Le papier et le jeu de données sont sur coherence-paper. J'ai monté le serveur du labo sur un Mac Mini, publié les services d'inscription avec Cloudflare Tunnels, et passé les vieilles apps Angular et Node dans Docker pour que l'hôte ne soit pas l'étape de déploiement. Les règles d'accès et un durcissement simple étaient sur la même machine.",
  ],
  [
    "I also taught a hands-on Docker session at UDLAP: one container, then Compose. The notes are on the Hackztecs page. Type open hackztecs.",
    "También di una sesión práctica de Docker en la UDLAP: un contenedor, luego Compose. Las notas están en la página de Hackztecs. Escribe open hackztecs.",
    "Ich gab auch eine praktische Docker-Sitzung an der UDLAP: ein Container, dann Compose. Die Notizen stehen auf der Hackztecs-Seite. Tippe open hackztecs.",
    "J'ai aussi donné une séance Docker pratique à l'UDLAP: un conteneur, puis Compose. Les notes sont sur la page Hackztecs. Tape open hackztecs.",
  ],
  [
    "Part-time. A course platform with an Angular front and MySQL behind it.",
    "Medio tiempo. Una plataforma de cursos con frente en Angular y MySQL detrás.",
    "Teilzeit. Eine Kursplattform mit Angular vorn und MySQL dahinter.",
    "Temps partiel. Une plateforme de cours avec un front Angular et MySQL derrière.",
  ],
  [
    "Part-time, hybrid in Puebla. I built a course platform so people could track training. Angular on the front, MySQL behind it. Some of the progress was game-like. I wrote the docs and used the team's Git process.",
    "Medio tiempo, híbrido en Puebla. Armé una plataforma de cursos para seguir la capacitación. Angular al frente, MySQL detrás. Parte del avance tenía forma de juego. Escribí la documentación y usé el Git del equipo.",
    "Teilzeit, hybrid in Puebla. Ich baute eine Kursplattform, damit Leute Schulungen verfolgen konnten. Angular vorn, MySQL dahinter. Ein Teil des Fortschritts war spielartig. Ich schrieb die Doku und nutzte das Git des Teams.",
    "Temps partiel, hybride à Puebla. J'ai construit une plateforme de cours pour suivre la formation. Angular devant, MySQL derrière. Une partie de la progression ressemblait à un jeu. J'ai écrit la doc et suivi le Git de l'équipe.",
  ],
  ["Shift reports at TBSeK", "Reportes de turno en TBSeK", "Schichtberichte bei TBSeK", "Rapports de shift chez TBSeK"],
  [
    "Python and Node.js for the part of MDR triage that was the same every time: collect, format, file.",
    "Python y Node.js para la parte del triage de MDR que era igual cada vez: juntar, dar formato, archivar.",
    "Python und Node.js für den Teil der MDR-Triage, der jedes Mal gleich war: sammeln, formatieren, ablegen.",
    "Python et Node.js pour la partie du triage MDR qui était la même à chaque fois: collecter, mettre en forme, classer.",
  ],
  [
    "The alerts were not the slow part. The writeup after the alert was. I scripted the collection and the report shape in Python, with Node.js where the existing tools already spoke it, plus Streamlit for the bits an analyst had to see and Selenium where a console had no export.",
    "Las alertas no eran la parte lenta. Lo lento era el writeup después de la alerta. Automaticé la recolección y la forma del reporte en Python, con Node.js donde las herramientas ya lo hablaban, más Streamlit para lo que un analista tenía que ver y Selenium donde una consola no exportaba.",
    "Die Alerts waren nicht der langsame Teil. Langsam war der Writeup nach dem Alert. Ich habe Sammlung und Berichtsform in Python geskriptet, mit Node.js wo die vorhandenen Tools das schon sprachen, plus Streamlit für das, was ein Analyst sehen musste, und Selenium wo eine Konsole keinen Export hatte.",
    "Les alertes n'étaient pas la partie lente. Le writeup après l'alerte l'était. J'ai scripté la collecte et la forme du rapport en Python, avec Node.js là où les outils le parlaient déjà, plus Streamlit pour ce qu'un analyste devait voir et Selenium là où une console n'exportait pas.",
  ],
  [
    "Report time dropped by about 70%. No client names on this page, and no alert contents.",
    "El tiempo de reportes bajó cerca de 70%. En esta página no hay nombres de clientes ni contenido de alertas.",
    "Die Berichtszeit sank um etwa 70%. Keine Kundennamen auf dieser Seite, und keine Alert-Inhalte.",
    "Le temps des rapports a baissé d'environ 70%. Pas de noms de clients sur cette page, et pas de contenu d'alertes.",
  ],
  [
    "Hackztecs finished 52 of 1,014. Top 5%. Only Mexican university in the top 100.",
    "Hackztecs quedó 52 de 1,014. Top 5%. La única universidad mexicana en el top 100.",
    "Hackztecs wurde 52 von 1,014. Top 5%. Die einzige mexikanische Universität in den Top 100.",
    "Hackztecs a fini 52e sur 1,014. Top 5%. La seule université mexicaine dans le top 100.",
  ],
  [
    "Hack The Box University CTF 2025 was called Jingle Trouble. We finished 52 of 1,014 teams. That is the top 5%, and UDLAP was the only Mexican university in the top 100. It was my first top-100 finish at a University CTF.",
    "Hack The Box University CTF 2025 se llamó Jingle Trouble. Quedamos 52 de 1,014 equipos. Eso es el top 5%, y la UDLAP fue la única universidad mexicana en el top 100. Fue mi primer top 100 en un University CTF.",
    "Hack The Box University CTF 2025 hiess Jingle Trouble. Wir wurden 52 von 1,014 Teams. Das ist die Top 5%, und die UDLAP war die einzige mexikanische Universität in den Top 100. Es war mein erstes Top-100 bei einem University CTF.",
    "Hack The Box University CTF 2025 s'appelait Jingle Trouble. Nous avons fini 52e sur 1,014 équipes. C'est le top 5%, et l'UDLAP était la seule université mexicaine dans le top 100. C'était mon premier top 100 à un University CTF.",
  ],
  [
    "I was president of Hackztecs for it. The work we sat down to was web, network, and forensics, with Burp Suite and Ghidra open. The solves stay off this site.",
    "Yo presidía Hackztecs. El trabajo de esa mesa fue web, red y forense, con Burp Suite y Ghidra abiertos. Las soluciones no están en este sitio.",
    "Ich war dafür Präsident von Hackztecs. Am Tisch lagen Web, Netzwerk und Forensik, mit Burp Suite und Ghidra offen. Die Solves bleiben ausserhalb dieser Seite.",
    "J'en étais le président de Hackztecs. Le travail sur la table était web, réseau et forensique, avec Burp Suite et Ghidra ouverts. Les solves restent hors de ce site.",
  ],
  [
    "With Georgina Zerón, Natalia María Caballero Garza, Daniel Martínez Maimone, Juan Francisco Cruz Baquedano, and Juan Pablo Morales Durante.",
    "Con Georgina Zerón, Natalia María Caballero Garza, Daniel Martínez Maimone, Juan Francisco Cruz Baquedano y Juan Pablo Morales Durante.",
    "Mit Georgina Zerón, Natalia María Caballero Garza, Daniel Martínez Maimone, Juan Francisco Cruz Baquedano und Juan Pablo Morales Durante.",
    "Avec Georgina Zerón, Natalia María Caballero Garza, Daniel Martínez Maimone, Juan Francisco Cruz Baquedano et Juan Pablo Morales Durante.",
  ],
  [
    "51 of 77 challenges, 34,125 points, rank 293. Top 3.5% worldwide and 3rd in Mexico.",
    "51 de 77 retos, 34,125 puntos, lugar 293. Top 3.5% mundial y tercero en México.",
    "51 von 77 Challenges, 34,125 Punkte, Platz 293. Top 3.5% weltweit und 3. in Mexiko.",
    "51 défis sur 77, 34,125 points, rang 293. Top 3.5% mondial et 3e au Mexique.",
  ],
  [
    "This is a different event from Jingle Trouble. Hackztecs solved 51 of 77 challenges, scored 34,125 points, and finished rank 293. That was the top 3.5% worldwide and 3rd in Mexico.",
    "Este evento no es Jingle Trouble. Hackztecs resolvió 51 de 77 retos, sumó 34,125 puntos y quedó en el lugar 293. Fue el top 3.5% mundial y el tercero en México.",
    "Das ist ein anderes Event als Jingle Trouble. Hackztecs löste 51 von 77 Challenges, holte 34,125 Punkte und wurde Platz 293. Das war die Top 3.5% weltweit und Platz 3 in Mexiko.",
    "C'est un autre événement que Jingle Trouble. Hackztecs a résolu 51 défis sur 77, marqué 34,125 points et fini au rang 293. C'était le top 3.5% mondial et la 3e place au Mexique.",
  ],
  [
    "I started in the group as a member, under Juan Pablo Morales Durante, and later chaired it. The Apocalypse board was part of that stretch, along with more than 8 CTFs.",
    "Entré al grupo como miembro, con Juan Pablo Morales Durante, y después lo presidí. El tablero de Apocalypse fue parte de ese tramo, junto con más de 8 CTFs.",
    "Ich fing in der Gruppe als Mitglied an, unter Juan Pablo Morales Durante, und leitete sie später. Das Apocalypse-Board gehörte zu der Strecke, zusammen mit mehr als 8 CTFs.",
    "J'ai commencé dans le groupe comme membre, sous Juan Pablo Morales Durante, et je l'ai présidé ensuite. Le tableau Apocalypse faisait partie de cette période, avec plus de 8 CTFs.",
  ],
  [
    "With Juan Pablo Morales Durante, Georgina Zerón, and Daniel Martínez Maimone.",
    "Con Juan Pablo Morales Durante, Georgina Zerón y Daniel Martínez Maimone.",
    "Mit Juan Pablo Morales Durante, Georgina Zerón und Daniel Martínez Maimone.",
    "Avec Juan Pablo Morales Durante, Georgina Zerón et Daniel Martínez Maimone.",
  ],
  ["Bench radio", "Radio de banco", "Laborfunk", "Radio de banc"],
  [
    "HackRF One and a Nuand bladeRF 2.0. Sweeps and link tests on radios I have on the bench, mostly 2.4 to 5.8 GHz.",
    "HackRF One y un Nuand bladeRF 2.0. Barridos y pruebas de enlace en radios que tengo en el banco, sobre todo de 2.4 a 5.8 GHz.",
    "HackRF One und ein Nuand bladeRF 2.0. Sweeps und Linktests an Radios auf meinem Tisch, meist 2.4 bis 5.8 GHz.",
    "HackRF One et un Nuand bladeRF 2.0. Balayages et tests de lien sur des radios que j'ai sur le banc, surtout de 2.4 à 5.8 GHz.",
  ],
  [
    "I use a HackRF One and a Nuand bladeRF 2.0 for sweeps, signal generation, and link tests. Most of that sits between 2.4 and 5.8 GHz. The Python tools are aimed at Autel drone links on 2.4 and 5 GHz, on links I am testing myself.",
    "Uso un HackRF One y un Nuand bladeRF 2.0 para barridos, generación de señal y pruebas de enlace. Casi todo está entre 2.4 y 5.8 GHz. Las herramientas en Python apuntan a enlaces de drones Autel en 2.4 y 5 GHz, en enlaces que yo mismo pruebo.",
    "Ich nutze ein HackRF One und ein Nuand bladeRF 2.0 für Sweeps, Signalerzeugung und Linktests. Das meiste liegt zwischen 2.4 und 5.8 GHz. Die Python-Tools zielen auf Autel-Drohnenlinks bei 2.4 und 5 GHz, an Links, die ich selbst teste.",
    "J'utilise un HackRF One et un Nuand bladeRF 2.0 pour des balayages, de la génération de signal et des tests de lien. La plupart se situe entre 2.4 et 5.8 GHz. Les outils Python visent des liens de drones Autel en 2.4 et 5 GHz, sur des liens que je teste moi-même.",
  ],
  [
    "I also like spectrum gear that fits in a bag. None of this is a guide to someone else's aircraft.",
    "También me gusta el equipo de espectro que cabe en una bolsa. Nada de esto es una guía para el avión de otra persona.",
    "Ich mag auch Spektrumgerät, das in eine Tasche passt. Nichts davon ist eine Anleitung für das Fluggerät von jemand anderem.",
    "J'aime aussi le matériel de spectre qui tient dans un sac. Rien de tout cela n'est un guide pour l'appareil de quelqu'un d'autre.",
  ],
  [
    "Python solvers that show the steps, from classical ciphers through modern constructions. MIT license.",
    "Solvers en Python que muestran los pasos, de cifrados clásicos a construcciones modernas. Licencia MIT.",
    "Python-Solver, die die Schritte zeigen, von klassischen Chiffren bis zu modernen Konstruktionen. MIT-Lizenz.",
    "Des solvers Python qui montrent les étapes, des chiffres classiques aux constructions modernes. Licence MIT.",
  ],
  [
    "A Python toolkit I use to learn ciphers by implementing them, with the steps written down. Classical first, then the modern ones. It is a study repo, not a service.",
    "Un toolkit en Python que uso para aprender cifrados implementándolos, con los pasos escritos. Primero los clásicos, luego los modernos. Es un repo de estudio, no un servicio.",
    "Ein Python-Toolkit, mit dem ich Chiffren lerne, indem ich sie baue, mit den Schritten aufgeschrieben. Zuerst die klassischen, dann die modernen. Es ist ein Lern-Repo, kein Dienst.",
    "Une boîte à outils Python que j'utilise pour apprendre les chiffres en les implémentant, avec les étapes écrites. D'abord les classiques, puis les modernes. C'est un dépôt d'étude, pas un service.",
  ],
  ["Hacking writeups", "Writeups de hacking", "Hacking-Writeups", "Comptes rendus de hacking"],
  [
    "Finished challenges, written up after the fact. The public repo is the archive.",
    "Retos ya terminados, escritos después. El repo público es el archivo.",
    "Fertige Challenges, danach aufgeschrieben. Das öffentliche Repo ist das Archiv.",
    "Des défis déjà finis, écrits après coup. Le dépôt public est l'archive.",
  ],
  [
    "Writeups for challenges I have already finished: web, Android, and some binary work. I link the repo instead of pasting solve chains here.",
    "Writeups de retos que ya terminé: web, Android y algo de binario. Enlazo el repo en lugar de pegar las cadenas de solución aquí.",
    "Writeups für Challenges, die ich schon fertig habe: Web, Android und etwas Binary. Ich verlinke das Repo, statt die Solve-Ketten hier einzufügen.",
    "Des writeups de défis que j'ai déjà finis: web, Android et un peu de binaire. Je lie le dépôt au lieu de coller les chaînes de solve ici.",
  ],
  [
    "A simulated IoT EDR. Python. Not a product, and not deployed on anyone's network.",
    "Un EDR de IoT simulado. Python. No es un producto y no está desplegado en la red de nadie.",
    "Ein simuliertes IoT-EDR. Python. Kein Produkt, und in niemandes Netz ausgerollt.",
    "Un EDR IoT simulé. Python. Pas un produit, et pas déployé sur le réseau de qui que ce soit.",
  ],
  [
    "A simulation of what an endpoint agent would notice on a small device network. Useful for thinking about detections. It does not watch a real fleet.",
    "Una simulación de lo que un agente de endpoint notaría en una red pequeña de dispositivos. Sirve para pensar detecciones. No vigila una flota real.",
    "Eine Simulation dessen, was ein Endpoint-Agent in einem kleinen Gerätenetz merken würde. Nützlich, um über Erkennungen nachzudenken. Es beobachtet keine echte Flotte.",
    "Une simulation de ce qu'un agent d'endpoint remarquerait sur un petit réseau d'appareils. Utile pour penser les détections. Il ne surveille pas une vraie flotte.",
  ],
  [
    "A captive portal you pay to join. TypeScript.",
    "Un portal cautivo al que se entra pagando. TypeScript.",
    "Ein Captive Portal, für das man zum Beitritt zahlt. TypeScript.",
    "Un portail captif que l'on paie pour rejoindre. TypeScript.",
  ],
  [
    "Pay-to-join captive portal. The interesting part is the boundary between the open network and the session that has paid, not a marketing site in front of it.",
    "Portal cautivo de pago para entrar. Lo interesante es el límite entre la red abierta y la sesión que ya pagó, no un sitio de marketing delante.",
    "Captive Portal mit Bezahlung für den Zugang. Interessant ist die Grenze zwischen dem offenen Netz und der Sitzung, die bezahlt hat, nicht eine Marketingseite davor.",
    "Portail captif payant pour entrer. La partie intéressante est la frontière entre le réseau ouvert et la session qui a payé, pas un site marketing devant.",
  ],
  ["Homelab and this site", "Homelab y este sitio", "Homelab und diese Seite", "Homelab et ce site"],
  [
    "Raspberry Pi, Docker, Cloudflare Tunnels at home. This site is a Worker on purpose.",
    "Raspberry Pi, Docker y Cloudflare Tunnels en casa. Este sitio es un Worker a propósito.",
    "Raspberry Pi, Docker, Cloudflare Tunnels zu Hause. Diese Seite ist absichtlich ein Worker.",
    "Raspberry Pi, Docker, Cloudflare Tunnels à la maison. Ce site est un Worker exprès.",
  ],
  [
    "At home the machines are a Raspberry Pi and Docker, with Cloudflare Tunnels when something has to be reachable. The previous version of this portfolio was that stack: React, a Deno API, and a SQLite file.",
    "En casa las máquinas son una Raspberry Pi y Docker, con Cloudflare Tunnels cuando algo tiene que ser alcanzable. La versión anterior de este portafolio era ese stack: React, una API en Deno y un archivo SQLite.",
    "Zu Hause sind die Maschinen ein Raspberry Pi und Docker, mit Cloudflare Tunnels wenn etwas erreichbar sein muss. Die vorige Version dieses Portfolios war dieser Stack: React, eine Deno-API und eine SQLite-Datei.",
    "À la maison les machines sont un Raspberry Pi et Docker, avec Cloudflare Tunnels quand quelque chose doit être joignable. La version précédente de ce portfolio était cette pile: React, une API Deno et un fichier SQLite.",
  ],
  [
    "This version is a Worker. The pages are files. Login and the blog use D1. The colophon lists what is stored. A cluster in front of these pages would only be there so I could name it.",
    "Esta versión es un Worker. Las páginas son archivos. El login y el blog usan D1. El colofón lista lo que se guarda. Un clúster delante de estas páginas solo estaría para poder nombrarlo.",
    "Diese Version ist ein Worker. Die Seiten sind Dateien. Login und Blog nutzen D1. Das Kolophon listet, was gespeichert wird. Ein Cluster vor diesen Seiten wäre nur da, damit ich ihn benennen könnte.",
    "Cette version est un Worker. Les pages sont des fichiers. La connexion et le blog utilisent D1. Le colophon liste ce qui est stocké. Un cluster devant ces pages ne serait là que pour que je puisse le nommer.",
  ],
  [
    "First of 22 teams at the AI and Mobility Hackathon. Mobility incidents in, three budgeted options out.",
    "Primer lugar de 22 equipos en el AI and Mobility Hackathon. Incidentes de movilidad entran, salen tres opciones con presupuesto.",
    "Erster von 22 Teams beim AI and Mobility Hackathon. Mobilitätsvorfälle hinein, drei Optionen mit Budget hinaus.",
    "Premier de 22 équipes à l'AI and Mobility Hackathon. Des incidents de mobilité entrent, trois options budgétées sortent.",
  ],
  [
    "Team Los Zepedas won the ÖBB challenge at the AI and Mobility Hackathon in Mexico City, run by ABA and Advantage Austria. First of 22 teams. The prize was a trip to Austria.",
    "El equipo Los Zepedas ganó el reto de ÖBB en el AI and Mobility Hackathon en la Ciudad de México, organizado por ABA y Advantage Austria. Primero de 22 equipos. El premio fue un viaje a Austria.",
    "Team Los Zepedas gewann die ÖBB-Challenge beim AI and Mobility Hackathon in Mexiko-Stadt, veranstaltet von ABA und Advantage Austria. Erster von 22 Teams. Der Preis war eine Reise nach Österreich.",
    "L'équipe Los Zepedas a gagné le défi ÖBB à l'AI and Mobility Hackathon à Mexico, organisé par ABA et Advantage Austria. Première de 22 équipes. Le prix était un voyage en Autriche.",
  ],
  [
    "MAIA takes mobility incidents from social posts and from reports staff already file, classifies them, and looks for causes that keep showing up. For each problem it drafts three options at different budgets, with a rough impact and a feasibility note. It was a hackathon prototype, built fast, not a transit system.",
    "MAIA toma incidentes de movilidad de publicaciones sociales y de reportes que el personal ya llena, los clasifica y busca causas que se repiten. Para cada problema redacta tres opciones con presupuestos distintos, un impacto aproximado y una nota de factibilidad. Fue un prototipo de hackathon, hecho rápido, no un sistema de transporte.",
    "MAIA nimmt Mobilitätsvorfälle aus Social Posts und aus Berichten, die das Personal schon schreibt, klassifiziert sie und sucht Ursachen, die immer wieder auftauchen. Für jedes Problem entwirft es drei Optionen mit verschiedenen Budgets, einem groben Impact und einer Machbarkeitsnotiz. Es war ein Hackathon-Prototyp, schnell gebaut, kein Verkehrssystem.",
    "MAIA prend des incidents de mobilité dans des posts sociaux et dans des rapports que le personnel dépose déjà, les classe et cherche des causes qui reviennent. Pour chaque problème il rédige trois options à des budgets différents, avec un impact approximatif et une note de faisabilité. C'était un prototype de hackathon, construit vite, pas un système de transport.",
  ],
  [
    "With Jorge Venegas, Nina Maeva Mazadiego Cortes, Humberto Zepeda González, and Hector Zepeda González. Mentors: Florian Bauer, J. Adolfo Carril Paniagua, and Alejandro Najera.",
    "Con Jorge Venegas, Nina Maeva Mazadiego Cortes, Humberto Zepeda González y Hector Zepeda González. Mentores: Florian Bauer, J. Adolfo Carril Paniagua y Alejandro Najera.",
    "Mit Jorge Venegas, Nina Maeva Mazadiego Cortes, Humberto Zepeda González und Hector Zepeda González. Mentoren: Florian Bauer, J. Adolfo Carril Paniagua und Alejandro Najera.",
    "Avec Jorge Venegas, Nina Maeva Mazadiego Cortes, Humberto Zepeda González et Hector Zepeda González. Mentors: Florian Bauer, J. Adolfo Carril Paniagua et Alejandro Najera.",
  ],
  [
    "Springer LNCS paper from MICAI 2024. People spot broken generated images that the metrics still score as fine.",
    "Paper de Springer LNCS, MICAI 2024. Las personas ven imágenes generadas rotas que las métricas todavía califican como buenas.",
    "Springer-LNCS-Paper von MICAI 2024. Menschen sehen kaputte generierte Bilder, die die Metriken noch als in Ordnung werten.",
    "Papier Springer LNCS de MICAI 2024. Les gens voient des images générées cassées que les métriques notent encore comme correctes.",
  ],
  [
    "Co-authored with Zobeida Guzmán. We presented it at MICAI 2024, with UDLAP, INAOE, and SMIA, and Springer published it in LNCS 15246, pages 198 to 209.",
    "Coautoría con Zobeida Guzmán. Lo presentamos en MICAI 2024, con UDLAP, INAOE y SMIA, y Springer lo publicó en LNCS 15246, páginas 198 a 209.",
    "Mit Zobeida Guzmán verfasst. Wir haben es bei MICAI 2024 vorgestellt, mit UDLAP, INAOE und SMIA, und Springer hat es in LNCS 15246 veröffentlicht, Seiten 198 bis 209.",
    "Coécrit avec Zobeida Guzmán. Nous l'avons présenté à MICAI 2024, avec l'UDLAP, l'INAOE et la SMIA, et Springer l'a publié dans LNCS 15246, pages 198 à 209.",
  ],
  [
    "The survey covers realism metrics for VAEs, GANs, and diffusion models. The gap is Moravec's paradox in miniature: a person sees that a scene does not hold together, and the number does not. The image set that went with the work is 4,368 PNGs built from COCO.",
    "El estudio cubre métricas de realismo para VAEs, GANs y modelos de difusión. La brecha es la paradoja de Moravec en pequeño: una persona ve que una escena no se sostiene, y el número no. El conjunto de imágenes del trabajo son 4,368 PNG armados desde COCO.",
    "Die Übersicht deckt Realismusmetriken für VAEs, GANs und Diffusionsmodelle ab. Die Lücke ist Moravecs Paradox in klein: ein Mensch sieht, dass eine Szene nicht zusammenhält, die Zahl nicht. Der Bildsatz zur Arbeit sind 4,368 PNGs aus COCO.",
    "L'étude couvre des métriques de réalisme pour les VAE, les GAN et les modèles de diffusion. L'écart est le paradoxe de Moravec en petit: une personne voit qu'une scène ne tient pas, et le nombre ne le voit pas. Le jeu d'images du travail compte 4,368 PNG construits depuis COCO.",
  ],
  ["With Zobeida Guzmán.", "Con Zobeida Guzmán.", "Mit Zobeida Guzmán.", "Avec Zobeida Guzmán."],
  ["CONISOFT 2025 workshop", "Taller CONISOFT 2025", "Workshop CONISOFT 2025", "Atelier CONISOFT 2025"],
  [
    "Model files are code. Pickle, .pt, and .pth can run when loaded. SafeTensors and a disposable VM are the boring fix.",
    "Los archivos de modelo son código. Pickle, .pt y .pth pueden ejecutarse al cargarse. SafeTensors y una VM desechable son el arreglo aburrido.",
    "Modelldateien sind Code. Pickle, .pt und .pth können beim Laden laufen. SafeTensors und eine Wegwerf-VM sind die langweilige Abhilfe.",
    "Les fichiers de modèle sont du code. Pickle, .pt et .pth peuvent s'exécuter au chargement. SafeTensors et une VM jetable sont le correctif ennuyeux.",
  ],
  [
    "At UABCS in La Paz, with Dr. Zobeida Guzmán, under the IEEE Computer Society. The session was called \"Models under attack: backdoors, manipulation, and analysis of malicious AI.\"",
    "En la UABCS en La Paz, con la Dra. Zobeida Guzmán, bajo la IEEE Computer Society. La sesión se llamó \"Models under attack: backdoors, manipulation, and analysis of malicious AI.\"",
    "An der UABCS in La Paz, mit Dr. Zobeida Guzmán, unter der IEEE Computer Society. Die Sitzung hiess \"Models under attack: backdoors, manipulation, and analysis of malicious AI.\"",
    "À l'UABCS à La Paz, avec la Dre Zobeida Guzmán, sous l'IEEE Computer Society. La séance s'appelait \"Models under attack: backdoors, manipulation, and analysis of malicious AI.\"",
  ],
  [
    "Python's docs say pickle is not safe. A weight file that is secretly a pickle runs code on load. We talked about that supply path and about the fixes: SafeTensors, or load the old file inside a container or a VM with no credentials mounted. The note on this site stops there on purpose.",
    "La documentación de Python dice que pickle no es seguro. Un archivo de pesos que en secreto es un pickle ejecuta código al cargarse. Hablamos de esa ruta de suministro y de los arreglos: SafeTensors, o cargar el archivo viejo dentro de un contenedor o una VM sin credenciales montadas. La nota de este sitio se detiene ahí a propósito.",
    "Pythons Doku sagt, pickle ist nicht sicher. Eine Gewichtsdatei, die heimlich ein Pickle ist, führt beim Laden Code aus. Wir sprachen über diesen Lieferweg und über die Abhilfen: SafeTensors, oder die alte Datei in einem Container oder einer VM laden, ohne montierte Zugangsdaten. Die Notiz auf dieser Seite hört dort absichtlich auf.",
    "La doc de Python dit que pickle n'est pas sûr. Un fichier de poids qui est en secret un pickle exécute du code au chargement. Nous avons parlé de ce chemin d'approvisionnement et des correctifs: SafeTensors, ou charger l'ancien fichier dans un conteneur ou une VM sans identifiants montés. La note de ce site s'arrête là exprès.",
  ],
  ["With Dr. Zobeida Guzmán.", "Con la Dra. Zobeida Guzmán.", "Mit Dr. Zobeida Guzmán.", "Avec la Dre Zobeida Guzmán."],
  [
    "First place, Enactus Changemakers, accessibility track. Shapes on players when the shirts look the same.",
    "Primer lugar, Enactus Changemakers, pista de accesibilidad. Formas sobre los jugadores cuando las playeras se ven igual.",
    "Erster Platz, Enactus Changemakers, Barrierefreiheit. Formen auf den Spielern, wenn die Trikots gleich aussehen.",
    "Première place, Enactus Changemakers, piste accessibilité. Des formes sur les joueurs quand les maillots se ressemblent.",
  ],
  [
    "Team Xcookers, for UDLAP, at the Changemakers Social Challenge. The theme was the 2026 World Cup. The failure mode is simple: two kits with no regulation on contrast, so a color-blind viewer cannot tell the sides apart.",
    "Equipo Xcookers, por la UDLAP, en el Changemakers Social Challenge. El tema fue el Mundial 2026. La falla es simple: dos uniformes sin regla de contraste, así que quien no distingue colores no separa los equipos.",
    "Team Xcookers, für die UDLAP, beim Changemakers Social Challenge. Das Thema war die Weltmeisterschaft 2026. Der Fehler ist einfach: zwei Trikots ohne Kontrastregel, also kann ein farbenblinder Zuschauer die Seiten nicht trennen.",
    "Équipe Xcookers, pour l'UDLAP, au Changemakers Social Challenge. Le thème était la Coupe du monde 2026. La panne est simple: deux tenues sans règle de contraste, donc une personne daltonienne ne sépare pas les camps.",
  ],
  [
    "ColorScore is a SwiftUI app. On-device detection finds the players. K-means splits them into teams. Each team gets a geometric mark, drawn with Apple's frameworks, so the broadcast does not depend on the dye.",
    "ColorScore es una app en SwiftUI. La detección en el dispositivo encuentra a los jugadores. K-means los separa en equipos. Cada equipo recibe una marca geométrica, dibujada con los frameworks de Apple, para que la transmisión no dependa del tinte.",
    "ColorScore ist eine SwiftUI-App. Erkennung auf dem Gerät findet die Spieler. K-means teilt sie in Teams. Jedes Team bekommt eine geometrische Markierung, gezeichnet mit Apples Frameworks, damit die Übertragung nicht vom Farbstoff abhängt.",
    "ColorScore est une app SwiftUI. La détection sur l'appareil trouve les joueurs. K-means les sépare en équipes. Chaque équipe reçoit une marque géométrique, dessinée avec les frameworks d'Apple, pour que la diffusion ne dépende pas de la teinture.",
  ],
  [
    "With Nina Maeva Mazadiego Cortes and Daniela Renée Ramírez. Guidance from Zobeida Guzmán, support from Humberto Zepeda González.",
    "Con Nina Maeva Mazadiego Cortes y Daniela Renée Ramírez. Guía de Zobeida Guzmán, apoyo de Humberto Zepeda González.",
    "Mit Nina Maeva Mazadiego Cortes und Daniela Renée Ramírez. Begleitung von Zobeida Guzmán, Unterstützung von Humberto Zepeda González.",
    "Avec Nina Maeva Mazadiego Cortes et Daniela Renée Ramírez. Encadrement de Zobeida Guzmán, appui de Humberto Zepeda González.",
  ],
  [
    "First place at a SwiftUI hackathon. The app names the waste and points at a recycling site.",
    "Primer lugar en un hackathon de SwiftUI. La app nombra el residuo y apunta a un sitio de reciclaje.",
    "Erster Platz bei einem SwiftUI-Hackathon. Die App benennt den Abfall und zeigt eine Recyclingstelle.",
    "Première place à un hackathon SwiftUI. L'app nomme le déchet et indique un site de recyclage.",
  ],
  [
    "An iOS app from a SwiftUI hackathon. A model classifies the waste. MapKit shows where to take it. Older than the 2026 resumes, and the repo is still public.",
    "Una app de iOS de un hackathon de SwiftUI. Un modelo clasifica el residuo. MapKit muestra a dónde llevarlo. Es anterior a los currículos de 2026, y el repo sigue público.",
    "Eine iOS-App aus einem SwiftUI-Hackathon. Ein Modell klassifiziert den Abfall. MapKit zeigt, wohin damit. Älter als die Lebensläufe von 2026, und das Repo ist noch öffentlich.",
    "Une app iOS d'un hackathon SwiftUI. Un modèle classe le déchet. MapKit montre où l'apporter. Plus ancienne que les CV de 2026, et le dépôt est encore public.",
  ],
  [
    "Android app for skateparks and street spots. Kotlin, Compose, Firebase, Maps.",
    "App de Android para skateparks y spots de calle. Kotlin, Compose, Firebase, Maps.",
    "Android-App für Skateparks und Streetspots. Kotlin, Compose, Firebase, Maps.",
    "App Android pour des skateparks et des spots de rue. Kotlin, Compose, Firebase, Maps.",
  ],
  [
    "Find a park, rate it, drop a street spot. Firebase auth, Cloud Firestore, Google Maps, Jetpack Compose.",
    "Encuentra un parque, califícalo, deja un spot de calle. Auth de Firebase, Cloud Firestore, Google Maps, Jetpack Compose.",
    "Finde einen Park, bewerte ihn, setze einen Streetspot. Firebase Auth, Cloud Firestore, Google Maps, Jetpack Compose.",
    "Trouve un parc, note-le, pose un spot de rue. Auth Firebase, Cloud Firestore, Google Maps, Jetpack Compose.",
  ],
  [
    "President of the UDLAP security group since February 2024. Member first, under Juan Pablo Morales Durante. More than 8 CTFs.",
    "Presidente del grupo de seguridad de la UDLAP desde febrero de 2024. Primero miembro, con Juan Pablo Morales Durante. Más de 8 CTFs.",
    "Präsident der Sicherheitsgruppe der UDLAP seit Februar 2024. Zuerst Mitglied, unter Juan Pablo Morales Durante. Mehr als 8 CTFs.",
    "Président du groupe sécurité de l'UDLAP depuis février 2024. D'abord membre, sous Juan Pablo Morales Durante. Plus de 8 CTFs.",
  ],
  [
    "I joined knowing little and stayed. Juan Pablo Morales Durante was president before me and is the person who pulled me into this work. I have chaired the group since February 2024. We have entered more than 8 CTFs. Weekly sessions covered TCP/IP, Wireshark, Nmap, Burp Suite, and HTTP. The solves stay off this site.",
    "Entré sabiendo poco y me quedé. Juan Pablo Morales Durante fue presidente antes que yo y es quien me jaló a este trabajo. Presido el grupo desde febrero de 2024. Hemos entrado a más de 8 CTFs. Las sesiones semanales cubrieron TCP/IP, Wireshark, Nmap, Burp Suite y HTTP. Las soluciones no están en este sitio.",
    "Ich kam mit wenig Wissen und blieb. Juan Pablo Morales Durante war Präsident vor mir und hat mich in diese Arbeit gezogen. Ich leite die Gruppe seit Februar 2024. Wir waren bei mehr als 8 CTFs. Wöchentliche Sitzungen deckten TCP/IP, Wireshark, Nmap, Burp Suite und HTTP ab. Die Solves bleiben ausserhalb dieser Seite.",
    "Je suis entré en sachant peu et je suis resté. Juan Pablo Morales Durante était président avant moi et c'est lui qui m'a tiré dans ce travail. Je préside le groupe depuis février 2024. Nous avons fait plus de 8 CTFs. Les séances hebdomadaires couvraient TCP/IP, Wireshark, Nmap, Burp Suite et HTTP. Les solves restent hors de ce site.",
  ],
  [
    "I also ran a Docker crash course at STEM UDLAP: build a container, then bring Compose up. I was treasurer of the computer science student council from August 2024 to May 2025, including the budget for CREATE-V.",
    "También di un curso corto de Docker en STEM UDLAP: armar un contenedor y luego levantar Compose. Fui tesorero del consejo estudiantil de computación de agosto de 2024 a mayo de 2025, incluido el presupuesto de CREATE-V.",
    "Ich gab auch einen kurzen Docker-Kurs bei STEM UDLAP: einen Container bauen, dann Compose hochfahren. Ich war Kassenwart des Informatik-Fachschaftsrats von August 2024 bis Mai 2025, einschliesslich des Budgets für CREATE-V.",
    "J'ai aussi donné un cours court de Docker à STEM UDLAP: construire un conteneur, puis lancer Compose. J'ai été trésorier du conseil étudiant d'informatique d'août 2024 à mai 2025, budget de CREATE-V compris.",
  ],
  [
    "Vendimia, at Swift Change Makers (Enactus, a Banorte challenge), with Rodrigo Espíritu Berra, André Francois Duhamel Gutiérrez, and Alan Pérez Hernández.",
    "Vendimia, en Swift Change Makers (Enactus, un reto de Banorte), con Rodrigo Espíritu Berra, André Francois Duhamel Gutiérrez y Alan Pérez Hernández.",
    "Vendimia, bei Swift Change Makers (Enactus, eine Banorte-Challenge), mit Rodrigo Espíritu Berra, André Francois Duhamel Gutiérrez und Alan Pérez Hernández.",
    "Vendimia, à Swift Change Makers (Enactus, un défi Banorte), avec Rodrigo Espíritu Berra, André Francois Duhamel Gutiérrez et Alan Pérez Hernández.",
  ],
  [
    "HackMexico with AngelHack. Crypto and interface work, with Juan Pablo Morales Durante, Carlos Javier Galán Zavala, and Gil Andrei Sotomayor Figueroa.",
    "HackMexico con AngelHack. Trabajo de cripto e interfaz, con Juan Pablo Morales Durante, Carlos Javier Galán Zavala y Gil Andrei Sotomayor Figueroa.",
    "HackMexico mit AngelHack. Crypto- und Interface-Arbeit, mit Juan Pablo Morales Durante, Carlos Javier Galán Zavala und Gil Andrei Sotomayor Figueroa.",
    "HackMexico avec AngelHack. Travail de crypto et d'interface, avec Juan Pablo Morales Durante, Carlos Javier Galán Zavala et Gil Andrei Sotomayor Figueroa.",
  ],
  [
    "CodeRush at Tec de Monterrey, Puebla, with Algorithmia Group Puebla Tec.",
    "CodeRush en el Tec de Monterrey, Puebla, con Algorithmia Group Puebla Tec.",
    "CodeRush am Tec de Monterrey, Puebla, mit Algorithmia Group Puebla Tec.",
    "CodeRush au Tec de Monterrey, Puebla, avec Algorithmia Group Puebla Tec.",
  ],
  [
    "HackRF One and a Nuand bladeRF 2.0. I sweep, generate, and test links, mostly from 2.4 to 5.8 GHz. The Python in that folder is for Autel drone links on 2.4 and 5 GHz, on hardware I have on the bench.",
    "HackRF One y un Nuand bladeRF 2.0. Barro, genero y pruebo enlaces, sobre todo de 2.4 a 5.8 GHz. El Python de esa carpeta es para enlaces de drones Autel en 2.4 y 5 GHz, en hardware que tengo en el banco.",
    "HackRF One und ein Nuand bladeRF 2.0. Ich sweepe, erzeuge und teste Links, meist von 2.4 bis 5.8 GHz. Das Python in dem Ordner ist für Autel-Drohnenlinks auf 2.4 und 5 GHz, an Hardware auf meinem Tisch.",
    "HackRF One et un Nuand bladeRF 2.0. Je balaie, je génère et je teste des liens, surtout de 2.4 à 5.8 GHz. Le Python de ce dossier est pour des liens de drones Autel en 2.4 et 5 GHz, sur du matériel que j'ai sur le banc.",
  ],
  [
    "I like portable spectrum gear for the same reason I like a shell: the state fits on one screen. Separately, I am restoring an iMac G4. The lamp hinge is the whole personality of that machine, and it is slow work.",
    "Me gusta el equipo portátil de espectro por la misma razón que me gusta una shell: el estado cabe en una pantalla. Aparte, estoy restaurando una iMac G4. La bisagra de lámpara es toda la personalidad de esa máquina, y es trabajo lento.",
    "Ich mag tragbares Spektrumgerät aus demselben Grund wie eine Shell: der Zustand passt auf einen Bildschirm. Getrennt davon restauriere ich einen iMac G4. Das Lampenscharnier ist die ganze Persönlichkeit der Maschine, und es ist langsame Arbeit.",
    "J'aime le matériel de spectre portable pour la même raison que j'aime un shell: l'état tient sur un écran. À part ça, je restaure un iMac G4. La charnière lampe est toute la personnalité de cette machine, et c'est un travail lent.",
  ],
  [
    "Goben finished computer systems engineering at UDLAP, 2021 to 2025. The grade on the record is 9.0/10.",
    "Goben terminó ingeniería en sistemas computacionales en la UDLAP, de 2021 a 2025. La nota del expediente es 9.0/10.",
    "Goben hat Computeringenieurwissenschaften an der UDLAP abgeschlossen, 2021 bis 2025. Die Note in der Akte ist 9.0/10.",
    "Goben a fini l'ingénierie en systèmes informatiques à l'UDLAP, 2021 à 2025. La note au dossier est 9.0/10.",
  ],
  [
    "Two seats at TBSeK. Part-time Jr. SOC from April 2025 to July 2026, then full-time SOC/MDR.",
    "Dos puestos en TBSeK. SOC junior de medio tiempo de abril de 2025 a julio de 2026, y después SOC/MDR de tiempo completo.",
    "Zwei Stellen bei TBSeK. Teilzeit Jr. SOC von April 2025 bis Juli 2026, dann Vollzeit SOC/MDR.",
    "Deux postes chez TBSeK. SOC junior à temps partiel d'avril 2025 à juillet 2026, puis SOC/MDR à temps plein.",
  ],
  [
    "The STEM lab server was a Mac Mini. Docker and Cloudflare Tunnels ran on it from February 2024 to June 2026.",
    "El servidor del laboratorio de STEM era una Mac Mini. Docker y Cloudflare Tunnels corrieron ahí de febrero de 2024 a junio de 2026.",
    "Der STEM-Laborserver war ein Mac Mini. Docker und Cloudflare Tunnels liefen darauf von Februar 2024 bis Juni 2026.",
    "Le serveur du labo STEM était un Mac Mini. Docker et Cloudflare Tunnels y ont tourné de février 2024 à juin 2026.",
  ],
  [
    "Hackztecs still meets weekly: TCP/IP, Wireshark, Nmap, Burp Suite, HTTP. He has chaired it since February 2024. More than 8 CTFs.",
    "Hackztecs sigue reuniéndose cada semana: TCP/IP, Wireshark, Nmap, Burp Suite, HTTP. Lo preside desde febrero de 2024. Más de 8 CTFs.",
    "Hackztecs trifft sich weiter wöchentlich: TCP/IP, Wireshark, Nmap, Burp Suite, HTTP. Er leitet es seit Februar 2024. Mehr als 8 CTFs.",
    "Hackztecs se réunit encore chaque semaine: TCP/IP, Wireshark, Nmap, Burp Suite, HTTP. Il le préside depuis février 2024. Plus de 8 CTFs.",
  ],
  [
    "Hack The Box University CTF 2025, Jingle Trouble, ended 52 of 1,014. Top 5%. The only Mexican university in the top 100.",
    "Hack The Box University CTF 2025, Jingle Trouble, terminó 52 de 1,014. Top 5%. La única universidad mexicana en el top 100.",
    "Hack The Box University CTF 2025, Jingle Trouble, endete als 52 von 1,014. Top 5%. Die einzige mexikanische Universität in den Top 100.",
    "Hack The Box University CTF 2025, Jingle Trouble, s'est fini 52e sur 1,014. Top 5%. La seule université mexicaine dans le top 100.",
  ],
  [
    "A different board: HTB Cyber Apocalypse CTF 2025. 51 of 77 challenges, 34,125 points, rank 293, top 3.5% worldwide, 3rd in Mexico.",
    "Otro tablero: HTB Cyber Apocalypse CTF 2025. 51 de 77 retos, 34,125 puntos, lugar 293, top 3.5% mundial, tercero en México.",
    "Ein anderes Board: HTB Cyber Apocalypse CTF 2025. 51 von 77 Challenges, 34,125 Punkte, Platz 293, Top 3.5% weltweit, 3. in Mexiko.",
    "Un autre tableau: HTB Cyber Apocalypse CTF 2025. 51 défis sur 77, 34,125 points, rang 293, top 3.5% mondial, 3e au Mexique.",
  ],
  [
    "November 2024, team Los Zepedas took the ÖBB challenge at MAIA. First of 22. The prize was a trip to Austria.",
    "En noviembre de 2024, el equipo Los Zepedas se llevó el reto de ÖBB en MAIA. Primero de 22. El premio fue un viaje a Austria.",
    "Im November 2024 holte Team Los Zepedas die ÖBB-Challenge bei MAIA. Erster von 22. Der Preis war eine Reise nach Österreich.",
    "En novembre 2024, l'équipe Los Zepedas a pris le défi ÖBB à MAIA. Première de 22. Le prix était un voyage en Autriche.",
  ],
  [
    "ColorScore, November 2025, first place at Enactus Changemakers with team Xcookers. SwiftUI, k-means, geometric marks.",
    "ColorScore, noviembre de 2025, primer lugar en Enactus Changemakers con el equipo Xcookers. SwiftUI, k-means, marcas geométricas.",
    "ColorScore, November 2025, erster Platz bei Enactus Changemakers mit Team Xcookers. SwiftUI, k-means, geometrische Marken.",
    "ColorScore, novembre 2025, première place à Enactus Changemakers avec l'équipe Xcookers. SwiftUI, k-means, marques géométriques.",
  ],
  [
    "The MICAI 2024 paper Easy for Us, Complex for AI is in Springer LNCS 15246, pages 198 to 209. Co-authored with Zobeida Guzmán.",
    "El paper de MICAI 2024, Easy for Us, Complex for AI, está en Springer LNCS 15246, páginas 198 a 209. Coautoría con Zobeida Guzmán.",
    "Das MICAI-2024-Paper Easy for Us, Complex for AI steht in Springer LNCS 15246, Seiten 198 bis 209. Mitverfasst mit Zobeida Guzmán.",
    "Le papier MICAI 2024, Easy for Us, Complex for AI, est dans Springer LNCS 15246, pages 198 à 209. Coécrit avec Zobeida Guzmán.",
  ],
  [
    "Spanish is native. English is C1+. French is A2. German is A1.",
    "El español es nativo. El inglés es C1+. El francés es A2. El alemán es A1.",
    "Spanisch ist Muttersprache. Englisch ist C1+. Französisch ist A2. Deutsch ist A1.",
    "L'espagnol est maternel. L'anglais est C1+. Le français est A2. L'allemand est A1.",
  ],
  [
    "The search is MDR, SOC, and SRE work in Mexico, the United States, Austria, Ireland, and the Netherlands. A cybersecurity master's, Ireland included, is on that list.",
    "La búsqueda es trabajo de MDR, SOC y SRE en México, Estados Unidos, Austria, Irlanda y Países Bajos. Una maestría en ciberseguridad, Irlanda incluida, está en esa lista.",
    "Die Suche gilt MDR-, SOC- und SRE-Arbeit in Mexiko, den USA, Österreich, Irland und den Niederlanden. Ein Master in Cybersicherheit, Irland inklusive, steht auf der Liste.",
    "La recherche porte sur du travail MDR, SOC et SRE au Mexique, aux États-Unis, en Autriche, en Irlande et aux Pays-Bas. Un master en cybersécurité, Irlande comprise, est sur cette liste.",
  ],
  [
    "On the bench: a HackRF One and a Nuand bladeRF 2.0, mostly 2.4 to 5.8 GHz. Separately, an iMac G4 restoration.",
    "En el banco: un HackRF One y un Nuand bladeRF 2.0, sobre todo de 2.4 a 5.8 GHz. Aparte, una restauración de iMac G4.",
    "Auf dem Tisch: ein HackRF One und ein Nuand bladeRF 2.0, meist 2.4 bis 5.8 GHz. Getrennt davon eine iMac-G4-Restaurierung.",
    "Sur le banc: un HackRF One et un Nuand bladeRF 2.0, surtout de 2.4 à 5.8 GHz. À part, une restauration d'iMac G4.",
  ],
  [
    "A coding agent can draft a change. He still has to read the diff.",
    "Un agente de código puede redactar un cambio. Él todavía tiene que leer el diff.",
    "Ein Coding-Agent kann eine Änderung entwerfen. Er muss den Diff trotzdem lesen.",
    "Un agent de code peut rédiger un changement. Il doit quand même lire le diff.",
  ],
  [
    "You are looking at Goben's desk. He finished computer systems engineering at UDLAP, 2021 to 2025. The grade on the record is 9.0/10.",
    "Estás viendo el escritorio de Goben. Terminó ingeniería en sistemas computacionales en la UDLAP, de 2021 a 2025. La nota del expediente es 9.0/10.",
    "Du siehst Gobens Schreibtisch. Er hat Computeringenieurwissenschaften an der UDLAP abgeschlossen, 2021 bis 2025. Die Note in der Akte ist 9.0/10.",
    "Tu regardes le bureau de Goben. Il a fini l'ingénierie en systèmes informatiques à l'UDLAP, 2021 à 2025. La note au dossier est 9.0/10.",
  ],
  [
    "If you open Jobs, you get two seats at TBSeK. Part-time Jr. SOC from April 2025 to July 2026, then full-time SOC/MDR.",
    "Si abres Empleos, ves dos puestos en TBSeK. SOC junior de medio tiempo de abril de 2025 a julio de 2026, y después SOC/MDR de tiempo completo.",
    "Wenn du Jobs öffnest, siehst du zwei Stellen bei TBSeK. Teilzeit Jr. SOC von April 2025 bis Juli 2026, dann Vollzeit SOC/MDR.",
    "Si tu ouvres Postes, tu vois deux sièges chez TBSeK. SOC junior à temps partiel d'avril 2025 à juillet 2026, puis SOC/MDR à temps plein.",
  ],
  [
    "If you want the lab story, the STEM server was a Mac Mini. He ran Docker and Cloudflare Tunnels on it from February 2024 to June 2026.",
    "Si quieres la historia del laboratorio, el servidor de STEM era una Mac Mini. Corrió Docker y Cloudflare Tunnels ahí de febrero de 2024 a junio de 2026.",
    "Wenn du die Laborgeschichte willst: der STEM-Server war ein Mac Mini. Er liess Docker und Cloudflare Tunnels darauf von Februar 2024 bis Juni 2026 laufen.",
    "Si tu veux l'histoire du labo, le serveur STEM était un Mac Mini. Il y a fait tourner Docker et Cloudflare Tunnels de février 2024 à juin 2026.",
  ],
  [
    "You can ask about Hackztecs. It still meets weekly: TCP/IP, Wireshark, Nmap, Burp Suite, HTTP. He has chaired it since February 2024. More than 8 CTFs.",
    "Puedes preguntar por Hackztecs. Sigue reuniéndose cada semana: TCP/IP, Wireshark, Nmap, Burp Suite, HTTP. Lo preside desde febrero de 2024. Más de 8 CTFs.",
    "Du kannst nach Hackztecs fragen. Es trifft sich weiter wöchentlich: TCP/IP, Wireshark, Nmap, Burp Suite, HTTP. Er leitet es seit Februar 2024. Mehr als 8 CTFs.",
    "Tu peux demander pour Hackztecs. Ça se réunit encore chaque semaine: TCP/IP, Wireshark, Nmap, Burp Suite, HTTP. Il le préside depuis février 2024. Plus de 8 CTFs.",
  ],
  [
    "The University board you will see under Projects is Jingle Trouble. Hackztecs finished 52 of 1,014. Top 5%. The only Mexican university in the top 100.",
    "El tablero universitario que vas a ver en Proyectos es Jingle Trouble. Hackztecs quedó 52 de 1,014. Top 5%. La única universidad mexicana en el top 100.",
    "Das University-Board, das du unter Projekte siehst, ist Jingle Trouble. Hackztecs wurde 52 von 1,014. Top 5%. Die einzige mexikanische Universität in den Top 100.",
    "Le tableau universitaire que tu verras sous Projets est Jingle Trouble. Hackztecs a fini 52e sur 1,014. Top 5%. La seule université mexicaine dans le top 100.",
  ],
  [
    "Do not mix that up when you read the next board. Cyber Apocalypse CTF 2025 is different: 51 of 77 challenges, 34,125 points, rank 293, top 3.5% worldwide, 3rd in Mexico.",
    "No los mezcles cuando leas el siguiente tablero. Cyber Apocalypse CTF 2025 es otro: 51 de 77 retos, 34,125 puntos, lugar 293, top 3.5% mundial, tercero en México.",
    "Misch das nicht, wenn du das nächste Board liest. Cyber Apocalypse CTF 2025 ist ein anderes: 51 von 77 Challenges, 34,125 Punkte, Platz 293, Top 3.5% weltweit, 3. in Mexiko.",
    "Ne mélange pas ça quand tu lis le tableau suivant. Cyber Apocalypse CTF 2025 est différent: 51 défis sur 77, 34,125 points, rang 293, top 3.5% mondial, 3e au Mexique.",
  ],
  [
    "November 2024, if you are looking at MAIA: team Los Zepedas took the ÖBB challenge. First of 22. The prize was a trip to Austria. The hackathon was in Mexico City.",
    "Noviembre de 2024, si estás viendo MAIA: el equipo Los Zepedas se llevó el reto de ÖBB. Primero de 22. El premio fue un viaje a Austria. El hackathon fue en la Ciudad de México.",
    "November 2024, falls du MAIA ansiehst: Team Los Zepedas holte die ÖBB-Challenge. Erster von 22. Der Preis war eine Reise nach Österreich. Der Hackathon war in Mexiko-Stadt.",
    "Novembre 2024, si tu regardes MAIA: l'équipe Los Zepedas a pris le défi ÖBB. Première de 22. Le prix était un voyage en Autriche. Le hackathon était à Mexico.",
  ],
  [
    "You can open ColorScore under Projects. November 2025, first place at Enactus Changemakers with team Xcookers. SwiftUI, k-means, geometric marks.",
    "Puedes abrir ColorScore en Proyectos. Noviembre de 2025, primer lugar en Enactus Changemakers con el equipo Xcookers. SwiftUI, k-means, marcas geométricas.",
    "Du kannst ColorScore unter Projekte öffnen. November 2025, erster Platz bei Enactus Changemakers mit Team Xcookers. SwiftUI, k-means, geometrische Marken.",
    "Tu peux ouvrir ColorScore sous Projets. Novembre 2025, première place à Enactus Changemakers avec l'équipe Xcookers. SwiftUI, k-means, marques géométriques.",
  ],
  [
    "There is a paper if you need it. MICAI 2024, Easy for Us, Complex for AI, Springer LNCS 15246, pages 198 to 209. He wrote it with Zobeida Guzmán.",
    "Hay un paper si lo necesitas. MICAI 2024, Easy for Us, Complex for AI, Springer LNCS 15246, páginas 198 a 209. Lo escribió con Zobeida Guzmán.",
    "Es gibt ein Paper, falls du es brauchst. MICAI 2024, Easy for Us, Complex for AI, Springer LNCS 15246, Seiten 198 bis 209. Er schrieb es mit Zobeida Guzmán.",
    "Il y a un papier si tu en as besoin. MICAI 2024, Easy for Us, Complex for AI, Springer LNCS 15246, pages 198 à 209. Il l'a écrit avec Zobeida Guzmán.",
  ],
  [
    "Languages, since you will ask: Spanish is native. English is C1+. French is A2. German is A1.",
    "Idiomas, porque vas a preguntar: español nativo. Inglés C1+. Francés A2. Alemán A1.",
    "Sprachen, weil du fragen wirst: Spanisch ist Muttersprache. Englisch ist C1+. Französisch ist A2. Deutsch ist A1.",
    "Langues, puisque tu vas demander: espagnol maternel. Anglais C1+. Français A2. Allemand A1.",
  ],
  [
    "If you are hiring, he is looking for MDR, SOC, and SRE work in Mexico, the United States, Austria, Ireland, and the Netherlands. A cybersecurity master's, Ireland included, is on that list.",
    "Si estás contratando, él busca trabajo de MDR, SOC y SRE en México, Estados Unidos, Austria, Irlanda y Países Bajos. Una maestría en ciberseguridad, Irlanda incluida, está en esa lista.",
    "Falls du einstellst: er sucht MDR-, SOC- und SRE-Arbeit in Mexiko, den USA, Österreich, Irland und den Niederlanden. Ein Master in Cybersicherheit, Irland inklusive, steht auf der Liste.",
    "Si tu recrutes, il cherche du travail MDR, SOC et SRE au Mexique, aux États-Unis, en Autriche, en Irlande et aux Pays-Bas. Un master en cybersécurité, Irlande comprise, est sur cette liste.",
  ],
  [
    "On the bench, if you open Radio: a HackRF One and a Nuand bladeRF 2.0, mostly 2.4 to 5.8 GHz. The iMac G4 restoration is a separate pile.",
    "En el banco, si abres Radio: un HackRF One y un Nuand bladeRF 2.0, sobre todo de 2.4 a 5.8 GHz. La restauración de la iMac G4 es otra pila.",
    "Auf dem Tisch, wenn du Funk öffnest: ein HackRF One und ein Nuand bladeRF 2.0, meist 2.4 bis 5.8 GHz. Die iMac-G4-Restaurierung ist ein eigener Stapel.",
    "Sur le banc, si tu ouvres Radio: un HackRF One et un Nuand bladeRF 2.0, surtout de 2.4 à 5.8 GHz. La restauration de l'iMac G4 est une autre pile.",
  ],
  [
    "One habit you should know. A coding agent can draft a change. He still has to read the diff.",
    "Un hábito que debes saber. Un agente de código puede redactar un cambio. Él todavía tiene que leer el diff.",
    "Eine Gewohnheit, die du kennen solltest. Ein Coding-Agent kann eine Änderung entwerfen. Er muss den Diff trotzdem lesen.",
    "Une habitude que tu dois savoir. Un agent de code peut rédiger un changement. Il doit quand même lire le diff.",
  ],
  [
    "Start with Jobs, then Projects, then Skills. Courses and Contact sit on that same row. Hit Next if you want another line from me.",
    "Empieza por Empleos, luego Proyectos, luego Habilidades. Cursos y Contacto están en la misma fila. Dale a Siguiente si quieres otra línea mía.",
    "Fang mit Jobs an, dann Projekte, dann Kenntnisse. Kurse und Kontakt stehen in derselben Reihe. Weiter, wenn du noch eine Zeile von mir willst.",
    "Commence par Postes, puis Projets, puis Compétences. Cours et Contact sont sur la même rangée. Suivant si tu veux une autre ligne de moi.",
  ],
  [
    "You are on the jobs. Full-time SOC/MDR at TBSeK, July 2026 to present. The junior seat before that was part-time. STEM and T-Systems are further down.",
    "Estás en los empleos. SOC/MDR de tiempo completo en TBSeK, de julio de 2026 a la fecha. El puesto junior de antes fue de medio tiempo. STEM y T-Systems están más abajo.",
    "Du bist bei den Jobs. Vollzeit SOC/MDR bei TBSeK, Juli 2026 bis heute. Die Junior-Stelle davor war Teilzeit. STEM und T-Systems stehen weiter unten.",
    "Tu es sur les postes. SOC/MDR à temps plein chez TBSeK, juillet 2026 à aujourd'hui. Le poste junior d'avant était à temps partiel. STEM et T-Systems sont plus bas.",
  ],
  [
    "You are on the projects he will talk about. The two HTB boards are different events, so read both.",
    "Estás en los proyectos de los que va a hablar. Los dos tableros de HTB son eventos distintos, así que lee los dos.",
    "Du bist bei den Projekten, über die er sprechen wird. Die zwei HTB-Boards sind verschiedene Events, also lies beide.",
    "Tu es sur les projets dont il va parler. Les deux tableaux HTB sont des événements différents, alors lis les deux.",
  ],
  [
    "You are on the tool list from the jobs. A coding agent can draft a change. He still has to read the diff.",
    "Estás en la lista de herramientas de los empleos. Un agente de código puede redactar un cambio. Él todavía tiene que leer el diff.",
    "Du bist bei der Werkzeugliste aus den Jobs. Ein Coding-Agent kann eine Änderung entwerfen. Er muss den Diff trotzdem lesen.",
    "Tu es sur la liste d'outils des postes. Un agent de code peut rédiger un changement. Il doit quand même lire le diff.",
  ],
  [
    "You are on the courses. The named ones are Metasploit and macOS Fundamentals, both July 2025. Security+ is in progress, not earned.",
    "Estás en los cursos. Los que tienen nombre son Metasploit y macOS Fundamentals, ambos de julio de 2025. Security+ está en curso, no obtenido.",
    "Du bist bei den Kursen. Die benannten sind Metasploit und macOS Fundamentals, beide Juli 2025. Security+ läuft noch, ist nicht bestanden.",
    "Tu es sur les cours. Ceux qui sont nommés sont Metasploit et macOS Fundamentals, tous les deux en juillet 2025. Security+ est en cours, pas obtenu.",
  ],
  [
    "You are on contact. There is no form. The address he reads is the mail link above.",
    "Estás en contacto. No hay formulario. La dirección que él lee es el enlace de correo de arriba.",
    "Du bist bei Kontakt. Es gibt kein Formular. Die Adresse, die er liest, ist der Mail-Link oben.",
    "Tu es sur le contact. Il n'y a pas de formulaire. L'adresse qu'il lit est le lien mail au-dessus.",
  ],
  [
    "You are looking at the scans. If a year has no rank in the record, you will not find one invented here.",
    "Estás viendo los escaneos. Si un año no tiene lugar en el expediente, no vas a encontrar uno inventado aquí.",
    "Du siehst die Scans. Wenn ein Jahr keinen Platz in der Akte hat, findest du hier keinen erfundenen.",
    "Tu regardes les scans. Si une année n'a pas de rang dans le dossier, tu n'en trouveras pas un inventé ici.",
  ],
  [
    "You are in the photos. The portrait is the same one on About.",
    "Estás en las fotos. El retrato es el mismo de Sobre mí.",
    "Du bist bei den Fotos. Das Porträt ist dasselbe wie bei Über mich.",
    "Tu es dans les photos. Le portrait est le même que dans À propos.",
  ],
  [
    "You are on the notes. Two short ones. Solve steps stay in the repo, not on this page.",
    "Estás en las notas. Hay dos, cortas. Los pasos de solución se quedan en el repo, no en esta página.",
    "Du bist bei den Notizen. Zwei kurze. Solve-Schritte bleiben im Repo, nicht auf dieser Seite.",
    "Tu es sur les notes. Deux courtes. Les étapes de solve restent dans le dépôt, pas sur cette page.",
  ],
  [
    "You are on the radio page. HackRF One, bladeRF, and the iMac G4. He will tell you it is bench work, not a guide.",
    "Estás en la página de radio. HackRF One, bladeRF y la iMac G4. Te va a decir que es trabajo de banco, no una guía.",
    "Du bist auf der Funk-Seite. HackRF One, bladeRF und der iMac G4. Er wird dir sagen, das ist Laborarbeit, keine Anleitung.",
    "Tu es sur la page radio. HackRF One, bladeRF et l'iMac G4. Il te dira que c'est du travail de banc, pas un guide.",
  ],
  [
    "Computer systems engineering, 2021 to 2025. Graduated. The internships required for the degree are done.",
    "Ingeniería en sistemas computacionales, 2021 a 2025. Titulado. Las prácticas que pedía el título están hechas.",
    "Computeringenieurwissenschaften, 2021 bis 2025. Abgeschlossen. Die für den Abschluss nötigen Praktika sind fertig.",
    "Ingénierie en systèmes informatiques, 2021 à 2025. Diplômé. Les stages exigés par le diplôme sont faits.",
  ],
  [
    "Using the Metasploit Framework, July 2025. macOS Fundamentals, July 2025. Other course badges are on LinkedIn. Scans of event certificates are in Certificates.",
    "Using the Metasploit Framework, julio de 2025. macOS Fundamentals, julio de 2025. Otras insignias de cursos están en LinkedIn. Los escaneos de certificados de eventos están en Certificados.",
    "Using the Metasploit Framework, Juli 2025. macOS Fundamentals, Juli 2025. Andere Kursabzeichen stehen auf LinkedIn. Scans der Event-Zertifikate stehen unter Zertifikate.",
    "Using the Metasploit Framework, juillet 2025. macOS Fundamentals, juillet 2025. Les autres badges de cours sont sur LinkedIn. Les scans des certificats d'événements sont dans Certificats.",
  ],
  ["In progress. Not earned.", "En curso. No obtenido.", "Laufend. Nicht bestanden.", "En cours. Pas obtenu."],
  [
    "A coding agent can draft a change. I still read the diff. The pipelines I will talk about are the report scripts, the radio tools, and the prototypes already under projects.",
    "Un agente de código puede redactar un cambio. Yo sigo leyendo el diff. Los pipelines de los que voy a hablar son los scripts de reportes, las herramientas de radio y los prototipos que ya están en proyectos.",
    "Ein Coding-Agent kann eine Änderung entwerfen. Ich lese den Diff trotzdem. Die Pipelines, über die ich sprechen werde, sind die Berichtsskripte, die Funk-Werkzeuge und die Prototypen, die schon unter Projekte stehen.",
    "Un agent de code peut rédiger un changement. Je lis quand même le diff. Les pipelines dont je vais parler sont les scripts de rapports, les outils radio et les prototypes déjà sous projets.",
  ],
  [
    "Finished challenge writeups live in Hacking-Writeups. I am not pasting solve steps here.",
    "Los writeups de retos terminados viven en Hacking-Writeups. Aquí no pego los pasos de solución.",
    "Fertige Challenge-Writeups liegen in Hacking-Writeups. Ich füge die Solve-Schritte hier nicht ein.",
    "Les writeups de défis finis vivent dans Hacking-Writeups. Je ne colle pas les étapes de solve ici.",
  ],
  [
    "This page is a plain account of what the site uses. It is not a legal opinion.",
    "Esta página es un recuento simple de lo que usa el sitio. No es una opinión legal.",
    "Diese Seite ist eine schlichte Aufstellung dessen, was die Seite nutzt. Sie ist keine Rechtsmeinung.",
    "Cette page est un compte rendu simple de ce que le site utilise. Ce n'est pas un avis juridique.",
  ],
  [
    "The words and the photos are mine, except where a credit says otherwise.",
    "Las palabras y las fotos son mías, salvo donde un crédito diga otra cosa.",
    "Die Worte und die Fotos sind von mir, ausser wo ein Credit etwas anderes sagt.",
    "Les mots et les photos sont à moi, sauf là où un crédit dit autre chose.",
  ],
  [
    "The window chrome is 98.css 0.1.21, MIT, by Jordan Scales. This site is not affiliated with Microsoft. Windows is their mark.",
    "El marco de las ventanas es 98.css 0.1.21, MIT, de Jordan Scales. Este sitio no está afiliado a Microsoft. Windows es su marca.",
    "Der Fensterrahmen ist 98.css 0.1.21, MIT, von Jordan Scales. Diese Seite ist nicht mit Microsoft verbunden. Windows ist deren Marke.",
    "Le cadre des fenêtres est 98.css 0.1.21, MIT, de Jordan Scales. Ce site n'est pas affilié à Microsoft. Windows est leur marque.",
  ],
  [
    "The window font is Pixelated MS Sans Serif by lou on Fontstruct, CC BY-SA 3.0, served from this site.",
    "La fuente de las ventanas es Pixelated MS Sans Serif, de lou en Fontstruct, CC BY-SA 3.0, servida desde este sitio.",
    "Die Fenster-Schrift ist Pixelated MS Sans Serif von lou auf Fontstruct, CC BY-SA 3.0, von dieser Seite ausgeliefert.",
    "La police des fenêtres est Pixelated MS Sans Serif par lou sur Fontstruct, CC BY-SA 3.0, servie depuis ce site.",
  ],
  [
    "The music window is Webdeck Player v1.0.2 by Chris, MIT. The opening video is modest by default : Permaculture, by MTHRBORD, played in YouTube's own player. This site does not host that file. Winamp, Minesweeper, Tetris, and YouTube are other people's marks.",
    "La ventana de música es Webdeck Player v1.0.2 de Chris, MIT. El video de apertura es modest by default : Permaculture, de MTHRBORD, en el reproductor de YouTube. Este sitio no hospeda ese archivo. Winamp, Minesweeper, Tetris y YouTube son marcas de otras personas.",
    "Das Musikfenster ist Webdeck Player v1.0.2 von Chris, MIT. Das Eröffnungsvideo ist modest by default : Permaculture, von MTHRBORD, im eigenen Player von YouTube. Diese Seite hostet die Datei nicht. Winamp, Minesweeper, Tetris und YouTube sind Marken anderer Leute.",
    "La fenêtre musique est Webdeck Player v1.0.2 de Chris, MIT. La vidéo d'ouverture est modest by default : Permaculture, de MTHRBORD, dans le lecteur de YouTube. Ce site n'héberge pas ce fichier. Winamp, Minesweeper, Tetris et YouTube sont des marques d'autres personnes.",
  ],
  [
    "The site does not rebroadcast a radio station. SomaFM and TuneIn are not embedded here.",
    "El sitio no retransmite una estación de radio. SomaFM y TuneIn no están embebidos aquí.",
    "Die Seite sendet keinen Radiosender weiter. SomaFM und TuneIn sind hier nicht eingebettet.",
    "Le site ne rediffuse pas une station de radio. SomaFM et TuneIn ne sont pas intégrés ici.",
  ],
  [
    "Posts, suggestions, and session hashes live in D1. Visitor addresses are not stored. The only cookie is the editor session, and only after login.",
    "Las publicaciones, las sugerencias y los hashes de sesión viven en D1. No se guardan direcciones de visitantes. La única cookie es la sesión del editor, y solo después de entrar.",
    "Beiträge, Vorschläge und Session-Hashes liegen in D1. Besucheradressen werden nicht gespeichert. Das einzige Cookie ist die Editor-Sitzung, und nur nach dem Login.",
    "Les billets, les suggestions et les empreintes de session vivent dans D1. Les adresses des visiteurs ne sont pas stockées. Le seul cookie est la session de l'éditeur, et seulement après connexion.",
  ],
  [
    "Copyright questions go to the address in security.txt: goben.ca.pkn@hotmail.com.",
    "Las preguntas de copyright van a la dirección de security.txt: goben.ca.pkn@hotmail.com.",
    "Copyright-Fragen gehen an die Adresse in security.txt: goben.ca.pkn@hotmail.com.",
    "Les questions de copyright vont à l'adresse de security.txt: goben.ca.pkn@hotmail.com.",
  ],
  [
    "This site is a Vite build served by a Cloudflare Worker. The Worker adds the headers, security.txt, and build.json. Most pages are files. There is no contact form.",
    "Este sitio es un build de Vite servido por un Cloudflare Worker. El Worker agrega los headers, security.txt y build.json. Casi todas las páginas son archivos. No hay formulario de contacto.",
    "Diese Seite ist ein Vite-Build, ausgeliefert von einem Cloudflare Worker. Der Worker setzt die Header, security.txt und build.json. Die meisten Seiten sind Dateien. Es gibt kein Kontaktformular.",
    "Ce site est un build Vite servi par un Cloudflare Worker. Le Worker ajoute les en-têtes, security.txt et build.json. La plupart des pages sont des fichiers. Il n'y a pas de formulaire de contact.",
  ],
  [
    "The blog and the suggestions page are the exception. Posts, suggestions, and session hashes live in D1. The password hash is a Worker secret. Sessions are HttpOnly cookies. Visitor addresses are not stored.",
    "El blog y la página de sugerencias son la excepción. Las publicaciones, las sugerencias y los hashes de sesión viven en D1. El hash de la contraseña es un secreto del Worker. Las sesiones son cookies HttpOnly. No se guardan direcciones de visitantes.",
    "Blog und Vorschlagsseite sind die Ausnahme. Beiträge, Vorschläge und Session-Hashes liegen in D1. Der Passwort-Hash ist ein Worker-Secret. Sitzungen sind HttpOnly-Cookies. Besucheradressen werden nicht gespeichert.",
    "Le blog et la page de suggestions sont l'exception. Les billets, les suggestions et les empreintes de session vivent dans D1. L'empreinte du mot de passe est un secret du Worker. Les sessions sont des cookies HttpOnly. Les adresses des visiteurs ne sont pas stockées.",
  ],
  [
    "Licenses, marks, and the music player are on the legal page.",
    "Las licencias, las marcas y el reproductor de música están en la página legal.",
    "Lizenzen, Marken und der Musikplayer stehen auf der Rechtsseite.",
    "Les licences, les marques et le lecteur de musique sont sur la page des mentions.",
  ],
  [
    "The homelab is where Docker and Cloudflare Tunnels live, on a Raspberry Pi and on the STEM Mac Mini while that apprenticeship ran. I did not put Kubernetes in front of these pages. Naming a cluster here would not make the site safer. Terraform for the DNS zone can come later, against the real zone, not as a diagram.",
    "El homelab es donde viven Docker y Cloudflare Tunnels, en una Raspberry Pi y en la Mac Mini de STEM mientras corrió ese aprendizaje. No puse Kubernetes delante de estas páginas. Nombrar un clúster aquí no haría el sitio más seguro. Terraform para la zona DNS puede llegar después, contra la zona real, no como un diagrama.",
    "Das Homelab ist der Ort von Docker und Cloudflare Tunnels, auf einem Raspberry Pi und auf dem STEM Mac Mini, solange die Ausbildung lief. Ich habe Kubernetes nicht vor diese Seiten gestellt. Einen Cluster hier zu benennen würde die Seite nicht sicherer machen. Terraform für die DNS-Zone kann später kommen, gegen die echte Zone, nicht als Diagramm.",
    "Le homelab est là où vivent Docker et Cloudflare Tunnels, sur un Raspberry Pi et sur le Mac Mini de STEM pendant cet apprentissage. Je n'ai pas mis Kubernetes devant ces pages. Nommer un cluster ici ne rendrait pas le site plus sûr. Terraform pour la zone DNS peut venir plus tard, contre la vraie zone, pas comme un schéma.",
  ],
  [
    "Scripts and styles are same-origin. The window font is Pixelated MS Sans Serif by lou on Fontstruct, shipped under CC BY-SA 3.0 with 98.css. It is not loaded from a third party. The only cookie is the editor session, and only after login. scripts/check.sh typechecks, runs the tests, and greps the build for the defaults I do not want shipped.",
    "Los scripts y los estilos son del mismo origen. La fuente de las ventanas es Pixelated MS Sans Serif, de lou en Fontstruct, enviada bajo CC BY-SA 3.0 con 98.css. No se carga de un tercero. La única cookie es la sesión del editor, y solo después de entrar. scripts/check.sh revisa tipos, corre las pruebas y busca en el build los defaults que no quiero publicar.",
    "Skripte und Styles sind same-origin. Die Fenster-Schrift ist Pixelated MS Sans Serif von lou auf Fontstruct, mit 98.css unter CC BY-SA 3.0 ausgeliefert. Sie wird nicht von einem Dritten geladen. Das einzige Cookie ist die Editor-Sitzung, und nur nach dem Login. scripts/check.sh prüft Typen, führt die Tests aus und sucht im Build nach Defaults, die ich nicht ausliefern will.",
    "Les scripts et les styles sont de même origine. La police des fenêtres est Pixelated MS Sans Serif par lou sur Fontstruct, livrée sous CC BY-SA 3.0 avec 98.css. Elle n'est pas chargée depuis un tiers. Le seul cookie est la session de l'éditeur, et seulement après connexion. scripts/check.sh vérifie les types, lance les tests et cherche dans le build les défauts que je ne veux pas publier.",
  ],
  [
    "A coding agent drafted parts of this, and then the check script and I read it. That is the same habit as the rest of the work: the tool can type, the diff still has to be mine.",
    "Un agente de código redactó partes de esto, y luego el script de revisión y yo lo leímos. Es el mismo hábito que el resto del trabajo: la herramienta puede teclear, el diff todavía tiene que ser mío.",
    "Ein Coding-Agent hat Teile davon entworfen, und dann haben das Prüfskript und ich es gelesen. Das ist dieselbe Gewohnheit wie beim Rest der Arbeit: das Werkzeug kann tippen, der Diff muss trotzdem meiner sein.",
    "Un agent de code a rédigé des parties de ceci, puis le script de contrôle et moi l'avons lu. C'est la même habitude que le reste du travail: l'outil peut taper, le diff doit quand même être le mien.",
  ],
  ["Jingle Trouble", "Jingle Trouble", "Jingle Trouble", "Jingle Trouble"],
  ["Model files are code", "Los archivos de modelo son código", "Modelldateien sind Code", "Les fichiers de modèle sont du code"],
  ["Repository", "Repositorio", "Quelltext", "Dépôt"],
  ["Fork", "Fork", "Fork", "Fork"],
  ["Dataset", "Dataset", "Datensatz", "Jeu de données"],
  ["Note", "Nota", "Notiz", "Note"],
  ["Previous repo", "Repo anterior", "Voriges Repo", "Dépôt précédent"],
  ["Docker session notes", "Notas de la sesión de Docker", "Notizen zur Docker-Sitzung", "Notes de la séance Docker"],
  ["Filter projects", "Filtrar proyectos", "Projekte filtern", "Filtrer les projets"],
  ["Command", "Comando", "Befehl", "Commande"],
  ["no such path. try `help`.", "no hay esa ruta. prueba `help`.", "kein solcher Pfad. versuch `help`.", "pas ce chemin. essaie `help`."],
  ["Loading posts.", "Cargando publicaciones.", "Beiträge werden geladen.", "Chargement des billets."],
  ["Loading login.", "Cargando la entrada.", "Anmeldung wird geladen.", "Chargement de la connexion."],
  ["Loading editor.", "Cargando el editor.", "Editor wird geladen.", "Chargement de l'éditeur."],
  ["The assistant is on the desktop.", "El asistente está en el escritorio.", "Der Assistent ist auf dem Schreibtisch.", "L'assistant est sur le bureau."],
  ["Close", "Cerrar", "Schliessen", "Fermer"],
  ["Editor", "Editor", "Editor", "Éditeur"],
  ["Window", "Ventana", "Fenster", "Fenêtre"],
  ["Project", "Proyecto", "Projekt", "Projet"],
  ["Language", "Idioma", "Sprache", "Langue"],
  ["Starting PocketNugget", "Iniciando PocketNugget", "PocketNugget startet", "Démarrage de PocketNugget"],
  ["Loading the desktop.", "Cargando el escritorio.", "Schreibtisch wird geladen.", "Chargement du bureau."],
  ["Boot", "Arranque", "Start", "Démarrage"],
  ["Click to skip.", "Clic para saltar.", "Klick zum Überspringen.", "Clique pour passer."],
  ["Wallpaper", "Fondo", "Hintergrund", "Fond"],
  ["Sky", "Cielo", "Himmel", "Ciel"],
  ["Teal", "Verde azulado", "Petrol", "Sarcelle"],
  ["Clouds", "Nubes", "Wolken", "Nuages"],
  ["Navy", "Azul marino", "Marine", "Marine"],
  [
    "Files live in public/wallpapers. Sky is the photo. Teal and Clouds are the older drawings. This tab remembers the choice. It is not a cookie.",
    "Los archivos viven en public/wallpapers. Cielo es la foto. Verde azulado y Nubes son los dibujos viejos. Esta pestaña recuerda la elección. No es una cookie.",
    "Die Dateien liegen in public/wallpapers. Himmel ist das Foto. Petrol und Wolken sind die älteren Zeichnungen. Dieser Tab merkt sich die Wahl. Es ist kein Cookie.",
    "Les fichiers vivent dans public/wallpapers. Ciel est la photo. Sarcelle et Nuages sont les anciens dessins. Cet onglet retient le choix. Ce n'est pas un cookie.",
  ],
  [
    "Scans copied into this site. A year with no ranking in the record does not get one here.",
    "Escaneos copiados a este sitio. Un año sin lugar en el expediente no recibe uno aquí.",
    "Scans, die in diese Seite kopiert wurden. Ein Jahr ohne Platz in der Akte bekommt hier keinen.",
    "Scans copiés dans ce site. Une année sans rang dans le dossier n'en reçoit pas un ici.",
  ],
  [
    "Photos copied into this site from the local folder, so they load with the page.",
    "Fotos copiadas a este sitio desde la carpeta local, para que carguen con la página.",
    "Fotos, die aus dem lokalen Ordner in diese Seite kopiert wurden, damit sie mit der Seite laden.",
    "Photos copiées dans ce site depuis le dossier local, pour qu'elles chargent avec la page.",
  ],
  [
    "The same record as the rest of the site, told in short lines.",
    "El mismo expediente que el resto del sitio, en líneas cortas.",
    "Dieselbe Akte wie der Rest der Seite, in kurzen Zeilen.",
    "Le même dossier que le reste du site, en lignes courtes.",
  ],
  ["1 file.", "1 archivo.", "1 Datei.", "1 fichier."],
  ["N files.", "N archivos.", "N Dateien.", "N fichiers."],
  ["Previous", "Anterior", "Zurück", "Précédent"],
  ["Thumbnails", "Miniaturas", "Vorschaubilder", "Vignettes"],
  ["Portrait", "Retrato", "Porträt", "Portrait"],
  ["Docker session", "Sesión de Docker", "Docker-Sitzung", "Séance Docker"],
  ["Paper talk", "Charla del paper", "Paper-Vortrag", "Exposé du papier"],
  ["Paper and certificate", "Paper y certificado", "Paper und Zertifikat", "Papier et certificat"],
  ["MICAI publication", "Publicación MICAI", "MICAI-Veröffentlichung", "Publication MICAI"],
  ["OK", "OK", "OK", "OK"],
  ["No match.", "Sin coincidencias.", "Kein Treffer.", "Aucun résultat."],
  ["Sides", "Caras", "Seiten", "Faces"],
  ["Roll", "Tirar", "Würfeln", "Lancer"],
  ["heads", "cara", "Kopf", "face"],
  ["tails", "cruz", "Zahl", "pile"],
  ["Names, one on each line", "Nombres, uno por línea", "Namen, einer pro Zeile", "Noms, un par ligne"],
  ["One name on each line", "Un nombre por línea", "Ein Name pro Zeile", "Un nom par ligne"],
  ["Spin", "Girar", "Drehen", "Tourner"],
  ["Add names, then spin.", "Agrega nombres y luego gira.", "Namen eintragen, dann drehen.", "Ajoute des noms, puis tourne."],
  ["Add a name on each line.", "Agrega un nombre en cada línea.", "Trag einen Namen pro Zeile ein.", "Ajoute un nom sur chaque ligne."],
  ["Flag", "Bandera", "Flagge", "Drapeau"],
  ["New", "Nuevo", "Neu", "Nouveau"],
  ["Mines", "Minas", "Minen", "Mines"],
  ["Clear.", "Limpio.", "Frei.", "Dégagé."],
  ["Open a cell. Flag marks a guess.", "Abre una celda. La bandera marca una suposición.", "Öffne eine Zelle. Die Flagge markiert eine Vermutung.", "Ouvre une case. Le drapeau marque une hypothèse."],
  ["A mine. New starts again.", "Una mina. Nuevo empieza otra vez.", "Eine Mine. Neu fängt wieder an.", "Une mine. Nouveau recommence."],
  ["Name", "Nombre", "Name", "Nom"],
  ["Suggestion", "Sugerencia", "Vorschlag", "Suggestion"],
  ["leave suggestion", "dejar sugerencia", "Vorschlag lassen", "laisser une suggestion"],
  [
    "Leave a suggestion. It stays on this page, and I can read it in the editor.",
    "Deja una sugerencia. Se queda en esta página, y yo puedo leerla en el editor.",
    "Lass einen Vorschlag. Er bleibt auf dieser Seite, und ich kann ihn im Editor lesen.",
    "Laisse une suggestion. Elle reste sur cette page, et je peux la lire dans l'éditeur.",
  ],
  ["The suggestions did not load.", "Las sugerencias no cargaron.", "Die Vorschläge wurden nicht geladen.", "Les suggestions n'ont pas chargé."],
  ["The suggestion did not save.", "La sugerencia no se guardó.", "Der Vorschlag wurde nicht gespeichert.", "La suggestion n'a pas été enregistrée."],
  ["Saved.", "Guardado.", "Gespeichert.", "Enregistré."],
  ["too many suggestions. try later.", "demasiadas sugerencias. intenta después.", "zu viele Vorschläge. versuch es später.", "trop de suggestions. réessaie plus tard."],
  ["No suggestions yet.", "Todavía no hay sugerencias.", "Noch keine Vorschläge.", "Pas encore de suggestions."],
  ["Operation", "Operación", "Operation", "Opération"],
  ["Process", "Procesar", "Verarbeiten", "Traiter"],
  ["Input", "Entrada", "Eingabe", "Entrée"],
  ["Output", "Salida", "Ausgabe", "Sortie"],
  ["Runs in this page. Nothing is uploaded.", "Corre en esta página. No se sube nada.", "Läuft in dieser Seite. Nichts wird hochgeladen.", "Tourne dans cette page. Rien n'est envoyé."],
  ["Base64 encode", "Codificar Base64", "Base64 kodieren", "Encoder en Base64"],
  ["Base64 decode", "Decodificar Base64", "Base64 dekodieren", "Décoder le Base64"],
  ["Hex encode", "Codificar hex", "Hex kodieren", "Encoder en hex"],
  ["Hex decode", "Decodificar hex", "Hex dekodieren", "Décoder l'hex"],
  ["URL encode", "Codificar URL", "URL kodieren", "Encoder l'URL"],
  ["URL decode", "Decodificar URL", "URL dekodieren", "Décoder l'URL"],
  ["Text to binary", "Texto a binario", "Text nach binär", "Texte vers binaire"],
  ["KB to bytes (1024)", "KB a bytes (1024)", "KB nach Bytes (1024)", "Ko vers octets (1024)"],
  ["MB to bytes (1024)", "MB a bytes (1024)", "MB nach Bytes (1024)", "Mo vers octets (1024)"],
  ["GB to bytes (1024)", "GB a bytes (1024)", "GB nach Bytes (1024)", "Go vers octets (1024)"],
  ["bytes to KB (1024)", "bytes a KB (1024)", "Bytes nach KB (1024)", "octets vers Ko (1024)"],
  ["bytes to MB (1024)", "bytes a MB (1024)", "Bytes nach MB (1024)", "octets vers Mo (1024)"],
  ["bytes to GB (1024)", "bytes a GB (1024)", "Bytes nach GB (1024)", "octets vers Go (1024)"],
  ["error: enter a number.", "error: escribe un número.", "Fehler: gib eine Zahl ein.", "erreur: entre un nombre."],
  ["error: unknown operation.", "error: operación desconocida.", "Fehler: unbekannte Operation.", "erreur: opération inconnue."],
  ["error: input is longer than 20000 characters.", "error: la entrada pasa de 20000 caracteres.", "Fehler: die Eingabe ist länger als 20000 Zeichen.", "erreur: l'entrée dépasse 20000 caractères."],
  ["error: that input could not be decoded.", "error: esa entrada no se pudo decodificar.", "Fehler: die Eingabe liess sich nicht dekodieren.", "erreur: cette entrée n'a pas pu être décodée."],
  ["A fake hack. It messes up the colors on this page until you hit Reset. It does not touch files, accounts, or the network.", "Un hack falso. Desordena los colores de esta página hasta que pulses Reiniciar. No toca archivos, cuentas ni la red.", "Ein falscher Hack. Er verdirbt die Farben auf dieser Seite, bis du Zurücksetzen drückst. Er fasst keine Dateien, Konten oder das Netz an.", "Un faux hack. Il abîme les couleurs de cette page jusqu'à ce que tu appuies sur Réinitialiser. Il ne touche ni fichiers, ni comptes, ni le réseau."],
  ["Hackear el sistema", "Hackear el sistema", "Das System hacken", "Pirater le système"],
  ["Reset", "Reiniciar", "Zurücksetzen", "Réinitialiser"],
  ["Reset. The desktop is the same as before.", "Reinicio. El escritorio está igual que antes.", "Zurückgesetzt. Der Schreibtisch ist wie vorher.", "Réinitialisé. Le bureau est comme avant."],
  ["Connecting to the mainframe...", "Conectando al mainframe...", "Verbindung zum Mainframe...", "Connexion au mainframe..."],
  ["The mainframe is a folder of HTML.", "El mainframe es una carpeta de HTML.", "Der Mainframe ist ein Ordner voller HTML.", "Le mainframe est un dossier de HTML."],
  ["Bypassing the screensaver...", "Saltando el salvapantallas...", "Bildschirmschoner wird umgangen...", "Contournement de l'économiseur..."],
  ["The screensaver was a cloud.", "El salvapantallas era una nube.", "Der Bildschirmschoner war eine Wolke.", "L'économiseur était un nuage."],
  ["Reading the shift notes...", "Leyendo las notas del turno...", "Schichtnotizen werden gelesen...", "Lecture des notes de shift..."],
  ["Splashing the wrong colors on the icons...", "Echando los colores equivocados sobre los iconos...", "Die falschen Farben landen auf den Icons...", "Les mauvaises couleurs éclaboussent les icônes..."],
  ["The labels came back half eaten.", "Las etiquetas volvieron a medias, mordidas.", "Die Beschriftungen kamen halb angefressen zurück.", "Les étiquettes sont revenues à moitié mangées."],
  ["Done. The desk stays messy until you hit Reset.", "Listo. El escritorio se queda sucio hasta que pulses Reiniciar.", "Fertig. Der Schreibtisch bleibt kaputt, bis du Zurücksetzen drückst.", "Fini. Le bureau reste en désordre jusqu'à ce que tu appuies sur Réinitialiser."],
  ["Nothing left this page. Files, accounts, and the network were never touched.", "Nada salió de esta página. Archivos, cuentas y la red no se tocaron.", "Nichts hat diese Seite verlassen. Dateien, Konten und das Netz wurden nie angefasst.", "Rien n'a quitté cette page. Fichiers, comptes et réseau n'ont pas été touchés."],
  ["Error", "Error", "Fehler", "Erreur"],
  ["KERNEL.DLL is a nugget. This is fine.", "KERNEL.DLL es un nugget. Esto está bien.", "KERNEL.DLL ist ein Nugget. Das ist in Ordnung.", "KERNEL.DLL est un nugget. Tout va bien."],
  ["Warning", "Aviso", "Warnung", "Avertissement"],
  ["nugget.exe asked for a raise. Denied, politely.", "nugget.exe pidió un aumento. Negado, con educación.", "nugget.exe hat eine Gehaltserhöhung verlangt. Abgelehnt, höflich.", "nugget.exe a demandé une augmentation. Refusée, poliment."],
  ["System", "Sistema", "System", "Système"],
  ["Access granted to the tie. The tie has no privileges.", "Acceso concedido a la corbata. La corbata no tiene privilegios.", "Zugriff für die Krawatte gewährt. Die Krawatte hat keine Rechte.", "Accès accordé à la cravate. La cravate n'a aucun privilège."],
  ["ICON.PAL ate its own colors.", "ICON.PAL se comió sus propios colores.", "ICON.PAL hat seine eigenen Farben gefressen.", "ICON.PAL a mangé ses propres couleurs."],
  ["The taskbar forgot which gray it was.", "La barra de tareas olvidó cuál era su gris.", "Die Taskleiste hat ihr Grau vergessen.", "La barre des tâches a oublié quel gris elle était."],
  ["name, school, where I am looking", "nombre, escuela, dónde busco", "Name, Schule, wohin ich schaue", "nom, école, où je cherche"],
  ["the same page as whoami", "la misma página que whoami", "dieselbe Seite wie whoami", "la même page que whoami"],
  ["TBSeK, STEM, T-Systems", "TBSeK, STEM y T-Systems", "TBSeK, STEM und T-Systems", "TBSeK, STEM et T-Systems"],
  ["the work I will actually talk about", "el trabajo del que sí voy a hablar", "die Arbeit, über die ich wirklich spreche", "le travail dont je vais vraiment parler"],
  ["a project, a note, or github, linkedin, email, x", "un proyecto, una nota, o github, linkedin, email, x", "ein Projekt, eine Notiz, oder github, linkedin, email, x", "un projet, une note, ou github, linkedin, email, x"],
  ["posts from the editor", "publicaciones del editor", "Beiträge aus dem Editor", "billets de l'éditeur"],
  ["email, GitHub, LinkedIn, X, Instagram, YouTube", "correo, GitHub, LinkedIn, X, Instagram, YouTube", "Mail, GitHub, LinkedIn, X, Instagram, YouTube", "mail, GitHub, LinkedIn, X, Instagram, YouTube"],
  ["two short notes, plus the writeup repo", "dos notas cortas, más el repo de writeups", "zwei kurze Notizen, plus das Writeup-Repo", "deux notes courtes, plus le dépôt de writeups"],
  ["HackRF, bladeRF, the iMac G4", "HackRF, bladeRF, la iMac G4", "HackRF, bladeRF, der iMac G4", "HackRF, bladeRF, l'iMac G4"],
  ["degree, HTB badges, languages, Security+ in progress", "título, insignias de HTB, idiomas, Security+ en curso", "Abschluss, HTB-Abzeichen, Sprachen, Security+ läuft", "diplôme, badges HTB, langues, Security+ en cours"],
  ["email, GitHub, LinkedIn, X", "correo, GitHub, LinkedIn, X", "Mail, GitHub, LinkedIn, X", "mail, GitHub, LinkedIn, X"],
  ["why this is a Worker, and what it stores", "por qué esto es un Worker, y qué guarda", "warum das ein Worker ist, und was er speichert", "pourquoi c'est un Worker, et ce qu'il stocke"],
  ["tools from the jobs, and languages", "herramientas de los empleos, e idiomas", "Werkzeuge aus den Jobs, und Sprachen", "outils des postes, et langues"],
  ["webdeck player. youtube, themes, the opening video", "reproductor webdeck. youtube, temas, el video de apertura", "Webdeck-Player. YouTube, Themen, das Eröffnungsvideo", "lecteur webdeck. youtube, thèmes, la vidéo d'ouverture"],
  ["photo gallery", "galería de fotos", "Fotogalerie", "galerie de photos"],
  ["certificate scans", "escaneos de certificados", "Zertifikat-Scans", "scans de certificats"],
  ["base64, hex, url, hashes, binary KB MB GB", "base64, hex, url, hashes, KB MB GB binarios", "base64, hex, url, Hashes, binäre KB MB GB", "base64, hex, url, empreintes, Ko Mo Go binaires"],
  ["licenses, marks, and the music player", "licencias, marcas y el reproductor", "Lizenzen, Marken und der Musikplayer", "licences, marques et le lecteur"],
  ["a small calculator", "una calculadora pequeña", "ein kleiner Rechner", "une petite calculatrice"],
  ["spin a list of names", "gira una lista de nombres", "dreht eine Namensliste", "tourne une liste de noms"],
  ["a grid of mines. flag or open", "una rejilla de minas. bandera o abrir", "ein Minenfeld. flaggen oder öffnen", "une grille de mines. drapeau ou ouvrir"],
  ["short facts and the other tools", "datos cortos y las otras herramientas", "kurze Fakten und die anderen Werkzeuge", "faits courts et les autres outils"],
  ["a fake hack that resets", "un hack falso que se reinicia", "ein falscher Hack, der zurücksetzt", "un faux hack qui se réinitialise"],
  ["the nugget assistant", "el asistente nugget", "der Nugget-Assistent", "l'assistant nugget"],
  ["open a command", "abre un comando", "öffnet einen Befehl", "ouvre une commande"],
  ["search the profile text", "busca en el texto del perfil", "sucht im Profiltext", "cherche dans le texte du profil"],
  ["a public page for suggestions. they show in the editor", "una página pública de sugerencias. se ven en el editor", "eine öffentliche Seite für Vorschläge. sie erscheinen im Editor", "une page publique pour des suggestions. elles apparaissent dans l'éditeur"],
  ["dark board, arrows, esc to leave", "tablero oscuro, flechas, esc para salir", "dunkles Brett, Pfeile, Esc zum Verlassen", "plateau sombre, flèches, esc pour sortir"],
  ["dark board, arrows, space drops, esc to leave", "tablero oscuro, flechas, espacio suelta, esc para salir", "dunkles Brett, Pfeile, Leertaste lässt fallen, Esc zum Verlassen", "plateau sombre, flèches, espace pose, esc pour sortir"],
  ["game over. esc leaves", "fin de la partida. esc sale", "Spiel vorbei. Esc beendet", "partie finie. esc quitte"],
  ["arrows move. esc leaves", "las flechas mueven. esc sale", "Pfeile bewegen. Esc beendet", "les flèches déplacent. esc quitte"],
  ["arrows, space drops, esc leaves", "flechas, espacio suelta, esc sale", "Pfeile, Leertaste fällt, Esc beendet", "flèches, espace pose, esc quitte"],
  ["Score", "Puntos", "Punkte", "Points"],
  ["Lines", "Líneas", "Linien", "Lignes"],
  ["paused", "en pausa", "Pause", "en pause"],
  ["clear the terminal", "limpia la terminal", "leert das Terminal", "efface le terminal"],
  ["leave a game, or close the terminal", "sal de un juego, o cierra la terminal", "verlässt ein Spiel, oder schliesst das Terminal", "quitte un jeu, ou ferme le terminal"],
  ["Hackztecs, 2024.", "Hackztecs, año 2024.", "Hackztecs, Jahr 2024.", "Hackztecs, année 2024."],
  ["Hackztecs, autumn 2024.", "Hackztecs, otoño de 2024.", "Hackztecs, Herbst 2024.", "Hackztecs, automne 2024."],
  ["Hackztecs, spring 2026.", "Hackztecs, primavera de 2026.", "Hackztecs, Frühling 2026.", "Hackztecs, printemps 2026."],
  ["Docker session at STEM UDLAP. Build a container, then bring Compose up.", "Sesión de Docker en STEM UDLAP. Arma un contenedor y luego levanta Compose.", "Docker-Sitzung bei STEM UDLAP. Baue einen Container, dann fahre Compose hoch.", "Séance Docker à STEM UDLAP. Construis un conteneur, puis lance Compose."],
  ["HackMexico with AngelHack, 2024.", "HackMexico con AngelHack, 2024.", "HackMexico mit AngelHack, 2024.", "HackMexico avec AngelHack, 2024."],
  ["Presenting the MICAI 2024 paper.", "Presentando el paper de MICAI 2024.", "Vortrag zum MICAI-2024-Paper.", "Présentation du papier MICAI 2024."],
  ["MICAI 2024 presentation, certificate in hand. Springer LNCS 15246.", "Presentación de MICAI 2024, certificado en mano. Springer LNCS 15246.", "MICAI-2024-Vortrag, Zertifikat in der Hand. Springer LNCS 15246.", "Présentation MICAI 2024, certificat en main. Springer LNCS 15246."],
  [
    "MAIA, November 2024. Team Los Zepedas, first of 22 on the ÖBB challenge. The prize was a trip to Austria.",
    "MAIA, noviembre de 2024. Equipo Los Zepedas, primero de 22 en el reto de ÖBB. El premio fue un viaje a Austria.",
    "MAIA, im November 2024. Team Los Zepedas, erster von 22 bei der ÖBB-Challenge. Der Preis war eine Reise nach Österreich.",
    "MAIA, novembre 2024. Équipe Los Zepedas, première de 22 au défi ÖBB. Le prix était un voyage en Autriche.",
  ],
  [
    "ColorScore, November 2025. First place, Enactus Changemakers. Team Xcookers.",
    "ColorScore, noviembre de 2025. Primer lugar, Enactus Changemakers. Equipo Xcookers.",
    "ColorScore, im November 2025. Erster Platz, Enactus Changemakers. Team Xcookers.",
    "ColorScore, novembre 2025. Première place, Enactus Changemakers. Équipe Xcookers.",
  ],
  [
    "HTB University CTF 2025, Jingle Trouble. Hackztecs finished 52 of 1,014.",
    "HTB University CTF 2025, Jingle Trouble. Hackztecs quedó 52 de 1,014.",
    "HTB University CTF 2025, Jingle Trouble. Hackztecs wurde 52 von 1,014.",
    "HTB University CTF 2025, Jingle Trouble. Hackztecs a fini 52e sur 1,014.",
  ],
  [
    "HTB Cyber Apocalypse CTF 2025. 51 of 77 challenges, 34,125 points, rank 293.",
    "HTB Cyber Apocalypse CTF 2025. 51 de 77 retos, 34,125 puntos, lugar 293.",
    "HTB Cyber Apocalypse CTF 2025. 51 von 77 Challenges, 34,125 Punkte, Platz 293.",
    "HTB Cyber Apocalypse CTF 2025. 51 défis sur 77, 34,125 points, rang 293.",
  ],
  [
    "HTB Cyber Apocalypse CTF 2024 certificate. The 2024 score is not listed on this site.",
    "Certificado de HTB Cyber Apocalypse CTF 2024. La puntuación de 2024 no está en este sitio.",
    "Zertifikat HTB Cyber Apocalypse CTF 2024. Die Punktzahl von 2024 steht nicht auf dieser Seite.",
    "Certificat HTB Cyber Apocalypse CTF 2024. Le score de 2024 n'est pas sur ce site.",
  ],
  ["HTB University CTF 2024 certificate.", "Certificado de HTB University CTF 2024.", "Zertifikat HTB University CTF 2024.", "Certificat HTB University CTF 2024."],
  ["HTB University CTF 2023 certificate.", "Certificado de HTB University CTF 2023.", "Zertifikat HTB University CTF 2023.", "Certificat HTB University CTF 2023."],
  [
    "Publication certificate for the MICAI 2024 paper. Springer LNCS 15246, pages 198 to 209.",
    "Certificado de publicación del paper de MICAI 2024. Springer LNCS 15246, páginas 198 a 209.",
    "Veröffentlichungszertifikat für das MICAI-2024-Paper. Springer LNCS 15246, Seiten 198 bis 209.",
    "Certificat de publication du papier MICAI 2024. Springer LNCS 15246, pages 198 à 209.",
  ],
  ["MICAI 2024 presentation, certificate in hand.", "Presentación de MICAI 2024, certificado en mano.", "MICAI-2024-Vortrag, Zertifikat in der Hand.", "Présentation MICAI 2024, certificat en main."],
  ["MAIA, November 2024. First of 22 teams on the ÖBB challenge.", "MAIA, noviembre de 2024. Primero de 22 equipos en el reto de ÖBB.", "MAIA, im November 2024. Erster von 22 Teams bei der ÖBB-Challenge.", "MAIA, novembre 2024. Première de 22 équipes au défi ÖBB."],
  [
    "ColorScore, November 2025. First place at the Enactus Changemakers challenge.",
    "ColorScore, noviembre de 2025. Primer lugar en el reto Enactus Changemakers.",
    "ColorScore, im November 2025. Erster Platz bei der Enactus-Changemakers-Challenge.",
    "ColorScore, novembre 2025. Première place au défi Enactus Changemakers.",
  ],
];

const noteRows: readonly (readonly [string, string, string, string])[] = [
  [
    jingle.replace(/\s+$/, ""),
    `# Jingle Trouble

Hack The Box University CTF 2025 se llamó Jingle Trouble. Hackztecs quedó 52 de 1,014 equipos. Eso puso a la UDLAP en el top 5%, y fue la única universidad mexicana en el top 100. Fue mi primer top 100 en un University CTF.

Lo presenté con Georgina Zerón, Natalia María Caballero Garza, Daniel Martínez Maimone, Juan Francisco Cruz Baquedano y Juan Pablo Morales Durante. Juan Pablo había sido presidente antes que yo. Él es la razón por la que empecé a tomar este trabajo en serio.

El tablero fue web, red y forense. Burp Suite y Ghidra se quedaron abiertos. No publico las soluciones. El marcador es la parte pública.

El otro resultado de HTB con el que la gente mezcla este es Cyber Apocalypse 2025: 51 de 77 retos, 34,125 puntos, lugar 293, tercero en México. Otro fin de semana, otro tablero.`,
    `# Jingle Trouble

Hack The Box University CTF 2025 hiess Jingle Trouble. Hackztecs wurde 52 von 1,014 Teams. Das brachte die UDLAP in die Top 5%, und sie war die einzige mexikanische Universität in den Top 100. Es war mein erstes Top 100 bei einem University CTF.

Ich sass es mit Georgina Zerón, Natalia María Caballero Garza, Daniel Martínez Maimone, Juan Francisco Cruz Baquedano und Juan Pablo Morales Durante. Juan Pablo war Präsident vor mir. Er ist der Grund, warum ich diese Arbeit ernst genommen habe.

Das Board war Web, Netzwerk und Forensik. Burp Suite und Ghidra blieben offen. Ich poste die Solves nicht. Die Rangliste ist der öffentliche Teil.

Das andere HTB-Ergebnis, mit dem Leute das verwechseln, ist Cyber Apocalypse 2025: 51 von 77 Challenges, 34,125 Punkte, Platz 293, 3. in Mexiko. Anderes Wochenende, anderes Board.`,
    `# Jingle Trouble

Hack The Box University CTF 2025 s'appelait Jingle Trouble. Hackztecs a fini 52e sur 1,014 équipes. Cela a mis l'UDLAP dans le top 5%, et c'était la seule université mexicaine dans le top 100. C'était mon premier top 100 à un University CTF.

Je l'ai fait avec Georgina Zerón, Natalia María Caballero Garza, Daniel Martínez Maimone, Juan Francisco Cruz Baquedano et Juan Pablo Morales Durante. Juan Pablo avait été président avant moi. C'est lui qui m'a fait prendre ce travail au sérieux.

Le tableau était web, réseau et forensique. Burp Suite et Ghidra sont restés ouverts. Je ne publie pas les solves. Le classement est la partie publique.

L'autre résultat HTB avec lequel les gens mélangent celui-ci est Cyber Apocalypse 2025: 51 défis sur 77, 34,125 points, rang 293, 3e au Mexique. Un autre week-end, un autre tableau.`,
  ],
  [
    models.replace(/\s+$/, ""),
    `# Los archivos de modelo son código

En CONISOFT 2025 en La Paz, la Dra. Zobeida Guzmán y yo dimos un taller que llamamos "Models under attack." Buena parte de la sala envía un archivo \`.pt\` como quien envía un zip.

La documentación de Python dice que el módulo pickle no es seguro, y que solo debes abrir datos en los que confías. Un \`.pkl\`, \`.pt\` o \`.pth\` puede ejecutar código cuando lo cargas. Alguien publica un modelo, llamas al cargador, y estás corriendo su programa. Ese es el fallo. No es sutil.

Los arreglos en los que pasamos la hora son aburridos a propósito.

- Prefiere SafeTensors. El archivo es un encabezado más los pesos, no un flujo pickle.
- Si hay que abrir un checkpoint viejo, ábrelo en un contenedor o una VM que puedas tirar, sin credenciales y sin el directorio home montado.

Nos detuvimos en la ruta de carga. Con eso basta para dejar de tratar una descarga como si fueran datos.`,
    `# Modelldateien sind Code

Bei CONISOFT 2025 in La Paz haben Dr. Zobeida Guzmán und ich einen Workshop gegeben, den wir "Models under attack." nannten. Ein grosser Teil des Raums verschickt eine \`.pt\`-Datei so, wie man ein Zip verschickt.

Pythons Doku sagt, das Modul pickle ist nicht sicher, und dass du nur Daten öffnen sollst, denen du vertraust. Eine \`.pkl\`, \`.pt\` oder \`.pth\` kann Code ausführen, wenn du sie lädst. Jemand veröffentlicht ein Modell, du rufst den Lader auf, und du führst sein Programm aus. Das ist der Fehler. Er ist nicht subtil.

Die Abhilfen, für die wir die Stunde nutzten, sind absichtlich langweilig.

- Nimm SafeTensors. Die Datei ist ein Header plus Gewichte, kein Pickle-Strom.
- Wenn ein alter Checkpoint geöffnet werden muss, öffne ihn in einem Container oder einer VM, die du wegwerfen kannst, ohne Zugangsdaten und ohne eingehängtes Home-Verzeichnis.

Wir hörten beim Ladepfad auf. Das reicht, um einen Download nicht mehr als Daten zu behandeln.`,
    `# Les fichiers de modèle sont du code

À CONISOFT 2025 à La Paz, la Dre Zobeida Guzmán et moi avons donné un atelier que nous avons appelé "Models under attack." Une bonne part de la salle envoie un fichier \`.pt\` comme on envoie un zip.

La doc de Python dit que le module pickle n'est pas sûr, et que tu ne dois ouvrir que des données auxquelles tu fais confiance. Un \`.pkl\`, \`.pt\` ou \`.pth\` peut exécuter du code quand tu le charges. Quelqu'un publie un modèle, tu appelles le chargeur, et tu exécutes son programme. C'est le bug. Il n'est pas subtil.

Les correctifs sur lesquels nous avons passé l'heure sont ennuyeux exprès.

- Préfère SafeTensors. Le fichier est un en-tête plus les poids, pas un flux pickle.
- S'il faut ouvrir un ancien checkpoint, ouvre-le dans un conteneur ou une VM que tu peux jeter, sans identifiants et sans répertoire home monté.

Nous nous sommes arrêtés au chemin de chargement. Cela suffit pour cesser de traiter un téléchargement comme des données.`,
  ],
];

function pack(index: 1 | 2 | 3): Record<string, string> {
  const out: Record<string, string> = {};
  for (const row of [...rows, ...noteRows]) {
    const key = row[0];
    if (out[key]) throw new Error(`duplicate i18n key: ${key.slice(0, 48)}`);
    out[key] = row[index];
  }
  return out;
}

export const extraEs: Record<string, string> = pack(1);
export const extraDe: Record<string, string> = pack(2);
export const extraFr: Record<string, string> = pack(3);
