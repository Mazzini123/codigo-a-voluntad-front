# Buscar proyectos

Origen: `specs/backlog/05-buscar-proyectos.md`, `docs/plan-front.md` §1, §4 y §5, `DESIGN.md` (tarjeta de proyecto, sello de estado y chips) y `docs/PLAN-ENTIDADES.md` (Proyecto y Reclutamiento).

## Intención

Que cualquier persona encuentre proyectos donde aportar, y que una colaboradora vea primero los que encajan con sus habilidades. Es la entrada de la app (`/` lleva acá) y la primera pantalla con el patrón de tienda online de la consigna: buscador arriba, tarjetas como productos y paginación.

## Escenarios

Dado una colaboradora con sesión,
cuando entra a `/proyectos`,
entonces ve la vista "Para vos" con los proyectos que encajan con sus habilidades, cada uno con "Tenés 2 de 3 habilidades requeridas" y una tilde en los chips de las habilidades que tiene.

Dado una colaboradora en "Para vos",
cuando elige "Todos los proyectos",
entonces ve el listado general, con el encaje marcado igual, y la URL lo recuerda (`?vista=todos`).

Dado cualquier persona,
cuando escribe una etiqueta en el buscador,
entonces la lista se actualiza sola al dejar de escribir (o al apretar Enter), la etiqueta queda en la URL (`?etiqueta=educacion`) y vuelve a la página 1.

Dado una etiqueta sin resultados,
cuando termina la búsqueda,
entonces ve "No encontramos proyectos con la etiqueta «xyz»" y el botón "Limpiar búsqueda".

Dado una búsqueda en la página 3,
cuando entra a un proyecto y vuelve con "atrás",
entonces conserva la etiqueta, la página y la posición del scroll.

Dado un enlace compartido (`/proyectos?etiqueta=salud&pagina=2`),
cuando otra persona lo abre,
entonces ve la misma búsqueda.

## Requisitos

### Datos

- **Listado general:** `ListarProyectos` (`GET /proyectos`) con `{ page, limit: 12, etiqueta }`.
- **"Para vos":** `BuscarProyectosPotenciales` (`GET /colaboradores/:perfilId/proyectos-potenciales`) con `{ page, limit: 12 }`. No acepta etiqueta.
- **Habilidades de la colaboradora:** `ObtenerColaborador` con su `perfilId`, una vez por pantalla, para marcar el encaje en las tarjetas.
- **Colectivo de cada proyecto:** `ProyectoDto` no trae el colectivo que lo publica, y la tarjeta no lo muestra ni lo deduce hasta que el back lo sume (`DESIGN.md`).

### URL (`useSearchParams`, la única fuente de verdad)

- **`vista`:** `para-vos` o `todos`. Solo existe para colaboradoras, y por defecto es `para-vos`. Para el resto de las personas se ignora.
- **`etiqueta`:** texto. Escribir una etiqueta lleva la vista a `todos`, porque "Para vos" no filtra.
- **`pagina`:** entero ≥ 1. Un valor inválido es 1. Se borra de la URL al cambiar la etiqueta o la vista.
- **Historial:** mientras se escribe se usa `replace` con 400 ms de espera, para no llenar el historial. Al cambiar de página o de vista se usa `push`, así "atrás" vuelve a la página anterior.
- **Página fuera de rango:** si el back responde sin resultados para una página mayor que `total_pages`, se navega con `replace` a la última página que existe (`criterios-pantallas-web.md` §8).

### Pantalla (`Pages/ProyectosPage.jsx`, ruta `/proyectos`, pública)

- **Encabezado:** `h1` "Proyectos que buscan colaboradoras", en la tipografía Display (es la única pantalla que la usa), y una línea en tinta suave: "Sumate con lo que sabés hacer a proyectos de colectivos sociales.".
- **Buscador:** un `role="search"` arriba de los resultados. Tiene el campo "Buscar por etiqueta" (`type="search"`) con la ayuda "Por ejemplo: educación, salud, ambiente." y, si hay texto, el botón secundario "Limpiar". No hay botón "Buscar": se aplica solo (`criterios-pantallas-web.md` §5).
- **Selector de vista** (solo para colaboradoras): dos enlaces con aspecto de pestañas, "Para vos" y "Todos los proyectos", con `aria-current="page"` en el activo. Son enlaces y no botones porque cambian la URL.
- **Resultados:**
  - "Mostrando 13–24 de 40 proyectos", con cifras tabulares.
  - La grilla `repeat(auto-fill, minmax(320px, 1fr))` con 24 px de separación, como `<ul>` de tarjetas.
  - `Paginacion` debajo. Al cambiar de página, el foco va al título de los resultados (`h2` oculto "Resultados").
- **`ScrollRestoration`** del data router, en `Raiz`. Restaura el scroll al volver con "atrás" y lo lleva arriba al entrar a una pantalla nueva.

### Tarjeta (`Components/Proyecto/TarjetaProyecto.jsx`), según `DESIGN.md` → Tarjeta de proyecto

- **Estructura:** `<article>` dentro de `<li>`. El título (`h3`, petróleo) es el único enlace, va a `/proyectos/:id` y su área se estira a toda la tarjeta. El foco dibuja el anillo alrededor de la tarjeta entera (`:focus-within`).
- **Descripción:** cortada a tres líneas.
- **Habilidades:** las requeridas de los perfiles abiertos, sin repetir, como `Chip` de tipo `"requerida"`, hasta 4 y después "+2 más" en texto. Con sesión de colaboradora, las que tiene llevan `laTenes`.
- **Pie:**
  - "2 perfiles abiertos" o "1 perfil abierto".
  - El compromiso y la modalidad del perfil abierto que cierra antes, legibles: "5 h por mes · Gratuita". Se forman con `Formatos/proyecto.js`.
  - El sello de ese mismo perfil.
- **Sello de estado** (`Components/Proyecto/SelloDeBusqueda.jsx`), con ícono y texto:
  - "Abierta hasta el 30/11", en éxito, si `busquedaAbierta` y la fecha no pasó.
  - "Abierta", en éxito, si no tiene fecha de cierre.
  - "Límite alcanzado", en aviso, si `limiteColaboraciones` se alcanzó (ver "A acordar con el back").
  - "Cerrada", en neutro, si la búsqueda no está abierta o la fecha pasó.
  - "Finalizado", en neutro, si el proyecto está `FINALIZADO`. Reemplaza al pie de compromiso.
- **Encaje** (solo colaboradora): una franja en coral tenue arriba del pie con "Tenés 2 de 3 habilidades requeridas", tomando el perfil abierto con mejor proporción. Con 0 de N no se muestra.
- **Hover:** borde petróleo y sombra de respuesta, en 150 ms. Sin imagen, sin íconos decorativos y sin tarjetas anidadas.
- **Formatos** (`Formatos/proyecto.js`):
  - `textoCompromiso`: "5 h por mes", "10 h por semana", "20 h en total".
  - `textoModalidad`: "Gratuita", "Con incentivo económico", "Con posibilidad de contratación".
  - `fechaCorta`: "30/11", con `Intl.DateTimeFormat("es-AR")`.
  - `estadoDeBusqueda(perfil, proyecto, hoy)`.

  Así no se muestra ningún enum.

### Navegación

- **`/`:** redirige a `/proyectos`.
- **Inicio de la colaboradora:** pasa a ser `/proyectos`. El del visitante también; el del colectivo sigue en su perfil hasta la spec 04.
- **Cabecera:** "Proyectos" es el primer enlace, para todos.

## Estados

- **Cargando:** seis tarjetas skeleton en escritorio y dos en celular, con la forma de la tarjeta real (título, tres líneas y tres chips). Aparecen después de 300 ms.
- **Con datos:** grilla, conteo y paginación. Al cambiar de página se conservan las tarjetas viejas con `aria-busy` hasta que llegan las nuevas.
- **Vacío** (sin etiqueta y sin proyectos): "Todavía no hay proyectos publicados.".
- **"Para vos" vacío:** "Todavía no hay proyectos que encajen con tus habilidades.", con los enlaces "Ver todos los proyectos" y "Sumar habilidades" (a `/colaboradora/perfil`).
- **Sin resultados** (con etiqueta): "No encontramos proyectos con la etiqueta «xyz»." y el botón "Limpiar búsqueda".
- **Error:** `EstadoDeError` "No pudimos cargar los proyectos" con "Reintentar", en el lugar de la grilla, sin borrar el buscador. Si falla solo la carga de las habilidades de la colaboradora, las tarjetas se muestran sin encaje.

## A acordar con el back

- **Colectivo en `ProyectoDto`** (nombre y provincia), para la tarjeta.
- **Estado de la búsqueda por perfil.** Hoy el front calcula "Límite alcanzado" contando las colaboraciones `ACEPTADA` del perfil contra `limiteColaboraciones`. El plan pide no calcular reglas en el front. Propongo que `PerfilDto` traiga `colaboracionesAceptadas` o directamente `estadoBusqueda`.
- **Filtrar por `estado`** (ocultar finalizados por defecto) y por **habilidad, tipo de colectivo, ubicación y modalidad**, como pide el plan para los filtros. Hoy solo filtra por etiqueta.
- **El orden de `proyectos-potenciales`:** ¿de mayor a menor encaje?
- **¿La etiqueta coincide exacta o por contenido?** ¿Distingue tildes?

## A confirmar

- **"Para vos" y "Todos" como dos vistas.** Son dos endpoints distintos con su propia paginación y no se pueden mezclar en una sola lista ordenada. La alternativa es mostrar solo el listado general con el encaje marcado.
- **Buscador arriba y no columna de filtros.** Con un único filtro (etiqueta), la columna lateral de 280 px de `DESIGN.md` quedaría casi vacía. Se arma cuando el back sume filtros.
- **Finalizados visibles, con su sello.** Ocultarlos en el front rompería el conteo y la paginación del back.
- **La tarjeta enlaza a `/proyectos/:id`, que entrega la spec 06.** Hasta entonces lleva a la 404. Propongo hacer la 06 a continuación y desplegarlas juntas.

## Fuera de alcance

- Detalle del proyecto (spec 06).
- Filtros que el back no soporta.
- Mapa y proyectos destacados.

## Criterio de aceptación

- Recargar o compartir la URL muestra la misma búsqueda. "Atrás" vuelve a la página y al scroll anteriores.
- Funciona a 320 px sin scroll horizontal, y con teclado: buscador, vistas, tarjetas y paginación.
- El encaje y los sellos se ven con texto e ícono, no solo con color.
- `npm run lint`, `npm run format:check`, `npm test` y `npm run build` en verde sobre el repo completo, y el checklist de `docs/criterios-pantallas-web.md` revisado.
