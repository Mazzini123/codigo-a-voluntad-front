# Buscar y contactar colaboradoras

## Intención

Que un colectivo encuentre personas que encajan con un perfil de su proyecto y les escriba.

## Escenarios

Dado un perfil de un proyecto propio,
cuando el colectivo busca colaboradoras para ese perfil,
entonces ve personas que cumplen las habilidades requeridas, ordenadas por cuántas opcionales tienen, con sus datos públicos.

Dada una colaboradora que acepta mensajes internos,
cuando el colectivo toca "Contactar", escribe un mensaje y lo envía,
entonces ve "Mensaje enviado" y el mensaje aparece en la bandeja de la persona.

Dada una colaboradora que no acepta mensajes,
cuando aparece en los resultados,
entonces el botón "Contactar" está deshabilitado con el motivo.

Dado un perfil sin candidatas,
cuando se busca,
entonces ve "Todavía no hay colaboradoras con estas habilidades".

## Requisitos

- Operaciones: `BuscarColaboradorasPotenciales` e `InvitarColaborador`.
- Se llega desde el detalle del proyecto o desde "Mis proyectos", con el perfil ya elegido.
- Indicador por persona: habilidades opcionales que tiene.
- Nunca se muestran datos de contacto en esta pantalla.
- Límite de largo del mensaje: 500 caracteres (lo valida el back).

## Estados

- Cargando, sin resultados, error, enviando.

## Fuera de alcance

- Notificaciones automáticas a candidatas compatibles.

## Criterio de aceptación

- Solo el colectivo dueño accede; el envío respeta la preferencia de contacto de cada persona.
