# Código a Voluntad — Frontend

Cliente web de **Código a Voluntad**, la plataforma que conecta colectivos con personas colaboradoras del ámbito del desarrollo de software. TP Integrador de Desarrollo de Software, UTN FRBA, 2C 2026.

Arquitectura cliente pesado: este proyecto consume la API JSON del [backend](https://github.com/Mazzini123/tp-desarrollo-2c-2026) y todo se dibuja en el navegador.

## Stack

- React + Vite
- React Router
- Axios
- ESLint (con `jsx-a11y`) + Prettier
- Vitest + Testing Library

## Cómo levantarlo

Requiere Node 22 o superior (ver `.nvmrc`).

```bash
npm install
cp .env.example .env
npm run dev
```

La app queda en <http://localhost:5173>. El backend tiene que estar corriendo (por defecto en <http://localhost:8000>; su Swagger en <http://localhost:8000/docs>).

## Variables de entorno

| Variable            | Descripción                             | Ejemplo                 |
| ------------------- | --------------------------------------- | ----------------------- |
| `VITE_API_URL`      | Destino del proxy de Vite en desarrollo | `http://localhost:8000` |
| `VITE_API_BASE_URL` | URL base que usa Axios                  | `/api`                  |

En desarrollo, las llamadas a `/api/...` se redirigen a `VITE_API_URL` mediante el proxy de Vite, eliminando el prefijo `/api`.

En producción, configurar `VITE_API_BASE_URL` con la URL pública del backend o servir `/api` mediante un reverse proxy. El servidor del frontend debe resolver las rutas de React Router a `index.html`.

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

## Estructura

```text
src/
├── Presentation/    Pages, Components, Hooks, Dependencies y Routes
├── Application/     UseCases y Domain (DTOs, requests y contratos HttpClient)
├── Infrastructure/  Instancia de Axios e implementaciones HttpClient
└── Styles/          Estilos globales y archivos de estilos por entidad
```

Flujo: `page/component` → `hook` → `useCase` → `httpClient` → `axios`. Se usan directamente los DTOs y requests del backend. Dependencies compone los clientes y casos de uso.

Components, Requests y UseCases se agrupan por entidad; Entities, HttpClients, Dependencies, Hooks, Pages y Styles contienen archivos sueltos. La aplicación usa JavaScript/JSX; los DTOs, requests y contratos se documentan con anotaciones JSDoc en archivos `.js`.

Se importa desde `src` con el alias `@` (por ejemplo, `@/Presentation/Hooks/useHabilidades.js`).

El [plan de desarrollo de entidades](docs/PLAN-ENTIDADES.md) contiene el detalle de la arquitectura, los endpoints, el ejemplo de Habilidad y los pasos para incorporar cada entidad.

## Forma de trabajo (Git Flow)

- `main`: versión estable, se actualiza en cada entrega.
- `develop`: integración del trabajo del equipo.
- `feature/<nombre>`: una rama por pantalla o tarea, creada desde `develop`.
- `fix/<nombre>` y `chore/<nombre>`: correcciones y configuración.

Cada cambio entra a `develop` por Pull Request, con al menos una revisión y con `lint`, `format:check` y `test` en verde.
