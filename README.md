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

| Variable       | Descripción        | Ejemplo                 |
| -------------- | ------------------ | ----------------------- |
| `VITE_API_URL` | URL base de la API | `http://localhost:8000` |

En desarrollo, las llamadas a `/api/...` se redirigen a `VITE_API_URL` mediante el proxy de Vite.

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

```
src/
├── infrastructure/          cómo se habla con el back
│   ├── http/                instancia de axios e interceptores
│   ├── httpClients/         una función por endpoint, sin lógica
│   └── repositories/        mapean las respuestas del back a modelos del front
├── presentation/            lo que se ve
│   ├── context/             estado global (sesión, notificaciones)
│   ├── hooks/               estado, carga y errores de cada pantalla (common/ y por entidad)
│   ├── components/          shared/ y por entidad
│   ├── pages/               una por pantalla
│   ├── routes/              rutas públicas y privadas por rol
│   └── styles/              tema y estilos base
├── enums/
└── utils/
tests/e2e/                   pruebas de punta a punta
```

Flujo: `page` → `hook` → `repository` → `httpClient` → `axios`. Cada capa solo conoce a la de abajo; los componentes nunca llaman a la API directamente.

Se importa desde `src` con el alias `@` (por ejemplo, `@/presentation/hooks/common/useAsync`).

## Forma de trabajo (Git Flow)

- `main`: versión estable, se actualiza en cada entrega.
- `develop`: integración del trabajo del equipo.
- `feature/<nombre>`: una rama por pantalla o tarea, creada desde `develop`.
- `fix/<nombre>` y `chore/<nombre>`: correcciones y configuración.

Cada cambio entra a `develop` por Pull Request, con al menos una revisión y con `lint`, `format:check` y `test` en verde.
