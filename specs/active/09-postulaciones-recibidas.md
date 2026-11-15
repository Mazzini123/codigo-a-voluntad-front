# Postulaciones recibidas (aceptar, rechazar, desvincular)

Origen: continuación de la 04b y contrato de Colaboración de `docs/PLAN-ENTIDADES.md`, contrastados con el router, los servicios y los tests HTTP del backend local.

## Intención

Que el colectivo revise quién se postuló a cada perfil, decida y administre a quienes ya colaboran.

## Escenarios

Dado un proyecto con postulaciones pendientes,
cuando el colectivo entra a postulaciones,
entonces las ve agrupadas por perfil, con los datos públicos y habilidades que devuelve el listado. Si la postulación es anónima, la fila conserva su estado y acciones sin revelar la identidad.

Dada una postulación pendiente y un perfil que no alcanzó su límite,
cuando el colectivo la acepta y confirma,
entonces pasa a «Aceptada». La consulta de datos de contacto se incorpora en la spec 12 y depende de los permisos del backend.

Dada una postulación pendiente,
cuando el colectivo la rechaza y confirma,
entonces pasa a "Rechazada" y los datos no se comparten.

Dado un perfil que alcanzó su límite de colaboraciones,
cuando hay postulaciones pendientes,
entonces el botón "Aceptar" está deshabilitado con "Límite alcanzado".

Dada una colaboración aceptada,
cuando el colectivo la desvincula y confirma,
entonces pasa a «Desvinculada», deja de contar como colaboración activa y sigue visible en el historial.

## Requisitos

- Ruta propia `/proyectos/:id/postulaciones`, enlazada desde el detalle y desde la administración del proyecto. Verificar el rol de colectivo y la pertenencia antes de consultar postulaciones o mostrar acciones. Distinguir espera, error recuperable y acceso denegado. Mantener acceso de consulta al historial de proyectos finalizados.
- Usar `ListarColaboracionesDeProyecto` como fuente de las filas y el detalle del proyecto para identificar sus perfiles, estado y límites. Agrupar por ID de perfil, mostrar el número y su descripción y preservar las filas cuyo perfil ya no existe en un grupo «Perfil eliminado». Mantener los datos públicos disponibles sin consultas adicionales por fila.
- Filtro `?estado=` con «Todas» por defecto y opciones «Pendientes», «Aceptadas», «Rechazadas», «Finalizadas» y «Desvinculadas». El filtro afecta la vista. Los cupos se calculan con el listado completo, contando las aceptadas del mismo perfil. Usar el texto del estado además del color.
- Una fila anónima muestra «Postulación anónima», su perfil, fecha y estado. Se opera por ID de colaboración. Omitir nombre, habilidades, enlaces al perfil y datos de contacto. Si falta identidad en una fila marcada pública, indicar «Identidad no disponible».
- En proyectos abiertos, las pendientes ofrecen «Aceptar» y «Rechazar». Deshabilitar «Aceptar» con un motivo cuando el perfil alcanzó el cupo o ya no existe. Una búsqueda cerrada impide nuevas postulaciones. Las pendientes existentes siguen disponibles para revisión manual según el servicio actual.
- Las aceptadas ofrecen «Desvincular». En proyectos finalizados, la pantalla queda en modo de consulta. Confirmar las tres acciones, explicando los efectos de aceptar, rechazar o desvincular. En el rechazo no se pide motivo, ya que la operación actual no recibe cuerpo.
- Ejecutar `AceptarPostulacion`, `RechazarPostulacion` o `DesvincularColaboracion` según corresponda. Bloquear acciones concurrentes mientras se procesa y volver a consultar el detalle y el listado tras una mutación, incluso ante conflicto o respuesta ambigua. Un modo automático puede haber resuelto otras filas.
- Si una mutación se confirmó y falla la recarga, informar que el cambio se aplicó y ofrecer reintentar la consulta. Si el backend rechaza la acción, mostrar un mensaje claro y el estado actualizado. Anunciar el resultado y mantener un foco útil si la fila sale del filtro.

## Estados

- Verificando pertenencia, cargando, sin permiso, error con «Reintentar», lista vacía, filtro sin resultados, confirmación, acción en curso y resultado.

## A confirmar

- Pantalla por proyecto, entrada desde el detalle y la administración, y «Todas» como filtro inicial.
- Postulaciones anónimas identificadas solo por los datos de la fila y acciones disponibles por ID de colaboración.
- Los medios de contacto se consultan recién en la spec 12. La 09 muestra los estados y resuelve las postulaciones.

## A acordar con el back

- Validar pertenencia del colectivo tanto en el listado de gestión como al aceptar, rechazar o desvincular. El router local revisado no declara ese control por ruta. La barrera del frontend controla la navegación.
- Confirmar que el listado del dueño incluye todas las filas anónimas e históricas. El serializador actual pone `colaborador: null` cuando `esPublica: false`. Si el equipo necesita compartir más información con el dueño, acordar una respuesta protegida antes de exponerla.
- Acordar el acceso contextual a contactos para la spec 12. El servicio revisado valida que exista una colaboración aceptada. Falta confirmar la autorización del solicitante y el tratamiento del anonimato.

## Fuera de alcance

- Configurar la aceptación automática (04b), consultar contactos (12), gestionar las postulaciones propias (10) y mensajería (11).

## Criterio de aceptación

- El dueño ve y filtra las filas. Otros roles y otros colectivos no consultan el listado desde esta pantalla. Las filas anónimas conservan sus acciones sin mostrar datos personales.
- Se prueban confirmación y cancelación, cupo agotado, historial de perfiles eliminados, conflicto, actualización tras cada acción y fallo de recarga sin repetir la mutación.
- Se verifican escritorio, 320 px y teclado. Pasan lint, formato, tests y build.

## Implementación y verificación

- Acceso desde el detalle y la administración, verificación de dueño, filtros e historial por perfil — hecho.
- Confirmaciones, cupos, anonimato y recarga con reintento de consulta — hecho.
- Pruebas de integración del frontend y revisión en navegador con backend y sesión simulados. Listado a 1280 px; recorrido desde el detalle, foco del diálogo y aceptación a 320 px — hecho.
- Autorización en el backend y alcance del listado del dueño — pendientes de los acuerdos indicados arriba.
