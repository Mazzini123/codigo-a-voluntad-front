# Perfil de colectivo (alta, edición y vista pública)

Origen: `specs/backlog/02-perfil-colectivo.md`, `docs/plan-front.md` §3 y la spec 01 (las opciones de `/bienvenida` llevan acá).

## Intención

Que un colectivo arme y mantenga los datos con los que se presenta en la plataforma, y que visitantes y colaboradoras puedan ver ese perfil público sin los datos de contacto internos. Esta spec destraba el despliegue de la 01: la opción "Soy un colectivo" de `/bienvenida` deja de llevar a una 404.

## Escenarios

### Alta

Dado una cuenta sin perfil en `/bienvenida`,
cuando elige "Soy un colectivo", completa nombre, descripción y tipo, y toca "Crear perfil",
entonces ve "Creando…", después el aviso "Perfil del colectivo creado." y llega a la edición de su perfil, con la cabecera del rol colectivo.

Dado el alta con campos obligatorios vacíos o inválidos,
cuando toca "Crear perfil",
entonces cada campo con problema muestra su error, el foco va al primero y no se envía nada.

Dado que el back rechaza el alta con errores por campo (400 con `issues`),
cuando responde,
entonces cada error aparece en su campo y lo cargado se conserva.

Dado una cuenta que ya tiene perfil,
cuando abre `/bienvenida/colectivo`,
entonces va al inicio de su rol. El tipo de cuenta no se cambia.

### Edición

Dado un colectivo en `/colectivo/perfil`,
cuando cambia la descripción y toca "Guardar cambios",
entonces se manda solo lo que cambió, ve "Guardando…" y después el aviso "Cambios guardados.".

Dado la edición sin cambios,
cuando la persona mira el botón,
entonces "Guardar cambios" está deshabilitado con el motivo "No hay cambios para guardar.".

Dado cambios sin guardar,
cuando la persona intenta ir a otra pantalla o recargar,
entonces se le pregunta si quiere salir sin guardar.

Dado que falla la carga del perfil,
cuando se muestra el error,
entonces ofrece "Reintentar".

### Vista pública

Dado un visitante o una colaboradora,
cuando abre `/colectivos/:id`,
entonces ve nombre, tipo, ubicación, descripción, redes y etiquetas, y la lista de sus proyectos, pero nunca los medios de contacto.

Dado un colectivo dado de baja o un id que no existe,
cuando se abre su página,
entonces ve "No encontramos este colectivo" y un enlace para volver.

## Requisitos

### Datos (ya existen en Application e Infrastructure)

- **Casos de uso:** `ObtenerColectivo`, `CrearColectivo` y `ActualizarColectivo`, por medio de `colectivoDependencies`.
- **Alta:** se manda `CrearColectivoRequest`.
- **Edición:** se manda `ActualizarColectivoRequest` solo con los campos que cambiaron. Las listas de redes y etiquetas van completas si cambió algún ítem. El contrato de edición excluye el tipo y los medios de contacto.
- **`perfilId` de la cuenta:** es el `id` del colectivo (spec 01).

### Formulario (`Components/Colectivo/ColectivoForm.jsx`, compartido entre alta y edición)

Campos en este orden, agrupados con `fieldset` y `legend`:

1. **Nombre (obligatorio):** texto.
2. **Tipo de colectivo (obligatorio, solo en el alta):** grupo de opciones con radios, que muestran "Fundación", "Asociación barrial", "ONG" y "Asamblea". Las opciones salen de `TIPO_COLECTIVO`. En la edición se muestra como texto ("Tipo: Asamblea") con la ayuda "El tipo no se puede cambiar.".
3. **Descripción (obligatorio):** `textarea`, con la ayuda "Contá a qué se dedican y con quiénes trabajan.".
4. **Ubicación:** grupo de opciones. Si elige provincia o ciudad o barrio, aparece un campo más:

| Opción                   | Se manda          | Campo extra                                                        |
| ------------------------ | ----------------- | ------------------------------------------------------------------ |
| "Prefiero no indicarla"  | `ubicacion: null` | —                                                                  |
| "Todo el país"           | `ARGENTINA`       | —                                                                  |
| "Ciudad de Buenos Aires" | `CABA`            | —                                                                  |
| "Una provincia"          | `PROVINCIA`       | selector de provincias, que sale de `Domain/Enums/PROVINCIAS.js`   |
| "Una ciudad o barrio"    | `LOCALIDAD`       | texto, con la ayuda "Por ejemplo: Villa Fiorito, Lomas de Zamora." |

5. **Medios de contacto (solo en el alta, opcional, hasta 10):**
   - Aviso de privacidad en `info`: "Los medios de contacto no se muestran en tu perfil público."
   - Cada fila: un selector de tipo ("Email", "WhatsApp", "SMS"), el valor y el botón "Quitar" con `aria-label` "Quitar medio de contacto 2".
   - Debajo, "Agregar medio de contacto", deshabilitado con su motivo al llegar a 10.
6. **Redes sociales (opcional, hasta 10):** filas con nombre (por ejemplo "Instagram") y dirección web, y el botón "Agregar red social".
7. **Etiquetas (opcional, hasta 10):**
   - Un campo de texto y el botón "Agregar". Enter dentro del campo agrega la etiqueta sin enviar el formulario.
   - Las etiquetas se ven como chips con "Quitar" y `aria-label` "Quitar etiqueta educación".
   - Ayuda: "Sirven para que te encuentren en la búsqueda.".

**Validación en el front** (`Components/Colectivo/validarColectivo.js`, funciones puras), al enviar y al salir de un campo que ya mostró error:

- Nombre y descripción: no pueden quedar vacíos ni con solo espacios.
- Email: con formato de email.
- WhatsApp y SMS: entre 8 y 15 dígitos; se aceptan espacios, guiones y un `+` adelante, que se quitan al enviar.
- Red social: un nombre de 1 a 40 caracteres y una dirección que empiece con `http://` o `https://`.
- Etiqueta: de 1 a 30 caracteres, sin repetidas (sin distinguir mayúsculas).
- Localidad: obligatoria si se eligió "Una ciudad o barrio"; provincia, si se eligió "Una provincia".

**Errores** (`docs/criterios-pantallas-web.md` §9):

- Cada campo con error lleva `aria-invalid="true"` y el mensaje debajo, con ícono, vinculado con `aria-describedby`.
- Al enviar con errores, el foco va al primer campo inválido.
- Los `issues` de un 400 se mapean por `path` al campo (`["mediosDeContacto", 1, "valor"]` → el valor del segundo medio). Lo que no se puede mapear va al error general del formulario.
- Un error que no es de validación (red o 5xx) se muestra arriba del botón, con `role="alert"`, y lo cargado se conserva.

**Componentes compartidos nuevos** (en `Components/App/`, cada uno con su CSS Module y el estilo de `DESIGN.md` → Inputs):

- `Campo`: label, control (input o `textarea`), ayuda, error y "(obligatorio)".
- `GrupoDeOpciones`: `fieldset` con radios de 44px de alto.
- `Selector`: `select` nativo con label.

Los van a reusar las specs 03, 04 y 05.

**Etiquetas legibles:** `Presentation/Formatos/colectivo.js` traduce `tipoColectivo` y `ubicacion` a texto ("Asociación barrial", "Córdoba", "Todo el país"). Así no se muestra un enum en ninguna pantalla.

### Pantallas y rutas

- **`/bienvenida/colectivo`** (privada, `permitirSinPerfil`), `AltaColectivoPage`:
  - Título "Creá el perfil de tu colectivo".
  - El formulario vacío y el botón primario "Crear perfil".
  - Al crear: llama a `recargarCuenta`, avisa "Perfil del colectivo creado." y navega a `/colectivo/perfil`.
  - Si la cuenta ya tiene rol, redirige al inicio.
- **`/colectivo/perfil`** (privada, rol `COLECTIVO`), `PerfilColectivoPage`:
  - Título "Perfil del colectivo" y un enlace secundario "Ver perfil público".
  - El formulario cargado y el botón primario "Guardar cambios".
  - Mientras carga, un skeleton con la forma del formulario. Si falla, `EstadoDeError` con "Reintentar".
- **`/colectivos/:id`** (pública), `ColectivoPage`:
  - Nombre como `h1`, tipo y ubicación en una línea de tinta suave, la descripción, las redes como enlaces externos y las etiquetas como chips.
  - Sección "Proyectos": título y estado de cada proyecto, en texto y sin enlace hasta que exista el detalle (spec 06). Sin proyectos: "Todavía no publicó proyectos.".
  - El DTO público excluye los medios de contacto.
  - 404 o colectivo dado de baja (`fechaBaja`): "No encontramos este colectivo", con `MensajeDePantalla`.
- **Inicio por rol:** colectivo → `/colectivo/perfil`, hasta que exista `/colectivo/proyectos` (spec 04).
- **Cabecera:** enlace "Mi colectivo" (`roles: ["COLECTIVO"]`) a `/colectivo/perfil`.
- **Plan:** se suma `/colectivos/:id` a la tabla de rutas de `plan-front.md`.

### Cambios sin guardar

- **Migración a un data router:** el aviso necesita `useBlocker`, que solo funciona con un data router. Por eso `App.jsx` pasa de `BrowserRouter` a `createBrowserRouter` con las mismas rutas, y los tests que montan rutas usan `createMemoryRouter`.
- **Hook `useAvisoCambiosSinGuardar(hayCambios)`:**
  - Bloquea la navegación interna y abre un `DialogoDeConfirmacion` con `permanente={false}`: "¿Salir sin guardar?", "Los cambios que hiciste en el perfil se van a perder." y el botón "Salir sin guardar".
  - Para la recarga o el cierre de la pestaña usa `beforeunload` (el navegador muestra su propio mensaje).
  - Después de guardar con éxito, no bloquea.

### Sesión simulada

- **Variable nueva `VITE_SESION_SIMULADA_PERFIL_ID`:** el `id` de un colectivo real del back, que la cuenta simulada usa como `perfilId`. Sin ella, la edición pide `colectivo-simulado` y muestra la 404.
- **Alta con `SIN_PERFIL`:** después del alta, la cuenta simulada adopta el rol y el `id` del colectivo creado. Lo guarda en `sessionStorage` vía `asociarPerfilSimulado`, que solo existe en desarrollo. Así se recorre el flujo completo sin back con sesión.

## Estados

- Cargando (edición y vista pública): skeleton con la forma del formulario o de la página.
- Con datos: el formulario o el perfil.
- Vacío: en la vista pública, "Todavía no publicó proyectos." dentro de su sección.
- Error al cargar: `EstadoDeError` con "Reintentar". El 404 se muestra como "No encontramos este colectivo".
- Enviando: "Creando…" o "Guardando…", con el formulario deshabilitado.
- Error al enviar: errores por campo, o error general con lo cargado intacto.

## A acordar con el back

- Los nombres exactos de las provincias que acepta `PROVINCIA` (propongo las 23, con tildes: "Buenos Aires", "Córdoba", "Entre Ríos", "Tierra del Fuego, Antártida e Islas del Atlántico Sur"…), o un endpoint de catálogo (`GET /catalogos/provincias`), como pide el plan para los filtros.
- El largo máximo de `nombre` y `descripcion`, para validarlos también en el front.
- **Edición de medios de contacto.** Queda suspendida hasta contar con una consulta y una edición privadas para el dueño del perfil. Los medios se guardan durante el alta y se conservan al editar los datos públicos.
- `POST /colectivos` asocia el perfil al `sub` del token y responde 409 si la cuenta ya tiene perfil (spec 01).

## A confirmar

- **Migración a `createBrowserRouter`:** es la única forma de avisar al navegar dentro de la app con React Router 7. La alternativa es avisar solo al recargar o cerrar la pestaña.
- **Redes sociales y etiquetas desde el alta:** las incluyo porque el request las acepta y las etiquetas sirven para la búsqueda. Se pueden dejar para más adelante y hacer el formulario más corto.
- **Proyectos sin enlace en la vista pública** hasta la spec 06.

## Fuera de alcance

- Dar de baja el colectivo (`POST /colectivos/:id/baja`): requiere su propia confirmación y una decisión sobre qué pasa con los proyectos activos.
- Varias personas administrando un colectivo.
- Ver la lista de colectivos (no está en las pantallas mínimas).

## Criterio de aceptación

- Los escenarios funcionan con el back, y con sesión simulada en desarrollo.
- Los medios de contacto nunca aparecen en la vista pública. Lo verifica un test.
- Todo el formulario se usa con teclado. Con el lector de pantalla se oyen el label, la ayuda y el error de cada campo.
- A 320px no hay scroll horizontal y cada fila de contacto o red se apila.
- `npm run lint`, `npm run format:check`, `npm test` y `npm run build` en verde sobre el repo completo, y el checklist de `docs/criterios-pantallas-web.md` revisado.
