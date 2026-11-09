# Plan del front – Código a Voluntad

> Complementa a `criterios-pantallas-web.md` (los criterios generales) y a `PLAN-ENTIDADES.md` (las capas y el acceso a los endpoints). Este documento aplica esos criterios a la tercera entrega del TP de DDSO 2C 2026. Las referencias entre paréntesis (§) son secciones del libro de la materia.

## 1. Restricciones de la consigna

- **React con CRA o Next.js sin rutas dinámicas.** Consultar con el docente si se acepta Vite (CRA está discontinuado). Si se usa Next.js, nada de `[id].js`: el ID va por query string (`/proyecto?id=…`).
- **Axios como cliente HTTP** (una sola instancia en `src/Infrastructure/Http/axiosClient.js`).
- **Un test de integración en el front** (propuesta: postularse a un perfil, o el login) y uno en los controladores del back.
- **Entregar la justificación del cumplimiento de los requerimientos no funcionales:** cada lineamiento de UI se justifica con los criterios aplicados (ver sección 7).
- **Patrones de e-commerce:** buscador arriba, tarjetas de proyecto como productos, filtros a un costado, detalle con la acción principal ("Postularme") bien visible.
- **Despliegue:** front empaquetado servido por NGINX junto al back en un único servidor, con Docker. El front tiene su propio repo e imagen.
- **Para el parcial:** saber explicar, para un requerimiento nuevo, los componentes, estados, flujo de navegación y accesibilidad de la interfaz.

## 2. Roles

- **Visitante:** busca y ve proyectos, colectivos y avances.
- **Colaboradora:** perfil, habilidades, postulaciones, mensajes.
- **Colectivo:** perfil, proyectos, perfiles requeridos, postulaciones, búsqueda y contacto de colaboradoras.
- **Administrador** (si se implementa): habilidades precargadas, moderación.

## 3. Pantallas mínimas

| Pantalla                                | Rol                      | Puntos clave                                                                                                                                                                               |
| --------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Login y registro                        | Todos                    | Ingreso con el proveedor de identidad. Al primer ingreso, elegir el tipo de cuenta y completar el perfil.                                                                                  |
| Perfil de colectivo (alta y edición)    | Colectivo                | Ubicación con selector de provincia y texto libre para ciudad o barrio. Tipo de colectivo tomado de la lista del sistema.                                                                  |
| Perfil de colaboradora (alta y edición) | Colaboradora             | Elegir entre nombre de fantasía o nombre real. GitHub o GitLab, pronombres y presentación opcionales. Habilidades desde el catálogo. Medios de contacto y opción de recibir mensajes.      |
| Mis proyectos (ABM)                     | Colectivo                | Proyecto con perfiles (habilidades requeridas y opcionales, compromiso, modalidad, límite de colaboraciones, modo de aceptación) y búsqueda abierta o cerrada con fecha límite por perfil. |
| Buscar proyectos                        | Colaboradora / visitante | Filtros en la URL y paginación. Los proyectos que encajan con mis habilidades van primero.                                                                                                 |
| Detalle del proyecto                    | Todos                    | Atributos, perfiles con su estado (abierto o cerrado, quién lo ocupa; si es anónimo, "Contribución anónima"), "Postularme" por perfil.                                                     |
| Avance del proyecto                     | Todos                    | Porcentaje, logros, enlace al repositorio y al sistema en producción.                                                                                                                      |
| Buscar colaboradoras para un perfil     | Colectivo                | Resultados según el perfil y "Contactar" solo si la persona lo aceptó. Si no, botón deshabilitado con el motivo.                                                                           |
| Postulaciones recibidas                 | Colectivo                | Aceptar o rechazar. Si el perfil alcanzó su límite, el botón de aceptar queda deshabilitado con el motivo. Desvincular a quien ya colabora.                                                |
| Mis postulaciones y colaboraciones      | Colaboradora             | Estados (pendiente, aceptada, rechazada, finalizada, desvinculada) y "Darme de baja".                                                                                                      |
| Desanotar                               | Ambos                    | Diálogo de confirmación que avise que es permanente.                                                                                                                                       |
| Mensajes internos                       | Ambos                    | Listado de mensajes, leídos y sin leer, con su estado vacío.                                                                                                                               |
| Datos de contacto                       | Colectivo                | Solo si tiene acceso (postulación aceptada). Si no, mensaje claro, sin mostrar el error técnico.                                                                                           |
| No encontrada / sin permiso             | Todos                    | Mensaje claro y link de vuelta.                                                                                                                                                            |

## 4. Criterios específicos del dominio

- **Privacidad visible.** Mostrá siempre por qué no se ven los datos de contacto ("Se comparten cuando aceptes su postulación"), y lo mismo con las contribuciones anónimas.
- **Las acciones permanentes van en rojo y con confirmación:** desanotar, darse de baja, rechazar.
- **Estado de la búsqueda en cada perfil**, con texto y color: "Abierta hasta el 30/11", "Límite alcanzado", "Cerrada".
- **Las habilidades se muestran como chips** y se distinguen las requeridas de las opcionales con texto, no solo con color.
- **Las opciones de los filtros salen del catálogo del back** (habilidades, tipos de colectivo, provincias), no de los datos cargados.
- **Encaje con mis habilidades:** en la búsqueda, un indicador como "Tenés 2 de 3 habilidades requeridas".
- **Compromiso y modalidad legibles:** "5 h por mes · Sin incentivo económico", no códigos.
- **Postularse solo si la búsqueda del perfil está abierta.** Si está cerrada, el botón queda deshabilitado con el motivo.
- **Las reglas las decide el back** (límites, modos de aceptación, estados, permisos). El front muestra el estado y, después de cada acción, vuelve a consultar lo afectado.

## 5. Estructura del proyecto React

La estructura y las responsabilidades de cada capa están en `PLAN-ENTIDADES.md`. Resumen:

```
src/
├── Presentation/
│   ├── App.jsx         punto de entrada de la presentación
│   ├── Pages/          una por pantalla (XxxPage.jsx), por área: publicas, ingreso, colectivo, colaboradora, sistema
│   ├── Components/     App/ (compartidos, por función) y una carpeta por módulo
│   ├── Hooks/          estado de carga, error, cancelación y refresco; comunes/ y por entidad
│   ├── Formularios/    estado, validación y requests de cada formulario, por entidad
│   ├── Styles/         tokens.css y base.css (globales); el resto, X.module.css junto a cada componente
│   ├── Context/        contextos compartidos (avisos; después, sesión)
│   ├── Dependencies/   composición de HttpClients y casos de uso
│   └── Routes/         RutasDeLaApp.jsx y rutas protegidas
├── Application/
│   ├── UseCases/       una función por operación, agrupadas por módulo
│   └── Domain/         DTOs, Requests, Enums y contratos I…HttpClient (módulos vacíos)
├── Infrastructure/
│   ├── Http/           axiosClient.js
│   ├── HttpClients/    implementación de cada contrato
│   └── Auth/           adaptador del proveedor de identidad
```

- **Flujo:** `Page` → `Hook` → `Dependencies` → `UseCase` → `HttpClient` → `axiosClient`.
- **Sin clases de dominio en el front:** la lógica de negocio vive en el back. Los DTOs se usan tal como llegan.
- **Filtros, búsqueda y página en la URL** (`useSearchParams`, §21.5.4).
- **Estados de carga con skeletons, vacíos y de error con "Reintentar"** en cada pantalla que consulta al back. Una lista vacía no es un error (§22.2).
- **En desarrollo:** proxy de Vite en `/api` hacia el back.
- **Despliegue:** imagen propia (build con Node + NGINX con fallback a `index.html` y proxy de `/api`).

### 5.1 Base transversal (antes de la primera pantalla)

Son piezas que usan todas las pantallas. Se construyen una vez:

| Pieza                                                                    | Dónde                                                 | Para qué                                                                                                                        |
| ------------------------------------------------------------------------ | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Interceptores de axios                                                   | `Infrastructure/Http/axiosClient.js`                  | Token, errores normalizados y reintentos (ver 5.2).                                                                             |
| `ApiError` y mensajes por status                                         | `Infrastructure/Http/`                                | La presentación recibe un error propio, no el de axios.                                                                         |
| `useConsulta`                                                            | `Presentation/Hooks/comunes/useConsulta.js`           | Carga, error, cancelación y reintento en un solo lugar (ver 5.4).                                                               |
| Esqueleto, EstadoVacio, EstadoDeError, DialogoDeConfirmacion, Paginación | `Presentation/Components/App/`                        | Feedback visual y confirmación que exige la consigna.                                                                           |
| Avisos (`ProveedorDeAvisos` + `useAvisos`)                               | `Presentation/Context/`, `Hooks/` y `Components/App/` | Mensaje de éxito o error después de cada acción. Se llaman "avisos" para no confundirlos con el módulo `Notificacion` del back. |
| Sesión y rutas protegidas                                                | `Infrastructure/Auth/` + `Presentation`               | Ver 5.3.                                                                                                                        |

### 5.2 Cliente HTTP (`axiosClient.js`, §22.1.2)

- **`baseURL`:** `VITE_API_BASE_URL` o `/api` (proxy de Vite en desarrollo y de NGINX en producción). Así no hace falta CORS.
- **Interceptor de request:** agrega `Authorization: Bearer …` si hay sesión. El token lo obtiene el adaptador de `Infrastructure/Auth` mediante `configurarAuth({ obtenerToken, alExpirar })`, para que axios no dependa de React. `obtenerToken` es asíncrono.
- **Interceptor de response:** convierte todo error en un `ApiError` (`status`, `mensaje`, `esReintentable`).
  - **Sin `error.response`:** la petición no tuvo respuesta (red, back caído o CORS) → "No pudimos conectarnos con el servidor".
  - **401** (no sabe quién sos): cierra la sesión y lleva al login.
  - **403** (sabe quién sos, pero no tenés permiso): muestra "sin permiso", sin cerrar la sesión.
  - **429:** "Hiciste muchos pedidos seguidos. Esperá unos segundos y volvé a intentar." Sin reintento automático.
  - **Resto (400, 404, 409, 422):** un texto escrito por el front según el status y la operación (por ejemplo, 409 al postularse: "Ya te postulaste a este proyecto."; 409 al crear un perfil: "Tu cuenta ya tiene un perfil."), con un texto genérico por status como respaldo. **Nunca se muestra el `message` del back.**
  - **`issues` de validación:** cada formulario los traduce por `path` y `code` a los mensajes de sus campos; si no hay traducción, "Revisá este dato."
- **Reintentos (§22.3.3):** automáticos solo en GET (idempotentes) ante red o timeout, con espera creciente y tope. Las altas, postulaciones, aceptaciones y rechazos se reintentan solo con el botón "Reintentar".

### 5.3 Sesión y rutas (§22.4)

- **Proveedor de identidad externo: Logto** (`@logto/react`, migración aprobada el 06/11). Su provider y hooks se encapsulan en `Infrastructure/Auth/ProveedorDeSesionLogto.jsx`, consumido a través de Dependencies y del contrato propio de identidad (`estaAutenticado`, `iniciarSesion`, `completarIngreso`, `obtenerToken`, `cerrarSesion`, `olvidarSesion`). El callback real lo completa `useHandleSignInCallback`; `ProveedorDeSesion` conserva la consulta de cuenta y los permisos del dominio. Cambiar de proveedor es cambiar ese adaptador.
- **El rol y el perfil vienen del back** (`GET /auth/me`, pendiente en el back), no del proveedor: el proveedor dice quién es la persona; el back, qué es en la plataforma.
- **`ProveedorDeSesion` + `useSesion()`** en Presentation: `usuario` (`{ id, rol, perfilId }`), `estaAutenticado`, `cargando`, `iniciarSesion`, `cerrarSesion`. Recibe el adaptador por parámetro para poder probarlo con uno falso.
- **Almacenamiento a cargo del SDK de Logto en `localStorage`**, según la decisión aprobada del 05/11 que revisa la preferencia inicial por memoria (§22.4.3). El frontend no copia tokens a otro almacenamiento. Mantener la mitigación de vencimiento corto, rotación del refresh token y CSP en el despliegue.
- **Contexto en vez de Zustand o Redux:** en una aplicación mediana el contexto alcanza (§21.4.12).
- **`RutaProtegida` recibe los roles permitidos** (`<RutaProtegida roles={['COLECTIVO']} />`):
  - Con `cargando`, muestra "Verificando sesión…" (evita expulsar al login a alguien autenticado al recargar).
  - Sin sesión, `<Navigate to="/login" replace state={{ desde: location }} />`: `replace` evita quedar atrapado con el botón de atrás y `desde` permite volver después del login.
  - Con un rol no permitido, `SinPermisoPage`.
  - **Es una comodidad, no seguridad:** el back siempre valida y responde 401 o 403.
- **Layout con `<Outlet />`** y ruta `*` para el 404 del lado del cliente (§21.5.3).
- **`lazy()` y `Suspense`** para las pantallas privadas, no para `/proyectos`, que es la entrada (§21.5.5).
- **Rutas:**

| Ruta                                                             | Acceso       | Spec                    |
| ---------------------------------------------------------------- | ------------ | ----------------------- |
| `/`                                                              | pública      | redirige a `/proyectos` |
| `/login`, `/callback`, `/registro`                               | pública      | 01                      |
| `/proyectos`                                                     | pública      | 05                      |
| `/proyectos/:id`                                                 | pública      | 06                      |
| `/proyectos/:id/avance`                                          | pública      | 07                      |
| `/colectivo/perfil`                                              | COLECTIVO    | 02                      |
| `/bienvenida/colectivo`                                          | sin perfil   | 02                      |
| `/colectivos/:id`                                                | pública      | 02                      |
| `/bienvenida/colaboradora`                                       | sin perfil   | 03                      |
| `/colaboradoras/:id`                                             | pública      | 03                      |
| `/colectivo/proyectos`                                           | COLECTIVO    | 04                      |
| `/colectivo/proyectos/:id/perfiles/:perfilId/colaboradoras`      | COLECTIVO    | 08                      |
| `/colectivo/postulaciones`                                       | COLECTIVO    | 09                      |
| `/colectivo/proyectos/:id/colaboradoras/:colaboradorId/contacto` | COLECTIVO    | 12                      |
| `/colaboradora/perfil`                                           | COLABORADORA | 03                      |
| `/colaboradora/postulaciones`                                    | COLABORADORA | 10                      |
| `/mensajes`                                                      | ambos roles  | 11                      |
| `/sin-permiso`, `*`                                              | pública      | —                       |

_Pendiente: confirmar con el docente si se aceptan parámetros `:id` o va `?id=` por la restricción de rutas dinámicas._

### 5.4 Carga de datos (`useConsulta`, §22.2 y §21.4.13)

- Devuelve `{ datos, error, cargando, ejecutar, reintentar }`; `cargando` arranca en `true`.
- Recibe una función `(signal) => casoDeUso(…, { signal })` y aborta con `AbortController` al desmontar o cambiar los parámetros, para que una respuesta vieja no pise a una nueva.
- Con `inmediato: false` sirve para acciones (postularse, aceptar); el botón se deshabilita mientras se envía.
- No notifica por su cuenta: eso lo decide el hook de cada módulo.
- Cada hook de módulo (por ejemplo `useProyectos`) queda en pocas líneas: arma la llamada al caso de uso y delega en `useConsulta`.
- En desarrollo, StrictMode duplica los pedidos en la pestaña Network; no es un error.

### 5.5 Estilos (§21.4.3 y §19.6)

- Sin librería de componentes.
- **CSS Modules:** cada componente y cada página tiene su `X.module.css` al lado (`Boton.jsx` + `Boton.module.css`) y lo importa como `import estilos from "./Boton.module.css"`. Las clases no chocan entre módulos.
- **Solo dos archivos globales en `Presentation/Styles/`:** `tokens.css`, con los tokens de `DESIGN.md` como variables CSS en `:root`, y `base.css`, con el reset, las tipografías (`@font-face`) y los estilos de las etiquetas HTML. Se importan una vez en `main.jsx`.
- Los componentes usan las variables de `tokens.css`; ningún color, tamaño o espaciado suelto.
- Lo dinámico va en variables CSS o props; lo estático, en CSS.
- Para el diálogo se usa `<dialog>` nativo. Si aparece un componente complejo (combobox, menú desplegable), se evalúa una librería headless accesible (Radix, React Aria) puntualmente.

### 5.6 Accesibilidad (§23.2)

- Foco con `useRef` al abrir el diálogo y al mostrar un error.
- Errores con `role="alert"`; avisos de éxito con `aria-live="polite"`.
- `eslint-plugin-jsx-a11y` (ya instalado). Opcional: `vitest-axe` para chequear axe-core en los tests de integración (requiere aprobación).

## 6. Identidad de marca

La identidad está definida en `DESIGN.md`, con los tokens, los contrastes verificados y los componentes base.

- **Tipografías:** _Bricolage Grotesque_ para los títulos y _Source Sans 3_ para el texto.
- **Paleta:** acento coral (10 %), verde petróleo oscuro como complementario (30 %) y crema claro de fondo (60 %). El coral vivo sobre crema no llega a 4.5:1 para texto: se usa una variante oscurecida para texto y botones, y el coral vivo solo como decoración.

## 7. Justificación de los requerimientos no funcionales (guía)

| Lineamiento de la consigna       | Cómo se cumple                                                                                                                                                                             |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Interfaz intuitiva               | Navegación igual para todos los roles, acción principal clara por pantalla, pocos clics a lo importante.                                                                                   |
| Aprendizaje rápido               | Patrones de e-commerce (buscador, tarjetas, filtros, detalle), textos descriptivos y pasos visibles.                                                                                       |
| Feedback visual y notificaciones | Skeletons y loaders en cada llamada, mensajes de éxito y error tras cada acción, confirmación en las acciones permanentes. Errores en términos de la persona y con "Reintentar" (§22.2.2). |
| Diseño responsivo                | Grilla adaptable, menú móvil funcional, sin scroll horizontal, zonas de toque de 44 px.                                                                                                    |
| Accesibilidad                    | HTML semántico, labels, ARIA donde hace falta, foco visible, navegación con teclado, contraste de 4.5:1, Lighthouse y axe (WCAG 2.2 AA).                                                   |
| Consistencia en la UI            | Tokens centralizados, componentes reutilizables (tarjetas, chips, diálogo de confirmación, estado vacío, paginación).                                                                      |

## 8. Próximos pasos

1. Confirmar con el docente: Vite o CRA/Next, parámetros `:id` en las rutas y los requerimientos adicionales que asigne.
2. Elegir el proveedor de identidad (Auth0 o Logto) y coordinar con el back `GET /auth/me` y la validación de tokens.
3. Armar la base transversal (sección 5.1).
4. Implementar pantalla por pantalla desde `specs/`, revisando con el checklist de `criterios-pantallas-web.md`.
