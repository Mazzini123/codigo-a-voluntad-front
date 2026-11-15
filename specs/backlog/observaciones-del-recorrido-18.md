# Observaciones del recorrido manual de la spec 18

Origen: recorrido manual con dos cuentas del 14/11/2026, antes del audit y el critique de las pantallas de la spec 18

## Intención

Juntar lo que se vio al recorrer el registro a mano y no es parte de la spec 18, para decidirlo en la revisión de diseño. Ninguna de estas observaciones se corrigió en la tarea de la spec 18.

## Escenarios

Dado un colectivo recién creado, sin proyectos,
cuando su líder abre `/colectivo/resumen`,
entonces ve el aviso «Todavía no publicaste proyectos» una sola vez, con una sola acción para publicar.

Dado el formulario de alta de colectivo,
cuando la persona lee la ayuda debajo de «Ciudad o barrio»,
entonces el ejemplo del formato se ve como placeholder y la ayuda queda con una instrucción corta.

## Requisitos

- **Resumen del colectivo (hecho, ver R11 de `specs/active/revision-impeccable-04.md`):** repetía «Todavía no publicaste proyectos» en dos tarjetas seguidas («Tus proyectos en números» y la de abajo), con dos botones distintos («Publicar un proyecto» y «Publicar el primero»). Decidir cuál queda.
- **Ayuda de los campos:** evaluar pasar ejemplos cortos a `placeholder` («Villa Fiorito, Lomas de Zamora»). Las instrucciones («No se puede cambiar después») siguen como ayuda asociada con `aria-describedby`, porque el placeholder desaparece al escribir y suele no llegar a 4.5:1 de contraste.

## Estados

- Cargando: sin cambios.
- Con datos: sin cambios.
- Vacío: ver el resumen del colectivo.
- Sin resultados: sin cambios.
- Error: sin cambios.

## Fuera de alcance

- Cancelar los pedidos pendientes al crear un colectivo desde la espera (ver `docs/decisiones.md`, 14/11/2026).
