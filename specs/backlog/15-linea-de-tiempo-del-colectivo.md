# Línea de tiempo del colectivo

Origen: requerimiento adicional 19 del enunciado, implementado en el back (`GET /colectivos/:id/timeline`).

## Intención

Mostrar en la página pública de cada colectivo su historia en la plataforma: cuándo se sumó, qué proyectos publicó, sus logros, avances y colaboraciones cerradas.

## Escenarios

Dado cualquier visitante,
cuando entra a la página pública de un colectivo,
entonces ve la sección "Historia" con los eventos del más reciente al más viejo, cada uno con su fecha y un texto que dice qué pasó.

Dado un evento de colaboración cerrada anónima,
cuando se muestra,
entonces dice "Una persona colaboradora terminó su colaboración en …", sin nombre ni enlace.

Dado un colectivo dado de baja,
cuando alguien entra a su página pública,
entonces ve el aviso de baja y su historia completa, con la baja como último evento.

## Requisitos

- Un texto por tipo de evento (`TIPO_EVENTO_TIMELINE`), armado en `Formatos/` con un diccionario: alta, proyecto creado, logro, avance (con su %), colaboración cerrada, proyecto finalizado y baja.
- El proyecto de cada evento enlaza a su detalle con `rutaProyecto(id)`; la colaboradora, si no es anónima, con `rutaColaboradora(id)`.
- Fechas con `<time dateTime>` y `fechaLarga`.
- Lista ordenada (`<ol>`); el orden lo da el back.
- Con muchos eventos, se muestran los 10 últimos y "Ver toda la historia".
- Hook propio (`useLineaDeTiempo`) sobre `obtenerTimelineDeColectivo`.

## Estados

- Cargando: esqueleto de tres eventos dentro de la sección.
- Con datos: la lista.
- Vacío: no debería pasar (el alta siempre está); si pasa, la sección no se muestra.
- Error: `EstadoDeError` con "Reintentar" en la sección, sin afectar el resto de la página.

## Fuera de alcance

- Filtrar por tipo de evento.

## A confirmar

- Si la historia va debajo de los proyectos del colectivo o en una pestaña propia.

## Criterio de aceptación

- La página del colectivo muestra la historia con un texto entendible por evento, respeta el anonimato y cada enlace lleva a la pantalla correcta.
