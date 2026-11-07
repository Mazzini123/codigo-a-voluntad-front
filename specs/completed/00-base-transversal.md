# Base transversal

Origen: `docs/plan-front.md` §5.1 a §5.6 y `DESIGN.md` (05/11/2026).

## Intención

Construir una sola vez, antes de la primera pantalla real, las piezas que usan todas: tokens y estilos globales, cliente HTTP con errores normalizados y reintentos, `useAsync` y los componentes compartidos de feedback y confirmación.

Es para el equipo que implementa cada pantalla. A través de ellas llega a todos los roles: visitante, colaboradora y colectivo ven los mismos botones, estados y mensajes en todas las pantallas. El ejemplo de Habilidades se migra para que quede como referencia de cómo se usa todo junto.

## Escenarios

### Estilos

Dado cualquier pantalla,
cuando carga,
entonces se ve el fondo crema y el texto en tinta, con los títulos en Bricolage Grotesque y el texto en Source Sans 3, servidas desde `/fonts/` y sin pedidos a otros dominios en la pestaña Network.

Dado que una tipografía todavía no terminó de cargar,
cuando se dibuja la pantalla,
entonces el texto se ve con una fuente del sistema y se reemplaza al cargar (`font-display: swap`), nunca queda invisible.

Dado una persona que navega con teclado,
cuando el foco llega a un botón, enlace o campo,
entonces aparece el anillo de foco de 3px en `info` con 3px de separación.

### Cliente HTTP

Dado que `configurarAuth` recibió un `obtenerToken` que devuelve un token,
cuando sale cualquier pedido,
entonces lleva `Authorization: Bearer <token>`.

Dado que no hay sesión (no se llamó a `configurarAuth` o `obtenerToken` devuelve `null`),
cuando sale un pedido,
entonces no lleva el encabezado `Authorization`.

Dado que el back no responde,
cuando falla un GET,
entonces se reintenta solo hasta 2 veces con espera creciente y, si sigue fallando, la pantalla recibe un `ApiError` con "No pudimos conectarnos con el servidor. Revisá tu conexión." y `esReintentable: true`.

Dado que el back no responde,
cuando falla un POST, PUT, PATCH o DELETE,
entonces no se reintenta solo: la persona recibe el `ApiError` y decide con "Reintentar".

Dado una respuesta 401,
cuando llega,
entonces se llama una vez a `alExpirar` y la pantalla recibe un `ApiError` con status 401.

Dado una respuesta 403,
cuando llega,
entonces no se llama a `alExpirar` (la sesión sigue) y el mensaje es "No tenés permiso para hacer esto."

Dado una respuesta 429,
cuando llega,
entonces no se reintenta, `esReintentable` es `false` y el mensaje es "Hiciste muchas búsquedas seguidas. Esperá unos segundos y volvé a intentar."

Dado una respuesta 4xx con `message` en el cuerpo (por ejemplo, 409 "Ya existe esa habilidad"),
cuando llega,
entonces el `ApiError` lleva ese texto.

Dado una respuesta 5xx,
cuando llega,
entonces el mensaje es un texto fijo en lenguaje de la persona, nunca el del back.

Dado un pedido cancelado (desmontaje o cambio de parámetros),
cuando se aborta,
entonces no se convierte en `ApiError`, no se reintenta y no se muestra nada.

### `useAsync`

Dado un hook de módulo que usa `useAsync`,
cuando la pantalla se monta,
entonces `cargando` es `true` hasta que llegan los `datos`.

Dado que la persona cambia de página antes de que llegue la respuesta anterior,
cuando llega la respuesta vieja,
entonces se ignora: el pedido anterior se abortó y no pisa a la página nueva.

Dado una consulta que falló,
cuando la persona toca "Reintentar",
entonces se repite el pedido con los mismos argumentos.

Dado una acción (`inmediato: false`),
cuando la pantalla se monta,
entonces no se hace ningún pedido hasta llamar a `ejecutar(...)`.

### Componentes

Dado un botón enviando,
cuando la persona lo mira,
entonces muestra el texto en gerundio ("Guardando…") con el indicador circular, queda deshabilitado y mantiene su ancho.

Dado una acción permanente,
cuando la persona toca el botón peligroso,
entonces se abre el diálogo de confirmación con el foco en "Cancelar"; Esc lo cierra y el foco vuelve al botón que lo abrió.

Dado una consulta que responde en menos de 300 ms,
cuando termina,
entonces el skeleton nunca llegó a verse.

### Habilidades

Dado `/habilidades?pagina=2`,
cuando la persona recarga o comparte el enlace,
entonces se ve la página 2.

Dado que el catálogo está vacío,
cuando termina de cargar,
entonces se ve el estado vacío, no un error.

Dado que el back está caído,
cuando se agotan los reintentos automáticos,
entonces se ve el estado de error con "Reintentar" y, al recuperarse el back, la lista.

Dado una habilidad que ya existe,
cuando la persona intenta crearla,
entonces ve el mensaje del back y el formulario conserva lo que escribió.

## Requisitos

### Estilos (`src/Styles/`)

- **`tokens.css`:** todos los tokens del frontmatter de `DESIGN.md` como variables en `:root`, con estos prefijos:
  - Colores: `--color-<nombre>` (`--color-crema`, `--color-petroleo-tenue`, `--color-peligro-hover`…), los 24 del frontmatter.
  - Espaciado: `--espacio-1` a `--espacio-8` (4 a 64px).
  - Esquinas: `--radio-sm`, `--radio-md`, `--radio-lg`, `--radio-xl`, `--radio-pildora`.
  - Tipografía: `--fuente-titulos`, `--fuente-texto` y, por rol (`display`, `headline`, `title`, `body`, `body-sm`, `label`, `button`), `--texto-<rol>-tamano`, `-peso`, `-altura`, `-espaciado` y, en los títulos, `-opsz`.
  - Sombras de "Elevation & Depth": `--sombra-respuesta`, `--sombra-elevacion`, `--color-telon`.
  - Medidas: `--toque-minimo` (44px), `--ancho-contenedor` (1200px), `--ancho-lectura` (720px), `--ancho-texto` (68ch), `--anillo-foco` (3px).
  - Duraciones: `--duracion-presion` (120ms), `--duracion-hover` (150ms), `--duracion-dialogo` (180ms), `--duracion-pulso` (1.6s).
- **`base.css`:** declara `@layer reset, base;` y define:
  - `reset`: `box-sizing: border-box`, márgenes en 0, `font: inherit` en controles, imágenes en bloque.
  - `base`: los `@font-face`, `body` (fondo crema, tinta, `--fuente-texto` en body), `h1` en headline, `h2` y `h3` en title, enlaces en petróleo con `text-underline-offset: 0.2em` (2px de grosor en hover), `::selection` en coral tenue con tinta, `caret-color` petróleo, `:focus-visible` con el anillo de foco y `prefers-reduced-motion: reduce` que anula animaciones y transiciones.
  - Los CSS Modules quedan fuera de las capas, así que siempre ganan sobre `base.css` sin pelear por especificidad.
- **Tipografías en `public/fonts/`:** `bricolage-grotesque-variable.woff2` (con el eje `opsz`, pesos 200 a 800) y `source-sans-3-variable.woff2` (200 a 900), subset latino con tildes, ñ, ¿, ¡ y «». Se suma el `OFL.txt` de cada una. Se descargan una vez como archivos (Google Fonts o los `woff2` de Fontsource), sin instalar paquetes.
- **`main.jsx`** importa `tokens.css` y después `base.css`. Se borran `Styles/global.css` y `Styles/habilidades.css`.
- Fuera de `tokens.css` no hay colores en hex, `rgb()` ni nombres de color, ni espaciados o tamaños de letra sueltos: todo sale de una variable.

### Cliente HTTP (`src/Infrastructure/Http/`)

- **`ApiError.js`:** clase que extiende `Error` con `name: "ApiError"`, `status` (número o `null` si no hubo respuesta), `mensaje`, `esReintentable`, `issues` (los del cuerpo del back o `[]`) y `cause` (el error original de axios).
- **`mensajesDeError.js`:** decide `mensaje` y `esReintentable`:

| Caso          | Mensaje                                                                       | `esReintentable` |
| ------------- | ----------------------------------------------------------------------------- | ---------------- |
| Sin respuesta | "No pudimos conectarnos con el servidor. Revisá tu conexión."                 | sí               |
| Timeout       | "El servidor tardó demasiado en responder. Probá de nuevo."                   | sí               |
| 400 / 422     | `message` del back o "Revisá los datos ingresados."                           | no               |
| 401           | "Tu sesión venció. Iniciá sesión de nuevo."                                   | no               |
| 403           | "No tenés permiso para hacer esto."                                           | no               |
| 404           | `message` del back o "No encontramos lo que buscabas."                        | no               |
| 409           | `message` del back o "La operación entra en conflicto con el estado actual."  | no               |
| 429           | "Hiciste muchas búsquedas seguidas. Esperá unos segundos y volvé a intentar." | no               |
| 5xx           | "Tuvimos un problema en el servidor. Probá de nuevo en unos minutos."         | sí               |
| Otro 4xx      | `message` del back o "No pudimos completar la operación."                     | no               |

- **`configurarAuth.js`:** `configurarAuth({ obtenerToken, alExpirar } = {})` reemplaza la configuración actual. `obtenerToken` es asíncrono; por defecto devuelve `null` y `alExpirar` no hace nada. Llamarla sin argumentos vuelve a los valores por defecto (lo usan los tests). Si `obtenerToken` falla, el pedido sale sin token y el back responde 401.
- **`axiosClient.js`:** exporta `crearAxiosClient({ reintentos = 2, esperaBaseMs = 300 } = {})` y la instancia `axiosClient = crearAxiosClient()`. Mantiene `baseURL` (`VITE_API_BASE_URL` o `/api`) y `Accept: application/json`; el timeout baja de 15 s a 10 s (ver "A confirmar").
  - **Request:** espera `obtenerToken()` y agrega el encabezado si hay token.
  - **Response:** toda falla que no sea una cancelación (`axios.isCancel`) sale como `ApiError`. El 401 llama a `alExpirar`.
  - **Reintentos:** solo `GET`, solo sin respuesta o con timeout (`ECONNABORTED`, `ETIMEDOUT`), hasta `reintentos` veces, con espera de `esperaBaseMs × 2^intento` (300 y 600 ms). La espera se corta si el `signal` del pedido se aborta. Ningún status HTTP se reintenta solo.
- Se borra `Presentation/Hooks/obtenerMensajeError.js`. Se actualizan el comentario de `ErrorApiDto.js` y la línea de `docs/PLAN-ENTIDADES.md` que dice que se propagan los errores originales de axios: ahora llega un `ApiError`.
- La presentación no importa `ApiError`: lee `mensaje` y `esReintentable` del error que recibe.

### `useAsync` (`src/Presentation/Hooks/useAsync.js`)

- Firma: `useAsync(tarea, { inmediato = true } = {})` → `{ datos, error, cargando, ejecutar, reintentar }`.
- `tarea` es `(signal, ...args) => promesa`. El hook de módulo la memoriza con `useCallback` y sus dependencias reales, para que `eslint-plugin-react-hooks` las controle donde se escriben. Cuando `tarea` cambia y `inmediato` es `true`, se vuelve a ejecutar.
- `cargando` arranca en `inmediato`. `error` es `null` hasta que algo falla.
- El efecto no es `async`: crea un `AbortController`, llama a la tarea y en la limpieza aborta. Toda respuesta de un pedido abortado se ignora, y nunca se actualiza el estado después de desmontar.
- `ejecutar(...args)` aborta el pedido en curso, lanza uno nuevo y devuelve una promesa que se resuelve en `true` si salió bien y en `false` si falló o se canceló. Nunca rechaza.
- `reintentar()` repite el último `ejecutar` con los mismos argumentos.
- Mientras carga de nuevo se conservan los `datos` anteriores; la pantalla decide si muestra el skeleton o los datos con `aria-busy`.
- No notifica ni arma mensajes: eso lo decide el hook de cada módulo.
- `useHabilidades(pagina)` y `useCrearHabilidad()` se reescriben sobre `useAsync` en pocas líneas.

### Componentes compartidos (`src/Presentation/Components/App/`)

Cada uno con su `X.module.css` al lado, solo con variables de `tokens.css` y con las medidas, estados y reglas de `DESIGN.md` → Components.

- **`Boton`:** `variante` `"primario"`, `"secundario"` (por defecto) o `"peligroso"`; `type` `"button"` por defecto; `icono`; `enviando` y `textoEnviando`; `motivoDeshabilitado`.
  - Alto mínimo de 44px, esquinas `md`, 1.5px de contorno en secundario y peligroso.
  - `enviando`: indicador circular de 16px, `aria-busy="true"`, deshabilitado y mismo ancho.
  - Deshabilitado: fondo `hundido` y texto `tinta-suave`, nunca con opacidad. Si recibe `motivoDeshabilitado`, lo muestra debajo en body small y lo enlaza con `aria-describedby`.
  - Presionado: baja 1px en `--duracion-presion`.
  - Existe una variante `"peligrosoConfirmar"` (relleno peligro y texto blanco) que solo usa `ConfirmDialog`.
- **`Chip`** (de habilidad): `tipo` `"requerida"` u `"opcional"`, `mostrarTipo` y `laTenes`.
  - Requerida: borde continuo de 1px en petróleo, fondo petróleo tenue, peso 600. Opcional: borde punteado en `borde-campo`, fondo superficie, tinta suave, peso 400. Alto de 32px y forma de píldora.
  - `mostrarTipo` agrega el texto visible "· opcional" (para chips mezclados en una línea).
  - `laTenes` agrega la tilde de 16px y el texto oculto "La tenés".
- **`Skeleton`:** contenedor con `etiqueta` ("Cargando habilidades…") y `demoraMs` (300 por defecto), más `BloqueSkeleton` con `ancho`, `alto` y `forma` (`"linea"` o `"pildora"`).
  - El contenedor lleva `aria-busy="true"` y la etiqueta como texto oculto en una región `aria-live="polite"`; los bloques llevan `aria-hidden="true"`.
  - Nada se ve antes de `demoraMs`. Pulso de opacidad entre 1 y 0.55 en `--duracion-pulso`; quieto con movimiento reducido.
- **`EmptyState`:** `titulo`, `descripcion`, `icono` y `children` para la única acción. Borde punteado, ancho máximo de 48ch, centrado. La variante "sin resultados" es el mismo componente con otros textos (repite lo buscado y ofrece "Limpiar filtros").
- **`ErrorState`:** `titulo`, `error`, `alReintentar` y `reintentando`.
  - `role="alert"`, fondo peligro tenue, ícono de alerta, `titulo` y `error.mensaje`.
  - Botón secundario "Reintentar" (con ícono de flecha circular) solo si recibe `alReintentar` y `error.esReintentable` no es `false`; con `reintentando`, pasa a "Reintentando…" deshabilitado.
  - Si vuelve a fallar después de un reintento, el foco va a su título (`tabIndex={-1}` y `useRef`).
  - Nunca muestra el status, un código ni el error crudo.
- **`ConfirmDialog`:** `abierto`, `titulo`, `descripcion`, `textoConfirmar`, `textoEnviando`, `enviando`, `alConfirmar` y `alCancelar`.
  - `<dialog>` nativo con `showModal()` cuando `abierto` pasa a `true` y `close()` cuando pasa a `false`.
  - Orden: título, descripción, "Esta acción no se puede deshacer." (peso 600, color peligro, con ícono) y las acciones: "Cancelar" (secundario) primero y el botón `"peligrosoConfirmar"` último. En celular se apilan a ancho completo, con el peligroso arriba.
  - `aria-labelledby` al título y `aria-describedby` a la descripción.
  - Al abrir, el foco va a "Cancelar". Esc llama a `alCancelar`. Al cerrar, el foco vuelve al elemento que lo tenía antes de abrir.
  - Con `enviando`, ambos botones quedan deshabilitados, el peligroso muestra `textoEnviando` y Esc no cierra.
  - Tocar el telón no cierra (evita perder la confirmación por un toque accidental).
  - Entrada con opacidad y escala de 0.97 a 1 en `--duracion-dialogo`; sin animación con movimiento reducido.
- **`Paginacion`:** `pagina`, `totalPaginas`, `total`, `etiqueta` (para el `aria-label` del `<nav>`) y `alCambiar`.
  - "Anterior" y "Siguiente" como botones secundarios con flecha, deshabilitados en los extremos, y "Página X de Y · N resultados" con cifras tabulares.
  - No se muestra si `totalPaginas` es 1 o menos (el back devuelve 0 sin resultados).
- **Apoyo:** `Icono` (SVG de línea propio, trazo de 1.75px, tamaños 16/20/24/32, `aria-hidden` por defecto; set inicial: alerta, reintentar, tilde, cruz, flecha izquierda y derecha, vacío) y `TextoOculto` (texto solo para lectores de pantalla).

### Migración de Habilidades

- `HabilidadesPage` toma la página de `?pagina=` con `useSearchParams`; un valor ausente, no numérico o menor a 1 es 1. Cambiar de página solo cambia la URL: ya no llama a `refrescar`.
- Estados con los componentes compartidos:
  - Cargando: `Skeleton` con bloques con la forma de los ítems de la lista.
  - Catálogo vacío: `EmptyState` "Todavía no hay habilidades en el catálogo" con "Agregá la primera con el formulario."
  - Página fuera de rango (lista vacía con `pagina` > 1): `EmptyState` con el botón "Volver a la primera página".
  - Error: `ErrorState` "No pudimos cargar las habilidades" con `reintentar`.
  - Con datos: la lista y `Paginacion`.
- Cada ítem de la lista es una tarjeta (superficie, borde en `linea`, esquinas de 12px) con el título en petróleo, la descripción en tinta suave ("Sin descripción" si no tiene) y un sello a la derecha: "Activa" con tilde en `exito` sobre `exito-tenue`, o "Inactiva" con guion en `tinta-suave` sobre `hundido`. Hover: borde petróleo y sombra de respuesta.
- Arriba de la lista, a la derecha del título "Catálogo", "Mostrando X–Y de N" en body small con cifras tabulares.
- Referencia visual: `habilidades-main.png` y `habilidades-estados.png` (maqueta del 05/11), que se guardan en `docs/maquetas/`.
- Se quita el botón "Actualizar catálogo": lo reemplazan "Reintentar" y el refresco automático después de crear.
- `HabilidadForm`: label "Título (obligatorio)"; debajo de "Descripción", la ayuda "Contá en una línea para qué sirve, así un colectivo sin experiencia técnica la entiende." enlazada con `aria-describedby`; `Boton` primario "Crear habilidad" / "Guardando…", deshabilitado sin título con el motivo "Escribí un título para crear la habilidad."; el error con `role="alert"` usa `error.mensaje`. El aviso "Habilidad creada correctamente." va en `aria-live="polite"`.
- `HabilidadesPage`, `HabilidadForm`, `HabilidadList` y `AppLayout` pasan a CSS Modules. `AppLayout` solo traslada lo que hoy hace `global.css` a la cabecera petróleo con el nombre en crema de `DESIGN.md`.
- `App.test.jsx` se actualiza a los textos nuevos. El test de fallo de red hace fallar el adaptador 3 veces (1 + 2 reintentos) con temporizadores falsos y comprueba que "Reintentar" recupera la lista. Se agrega un caso que verifica que `?pagina=2` en la URL pide `page: 2`.

### Tests nuevos

Al lado de cada archivo, con Vitest y Testing Library y sin dependencias nuevas.

- **`Presentation/Hooks/useAsync.test.jsx`:** arranca cargando y entrega los datos; guarda el error y deja de cargar; aborta al desmontar (`signal.aborted`); ignora la respuesta vieja cuando cambia la tarea; con `inmediato: false` no pide hasta `ejecutar`; `ejecutar` devuelve `true` o `false`; `reintentar` repite los últimos argumentos.
- **`Infrastructure/Http/axiosClient.test.js`:** con adaptador falso (como en `App.test.jsx`) y `configurarAuth()` en `afterEach`:
  - Agrega el token (también si `obtenerToken` es asíncrono) y no agrega nada sin token.
  - Convierte en `ApiError` cada fila de la tabla de mensajes.
  - 401 llama a `alExpirar`; 403 no.
  - Un GET sin respuesta se reintenta 2 veces y después falla; un POST sin respuesta no se reintenta; un 429 y un 500 no se reintentan.
  - Un pedido abortado no se convierte en `ApiError` ni se reintenta, tampoco durante la espera.
- **`Presentation/Components/App/ConfirmDialog.test.jsx`:** al abrir, el foco está en "Cancelar"; Esc llama a `alCancelar`; al cerrar, el foco vuelve al botón que lo abrió; confirmar llama a `alConfirmar`; con `enviando`, los dos botones están deshabilitados y se ve el gerundio; el diálogo tiene nombre y descripción accesibles y el aviso "Esta acción no se puede deshacer."
- Si jsdom no implementa `showModal()` y `close()`, se agrega en `setupTests.js` un reemplazo mínimo (atributo `open` y evento `cancel`), sin paquetes.

## Estados

Esta spec no tiene pantalla propia: define cómo se ve cada estado en todas.

- Cargando: `Skeleton` después de 300 ms, con `aria-busy` y el texto oculto en `aria-live`.
- Con datos: el contenido y, en listados paginados, `Paginacion`.
- Vacío: `EmptyState` con el motivo y el paso siguiente; nunca un error.
- Sin resultados: `EmptyState` que repite lo buscado y ofrece "Limpiar filtros" (Habilidades no tiene filtros; queda lista para la 05).
- Error: `ErrorState` con el mensaje del `ApiError` y "Reintentar"; sin botón si `esReintentable` es `false` (429, 4xx).

## Decisiones tomadas (05/11/2026)

- Timeout de 10 s (hoy 15 s): con dos reintentos, 15 s dejaría a la persona casi 50 s esperando.
- Los 5xx muestran siempre el texto fijo, aunque el back mande `message`, para no mostrar errores técnicos.
- Los 404 no son reintentables; si el equipo prefiere ofrecer "Reintentar" en toda consulta, se cambia en una línea de `mensajesDeError.js`.

## Fuera de alcance

- Login, `AuthProvider`, `ProtectedRoute`, el adaptador de `Infrastructure/Auth` y llevar al login ante un 401 (spec 01 y §5.3). Por ahora `alExpirar` no hace nada.
- Notificaciones (`NotificationContext` y avisos de éxito o error globales): está en §5.1, pero va en una spec propia.
- Cabecera completa: menú en celular, menú de cuenta y "Saltar al contenido".
- Errores por campo a partir de `issues`: el `ApiError` ya los trae; cada formulario los muestra en su spec.
- Tarjeta de proyecto, sellos de estado, chips como filtro, agrupación "Requeridas / Opcionales" y el "+2 más".
- `Retry-After` en el 429.
- `vitest-axe` (requiere aprobación).
- Volver a correr `/impeccable document`: se hace al cerrar esta spec, cuando exista el código.

## Criterio de aceptación

- `npm run lint`, `npm test` y `npm run build` en verde, con los tres tests nuevos y `App.test.jsx` actualizado.
- Las fuentes se piden a `/fonts/` y responden 200; no hay pedidos a otros dominios.
- Ya no existen `global.css`, `habilidades.css` ni `obtenerMensajeError.js`, ni `className` con clases globales en el JSX.
- Fuera de `tokens.css` no hay colores ni medidas sueltas en el CSS.
- Ningún componente ni página importa axios, httpClients ni casos de uso: todo pasa por un hook.
- Los escenarios de Habilidades funcionan con teclado y al recargar se conserva la página.
- Revisado el checklist de `docs/criterios-pantallas-web.md`.
