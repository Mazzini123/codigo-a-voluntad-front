# Postulaciones recibidas (aceptar, rechazar, desvincular)

## Intención

Que el colectivo revise quién se postuló a cada perfil, decida y administre a quienes ya colaboran.

## Escenarios

Dado un proyecto con postulaciones pendientes,
cuando el colectivo entra a postulaciones,
entonces las ve agrupadas por perfil, con los datos públicos de cada persona y sus habilidades.

Dada una postulación pendiente y un perfil que no alcanzó su límite,
cuando el colectivo la acepta y confirma,
entonces pasa a "Aceptada" y desde ese momento puede ver los datos de contacto de la persona.

Dada una postulación pendiente,
cuando el colectivo la rechaza y confirma,
entonces pasa a "Rechazada" y los datos no se comparten.

Dado un perfil que alcanzó su límite de colaboraciones,
cuando hay postulaciones pendientes,
entonces el botón "Aceptar" está deshabilitado con "Límite alcanzado".

Dada una colaboración aceptada,
cuando el colectivo la desvincula y confirma,
entonces pasa a "Desvinculada" y la persona deja de figurar en el proyecto (acción permanente, advertida).

## Requisitos

- Operaciones: `ListarColaboracionesDeProyecto`, `AceptarPostulacion`, `RechazarPostulacion`, `DesvincularColaboracion`.
- Filtro por estado (pendientes, aceptadas, rechazadas, desvinculadas) en la URL.
- Rechazar y desvincular: diálogos que expliquen que es permanente.
- Después de cada acción, volver a consultar la lista (un modo automático puede haber aceptado o rechazado otras).
- Motivo de rechazo: A definir.

## Estados

- Cargando, vacío ("Todavía no recibiste postulaciones"), error, procesando por fila.

## Fuera de alcance

- Configurar la aceptación automática (es de "Mis proyectos").

## Criterio de aceptación

- Las reglas de límite y de datos de contacto se respetan y cada acción muestra su resultado.
