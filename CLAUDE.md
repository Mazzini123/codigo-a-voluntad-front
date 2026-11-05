# Código a Voluntad – Frontend

Cliente pesado en React (Vite) que consume la API JSON del backend (Express + MongoDB), que vive en otro repositorio. El servidor nunca arma HTML.

## Dónde mirar

- `docs/PLAN-ENTIDADES.md`: capas, contratos y las operaciones disponibles por módulo (los 60 endpoints). Es el contrato con el back: no inventar rutas que no estén ahí ni en el Swagger del back (`/docs`).
- `docs/plan-front.md`: roles, pantallas, rutas, base transversal (errores, sesión, carga de datos) y marca.
- `docs/criterios-pantallas-web.md`: criterios de UX, accesibilidad y checklist de cierre.
- `DESIGN.md`: sistema visual del proyecto (colores, tipografías, espaciados, componentes), generado con Impeccable. Toda pantalla nueva lo respeta.
- `docs/decisiones.md`: decisiones tomadas y por qué.
- `specs/active/`: la especificación de la pantalla en curso.
- `specs/backlog/`: borradores de las demás pantallas (revisar los "A definir" antes de tomarlas).

## Capas

`Pages / Components` → `Hooks` → `Dependencies` → `UseCases` → `HttpClients` → `axiosClient`.

- `src/Application/Domain/`: DTOs, requests, enums y contratos `I…HttpClient`, documentados con JSDoc. No importa React, Axios ni Infrastructure.
- `src/Application/UseCases/<Modulo>/`: una función por operación, creada con el HttpClient inyectado.
- `src/Infrastructure/Http/axiosClient.js`: instancia única de axios, interceptores (token, errores, reintentos).
- `src/Infrastructure/HttpClients/`: implementación de cada contrato; devuelve `response.data` sin transformar.
- `src/Infrastructure/Auth/`: adaptador del proveedor de identidad. Es el único lugar que conoce su SDK.
- `src/Presentation/Dependencies/`: compone HttpClients y casos de uso. Es lo único de Presentation que importa Infrastructure.
- `src/Presentation/Hooks/`: estado de carga, error, cancelación y refresco. Usan los casos de uso de `Dependencies`.
- `src/Presentation/Components/App/` (compartidos) y `Components/<Modulo>/`, `Pages/`, `Routes/`.

## No se negocia

- Los componentes y páginas nunca llaman a axios, HttpClients ni casos de uso: siempre a través de un hook.
- Los hooks no arman URLs ni conocen axios.
- Filtros, búsqueda y página en la URL (`useSearchParams`).
- Toda pantalla que consulta al back tiene estados de carga (skeleton), vacío, sin resultados y error con "Reintentar".
- Mensajes en lenguaje de la persona; nunca el error crudo del back.
- Acciones permanentes con el `ConfirmDialog` compartido.
- HTML semántico, labels reales, foco visible, contraste 4.5:1.
- Sin comentarios explicativos en el código: nombres claros y funciones chicas. JSDoc solo para los contratos (DTOs, requests, `I…HttpClient` y firmas de casos de uso).
- Sin dependencias nuevas sin consultarlo.

## Comandos

- `npm run dev` · `npm run build` · `npm run lint` · `npm test`

## Forma de trabajo

1. Una tarea por sesión.
2. Primero un plan; implementar solo después de aprobarlo.
3. Cerrar solo con `npm run lint` y `npm test` en verde y el checklist de `docs/criterios-pantallas-web.md` revisado.
