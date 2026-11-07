# Sesión simulada en desarrollo

Origen: pedido del equipo al probar la spec 01 (05/11/2026). Sin un tenant de Logto ni `GET /auth/me` en el back, no se puede recorrer nada con sesión.

## Intención

Que cualquier integrante del equipo pueda probar en el navegador las rutas protegidas, el menú de cuenta, cerrar sesión y `/bienvenida` con cada rol, sin Logto y sin el back. Es una herramienta de desarrollo: no existe en el build de producción.

## Escenarios

Dado `VITE_SESION_SIMULADA=COLECTIVO` en `.env` y `npm run dev`,
cuando la persona toca "Ingresar" en `/login`,
entonces pasa por "Iniciando sesión…" y queda con sesión de colectivo, igual que si volviera de Logto, y vuelve a la ruta desde la que venía.

Dado `VITE_SESION_SIMULADA=SIN_PERFIL`,
cuando ingresa,
entonces llega a `/bienvenida`.

Dado `VITE_SESION_SIMULADA=COLABORADORA` y una ruta solo para colectivos,
cuando la abre,
entonces ve "Sin permiso".

Dado una sesión simulada,
cuando la persona recarga la página,
entonces sigue con sesión. Al cerrar sesión, vuelve al inicio como visitante.

Dado que no hay Logto configurado ni sesión simulada,
cuando la persona toca "Ingresar",
entonces ve un aviso de error que explica qué falta configurar, y el botón vuelve a estar disponible. Hoy se queda en "Abriendo…".

Dado un build de producción (`npm run build`),
cuando tiene `VITE_SESION_SIMULADA` definida,
entonces la variable se ignora y el código de la simulación no queda en el bundle.

## Requisitos

- **Variable:** `VITE_SESION_SIMULADA`, con los valores `COLECTIVO`, `COLABORADORA` o `SIN_PERFIL`; vacía, apaga la simulación. Va en `.env.example`, comentada, y en la tabla del README.
- **Prioridad en `crearIdentidad`** (solo con `import.meta.env.DEV`):
  1. Con sesión simulada, se usa la identidad simulada, aunque Logto esté configurado.
  2. Si no, Logto, si está configurado.
  3. Si no, una identidad "sin configurar".
- **Identidad simulada** (`Infrastructure/Auth/crearIdentidadSimulada.js`):
  - Recuerda la sesión en `sessionStorage`, para que sobreviva a la recarga de la pestaña.
  - `iniciarSesion` marca la sesión y navega a `/callback` con `window.location.assign`, como haría Logto. Así se prueba el mismo camino: `volverA`, "Iniciando sesión…" y la redirección por rol.
  - `cerrarSesion` borra la marca y navega a `/`.
  - `obtenerToken` devuelve `null`: no se manda un token falso al back, que lo rechazaría con un 401.
- **Cuenta simulada:** con la simulación activa, `obtenerCuentaActual` no llama al back y devuelve:
  - `COLECTIVO`: `{ id: "cuenta-simulada", rol: "COLECTIVO", perfilId: "colectivo-simulado" }`.
  - `COLABORADORA`: el mismo `id`, con `rol: "COLABORADORA"` y `perfilId: "colaboradora-simulada"`.
  - `SIN_PERFIL`: `rol` y `perfilId` en `null`.

  Se compone en `Presentation/Dependencies/authDependencies.js`, que es el lugar donde se eligen las implementaciones.

- **Se nota que es simulada:** el menú "Mi cuenta" muestra, arriba de "Cerrar sesión", el texto "Sesión simulada · Colectivo" (o "Colaboradora" o "Sin perfil") en body small y tinta suave. Además, la consola avisa una vez al arrancar.
- **Identidad sin configurar:** `iniciarSesion` rechaza con un error cuyo `mensaje` dice "El ingreso no está configurado. Completá las variables VITE_LOGTO_* o usá VITE_SESION_SIMULADA (ver README)." `LoginPage` muestra el `mensaje` del error si lo trae y libera el botón. La identidad falsa de los tests no cambia.
- **Fuera del build:** `import.meta.env.DEV` es `false` en producción, así que la simulación no se usa nunca ahí. El import de la simulación queda detrás de ese chequeo para que Vite la descarte del bundle. Se verifica buscando `cuenta-simulada` y `sesion-simulada` en `dist/assets/*.js` (el texto "Sesión simulada" del menú sí queda, pero solo se muestra con la simulación activa).

## Tests

- **`crearIdentidad`:** elige simulada, Logto o sin configurar según las variables, e ignora la simulación con `DEV: false`.
- **Identidad simulada:**
  - Arranca sin sesión.
  - `iniciarSesion` llama a `assign("/callback")` (con `window.location` simulado) y deja la sesión.
  - `cerrarSesion` la borra.
  - `obtenerToken` es `null`.
- **Cuenta simulada:** devuelve lo esperado para los tres valores.
- **Flujo completo** con `Aplicacion` de `sesion.test.jsx`: `SIN_PERFIL` termina en `/bienvenida` y `COLABORADORA` en "Sin permiso" para una ruta de colectivo.
- **`LoginPage` sin configurar:** muestra el aviso con el texto de configuración y el botón vuelve a "Ingresar".

## Estados

- Los mismos de la spec 01. No agrega pantallas.

## Fuera de alcance

- Datos simulados de otros endpoints (proyectos, postulaciones): cada pantalla usa el back o sus dobles en los tests.
- Cambiar de rol sin editar `.env`.

## Criterio de aceptación

- Con cada uno de los tres valores se recorren en el navegador los escenarios de la spec 01.
- `npm run build` no contiene la simulación.
- `npm run lint`, `npm run format:check`, `npm test` y `npm run build` en verde sobre el repo completo.
