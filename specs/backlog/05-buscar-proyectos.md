# Buscar proyectos

## Intención

Que las personas encuentren proyectos donde puedan aportar, empezando por los que encajan con sus habilidades.

## Escenarios

Dada una colaboradora con sesión,
cuando entra a buscar sin filtros,
entonces ve primero los proyectos con perfiles abiertos que encajan con sus habilidades, con un indicador "Tenés 2 de 3 habilidades requeridas".

Dado cualquier visitante,
cuando filtra por etiqueta (y los filtros que soporte el back),
entonces la lista se actualiza y los filtros quedan en la URL.

Dados filtros sin resultados,
cuando se aplica la búsqueda,
entonces ve "No encontramos proyectos con esos filtros" y un botón para limpiarlos.

Dada una búsqueda con varias páginas,
cuando entra a un proyecto y vuelve,
entonces conserva filtros y página.

## Requisitos

- Operaciones: `ListarProyectos` (filtro por etiqueta, paginado) y `BuscarProyectosPotenciales` para la colaboradora.
- Tarjeta de proyecto: título, colectivo, perfiles abiertos, habilidades (chips), compromiso y modalidad legibles.
- Opciones de filtros cargadas del back, no de los resultados.
- Paginación del servidor con "Mostrando X de Y".
- Otros filtros (habilidad, tipo de colectivo, ubicación, modalidad, texto): A definir, el back hoy solo filtra por etiqueta.
- Proyectos finalizados: A definir (¿ocultos por defecto con un filtro para verlos?).

## Estados

- Cargando: skeleton de tarjetas. Vacío, sin resultados y error con reintentar.

## Fuera de alcance

- Mapa de proyectos, proyectos destacados.

## Criterio de aceptación

- Recargar o compartir la URL muestra la misma búsqueda; funciona en celular y con teclado.
