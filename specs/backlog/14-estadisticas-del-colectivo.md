# Estadísticas del colectivo

Origen: requerimiento adicional 17 del enunciado ("panel de control" de la organización), implementado en el back (`GET /colectivos/:id/estadisticas`).

## Intención

Que el colectivo vea en su panel cómo les va a sus proyectos: cuántas veces los vieron, cuánto avanzaron y cuántas colaboraciones sumaron.

## Escenarios

Dado un colectivo con sesión,
cuando entra al Resumen de su panel,
entonces ve sus totales (proyectos abiertos y finalizados, colaboraciones, visualizaciones, avance promedio y logros) y una tabla por proyecto.

Dado un colectivo sin proyectos,
cuando entra al Resumen,
entonces ve "Todavía no publicaste proyectos" y el acceso a "Publicar un proyecto".

## Requisitos

- Datos de `EstadisticasColectivoDto`: `proyectos.abiertos`, `proyectos.finalizados`, `colaboraciones.pendientes`, `colaboraciones.aceptadas`, `colaboraciones.finalizadas`, `visualizaciones`, `avancePromedio` (en %), `logros`.
- Tabla por proyecto (`porProyecto`): título con enlace al detalle, estado con su sello, visualizaciones, avance en %, logros y colaboraciones. Encabezados reales (`<th scope="col">`) y unidades en el encabezado.
- En celular la tabla se convierte en una lista de tarjetas, sin scroll horizontal.
- Hook propio (`useEstadisticasDelColectivo`) sobre `obtenerEstadisticasDeColectivo`.
- Solo el colectivo dueño ve el panel (ya lo resuelve `RutaProtegida` con el rol).

## Estados

- Cargando: esqueleto de las cifras y de tres filas.
- Con datos: cifras y tabla.
- Vacío: sin proyectos, mensaje y acción para publicar.
- Error: `EstadoDeError` con "Reintentar" dentro de la sección; el resto del panel sigue usable.

## Fuera de alcance

- Gráficos de evolución en el tiempo.
- Exportar a CSV.

## A acordar con el back

- Confirmar qué cuenta como visualización (hoy `GET /proyectos/:id` suma una por pedido, también las del propio colectivo).

## A confirmar

- Si las cifras reemplazan a lo que hoy muestra el Resumen (`datosDelPanel`) o se suman debajo.

## Criterio de aceptación

- El Resumen muestra las cifras y la tabla por proyecto del back, la tabla es navegable con lector de pantalla y en 320 px no hay scroll horizontal.
