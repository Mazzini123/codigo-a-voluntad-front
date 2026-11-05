# Mensajes internos

## Intención

Que colectivos y colaboradoras lean los mensajes y avisos que reciben dentro de la plataforma.

## Escenarios

Dado un usuario con mensajes,
cuando entra a "Mensajes",
entonces los ve del más reciente al más viejo, con asunto, fecha, extracto y marca de no leído.

Dado un mensaje no leído,
cuando lo abre,
entonces se marca como leído y baja el contador del menú.

Dado un usuario sin mensajes,
cuando entra,
entonces ve "No tenés mensajes".

## Requisitos

- Operaciones: `ListarNotificaciones` y `MarcarNotificacionComoLeida` (hoy por colaboradora; la bandeja del colectivo depende de la autenticación en el back).
- Contador de no leídos en la navegación, con texto accesible ("3 mensajes sin leer").
- Filtro leídos / no leídos.
- Paginación del servidor.
- Responder desde la plataforma: A definir.

## Estados

- Cargando, vacío, error.

## Fuera de alcance

- Chat en tiempo real, replicación por email/WhatsApp (es del back).

## Criterio de aceptación

- El contador y la lista coinciden; los no leídos se distinguen sin depender del color.
