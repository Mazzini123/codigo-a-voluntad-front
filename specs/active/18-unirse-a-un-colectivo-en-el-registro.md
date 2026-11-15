# Unirse a un colectivo durante el registro

Origen: flujo de registro acordado con Facundo el 14/11/2026 (paso 7). Ajusta la spec 01 (Bienvenida) y la 14 (pedir ingreso).

## Intención

Que una persona que se registra como colectivo pueda elegir entre crear un colectivo nuevo o sumarse a uno que ya existe. Si elige sumarse, pide el ingreso y espera sin entrar a ningún panel hasta que el liderazgo del colectivo la acepte. Recién entonces tiene un contexto `COLECTIVO` con rol `MIEMBRO` y entra al panel.

## Escenarios

Dada una persona con nombre y sin contextos en `/bienvenida`,
cuando mira las opciones,
entonces ve tres tarjetas: «Crear un colectivo», «Unirme a un colectivo» y «Registrarme como colaboradora».

Dada esa pantalla,
cuando elige «Crear un colectivo», completa el formulario y toca «Crear perfil»,
entonces el back crea el colectivo y un contexto `COLECTIVO` con rol `LIDER`, y la persona llega a `/colectivo/resumen`.

Dada esa pantalla,
cuando elige «Unirme a un colectivo»,
entonces ve la lista de colectivos activos, paginada, con nombre, tipo y una línea de la descripción, y un buscador por nombre.

Dada la lista,
cuando escribe parte del nombre de un colectivo y busca,
entonces ve solo los colectivos cuyo nombre contiene ese texto, sin importar mayúsculas ni tildes, y la búsqueda queda en la URL.

Dada una búsqueda sin coincidencias,
cuando termina de cargar,
entonces ve «No encontramos colectivos con ese nombre» y la opción de limpiar la búsqueda.

Dada la lista,
cuando toca «Pedir sumarme» en un colectivo,
entonces se envía la solicitud y la persona va a la pantalla de espera, que muestra ese pedido como «Pendiente».

Dada una persona con un pedido pendiente y sin contextos,
cuando abre cualquier ruta de la app, recarga o vuelve a ingresar,
entonces llega a la pantalla de espera y no a un panel.

Dada la pantalla de espera,
cuando el liderazgo ya la aceptó y la persona toca «Actualizar»,
entonces la app selecciona el contexto nuevo y la lleva a `/colectivo/resumen`.

Dada una persona con un pedido aceptado que ingresa de nuevo,
cuando vuelve de Logto,
entonces llega directo a `/colectivo/resumen`, sin pasar por Bienvenida ni por la espera.

Dada la pantalla de espera,
cuando la persona cancela su único pedido pendiente y confirma,
entonces vuelve a poder elegir entre crear un colectivo o unirse a otro.

Dada una persona cuyo pedido fue rechazado y no tiene otro pendiente,
cuando ingresa,
entonces vuelve a la elección entre crear o unirse, y en la pantalla de espera ve el pedido como «Rechazado».

Dada una persona en la lista que ya tiene un pedido pendiente en un colectivo,
cuando mira ese colectivo,
entonces ve «Pedido enviado» en lugar de «Pedir sumarme».

## Requisitos

### Rutas

| Ruta                           | Pantalla                                                         | Quién la ve                                        |
| ------------------------------ | ---------------------------------------------------------------- | -------------------------------------------------- |
| `/bienvenida`                  | Bienvenida con tres opciones: crear, unirse o colaboradora       | Con nombre y sin contextos, sin pedidos pendientes |
| `/bienvenida/colectivo/nuevo`  | Formulario de alta de colectivo (hoy en `/bienvenida/colectivo`) | Igual que Bienvenida                               |
| `/bienvenida/colectivo/unirme` | Lista de colectivos para pedir el ingreso (nueva)                | Con nombre y sin contextos                         |
| `/cuenta/solicitudes`          | Mis solicitudes, que funciona como pantalla de espera            | Con nombre                                         |

### Paso del registro

- `pasoDeRegistro` suma el paso `ESPERA`: nombre guardado, sin contextos y al menos una solicitud `PENDIENTE`.
- El paso sale del estado del back: `GET /auth/me` y, solo cuando la cuenta tiene nombre y no tiene contextos, `GET /auth/solicitudes-ingreso`. Nunca de variables de React.
- `GuardaDeRegistro` deja ver en el paso `ESPERA` solo `/cuenta/solicitudes`, `/bienvenida/colectivo/unirme`, `/cuenta/nombre` y la ruta del callback; cualquier otra lleva a `/cuenta/solicitudes`.
- En el paso `MODALIDAD` se suman `/bienvenida/colectivo/nuevo`, `/bienvenida/colectivo/unirme` y `/cuenta/solicitudes` a las rutas permitidas.
- Al ingresar con un único contexto válido y sin contexto actual, `AuthProvider` lo selecciona como hoy: así entra al panel quien fue aceptado.

### Bienvenida

- Durante el registro ofrece tres tarjetas: «Crear un colectivo» (`/bienvenida/colectivo/nuevo`), «Unirme a un colectivo» (`/bienvenida/colectivo/unirme`) y «Registrarme como colaboradora». No hay pantalla intermedia para elegir entre crear y unirse.
- «Crear un colectivo» y «Unirme a un colectivo» llevan el enlace «Elegir otro tipo de cuenta» que vuelve a `/bienvenida`.

### Lista de colectivos

- Usa `ListarColectivos` (`GET /colectivos`), ya disponible en `colectivoDependencies`. El back no devuelve colectivos dados de baja.
- Buscador por nombre con `<label>` real y botón «Buscar». El texto va en la URL (`?q=`) junto con la página (`?pagina=`); al cambiar la búsqueda vuelve a la página 1. Usa el paginador compartido.
- Cada tarjeta: nombre, tipo de colectivo, descripción con `TextoConFormato sinMarcas` recortada a una línea y enlace «Ver perfil» que abre el perfil público en una pestaña nueva.
- Acción «Pedir sumarme» por colectivo, con `useSolicitarIngreso`. Sin diálogo de confirmación: el pedido se puede cancelar.
- Después de pedir, navega a `/cuenta/solicitudes` con un aviso de éxito «Le avisamos a <colectivo>. Vas a entrar cuando te acepten.».
- Si el back responde 409 `SOLICITUD_PENDIENTE`, se muestra «Ya tenés una solicitud pendiente para este colectivo.» y el botón pasa a «Pedido enviado».

### Pantalla de espera (`MisSolicitudesPage`)

- Durante el registro el título es «Esperando que te acepten» y la bajada explica que va a entrar cuando el liderazgo apruebe un pedido.
- Mantiene la lista actual (pendientes primero, estado y fecha) y la cancelación con `DialogoDeConfirmacion`.
- Suma tres acciones:
  - «Actualizar»: recarga la cuenta y las solicitudes; si ya hay contexto, va al panel.
  - «Pedir sumarme a otro colectivo»: va a `/bienvenida/colectivo/unirme`.
  - «Crear mi propio colectivo»: va a `/bienvenida/colectivo/nuevo`.
- Fuera del registro (persona con contextos) la pantalla queda como hoy.

### Cabecera durante la espera

- Igual que en el resto del registro: sin navegación principal; en «Mi cuenta» quedan «Tu nombre», «Mis solicitudes» y «Cerrar sesión».

### Tests

- Regla `pasoDeRegistro` con el paso `ESPERA`.
- Flujo con back simulado: crear (líder) y unirse (pedido, espera, recarga, aceptación con «Actualizar», reingreso aceptado, cancelación, rechazo, 409).
- Ningún panel accesible durante la espera.
- `tests/e2e/sin-perfil/altaDeColectivo.spec.js` pasa por la elección nueva.
- Recorrido real front + API + MongoDB con dos cuentas: una pide, la otra (líder) acepta, y la primera entra al panel con rol `MIEMBRO`.

## Estados

- Cargando: skeleton de tarjetas en la lista y en la espera; «Verificando sesión…» mientras se calcula el paso.
- Con datos: tarjetas de colectivos; tarjetas de solicitudes.
- Vacío: lista sin colectivos → «Todavía no hay colectivos en Código a Voluntad» con «Crear mi propio colectivo».
- Sin resultados: búsqueda sin coincidencias → «No encontramos colectivos con ese nombre» con «Limpiar búsqueda».
- Error: `EstadoDeError` con «Reintentar» en la lista, en la espera y al calcular el paso.

## Decisiones (aprobadas el 14/11/2026)

- **Con buscador por nombre.** Requiere un cambio chico en el back (ver «Cambio en el back»), que se hace antes que el front.
- **Sin modalidad colaboradora durante la espera.** Para cambiar de idea, la persona cancela sus pedidos y vuelve a Bienvenida.
- **Sin aviso automático de aceptación.** La persona se entera al ingresar o con «Actualizar»; no hay sondeo ni notificaciones.

## Cambio en el back

- `GET /colectivos` acepta `q` opcional (texto, 1 a 80 caracteres después de recortar espacios), combinable con `etiqueta`, `page` y `limit`.
- Filtra por coincidencia parcial en `nombre`, sin distinguir mayúsculas ni tildes. El texto se escapa: nunca se interpreta como expresión regular.
- Sigue sin devolver colectivos dados de baja.
- Se documenta en el Swagger (`docs/openapi/rutas/colectivos.js`) y se prueba (coincidencia parcial, mayúsculas, tildes, caracteres especiales, combinado con etiqueta, `q` vacío → 400).
- El front suma `q` a `ListadoConEtiquetaRequest` y a `docs/PLAN-ENTIDADES.md`.

## Fuera de alcance

- Otros cambios en el back.
- Notificaciones de aceptación o rechazo.
- Pedir el ingreso desde el perfil público durante el registro: sigue disponible para cuentas que ya tienen contextos (spec 14).

## Criterio de aceptación

- Los escenarios pasan en los tests con back simulado y en el recorrido real con la API y MongoDB.
- Ninguna cuenta sin contexto llega a un panel, ni siquiera un instante al recargar.
- `npm run lint`, `npm test` y `npm run build` en verde, y el checklist de `docs/criterios-pantallas-web.md` revisado.
- Después: `/impeccable audit` y `/impeccable critique` sobre las tres pantallas, con sus hallazgos en una spec de revisión aparte.
