# Miembros y solicitudes de ingreso del colectivo

Origen: rediseño de autenticación y contextos (10/11/2026). Registro de lo implementado; no pasó por aprobación previa.

## Intención

Que quien lidera un colectivo pueda ver quiénes lo integran, sumar personas que lo pidieron, quitar miembros y pasar el liderazgo; y que cualquier miembro pueda salir.

## Escenarios

Dado un liderazgo en «Miembros», cuando elige «Quitar» sobre otra persona y confirma, entonces la persona desaparece de la lista y ve un aviso.
Dado un liderazgo, cuando pasa el liderazgo y confirma, entonces se recarga su cuenta y pasa a ver el panel como miembro.
Dado un liderazgo con otros miembros, cuando intenta salir, entonces el diálogo explica que primero tiene que pasar el liderazgo.
Dado un liderazgo que es la única persona, cuando intenta salir, entonces el diálogo indica que tiene que dar de baja el colectivo.
Dado un miembro sin liderazgo, cuando abre «Miembros», entonces ve la lista y solo la acción «Salir del colectivo».
Dado un liderazgo en «Solicitudes», cuando acepta o rechaza una pendiente y confirma, entonces la lista se actualiza.

## Requisitos

- Rutas `/colectivo/miembros` y `/colectivo/solicitudes` dentro del panel; «Miembros» y «Solicitudes» se consultan con `COLECTIVO_MIEMBROS_VER` en el contexto actual. Resolver solicitudes requiere `MEMBRESIA_SOLICITUD_RESOLVER`.
- Nombre de cada persona tal como lo da el back; si falta, «Persona sin nombre».
- El filtro de estado de las solicitudes va en la URL (`?estado=`), por defecto pendientes.
- Quitar y pasar el liderazgo no aparecen sobre la propia fila ni sobre la del liderazgo.
- Sin `COLECTIVO_EDITAR`, «Mi colectivo» no muestra el formulario ni la baja.

## Estados

- Cargando: skeleton.
- Con datos: lista de tarjetas.
- Vacío: «Todavía no hay miembros» / «No hay solicitudes pendientes».
- Sin resultados: «No hay solicitudes con este estado».
- Error: `EstadoDeError` con «Reintentar».

## Fuera de alcance

- Historial de miembros que salieron.

## Criterio de aceptación

- Tests de `Pages/colectivo/membresia.test.jsx` en verde, lint y suite completa en verde.
