# Mis postulaciones y colaboraciones (ver estado y darse de baja)

Origen: borrador `specs/backlog/10-mis-postulaciones.md`, contrastado con el contrato de Colaboración de `docs/PLAN-ENTIDADES.md`, con `ColaboracionService`, el router y `openapi.js` del back local, y con las specs 06 y 09 ya hechas.

## Intención

Que la colaboradora vea en un solo lugar cómo va cada una de sus postulaciones y los proyectos en los que participa, y que pueda dejar una colaboración activa sabiendo que es permanente.

## Escenarios

Dada una colaboradora con postulaciones,
cuando entra a "Mis postulaciones",
entonces ve una lista, de la más reciente a la más antigua, con el proyecto, el perfil, el estado (Pendiente, Aceptada, Rechazada, Finalizada o Desvinculada) y si su contribución es pública o anónima.

Dada una lista con postulaciones en distintos estados,
cuando elige un estado en el filtro,
entonces la lista se acota, la URL queda con `?estado=` y al recargar o compartir el enlace se ve lo mismo.

Dada una postulación cualquiera,
cuando toca el nombre del proyecto,
entonces llega al detalle del proyecto y, al volver, conserva el filtro.

Dada una colaboración aceptada,
cuando toca "Darme de baja",
entonces ve un diálogo que nombra el proyecto y el perfil y avisa que no se puede deshacer; si confirma, deja de participar, ve "Te diste de baja del proyecto «…»" y la colaboración pasa a "Desvinculada".

Dada una colaboración aceptada,
cuando cancela el diálogo (botón o Esc),
entonces no cambia nada y el foco vuelve a "Darme de baja".

Dada una postulación pendiente, rechazada, finalizada o desvinculada,
cuando la ve en la lista,
entonces solo muestra su estado y el enlace al proyecto, sin acciones.

Dada una colaboradora sin postulaciones,
cuando entra,
entonces ve "Todavía no te postulaste a ningún proyecto" y "Buscar proyectos", que lleva a `/proyectos`.

Dado un filtro sin coincidencias y con postulaciones en otros estados,
cuando lo elige,
entonces ve "No tenés postulaciones con este estado." y "Ver todas".

Dada una persona sin sesión, o con cuenta de colectivo,
cuando abre `/colaboradora/postulaciones`,
entonces va a ingresar y vuelve acá, o ve `/sin-permiso`.

## Requisitos

- Ruta `RUTA_POSTULACIONES_COLABORADORA = "/colaboradora/postulaciones"` en `Routes/rutas.js`, dentro del `RutaProtegida roles={[ROL_CUENTA.COLABORADORA]}` existente y con `PantallaDiferida`, como `/colaboradora/perfil`.
- Enlace "Mis postulaciones" en la navegación principal de la colaboradora (`ENLACES_POR_ROL` en `navegacion.js`, hoy solo tiene "Proyectos"), con `aria-current="page"`. Con dos enlaces, la cabecera pasa a usar el menú desplegable en celular (`MINIMO_ENLACES_PARA_MENU`).
- Fuente de las filas: `listarColaboracionesDeColaborador(colaboradoraId, { requiereSesion: true })`, que devuelve `{ proyectoId, colaboracion }[]` sin paginar. No se reusa `usePostulacionesPropias`, porque descarta finalizadas y desvinculadas.
- Datos por fila: título del proyecto (enlace a `rutaProyecto(proyectoId)` con `estadoParaVolver`), perfil (`Perfil N` según su posición en `proyecto.perfiles` y su descripción recortada, como en la spec 09; "Perfil eliminado" si ya no existe), estado en texto con el color de siempre, "Contribución pública" o "Contribución anónima" y fechas con `fechaLarga`: "Te postulaste el …" (`fecha`) y, si corresponde, "Terminó el …" (`fechaFin`).
- El título y los perfiles salen de `obtenerProyecto`, una vez por proyecto distinto (`Promise.allSettled`, como `useHistorialPublico`). Si un proyecto no carga, la fila sigue mostrando estado y enlace con "No pudimos cargar los datos de este proyecto", sin romper la lista.
- Filtro `?estado=` con el `Selector` "Estado de la postulación" y las mismas opciones que la spec 09 (Todas, Pendientes, Aceptadas, Rechazadas, Finalizadas, Desvinculadas); un valor desconocido se trata como "Todas". Se filtra en el front porque el back entrega la lista completa.
- Orden: `fecha` descendente, calculado en el front (el back no ordena).
- "Darme de baja" solo en filas `ACEPTADA`. Usa `DialogoDeConfirmacion` con `permanente`, el botón de confirmar en rojo y `textoEnviando="Dándote de baja…"`. El foco vuelve al botón o, si la fila cambió, al título de la página (`destinoDeFoco`).
- Texto del diálogo de baja: título "¿Darte de baja de este proyecto?". Descripción con contribución pública: "Dejás de participar en «Título del proyecto», en el perfil «descripción recortada». Va a figurar como desvinculada en tu perfil público." Con contribución anónima: "…Como tu contribución es anónima, no figura en tu perfil público." Botones "Cancelar" y "Darme de baja". Si el perfil no tiene descripción se usa "Perfil N", y si el proyecto no cargó, "este proyecto". Sobre volver a postularse no se dice nada hasta que el back responda (ver "A acordar con el back").
- La baja usa `desvincularColaboracion(proyectoId, colaboracionId)` con `useMutacion`, con `mensajes: { 409: "Esta colaboración ya no está activa." }`. Después, con éxito o con error, se vuelve a pedir la lista (como `usePostulacionesRecibidas`), porque el estado pudo cambiar. Si el pedido se confirmó y falla la recarga, se avisa que el cambio se aplicó y se ofrece "Reintentar" solo la consulta.
- Mientras hay una baja en curso, el filtro y los botones de baja quedan deshabilitados.
- Resultado anunciado con `useAvisos` (`aria-live="polite"`), sin el mensaje crudo del back.
- La página consulta solo a través de un hook nuevo (`useMisPostulaciones`, en `Hooks/postulacion/`); los componentes no llaman a casos de uso ni a HttpClients.
- Textos de estado y de contribución en `Presentation/Formatos/colaboracion.js`. El estado y las opciones del filtro, compartidos con la 09 (ver "A confirmar").
- HTML semántico: un `<h1>`, lista (`<ul>`), foco visible, zonas de toque de 44 px, sin scroll horizontal a 320 px. Estados con texto además del color. Sin comentarios en el código ni dependencias nuevas.

## Estados

- Cargando: `Esqueleto` con la forma de la lista (barra del filtro y filas), con etiqueta "Cargando tus postulaciones…".
- Con datos: filtro y lista. Una fila con el proyecto sin cargar muestra el aviso dentro de la fila.
- Vacío: "Todavía no te postulaste a ningún proyecto" + "Buscar proyectos".
- Sin resultados: mensaje del filtro + "Ver todas".
- Error: `EstadoDeError` "No pudimos cargar tus postulaciones" con "Reintentar".
- Procesando: diálogo con "Dándote de baja…" y filtro deshabilitado.
- Error en la baja: el diálogo se cierra, aviso de error con el texto del hook y la lista actualizada.

## A confirmar

Aprobada el 08/11/2026 con las propuestas indicadas en cada punto.

1. **Aprobado: enlace en la navegación principal** ("Proyectos" · "Mis postulaciones"), en paralelo al "Panel del colectivo". Alternativa: dentro del menú de cuenta, junto a "Mi perfil".
2. **Aprobado: aviso de postulaciones anónimas.** Hasta que el back las devuelva a su dueña, la lista no las incluye. Propuesta: una línea informativa debajo del título, "Las postulaciones anónimas todavía no aparecen en esta lista.", que se saca cuando el back lo resuelva. Sin ella, la lista parece completa y no lo es.
3. **Aprobado: sin paginación.** El back no pagina este listado y la cantidad es acotada (una fila por perfil al que se postuló). Si preferís paginar en el front, hay que pedir los proyectos solo de la página visible.
4. **Aprobado: opciones del filtro compartidas con la 09.** Propuesta: mover `ESTADOS` de `PostulacionesRecibidasPage.jsx` a `Formatos/colaboracion.js` y usarlo en las dos pantallas, con un cambio mínimo en la 09. Alternativa: copiarlo y dejar la 09 sin tocar.
5. **"Desvinculada" para las dos situaciones — acordado.** El back usa el mismo estado cuando la colaboradora se da de baja y cuando el colectivo la desvincula. Se muestra "Desvinculada" sin decir quién, y el aviso de la baja propia dice "Te diste de baja del proyecto «Título»."
6. **Texto del diálogo — acordado.** Está en "Requisitos". Nombra el perfil por su descripción recortada (no por "Perfil N") y avisa que la baja se ve en el perfil público si la contribución es pública, porque `useHistorialPublico` incluye las desvinculadas. `DialogoDeConfirmacion` agrega "Esta acción no se puede deshacer."
7. **Retirar una pendiente: no se ofrece — acordado.** No existe en la API y `desvincular` responde 409 si la colaboración no está aceptada. Se pide al back (ver "A acordar con el back", punto 9).

## A acordar con el back

1. **Postulaciones anónimas propias.** `listarPorColaborador` filtra `c.esPublica`, así que la dueña no recibe las suyas anónimas (ya figura en la spec 06 y en el traspaso). Sin eso la pantalla es incompleta.
2. **Título del proyecto en cada fila.** `ColaboracionDeColaboradorDto` trae `proyectoId` y la colaboración, sin el proyecto. Hoy hay que pedir `GET /proyectos/:id` una vez por proyecto, y el back suma una visualización por cada GET: la colaboradora infla las visitas de los proyectos en los que ya participa. Propuesta: sumar `{ proyecto: { id, titulo, estado } }` al listado (y el título corto del perfil, ya pedido).
3. **Estado y fecha de la baja.** ¿Se puede distinguir la baja propia de la desvinculación del colectivo (otro estado o un campo `iniciadaPor`)? Hoy el aviso `DESVINCULACION` le llega a la propia colaboradora con el texto "Tu colaboración en el proyecto terminó por una desvinculación", incluso cuando ella se dio de baja, y el colectivo no recibe ninguno.
4. **Autorización de la baja.** Las rutas de colaboraciones no validan quién llama: cualquier identidad podría desvincular la colaboración de otra persona. Hace falta verificar que el solicitante sea la dueña de la colaboración (o el colectivo dueño). Es el mismo pendiente que la 09.
5. **Volver a postularse tras la baja.** ¿Puede postularse de nuevo al mismo perfil o responde 409 por "ya postulada"? De eso depende el texto del diálogo y lo que se ve después en el detalle del proyecto.
6. **Orden y paginación.** Si el listado se llega a paginar, filtrar por `estado` y ordenar por `fecha` descendente desde el servidor.
7. **Swagger desactualizado.** El esquema `Colaboracion` de `openapi.js` no lista `DESVINCULADA` ni el campo `perfil`.
8. **Identidad:** `GET /auth/me` para el `id` de la colaboradora (ya pendiente).
9. **Retirar una postulación pendiente** (no bloquea esta spec). Hoy una postulación hecha por error solo se resuelve si el colectivo la rechaza. Hace falta un endpoint propio; cuando exista, se suma a esta pantalla con confirmación.

## Fuera de alcance

- Valoraciones mutuas al finalizar (las finalizadas solo muestran su estado).
- Retirar una postulación pendiente, editar una postulación o cambiar su tipo de contribución.
- Postularse (spec 06), contactos (spec 12), mensajes (spec 11) y el nombre del colectivo en la fila (pendiente del back).

## Criterio de aceptación

- Los escenarios se recorren con la sesión simulada de colaboradora, a 1280 y a 320 px, y solo con teclado.
- Se probaron los estados: con datos, uno solo, muchos, vacío, sin resultados por filtro, proyecto que no carga, error (back apagado) y baja en curso.
- Recargar o compartir la URL mantiene el filtro, y volver desde el detalle del proyecto también.
- La baja pide confirmación explícita, no se puede enviar dos veces, y tras un 409 o una recarga fallida la pantalla queda coherente con el estado real.
- Tests: del hook `useMisPostulaciones` y de la página con `montarRutas` (lista y filtro, vacío, sin resultados, error con "Reintentar", baja confirmada, baja cancelada, baja con 409), más el de la navegación de la colaboradora.
- `npm run lint`, `npm run format:check`, `npm test`, `npm run build` en verde y checklist de `docs/criterios-pantallas-web.md` revisado.
