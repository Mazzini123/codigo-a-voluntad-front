# Pendientes con el back

Estado al 14/11/2026. Entre paréntesis, la spec de donde sale. El detalle está en la sección «A acordar con el back» de cada spec.

## Resuelto en el back (falta que el front lo use)

- [x] `colectivo` (`{ id, nombre, ubicacion }`) en `ProyectoDto`, en el detalle y en los listados. (05, 06)
- [x] `titulo` opcional (hasta 80) y `estadoBusqueda` (`ABIERTA`, `LIMITE_ALCANZADO`, `CERRADA`) en `PerfilDto`. (04, 05, 06, 10)
- [x] `GET /colaboradores/:id/colaboraciones` trae `proyecto` `{ id, titulo, estado }` y `perfil` `{ id, titulo, descripcion }`. (10)
- [x] `GET /colectivos/:id/proyectos` ya trae `perfiles` y `colaboraciones`. (04)
- [x] `habilidadesOpcionalesQueTiene` es una lista de códigos y `recibeMensajeriaInterna` viene en el colaborador. (08)
- [x] 409 por postulación repetida es por perfil. Tras rechazo, finalización o baja no se puede repostular al mismo perfil. (06, 10)
- [x] `POST /proyectos/:id/colaboraciones/:colaboracionId/retiro` retira una pendiente (estado `RETIRADA`) y permite repostular. (10)
- [x] Invitación repetida al mismo perfil: 409. Mensaje de más de 500 caracteres: 400 (el back no usa 422). Persona que no acepta mensajes: 409. (08)
- [x] Logros: título de hasta 100, descripción de hasta 1000, título único sin distinguir mayúsculas. Avances: porcentaje decimal de 0 a 100, 400 si no supera al actual, 100 no finaliza el proyecto. (07)
- [x] Filtros de `GET /proyectos`: `estado`, `habilidad`, `tipoColectivo`, `ubicacion`, `modalidad` (además de `etiqueta`). Sin `estado` devuelve todos. (05)
- [x] Bandeja: `?leida=true|false` y `meta.unread`. (11)
- [x] `GET /catalogos/provincias` (23, sin tildes); la ubicación acepta variantes con tildes. Largos máximos y `cuentaGit` como usuario (no URL). (02, 03)
- [x] Fechas de cierre sin hora = fin del día en Argentina; «hoy» cuenta como futura. (04, 04b)
- [x] Auth: validación del JWT de Logto, registro idempotente antes de `GET /auth/me`, perfiles vinculados al usuario interno y autorización por rol y contexto. (01, 04b, 09, 10, 11)
- [x] `GET /proyectos/:id/colaboradores/:colaboradorId/contacto` habilitada con auth, solo colectivo dueño y solo postulaciones aceptadas y públicas. (12)
- [x] Medios de contacto privados: `GET /colaboradores/:id/medios-de-contacto` y `GET`/`POST`/`DELETE /colectivos/:id/medios-de-contacto`, solo el propio dueño. (02, 03)
- [x] Las postulaciones anónimas propias aparecen en el listado de la propia persona. (06, 10)
- [x] Baja de colectivo: la cuenta queda sin perfil; `/auth/me` devuelve `rol: null`. (16)
- [x] Contextos simultáneos: una cuenta puede tener a la vez un perfil de colaboradora y contextos de colectivo, y cambiar entre ellos. `MODALIDAD_INCOMPATIBLE` ya no existe. Regla nueva: 422 `POSTULACION_EN_COLECTIVO_PROPIO` al postularse a un proyecto de un colectivo donde la cuenta es líder o miembro. (spec del back `contextos-simultaneos-de-cuenta`)

## Cambios del front (hechos el 09/11/2026)

- [x] Estado `RETIRADA` y «Retirar postulación» en Mis postulaciones.
- [x] `colectivo`, `titulo`, `estadoBusqueda` y el `proyecto`/`perfil` de las colaboraciones, tolerando que falten.
- [x] Filtros de proyectos por la URL y `meta.unread` con filtro en Mensajes.
- [x] Provincias del catálogo, largos máximos y `cuentaGit` como usuario.
- [x] Medios de contacto privados en la edición del perfil.
- [x] Token en las escrituras y texto propio para 403 (ya estaban).
- [ ] Probar todo contra el back real con Logto (hasta ahora solo con respuestas simuladas).

## Cambios del front (14/11/2026)

- [x] Parte A de contextos simultáneos: sin `MODALIDAD_INCOMPATIBLE`; con `POSTULACION_EN_COLECTIVO_PROPIO` y «Postularme» deshabilitado, con motivo, para quien participa del colectivo del proyecto.
- [x] Parte B: sumar el otro tipo de contexto desde «Mi cuenta» y desde Bienvenida; `puedePedirIngreso` sin exclusión (spec 19).

## Pendiente

- [ ] Verificar el front contra el back real, con auth activada, incluidos los 422 `POSTULACION_EN_COLECTIVO_PROPIO` y `COLABORACION_PROPIA`.
- [x] Pregunta B resuelta en el back (opción 1+2, 422 `COLABORACION_PROPIA`): el front deshabilita aceptar, rechazar, desvincular, finalizar y valorar sobre la colaboración propia y muestra el motivo; ante el 422 informa el mismo texto (spec 19).
- [ ] (Histórico) Propuesta para la pregunta B (a llevar al equipo): no bloquear ni cancelar nada al ingresar a un colectivo, pero impedir en el back que una cuenta actúe sobre su propia colaboración (aceptar, rechazar, finalizar, desvincular y valorar como colectivo), con un código nuevo a acordar. Hoy `MIEMBRO` tiene esos permisos y `ColaboracionService` no verifica quién actúa. Si se adopta, el front suma el mensaje del código y oculta «Aceptar» y «Rechazar» en las postulaciones propias.
- [ ] Que el `colaborador` de `ColaboracionDto` (`GET /proyectos/:id/colaboraciones`) incluya sus `habilidades` (`HabilidadResumenDto[]`) cuando la postulación es pública. Mientras tanto, Postulaciones recibidas pide `GET /colaboradores/:id` por cada postulante. (revisión Impeccable 05, R2)
- [ ] Preguntas A y B de la spec del back (invitaciones, `colaboradoras-potenciales`, `proyectos-potenciales` y avisos hacia el colectivo propio; postulaciones anteriores al ingreso): el front no las filtra hasta que se decidan.

## Decidido (no requiere cambios en el back)

- No hay bandeja de colectivo: las notificaciones son solo de colaboradoras. (11)
- Las postulaciones anónimas llegan al dueño con `colaborador: null` y, aunque estén aceptadas, no habilitan el contacto. (09, 12)
- El contacto se comparte solo con la colaboración «aceptada». (12)
- Las visualizaciones no cuentan las del colectivo dueño. (14)
- La baja propia no genera aviso de desvinculación; solo lo recibe quien fue desvinculada por el colectivo. (10)
- `GET /colectivos/:id/estadisticas` es solo del colectivo dueño; las estadísticas globales, la línea de tiempo, las valoraciones y los listados de logros, avances y colaboraciones siguen públicos.

## Con Facu / Logto (a hacer a mano)

- [ ] Crear en Logto la app Single page app y registrar `<origen>/auth/callback` y `<origen>/` por cada origen real.
- [ ] Crear el API resource y usar el mismo identificador en `LOGTO_API_RESOURCE` (back) y `VITE_LOGTO_API_RESOURCE` (front).
- [ ] Probar ingreso, registro, recarga, cierre y expiración con tenant y back reales (pasos en el README del back).
