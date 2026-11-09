# Dar de baja el colectivo

Origen: requerimiento adicional 23 del enunciado, implementado en el back (`POST /colectivos/:id/baja`).

## Intención

Que un colectivo pueda eliminar su cuenta. Su historia queda en la plataforma, pero sus datos de contacto y redes se borran y sus proyectos abiertos se cierran.

## Escenarios

Dado un colectivo con sesión,
cuando elige "Dar de baja el colectivo" en su perfil,
entonces ve un diálogo que explica las consecuencias y pide confirmar.

Dado que confirma,
cuando el back responde bien,
entonces ve el aviso "Diste de baja el colectivo", se cierra la sesión y vuelve a la portada.

Dado que el colectivo ya estaba dado de baja (409),
cuando intenta darlo de baja,
entonces ve "Este colectivo ya estaba dado de baja".

## Requisitos

- La acción vive al final de "Mi colectivo", en una sección separada ("Zona de baja"), con el botón peligroso con contorno (decisión del 05/11).
- `DialogoDeConfirmacion` con `permanente`. El texto dice qué pasa: se cierran los proyectos abiertos, se rechazan las postulaciones pendientes, terminan las colaboraciones en curso y se borran medios de contacto y redes; la historia sigue visible.
- Para confirmar hay que escribir el nombre del colectivo (acción irreversible y de alto impacto).
- Operación con `useMutacion` sobre el caso de uso existente `darDeBajaColectivo`.
- Después de la baja, la página pública del colectivo sigue visible con el aviso "Este colectivo se dio de baja el …" (ya implementado, decisión del 08/11/2026).

## Estados

- Enviando: botón con "Dando de baja…" y diálogo sin poder cerrarse.
- Error: mensaje dentro del diálogo, sin cerrarlo.

## Fuera de alcance

- Recuperar un colectivo dado de baja.
- Eliminación de cuentas personales (adicional 24, no asignado).

## A acordar con el back

- Qué pasa con la cuenta de Logto y con `GET /auth/me` después de la baja: si la cuenta queda sin rol, la persona vuelve a `/bienvenida`.

## A confirmar

- Si pedir el nombre del colectivo es suficiente o se agrega una casilla "Entiendo que no se puede deshacer".

## Criterio de aceptación

- Un colectivo puede darse de baja solo después de confirmar, sus proyectos quedan cerrados, su página pública muestra el aviso de baja y un segundo intento muestra el 409 en lenguaje de la persona.
