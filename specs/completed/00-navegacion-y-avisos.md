# Navegación y avisos

Origen: `docs/plan-front.md` §5.1 (Notificaciones) y §5.3 (Layout y ruta `*`), `DESIGN.md` → Navigation y `docs/criterios-pantallas-web.md` §3, §4 y §9. Sigue a `specs/completed/00-base-transversal.md`.

## Intención

Completar el marco que comparten todas las pantallas, antes de la sesión y de las pantallas reales:

- un aviso global de éxito o error después de cada acción;
- la cabecera definitiva, con su versión para celular y el enlace para saltar al contenido;
- las pantallas "No encontrada" y "Sin permiso";
- un título de pestaña por pantalla y el foco en el contenido al navegar.

Sirve a todos los roles. Nada de esto depende del back ni del proveedor de identidad.

## Escenarios

### Avisos

Dado que una acción salió bien (por ejemplo, crear una habilidad),
cuando termina,
entonces aparece abajo un aviso de éxito con ícono y texto ("Habilidad creada correctamente."), lo anuncia el lector de pantalla y se cierra solo a los 6 segundos.

Dado un aviso de éxito,
cuando la persona pasa el mouse por encima o le llega el foco,
entonces no se cierra mientras siga ahí.

Dado un aviso de error,
cuando aparece,
entonces queda hasta que la persona lo cierra con su botón.

Dado cualquier aviso,
cuando la persona toca "Cerrar aviso",
entonces desaparece.

Dado que se disparan cuatro avisos seguidos,
cuando se muestran,
entonces se ven como máximo tres, y el más viejo se va primero.

### Cabecera

Dado una persona que navega con teclado,
cuando aprieta Tab por primera vez en cualquier pantalla,
entonces aparece "Saltar al contenido" y, al activarlo, el foco pasa al contenido principal.

Dado una pantalla de menos de 768px,
cuando la persona toca "Menú",
entonces se abre un panel con los mismos enlaces en el mismo orden, el botón dice que está expandido y Esc lo cierra devolviendo el foco al botón.

Dado el menú abierto en celular,
cuando la persona elige un enlace,
entonces navega y el menú se cierra.

Dado cualquier pantalla,
cuando la persona mira la cabecera,
entonces el enlace de la sección actual se distingue con texto en peso 600, subrayado coral y `aria-current="page"`.

### Navegación

Dado que la persona sigue un enlace interno,
cuando cambia la pantalla,
entonces la pestaña muestra "<Pantalla> · Código a Voluntad" y el foco va al título de la pantalla nueva, para que el lector de pantalla la anuncie.

Dado una URL que no existe,
cuando la persona la abre o la recarga,
entonces ve "No encontramos esta página", una explicación corta y el enlace "Volver al inicio".

Dado `/sin-permiso`,
cuando la persona llega ahí,
entonces ve "No tenés permiso para ver esta página", qué puede hacer y el enlace "Volver al inicio".

## Requisitos

### Avisos (`Presentation/Context/`, `Hooks/` y `Components/App/`)

- **Nombre:** se llaman "avisos" y no "notificaciones", porque `Notificacion` ya es un módulo del dominio (la bandeja del back, spec 11). Se actualiza §5.1 de `plan-front.md`.
- **Archivos:**
  - `Presentation/Context/AvisosContext.js` con el `createContext`.
  - `Components/App/AvisosProvider.jsx` con el estado y la región que los muestra.
  - `Hooks/useAvisos.js`, que lanza un error claro si se usa fuera del provider.
  - El contexto va en un archivo aparte para que `react-refresh` no se queje de un archivo que exporta componentes y otras cosas.
- **API:** `const avisar = useAvisos();` con `avisar.exito(texto)`, `avisar.error(texto)` y `avisar.info(texto)`. Cada uno devuelve el id del aviso; `avisar.cerrar(id)` lo cierra antes de tiempo.
- **Duración:** éxito e info se cierran a los 6 s. El tiempo se pausa con el mouse encima o el foco adentro y se reanuda al salir. Error no se cierra solo. Con 4 o más avisos, sale el más viejo.
- **Accesibilidad:**
  - Dos regiones que existen desde el inicio, aunque estén vacías: `role="status"` (`aria-live="polite"`) para éxito e info, y `role="alert"` para error.
  - El botón "Cerrar aviso" es solo ícono, con `aria-label`, y mide 44×44px.
  - Aparecer un aviso no le saca el foco a la persona.
- **Estilo (`AvisosProvider.module.css`):**
  - Ubicación: fijo abajo, centrado y a ancho completo menos 16px por lado en celular; abajo a la derecha, con hasta 400px de ancho, desde 768px.
  - Caja: fondo del tenue de su estado, borde de 1px en su color, esquinas `md`, sombra de elevación, ícono de 20px en su color (`exito`, `alerta`, `aviso`) y texto en tinta con peso 600.
  - Entrada: desplazamiento de 8px y opacidad en 180ms; sin movimiento con `prefers-reduced-motion`.
- **Uso:** `AvisosProvider` envuelve a `AppRoutes` en `Pages/App.jsx`. Cada hook de módulo decide cuándo avisar (§5.4).
- **Errores de carga y de formulario:** siguen en su lugar (`ErrorState` y el error del formulario). El aviso de error es para acciones que no tienen un lugar propio en la pantalla.
- **Migración de Habilidades:** `useCrearHabilidad` llama a `avisar.exito("Habilidad creada correctamente.")` al crear. Se quitan de la página el estado `mensaje` y el `<p role="status">`.

### Cabecera (`Components/App/AppLayout.jsx`, `Cabecera.jsx` y `MenuMovil.jsx`)

- **Saltar al contenido:** es el primer elemento enfocable del documento, apunta a `#contenido`, queda oculto fuera de la pantalla y se ve al recibir el foco (fondo crema, texto petróleo, arriba a la izquierda). `<main id="contenido" tabIndex={-1}>`.
- **Enlaces en un solo lugar:** salen de `Presentation/Routes/navegacion.js` (`{ ruta, texto }`), que se usa en escritorio y en celular. Por ahora solo "Habilidades", porque cada enlace visible tiene que llevar a una pantalla que funcione (criterios §1). Cuando haya roles, cada enlace va a tener `roles` y se filtra con `useAuth` (spec 01).
- **Escritorio (768px o más):** el nombre a la izquierda y los enlaces a la derecha, como hoy. Se suma el subrayado crema de 1px en hover que pide `DESIGN.md`.
- **Celular (menos de 768px):**
  - Los enlaces se esconden y aparece un botón secundario claro "Menú" (crema sobre petróleo, 44px) con `aria-expanded` y `aria-controls`.
  - El panel se abre debajo de la cabecera, a ancho completo y en petróleo, con los enlaces apilados de 44px de alto.
  - Esc o elegir un enlace lo cierran, y el foco vuelve al botón solo cuando se cerró con Esc.
- **Sin "Más ⌄" ni menú de cuenta:** se suman cuando haya sesión y más de tres enlaces (spec 01).

### Navegación (`Components/App/AppLayout.jsx` y `Pages/`)

- **Título de la pestaña:** cada página renderiza `<title>` (React 19 lo sube al `<head>`) como "Habilidades · Código a Voluntad". Lo arma `Components/App/TituloDePagina.jsx` (`<TituloDePagina>Habilidades</TituloDePagina>`), para que el sufijo esté en un solo lugar.
- **Foco al navegar:** al cambiar `location.pathname` (no al cargar por primera vez, ni al cambiar solo la búsqueda o la página de una lista), el foco va al `<h1>` de la pantalla, que lleva `tabIndex={-1}`. Lo hace `AppLayout` con un `useEffect` y `useLocation`. Así un cambio de `?pagina=` no le mueve el foco a la persona.
- **`NoEncontradaPage`** en la ruta `*`: `<h1>` "No encontramos esta página", el texto "Puede que el enlace esté mal escrito o que la página ya no exista." y un enlace "Volver al inicio" a `/`. Usa `EmptyState` sin ícono.
- **`SinPermisoPage`** en `/sin-permiso`: `<h1>` "No tenés permiso para ver esta página", el texto "Si creés que es un error, iniciá sesión con otra cuenta o pedile acceso a quien administra el colectivo." y "Volver al inicio". La va a usar `ProtectedRoute` (spec 01).
- **Rutas:** `AppRoutes` suma `/sin-permiso` y `*`, y sigue redirigiendo `/` a `/habilidades` hasta que exista `/proyectos`.

### Tests

- **`Components/App/AvisosProvider.test.jsx`:**
  - Muestra un éxito en la región `status` y un error en la `alert`.
  - Con temporizadores falsos: el éxito se va a los 6 s; con el mouse encima no se va, y al sacarlo vuelve a contar.
  - El error queda después de 6 s; "Cerrar aviso" lo saca.
  - Con cuatro avisos se ven tres.
  - `useAvisos` fuera del provider lanza el error.
- **`Components/App/AppLayout.test.jsx`:**
  - "Saltar al contenido" es el primer Tab y lleva el foco a `main`.
  - "Menú" alterna `aria-expanded`, Esc lo cierra y devuelve el foco, y elegir un enlace lo cierra. jsdom no aplica media queries, así que se prueba el comportamiento, no si se ve.
  - El enlace actual tiene `aria-current="page"`.
- **`App.test.jsx`:**
  - Una ruta inexistente muestra la 404, y "Volver al inicio" lleva a Habilidades con el foco en su `<h1>`.
  - El título de la pestaña es "Habilidades · Código a Voluntad".
  - El test de creación espera el aviso global en vez del `<p role="status">`.

## Estados

- No tiene estados de carga propios. Cada pantalla mantiene los de la spec 00 (skeleton, vacío, sin resultados y error con "Reintentar").
- "No encontrada" y "Sin permiso" son estados finales con una salida.

## Decisiones tomadas (05/11/2026)

- 6 s para los avisos de éxito e info (WCAG 2.2.1 pide poder pausarlos, y eso lo resuelven el hover y el foco).
- Avisos abajo. Es donde los busca la gente en celular y no tapan la cabecera ni el título.
- "Habilidades" queda como único enlace hasta que existan las pantallas del plan.

## Fuera de alcance

- Sesión, `useAuth`, `ProtectedRoute`, menú de cuenta, "Más ⌄", enlaces por rol y el aviso "Tu sesión venció" ante un 401 (spec 01).
- La bandeja de mensajes y notificaciones del back (spec 11).
- Pie de página.
- Notificaciones en tiempo real (WebSocket).

## Criterio de aceptación

- `npm run lint`, `npm test` y `npm run build` en verde, con los tests nuevos.
- Se navega todo con teclado: saltar al contenido, menú de celular con Esc y foco en el título al cambiar de pantalla.
- A 320px no hay scroll horizontal, la cabecera entra y los avisos no tapan los botones de la paginación de forma permanente.
- `plan-front.md` §5.1 dice "Avisos" y en el árbol de §5 aparece `Presentation/Context/`.
- Revisado el checklist de `docs/criterios-pantallas-web.md`.
