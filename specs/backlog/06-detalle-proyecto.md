# Detalle del proyecto

## Intención

Que cualquiera entienda de qué se trata un proyecto, qué perfiles busca y cómo sumarse.

## Escenarios

Dado un proyecto,
cuando alguien entra a su página,
entonces ve título, descripción, colectivo, estado, perfiles con habilidades requeridas y opcionales, compromiso, modalidad, límite de colaboraciones y estado de cada búsqueda.

Dado un perfil con personas aceptadas,
cuando se lo mira,
entonces se ve quién ocupa ese rol; si la contribución es anónima, "Contribución anónima".

Dado el colectivo dueño,
cuando entra a su proyecto,
entonces ve además los accesos a editar, postulaciones recibidas y buscar colaboradoras.

Dado un proyecto que no existe,
cuando se entra a su URL,
entonces ve "No encontramos este proyecto" con un link a la búsqueda.

## Requisitos

- Acción principal por perfil: "Postularme" (ver spec de postulación).
- Estado de la búsqueda por perfil con texto: "Abierta hasta el 30/11", "Límite alcanzado", "Cerrada".
- Quién ocupa cada perfil: colaboraciones aceptadas del proyecto, agrupadas por `perfil`.
- Link a la página de avance del proyecto.
- "← Volver a la búsqueda" conservando los filtros.

## Estados

- Cargando (skeleton), no encontrado, error con reintentar.

## Fuera de alcance

- Comentarios públicos, valoraciones.

## Criterio de aceptación

- La información se entiende sin color, la jerarquía tiene un solo h1 y cada rol ve sus acciones correspondientes.
