# Mis postulaciones y colaboraciones

## Intención

Que la colaboradora siga el estado de sus postulaciones y administre los proyectos en los que participa.

## Escenarios

Dada una colaboradora con postulaciones,
cuando entra a esta sección,
entonces las ve con su estado (pendiente, aceptada, rechazada, finalizada, desvinculada), proyecto y perfil.

Dada una colaboración aceptada,
cuando toca "Darme de baja" y confirma,
entonces pasa a "Desvinculada" y deja de participar en el proyecto (acción permanente, advertida).

Dada una colaboradora sin postulaciones,
cuando entra,
entonces ve "Todavía no te postulaste a ningún proyecto" y un link a buscar.

## Requisitos

- Operaciones: `ListarColaboracionesDeColaborador` y `DesvincularColaboracion`.
- Pestañas o filtro por estado, en la URL.
- Cada ítem enlaza al detalle del proyecto.
- Se indica si la contribución es pública o anónima. El historial público no muestra las anónimas.
- Retirar una postulación pendiente: no existe en la API.

## Estados

- Cargando, vacío, error, procesando.

## Fuera de alcance

- Valoraciones mutuas al finalizar.

## Criterio de aceptación

- Los estados se distinguen con texto; darse de baja requiere confirmación explícita.
