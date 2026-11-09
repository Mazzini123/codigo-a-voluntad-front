# Mensajes internos (bandeja de notificaciones)

Origen: borrador `specs/backlog/11-mensajes.md`, contrastado con el módulo Notificación de `docs/PLAN-ENTIDADES.md`, `docs/plan-front.md` (ruta `/mensajes`, ambos roles) y los casos de uso y el HttpClient que ya existen.

Estado: aprobada (09/11/2026) con las tres decisiones de «Decisiones tomadas». Se implementa en una sesión nueva.

## Hallazgos que condicionan la spec

- El contrato solo tiene la bandeja de la colaboradora: `GET /colaboradores/:id/notificaciones` y `POST …/:notificacionId/lectura`. No hay ruta para el colectivo. Hoy el colectivo no recibe notificaciones (invita, pero no recibe).
- `NotificacionDto` no tiene forma verificada: el borrador pide «asunto», «extracto» y «leída», y el contrato solo menciona `tipo` (`TIPO_NOTIFICACION`) y `referencias` (ids de invitación, resolución y `proyectoIds`). Si el back no manda un texto, el front lo arma según el `tipo`.
- No hay filtro ni contador de no leídos documentados. El enunciado (tercera entrega, caso de uso 7) pide solo un «listado de mensajes internos»: el contador y el filtro vienen del borrador del equipo, no del enunciado.

## Decisiones tomadas

1. Primera versión solo para colaboradora (coincide con el enunciado y con el contrato). El colectivo no ve el enlace «Mensajes».
2. Cada mensaje se abre desplegándose en la misma lista (`<details>`), sin pantalla propia.
3. Contador en el menú y filtro leídos / no leídos quedan fuera hasta que el back los soporte (acuerdos 2 y 4). Cada mensaje sin leer se distingue con el texto «Sin leer».

## Intención

Que la colaboradora lea dentro de la plataforma los avisos que recibe (invitaciones, resolución de postulaciones, desvinculación, proyectos compatibles) y vea cuántos le faltan leer.

## Escenarios

Dada una colaboradora con mensajes,
cuando entra a «Mensajes» (`/mensajes`),
entonces los ve del más reciente al más viejo, con título según el tipo, fecha, extracto y la marca «Sin leer» en los no leídos.

Dado un mensaje sin leer,
cuando lo abre,
entonces se despliega, se marca como leído (desaparece «Sin leer») y se anuncia el cambio.

Dada una colaboradora sin mensajes,
cuando entra,
entonces lee «No tenés mensajes».

Dado un mensaje que referencia un proyecto,
cuando lo abre,
entonces tiene un enlace al proyecto (con `estadoParaVolver`).

Dado un fallo al marcar como leído,
cuando la colaboradora abre el mensaje,
entonces puede leerlo igual y se avisa «No pudimos marcarlo como leído» sin el error crudo.

## Requisitos

- Ruta `/mensajes` con `RUTA_MENSAJES`, bajo `RutaProtegida` (colaboradora), con carga diferida y enlace «Mensajes» en la navegación de la colaboradora, sin contador.
- Operaciones del contrato: `ListarNotificaciones` y `MarcarNotificacionComoLeida`. No se agregan rutas.
- Hooks: `useMensajes(colaboradorId, pagina)` con `useConsulta`, y `useMarcarComoLeido` con `useMutacion`.
- Página en `?pagina=` con `Paginacion`. Sin filtro por estado en esta versión.
- Los no leídos se distinguen por texto («Sin leer») y peso, no solo por color.
- Textos por tipo en `Formatos/mensaje.js`.
- Estados: cargando (esqueleto), vacío, error con «Reintentar».
- Accesibilidad: un solo `h1` con foco al entrar, lista semántica, controles de 44 px, sin scroll horizontal a 320 px.

## Estados

- Cargando: esqueleto «Cargando tus mensajes…».
- Con datos: lista paginada.
- Vacío: «No tenés mensajes».
- Sin resultados: no aplica (no hay filtros).
- Error: `EstadoDeError` con «Reintentar».

## A confirmar

- Nada pendiente: ver «Decisiones tomadas». «Responder desde la plataforma» queda fuera de alcance.

## A acordar con el back

1. Forma de `NotificacionDto`: `id`, `tipo`, `fecha`, `leida`, `titulo` o `asunto`, `texto`, `referencias`.
2. Filtro `leida` en el listado y total de no leídas (en `meta` o con un endpoint), para sumar después el contador y el filtro.
3. Orden del listado (el front asume del más reciente al más viejo).
4. Bandeja del colectivo: ruta y autorización.
5. Autorización: que solo la dueña de la bandeja la lea y marque lecturas.
6. Si marcar como leída un mensaje ya leído es idempotente.

## Fuera de alcance

- Contador de no leídos en el menú y filtro leídos / no leídos (a retomar cuando el back los soporte).
- Chat en tiempo real, respuestas, y replicación por email o WhatsApp (es del back).
- Borrar o archivar mensajes (no existe en el contrato).

## Criterio de aceptación

- Los no leídos se distinguen sin depender del color y dejan de marcarse al abrirlos.
- Se prueban: datos, vacío, error con reintento, abrir y marcar como leído (con fallo), paginación en la URL, y que un colectivo o una visitante no accedan.
- Se verifican escritorio, 320 px y teclado. Pasan lint, formato, tests y build.
