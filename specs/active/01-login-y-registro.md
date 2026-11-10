# Login, registro y rutas protegidas

Origen: `specs/backlog/01-login-y-registro.md`, `docs/plan-front.md` §5.3 y la decisión de usar Logto (05/11/2026).

Actualización aprobada el 06/11/2026: migración a `@logto/react` y accesos directos en `specs/active/integracion-logto-react.md`. Reemplaza la elección inicial de SDK.

## Intención

Que colectivos y personas colaboradoras puedan ingresar, crear su cuenta y llegar a las pantallas de su rol. Que nadie vea una pantalla privada sin sesión ni la de otro rol. Las pantallas de contraseña, verificación de email y recuperación son de Logto. La aplicación decide qué es cada persona en la plataforma con lo que responde el back.

## Escenarios

Dado un visitante,
cuando toca "Ingresar" en la cabecera,
entonces va a la pantalla de Logto y, al volver, ve "Iniciando sesión…" y termina en la pantalla desde la que venía, o en el inicio de su rol.

Dado un visitante en `/login`,
cuando toca "Crear una cuenta",
entonces Logto le abre directamente la pantalla de registro.

Dado una persona que ingresa por primera vez y todavía no tiene perfil,
cuando vuelve de Logto,
entonces llega a `/bienvenida` y elige "Soy un colectivo" o "Soy colaboradora" antes de seguir.

Dado un visitante sin sesión,
cuando abre una ruta privada (por ejemplo `/colectivo/proyectos`),
entonces va a `/login` y, después de ingresar, vuelve a esa ruta.

Dado una colaboradora con sesión,
cuando abre una ruta solo para colectivos,
entonces ve "Sin permiso", sin perder la sesión.

Dado una sesión abierta,
cuando la persona recarga la página,
entonces ve "Verificando sesión…" y sigue en la misma pantalla, sin pasar por el login.

Dado una sesión vencida,
cuando el back responde 401,
entonces aparece el aviso "Tu sesión venció. Iniciá sesión de nuevo." y la persona va a `/login`, que la devuelve adonde estaba.

Dado una persona con sesión,
cuando abre el menú de su cuenta y toca "Cerrar sesión",
entonces confirma en un diálogo y vuelve al inicio como visitante.

## Requisitos

### Dependencia aprobada

- **`@logto/react`**, aprobado por pedido explícito de la persona el 06/11/2026 para compartir SDK con la integración de Facundo. `LogtoProvider`, `useLogto` y `useHandleSignInCallback` se encapsulan en `Infrastructure/Auth/ProveedorDeSesionLogto.jsx` y Presentation los consume a través de Dependencies. Se quita la dependencia directa de `@logto/browser`, que queda como dependencia interna del SDK de React.

### Configuración

- **Variables nuevas en `.env.example`:**
  - `VITE_LOGTO_ENDPOINT`, la URL del tenant de Logto.
  - `VITE_LOGTO_APP_ID`, la aplicación de tipo "Single page app".
  - `VITE_LOGTO_API_RESOURCE`, el identificador del API resource del back (por ejemplo `https://api.codigo-a-voluntad`). Sin él, Logto entrega un token que el back no puede validar.
- **En la consola de Logto:**
  - Redirect URI `http://localhost:5173/auth/callback`.
  - Post sign-out redirect URI `http://localhost:5173/`.
  - Más las mismas URI con el dominio de producción.
- **El README** explica cómo crear la aplicación y el API resource en Logto.

### Infraestructura (`src/Infrastructure/Auth/`)

- **`ProveedorDeSesionLogto`** monta un único `LogtoProvider`, espera su inicialización y conecta `useLogto` con el contrato propio de §5.3. En `/auth/callback`, `useHandleSignInCallback` termina la autenticación antes de habilitar la consulta de cuenta:

| Función                       | Qué hace                                                                                                               |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `estaAutenticado()`           | Promesa con un booleano.                                                                                               |
| `iniciarSesion({ registro })` | Redirige a Logto con `redirectUri` = `<origen>/auth/callback`, y `firstScreen: "register"` si `registro` es verdadero. |
| `completarIngreso(url)`       | En la sesión real el callback ya fue completado por el hook del SDK; en dobles y simulación mantiene el contrato.      |
| `obtenerToken()`              | `getAccessToken(VITE_LOGTO_API_RESOURCE)`; `null` si no hay sesión o falla.                                            |
| `cerrarSesion()`              | `signOut(<origen>/)`; redirige a Logto y vuelve al inicio.                                                             |
| `olvidarSesion()`             | `clearAllTokens()`, para el 401: borra la sesión local sin salir a Logto.                                              |

- **`crearIdentidadFalsa({ autenticado, token })`:** cumple el mismo contrato para tests. Sin configuración completa, se usa una identidad sin configurar: permite navegar como visitante y avisa si se intenta ingresar.
- **`volverA.js`:** guarda y lee en `sessionStorage` la ruta a la que volver después del login. Es una comodidad de una pestaña, no un dato de sesión; si el almacenamiento falla, se vuelve al inicio del rol.

### Cuenta (`Application` + `Infrastructure`, como el resto de los módulos)

- `CuentaDto`, `AuthHttpClient` (`POST /auth/registro` y `GET /auth/me`), los casos de uso `RegistrarUsuario` y `ObtenerCuentaActual` y `Presentation/Dependencies/authDependencies.js`. Se suman a `PLAN-ENTIDADES.md`.
- `rol` es `"COLECTIVO"`, `"COLABORADORA"` o `null` si la cuenta todavía no tiene perfil (enum `ROL_CUENTA` en `Domain/Enums`).

### Sesión en Presentation

- **`ProveedorDeSesion`** (en `Components/App/`, con el contexto en `Context/ContextoDeSesion.js`) recibe `identidad` y `dependencies` por props para poder probarlo con dobles.
- **Al montar:** `cargando` es `true`. Espera la autenticación del proveedor, registra la identidad interna y luego consulta la cuenta. Las recargas de cuenta de la misma sesión consultan directamente.
- **`configurarAuth`:** el provider lo llama con `obtenerToken` de la identidad, y con un `alExpirar` que olvida la sesión, muestra el aviso "Tu sesión venció. Iniciá sesión de nuevo." y navega a `/login` con `state.desde`. Ese aviso sale una sola vez aunque fallen varios pedidos juntos.
- **`useSesion()`** devuelve `{ usuario, estaAutenticado, cargando, iniciarSesion, cerrarSesion, recargarCuenta }`. Fuera del provider lanza un error claro, como `useAvisos`.
- **Si el registro interno o la consulta de cuenta falla** (no es un 401): en lugar de la app se ve un `EstadoDeError` "No pudimos verificar tu sesión" con "Reintentar". Nunca se muestra la app como si no hubiera sesión.

### Rutas

- **`RutaProtegida`** (`Presentation/Routes/`) con `roles`, como pide §5.3:
  - Con `cargando`, muestra "Verificando sesión…" con `role="status"`.
  - Sin sesión, `<Navigate to="/login" replace state={{ desde: location }} />`.
  - Con sesión y sin perfil (`rol: null`), va a `/bienvenida`, salvo con `permitirSinPerfil`.
  - Con un rol no permitido, `<Navigate to="/sin-permiso" replace />`.
- **Rutas nuevas:**
  - `/login` y `/registro`: públicas. Es la misma pantalla, pero en `/registro` la acción principal es "Crear una cuenta". Si ya hay sesión, redirige al inicio del rol.
  - `/auth/callback`: pública.
  - `/bienvenida`: privada con `permitirSinPerfil`.
- **Inicio por rol** (`Routes/rutas.js`): colectivo → `/colectivo/proyectos`, colaboradora → `/proyectos`, sin perfil → `/bienvenida`. Mientras esas pantallas no existan, todos van a `/habilidades`, en una sola línea fácil de cambiar.
- **`lazy()` y `Suspense`** (§5.3) se aplican cuando exista la primera pantalla privada. `/bienvenida` es chica y no lo necesita.

### Pantallas

- **`LoginPage`:**
  - Título "Ingresá a Código a Voluntad" y una línea sobre qué se puede hacer con una cuenta.
  - Botón primario "Ingresar" y secundario "Crear una cuenta" (en `/registro`, al revés).
  - Mientras redirige, el botón muestra "Abriendo…".
  - Sin formularios propios: el usuario y la contraseña se cargan en Logto.
- **`CallbackPage`:**
  - Muestra "Iniciando sesión…" (`role="status"`), completa el ingreso, recarga la cuenta y navega con `replace` a `volverA` o al inicio del rol.
  - Si falla, muestra un `EstadoDeError` "No pudimos iniciar sesión" con un enlace a `/login`.
  - En desarrollo, StrictMode monta dos veces: el ingreso se completa una sola vez (una ref lo evita).
- **`BienvenidaPage`:**
  - Título "¿Cómo vas a usar Código a Voluntad?".
  - Dos opciones grandes, como enlaces con el aspecto de una tarjeta:
    - "Soy un colectivo: publico proyectos y busco colaboradoras."
    - "Soy colaboradora: me sumo a proyectos con mis habilidades."
  - Cada una lleva al alta del perfil correspondiente (`/bienvenida/colectivo` y `/bienvenida/colaboradora`), que entregan las specs 02 y 03.
  - El usuario puede elegir entre sus contextos activos o dar de alta un perfil compatible con su modalidad.

### Cabecera

- **Sin sesión:** a la derecha, botones "Ingresar" y "Crear una cuenta" que abren directamente Logto y conservan la ubicación de origen. En celular, segunda fila. Se ocultan en `/login` y `/registro`, donde están en el contenido.
- **Con sesión:** el botón "Mi cuenta" con `aria-expanded`, que despliega una lista (patrón disclosure, no `role="menu"`) con "Cerrar sesión". Esc y hacer clic afuera la cierran.
- **"Cerrar sesión"** abre el `DialogoDeConfirmacion`: "¿Cerrar sesión?", "Vas a tener que ingresar de nuevo para ver tus proyectos y postulaciones.", botón "Cerrar sesión". Lleva la confirmación que pide el backlog, aunque no sea una acción permanente. El texto "Esta acción no se puede deshacer." no corresponde acá: `DialogoDeConfirmacion` suma la prop `permanente` (por defecto `true`).
- **Enlaces por rol:** `navegacion.js` suma `roles` opcional a cada enlace, y la cabecera muestra solo los que corresponden al rol del usuario. "Habilidades" sigue visible para todos.

### Tests

- **`ProveedorDeSesion` y `RutaProtegida`** con identidad falsa y un adaptador de axios simulado:
  - "Verificando sesión…" mientras carga.
  - Sin sesión → `/login` con `desde`.
  - Rol incorrecto → `/sin-permiso`.
  - Sin perfil → `/bienvenida`.
  - Rol correcto → la pantalla.
  - Si `/auth/me` falla → error con "Reintentar".
- **`CallbackPage`:** completa una sola vez, vuelve a `desde` y muestra el error si falla.
- **401:**
  - Un pedido con 401 muestra el aviso una sola vez, olvida la sesión y lleva a `/login`.
  - Después de ingresar, vuelve a la ruta anterior.
- **Cabecera:**
  - "Ingresar" y "Crear una cuenta" sin sesión, con pantalla correcta, espera y reintento.
  - "Mi cuenta" con sesión.
  - "Cerrar sesión" pide confirmación y llama a `cerrarSesion`.
- **SDK de React** con cliente simulado: `firstScreen`, `redirectUri`, recurso, inicialización, callback, token, expiración y salida. Las pruebas usan el provider y los hooks reales del SDK.
- **El token llega al back:** con sesión, un pedido lleva `Authorization: Bearer <token>`. Es un test de integración que pasa por el `ProveedorDeSesion` real.

## Estados

- Verificando sesión: "Verificando sesión…" (texto con `role="status"`, sin skeleton porque dura poco).
- Volviendo de Logto: "Iniciando sesión…".
- Error al verificar la sesión: `EstadoDeError` con "Reintentar".
- Error al volver de Logto: `EstadoDeError` con "Volver a ingresar".
- Sin permiso: `SinPermisoPage` (spec de navegación).

## Contrato con el backend

- `POST /auth/registro` valida el JWT de la API, vincula `proveedor` y `sub` con un usuario interno y devuelve ese mismo usuario al repetirse.
- `GET /auth/me` consulta el usuario, nombre, contexto actual y contextos disponibles. `rol` y `perfilId` son nulos cuando no hay contexto actual. Un token inválido o vencido devuelve 401.
- El nombre propio de la aplicación se completa con `PUT /auth/usuario`. `POST /colectivos` y `POST /colaboradores` crean un contexto activo cuando la modalidad es compatible. La cuenta puede crear un perfil nuevo de colaboradora después de la baja del anterior.

## A confirmar

- **Tokens en `localStorage`.** `@logto/react` usa internamente el cliente de navegador, conservando el almacenamiento aprobado para Logto. Esto revisa la decisión del 01/11 ("token en memoria"). Para mitigarlo:
  - en Logto: vencimiento corto del access token y rotación del refresh token;
  - en NGINX: una política CSP estricta.

  Guardar la sesión solo en memoria obligaría a ingresar de nuevo en cada recarga. Se actualiza la decisión.

- **Specs 01, 02 y 03 juntas al deploy.** `/bienvenida` lleva a las altas de perfil de las specs 02 y 03. Hasta que existan, esas opciones llevarían a una 404. Propongo hacer 01 y después 02 y 03, y no desplegar 01 sola.
- **Desarrollo sin tenant.** Con alguna variable de Logto vacía, se usa la identidad sin configurar para trabajar en las pantallas públicas. La sesión simulada sigue disponible solo en desarrollo.

## Fuera de alcance

- Las altas de perfil de colectivo y colaboradora (specs 02 y 03).
- Login social, organizaciones de Logto y roles en Logto: el rol lo decide el back.
- "Mi perfil" en el menú de cuenta (llega con 02 y 03).
- Administración de habilidades por rol administrador.

## Criterio de aceptación

- Los escenarios funcionan contra un tenant real de Logto y un back con `/auth/me`, o con los dobles en los tests mientras el back no lo tenga.
- Se usa solo con teclado: "Ingresar", el menú de cuenta y el diálogo de cerrar sesión.
- Ninguna ruta privada se ve sin sesión, ni siquiera un instante al recargar.
- `npm run lint`, `npm test` y `npm run build` en verde, y el checklist de `docs/criterios-pantallas-web.md` revisado.
