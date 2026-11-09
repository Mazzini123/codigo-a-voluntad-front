# Código a Voluntad — Frontend

Cliente web de **Código a Voluntad**, la plataforma que conecta colectivos con personas colaboradoras del ámbito del desarrollo de software. TP Integrador de Desarrollo de Software, UTN FRBA, 2C 2026.

Arquitectura cliente pesado: este proyecto consume la API JSON del [backend](https://github.com/Mazzini123/tp-desarrollo-2c-2026) y todo se dibuja en el navegador.

## Stack

- React + Vite
- React Router
- Axios
- ESLint (con `jsx-a11y` y `react`) + Prettier
- Vitest + Testing Library
- Playwright + axe para las pruebas de punta a punta
- `react-markdown` para las descripciones con formato

## Cómo levantarlo

Requiere Node 22 o superior (ver `.nvmrc`).

```bash
npm install
cp .env.example .env
npm run dev
```

La app queda en <http://localhost:5173>. El backend tiene que estar corriendo (por defecto en <http://localhost:8000>; su Swagger en <http://localhost:8000/docs>).

## Variables de entorno

| Variable                  | Descripción                                      | Ejemplo                         |
| ------------------------- | ------------------------------------------------ | ------------------------------- |
| `VITE_API_URL`            | Destino del proxy de Vite en desarrollo          | `http://localhost:8000`         |
| `VITE_API_BASE_URL`       | URL base que usa Axios                           | `/api`                          |
| `VITE_LOGTO_ENDPOINT`     | URL del tenant de Logto (vacía: sin sesión)      | `https://xxxx.logto.app`        |
| `VITE_LOGTO_APP_ID`       | ID de la aplicación "Single page app" en Logto   | `abc123…`                       |
| `VITE_LOGTO_API_RESOURCE` | Identificador del API resource del back en Logto | `https://api.codigo-a-voluntad` |

En desarrollo, las llamadas a `/api/...` se redirigen a `VITE_API_URL` mediante el proxy de Vite, eliminando el prefijo `/api`.

En producción, configurar `VITE_API_BASE_URL` con la URL pública del backend o servir `/api` mediante un reverse proxy. El servidor del frontend debe resolver las rutas de React Router a `index.html`.

## Ingreso con Logto

El ingreso y el registro los resuelve [Logto](https://logto.io) con `@logto/react` (Logto Cloud o un tenant propio). La estructura sigue la integración de Facundo: `Infrastructure/Auth/authFactory.js` elige el proveedor y devuelve `{ Provider, usarSesion, CallbackComponent }`; `main.jsx` monta el `Provider` (un único `LogtoProvider` en `logto/`) y `Presentation/Context/AuthProvider.jsx` consume solo `usarSesion()` y expone `useAuth()`. `VITE_AUTH_PROVIDER` (`logto` o `simulada`) fuerza el proveedor; vacío elige solo según las variables. La app nunca ve contraseñas: redirige a Logto, vuelve a `/auth/callback` y le pide al back la cuenta con `GET /auth/me`. El rol de la plataforma sale del backend.

«Ingresar» y «Crear una cuenta» en el header abren directamente la pantalla correspondiente de Logto y conservan el destino de origen. `/login` y `/registro` siguen disponibles para enlaces existentes, rutas protegidas y recuperación de errores.

1. En la consola de Logto, crear una aplicación de tipo **Single page app**:
   - Redirect URI: `http://localhost:5173/auth/callback` (y la de producción).
   - Post sign-out redirect URI: `http://localhost:5173/` (y la de producción).
   - Copiar el **App ID** en `VITE_LOGTO_APP_ID` y el **endpoint** del tenant en `VITE_LOGTO_ENDPOINT`.
2. En **API resources**, crear el recurso del back con el identificador de `VITE_LOGTO_API_RESOURCE`. El back valida que el token tenga esa audiencia.
3. Recomendado: vencimiento corto del access token y rotación del refresh token (el SDK guarda la sesión en `localStorage`; ver `docs/decisiones.md`).

Las tres variables de Logto son necesarias para autenticar. Con configuración incompleta, el header abre las pantallas locales `/login` y `/registro`, que explican que el acceso todavía no está habilitado y permiten seguir explorando proyectos. Los formularios de credenciales viven en Logto.

### Integración con la rama de Logto

La sesión se adaptó a la estructura de esa rama (`authFactory`, `Provider`, `usarSesion`, `CallbackComponent`, `AuthProvider`, `useAuth`), no al revés. Se adoptan los nombres de la integración de Facundo: `/auth/callback` como ruta de retorno (`Infrastructure/Auth/authRoutes.js`) y `VITE_LOGTO_API_RESOURCE` para el identificador del recurso. El equipo debe registrar las URI de cada origen real (el puerto también forma parte del origen).

Conservar el router, el cliente HTTP y la consulta de cuenta actuales. No agregar un segundo provider ni considerar que `isAuthenticated` ya define el rol o el perfil. El contrato pendiente con el back es `GET /auth/me` → `{ id, rol, perfilId }`, valores nulos de rol y perfil para cuentas nuevas, y 401 para tokens inválidos. Las altas asocian el perfil al `sub` de Logto y responden 409 si ya existe uno. Scopes y roles en Logto se configuran cuando el backend acuerde qué permisos requiere. Ver `specs/active/integracion-logto-react.md`.

### Sesión simulada (solo desarrollo)

Para probar las pantallas con sesión sin Logto ni back, poner en `.env` `VITE_SESION_SIMULADA=COLECTIVO`, `COLABORADORA` o `SIN_PERFIL` y reiniciar `npm run dev`. "Ingresar" deja la sesión del rol elegido (pasando por `/callback`, como con Logto) y el menú "Mi cuenta" lo indica. No manda token al back y no existe en el build de producción. Con `VITE_SESION_SIMULADA_PERFIL_ID` la cuenta simulada usa el `id` de un colectivo o una colaboradora real del back (según el rol) como su perfil; con `SIN_PERFIL`, al completar un alta adopta el perfil creado. Para cambiar de rol, editar `.env`, reiniciar y cerrar sesión.

## Scripts

| Comando                | Qué hace                                 |
| ---------------------- | ---------------------------------------- |
| `npm run dev`          | Servidor de desarrollo                   |
| `npm run build`        | Build de producción en `dist/`           |
| `npm run preview`      | Sirve el build localmente                |
| `npm run lint`         | ESLint (incluye reglas de accesibilidad) |
| `npm run format`       | Formatea el código con Prettier          |
| `npm run format:check` | Verifica el formato sin modificar        |
| `npm test`             | Corre los tests una vez                  |
| `npm run test:watch`   | Tests en modo observación                |
| `npm run test:e2e`     | Pruebas de punta a punta con Playwright  |

### Pruebas de punta a punta

`tests/e2e/` recorre en un navegador real los flujos principales: crear el perfil de un colectivo, buscar un proyecto y postularse, publicar un proyecto y aceptar una postulación. En cada pantalla corre axe con las reglas WCAG 2.2 AA. No necesitan el back ni Logto: Playwright levanta cuatro `vite` (visitante, sin perfil, colaboradora y colectivo, en los puertos 5181 a 5184) con la sesión simulada y responde los pedidos a `/api` con un back en memoria (`tests/e2e/apoyo/backFalso.js`). Cada carpeta de `tests/e2e/` corre con la sesión de su nombre.

La primera vez hay que bajar el navegador: `npx playwright install chromium`. Si no se puede bajar, `CHROME_PATH=/ruta/a/chrome npm run test:e2e` usa un Chrome ya instalado. En CI corren en un trabajo aparte y, si fallan, dejan el reporte como artefacto.

## Estructura

```text
src/
├── Presentation/    App, Pages, Components, Hooks, Formularios, Formatos, Dependencies, Routes y Styles
├── Application/     UseCases y Domain (DTOs, requests y contratos HttpClient)
└── Infrastructure/  Instancia de Axios, implementaciones HttpClient y Auth (adaptador de Logto)
```

Flujo: `page/component` → `hook` → `useCase` → `httpClient` → `axios`. Se usan directamente los DTOs y requests del backend. Dependencies compone los clientes y casos de uso.

Components, Hooks, Pages, Formularios, Entities, Requests y UseCases se agrupan por entidad, área o función; HttpClients, Dependencies y Formatos contienen archivos sueltos, uno por módulo. Los estilos globales (`tokens.css` y `base.css`) están en `Presentation/Styles/`; el resto, `X.module.css` junto a cada componente. La aplicación usa JavaScript/JSX, sin comentarios ni JSDoc en el código.

Se importa desde `src` con el alias `@` (por ejemplo, `@/Presentation/Hooks/habilidad/useHabilidades.js`).

El [plan de desarrollo de entidades](docs/PLAN-ENTIDADES.md) contiene el detalle de la arquitectura, los endpoints, el ejemplo de Habilidad y los pasos para incorporar cada entidad.

## Forma de trabajo (Git Flow)

- `main`: versión estable, se actualiza en cada entrega.
- `develop`: integración del trabajo del equipo.
- `feature/<nombre>`: una rama por pantalla o tarea, creada desde `develop`.
- `fix/<nombre>` y `chore/<nombre>`: correcciones y configuración.

Cada cambio entra a `develop` por Pull Request, con al menos una revisión y con `lint`, `format:check` y `test` en verde.
