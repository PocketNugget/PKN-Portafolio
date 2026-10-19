# Investigación de mercado (Fase 1)

Fecha: 2026-10-19. Rama: `recruiter-ux-v2`.

## Límites de esta investigación (leer primero)

- El buscador disponible es una búsqueda web pública, sin login, que devuelve fragmentos. LinkedIn Jobs, Indeed México, Computrabajo y OCC **no devolvieron páginas de vacante legibles**; RemoteOK solo devolvió perfiles de candidatos. No pude abrir 40 ofertas una por una.
- Lo que sí hay: unas 20 vacantes reales con requisitos legibles (Rapid7, Kudelski, GoSecure, MakingSense, Insight Global, EncryptEdge, GlobalLogic, EPAM, T-Systems México, OCDTECH, Redscan, ofertas de Polonia, Países Bajos y Filipinas) más guías y encuestas. **No alcancé la cifra de 40 ofertas analizadas.** Las tendencias de abajo son una muestra pequeña, no una estadística.
- Perfiles reales de LinkedIn/GitHub de gente contratada como junior: solo encontré ejemplos autopublicados sin verificar (un CV universitario, una publicación de LinkedIn, un perfil de web3.career). No los uso como evidencia fuerte.
- Portafolios destacados: encontré plantillas de escritorio retro (Framer: RetroOS, PixelOS, Retro'98), un portafolio abierto (OASIS, GitHub) y un caso hecho a medida (PORTFOLIO.OS). **No llegué a 10-15 portafolios analizados.**
- Nada de esto lo marco como probado. Donde dice "inferencia", es mía.

## 1. Lo que piden las vacantes (muestra pequeña)

### SOC / MDR (nivel 1, 0 a 2 años)
- Rapid7 Associate MDR y Detection & Response Analyst: 0 a 2 años, Windows y Linux, tácticas de atacante (movimiento lateral, persistencia). Preferidos: GFACT, GSEC, GCIA, GCIH, CySA+, CASP+, Security+. Valoran scripting, CTFs y práctica en HackTheBox, TryHackMe y LetsDefend. Turnos 4:3 tras 90 días de capacitación. Usan su SIEM propio, no Splunk. Fuente: [Rapid7](https://careers.rapid7.com/jobs/associate-managed-detection-response-mdr-analyst-arlington-va-united-states-c4c2a92c-e2a4-47c9-9fcd-8b5301e62680), [Built In](https://builtin.com/job/associate-managed-detection-response-mdr-analyst/3601122).
- Kudelski Security Tier 1: triage de alertas de SIEM, EDR, firewalls, IDS/IPS y AV; escalar a Tier 2; ajuste de reglas; guardias. Sin certificación nombrada. Fuente: [JobScout24](https://jobscout24.ch/de/job/security-analyst-tier/115981137).
- SOC junior remoto de proveedor gestionado (Redscan): equipo propio, buena conexión, inglés hablado y escrito muy sólido. Fuente: [Redscan](https://www.redscan.com/career/junior-soc-analyst/).
- Ofertas junior de Polonia y Países Bajos: inglés B1, análisis de logs, DNS/DHCP/TCP-IP, Windows y Linux; SIEM y EDR "deseable"; experiencia en prácticas, laboratorios o proyectos propios; 0 a 2 años. Fuentes: [JustJoin](https://justjoin.it/job-offer/upvanta-sp-z-o-o--junior-soc-analyst-poznan-security), [SecurityTalent](https://securitytalent.nl/jobs-internships/junior-soc-analyst1).
- SOC junior remoto en México (T-Systems México): 0 a 2 años en soporte, mesa de ayuda o seguridad; inglés intermedio; entrevista en inglés; sueldo publicado de 18,000 a 20,000 MXN al mes. Fuente: [resultados de Indeed MX / listado](https://mx.indeed.com/q-xsoar-empleos.html) (fragmento, sin abrir la vacante completa).
- Splunk (Enterprise Security) aparece como SIEM más repetido en SOC de EE. UU. y México; CrowdStrike como EDR "preferido". Fuentes: [Clemson/Cognizant](https://career.clemson.edu/jobs/cognizant-security-operations-center-soc-analyst/), [Virtual Vocations](https://www.virtualvocations.com/job/junior-soc-security-engineer-3130698-i.html).
- Muchas vacantes remotas de EE. UU. exigen ciudadanía o autorización; la de [General Dynamics](https://gd.com/careers/cybersecurity-soc-analyst-telework-telework-us-2026-70456-gdms-opportunity) la pide. Eso aplica a Diego solo si busca ese mercado (pregunta abierta en `positioning.md`).
- Etiquetas "junior" con 2 a 3+ años pedidos son comunes (EPAM, OCDTECH, GoSecure, Qureos). Es normal postular igual con 1.5 años de experiencia real.

### Cloud security / DevSecOps
- Insight Global Jr. Security Engineer remoto: Python, AWS preferido (Azure o GCP aceptables), familiaridad con Terraform, redes. Fuente: [JobsInGovernment](https://www.jobsingovernment.com/job/1260006/remote-jr-security-engineer/).
- EncryptEdge (pasantía remota): IAM, cifrado, seguridad de red y monitoreo en AWS, Azure y GCP, sin certificación previa. Fuente: [Remotive](https://remotive.com/remote/jobs/all-others/junior-cloud-security-engineer-internship-5758494).
- AWS Cloud Practitioner solo apareció como requisito en un puesto de contratista de gobierno con 4+ años ([ManTech](https://jobs.inuplands.org/companies/mantech/jobs/68105583-aws-cloud-security-engineer)).
- DevSecOps junior remoto en México/LATAM: no encontré ninguno; los de México son senior (Monterrey, Guadalajara) y piden Terraform, AWS, GitHub Enterprise, CI/CD y SAST/SCA. Fuentes: [Cazvid](https://cazvid.com/en/job/devsecops-senior-engineer-monterrey-mexico-00f828), [EPAM](https://careers.epam.com/en/vacancy/senior-devops-engineer-bltszuw9pl9c0o1nz7h_en).

### DevOps / SRE
- MakingSense (Argentina, remoto, junior): sin experiencia previa; AWS y Terraform básicos, GitLab Runners o GitHub Actions, Docker básico, Kubernetes opcional. Fuente: [MakingSense](https://makingsense.hiringroom.com/jobs/get_vacancy/68347068fa6e7c5e97574f66).
- GlobalLogic Jr. Software Engineer (México, remoto, 1 a 3 años): AWS, bash, Docker, Git, Helm, Kubernetes, Linux, Python; IaC y CI/CD de apoyo. Fuente: [GlobalLogic](https://globallogic.com/?p=101430).
- Moovx, 10Pearls, EX Squared, Strider (LATAM, no junior): Docker, Kubernetes, Terraform o CloudFormation, CI/CD, logs, inglés avanzado.
- SRE junior-mid: Linux, un lenguaje de scripting (Python, Go o Bash), SLI/SLO y observabilidad, AWS preferido. Fuentes: [Uptrace](https://uptrace.dev/blog/sre-engineer-career), [DevOps/SRE Hub](https://resumegeni.com/blog/sre-engineer/junior).

### Desarrollo de software
- Los puestos remotos de TypeScript/Node en LATAM que aparecieron son semi-senior o senior (3 a 5+ años), con inglés explícito (B2+ o "advanced"). Fuentes: [Workana](https://apply.workable.com/workana-premium/jobs/view/1ED5AFA6E6.md), [Ruzora/GetOnBoard](https://www.getonbrd.com/jobs/senior-fullstack-typescript-engineer-ruzora-remote), [DaCodes](https://apply.workable.com/dacodes-mx/jobs/view/F9FFF1826E.md). No vi una vacante junior de TypeScript que sirva de referencia; la ruta de desarrollo parece la más difícil de lograr sin experiencia profesional en producto.

## 2. Palabras clave de ATS que se repiten (de la muestra)

| Rol | Palabras |
|---|---|
| SOC / MDR | alert triage, SIEM, Splunk, EDR, CrowdStrike, incident response, escalation, false positives, log analysis, threat detection, MITRE ATT&CK, playbooks, Windows, Linux, TCP/IP, DNS, shift work, CTF, TryHackMe, Hack The Box |
| Cloud security | IAM, AWS, logging, encryption, Python, Terraform, least privilege |
| DevOps / SRE | Linux, Docker, Kubernetes, Terraform, CI/CD, GitHub Actions, GitLab, AWS, Python, bash, observability, SLO, runbooks, Helm |
| Software | TypeScript, Node.js, React, REST, Git, AWS, SQL, testing |

"MITRE ATT&CK" aparece en las guías y vacantes de MDR pero **no aparece en el sitio ni en las fuentes de Diego**: va a la lista de preguntas, no al sitio.

## 3. Certificaciones

- Security+ aparece como "preferido" en MDR (Rapid7) y como la primera que recomiendan las guías para entrar; en la muestra no apareció como requisito duro en ofertas junior remotas. CySA+ aparece junto a ella.
- [ISC2 2025 Hiring Trends](https://www.isc2.org/Insights/2025/06/ISC2-Research-Organizations-Must-Amend-Early-Career-Hiring-Practices) (929 gerentes de contratación, seis países, publicado el 11 de junio de 2025): 89% contrataría a un candidato junior con una certificación de nivel inicial y sin más experiencia; los gerentes priorizaron certificaciones (47%) y experiencia en TI (44%) sobre educación (43%). Cifras vistas vía cobertura secundaria: [Infosecurity Magazine](https://www.infosecurity-magazine.com/news/hands-on-skills-first-cyber-role/), [TechRepublic](https://www.techrepublic.com/article/news-cybersecurity-hiring-survey-isc2/). Es una muestra de seis países, no de México.
- AWS Cloud Practitioner, CKA y Terraform Associate: la muestra no basta para decir cuánto pesan en juniors. Las guías de DevOps ([freeCodeCamp](https://www.freecodecamp.org/news/how-to-land-your-first-cloud-or-devops-role-what-hiring-managers-actually-look-for/)) priorizan proyectos terminados sobre certificaciones.

## 4. Nivel de inglés
- Remoto internacional: "advanced" o B2+ explícito en software y DevOps; "very strong spoken and written" en MDR remoto de proveedor. México: "intermedio" con entrevista en inglés. Diego se declara C1+, que cumple con holgura. **Está en el hero.**

## 5. Qué valoran los reclutadores en un portafolio junior

- Evidencia práctica sobre credenciales sueltas, y comunicación clara: [TryHackMe, portafolio de ciberseguridad](https://tryhackme.com/resources/blog/how-to-build-a-cybersecurity-portfolio-that-gets-you-hired) (guía de proveedor, no encuesta; su cifra "7 de 10" no pude confirmarla y no la uso). Consejos: 1 o 2 writeups en GitHub sin datos sensibles, nombres claros para insignias y reportes, cerrar cada lab con un resumen de qué encontraste y por qué importa.
- Tareas típicas de nivel inicial según ISC2 (2022): monitoreo de alertas, documentar procesos, scripting, respuesta a incidentes, reportes. Fuente: [ISC2](https://www.isc2.org/Insights/2022/06/ISC2-Research-Finds-Employer-Hiring-Practices-Must-Evolve-to-Overcome-the-Workforce-Gap). Coincide con lo que Diego ya hace.
- DevOps: dos o tres proyectos terminados con URL viva, pipeline de CI/CD, infraestructura como código, monitoreo y README; un homelab con decisiones documentadas es buena señal; evitar tutoriales sin trabajo original, repos privados vagos y listas largas de herramientas sin profundidad. Fuentes: [freeCodeCamp](https://www.freecodecamp.org/news/how-to-land-your-first-cloud-or-devops-role-what-hiring-managers-actually-look-for/), [This Is An IT Support Group](https://thisisanitsupportgroup.com/blog/devops-engineer-jobs-how-to-get-hired-2026).
- Tiempo de lectura: el estudio de TheLadders (30 reclutadores, 2012) midió unos 6 segundos para el primer descarte; una repetición de 2018 dio unos 7.4; Jan Tegze (2023, 114 reclutadores) midió entre 17 y 46 segundos. Eso es sobre CVs, **no hay datos de seguimiento ocular para portafolios**. Fuentes: [Ragan](https://www.ragan.com/your-resume-has-6-seconds-to-impress-study-says/), [Standout CV](https://standout-cv.com/?p=4368). Lo que mira el ojo en ese estudio: nombre, puesto actual y empresa, puesto anterior, fechas, estudios. Es lo que el hero tiene que mostrar fijo.
- Reclutadores de TI: debe ser claro en menos de 2 segundos qué haces (consejo de un blog de reclutador, no estudio).

## 6. Portafolios con formato original
- Los escritorios retro (RetroOS, PixelOS, Retro'98 en Framer; OASIS en GitHub Pages) ya son un subgénero. Resuelven la ruta rápida con una ventana inicial y una barra de tareas como navegación. Fuentes: [RetroOS](https://www.framer.com/marketplace/templates/retroos), [Retro'98](https://framer.com/marketplace/template/retro-98), [OASIS](https://github.com/APURVA122/OASIS).
- Inferencia: el concepto "escritorio" ya no distingue por sí solo; lo que distingue es lo que hay dentro (CTFs con cifras, paper con DOI, trabajo real). PKN ya abre con una ventana "About Me" que hace de ruta rápida.

## 7. Simulación de tres lectores del sitio actual

Capturas hechas con Chrome en modo headless a 1440x900 contra el build local (`vite preview`). La captura a 375 px en Chrome headless se recortó (el ancho mínimo de ventana de ese modo es mayor), así que la vista móvil la juzgo por el código y por Lighthouse móvil, **no por una captura fiel**; queda pendiente verla en un navegador real (ver `portfolio-audit.md`).

**Reclutador de primer filtro (60 a 90 s).** Ve el nombre grande y la foto, un botón verde "Open to work" con "SOC, MDR, and SRE roles", idiomas, botón amarillo "Email me" y seis cifras. Bien. Fallos: (1) la línea de puesto es una máquina de escribir que rota entre cinco textos; "SOC/MDR analyst at TBSeK" solo se ve unos segundos, y a los 10 s lo que se lee puede ser "Top 5% at HTB..." sin puesto; (2) no hay "desde cuándo" ni años de experiencia visibles; (3) la biografía está debajo del pliegue de la ventana; (4) no hay enlace a CV (decisión de Diego; ver pendientes); (5) el globo del nugget agrega ruido. Veredicto: encuentra quién es y cómo contactarlo en menos de 10 s; encuentra el puesto actual solo por suerte de tiempo.

**Gerente técnico (contratación).** Busca evidencia de trabajo real y dueño de resultados. El 70% y "7 o más clientes" ayudan; falta un resultado verificable del turno completo (Diego no ha dado cifras; está en `docs/recruiter-todo.md`). Los proyectos no traen "rol, decisión, resultado" para varios. Veredicto: suficiente para entrevista de SOC; débil para DevOps porque no hay CI/CD ni IaC visibles.

**Ingeniero senior de SOC/SRE.** Mira herramientas y profundidad. La cinta de herramientas (Splunk, CrowdStrike, Darktrace...) es creíble; la página Skills solo lista herramientas de los empleos y no separa lo usado en trabajo de lo estudiado (Docker, Kubernetes, CI/CD, AWS en proceso no aparecen). No hay mención de detección, MITRE ATT&CK ni un lab de detección. Veredicto: cree la parte SOC; no puede evaluar la parte DevOps/SRE por falta de evidencia visible.

**Desde el celular.** El código usa ventana a pantalla completa por icono; Lighthouse móvil: rendimiento 74, accesibilidad 100, buenas prácticas 100, SEO 100, con LCP de 10.3 s (el fondo de pantalla compite con unos 2.5 MB de imágenes que se descargan al inicio). Eso es un problema de primera impresión real en una red lenta.
