# Administrar un proyecto (edición, perfiles y cierre)

Origen: la parte de `specs/backlog/04-mis-proyectos.md` que quedó fuera de la spec 04 al recortarla con `/impeccable shape` el 06/11/2026.

## Intención

Que un colectivo mantenga sus proyectos en el tiempo: corregirlos, sumar o quitar perfiles, abrir o cerrar búsquedas y finalizar el proyecto cuando terminó.

## Escenarios

Dado un proyecto,
cuando el colectivo agrega, edita o elimina un perfil,
entonces el cambio se ve en el detalle del proyecto.

Dado un perfil,
cuando el colectivo cierra o reabre su búsqueda, o cambia su fecha de cierre,
entonces el estado de la búsqueda se actualiza en el detalle.

Dado un proyecto abierto,
cuando el colectivo lo marca como finalizado y confirma,
entonces ya no recibe postulaciones y se muestra como "Finalizado".

## Requisitos

- Editar título, descripción, etiquetas y fecha de cierre del proyecto (`PUT /proyectos/:id`).
- Perfiles: agregar (`POST /proyectos/:id/perfiles`), editar (`PUT …/perfiles/:perfilId`) y eliminar (`DELETE …/perfiles/:perfilId`); habilidades requeridas y opcionales con sus `POST`/`DELETE` individuales.
- Reusar "¿Cómo querés sumar colaboradoras?" de la spec 04 para límite y modo de aceptación.
- Finalizar (`POST /proyectos/:id/finalizacion`) y eliminar un perfil con postulaciones: confirmación con `ConfirmDialog` que explique las consecuencias (se rechazan las pendientes y terminan las colaboraciones en curso).
- Eliminar un proyecto: no existe en la API; solo se finaliza.

## A definir

- Dónde viven las acciones: en el detalle (franja de dueño) o en una pantalla de administración propia.
- Si la edición de habilidades de un perfil publicado se guarda en el momento (como en la colaboradora) o con "Guardar cambios".

## Estados

- Cargando, error con "Reintentar", guardando y confirmación de lo permanente.

## Fuera de alcance

- Borradores.
