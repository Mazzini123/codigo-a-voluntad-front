# Revisión Impeccable 02: recorrido de la colaboradora y menú de celular — hecho

Origen: `/impeccable critique` del 06/11/2026 sobre `src/Presentation` (28/40, Bueno), después de implementar la revisión 01. Snapshot en `.impeccable/critique/2026-11-06T17-46-36Z__src-presentation.md`.

## Intención

Corregir lo que la critique dejó abierto y que se resuelve sin pantallas nuevas: un texto de privacidad que no siempre es cierto, una etiqueta de la tarjeta que confunde, un menú de celular para un solo enlace (solo cambia donde hay un enlace; el colectivo tendrá dos desde la spec 04) y una bajada de la edición que menciona algo que no se ve. Es para la colaboradora (R1, R2, R4) y para el visitante y la colaboradora en celular (R3).

Quedan fuera de esta spec, y van aparte:

- **El colectivo sin acciones después del alta** (P1 de la critique): lo resuelve la spec 04 (Mis proyectos), que pasa a ser la próxima. No se hace una pantalla puente.
- **"Mis postulaciones"** (spec 10).

## Escenarios

Dado que una colaboradora abre "Postularme" en un perfil con aceptación automática (`TODO_SUMA` o `HASTA_LLENAR_VACANTES`),
cuando lee el diálogo,
entonces se le dice que al enviar el colectivo va a ver sus datos de contacto, y no que se comparten solo si lo acepta.

Dado que una colaboradora abre "Postularme" en un perfil con revisión manual,
cuando lee el diálogo,
entonces ve el texto de siempre: "Tus datos de contacto se comparten solo si el colectivo acepta tu postulación."

Dado que una colaboradora tiene una postulación rechazada en un perfil de un proyecto,
cuando ve la tarjeta de ese proyecto,
entonces no dice que ya se postuló: ve el encaje como cualquier otro proyecto.

Dado que una colaboradora tiene una postulación pendiente o aceptada en un perfil de un proyecto que tiene otros perfiles,
cuando ve la tarjeta,
entonces lee en qué perfiles se postuló y sigue viendo el encaje de los perfiles donde no.

Dado un visitante o una colaboradora en celular (320 px),
cuando mira la cabecera,
entonces "Proyectos" está a la vista y no hay botón "Menú". El colectivo, que tiene dos enlaces, conserva el botón "Menú".

Dado una colaboradora en la edición de su perfil,
cuando lee la bajada,
entonces no se le menciona nada que la pantalla no muestre.

## Requisitos

**R1. El diálogo de postulación dice la verdad sobre el contacto.** Severidad: **mayor**. Detectó: critique (P1). — hecho

- **Dónde:** `Components/Proyecto/DialogoDePostulacion.jsx`, línea del aviso `info`.
- **Qué pasa:** el texto afirma que los datos se comparten solo si el colectivo acepta, pero con `TODO_SUMA` y `HASTA_LLENAR_VACANTES` la aceptación es inmediata (`usePostularse` ya distingue `ACEPTADA`).
- **Corrección:**
  - Función en `Formatos/proyecto.js`, `textoPrivacidadDePostulacion(perfil)`, que devuelve:
    - `REVISION_MANUAL`: "Tus datos de contacto se comparten solo si el colectivo acepta tu postulación."
    - `TODO_SUMA` y `HASTA_LLENAR_VACANTES`: "Este perfil acepta automáticamente: al enviar, el colectivo va a ver tus datos de contacto."
    - Modo desconocido o ausente: el texto de revisión manual no, porque promete de más. Se usa el de aceptación automática, que es el que no promete nada que no pueda cumplirse.
  - `DialogoDePostulacion` recibe el texto por el perfil que ya tiene; no pide nada nuevo.
  - La aceptación automática no cambia "Contribución anónima": sigue oculta la identidad en el proyecto.
- **Verificación:** test por cada modo con el texto exacto; test de que el diálogo con `HASTA_LLENAR_VACANTES` no contiene "solo si el colectivo acepta".
- **Respaldo:** `PRODUCT.md` ("La privacidad se ve"); criterios §3 (texto en lenguaje de la persona).

**R2. "Ya te postulaste" en la tarjeta se calcula por perfil y respeta el estado.** Severidad: **menor**. Detectó: critique (P2). — hecho

- **Dónde:** `Components/Proyecto/TarjetaProyecto.jsx`, `Hooks/useProyectosPostulados.js`, `Pages/ProyectosPage.jsx`.
- **Qué pasa:** se calcula por proyecto, cuenta también las `RECHAZADA`, oculta el encaje de los otros perfiles y usa el coral de la franja de encaje.
- **Corrección:**
  - `useProyectosPostulados` devuelve un `Map` de `proyectoId` a la lista de `{perfilId, estado}` de las postulaciones `PENDIENTE` y `ACEPTADA`. Las `RECHAZADA`, `FINALIZADA` y `DESVINCULADA` no cuentan.
  - La tarjeta recibe `postulaciones` (lista, vacía por defecto) en lugar de `yaPostulada`.
  - Con una o más: un sello de la familia `SelloDeBusqueda` (ícono y texto, sin coral) con el texto según el estado:
    - una pendiente: "Postulación pendiente en 1 perfil";
    - varias pendientes: "Postulación pendiente en N perfiles";
    - una aceptada: "Postulación aceptada en 1 perfil" (o N);
    - mezcla: "Postulaciones en N perfiles".
  - El encaje se calcula solo sobre los perfiles abiertos donde no se postuló y se muestra si tiene al menos una habilidad, como hoy.
  - El sello va donde estaba la franja, arriba del pie.
- **Verificación:** tests de `TarjetaProyecto` con una pendiente, dos pendientes, una aceptada, solo rechazadas (no hay sello) y el encaje que se mantiene; test de `useProyectosPostulados` que descarta las rechazadas. En navegador, con Ana (postulada a un perfil del comedor), "Todos los proyectos".
- **Respaldo:** `DESIGN.md` → Tarjeta de proyecto (el coral es solo el encaje); criterios §3.

**R3. "Proyectos" visible en la barra en celular.** Severidad: **menor**. Detectó: critique (P2, `/impeccable adapt`). — hecho

- **Dónde:** `Components/App/Cabecera.jsx` y `.module.css`.
- **Qué pasa:** hay un solo enlace principal y en celular está detrás de un botón "Menú".
- **Corrección:**
  - Con un solo enlace principal, se muestra en la barra en todos los anchos y no se renderiza el botón "Menú".
  - Con dos o más (el colectivo, desde la spec 04), sigue el comportamiento actual (botón "Menú" por debajo de 768 px): marca, dos enlaces y "Mi cuenta" no entran en 320 px.
  - El umbral es una constante en `Routes/navegacion.js`.
  - A 320 px la barra tiene que seguir sin desbordar: marca, "Proyectos" y "Mi cuenta" (o "Ingresar") en una sola fila, con zonas de toque de 44 px. Si no entran, se reduce el espacio entre elementos y el padding de los botones (como ya se hace por debajo de 360 px); "Proyectos" no se oculta ni se acorta.
- **Verificación:** test de `Cabecera` que no encuentra "Menú" con un enlace; en navegador, ancho 320 y 360 sin desplazamiento horizontal; `DESIGN.md` → Navigation se actualiza.
- **Respaldo:** criterios §6 (navegación visible en móvil); `DESIGN.md` → Navigation (puntos de quiebre).

**R4. La bajada de la edición de colaboradora no menciona lo que no muestra.** Severidad: **menor**. Detectó: critique (P2). — hecho

- **Dónde:** `Pages/PerfilColaboradoraPage.jsx`, bajada del encabezado.
- **Qué pasa:** dice "Tus medios de contacto no son públicos" pero la pantalla no permite ver ni editar medios de contacto: el back no tiene cómo leerlos (pendiente `GET /colaboradores/:id/medios-de-contacto`).
- **Corrección:** la bajada pasa a "Editá cómo te ven los colectivos." y se saca la mención de los medios de contacto. La aclaración de privacidad ya está en el perfil público de la colaboradora ("Sus datos de contacto se comparten cuando un colectivo acepta su postulación."). Cuando el back permita leer los medios de contacto, vuelven a la pantalla con su editor. La bajada del colectivo no se toca: ese formulario sí los edita.
- **Verificación:** test del texto; revisión de que no queda ninguna mención a medios de contacto en la pantalla de la colaboradora que no tenga un control al lado.
- **Respaldo:** criterios §3 (no prometer lo que la pantalla no hace).

## Estados

- Cargando: sin cambios (las postulaciones propias siguen pidiéndose una sola vez por pantalla).
- Con datos: ver R1 a R4.
- Vacío: sin cambios.
- Sin resultados: sin cambios.
- Error: si fallan las postulaciones propias, las tarjetas se muestran sin sello y con el encaje de siempre (como hoy).

## Fuera de alcance

- El colectivo sin acciones después del alta (spec 04) y "Mis postulaciones" (spec 10).
- Poner título propio a cada perfil: depende de que el back lo exponga.
- Los hallazgos menores de la critique (paginación con primera y última, chips del perfil público, `.oculto` y el `320px` suelto en `ProyectosPage.module.css`, "Todavía no cargó avances" sin nombre, R12 de la cuenta sin perfil): van en una ronda posterior.
- Sacar el menú de cuenta de la barra en celular.

## Resoluciones

- R1 usa el aviso de aceptación automática cuando falta el modo o es desconocido.
- R2 muestra la cantidad de perfiles hasta que el back ofrezca el título corto.
- R3 conserva el texto completo de las tres acciones a 320 px con espaciado compacto.

## A acordar con el back

- Un título corto por perfil (`PerfilDto.titulo`), que mejoraría R2 y la lectura del detalle.
- `GET /colaboradores/:id/medios-de-contacto` para la dueña (ya en la lista de pendientes), que permitiría editarlos desde su perfil.

## Criterio de aceptación

- R1 a R4 hechos, cada uno con su test. — hecho
- `npm run lint`, `npm run format:check`, `npm test` y `npm run build` en verde sobre el repo completo. — hecho
- Revisado en navegador con la colaboradora (5174), el colectivo (5175) y el visitante, en escritorio y a 320 px: diálogo de postulación con los dos tipos de aceptación, tarjetas con y sin postulaciones, cabecera sin desborde. — hecho
- `DESIGN.md` actualizado (Tarjeta de proyecto y Navigation) y las decisiones nuevas en `docs/decisiones.md`. — hecho
- Después, volver a correr `/impeccable critique` para ver el puntaje. — hecho
