# Plan de desarrollo de entidades

## Alcance y decisiones

El plan se basa en los routers, controllers, schemas, services, models y la serialización de las entidades de `packages/backend/src` del [backend](https://github.com/Mazzini123/tp-desarrollo-2c-2026). El backend es la fuente de verdad; su Swagger está en `/docs` y su especificación en `/openapi.json`. Antes de implementar cada módulo, contrastar ambos con el código vigente.

Esta entrega completa la capa de acceso a los endpoints actuales del backend, sin agregar pantallas. El ejemplo existente de Habilidad se conserva.

- Arquitectura por capas: Presentation → UseCases → HttpClients → Axios → backend.
- Sin repositories, commands ni clases de dominio en frontend. Los casos de uso adaptan la respuesta cuando la forma del back no le sirve a la vista, con funciones de `Application/Adaptadores/` (por ahora, `aPagina`). Ver `decisiones.md` del 08/11.
- `Application/Domain/Entities` contiene exclusivamente los DTOs JSON de respuesta. Conservamos el nombre Domain solicitado, pero aquí significa contratos de datos, no un modelo de negocio independiente.
- **Requests en `Application/Domain/Requests`**: forman parte del contrato que usa el caso de uso, aunque su forma la define backend. Ponerlos en Infrastructure obligaría a Application a importar una capa concreta. No necesitamos introducir commands para resolver eso.
- `Application/Domain/HttpClients` declara contratos `I[Entity]HttpClient`. Infrastructure implementa esos contratos y realiza las llamadas HTTP directamente.
- Se mantiene JavaScript/JSX, sin comentarios ni JSDoc en el código. Los archivos de DTOs, requests y contratos son módulos vacíos (`export {};`) que marcan la estructura; la forma de los datos se lee en este plan y en el Swagger del back. No se crean clases ni valores de negocio.
- Un caso de uso es una función creada con un HttpClient inyectado. Puede delegar directamente si no hay más trabajo; no inventar lógica para justificar una capa.
- Los formularios construyen el request exacto. Las respuestas se usan directamente, sin convertir nombres ni reconstruir clases.
- La composición de implementaciones y casos de uso vive en `Presentation/Dependencies`. Es el único lugar de Presentation que importa Infrastructure.
- HttpClients (contratos e implementaciones) y Dependencies tienen archivos sueltos: uno por módulo. Components, Hooks, Pages, Formularios, Entities, Requests y UseCases se agrupan en subcarpetas por entidad, área o función.

## Estructura

```text
src/
├── main.jsx
├── Presentation/
│   ├── App.jsx                      Router general
│   ├── Pages/
│   │   └── publicas/HabilidadesPage.jsx
│   ├── Components/
│   │   ├── App/layout/MarcoDeLaApp.jsx  Cabecera y navegación compartida
│   │   └── Habilidad/
│   │       ├── HabilidadForm.jsx
│   │       └── HabilidadList.jsx
│   ├── Hooks/habilidad/
│   │   ├── useHabilidades.js
│   │   └── useCrearHabilidad.js
│   ├── Dependencies/habilidadDependencies.js
│   ├── Routes/RutasDeLaApp.jsx
│   └── Styles/                     tokens.css y base.css
├── Application/
│   ├── UseCases/Habilidad/
│   │   ├── ListarHabilidades.js
│   │   └── CrearHabilidad.js
│   └── Domain/
│       ├── Entities/
│       │   ├── App/PaginaDto.js
│       │   └── Habilidad/HabilidadDto.js
│       ├── Requests/
│       │   ├── App/PaginacionRequest.js
│       │   └── Habilidad/CrearHabilidadRequest.js
│       ├── HttpClients/IHabilidadHttpClient.js
│       └── Enums/                  Reservado para constantes de la API
├── Infrastructure/
│   ├── Http/axiosClient.js
│   └── HttpClients/HabilidadHttpClient.js
```

Las carpetas de módulos futuros se crean cuando aparece su primer archivo, no antes. Entities, Requests y UseCases agrupan sus archivos por módulo (`App/` guarda lo compartido); HttpClients y Dependencies usan archivos sueltos. Por ejemplo, Entities/Colectivo/ColectivoDto.js, Infrastructure/HttpClients/ColectivoHttpClient.js y Dependencies/colectivoDependencies.js.

Dentro de Components, `App` agrupa lo compartido por función (`ui`, `estados`, `navegacion`, `layout`, `dialogos`, `avisos`, `sesion`, `texto`) y cada entidad agrupa sus componentes. Hooks agrupa en `comunes` y por entidad; Pages, por área (`publicas`, `ingreso`, `colectivo`, `colaboradora`, `sistema`, `flujos`). En las carpetas planas, el nombre del archivo identifica el módulo. No crear carpetas de contextos o utilidades sin una necesidad concreta. Ubicación, compromiso, red social y medio de contacto son estructuras compartidas/nested de los DTOs y requests, no módulos con CRUD propio. Reclutamiento, estadísticas y timeline son módulos de consultas/acciones, aunque no sean entidades persistidas independientes.

## Dependencias y responsabilidades

| Parte            | Responsabilidad                                              | Dependencias permitidas                     |
| ---------------- | ------------------------------------------------------------ | ------------------------------------------- |
| Page / Component | UI, valores del formulario y eventos                         | Hooks, componentes, DTOs/requests y estilos |
| Hook             | Estado de carga/error, consultas, mutaciones y cancelación   | Casos de uso compuestos en Dependencies     |
| Dependencies     | Crear HttpClients e inyectarlos en casos de uso              | Application e Infrastructure                |
| UseCase          | Ejecutar la operación y, si hace falta, coordinar varias     | DTOs, requests y contratos de Application   |
| HttpClient       | URL, verbo, parámetros, body y extracción de `response.data` | Contratos de Application e instancia HTTP   |
| Axios            | Base URL, timeout y transporte                               | Backend                                     |

Application no importa React, Axios ni Infrastructure. El contrato HTTP puede aceptar `{ signal }` para cancelación sin exponer `AxiosRequestConfig`. Los hooks no arman URLs ni consumen Axios. Los DTOs, requests y contratos son módulos vacíos: no se instancian ni se importan como valores. Una futura migración a TypeScript puede convertirlos a interfaces conservando el flujo.

`Application/Domain/Entities/Habilidad/HabilidadDto.js` contiene solo `export {};`. Los campos de `HabilidadDto` son `codigo`, `titulo`, `descripcion`, `fechaCreacion`, `usuario` y `activo` (booleano); el resto de los contratos se consulta en el Swagger del back (`/docs`).

```mermaid
sequenceDiagram
    participant UI as HabilidadForm / HabilidadesPage
    participant Hook as Hook
    participant UC as Caso de uso
    participant HTTP as HabilidadHttpClient
    participant AX as Axios
    participant API as Backend
    UI->>Hook: crear(request) / consultar(query)
    Hook->>UC: request/query + signal
    UC->>HTTP: crear / listar
    HTTP->>AX: POST /habilidades o GET /habilidades
    AX->>API: HTTP JSON
    API-->>AX: DTO o {data, meta}
    AX-->>HTTP: response
    HTTP-->>UC: response.data
    UC-->>Hook: DTO sin transformación
    Hook-->>UI: datos, carga, error
```

## Ejemplo implementado: Habilidad

1. `HabilidadesPage` se muestra en `/habilidades`; `/` redirige allí.
2. `useHabilidades` invoca `listarHabilidades({ page: 1, limit: 10 }, { signal })` al montar.
3. Dependencies compone `crearListarHabilidades(crearHabilidadHttpClient(axiosClient))` una sola vez, fuera del render.
4. El caso de uso llama al contrato `listar`.
5. La implementación hace `GET /habilidades` con query params y retorna `response.data`: **el objeto `{ data, meta }` completo**, no sólo su array interior.
6. El hook guarda la página sin adaptaciones; la UI muestra `pagina.data` y usa `pagina.meta` para navegar.
7. `HabilidadForm` arma `{ titulo, descripcion }`; `useCrearHabilidad` → `CrearHabilidad` → `httpClient.crear` → `POST /habilidades`.
8. Si el alta responde correctamente, se limpia el formulario, se informa el éxito y se vuelve a consultar la página actual. No se asume dónde ordenará backend la nueva habilidad.
9. Si falla el alta, se conserva el formulario y se muestra el error. La carga del catálogo y el alta tienen estados separados.
10. Las consultas se cancelan al desmontar/cambiar de página; se ignoran respuestas canceladas para evitar que una consulta vieja sobrescriba datos actuales. El alta bloquea envíos simultáneos. Cancelar el transporte de una mutación no revierte una creación ya procesada por backend.

Request:

```json
{ "titulo": "React", "descripcion": "Interfaces web" }
```

Respuesta de alta (`201`):

```json
{
  "titulo": "React",
  "codigo": "react",
  "descripcion": "Interfaces web",
  "fechaCreacion": "2026-11-03T12:00:00.000Z",
  "usuario": "admin",
  "activo": true
}
```

No se calculan `codigo`, `fechaCreacion` o `activo` en frontend. `usuario` es opcional y el ejemplo lo omite; el valor por defecto del backend no representa una sesión autenticada. Actualmente no hay rutas GET por código, PUT ni DELETE para habilidades: no agregarlas al cliente como si existieran.

## Convenciones del contrato backend

- Los paths siguientes son los reales de backend, **sin `/api`**. Ese prefijo pertenece al proxy/reverse proxy del frontend.
- Paginación: query `{ page, limit }`, `page >= 1`, `1 <= limit <= 100`. Respuesta `{ data: T[], meta: { page, per_page, total, total_pages } }`. Sin resultados, `total_pages` es 0.
- Paginados: listados generales de habilidades, colectivos, colaboradores, proyectos, búsquedas de reclutamiento y bandeja de notificaciones. No asumir que todos los endpoints de colección paginan.
- Los listados generales de colectivos/proyectos aceptan `etiqueta` además de `page` y `limit`.
- Errores: `{ message }`; validación puede incluir `issues`. Conservar el error original entre infraestructura y hook. La presentación decide el texto. Contemplar validación, conflicto, inexistencia, límite de tasa y fallo de red.
- El HttpClient devuelve el JSON sin modificarlo. Un DELETE con `204` se tipa `Promise<void>` y no necesita deserializar un DTO.
- Requests con schemas estrictos: enviar sólo los campos permitidos, nunca hacer `PUT` de un DTO entero. Los PUT de edición parcial de varios recursos requieren al menos un campo; Logro exige título y descripción en su actualización.
- Fechas de respuesta son strings JSON, no `Date`. Convertir sólo para mostrar, sin alterar el DTO almacenado. `null`, ausencia y cadena vacía tienen significados distintos.
- Codificar los parámetros dinámicos, especialmente pronombres, códigos y valores de contacto: se arman con la etiqueta `ruta` de `Infrastructure/Http/pedidos.js`, que aplica `encodeURIComponent` a cada valor.
- Validar lo básico en formularios; las reglas de aceptación, cupos, estados y permisos de acciones las decide backend. Después de una mutación volver a consultar recursos relacionados afectados.
- No compartir imports directos con el repositorio backend ni copiar sus clases, repositorios o métodos de negocio al frontend.

## Estado de implementación

La capa de acceso al backend está completa para los **59 endpoints** de negocio definidos en sus routers (`GET /health` queda fuera: es la verificación técnica del back y ninguna pantalla la usa): DTOs, requests, enums, contratos, HttpClients, casos de uso y composición de dependencias. Todos son archivos JavaScript sin comentarios; los archivos de contratos son módulos vacíos.

El flujo listo para usar es `Dependencies → UseCase → HttpClient → Axios → backend`. Las pantallas, componentes, hooks y rutas nuevos quedan pendientes. Se conserva el ejemplo existente de Habilidad.

## Operaciones disponibles por módulo

Los ids van como argumentos posicionales en el orden de la URL. Después van `query` o `request`, si corresponde, y al final `options = {}`, que admite `signal`. Las queries paginadas son opcionales y por defecto se envía `{}` para dejar que backend aplique sus valores por defecto.

### Habilidad

Composición: `Presentation/Dependencies/habilidadDependencies.js`.

| Caso de uso         | Verbo y endpoint    | Request / query             | Respuesta                 |
| ------------------- | ------------------- | --------------------------- | ------------------------- |
| `ListarHabilidades` | `GET /habilidades`  | `PaginacionRequest` (query) | `PaginaDto<HabilidadDto>` |
| `CrearHabilidad`    | `POST /habilidades` | `CrearHabilidadRequest`     | `HabilidadDto`            |

Catálogo paginado. Las habilidades embebidas en otros DTOs usan HabilidadResumenDto (codigo y titulo). No existen edición ni baja de habilidades en la API.

### Colectivo

Composición: `Presentation/Dependencies/colectivoDependencies.js`.

| Caso de uso           | Verbo y endpoint                     | Request / query                     | Respuesta                 |
| --------------------- | ------------------------------------ | ----------------------------------- | ------------------------- |
| `ListarColectivos`    | `GET /colectivos`                    | `ListadoConEtiquetaRequest` (query) | `PaginaDto<ColectivoDto>` |
| `ObtenerColectivo`    | `GET /colectivos/:colectivoId`       | Sin body                            | `ColectivoDto`            |
| `CrearColectivo`      | `POST /colectivos`                   | `CrearColectivoRequest`             | `ColectivoDto`            |
| `ActualizarColectivo` | `PUT /colectivos/:colectivoId`       | `ActualizarColectivoRequest`        | `ColectivoDto`            |
| `DarDeBajaColectivo`  | `POST /colectivos/:colectivoId/baja` | Sin body                            | `ColectivoDto`            |

La baja es una acción POST que conserva el historial y elimina contactos/redes. No hay DELETE del colectivo. Los listados aceptan etiqueta.

### Colaborador

Composición: `Presentation/Dependencies/colaboradorDependencies.js`.

| Caso de uso                    | Verbo y endpoint                                                       | Request / query                | Respuesta                   |
| ------------------------------ | ---------------------------------------------------------------------- | ------------------------------ | --------------------------- |
| `ListarColaboradores`          | `GET /colaboradores`                                                   | `PaginacionRequest` (query)    | `PaginaDto<ColaboradorDto>` |
| `ObtenerColaborador`           | `GET /colaboradores/:colaboradorId`                                    | Sin body                       | `ColaboradorDto`            |
| `CrearColaborador`             | `POST /colaboradores`                                                  | `CrearColaboradorRequest`      | `ColaboradorDto`            |
| `ActualizarColaborador`        | `PUT /colaboradores/:colaboradorId`                                    | `ActualizarColaboradorRequest` | `ColaboradorDto`            |
| `AgregarPronombre`             | `POST /colaboradores/:colaboradorId/pronombres`                        | `AgregarPronombreRequest`      | `ColaboradorDto`            |
| `QuitarPronombre`              | `DELETE /colaboradores/:colaboradorId/pronombres/:pronombre`           | Sin body                       | `ColaboradorDto`            |
| `AgregarHabilidadAColaborador` | `POST /colaboradores/:colaboradorId/habilidades`                       | `AgregarHabilidadRequest`      | `ColaboradorDto`            |
| `QuitarHabilidadDeColaborador` | `DELETE /colaboradores/:colaboradorId/habilidades/:codigoHabilidad`    | Sin body                       | `ColaboradorDto`            |
| `AgregarMedioDeContacto`       | `POST /colaboradores/:colaboradorId/medios-de-contacto`                | `MedioDeContactoRequest`       | `MedioDeContactoDto`        |
| `QuitarMedioDeContacto`        | `DELETE /colaboradores/:colaboradorId/medios-de-contacto/:tipo/:valor` | Sin body                       | `void (204)`                |

El DTO público excluye mediosDeContacto. Agregar un contacto devuelve sólo el medio cargado; quitarlo devuelve 204. Los demás DELETE de habilidades/pronombres devuelven ColaboradorDto. La edición no permite cambiar la identidad.

### Proyecto

Composición: `Presentation/Dependencies/proyectoDependencies.js`.

| Caso de uso                  | Verbo y endpoint                           | Request / query                     | Respuesta                |
| ---------------------------- | ------------------------------------------ | ----------------------------------- | ------------------------ |
| `ListarProyectos`            | `GET /proyectos`                           | `ListadoConEtiquetaRequest` (query) | `PaginaDto<ProyectoDto>` |
| `ObtenerProyecto`            | `GET /proyectos/:proyectoId`               | Sin body                            | `ProyectoDto`            |
| `CrearProyecto`              | `POST /colectivos/:colectivoId/proyectos`  | `CrearProyectoRequest`              | `ProyectoDto`            |
| `ListarProyectosDeColectivo` | `GET /colectivos/:colectivoId/proyectos`   | Sin body                            | `ProyectoDto[]`          |
| `ActualizarProyecto`         | `PUT /proyectos/:proyectoId`               | `ActualizarProyectoRequest`         | `ProyectoDto`            |
| `FinalizarProyecto`          | `POST /proyectos/:proyectoId/finalizacion` | Sin body                            | `ProyectoDto`            |

Crear y listar por colectivo usa /colectivos/:colectivoId/proyectos. El detalle registra una visualización; las URLs y el progreso se actualizan mediante avances. El listado admite etiqueta. Proyecto ya no recibe ni devuelve modoAceptacion, limiteVacantes o vacantesLibres: la configuración de búsqueda y aceptación pertenece a cada perfil.

| Caso de uso                    | Verbo y endpoint                                                   | Request / query | Respuesta              |
| ------------------------------ | ------------------------------------------------------------------ | --------------- | ---------------------- |
| `ObtenerContactoDeColaborador` | `GET /proyectos/:proyectoId/colaboradores/:colaboradorId/contacto` | Sin body        | `MedioDeContactoDto[]` |

El contacto sólo se comparte cuando la persona tiene una colaboración aceptada en el proyecto. Backend devuelve 403 si no cumple esa condición y 404 si el recurso no existe. Esta consulta contextual no cambia el DTO público de Colaborador, que sigue sin exponer contactos.

### Perfil

Composición: `Presentation/Dependencies/perfilDependencies.js`.

| Caso de uso                 | Verbo y endpoint                                                                           | Request / query           | Respuesta     |
| --------------------------- | ------------------------------------------------------------------------------------------ | ------------------------- | ------------- |
| `ListarPerfiles`            | `GET /proyectos/:proyectoId/perfiles`                                                      | Sin body                  | `PerfilDto[]` |
| `ObtenerPerfil`             | `GET /proyectos/:proyectoId/perfiles/:perfilId`                                            | Sin body                  | `PerfilDto`   |
| `CrearPerfil`               | `POST /proyectos/:proyectoId/perfiles`                                                     | `CrearPerfilRequest`      | `PerfilDto`   |
| `ActualizarPerfil`          | `PUT /proyectos/:proyectoId/perfiles/:perfilId`                                            | `ActualizarPerfilRequest` | `PerfilDto`   |
| `EliminarPerfil`            | `DELETE /proyectos/:proyectoId/perfiles/:perfilId`                                         | Sin body                  | `void (204)`  |
| `AgregarHabilidadRequerida` | `POST /proyectos/:proyectoId/perfiles/:perfilId/habilidades-requeridas`                    | `AgregarHabilidadRequest` | `PerfilDto`   |
| `QuitarHabilidadRequerida`  | `DELETE /proyectos/:proyectoId/perfiles/:perfilId/habilidades-requeridas/:codigoHabilidad` | Sin body                  | `PerfilDto`   |
| `AgregarHabilidadOpcional`  | `POST /proyectos/:proyectoId/perfiles/:perfilId/habilidades-opcionales`                    | `AgregarHabilidadRequest` | `PerfilDto`   |
| `QuitarHabilidadOpcional`   | `DELETE /proyectos/:proyectoId/perfiles/:perfilId/habilidades-opcionales/:codigoHabilidad` | Sin body                  | `PerfilDto`   |

El alta requiere al menos una habilidad requerida y compromiso. PerfilDto y sus requests incluyen busquedaAbierta, fechaCierreBusqueda, limiteColaboraciones y modoAceptacion. Los valores por defecto son true, null, null y REVISION_MANUAL, respectivamente. El modo y el límite se configuran por perfil; editar habilidades sigue requiriendo sus acciones específicas. Sólo eliminar el perfil devuelve 204.

Para cerrar o reabrir una búsqueda se usa ActualizarPerfil con busquedaAbierta. fechaCierreBusqueda admite una fecha ISO o null. Las reglas y efectos sobre postulaciones los decide backend, sin cálculos adicionales en frontend.

### Colaboracion

Composición: `Presentation/Dependencies/colaboracionDependencies.js`.

| Caso de uso                         | Verbo y endpoint                                                          | Request / query                | Respuesta                        |
| ----------------------------------- | ------------------------------------------------------------------------- | ------------------------------ | -------------------------------- |
| `RegistrarColaboracion`             | `POST /proyectos/:proyectoId/colaboraciones`                              | `RegistrarColaboracionRequest` | `ColaboracionDto`                |
| `ListarColaboracionesDeProyecto`    | `GET /proyectos/:proyectoId/colaboraciones`                               | Sin body                       | `ColaboracionDto[]`              |
| `ListarColaboracionesDeColaborador` | `GET /colaboradores/:colaboradorId/colaboraciones`                        | Sin body                       | `ColaboracionDeColaboradorDto[]` |
| `AceptarPostulacion`                | `POST /proyectos/:proyectoId/colaboraciones/:colaboracionId/aceptacion`   | Sin body                       | `ColaboracionDto`                |
| `RechazarPostulacion`               | `POST /proyectos/:proyectoId/colaboraciones/:colaboracionId/rechazo`      | Sin body                       | `ColaboracionDto`                |
| `FinalizarColaboracion`             | `POST /proyectos/:proyectoId/colaboraciones/:colaboracionId/finalizacion` | Sin body                       | `ColaboracionDto`                |

| Caso de uso               | Verbo y endpoint                                                            | Request / query | Respuesta         |
| ------------------------- | --------------------------------------------------------------------------- | --------------- | ----------------- |
| `DesvincularColaboracion` | `POST /proyectos/:proyectoId/colaboraciones/:colaboracionId/desvinculacion` | Sin body        | `ColaboracionDto` |

Postulación y colaboración son el mismo recurso con distintos estados. Registrar exige colaboradorId y perfilId, y puede quedar aceptado automáticamente según la configuración del perfil. ColaboracionDto.perfil es el id del perfil (string), no un objeto PerfilDto. colaborador es null en contribuciones anónimas; el historial por persona devuelve { proyectoId, colaboracion }[] y no incluye sus contribuciones anónimas.

Desvincular cambia una colaboración aceptada al estado DESVINCULADA y fija fechaFin. Es una acción distinta de finalizar: la valoración sigue requiriendo FINALIZADA. Backend puede emitir una notificación de tipo DESVINCULACION; ambos enums están reflejados en frontend.

### Valoracion

Composición: `Presentation/Dependencies/valoracionDependencies.js`.

| Caso de uso                        | Verbo y endpoint                                                          | Request / query              | Respuesta                                            |
| ---------------------------------- | ------------------------------------------------------------------------- | ---------------------------- | ---------------------------------------------------- |
| `ValorarColaboracion`              | `POST /proyectos/:proyectoId/colaboraciones/:colaboracionId/valoraciones` | `ValorarColaboracionRequest` | `ValoracionDto`                                      |
| `ObtenerValoracionesDeColectivo`   | `GET /colectivos/:colectivoId/valoraciones`                               | Sin body                     | `ResumenValoracionesDto<ValoracionDeColectivoDto>`   |
| `ObtenerValoracionesDeColaborador` | `GET /colaboradores/:colaboradorId/valoraciones`                          | Sin body                     | `ResumenValoracionesDto<ValoracionDeColaboradorDto>` |

POST devuelve ValoracionDto. Los GET devuelven { cantidad, promedio, valoraciones }; promedio puede ser null. Cada listado tiene DTO propio para el contexto del autor/proyecto/colectivo.

### Reclutamiento

Composición: `Presentation/Dependencies/reclutamientoDependencies.js`.

| Caso de uso                      | Verbo y endpoint                                                          | Request / query             | Respuesta                             |
| -------------------------------- | ------------------------------------------------------------------------- | --------------------------- | ------------------------------------- |
| `BuscarColaboradorasPotenciales` | `GET /proyectos/:proyectoId/perfiles/:perfilId/colaboradoras-potenciales` | `PaginacionRequest` (query) | `PaginaDto<ColaboradoraPotencialDto>` |
| `BuscarProyectosPotenciales`     | `GET /colaboradores/:colaboradorId/proyectos-potenciales`                 | `PaginacionRequest` (query) | `PaginaDto<ProyectoDto>`              |
| `InvitarColaborador`             | `POST /proyectos/:proyectoId/perfiles/:perfilId/invitaciones`             | `InvitarColaboradorRequest` | `NotificacionDto`                     |

Colaboradoras potenciales devuelve una página de { colaborador, habilidadesOpcionalesQueTiene }; proyectos potenciales devuelve una página de ProyectoDto. Una invitación devuelve NotificacionDto, no una colaboración.

### Notificacion

Composición: `Presentation/Dependencies/notificacionDependencies.js`.

| Caso de uso                   | Verbo y endpoint                                                            | Request / query             | Respuesta                    |
| ----------------------------- | --------------------------------------------------------------------------- | --------------------------- | ---------------------------- |
| `ListarNotificaciones`        | `GET /colaboradores/:colaboradorId/notificaciones`                          | `PaginacionRequest` (query) | `PaginaDto<NotificacionDto>` |
| `MarcarNotificacionComoLeida` | `POST /colaboradores/:colaboradorId/notificaciones/:notificacionId/lectura` | Sin body                    | `NotificacionDto`            |

La bandeja está paginada por colaborador. Marcar lectura devuelve NotificacionDto. ReferenciasNotificacionDto contempla los ids de invitaciones/resoluciones y proyectoIds para avisos de proyectos compatibles. No existe un endpoint de creación manual: las notificaciones se generan por las operaciones del backend.

### Logro

Composición: `Presentation/Dependencies/logroDependencies.js`.

| Caso de uso       | Verbo y endpoint                                | Request / query          | Respuesta    |
| ----------------- | ----------------------------------------------- | ------------------------ | ------------ |
| `ListarLogros`    | `GET /proyectos/:proyectoId/logros`             | Sin body                 | `LogroDto[]` |
| `ObtenerLogro`    | `GET /proyectos/:proyectoId/logros/:logroId`    | Sin body                 | `LogroDto`   |
| `CrearLogro`      | `POST /proyectos/:proyectoId/logros`            | `CrearLogroRequest`      | `LogroDto`   |
| `ActualizarLogro` | `PUT /proyectos/:proyectoId/logros/:logroId`    | `ActualizarLogroRequest` | `LogroDto`   |
| `EliminarLogro`   | `DELETE /proyectos/:proyectoId/logros/:logroId` | Sin body                 | `void (204)` |

Listado simple. Tanto alta como edición requieren titulo y descripcion. Eliminar devuelve 204. Backend exige un proyecto abierto para modificar logros y valida títulos repetidos.

### Avance

Composición: `Presentation/Dependencies/avanceDependencies.js`.

| Caso de uso       | Verbo y endpoint                               | Request / query          | Respuesta     |
| ----------------- | ---------------------------------------------- | ------------------------ | ------------- |
| `ListarAvances`   | `GET /proyectos/:proyectoId/avances`           | Sin body                 | `AvanceDto[]` |
| `ObtenerAvance`   | `GET /proyectos/:proyectoId/avances/:avanceId` | Sin body                 | `AvanceDto`   |
| `RegistrarAvance` | `POST /proyectos/:proyectoId/avances`          | `RegistrarAvanceRequest` | `AvanceDto`   |

Sólo alta, listado y detalle; no hay edición/baja. El request requiere porcentaje numérico y ambas URLs HTTP/HTTPS. Backend exige un progreso mayor al actual y proyecto abierto.

### Estadistica

Composición: `Presentation/Dependencies/estadisticaDependencies.js`.

| Caso de uso                      | Verbo y endpoint                            | Request / query | Respuesta                  |
| -------------------------------- | ------------------------------------------- | --------------- | -------------------------- |
| `ObtenerEstadisticasGlobales`    | `GET /estadisticas`                         | Sin body        | `EstadisticasGlobalesDto`  |
| `ObtenerEstadisticasDeColectivo` | `GET /colectivos/:colectivoId/estadisticas` | Sin body        | `EstadisticasColectivoDto` |

Dos DTOs distintos para globales y colectivo; no se calculan agregados en frontend. Las globales usan caché pública de 60 segundos. generadoEn es una fecha ISO.

### Timeline

Composición: `Presentation/Dependencies/timelineDependencies.js`.

| Caso de uso                  | Verbo y endpoint                        | Request / query | Respuesta             |
| ---------------------------- | --------------------------------------- | --------------- | --------------------- |
| `ObtenerTimelineDeColectivo` | `GET /colectivos/:colectivoId/timeline` | Sin body        | `EventoTimelineDto[]` |

Array cronológico de eventos públicos. Los campos adicionales dependen del tipo: proyecto, logro, avance o colaborador. Una colaboración anónima tiene colaborador null. No tiene mutaciones propias.

### Auth

Composición: `Presentation/Dependencies/authDependencies.js`.

| Caso de uso              | Verbo y endpoint               | Request / query        | Respuesta               |
| ------------------------ | ------------------------------ | ---------------------- | ----------------------- |
| `ObtenerCuentaActual`    | `GET /auth/me`                 | Sin body               | `CuentaDto`             |
| `RegistrarUsuario`       | `POST /auth/registro`          | Sin body (idempotente) | `{ usuarioId, creado }` |
| `CambiarNombreDeUsuario` | `PUT /auth/usuario`            | `{ nombre }`           | `{ id, nombre }`        |
| `SeleccionarContexto`    | `PUT /auth/contexto-actual`    | `{ contextoId }`       | `ContextoDto`           |
| `LimpiarContexto`        | `DELETE /auth/contexto-actual` | Sin body               | 204                     |

`GET /auth/me` conserva `{ id, rol, perfilId }` (derivados del contexto actual) y suma `usuario { id, nombre, nombrePendiente }`, `contextoActual` y `contextos` (cada uno con `tipo`, `rol` —`COLABORADOR`, `MIEMBRO` o `LIDER`—, su colectivo o colaboradora y `permisos`). `aCuenta` lo aplana para la vista. Si responde 403 `USUARIO_NO_REGISTRADO`, el `AuthProvider` registra y vuelve a pedirla. Cada pedido con token lleva `X-Context-Id` con el contexto actual; los errores traen `codigo` (`CONTEXTO_NO_ACTUAL`, `PERMISO_INSUFICIENTE`, `NOMBRE_REQUERIDO`...). El proveedor de identidad (Logto) vive en `Infrastructure/Auth/` detrás del contrato `Identidad` y solo se compone en `Presentation/Dependencies/identidadDependencies.js`.

### Membresia

Composición: `Presentation/Dependencies/membresiaDependencies.js`. Todas llevan sesión.

| Caso de uso                     | Verbo y endpoint                                                  | Request / query     | Respuesta                                  |
| ------------------------------- | ----------------------------------------------------------------- | ------------------- | ------------------------------------------ |
| `ListarMiembros`                | `GET /colectivos/:id/miembros`                                    | Sin body            | `MiembroDto[]` (`contextoId`, `nombre`, `rol`) |
| `QuitarMiembro`                 | `DELETE /colectivos/:id/miembros/:contextoId`                     | Sin body            | 204                                        |
| `AbandonarColectivo`            | `POST /colectivos/:id/abandono`                                   | Sin body            | 204                                        |
| `TransferirLiderazgo`           | `POST /colectivos/:id/lider`                                      | `{ contextoId }`    | Liderazgo nuevo                            |
| `ListarSolicitudesDeIngreso`    | `GET /colectivos/:id/solicitudes-ingreso`                         | `estado` (opcional) | `SolicitudDeIngresoDto[]` con `usuario`    |
| `AceptarSolicitudDeIngreso`     | `POST /colectivos/:id/solicitudes-ingreso/:solicitudId/aceptacion` | Sin body            | `{ solicitud, miembro }`                   |
| `RechazarSolicitudDeIngreso`    | `POST /colectivos/:id/solicitudes-ingreso/:solicitudId/rechazo`   | Sin body            | `SolicitudDeIngresoDto`                    |
| `SolicitarIngreso`              | `POST /colectivos/:id/solicitudes-ingreso`                        | Sin body            | `SolicitudDeIngresoDto` (201)              |
| `CancelarSolicitudDeIngreso`    | `POST /colectivos/:id/solicitudes-ingreso/:solicitudId/cancelacion` | Sin body          | `SolicitudDeIngresoDto`                    |
| `ListarMisSolicitudesDeIngreso` | `GET /auth/solicitudes-ingreso`                                   | Sin body            | `SolicitudDeIngresoDto[]` (pendientes primero) |

Los permisos del contexto actual (`contextoActual.permisos`) deciden qué acciones se muestran (`Domain/Reglas/permisos.js`); el back vuelve a validarlos. Los 409 traen `codigo` (`LIDER_DEBE_TRANSFERIR`, `LIDER_UNICO_MIEMBRO`, `SOLICITUD_YA_RESUELTA`, `SOLICITUD_PENDIENTE`, `YA_ES_MIEMBRO`...) y `Formatos/membresia.js` los traduce.

## Cómo consumir un flujo desde presentación

Las dependencias ya exportan los casos de uso listos. Al incorporar un hook, importar sólo la composición del módulo y pasar el request exacto de backend:

```js
import { proyectoDependencies } from "@/Presentation/Dependencies/proyectoDependencies.js";

const controller = new AbortController();
const pagina = await proyectoDependencies.listarProyectos(
  { page: 1, limit: 10, etiqueta: "educacion" },
  { signal: controller.signal },
);

const proyecto = await proyectoDependencies.crearProyecto(colectivoId, {
  titulo: "Portal comunitario",
  descripcion: "Sitio para la organización",
  perfiles: [
    {
      descripcion: "Frontend",
      codigosHabilidadesRequeridas: ["react"],
      compromiso: { cantidadHoras: 4, periodo: "HS_SEMANALES" },
    },
  ],
});
```

Los hooks futuros deben gestionar carga, error, cancelación y actualización de consultas después de mutaciones. Los casos de uso y HttpClients no guardan estado de UI ni toman decisiones de negocio. Cancelar una mutación no revierte una acción ya procesada por backend.

Cada módulo también exporta `crear[Modulo]Dependencies(http)` para inyectar una instancia Axios en pruebas. Los contratos no exponen Axios: sólo la composición e Infrastructure lo conocen.

## Consideraciones del contrato actual

- DTOs de respuesta en Entities (por módulo), contratos en Domain/HttpClients e implementaciones en Infrastructure/HttpClients: archivos sueltos. Entities, Requests y UseCases se agrupan por módulo.
- Los ids de entidades llegan como strings JSON; Habilidad se identifica públicamente por codigo. No guardar objetos ObjectId ni recrear modelos de Mongoose en frontend.
- Los DTOs describen la serialización pública de los modelos actuales, no sus campos internos: sin _id, __v ni contactos privados de colaboradores. FechaCreacion y el resto de las fechas se conservan como strings ISO.
- Los requests de edición contienen sólo los campos permitidos por los schemas de backend. No enviar un DTO entero. Los PUT parciales requieren algún campo; Logro requiere ambos campos.
- Al construir URLs se codifica cada segmento dinámico, incluidos ids, pronombres, códigos y valores de contacto.
- Los HttpClients extraen sólo response.data y mantienen el contenido JSON intacto, incluido el sobre paginado. Las operaciones 204 no intentan devolver un DTO.
- HttpClients y UseCases propagan el error tal como lo lanza la instancia de Axios, sin envolverlo. Con `axiosClient`, los interceptores ya lo convirtieron en un `ApiError` (`status`, `mensaje`, `esReintentable`, `issues`, y el error de Axios en `cause`); la presentación lee `mensaje` y `esReintentable`. Solo los GET se reintentan solos, y solo ante falta de respuesta o timeout.
- Las reglas de cupo, estados, habilidades, anonimato, cierre, contactos y validación siguen siendo responsabilidad del backend.
- Los enums de Application/Domain/Enums corresponden a los valores del backend; no contienen sus validadores ni lógica de dominio.

## Validación

- La matriz de `tests/application/flujosBackend.test.js` recorre los 59 flujos desde las composiciones hasta el transporte de Axios, verificando método, URL, query, body, signal y salida, además de errores, aislamiento de instancias y cancelación.
- Las pruebas existentes del ejemplo de Habilidad siguen cubriendo el recorrido desde UI.
- La cobertura de endpoints se contrastó con los routers actuales del backend. Las pruebas del frontend sustituyen el transporte HTTP y no dependen de un checkout del backend.
- Para comprobaciones manuales, levantar ambos proyectos según sus README. La instancia Axios usa la configuración compartida del proyecto; no se duplican URLs por entidad.

## Pendiente para próximas entregas

- [ ] Agregar hooks, componentes, páginas y navegación del resto de los módulos.
- [ ] Conectar las acciones con recarga de los recursos relacionados y mensajes adecuados para sus errores.
- [ ] Incorporar sesión y restricciones por rol cuando backend exponga autenticación.
- [ ] Agregar pruebas de UI a medida que se implementen pantallas.

El README general conserva sólo el arranque y el resumen de arquitectura. Este documento concentra el inventario y la guía de incorporación de entidades. Agregar adapters, repositories o commands sólo si aparece una necesidad concreta.
