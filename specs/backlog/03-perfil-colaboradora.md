# Perfil de colaboradora (alta y edición)

## Intención

Que una persona colaboradora muestre lo que sabe hacer y controle cómo se la identifica y contacta.

## Escenarios

Dada una colaboradora recién registrada,
cuando elige cómo identificarse (nombre de fantasía o nombre y apellido), carga sus habilidades y guarda,
entonces su perfil queda creado y puede buscar proyectos.

Dada una colaboradora con perfil,
cuando agrega o quita habilidades, medios de contacto o cambia si acepta mensajes internos,
entonces ve "Cambios guardados".

Dado un colectivo sin una postulación aceptada de esa persona,
cuando entra a su perfil,
entonces ve solo los datos públicos, nunca los de contacto.

## Requisitos

- Identificación: nombre de fantasía, o nombre y apellido; cuenta de GitHub o GitLab opcional.
- Pronombres y presentación breve opcionales.
- Habilidades elegidas del catálogo precargado (buscador dentro del selector), al menos una: A definir.
- Medios de contacto (email, WhatsApp, SMS): cero o más, internos.
- Opción "Acepto que me contacten por mensajería interna cuando haya proyectos para mis habilidades".
- Historial de colaboraciones visible en el perfil (las anónimas no muestran quién).

## Estados

- Cargando, guardando y error como en los demás formularios.

## Fuera de alcance

- Años de experiencia por habilidad, importación desde LinkedIn.

## Criterio de aceptación

- Alta y edición funcionan, el selector de habilidades se usa con teclado y la privacidad de los contactos se respeta.
