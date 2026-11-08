# Mis proyectos: inicio del colectivo, listado y alta — hecho

Origen: `specs/backlog/04-mis-proyectos.md`, recortado con `/impeccable shape` el 06/11/2026 después de la critique de ese día (P1: "el recorrido del colectivo termina en su propio formulario"). Editar proyectos y perfiles, cambiar habilidades, cerrar o reabrir búsquedas y finalizar pasan a `specs/active/04b-administrar-proyecto.md`. También `docs/plan-front.md` §3 y §4, `DESIGN.md` y `docs/PLAN-ENTIDADES.md` (Proyecto y Perfil).

## Intención

Que un colectivo sin formación técnica publique un proyecto con los perfiles que necesita, en sus propias palabras, y que tenga un lugar propio donde ver sus proyectos y en qué estado está cada uno. Hoy, después del alta, el colectivo cae en su formulario de perfil y no tiene nada que hacer en la plataforma.

Es para el colectivo. Llega desde el alta o al ingresar, muchas veces desde la PC compartida del centro comunitario o un celular. La interfaz traduce lo técnico; nunca le pide que conozca términos del back.

## Escenarios

### Inicio y listado

Dado un colectivo que ingresa o termina su alta,
cuando llega a la plataforma,
entonces su pantalla de inicio es `/colectivo/proyectos` ("Mis proyectos") y no su formulario de perfil.

Dado un colectivo con proyectos,
cuando entra a "Mis proyectos",
entonces ve cada proyecto en una tarjeta con su estado ("Abierto" o "Finalizado"), cuántos perfiles buscan gente y cuántas postulaciones tiene pendientes, y cada tarjeta lleva al detalle del proyecto.

Dado un colectivo sin proyectos,
cuando entra a "Mis proyectos",
entonces ve "Todavía no publicaste proyectos" con una línea que explica qué es un proyecto y "Publicar el primero".

### Alta en tres pasos

Dado un colectivo en "Mis proyectos",
cuando toca "Publicar proyecto",
entonces llega a `/colectivo/proyectos/nuevo`, con el indicador "1. El proyecto · 2. Los perfiles · 3. Revisar y publicar" y el paso 1 activo.

Dado el paso 1,
cuando completa título y descripción (y, si quiere, etiquetas y fecha de cierre) y toca "Siguiente",
entonces pasa al paso 2. Si falta algo, se queda, ve el resumen de errores y el foco va al primer campo inválido.

Dado el paso 2,
cuando carga un perfil (descripción, habilidades requeridas, compromiso, modalidad y cómo quiere sumar colaboradoras) y toca "Guardar perfil",
entonces el perfil queda resumido en la lista de perfiles del proyecto, con "Editar" y "Quitar", y puede "Sumar otro perfil".

Dado el paso 2 sin ningún perfil guardado,
cuando mira "Siguiente",
entonces está deshabilitado y debajo dice "Sumá al menos un perfil para seguir."

Dado el paso 3,
cuando revisa el proyecto completo tal como lo verían las colaboradoras y toca "Publicar proyecto",
entonces el botón pasa a "Publicando…". Al terminar aparece "Publicaste el proyecto." y llega al detalle del proyecto nuevo.

Dado que el back rechaza el alta,
cuando responde,
entonces sigue en el paso 3 con lo cargado intacto, ve un mensaje escrito por el front según el status y puede volver a intentar o volver a editar.

Dado un alta con datos cargados,
cuando intenta salir de la pantalla,
entonces ve "¿Salir sin publicar?" con "Seguir editando" y "Salir sin publicar" (los borradores no se guardan).

### Detalle de su propio proyecto

Dado un colectivo en el detalle de un proyecto suyo,
cuando lo mira,
entonces ve arriba "Este proyecto es de tu colectivo" con "Ver en Mis proyectos", y ya no ve "Las postulaciones son para colaboradoras." repetido en cada perfil.

Dado un colectivo en el detalle de un proyecto de otro colectivo,
cuando lo mira,
entonces no ve la franja y ve una sola vez, arriba de los perfiles, "Las postulaciones son para colaboradoras."

## Requisitos

### Datos

- **Listado:** `ListarProyectosDeColectivo` (`GET /colectivos/:id/proyectos`), con la sesión del colectivo. Devuelve un arreglo de `ProyectoDto`, sin paginación: se muestran todos en la grilla, sin `Paginacion`. Si el back suma paginación, se agrega con la página en la URL.
- **Postulaciones pendientes por proyecto:** se cuentan de `ProyectoDto.colaboraciones` (las `PENDIENTE`) del mismo listado, sin pedidos extra. Si el back no completa `colaboraciones` en el listado, la tarjeta se muestra sin el conteo (ver "A acordar con el back").
- **Alta:** `CrearProyecto` (`POST /colectivos/:id/proyectos`) con el proyecto y todos sus perfiles en un solo pedido (`CrearProyectoRequest`).
- **Dueño en el detalle:** el proyecto es del colectivo si su `id` está entre `ColectivoDto.proyectos` del colectivo de la sesión (`GET /colectivos/:id`, que ya se pide en el menú "Mi cuenta"). Solo se pide si el rol es COLECTIVO. No se deduce de nada más.
- **Habilidades:** el catálogo de `GET /habilidades`, con el `SelectorDeHabilidades` actual.

### Navegación

- **Inicio del colectivo:** `/colectivo/proyectos` reemplaza a `/colectivo/perfil` en `INICIO_POR_ROL`.
- **Cabecera:** "Mis proyectos" es el segundo enlace principal para el colectivo, después de "Proyectos". Con dos enlaces la barra de 320 px no alcanza (marca, dos enlaces y "Mi cuenta"), así que en celular siguen detrás del botón "Menú", como hoy. Solo con un enlace van a la vista (ver revisión 02, R3).
- **Rutas nuevas:** `/colectivo/proyectos` y `/colectivo/proyectos/nuevo`, solo para COLECTIVO (`ProtectedRoute`); los demás roles van a `/sin-permiso`.
- **Volver:** desde el alta, "← Volver a Mis proyectos" (con el aviso de cambios sin guardar si corresponde).

### Listado (`/colectivo/proyectos`)

- Encabezado de pantalla igual a las demás: título "Mis proyectos", la bajada "Los proyectos que publicó tu colectivo." y "Publicar proyecto" como **la única acción coral** de la pantalla.
- Tarjeta: la `TarjetaProyecto` actual, sin franja de encaje. El pie lleva el sello del proyecto, "N perfiles buscan gente" y, si hay, "N postulaciones pendientes" en texto (no solo un número).
- Orden: el que devuelve el back. Si el back no ordena, lo más reciente primero (a confirmar).

### Alta (`/colectivo/proyectos/nuevo`)

- **Indicador de pasos** arriba del formulario: "1. El proyecto · 2. Los perfiles · 3. Revisar y publicar", con el paso actual resaltado, `aria-current="step"` y los pasos siguientes sin enlace. En celular se compacta a "Paso 2 de 3 · Los perfiles".
- **El paso en la URL** (`?paso=1|2|3`), para que "atrás" del navegador vuelva al paso anterior. Si se entra o recarga con un paso mayor que 1 y no hay datos cargados, vuelve al paso 1.
- **Al cambiar de paso**, el foco va al título del paso.
- **Paso 1, el proyecto:**
  - Título (obligatorio).
  - Descripción (obligatorio), con la ayuda "Contá qué problema quieren resolver y para quién."
  - Etiquetas: el editor de etiquetas actual, hasta 10, de hasta 30 caracteres.
  - Fecha de cierre del proyecto (opcional), con la ayuda "Si la ponés, el proyecto se cierra solo ese día." Tiene que ser futura.
- **Paso 2, los perfiles:** se cargan de a uno. Cada perfil pide:
  - **Qué necesitan** (descripción, obligatorio): "Contá qué tendría que hacer esta persona."
  - **Habilidades requeridas** (al menos una) y **opcionales**, con el `SelectorDeHabilidades`. La misma habilidad no puede estar en las dos listas.
  - **Compromiso** (obligatorio): "¿Cuántas horas?" (entero mayor que 0) y "por semana", "por mes" o "en total".
  - **Modalidad:** "Gratuita" (por defecto), "Con incentivo económico" o "Con posibilidad de contratación".
  - **"¿Cómo querés sumar colaboradoras?"**, que reemplaza a límite y modo de aceptación para que no haya combinaciones inválidas:
    - "Reviso cada postulación" (por defecto) → `REVISION_MANUAL`, sin límite;
    - "Acepto a todas las que se postulen" → `TODO_SUMA`, sin límite;
    - "Acepto hasta completar N lugares" → `HASTA_LLENAR_VACANTES`, con el límite N (obligatorio, entero mayor que 0).

    Con "Reviso cada postulación" se puede poner un límite opcional ("¿Cuántas personas como máximo?").

  - **Fecha de cierre de la búsqueda** (opcional, futura).
  - El perfil guardado se ve resumido (descripción en dos líneas, habilidades requeridas y "5 h por semana · Gratuita"), con "Editar" (lo vuelve a abrir en el formulario) y "Quitar" (sin confirmación, porque todavía no está publicado).
  - Como máximo un perfil abierto en edición a la vez. "Siguiente" queda deshabilitado con su motivo si no hay perfiles guardados o si hay uno abierto sin guardar ("Guardá o descartá el perfil que estás editando.").
- **Paso 3, revisar y publicar:**
  - Muestra el proyecto con los mismos componentes del detalle (sellos, chips agrupados, compromiso y modalidad en palabras).
  - Ofrece "Volver a editar el proyecto" y "Volver a editar los perfiles", que llevan al paso correspondiente con lo cargado intacto.
  - "Publicar proyecto" es la acción coral, con "Publicando…" deshabilitado mientras envía.
- **Validación:** por campo, con el resumen de errores (`ResumenDeErrores`) al intentar avanzar. Los errores del back (`issues`) se traducen por campo, como en los formularios de perfil; nunca se muestra el `message` del back.
- **Sin términos del back a la vista:** ni `TODO_SUMA`, ni `HS_SEMANALES`, ni nombres de campos.

### Franja de dueño en `/proyectos/:id`

- Arriba del título, una franja en `info-tenue` con ícono, "Este proyecto es de tu colectivo" y el enlace "Ver en Mis proyectos".
- Para el colectivo, la nota "Las postulaciones son para colaboradoras." se muestra una sola vez, arriba de "Perfiles que busca", y solo si el proyecto no es suyo.
- Las acciones del dueño (editar, postulaciones, buscar colaboradoras) llegan con las specs 04b, 08 y 09; esta franja no ofrece ninguna todavía.

### Piezas que se reusan

`TarjetaProyecto`, `SelloDeBusqueda`, `EmptyState`, `ErrorState`, `Skeleton`, `Paginacion`, `Campo`, `GrupoDeOpciones`, `SelectorDeHabilidades`, el editor de etiquetas, `ResumenDeErrores`, `Boton`, `ConfirmDialog`, `useAvisoCambiosSinGuardar` y los formatos de `Formatos/proyecto.js`. Lo nuevo es el indicador de pasos, que va a `Components/App/` porque lo van a usar otras altas largas.

## Estados

- **Cargando:** el listado muestra skeletons de tarjeta (seis en escritorio, dos en celular), después de 300 ms. El conteo de pendientes de cada tarjeta carga aparte, sin mover la tarjeta.
- **Con datos:** grilla de tarjetas y paginación.
- **Vacío:** "Todavía no publicaste proyectos", la línea "Un proyecto cuenta qué necesitan y qué perfiles de personas buscan." y "Publicar el primero" (primario).
- **Sin resultados:** no aplica (no hay filtros en esta spec).
- **Error:** `ErrorState` "No pudimos cargar tus proyectos" con "Reintentar", en el lugar de la grilla, con el encabezado y "Publicar proyecto" visibles.
- **Enviando:** "Publicando…" deshabilitado, y "Volver a editar" también deshabilitado mientras envía.
- **Estado final:** aviso "Publicaste el proyecto." y llegada al detalle, con la franja de dueño.

## A acordar con el back

- **Confirmar que `GET /colectivos/:id/proyectos` completa `colaboraciones` y `perfiles`** de cada proyecto, porque de ahí salen las postulaciones pendientes y los perfiles que buscan gente. Si no, hace falta un campo resumido (por ejemplo, `postulacionesPendientes`).
- **Paginación del listado:** hoy devuelve un arreglo completo; ¿se va a paginar?
- **Un título corto por perfil**, para no usar la descripción entera como título (lo marcó la critique del 06/11).
- **Fecha de cierre:** en qué zona horaria se interpreta y si "hoy" cuenta como futura.
- **Orden** del listado de proyectos del colectivo.

## A confirmar

- **"¿Cómo querés sumar colaboradoras?"** en lugar de mostrar límite y modo de aceptación por separado, y sus tres textos.
- **El paso en la URL** (`?paso=`), con la vuelta al paso 1 si al recargar no hay datos. Cambiar de paso cambia solo el parámetro, no la ruta, así que no dispara el aviso de cambios sin guardar (`useAvisoCambiosSinGuardar` compara el `pathname`).
- **"Quitar" un perfil sin confirmación** en el paso 2, porque todavía no está publicado.
- **"Mis proyectos" como pantalla de inicio** del colectivo, en lugar de su perfil.

## Fuera de alcance

- Editar el proyecto o sus perfiles, cambiar habilidades, cerrar o reabrir búsquedas, finalizar el proyecto (spec 04b).
- Borradores.
- Postulaciones recibidas (spec 09) y buscar colaboradoras (spec 08).
- Avance del proyecto (spec 07).

## Criterio de aceptación

- Los escenarios funcionan con el back y con sesión simulada de colectivo en desarrollo.
- Un colectivo publica un proyecto con dos perfiles solo con teclado, sin ver ningún término del back.
- Un test cubre el alta completa en tres pasos con el back simulado en axios, incluido un 400 del back con `issues`.
- A 320 px no hay scroll horizontal y el indicador de pasos se ve compacto.
- `npm run lint`, `npm run format:check`, `npm test` y `npm run build` en verde sobre el repo completo, y el checklist de `docs/criterios-pantallas-web.md` revisado.
