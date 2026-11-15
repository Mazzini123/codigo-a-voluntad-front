# Buscar y contactar colaboradoras (ver candidatas de un perfil e invitarlas)

Origen: borrador `specs/backlog/08-buscar-contactar-colaboradoras.md`, contrastado con el contrato de Reclutamiento de `docs/PLAN-ENTIDADES.md`, `docs/plan-front.md` (pantallas y rutas), `ReclutamientoHttpClient` y `InvitarColaborador` ya existentes en el front, el campo `recibeMensajeriaInterna` del formulario de la colaboradora (spec 03) y las specs 06, 09 y 10 ya hechas. **El back no estaba disponible al escribirla:** los DTOs del front son archivos vacíos (`export {};`) y no se pudo leer el Swagger ni el código del servidor, así que la forma de la respuesta y del request de invitación está sin verificar (ver "A acordar con el back").

## Intención

Que un colectivo dueño de un proyecto encuentre personas que encajan con uno de sus perfiles y les escriba un mensaje de invitación, sin ver nunca sus datos de contacto, y solo a quienes aceptaron recibir mensajes internos.

## Escenarios

Dado un perfil con búsqueda abierta de un proyecto propio,
cuando el colectivo toca "Buscar colaboradoras" (en el detalle del proyecto o en su administración),
entonces llega a una lista de personas que cumplen las habilidades requeridas, con su nombre, sus habilidades y cuántas de las opcionales tienen.

Dada una lista con más de una página,
cuando el colectivo cambia de página,
entonces la URL queda con `?pagina=` y al recargar o compartir el enlace se ve la misma página.

Dada una colaboradora que acepta mensajes internos,
cuando el colectivo toca "Contactar", escribe un mensaje y toca "Enviar invitación",
entonces el diálogo se cierra, ve "Invitación enviada a «nombre»." y esa fila muestra "Invitación enviada" en lugar del botón.

Dada una colaboradora que no acepta mensajes internos,
cuando aparece en la lista,
entonces "Contactar" está deshabilitado y dice el motivo: "No recibe mensajes internos."

Dado el diálogo de invitación,
cuando el mensaje está vacío o pasa de 500 caracteres,
entonces no se envía, el campo marca el error con texto y el contador dice cuántos caracteres quedan.

Dado el diálogo de invitación,
cuando se cancela (botón o Esc),
entonces no se envía nada, el mensaje escrito se descarta y el foco vuelve a "Contactar" de esa fila.

Dado un envío que falla,
cuando el back responde con error,
entonces el diálogo sigue abierto con el mensaje escrito y el error en lenguaje de la persona (sin el texto crudo del back), y se puede reintentar.

Dado un perfil sin candidatas,
cuando el colectivo entra,
entonces ve "Todavía no hay colaboradoras con estas habilidades" y un enlace "Volver al proyecto".

Dado un perfil cuya búsqueda está cerrada, vencida o en un proyecto finalizado,
cuando el colectivo mira el perfil en el detalle o en la administración,
entonces "Buscar colaboradoras" está deshabilitado con el motivo, igual que "Postularme" para las colaboradoras.

Dada una persona sin sesión, una colaboradora o un colectivo que no es dueño del proyecto,
cuando abre la ruta por URL directa,
entonces va a ingresar y vuelve acá, o ve `/sin-permiso`, sin ningún dato.

## Requisitos

- Ruta `RUTA_COLABORADORAS_POTENCIALES = "/proyectos/:id/perfiles/:perfilId/colaboradoras"` y `rutaColaboradorasPotenciales(id, perfilId)` en `Routes/rutas.js`, dentro de `RutaProtegida roles={[ROL_CUENTA.COLECTIVO]}` y `RutaDelDueno`, con `PantallaDiferida`, como `/proyectos/:id/postulaciones` (spec 09). Se actualiza la tabla de rutas de `docs/plan-front.md`, que hoy dice `/colectivo/proyectos/:id/perfiles/:perfilId/colaboradoras` (ver "A confirmar", punto 1).
- Entradas: un enlace "Buscar colaboradoras" por perfil, visible solo para el colectivo dueño, en el detalle del proyecto (hoy `AccionDePerfil` devuelve `null` para el colectivo) y en la administración. Si el perfil no está abierto, el botón queda deshabilitado con `motivoNoPostulable(perfil, proyecto)`. Si el proyecto está finalizado no se muestra.
- Fuente de la lista: `buscarColaboradorasPotenciales(proyectoId, perfilId, { page, limit: 12 }, { signal })`, que devuelve una página de `{ colaborador, habilidadesOpcionalesQueTiene }`. Se adapta con `aPagina` como los demás listados.
- El título del proyecto y la descripción del perfil salen de `obtenerProyecto`, en paralelo con la lista (con `useConsulta`, un hook por pantalla). Si el perfil ya no existe en el proyecto: `MensajeDePantalla` "Este perfil ya no existe" con "Volver al proyecto".
- Cabecera: `<h1>` "Colaboradoras para este perfil", el título del proyecto, la descripción del perfil (recortada a dos líneas) y "Volver al proyecto" (`rutaProyecto(id)`).
- Cada candidata: `<h2>` con `nombreVisible(colaborador)` como enlace a `rutaColaboradora(id)` con `estadoParaVolver` ("Volver a las colaboradoras del perfil"), sus habilidades (nombres, de las que el back devuelve) y el texto "Tiene N de M habilidades opcionales" (M = las opcionales del perfil). Sin color como único indicador.
- Nunca se muestran medios de contacto, correo ni cuentas externas privadas en esta pantalla, aunque el back los enviara. Se renderizan solo los campos nombrados arriba.
- "Contactar" habilitado únicamente si `colaborador.recibeMensajeriaInterna === true`; cualquier otro valor (falso, ausente) deshabilita el botón con "No recibe mensajes internos." (`motivoDeshabilitado` de `Boton`). El back igual valida.
- Diálogo de invitación con `DialogoDeConfirmacion` (`permanente={false}`, confirmar "Enviar invitación", `textoEnviando="Enviando…"`) y un `Campo` de texto multilínea "Mensaje" como `children`. Título: "Invitar a «nombre»". Descripción: "Va a recibir tu mensaje en su bandeja de la plataforma, para el perfil «descripción recortada» de «proyecto»." No se dice nada sobre datos de contacto.
- Validación en el front: el mensaje no puede estar vacío ni pasar de 500 caracteres (se recorta con `.trim()` solo para validar). El contador es un texto con `aria-live="polite"` al acercarse al límite. Lo que no valida el front lo valida el back (`issues` se traducen con el helper existente de errores por campo si el back devuelve alguno).
- La invitación usa `invitarColaborador(proyectoId, perfilId, request, { signal })` con `useMutacion` y `mensajes` por status propios: 409 "Ya invitaste a esta persona para este perfil." y 422 "El mensaje no es válido. Revisalo." (ver "A acordar con el back", punto 1). Mientras hay un envío en curso, los demás botones de "Contactar" y el cambio de página quedan deshabilitados.
- Tras el éxito, el envío no recarga la lista: se marca la fila como invitada en el estado de la pantalla ("Invitación enviada", con `<Chip>` y texto, sin botón). La marca vive solo en la sesión de la página; no se guarda ni se pide al back (ver "A confirmar", punto 4).
- Resultado anunciado con `useAvisos` (`aria-live="polite"`), sin el mensaje crudo del back.
- Páginas por `useSearchParams` (`?pagina=`), con `Paginacion` compartido; fuera de rango se lleva a la última página.
- La página consulta solo a través de hooks nuevos en `Hooks/reclutamiento/`: `useColaboradorasPotenciales` (lista + proyecto) y `useInvitarColaborador`; los componentes no llaman a casos de uso ni a HttpClients.
- Textos nuevos en `Presentation/Formatos/reclutamiento.js` (opcionales que tiene, motivo de "Contactar", descripción del diálogo).
- HTML semántico: un `<h1>`, lista (`<ul>`), foco visible, zonas de toque de 44 px, sin scroll horizontal a 320 px, labels reales. Sin comentarios en el código ni dependencias nuevas.

## Estados

- Cargando: `Esqueleto` con la forma de cabecera y tres tarjetas, etiqueta "Cargando colaboradoras…".
- Con datos: cabecera, lista y paginación.
- Vacío: "Todavía no hay colaboradoras con estas habilidades" + "Volver al proyecto". No hay "sin resultados", porque no hay filtros.
- Error: `EstadoDeError` "No pudimos cargar las colaboradoras" con "Reintentar".
- Enviando: diálogo con "Enviando…", cancelar y Esc deshabilitados mientras dura.
- Error al enviar: el diálogo sigue abierto con el mensaje escrito y el error dentro.
- Perfil inexistente o proyecto no accesible: `MensajeDePantalla` (el 404/403 del back se traduce a texto de persona).

## A confirmar

Aprobada el 09/11/2026 con las propuestas indicadas en cada punto.

1. **Ruta.** Propuesta: `/proyectos/:id/perfiles/:perfilId/colaboradoras`, para que `RutaDelDueno` (que lee `:id`) y las rutas hermanas (`/proyectos/:id/postulaciones`, `/proyectos/:id/administrar`) sigan la misma forma. Alternativa: dejar `/colectivo/proyectos/:id/...` como dice `plan-front.md`, lo que obliga a otra guarda o a cambiar la actual.
2. **Entradas.** Propuesta: el botón en cada perfil del detalle del proyecto y de la administración. Alternativa: solo en la administración.
3. **Perfil cerrado.** Propuesta: botón deshabilitado con motivo, para que el colectivo entienda por qué. Alternativa: dejar buscar siempre, aunque el perfil no reciba postulaciones.
4. **"Invitación enviada" solo en la sesión de la pantalla.** Propuesta: la marca se pierde al recargar y la persona podría recibir otra invitación (el back responde 409 si lo prohíbe). Alternativa: esperar a que el back indique en cada candidata si ya fue invitada.
5. **Un solo campo de mensaje, máximo 500 caracteres,** validado también en el front. Sin plantillas ni asunto.
6. **Orden y 12 por página.** Propuesta: el orden que entrega el back (ver punto 5 de "A acordar con el back"), 12 por página como en "Buscar proyectos".

## A acordar con el back

1. **Request de invitación.** Falta confirmar el cuerpo de `InvitarColaboradorRequest` (se asume `{ colaboradorId, mensaje }`), los límites (500 caracteres, hoy solo en el borrador) y los códigos de error: ¿409 si ya la invitaron? ¿422 por mensaje inválido? ¿qué status si la persona no acepta mensajes?
2. **Preferencia de contacto en cada candidata.** ¿`ColaboradoraPotencialDto.colaborador` incluye `recibeMensajeriaInterna`? Sin ese campo no se puede deshabilitar "Contactar" con motivo; habría que pedirlo o dejar que el back rechace.
3. **Sin datos privados.** Confirmar que el listado no devuelve `mediosDeContacto` ni otros campos privados de la colaboradora, como ya se pidió para `GET /colectivos/:id`.
4. **Autorización.** Que el back valide que quien consulta e invita es el colectivo dueño del proyecto (mismo pendiente que en las specs 09 y 10): hoy el front solo oculta botones.
5. **Qué significa "cumple".** ¿Solo devuelve personas con todas las habilidades requeridas? ¿Cómo ordena: por opcionales que tienen, de mayor a menor? ¿Excluye a quienes ya postularon, colaboran o fueron invitadas?
6. **Forma de la respuesta.** Confirmar `{ colaborador, habilidadesOpcionalesQueTiene }`: ¿`habilidadesOpcionalesQueTiene` es una cantidad o una lista de habilidades? De eso depende el texto "Tiene N de M".
7. **Qué recibe la colaboradora.** La invitación devuelve `NotificacionDto` (tipo `INVITACION`). La bandeja es la spec 11; hasta que exista, la persona no tiene dónde leerla. Confirmar que el mensaje viaja en la notificación y qué referencias lleva (proyecto y perfil).
8. **Paginación del listado.** Confirmar `page` y `limit` y el formato de `meta`, como en los demás listados.
9. **Swagger y DTOs.** Documentar `ColaboradoraPotencialDto` e `InvitarColaboradorRequest`; hoy los contratos del front son archivos vacíos.

## Fuera de alcance

- Notificaciones automáticas a candidatas compatibles (`PROYECTOS_COMPATIBLES`).
- La bandeja de mensajes de la colaboradora y la respuesta a la invitación (spec 11).
- Los datos de contacto de quien aceptó (spec 12).
- Filtros, búsqueda por texto o por habilidad dentro de la lista, y reenviar o editar una invitación.
- Aceptar a una candidata directamente: sigue siendo por postulación (spec 09).

## Criterio de aceptación

- Los escenarios se recorren con la sesión simulada de colectivo dueño, a 1280 y a 320 px y solo con teclado, y el flujo completo de invitar funciona contra un back o respuestas simuladas.
- Se probaron los estados: con datos, una sola página y varias, vacío, error (back apagado), envío en curso, error al enviar, perfil inexistente y candidata que no recibe mensajes.
- Ninguna combinación de rol y URL muestra candidatas sin ser el colectivo dueño; la pantalla nunca muestra datos de contacto.
- El diálogo no envía vacío ni más de 500 caracteres, no se puede enviar dos veces, y cancelar o Esc devuelve el foco al botón.
- Tests: de los hooks `useColaboradorasPotenciales` y `useInvitarColaborador`, de la página con `montarRutas` (lista, paginación en la URL, vacío, error con "Reintentar", "Contactar" deshabilitado con motivo, invitación enviada, validación del mensaje, cancelar, 409 y error al enviar, acceso por rol y por dueño) y del botón "Buscar colaboradoras" en el detalle y la administración (habilitado, deshabilitado con motivo y oculto).
- `npm run lint`, `npm run format:check`, `npm test`, `npm run build` en verde y checklist de `docs/criterios-pantallas-web.md` revisado.
