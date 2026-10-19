# Decisiones y propuestas (sesión de auditoría, 2026-10-19)

## Decisiones tomadas por mí (documentadas)
1. **Hero: puesto fijo, rotación solo para destacados.** La línea del puesto rotaba y a los 10 s podía no verse. Ahora `hero.title` ("SOC/MDR analyst at TBSeK") y `hero.since` (fecha real de inicio, sin redondear) son fijos; la máquina de escribir sigue con los demás destacados. No quita el concepto ni la prueba de `hero.roles`.
2. **Skills agrupadas por uso.** Trabajo (herramientas de los empleos), proyectos y laboratorio, "Known, not used at work" (Kubernetes, CI/CD, Ansible, Puppet, Chef, confirmados por Diego el 19 oct 2026) y "Learning" (Security+, AWS Cloud Practitioner, GCP, Terraform, no obtenidos). Una prueba impide que Kubernetes, Terraform, AWS o Ansible aparezcan en el bloque de trabajo.
3. **Corrección de traducción.** "Not earned" estaba en alemán como "Nicht bestanden" (que significa "no aprobado"); ahora "Nicht erworben".
4. **Rendimiento.** Foto, iconos y fondo reducidos de tamaño, imágenes de ventana con carga diferida, precarga del fondo. Sin dependencias nuevas.
5. **Texto sin JavaScript** en `index.html` (`<noscript>`), solo datos ya públicos del sitio.
6. **Rechazado:** el estilo "Minimalism & Swiss" que sugiere ui-ux-pro-max. Contradice el escritorio Win98.

## Propuestas que contradicen una decisión tuya o una prueba (decide tú)
1. **CV en PDF descargable.** Quitaste el botón a propósito. El ATS y los reclutadores lo piden. Si cambias de idea, pásame el PDF y lo enlazo desde el hero y Contact.
2. **Mostrar zona horaria o modalidad.** Decidiste no mencionar países. Muchas vacantes remotas de EE. UU. piden autorización de trabajo; podría ayudar una línea como "Remoto, zona horaria de México", pero es tu decisión.
3. **Renombrar o mover el ícono "Hack".** Un reclutador de seguridad que no lo abra puede leerlo como ofensivo. Opciones: dejarlo, moverlo a Accessories, o llamarlo "Prank". (Ya estaba en `recruiter-todo.md`.)
4. **Sitemap con `/skills`, `/certs`, `/awards`.** Una prueba exige que `/skills` no esté en el sitemap. Si quieres que Google las indexe como páginas, hay que cambiar esa prueba. No la toqué.
5. **Globo de bienvenida del nugget.** Agrega un elemento más en el primer vistazo; proponer mostrarlo solo tras 15 s de inactividad. No lo cambié.
6. **Sección "Detección" con un lab propio** (Wazuh/Splunk, MITRE ATT&CK) en la ruta de proyectos. Hoy el orden de proyectos lo exige una prueba y no hay lab que mostrar; esto es para después del plan 30/60/90.

## Cambios pedidos por Diego después de la auditoría (2026-10-19)
- Foto del About y nugget más grandes; el nugget da la bienvenida, guía por página, reacciona al hack (y se calma al Reset) y el hack lleva un aviso de epilepsia fotosensible antes del botón.
- Games queda penúltimo en el escritorio, antes de Hack; las herramientas (Player, Converter, Calculator, Dice, Flip, Wheel) están sueltas y la carpeta Accessories ya no está en el escritorio.
- Reproductor: abre en Floral Radio con el tema Silver. Esto cambió dos pruebas que protegían Permaculture y el tema por defecto.
- Tron: arena de 64x48, dos enemigos, estelas de luz como líneas, motos dibujadas y estética synth.
- Blog: Markdown ampliado (encabezados, negritas, cursivas, listas numeradas, citas, código en bloque, reglas e imágenes locales), tarjetas con extracto y etiquetas, editor con barra de formato y vista previa en vivo, y una burbuja en el icono mientras haya un artículo de los últimos 4 meses.
- Safari: probado en WebKit real con Playwright (iPhone 13, iPad Pro 11 y escritorio). Sin errores de página; la única advertencia es `interactive-widget` del viewport, que Safari ignora. Se agregaron prefijos `-webkit-user-select`, `-webkit-touch-callout` y `-webkit-tap-highlight-color`.
