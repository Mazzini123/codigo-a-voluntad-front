# Revisión Impeccable 04: unirse a un colectivo durante el registro

Origen: `/impeccable audit` y `/impeccable critique` del 14/11/2026 sobre las tres pantallas de la spec 18, sin commitear: Bienvenida con tres tarjetas, `/bienvenida/colectivo/unirme` y la espera en `/cuenta/solicitudes`. Suma las observaciones vigentes de `specs/backlog/observaciones-del-recorrido-18.md`.

- **Audit técnico, 16/20 (bueno).**
  - Accesibilidad 3/4: salto de h1 a h3 en la espera y «Actualizar» sin anuncio.
  - Rendimiento 3/4: un pedido por colectivo al listar las solicitudes.
  - Sistema visual 3/4: la espera importa el CSS de `MiembrosPage` y Unirme repite el texto oculto.
  - Adaptación 3/4: enlaces de 24 px de alto en la espera.
  - Integridad 3/4: la espera no usa el sello de estado.
  - El detector estático dio cero hallazgos en los cuatro JSX. axe (WCAG 2.2 AA) dio cero violaciones a 1280 y 320 px. No hay desborde horizontal a 320 px.
- **Critique, 26/40 (aceptable).** Dos evaluaciones independientes: revisión de diseño y detector con navegador. Usaron Playwright y Chromium con el back simulado por `page.route`. El detector en página marcó solo `skipped-heading` en la espera, y coincide con la revisión manual.
  - Unirme es la pantalla más cuidada: tiene estados completos, conteo anunciado y paginación inerte.
  - La espera es el momento de más incertidumbre y es la menos diseñada.
- **Límite de la evidencia.** Con `VITE_SESION_SIMULADA=SIN_PERFIL`, `listarMisSolicitudes` de `sesionSimulada.js` devuelve siempre `[]`, así que el paso `ESPERA` no se alcanza en el navegador sin tocar código. La revisión de diseño lo alcanzó reescribiendo ese módulo solo en la respuesta del navegador. La evaluación del detector no lo alcanzó: auditó la variante «Mis solicitudes» en registro.

## Intención

Que quien se registra para sumarse a un colectivo existente encuentre el correcto sin dudar. Que, mientras espera, entienda en qué estado está su pedido, qué puede hacer y que puede irse tranquila. Para la persona colectivo recién creada, que el resumen y el alta no repitan ni escondan información.

## Escenarios

Dada una persona en la espera con un pedido pendiente y uno rechazado,
cuando mira la lista,
entonces distingue cada estado por un sello con texto e ícono, y el rechazado le ofrece un camino.

Dada la espera con un pedido todavía pendiente,
cuando toca «Actualizar»,
entonces ve y escucha «Todavía no te aceptaron» y sabe que, si la aceptan, va a entrar directo al ingresar.

Dada la lista para unirse con dos colectivos de nombre parecido,
cuando la persona los compara,
entonces distingue cada uno por su tipo y su ubicación.

Dada una persona cuyo único pedido fue rechazado,
cuando vuelve a Bienvenida,
entonces ve que su pedido fue rechazado y puede abrir «Mis solicitudes».

Dado un colectivo recién creado, sin proyectos,
cuando su líder abre `/colectivo/resumen`,
entonces ve «Todavía no publicaste proyectos» una sola vez, con una sola acción para publicar.

## Hallazgos y requisitos

Ordenados por prioridad. Cada uno indica de dónde salió.

### R1. Sello de estado en la espera (P1, critique y audit) — hecho

- **Dónde.** `MisSolicitudesPage.jsx:160-167`.
- **Problema.** Pendiente y Rechazada se ven igual: un `<strong>` en tinta, sin ícono ni color. Va contra «El estado siempre explicado» y el sello de estado de `DESIGN.md`.
- **Resultado esperado.** Usar el sello compartido de estado, igual que `SelloDeBusqueda`:
  - Pendiente: tono aviso con reloj y un texto como «Esperando respuesta».
  - Rechazada: tono peligro con cruz.
  - El texto siempre visible, para no depender del color.

### R2. «Actualizar» tiene que responder siempre (P1, critique) — hecho

- **Dónde.** `useEsperaDeIngreso.js:26-29` y `MisSolicitudesPage.jsx:59-61`.
- **Problema.** Si el pedido sigue pendiente, después de «Actualizando…» la pantalla queda igual y parece rota.
- **Corrección al hallazgo.** La falla no pasaba en silencio: si `recargarCuenta` falla, `errorDeCuenta` hace que `RutaProtegida` muestre `ErrorDeVerificacionDeCuenta` con «Reintentar». Quedó cubierto con un test.
- **Resultado esperado.**
  - Sin contexto nuevo: un aviso informativo anunciado, como «Todavía no te aceptaron. Si te aceptan, vas a entrar directo la próxima vez que ingreses.».
  - Ante una falla: el mensaje de la persona con la opción de reintentar.

### R3. La espera tiene que tranquilizar y orientar (P1, critique) — hecho

- **Dónde.** `MisSolicitudesPage.jsx:74-78` (bajada), `:169` (fila) y `:81-96` (acciones).
- **Problema.** No dice que se puede cerrar la página ni que la aceptación depende de alguien del colectivo. La fila rechazada no ofrece ningún camino. «Actualizar» queda debajo de la lista, después de cada «Cancelar» en rojo: es lo último en el orden de tabulación y queda fuera de la zona del pulgar.
- **Resultado esperado.**
  - Una bajada que diga quién acepta, sin «liderazgo», que es jerga para un comedor. Que diga también que puede cerrar la página.
  - La fila rechazada sugiere pedir sumarse a otro o crear un colectivo.
  - «Actualizar» va antes de la lista.
  - «Cancelar» queda en segundo plano y su texto visible dice qué cancela.
- **Decidido (14/11/2026).** No se agrega texto para compartir; solo se aclara quién acepta y que se puede cerrar la página.

### R4. Estructura y estilos propios de la espera (P2, audit) — en parte

- **Avance.** Con R3 se creó `MisSolicitudesPage.module.css`, con `--ancho-lectura`, bajada en tinta suave y espaciado entre título y bajada. La página ya no importa el CSS de Miembros. Falta verificarlo a la vista a 1280 y 320 px.

- **Dónde.** `MisSolicitudesPage.jsx:31` importa `colectivo/MiembrosPage.module.css`.
- **Problema.** La página depende de otra pantalla. La bajada no tiene ancho máximo (unos 920 px a 1280 px, más que `--ancho-texto`). El título queda pegado a la bajada.
- **Resultado esperado.**
  - Un `MisSolicitudesPage.module.css` propio, con `--ancho-lectura`.
  - La bajada en `--color-tinta-suave`, con el mismo espaciado que Unirme.
  - La espera no puede cambiar si cambia Miembros.

### R5. Encabezados de la espera (P2, audit; detector en página y revisión manual)

- **Dónde.** `MisSolicitudesPage.jsx:157`.
- **Problema.** Del `h1` se salta directo a un `h3` por cada colectivo. axe no lo marca porque `heading-order` es una buena práctica y no una regla WCAG.
- **Resultado esperado.** Un `h2` antes de la lista (puede ser oculto, como «Colectivos» en Unirme) o las filas en `h2`.

### R6. Tarjeta para unirse: identificar el colectivo correcto (P2, critique)

- **Dónde.** `TarjetaParaUnirse.jsx:19-25` y `.module.css:36-43`.
- **Problema.** Solo muestra el nombre, el tipo y una línea de descripción. A 360 px esa línea se corta a las pocas palabras. Dos comedores parecidos no se distinguen, y pedir el ingreso al equivocado la deja esperando a un colectivo que no es el suyo. `textoUbicacion` existe en `Formatos/colectivo.js` y no se usa acá.
- **Resultado esperado.**
  - La ubicación junto al tipo.
  - La descripción recortada a dos líneas.
  - Sin hueco cuando falta la descripción.

### R7. Un solo coral en la lista para unirse (P2, critique)

- **Dónde.** `TarjetaParaUnirse.jsx:33-41` (`variante="primario"`).
- **Problema.** Hay hasta 12 botones coral por página. Rompe la regla de la voz única de `DESIGN.md`, igual que se resolvió con «Postularme», y aplana la jerarquía. En celular aumenta el riesgo de tocar el equivocado.
- **Resultado esperado.** «Pedir sumarme» en variante secundaria. El coral queda para una sola acción por pantalla.

### R8. Rechazo visible fuera de la espera (P2, audit)

- **Dónde.** `BienvenidaPage.jsx:120-125`. El enlace a «Mis solicitudes» solo aparece con `!registrando`.
- **Problema.** Cuando rechazan el único pedido, la persona vuelve a Bienvenida sin ninguna señal de lo que pasó. Solo lo encuentra si abre «Mi cuenta».
- **Resultado esperado.** Durante el registro, si hay solicitudes, Bienvenida muestra un enlace a «Mis solicitudes» o un aviso breve del rechazo.
- **Para decidir.** Si alcanza con el enlace o hace falta consultar el estado.

### R9. Diálogo de cancelar sin contradicción (P2, critique)

- **Dónde.** `MisSolicitudesPage.jsx:102-113`. `DialogoDeConfirmacion` tiene `permanente = true` por defecto.
- **Problema.** El diálogo dice «Podés volver a pedir el ingreso más adelante» y, a la vez, «Esta acción no se puede deshacer.».
- **Resultado esperado.** Decidir si cancelar es permanente. Si no lo es, pasar `permanente={false}`; si lo es, ajustar la descripción.

### R10. Bienvenida: agrupar las formas de ser colectivo (P2, critique)

- **Dónde.** `BienvenidaPage.jsx:42-46` y `BienvenidaPage.module.css:14-20`.
- **Problema.** A 1280 px la grilla queda en 2+1 y «Registrarme como colaboradora» queda sola en una fila con una celda vacía. «Crear» y «Unirme» son dos caminos del mismo tipo de cuenta, pero se presentan al mismo nivel que «colaboradora». La bajada usa «operar», que es jerga.
- **Resultado esperado.**
  - Agrupar «Como colectivo: crear o unirme» frente a «Como colaboradora», o armar una grilla sin huecos.
  - Bajada sin «operar».
- **Para decidir.** La pregunta de la revisión: si conviene preguntar primero «¿Tu organización ya está en Código a Voluntad?», para que crear un duplicado sea la excepción.

### R11. Resumen del colectivo sin vacío duplicado (P2, observación del recorrido) — hecho

- **Decidido e implementado (14/11/2026).** Queda el aviso de `CuerpoDelPanel.jsx` con «Publicar el primero». Si las estadísticas dicen que el colectivo tiene cero proyectos, `EstadisticasDelColectivo` no se muestra, título incluido, igual que `EstadisticasGlobales` con la plataforma vacía. Durante la carga y ante un error se ve como antes. Si el back no manda `proyectos`, el hook ya trataba la respuesta como error y se muestra «Reintentar»; quedó cubierto con un test. `EstadisticasGlobales` no cambió.

- **Dónde.** `Estadistica/EstadisticasDelColectivo.jsx:36` y `Colectivo/CuerpoDelPanel.jsx:38-42`.
- **Problema.** «Todavía no publicaste proyectos» aparece dos veces seguidas, con dos botones distintos («Publicar un proyecto» y «Publicar el primero»).
- **Resultado esperado.** Un solo aviso con una sola acción. Decidir cuál de las dos tarjetas lo muestra.

### R12. Búsqueda sin coincidencias que oriente (P3, critique)

- **Dónde.** `UnirmeAColectivoPage.jsx:184-191`.
- **Problema.** Si la persona busca por un apodo («Los Pibes») y el colectivo está cargado con otro nombre, solo ve «No encontramos colectivos con ese nombre».
- **Resultado esperado.** Una descripción que sugiera probar con parte del nombre o preguntarle el nombre exacto a alguien del colectivo, además de «Limpiar búsqueda».

### R13. Ayuda del campo «Ciudad o barrio» (P3, observación del recorrido, vigente)

- **Dónde.** `Colectivo/ColectivoForm.jsx:147-149`. La ayuda hoy es «Por ejemplo: Villa Fiorito, Lomas de Zamora.».
- **Resultado esperado.** Evaluar pasar el ejemplo a `placeholder` y dejar como ayuda solo las instrucciones, asociadas con `aria-describedby`. El placeholder no reemplaza a la ayuda, porque desaparece al escribir y suele no llegar a 4.5:1.

### R14. Detalles menores (P3, audit y critique)

- **Enlaces bajos en la espera.** Los nombres de colectivo miden 24 px de alto (`MisSolicitudesPage.jsx:158`). Cumplen el mínimo de 2.5.8, pero no los 44 px de `PRODUCT.md`.
- **Skeleton.** El de la espera es un único bloque de 4 rem (`:130-132`). La spec 18 pide skeleton de tarjetas.
- **Texto oculto duplicado.** Unirme define su propia clase `.oculto` (`UnirmeAColectivoPage.module.css:74-81`) en lugar de usar `TextoOculto`.
- **Un pedido por colectivo.** La espera hace un `GET /colectivos/:id` por cada solicitud para mostrar los nombres. Conviene revisarlo si las solicitudes crecen o si el back ya devuelve el nombre.
- **Aviso sobre el título.** A 360 px, el aviso de éxito tapa el `h1` de la espera al llegar desde «Pedir sumarme».
- **Sombra en reposo.** Las tarjetas de Bienvenida y de Unirme tienen `--sombra-tarjeta` en reposo. Aclarar en `DESIGN.md` si eso contradice el plano por defecto.

### R15. Sesión simulada que alcance la espera (P3, audit; herramienta de desarrollo)

- **Dónde.** `src/Infrastructure/Auth/sesionSimulada.js`, `listarMisSolicitudes`.
- **Problema.** Siempre devuelve `[]`. Sin cambiar código no se puede ver ni probar con axe el paso `ESPERA` en el navegador.
- **Resultado esperado.** Que la sesión simulada recuerde los pedidos hechos en la sesión, o que el back en memoria de `tests/e2e/` los sume. Así un e2e con axe puede recorrer la espera.

## Estados

- Cargando: skeleton con forma de tarjeta en la espera (R14). En Unirme, sin cambios.
- Con datos: sello de estado por solicitud (R1); tarjetas con ubicación (R6).
- Vacío: sin cambios en Unirme ni en la espera. El resumen del colectivo muestra un solo vacío (R11).
- Sin resultados: la búsqueda orienta (R12).
- Error: sin cambios en las listas. «Actualizar» informa su falla (R2).

## Fuera de alcance

- Notificaciones de aceptación o rechazo, y sondeo automático (decisión de la spec 18).
- Cancelar los pedidos pendientes al crear un colectivo desde la espera (ver `docs/decisiones.md`, 14/11/2026).
- Tipos de colectivo propios para comedores o cooperativas: el catálogo `TIPO_COLECTIVO` es del back.
- Pedir el ingreso desde el perfil público durante el registro (spec 14).

## Criterio de aceptación

- Cada requisito aprobado se verifica en escritorio y a 320 px, con la espera renderizada en el paso `ESPERA` (R15 o un back simulado).
- axe sin violaciones en las tres pantallas, incluida la espera, y el detector de Impeccable sin `skipped-heading`.
- `npm run lint`, `npm test` y `npm run build` en verde, y el checklist de `docs/criterios-pantallas-web.md` revisado.
- Repetir `/impeccable audit` y `/impeccable critique` sobre las tres pantallas y registrar los puntajes nuevos acá.

## Implementación de R1–R3 del 14/11/2026 — hecho

- **R1.** `selloDeSolicitud` en `Formatos/membresia.js` y `SelloDeBusqueda` en cada fila: Pendiente (aviso), Aceptada (tilde), Rechazada (cruz) y Cancelada (neutro). La pantalla del colectivo (`SolicitudesDeIngresoPage.jsx:184`) sigue con el texto en negrita.
- **R2.** `useEsperaDeIngreso` guarda la hora de la última revisión correcta. Si sigue en espera, junto a «Actualizar» aparece «Todavía no te aceptaron. Revisamos a las HH:MM.» en una región `role="status"` de la página, no en un aviso flotante.
- **R3.** Bajada nueva sin «liderazgo». «Actualizar» va antes de la lista; «Pedir sumarme a otro colectivo» y «Crear mi propio colectivo», después. La fila rechazada en el registro sugiere otro camino. El botón dice «Cancelar la solicitud».
- **Tests.** `Formatos/membresia.test.js` (sellos y hora) y en `flujos/registroEnUnColectivo.test.jsx`: bajada, orden, sello, texto del botón, mensaje sin novedades, error al recargar con «Reintentar» y ayuda del rechazo.
- **Checks.** `npm run lint`, `npm run format:check` y `npm run build` en verde. `npm test` con `VITEST_MAX_WORKERS=1`: 982 tests en 83 archivos. Con paralelismo habitual fallaron 5 tests de `nuevoProyecto.test.jsx` por timeouts de 5 s, sin relación con este cambio (mismo comportamiento registrado en la revisión 03).
- **Sin verificar.** La espera no se vio en el navegador: la sesión simulada no alcanza el paso `ESPERA` (R15).
