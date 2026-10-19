# Auditoría del portafolio (Fase 3)

Sitio auditado: build local de `recruiter-ux-v2` (commit `95436a2`), servido con `vite preview`. Skills aplicadas: technical-recruiter, ui-audit, web-design-guidelines, ui-ux-pro-max, frontend-design. react-best-practices, composition-patterns y react-view-transitions **no aplican** (cliente Vite + TypeScript sin React).

## Medición base (Lighthouse 12, Chrome headless, 2026-10-19)

| | Rendimiento | Accesibilidad | Buenas prácticas | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| Móvil | 74 | 100 | 100 | 100 | 10.3 s | 0 | 0 ms |
| Escritorio | 94 | 100 | 100 | 100 | 1.7 s | 0.004 | 0 ms |

Causas medidas: el LCP móvil es el fondo de pantalla (`#wallpaper`), con 9.2 s de "render delay" mientras el navegador baja unos 2.5 MB de imágenes que no se ven al inicio (`me.png` 758 KB, `nugg.png`/`favicon.png` 306 KB cada una a 500x500 px para mostrarse a 40 px, y siete fotos de `/media`). Lighthouse falla `label-content-name-mismatch` en el botón de idioma (texto visible "EN", nombre accesible "Language: English").

## Qué ya está bien (no tocar)
Escritorio Win98 con teclado y móvil a pantalla completa, bio corta con el 9.0/10 una sola vez, cifras verificables en el hero, enlaces de salida con `rel`, headers de seguridad y `security.txt`, JSON-LD de persona, Open Graph con imagen, sitemap, `robots.txt`, 100 en accesibilidad/SEO/prácticas, pruebas y `scripts/check.sh`, y un auditor multi-navegador (`site/scripts/ui-audit.mjs`) ya hecho.

## Tabla QUITAR / AGREGAR / CORREGIR

Severidad: Crítico (bloquea ser contratado), Alto, Medio, Bajo. "Impacto" es mi estimación para un reclutador, no una medición.

| # | Acción | Hallazgo | Skill origen | Severidad | Impacto en contratación | Estado |
|---|---|---|---|---|---|---|
| 1 | CORREGIR | El puesto ("SOC/MDR analyst at TBSeK") vive en una línea que rota entre cinco textos; a los 10 s el reclutador puede leer solo "Top 5% at HTB..." sin puesto. No hay "desde cuándo" | technical-recruiter, ui-audit (jerarquía, primera impresión) | Crítico | Alto: es lo primero que mira el ojo del primer filtro | Hecho |
| 2 | CORREGIR | LCP móvil 10.3 s por imágenes eager de varios cientos de KB | web-design-guidelines (imágenes), rendimiento | Alto | Medio: red lenta en celular, primera impresión | Hecho |
| 3 | AGREGAR | `index.html` llega vacío (`<div id="app">`): sin JS, ATS, previews y rastreadores simples no ven nombre, puesto ni contacto | technical-recruiter (ATS), SEO | Alto | Alto para ATS y vistas previas | Hecho |
| 4 | CORREGIR | Skills solo repite herramientas de los empleos; no separa usado en trabajo, usado en proyectos y en proceso; faltan Docker, Kubernetes, CI/CD, Ansible/Puppet/Chef, AWS/GCP/Terraform/Security+ | technical-recruiter, ui-audit (prueba social, claridad) | Alto | Alto para rutas SRE/DevOps | Hecho |
| 5 | CORREGIR | Courses lista Security+ pero no AWS Cloud Practitioner, GCP ni Terraform en proceso | technical-recruiter | Medio | Medio | Hecho |
| 6 | CORREGIR | Botón de idioma: nombre accesible no contiene el texto visible (WCAG 2.5.3) | web-design-guidelines (foco, etiquetas) | Medio | Bajo; arregla el único fallo de Lighthouse | Hecho |
| 7 | AGREGAR | JSON-LD sin `knowsAbout` con el stack real | SEO, technical-recruiter | Bajo | Bajo | Hecho |
| 8 | AGREGAR | `docs/linkedin-suggestions.md` y `docs/cv-draft.md` | technical-recruiter | Alto | Alto (el ATS y el reclutador usan CV y LinkedIn antes que el sitio) | Hecho |
| 9 | AGREGAR | Resultado y rol en proyectos (homelab, wifi2go, where2skate, wayzt...), cifra del turno, recomendaciones | technical-recruiter, ui-audit (prueba social) | Alto | Alto | **Bloqueado: solo Diego puede darlo.** Ver Preguntas en `positioning.md` y `recruiter-todo.md`. No se inventó nada |
| 10 | AGREGAR | CV en PDF descargable | technical-recruiter | Alto | Alto | **Propuesta**, contradice una decisión de Diego (quitó el botón a propósito) |
| 11 | CORREGIR | El ícono "Hack" en el escritorio puede leerse como ofensivo para un reclutador de seguridad | technical-recruiter | Medio | Bajo a medio | **Propuesta** (decisión de Diego; ya anotada en `recruiter-todo.md`) |
| 12 | CORREGIR | Sitemap omite `/skills` y otras rutas | SEO | Bajo | Bajo | **No se cambia**: una prueba lo protege. Propuesta en `decisions.md` |
| 13 | QUITAR | Estilo "Minimalism & Swiss" que recomienda ui-ux-pro-max para "portafolio de ciberseguridad y DevOps" | ui-ux-pro-max, frontend-design | n/a | n/a | **Rechazado**: contradice el escritorio estilo Win98, decisión de Diego. Ver abajo |
| 14 | CORREGIR | Verificar en navegador real 375 y 768 px, teclado y modo oscuro | ui-audit, web-design-guidelines | Medio | Medio | Hecho en Chrome con puppeteer-core (375, 768, 1440 px, teclado, movimiento reducido). No hay modo oscuro. Abierto: a 768 px el globo del nugget tapa parte de las cifras (Medio, no corregido) |

## Revisión por skill

**ui-audit.** Jerarquía: nombre y botón amarillo de contacto dominan bien; el puesto compite con cinco cifras y un globo del nugget. Carga cognitiva: seis cifras más ticker más globo más iconos; razonable porque el ticker es `aria-hidden`. Navegación: iconos, menú Inicio y terminal dan tres rutas; el reclutador apurado no necesita ninguna (el hero basta). Prueba social: cifras con enlace a la fuente; **no hay recomendaciones** (hallazgo 9). Primera impresión: hallazgo 1.

**web-design-guidelines.** Semántica: se usan `nav`, `section`, `h2`, `label`, `select` con `aria-label`; Lighthouse da 100 en accesibilidad. Foco y teclado: el auditor propio ya prueba objetivos pequeños y axe WCAG 2.2 AA; no lo repetí con Playwright (no está disponible aquí). Contraste: no medí cada combinación; Lighthouse no reporta fallos de contraste. `prefers-reduced-motion`: existe en tres bloques de CSS y el hero tiene modo "still" con prueba (`recruiter.test.ts`). Imágenes: hallazgo 2; el `alt` del retrato es el nombre. Formularios: no hay formulario de contacto (decisión).

**ui-ux-pro-max** (`search.py --design-system "portafolio personal de ciberseguridad y DevOps"`): recomienda patrón "Hero + Features + CTA", estilo Minimalism & Swiss, paleta zinc con azul `#2563EB`, tipografía Outfit/Work Sans. Comparación con el sitio: el patrón de hero con titular, valor, 3 a 5 cifras y CTA **ya está**; lo útil de su checklist es CTA con contraste 4.5:1, foco visible, reducir movimiento a estado estático final y responsive 375/768/1024/1440. El estilo, la paleta y la tipografía **no se adoptan**: reemplazarían la identidad Win98 (98.css, fuente Pixelated MS Sans Serif), que es una decisión de Diego y que el propio mercado muestra como subgénero (ver `market-research.md`).

**frontend-design.** Identidad: propia y coherente (Win98, nugget, terminal, juegos, cinta de herramientas). Riesgo: los escritorios retro ya son comunes en plantillas; lo que diferencia es el contenido real (CTFs, paper). Coherencia: las cuatro lenguas y el modo "still" se respetan. No hay cambios de estilo.

**SEO y datos estructurados.** Título, descripción, canonical, Open Graph 1200x630 con `alt`, Twitter Card, JSON-LD `Person` con `worksFor`, `alumniOf`, `sameAs`. Falta contenido sin JS (hallazgo 3). 404: el Worker responde con `index.html` y la app pinta "no such path", pero Lighthouse no lo evalúa y no verifiqué el código HTTP del Worker en producción (no hice deploy). El servidor local de prueba no lo reprodujo de forma fiable.

## Limitaciones declaradas
- No pude ejecutar `ui-audit.mjs` (necesita Playwright y los tres navegadores, no instalados aquí) ni verificar Firefox/WebKit.
- Chrome headless recorta capturas por debajo de ~500 px de ancho; la vista de 375 px se revisa con un iframe de 375 px.
- Las puntuaciones "antes/después" de la Fase 5 de recorrido de lectores son **mi estimación cualitativa**, no una medición.

## Resultado después de los cambios (2026-10-19)

Lighthouse 12, mismo método y mismo build servido con `vite preview`:

| | Antes | Después |
|---|---|---|
| Móvil: rendimiento / LCP | 74 / 10.3 s | 86 / 4.0 s |
| Escritorio: rendimiento / LCP | 94 / 1.7 s | 99 / 0.7 s |
| Accesibilidad, buenas prácticas, SEO (ambos) | 100 | 100 |
| Falla `label-content-name-mismatch` | sí | no |

Comprobado: `scripts/check.sh` (150 pruebas de Vitest, typecheck, build y búsqueda de patrones prohibidos) pasa; sin desbordamiento horizontal a 375, 768 y 1440 px; el puesto y la fecha de inicio se ven fijos en las tres anchuras; el primer foco de teclado es "Email me"; con movimiento reducido la línea de destacados no rota. **No comprobado:** Firefox y WebKit, `ui-audit.mjs`, producción, modo oscuro (no existe), lector de pantalla.

Abierto: el globo del nugget tapa cifras a 768 px; LCP móvil sigue en 4.0 s (el fondo es lo que se pinta como LCP y pesa 150 KB); contenido que solo Diego puede dar (hallazgo 9) y las propuestas 10, 11 y 12.

Puntuación cualitativa de "reclutador" (mi estimación, no medición): antes 3.5/5, después 4.0/5. No llegué a 4.5/5 porque lo que falta (cifra del turno, resultados por proyecto, recomendaciones, CV en PDF, un lab de detección y un pipeline de CI/CD) no lo puedo escribir sin inventarlo.
