# Posicionamiento (Fase 2)

Base: la memoria de perfil de Diego y el repo. Lo que no está ahí no se asume. Evidencia del mercado en `market-research.md` (muestra pequeña).

## 1. Encaje por rol

| Rol | Fuerza | Qué lo respalda (fuente propia) | Qué falta |
|---|---|---|---|
| SOC / MDR | **Fuerte** | Puesto actual de SOC/MDR en TBSeK (julio 2026 a la fecha) y puesto junior desde abril 2025; Splunk, Darktrace, CrowdStrike, Cisco AMP, Cisco Umbrella, GroupIB, Wireshark; 7+ clientes; playbook de IR; OSINT de dark web; HTB University 52/1,014; Cyber Apocalypse 2025 rango 293; 8+ CTFs; Hackztecs | Cifras del turno (alertas, MTTD, MTTR), MITRE ATT&CK, Security+ obtenida |
| Incident response / blue team | Media | Evidencia y primeros pasos de contención en casos vivos; playbook de IR | Casos descritos sin datos del cliente; no decir "lead IR" |
| SRE / DevOps | **Media, con evidencia parcial** | Docker y Compose, Cloudflare Tunnels y Workers, homelab (Raspberry Pi, Mac Mini), servidor de laboratorio con hardening básico, apps Angular/Node pasadas a Docker, Linux, Git; scripts internos que automatizan el turno (reporte: unos 70% menos de tiempo); sabe Kubernetes y CI/CD (confirmado) | Sin pipeline de CI/CD ni Kubernetes demostrables en el repo; sin IaC (Terraform en aprendizaje); sin observabilidad (Datadog sin confirmar) |
| DevSecOps / cloud security | Débil a media | Hardening básico, criptografía (toolkit), AWS/GCP/Terraform en proceso | Nada obtenido ni usado en trabajo; **solo "en proceso"** |
| Desarrollo de software | Media | TypeScript, Python, Node.js, React, Next.js, Angular, Kotlin, Swift; MAIA (1.º de 22), WayZT (1.º), ColorScore (1.º), Where2Skate, Wifi2Go; paper LNCS; este sitio (Vite + Workers + D1 + Vitest) | Sin puesto de producto de larga duración (T-Systems fue una pasantía de abril a julio de 2024) |
| Investigación / AppSec | Media | Paper MICAI con dataset, taller CONISOFT 2025 sobre ataques a modelos, Burp, Nmap, Ghidra | Sin hallazgos de bug bounty ni CVE; no inventarlos |

## 2. Titular: ¿uno o tres?

**Decisión: un titular único, con tres rutas como hilo común.**

- Titular (el vigente, que la memoria pide respetar): *"I am open to SOC, MDR, and SRE roles."* y puesto "SOC/MDR analyst at TBSeK". Evidencia: el único puesto de tiempo completo y la mayor parte de la evidencia de Diego es de operaciones de seguridad. Un titular de tres cabezas ("SOC, SRE y dev") es lo que los reclutadores leen como "no sé qué soy" cuando el currículo es de un año y medio.
- Hilo común: *"opero y automatizo"*. El triage a escala de turno, los scripts que sacan el 70% del reporte y el homelab con Docker y túneles son la misma habilidad (convertir trabajo repetido en sistema). Eso conecta SOC con SRE sin inventar nada.
- Ruta SRE/DevOps y ruta Software: se muestran como **evidencia secundaria** (proyectos, Skills agrupadas), no como titular. Se pueden elevar cuando exista un pipeline de CI/CD y un repo de IaC propios (plan 30/60/90).
- Dev como ruta: es la que menos respaldo tiene en el mercado (ver investigación); queda como "y también construyo", no como objetivo principal. *Esto es una inferencia mía; Diego no dijo prioridad entre roles. Ver preguntas.*

## 3. Qué mostrar, que ya existe, y cómo

| Ya lo tiene | Cómo mostrarlo |
|---|---|
| Puesto SOC/MDR y desde cuándo | Línea fija en el hero ("SOC/MDR analyst at TBSeK") más "En ciberseguridad desde abril de 2025" (fecha real, sin redondear) |
| Herramientas de SOC | Ya están en el hero y en Skills; agrupar por categoría (SIEM, EDR, red) con palabras clave reales |
| Docker, Compose, Tunnels, Workers, D1, Linux, Git | Grupo "Used in projects and the lab" en Skills |
| Kubernetes, CI/CD, Ansible, Puppet, Chef | Se sabe (confirmado el 19 oct 2026), pero sin herramienta de CI/CD nombrada y sin uso laboral. Listar como **"Know, not used at work"**, sin versiones ni años. Puppet/Chef/Ansible está como "en proceso y sí sé" |
| AWS Cloud Practitioner, GCP, Terraform, Security+ | Bloque **"In progress. Not earned."**; nunca en la sección de experiencia, nunca con fecha de examen que Diego no dio |
| TryHackMe y Hack The Box | Ya hay HTB; TryHackMe se usó por igual, pero no hay perfil enlazado: preguntar la URL pública |
| Lab de detección, automatización | Hoy no hay un lab de detección documentado: va al plan 30/60/90 |

## 4. Brechas: Preguntas para Diego: ¿tienes esto?

Nada de esto se agregó al sitio.

1. ¿Alguna **cifra del puesto de tiempo completo**: alertas por turno o semana, clientes cubiertos, MTTD o MTTR, escalamientos, cuántos scripts internos usa el turno? (Sin cifra el reclutador de SOC no distingue a un junior de uno senior.) ¿Hay NDA que limite decirlo?
2. ¿Qué **herramienta de CI/CD** usaste (GitHub Actions, Workers Builds, otra) y en qué repo corre? ¿Hay un pipeline con pruebas en este mismo repo?
3. ¿Has usado **MITRE ATT&CK** para mapear detecciones o alertas? Es la palabra más repetida en MDR que el sitio no tiene.
4. ¿Tienes un **lab de detección** (Splunk, Wazuh, Elastic) o un cuaderno de casos de TryHackMe/LetsDefend con resultados que podamos mostrar?
5. ¿Tu perfil público de **TryHackMe** y el de **Hack The Box** (rango, sala completadas)?
6. ¿Escribes **consultas SPL** o reglas de detección propias? ¿Cuántos años usas Splunk realmente?
7. ¿Experiencia con **Windows/Active Directory, PowerShell o scripting en Bash** fuera de lo escrito? Las vacantes de MDR lo piden.
8. ¿**Datadog** lo usas de verdad en el puesto junior (está en tus fuentes sin confirmar)?
9. ¿Has trabajado con **Terraform, Kubernetes o AWS en algo real**, aunque sea personal? ¿Hay repo?
10. ¿Tienes **PDF de CV**? Quitaste el botón a propósito; el ATS lo pide.
11. ¿**Autorización de trabajo** (visa) para EE. UU. u otros países? Muchas vacantes remotas de EE. UU. exigen ciudadanía. ¿Prefieres que el sitio diga "remoto, zona horaria de México"? (Decidiste no mencionar países.)
12. ¿Cuál es tu **prioridad real** entre SOC, MDR, SRE, DevOps y desarrollo?
13. ¿**Referencias o recomendaciones** de LinkedIn con permiso para citarlas?
14. ¿**Fecha estimada** del examen de Security+ y qué cert va después?
15. ¿Quieres publicar los cursos de Hack The Box de LinkedIn "otras insignias" con nombre y fecha?

## 5. Plan 30 / 60 / 90 días

Cada proyecto debe terminar con repo público, README con decisiones, y una entrada corta en el sitio. Cumple el criterio de "proyecto terminado" de las guías de DevOps: URL o demo, pipeline, IaC, monitoreo, README, historial público.

**Días 1 a 30: cerrar lo más barato y más visible**
- Pipeline de CI/CD de este mismo sitio con GitHub Actions: tests de Vitest, typecheck, `scripts/check.sh` y escaneo de dependencias en cada PR; documentar en el README. (Es CI/CD real sobre algo que ya tiene.)
- Lab de detección con **Wazuh o Splunk Free** en el homelab: 5 detecciones propias mapeadas a MITRE ATT&CK, con captura de la alerta y el razonamiento (sin datos de clientes, sin payloads de ataque reales publicados).
- Perfil de TryHackMe/LetsDefend enlazado; SOC Level 1 completo.
- Examen: sacar fecha de **Security+**.

**Días 31 a 60: DevOps visible**
- **Terraform** para una infraestructura pequeña con hardening (VPC o red con subredes privadas y grupos de seguridad mínimos, o el DNS de Cloudflare del sitio), con estado remoto y destrucción/reconstrucción demostrada.
- Contenedor de la app con imagen mínima y escaneo (Trivy) en el pipeline.
- Un clúster **Kubernetes** pequeño (k3s en el Raspberry Pi) con un despliegue y una alerta, para respaldar lo que ya sabes con un repo.
- **AWS Cloud Practitioner**: presentar el examen.

**Días 61 a 90: unir SOC y SRE**
- Observabilidad del homelab (Prometheus + Grafana o similar) con 2 SLO y un runbook de incidente; es el puente entre detectar y operar.
- Ansible (o el que prefiera) para dejar reproducible el hardening del homelab.
- Presentar **Security+** si no se hizo; luego elegir entre CySA+ (blue team) o AWS Security Specialty/CKA según el rol que haya respondido.
- Rehacer el CV y el LinkedIn con las cifras que haya dado.

**Ruta de certificaciones (propuesta)**: Security+ → AWS Cloud Practitioner → CySA+ (si SOC/MDR es prioridad) o Terraform Associate/CKA (si SRE/DevOps) → GCP y otras. Esto es un orden razonable según la muestra, no un dato de mercado firme; Diego decide.
