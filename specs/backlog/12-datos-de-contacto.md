# Datos de contacto de una colaboradora

## Intención

Que un colectivo acceda a los datos de contacto de quien aceptó, y que nadie más pueda verlos.

## Escenarios

Dado un colectivo con una postulación aceptada de esa persona,
cuando toca "Ver datos de contacto",
entonces ve sus medios de contacto registrados.

Dado un colectivo sin postulación aceptada, u otra colaboradora,
cuando intenta acceder (incluso por URL directa),
entonces ve "Estos datos se comparten solo cuando aceptás su postulación" y ningún dato.

Dada una persona sin medios de contacto cargados,
cuando el colectivo con acceso los consulta,
entonces ve "Esta persona no cargó medios de contacto; podés escribirle por mensajería interna".

## Requisitos

- Operación prevista: `ObtenerContactoDeColaborador` (`GET /proyectos/:proyectoId/colaboradores/:colaboradorId/contacto`). La ruta está suspendida y responde 404 hasta verificar la identidad y la pertenencia al colectivo dueño en el backend.
- El botón solo aparece cuando hay acceso; el back igual valida y la pantalla maneja el 403 con el mensaje anterior.
- Copiar al portapapeles cada dato con confirmación.

## Estados

- Cargando, sin acceso, error.

## Fuera de alcance

- Control granular de qué atributos son públicos.

## Criterio de aceptación

- Ninguna combinación de rol y URL muestra datos sin acceso; el error nunca expone detalles técnicos.
