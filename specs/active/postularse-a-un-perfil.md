# Postularse a un perfil de un proyecto

## Intención

Una persona colaboradora se ofrece para un perfil de un proyecto que le interesa, y el colectivo decide si la acepta.

## Escenarios

Dado un perfil con la búsqueda abierta,
cuando la colaboradora toca "Postularme" y confirma,
entonces la postulación queda pendiente (o aceptada, si el modo de aceptación del perfil lo resuelve solo) y la ve en "Mis postulaciones".

Dado un perfil con la búsqueda cerrada o vencida,
cuando la colaboradora ve el proyecto,
entonces el botón aparece deshabilitado con el motivo ("Búsqueda cerrada").

Dado que ya se postuló a ese proyecto,
cuando vuelve al proyecto,
entonces ve el estado de su postulación en lugar del botón.

Dado un visitante sin sesión,
cuando toca "Postularme",
entonces se lo lleva a iniciar sesión y, al volver, sigue en el mismo proyecto.

## Requisitos

- Operación: `RegistrarColaboracion` (`POST /proyectos/:proyectoId/colaboraciones`) con `{ colaboradorId, perfilId, esPublica }`.
- Se puede elegir si la contribución será pública o anónima.
- Se informa que los datos de contacto se comparten solo si el colectivo acepta.
- Mientras se envía, el botón queda deshabilitado y muestra "Enviando…".
- Si falla, el mensaje explica qué pasó sin detalles técnicos y permite reintentar (409: ya postulada o búsqueda cerrada; 400: no cumple las habilidades requeridas).

## Estados

- Cargando: skeleton de la tarjeta del perfil.
- Con datos: perfil con habilidades requeridas y opcionales, compromiso, modalidad y estado de la búsqueda.
- Error: mensaje y "Reintentar".

## Fuera de alcance

- Configurar la aceptación automática (es de la pantalla de "Mis proyectos").

## Criterio de aceptación

- Los cuatro escenarios funcionan, se navega con teclado y pasa el checklist de criterios.
- Es la pantalla del test de integración del front que pide la consigna.
