# Mis proyectos (alta, edición, cierre)

## Intención

Que un colectivo publique proyectos con los perfiles que necesita y los administre en el tiempo.

## Escenarios

Dado un colectivo,
cuando crea un proyecto con título, descripción y al menos un perfil,
entonces el proyecto queda publicado y aparece en "Mis proyectos" y en la búsqueda.

Dado un proyecto,
cuando agrega, edita o elimina un perfil,
entonces el cambio se ve en el detalle del proyecto.

Dado un perfil,
cuando el colectivo cierra o reabre su búsqueda, o cambia su fecha de cierre,
entonces el estado de la búsqueda se actualiza en el detalle.

Dado un proyecto abierto,
cuando el colectivo lo marca como finalizado y confirma,
entonces ya no recibe postulaciones y se muestra como "Finalizado".

Dado un colectivo sin proyectos,
cuando entra a "Mis proyectos",
entonces ve un estado vacío con "Crear el primer proyecto".

## Requisitos

- Cada perfil tiene: descripción, una o más habilidades requeridas, habilidades opcionales, compromiso (X horas totales, semanales o mensuales) y modalidad (gratuita, con incentivo económico, posibilidad de contratación).
- Por perfil: búsqueda abierta o cerrada, fecha de cierre opcional, límite de colaboraciones opcional y modo de aceptación (revisión manual por defecto, "todo suma" sin límite, "hasta llenar vacantes" con límite). Las combinaciones inválidas las rechaza el back; el formulario guía para no elegirlas.
- Fecha de cierre del proyecto opcional (cierre automático).
- El listado muestra por proyecto: estado, postulaciones pendientes y avance.
- Finalizar y eliminar un perfil con postulaciones: confirmación que explique las consecuencias.
- Eliminar un proyecto: no existe en la API; solo se finaliza.

## Estados

- Cargando (skeleton de tarjetas), vacío, error con reintentar, guardando.

## Fuera de alcance

- Borradores.

## Criterio de aceptación

- El colectivo puede crear, editar y finalizar proyectos y perfiles sin salir de la sección; las validaciones se ven por campo.
