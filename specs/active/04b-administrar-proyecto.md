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

Dado un proyecto de otro colectivo,
cuando alguien abre directamente su URL de administración,
entonces ve "Sin permiso" y no puede realizar cambios.

## Requisitos

- Pantalla propia en `/proyectos/:id/administrar`. Se accede desde «Administrar proyecto» en la franja del dueño del detalle y se puede volver al detalle. La ruta exige rol colectivo y verifica la pertenencia con el mecanismo actual de Mis proyectos. Mientras se verifica, no se muestran controles de edición. Un error de verificación permite reintentar.
- Editar título, descripción, etiquetas y fecha de cierre del proyecto mediante `PUT /proyectos/:id`. Enviar solo campos modificados. Reusar los campos y validaciones del alta que apliquen.
- Agregar y editar perfiles con el formulario de la spec 04, incluido «¿Cómo querés sumar colaboradoras?». Mostrar los estados de búsqueda con los sellos existentes y ofrecer cerrar o reabrir según corresponda. El backend resuelve cupos, fechas y efectos sobre postulaciones.
- Si cambian el modo de aceptación o el cupo de un perfil con postulaciones pendientes, pedir confirmación antes de guardar y explicar que el backend puede resolver postulaciones automáticamente. Consultar de nuevo el proyecto después del cambio.
- Al tocar «Guardar cambios», un solo `PUT /proyectos/:id/perfiles/:perfilId` envía los campos editados y la `versionEdicion` leída al abrir el formulario. Si cambian las habilidades, se envían ambos grupos completos. El backend guarda el conjunto, exige al menos una requerida y rechaza códigos repetidos entre grupos.
- Si otra edición cambió el perfil, el backend responde 409. Mostrar el conflicto y conservar el borrador. Durante el guardado, bloquear envíos repetidos.
- Eliminar un perfil con confirmación solo si el proyecto conserva otro perfil y una consulta completa confirma que no hay postulaciones ni colaboraciones asociadas a él. Si ya tiene actividad o no se puede verificar, ofrecer cerrar la búsqueda en lugar de eliminarlo.
- Finalizar el proyecto con `DialogoDeConfirmacion` y `POST /proyectos/:id/finalizacion`. Explicar que se rechazan las postulaciones pendientes, se finalizan las colaboraciones aceptadas y el proyecto deja de recibir postulaciones. Después, volver al detalle actualizado y anunciar el resultado.
- Un proyecto finalizado se muestra en modo de consulta. Los errores de permisos, validación o conflicto se muestran en lenguaje claro y se conservan los cambios que puedan corregirse.

## A confirmar

- Pantalla propia enlazada desde la franja del dueño.
- Un «Guardar cambios» por perfil, con el borrador conservado si hay un conflicto.
- Reservar la eliminación para perfiles sin actividad y usar el cierre de búsqueda para los demás.

## A acordar con el back

- Verificar la autorización por colectivo dueño en cada mutación. El router revisado registra las rutas y valida sus datos, pero no muestra un control de pertenencia por ruta. La verificación del frontend es solo para la navegación.
- Confirmar que el listado de colaboraciones del dueño incluye toda la actividad por perfil, incluso anónimas y estados históricos. Hasta poder comprobarlo, la eliminación queda indisponible. El servicio de eliminación actual quita el perfil y no resuelve las colaboraciones asociadas.
- Confirmar cómo se interpretan las fechas sin hora.

## Estados

- Cargando o verificando propiedad, error con «Reintentar», sin permiso, cambios sin guardar, guardando, conflicto de edición, confirmación y proyecto finalizado.

## Fuera de alcance

- Borradores, eliminar el proyecto, resolver postulaciones (09) y administrar colaboraciones propias (10).

## Criterio de aceptación

- El dueño puede abrir la administración desde el detalle y volver con los cambios visibles. Otro colectivo, una colaboradora o un visitante no pueden mutar desde la pantalla.
- Se prueban edición del proyecto, alta y edición de perfiles, cierre y reapertura de búsquedas, y finalización con confirmación.
- Se prueba que un guardado inválido deje intacto el perfil y que una versión desactualizada preserve el borrador. El último perfil y los perfiles con actividad no se eliminan.
- Se verifica teclado, foco, confirmaciones y tamaños de escritorio y 320 px. Pasan lint, formato, tests y build.

## Implementación y verificación

- Entrada desde el detalle, verificación de pertenencia y lectura de proyectos finalizados — hecho.
- Edición del proyecto, alta y edición de perfiles, cierre y reapertura de búsquedas y confirmación de finalización — hecho.
- Guardado atómico de habilidades con versión de edición — hecho.
- Revisión en navegador con sesión y backend simulados. Guardado a 1280 px; editor de perfil, foco inicial del diálogo, acceso desde el detalle y finalización a 320 px — hecho.
- Eliminación de perfiles y verificación de autorización del backend — pendientes de los acuerdos indicados arriba.
