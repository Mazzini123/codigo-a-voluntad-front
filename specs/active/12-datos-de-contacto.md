# Datos de contacto de una colaboradora

Origen: borrador del backlog, contrastado con `docs/PLAN-ENTIDADES.md` (`ObtenerContactoDeColaborador`), la spec 09 (filas de postulaciones recibidas, anonimato y guarda `RutaDelDueno`) y `docs/plan-front.md` (privacidad visible).

Estado: aprobada el 09/11/2026 (sección «A confirmar» incluida) e implementada en frontend el mismo día. Queda en `active/` por la sección «A acordar con el back»: la ruta de contacto sigue suspendida y la pantalla se probó solo con respuestas simuladas.

## Intención

Que el colectivo dueño de un proyecto acceda a los medios de contacto de quien tiene una colaboración aceptada en él, y que nadie más pueda verlos.

## Escenarios

Dado un colectivo dueño del proyecto con una postulación aceptada de una persona que no es anónima,
cuando en «Postulaciones recibidas» toca «Ver datos de contacto» en esa fila,
entonces llega a la pantalla de contacto y ve cada medio registrado (tipo y valor), con un botón «Copiar» por dato.

Dado ese mismo acceso,
cuando toca «Copiar» en un dato,
entonces el valor queda en el portapapeles y se anuncia «Copiaste el email» (o el tipo que corresponda). Si el navegador no permite copiar, se avisa y el dato sigue visible para seleccionarlo a mano.

Dado un colectivo dueño que entra por URL directa a la pantalla de una persona sin colaboración aceptada en el proyecto,
cuando el back responde 403,
entonces ve «Estos datos se comparten solo cuando aceptás su postulación» y ningún dato, con enlace de vuelta a las postulaciones.

Dada una persona aceptada sin medios de contacto cargados,
cuando el colectivo con acceso consulta,
entonces ve «Esta persona no cargó medios de contacto; podés escribirle por mensajería interna».

Dada una persona que no es el colectivo dueño del proyecto (colaboradora, otro colectivo, visitante),
cuando intenta entrar por URL directa,
entonces la guarda de ruta la frena antes de consultar nada: sin sesión va a ingresar; con otro rol u otro colectivo ve la pantalla estándar de «sin permiso». En ningún caso se hace el pedido de contacto.

Dada una postulación aceptada y anónima,
cuando el colectivo mira su fila,
entonces no hay «Ver datos de contacto» y la fila indica «Contribución anónima: no se comparten datos de contacto».

## Requisitos

- Ruta `/proyectos/:id/colaboradoras/:colaboradorId/contacto` bajo `RutaProtegida` (COLECTIVO) y `RutaDelDueno`, con su constante y su función `rutaContactoDeColaboradora(id, colaboradorId)` en `Routes/rutas.js`. Reemplaza la ruta `/colectivo/proyectos/:id/colaboradoras/:colaboradorId/contacto` de `plan-front.md`, que se actualiza al cerrar la spec.
- Operación: `ObtenerContactoDeColaborador` (`GET /proyectos/:proyectoId/colaboradores/:colaboradorId/contacto`, respuesta `MedioDeContactoDto[]`, con sesión). La ruta está suspendida en el back y responde 404 hasta que verifique identidad y pertenencia: mientras tanto la pantalla se prueba con respuestas simuladas.
- Hook `useContactoDeColaborador(proyectoId, colaboradorId)` en `Hooks/proyecto/`, sobre `useConsulta`, con `{ medios, error, cargando, reintentar }`. La pantalla no llama al caso de uso directamente.
- El contacto se pide solo al entrar a esta pantalla: no se precarga desde la lista de postulaciones, no se guarda en el `state` del router, en la URL, en `localStorage` ni en ningún contexto, y se descarta al salir.
- Nombre de la persona en el título: se obtiene del perfil público (`ObtenerColaborador`) en un pedido aparte. Si falla o tarda, la pantalla muestra «Datos de contacto» y los medios igual: el nombre nunca bloquea el contacto.
- En la fila de la spec 09, «Ver datos de contacto» (enlace con apariencia de botón, `EnlaceBoton`) aparece solo si `fila.estado` es aceptada, `fila.esPublica !== false` y la fila trae `colaborador.id`. Lleva `estadoParaVolver` para regresar a las postulaciones. El back igual valida.
- Cada medio se muestra con etiqueta legible (`EMAIL` → «Email», `WHATSAPP` → «WhatsApp», `SMS` → «SMS»; un tipo desconocido se muestra tal cual) y su valor como texto seleccionable. Formato en `Presentation/Formatos/contacto.js`.
- «Copiar» usa `navigator.clipboard.writeText` (hook `useCopiarAlPortapapeles` en `Hooks/comunes/`, sin dependencias nuevas). El botón dice «Copiar» con nombre accesible «Copiar email» (según tipo) y la confirmación se anuncia con `useAvisos` (`aria-live`). Si copiar falla, `avisar.error` con «No pudimos copiar. Seleccioná el texto y copialo a mano.».
- Mensajes por status, definidos por el hook (`useMutacion`/`useConsulta` con `mensajes`): 403 → «Estos datos se comparten solo cuando aceptás su postulación»; 404 → «No encontramos a esta persona en el proyecto»; el resto, el mensaje estándar de `ApiError` con «Reintentar». Nunca se muestra el error crudo ni el status.
- Mensaje de privacidad visible bajo el título: «Estos datos son privados. Compartilos solo para coordinar el trabajo en este proyecto.»
- Enlace «Volver a las postulaciones» siempre presente, también en 403, 404 y error.
- HTML semántico (`h1` con el nombre, lista `ul` de medios, un `button` real por «Copiar»), foco visible, contraste 4.5:1 y sin scroll horizontal a 320 px. Al cargar, el foco queda en el `h1` (`tabIndex={-1}`), como en la 09.

## Estados

- Verificando acceso (guarda de dueño), cargando (esqueleto «Cargando datos de contacto…»).
- Con datos: lista de medios con «Copiar».
- Vacío: persona sin medios cargados (mensaje de mensajería interna).
- Sin acceso (403) y no encontrada (404): mensaje y enlace de vuelta, sin datos.
- Error de red u otro: `EstadoDeError` con «Reintentar».
- Copiado / no se pudo copiar: aviso anunciado, sin cambiar la pantalla.

## A confirmar

- Ruta bajo `/proyectos/:id/...` con `RutaDelDueno` (igual que 08 y 09) en lugar de `/colectivo/proyectos/...` del plan. Es lo que permite reusar la guarda sin otra.
- Pantalla propia en lugar de un panel o diálogo en la fila: permite URL directa, volver con «atrás» y probar cada estado por separado.
- El escenario original del borrador decía que «otra colaboradora» ve el mensaje de «solo cuando aceptás». Acá la ve solo el dueño sin acceso (403); el resto recibe «sin permiso» de la guarda, porque nunca llega a pedir datos.
- Acceso solo desde la fila de «Postulaciones recibidas». No hay enlace desde el perfil público `/colaboradoras/:id` (no tiene contexto de proyecto).
- Para postulaciones anónimas no hay acceso a contacto desde el front (la fila no trae el id).

## A acordar con el back

- Habilitar la ruta `GET /proyectos/:proyectoId/colaboradores/:colaboradorId/contacto`: hoy responde 404 por estar suspendida. Debe validar que el solicitante es el colectivo dueño del proyecto y que la persona tiene una colaboración aceptada ahí.
- Códigos: 403 para dueño sin colaboración aceptada y 404 solo si el proyecto o la persona no existen. Si la ruta suspendida sigue devolviendo 404, la pantalla diría «no encontramos a esta persona» a un dueño con acceso legítimo.
- Forma de `MedioDeContactoDto`: asumimos `{ tipo, valor }` (coincide con `DELETE .../medios-de-contacto/:tipo/:valor`). Confirmar y si hay otros campos.
- Colaboración desvinculada o finalizada: ¿conserva o pierde el acceso al contacto? El front muestra el botón solo en «aceptada»; si el back lo mantiene tras finalizar el proyecto, habría que mostrarlo también ahí.
- Postulaciones anónimas aceptadas: si el equipo quiere que el dueño contacte a esas personas, hace falta un camino que no revele identidad (por ejemplo, contacto por ID de colaboración). Mientras tanto, no hay acceso.
- `GET /colaboradores/:id/medios-de-contacto` «solo para la dueña» (pendiente del traspaso) es otra cosa: la lectura por la propia colaboradora para editar su perfil. No lo usa esta spec.

## Fuera de alcance

- Control granular de qué atributos son públicos.
- Enlaces directos `mailto:`, `tel:` o `wa.me`, y envío de mensajes desde esta pantalla (la mensajería es la spec 11).
- Contacto de postulaciones anónimas.
- Editar o quitar los medios de contacto (spec 03).

## Criterio de aceptación

- Ninguna combinación de rol, sesión y URL muestra datos sin acceso: la guarda frena antes del pedido y el 403 no deja rastro de datos en pantalla.
- El error nunca expone detalles técnicos y cada estado (cargando, datos, vacío, 403, 404, error con «Reintentar») se ve y se anuncia.
- Se prueban: botón en la fila solo para aceptadas y no anónimas; datos, vacío, 403, 404, error y reintento; copiar con éxito y con falla del portapapeles; que el nombre pueda fallar sin ocultar los medios; y que sin dueño no se hace el pedido de contacto.
- Se verifican escritorio, 320 px y teclado (foco al `h1`, «Copiar» con Tab y Enter). Pasan lint, formato, tests y build.
