# Perfil de colectivo (alta y edición)

## Intención

Que un colectivo cargue y mantenga los datos con los que se presenta en la plataforma.

## Escenarios

Dado un colectivo recién registrado,
cuando completa nombre, descripción, tipo y (opcionalmente) ubicación,
entonces su perfil queda creado y puede cargar proyectos.

Dado un colectivo con perfil,
cuando edita sus datos y guarda,
entonces ve "Cambios guardados" y los datos actualizados.

Dado un visitante o colaboradora,
cuando entra al perfil público de un colectivo,
entonces ve nombre, descripción, tipo, ubicación y sus proyectos, pero no los medios de contacto internos.

## Requisitos

- Tipo de colectivo elegido de la lista del sistema (fundación, asociación barrial, ONG, asamblea).
- Ubicación opcional: "Argentina", una provincia, CABA o ciudad/barrio en texto libre.
- Medios de contacto (email, WhatsApp, SMS): cero o más, solo visibles internamente.
- Si sale de la edición con cambios sin guardar, se le avisa.

## Estados

- Cargando: skeleton del formulario.
- Guardando: botón deshabilitado con "Guardando…".
- Error: mensaje y reintentar, sin perder lo cargado.

## Fuera de alcance

- Múltiples usuarios administradores por colectivo, eliminación de la cuenta.

## Criterio de aceptación

- Alta, edición y vista pública funcionan; los contactos internos nunca aparecen en la vista pública.
