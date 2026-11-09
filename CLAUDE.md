# Código a Voluntad – Frontend

Cliente pesado en React (Vite) que consume la API JSON del backend (Express + MongoDB), que vive en otro repositorio. El servidor nunca arma HTML.

## Dónde mirar

- `docs/PLAN-ENTIDADES.md`: capas, contratos y las operaciones disponibles por módulo (los 59 endpoints de negocio). Es el contrato con el back: no inventar rutas que no estén ahí ni en el Swagger del back (`/docs`).
- `docs/plan-front.md`: roles, pantallas, rutas, base transversal (errores, sesión, carga de datos) y marca.
- `docs/criterios-pantallas-web.md`: criterios de UX, accesibilidad y checklist de cierre.
- `PRODUCT.md`: usuarios, propósito, voz y principios del producto.
- `DESIGN.md`: sistema visual del proyecto (colores, tipografías, espaciados, componentes), generado con Impeccable. Toda pantalla nueva lo respeta.
- `docs/decisiones.md`: decisiones tomadas y por qué.
- `specs/active/`: la especificación de la pantalla en curso.
- `specs/backlog/`: borradores de las demás pantallas (revisar los "A definir" antes de tomarlas).

## Capas

`Pages / Components` → `Hooks` → `Dependencies` → `UseCases` → `HttpClients` → `axiosClient`.

- `src/Application/Domain/`: DTOs, requests, enums y contratos `I…HttpClient`. Sin JSDoc: los archivos son módulos vacíos (`export {};`) que marcan el contrato. No importa React, Axios ni Infrastructure.
- `src/Application/Domain/Reglas/`: reglas del negocio como funciones puras (por ejemplo, cuándo un perfil recibe postulaciones). `Formatos/` solo las convierte en texto.
- `src/Application/UseCases/<Modulo>/`: una función por operación, creada con el HttpClient inyectado. Si la forma del back no le sirve a la vista, la adapta con `src/Application/Adaptadores/` (los listados paginados devuelven `{ items, pagina, porPagina, total, totalPaginas }`).
- `src/Infrastructure/Http/axiosClient.js`: instancia única de axios, interceptores (token, errores, reintentos).
- `src/Infrastructure/HttpClients/`: implementación de cada contrato con `crearPedidos(http)` (misma firma que axios, devuelve el cuerpo sin transformar) y `ruta` para armar las URL (codifica cada valor): ``api.get(ruta`/proyectos/${id}`, { signal })``.
- `src/Infrastructure/Auth/`: adaptador del proveedor de identidad. Es el único lugar que conoce su SDK.
- `src/Presentation/Dependencies/`: compone HttpClients y casos de uso. Es lo único de Presentation que importa Infrastructure.
- `src/Presentation/Hooks/`: estado de carga, error, cancelación y refresco. Usan los casos de uso de `Dependencies`. Agrupados en `comunes/` (`useConsulta`, `useMutacion`, avisos, foco) y por entidad: `sesion/`, `colectivo/`, `colaboradora/`, `habilidad/`, `perfil/`, `proyecto/`, `postulacion/`.
- Consultas con `useConsulta`; operaciones que escriben en el back con `useMutacion` (ignora un segundo envío mientras hay uno en curso y no cancela al reejecutar). Si una operación necesita un texto propio para un status, el hook lo pasa: `useMutacion(tarea, { mensajes: { 409: "Ya te postulaste a este proyecto." } })`; la capa HTTP solo conoce los textos por status.
- `src/Presentation/Components/App/` (compartidos, por función: `ui/`, `estados/`, `navegacion/`, `layout/`, `dialogos/`, `avisos/`, `sesion/`, `texto/`) y `Components/<Modulo>/` (`Proyecto/` se divide en `alta/`, `detalle/` y `listado/`).
- `src/Presentation/Pages/` por área: `publicas/`, `ingreso/`, `colectivo/`, `colaboradora/`, `sistema/` y `flujos/` (tests que cruzan varias páginas). Cada página lleva al lado su `.module.css` y su test. `App.jsx` y `Styles/` (`tokens.css`, `base.css`) viven en `src/Presentation/`; `Routes/` tiene el router y las guardas.
- `src/Presentation/Formularios/`: estado inicial, validación, cambios y armado de requests de cada formulario, más los reducers de edición. Funciones puras, sin JSX. `Components/` guarda solo componentes. Se agrupan en subcarpetas por entidad (`colectivo/`, `colaboradora/`, `proyecto/`, `comunes/`), igual que `Domain/Entities/`.
- Guardas de ruta en `Routes/`: `RutaProtegida` (sesión y rol) y `RutaDelDueno` (colectivo dueño del proyecto).
- Cada ruta que cambia el fondo o el marco lo declara con `handle: { tipoDePantalla: TIPO_DE_PANTALLA.… }` (en `Routes/rutas.js`); `Raiz` lo lee con `useMatches()`.

## No se negocia

- Los imports usan el alias `@/` (`@/Presentation/Hooks/comunes/useConsulta.js`); solo se usa `./` para un archivo de la misma carpeta. Nunca `../`. Los tests de `tests/e2e/` usan rutas relativas porque Playwright no conoce el alias.
- Una carpeta nueva tiene que sumar un criterio claro (función o entidad); no se mezclan archivos de varias entidades en una carpeta plana.
- Los componentes y páginas nunca llaman a axios, HttpClients ni casos de uso: siempre a través de un hook.
- Los hooks no arman URLs ni conocen axios.
- Filtros, búsqueda y página en la URL (`useSearchParams`).
- Toda pantalla que consulta al back tiene estados de carga (skeleton), vacío, sin resultados y error con "Reintentar".
- Mensajes en lenguaje de la persona; nunca el error crudo del back.
- Acciones permanentes con el `DialogoDeConfirmacion` compartido.
- Descripciones con Markdown (proyecto y colectivo) con `TextoConFormato`; en tarjetas y listados, `sinMarcas`. Enlaces externos siempre con `EnlaceExterno`.
- HTML semántico, labels reales, foco visible, contraste 4.5:1.
- Sin comentarios en el código, JSDoc incluido: nombres claros y funciones chicas.
- Sin dependencias nuevas sin consultarlo.

## Comandos

- `npm run dev` · `npm run build` · `npm run lint` · `npm test` · `npm run test:e2e` (Playwright + axe, con back en memoria; ver README)

## Forma de trabajo

1. Una tarea por sesión.
2. Primero un plan; implementar solo después de aprobarlo.
3. Cerrar solo con `npm run lint` y `npm test` en verde y el checklist de `docs/criterios-pantallas-web.md` revisado.
