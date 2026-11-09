# Estadísticas globales de la plataforma

Origen: requerimientos adicionales 16 y 30 del enunciado, implementados en el back (`GET /estadisticas`).

## Intención

Mostrar a cualquier visitante cuánto se mueve la plataforma, para dar confianza a colectivos y colaboradoras que recién llegan.

## Escenarios

Dado cualquier visitante, con o sin sesión,
cuando entra a la portada,
entonces ve una sección "La plataforma en números" con colectivos activos, proyectos abiertos y finalizados, personas colaboradoras y colaboraciones.

Dado que el back todavía no tiene datos,
cuando se entra a la portada,
entonces la sección no se muestra (no se muestran ceros).

Dado que las estadísticas no cargan,
cuando se entra a la portada,
entonces el resto de la portada se ve igual y la sección muestra un error discreto con "Reintentar".

## Requisitos

- Datos de `EstadisticasGlobalesDto`: `colectivos.activos`, `proyectos.abiertos`, `proyectos.finalizados`, `colaboradores.total`, `colaboraciones.aceptadas + colaboraciones.finalizadas`.
- Las habilidades más requeridas y más ofrecidas (`habilidadesMasRequeridas`, `habilidadesMasOfrecidas`), hasta 5 de cada una, como chips.
- Los números se formatean con `Intl.NumberFormat("es-AR")`.
- Cada número tiene una etiqueta de texto visible; no se entiende solo por el ícono o el color.
- "Actualizado el …" con `generadoEn`.
- Consulta con un hook propio (`useEstadisticasGlobales`) sobre el caso de uso existente `obtenerEstadisticasGlobales`.

## Estados

- Cargando: esqueleto con la forma de las cifras, solo dentro de la sección.
- Con datos: cifras y chips.
- Vacío: la sección no se muestra.
- Error: mensaje breve y "Reintentar", sin mover el foco (no es el contenido principal de la portada).

## Fuera de alcance

- Gráficos históricos o por período.
- Mapa de ubicaciones (adicional 15, no asignado).

## A acordar con el back

- `RankingHabilidadDto` trae solo `codigo` y `cantidad`. Para mostrar el nombre hay que cruzarlo con el catálogo de habilidades (un pedido más) o que el back sume `titulo`.
- El back limita las estadísticas a 30 pedidos por minuto por IP: confirmar si conviene que la portada las pida en cada visita.

## A confirmar

- Ubicación: después de "Dos formas de empezar" o al final de la portada.

## Criterio de aceptación

- La portada muestra las cifras del back con sus etiquetas, y si las estadísticas fallan o están vacías, el resto de la portada no se ve afectado.
