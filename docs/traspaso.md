# Traspaso entre chats

Estado del front al 06/11/2026, para seguir en otro chat. Se actualiza al cerrar cada spec.

## Cómo seguir

1. Abrir un chat nuevo y darle acceso a la carpeta del repo (`Desktop/codigo-a-voluntad-front`).
2. Pegar: "Leé `CLAUDE.md`, `docs/traspaso.md` y la spec que sigue, y seguimos como veníamos: spec primero, implementación después de aprobarla."

## Forma de trabajo acordada

- Una spec por tarea, con `specs/plantilla.md`. Se escribe, se aprueba y recién ahí se implementa.
- No hacer commits ni tocar git (los hace el equipo). Para mover specs, usar `mv`, no `git mv`.
- Verificar siempre sobre el repo completo: `npm run lint`, `npm run format:check`, `npm test` y `npm run build`.
- Revisar en el navegador con sesión simulada (`VITE_SESION_SIMULADA` en `.env`, ver README) y a 320 px.
- Decisiones nuevas, en `docs/decisiones.md`.

## Flujo por spec (desde el 06/11)

1. **Sesión de spec:** se escribe o revisa la spec y la persona la aprueba leyendo "A confirmar" y "A acordar con el back".
2. **Sesión de implementación, nueva:** se implementa solo lo escrito en la spec y se verifica (lint, format, tests, build, navegador a 320 px).
3. **Cada tanto, una ronda de Impeccable** en Claude Code sobre el repo: `/impeccable audit` y `/impeccable critique` en las pantallas hechas. Los hallazgos se juntan en una spec (`specs/active/revision-impeccable-NN.md`, con "Origen") y se implementan en otra sesión. Después, `/impeccable document` para actualizar `DESIGN.md`.

## Specs

- Hechas y cerradas (`specs/completed/`): base transversal, navegación y avisos, sesión simulada, landing pública (`00-landing.md`) y pie de página compartido (`pie-de-pagina-compartido.md`).
- Hechas, esperando acuerdos con el back (`specs/active/`): 01, 02, 03, 05 y 06. Cada una tiene su sección "A acordar con el back". La 06 (detalle del proyecto + postularse) absorbió la vieja spec `postularse-a-un-perfil.md`, ya borrada.
- Hecha, falta revisión en navegador: `specs/active/revision-impeccable-01.md` (54 requisitos; tandas 1 y 2 implementadas, lint, format, tests y build en verde). Sin ver en pantalla (la sesión no pudo abrir los servidores de Vite en el navegador): escritorio y 320 px de todo lo de la tanda 2, diálogos centrados (R44), orden de botones a 320 px (R46), foco tras postularse (R8) y tras cancelar "¿Cerrar sesión?" (R31), y los anillos de foco de R53. Después: `/impeccable document` y volver a correr `/impeccable audit` y `/impeccable critique`.
- Hecha, falta revisión en navegador: `specs/active/04-mis-proyectos.md` (inicio del colectivo, listado, alta en tres pasos y franja de dueño). Lint, format, tests (412) y build en verde; verificados en una copia Linux porque el `node_modules` del repo es de Windows. Revisada en el navegador el 06/11 (sesión de colectivo, comedor …44f): listado en escritorio y a 320 px sin scroll horizontal, alta completa con un perfil (publica, lleva al detalle con la franja de dueño), indicador compacto del paso 1 a 320 px y consola sin avisos. Sin ver: recorrido solo con teclado, alta y detalle completos a 320 px, y el detalle visto por otro colectivo. Quedó en la base un proyecto de prueba, "PRUEBA – borrar" (id `6aee26b4cdfdac480a14535b`), para borrar desde el back. El listado devuelve los proyectos con el más nuevo al final: acordar con el back que vengan del más nuevo al más viejo. Quedan sus "A acordar con el back": `colaboraciones`/`perfiles` en el listado, paginación, título corto de perfil, zona horaria y "hoy", orden del listado.
- Pendientes (`specs/backlog/`): 04b (administrar un proyecto: edición, perfiles y cierre, separada de la 04), 07, 08, 09, 10, 11 y 12.
- Revisión Impeccable 02 — hecho. `specs/active/revision-impeccable-02.md` queda en active por los dos acuerdos con el back. Lint, formato, 426 tests y build en verde sobre este repo. La suite pasó con la configuración habitual y con `VITEST_MAX_WORKERS=2`; en dos repeticiones con el paralelismo habitual hubo timeouts intermitentes de 5 s en los tests de alta de proyecto. En Edge se verificaron los tres roles a 1280, 360 y 320 px, con controles de cabecera de al menos 44×44 px y sin desborde. Ana vio tarjetas con y sin sello en «Todos los proyectos». Se revisaron el diálogo manual con la base local y los dos modos automáticos con una respuesta simulada en el navegador a 1280 y 320 px, sin enviar postulaciones. Nueva critique: 32/40 (antes 28/40), en `.impeccable/critique/2026-11-06T19-24-07Z__src-presentation.md`.
- Revisión Impeccable 03 — hecho (R1–R5). `specs/active/revision-impeccable-03.md` queda en active solo por la identificación del colectivo pendiente del back. Grilla inerte durante paginación, cinco pantallas de alta/edición diferidas con espera y recuperación, temas junto al buscador, histórico desplegable y «Colaboración sin remuneración». Lint, formato, 439 tests en 34 archivos con `VITEST_MAX_WORKERS=1` y build en verde; con paralelismo habitual reaparecieron dos timeouts de 5 s en tests de alta y uno más con dos workers durante checks concurrentes. Una corrida anterior con dos workers pasó. La suite emite avisos `act(...)` en pruebas existentes de navegación/sesión. Navegador integrado Chromium a 1280 y 320 px: datos locales y respuestas simuladas documentados por separado en la spec; sin publicar ni modificar la base. Producción inicial: 556,57 → 506,15 kB minificados; 173,49 → 162,32 kB gzip, contando el compartido precargado. Descargas comprobadas por registro HTTP; rutas privadas con build aislado de QA e identidad falsa fuera del repo. El build entregable no contiene esa sesión. Flujo `/impeccable document` aplicado: `DESIGN.md` y `.impeccable/design.json` actualizados. No se repitieron audit ni critique.
- Orden de las pantallas: 04 y revisiones Impeccable 02/03 hechas → 04b (administrar un proyecto) → 09 → 10 → 08 → 12 → 07 → 11.

- Landing pública — hecho. Spec cerrada en `specs/completed/00-landing.md`. `/` presenta la plataforma a visitantes y deriva las cuentas confirmadas a su inicio por rol; `/proyectos` conserva el buscador. Contenido estático sin pedidos al back ni carga anticipada de formularios. Navegador a 1280 y 320 px, teclado, registro y recarga de producción con API indisponible verificados. Lint, formato, 447 tests en 35 archivos con un worker y build en verde. Revisión final Impeccable `ship`; `/impeccable document` alineó `DESIGN.md` y su sidecar. Se respetaron las superficies blancas actuales del repo. El cierre de sesión usa navegación síncrona a la portada para evitar una redirección intermedia a login. No se publicaron datos ni se desplegó.

- Pie de página compartido — hecho. `PieDePagina` se monta una sola vez en `Raiz`, fuera del proveedor de sesión, con el mismo contenido en todas las rutas y roles, incluidos login, 404 y error global de sesión. Nombre, descripción, referencia académica y «Cómo funciona». Compactado con la referencia horizontal aportada: una fila de tres bloques y 16px verticales, unos 85px de alto a 1280px; a 320px se apila sin desborde. Estilo unificado con el header por pedido de la persona: fondo petróleo, texto y foco crema de marca, misma tipografía y peso de marca y tratamiento de enlaces. Este enlace abre `/#como-empezar` también con sesión y enfoca la sección; `/` sin fragmento sigue llevando al inicio del rol. Pie en flujo normal, al borde inferior en páginas cortas; verificado a 1280 y 320 px. Lint, formato, 458 tests en 35 archivos con un worker y build en verde. Spec cerrada en `specs/completed/pie-de-pagina-compartido.md`; DESIGN y sidecar actualizados.

- Integración con Logto React y accesos directos — hecho en frontend. Migración a `@logto/react` 4.1.3 aprobada expresamente; se eliminó la dependencia directa de `@logto/browser`. Un único provider y los hooks del SDK quedan en `Infrastructure/Auth/SesionLogtoProvider.jsx`, accesible por Dependencies. `AuthProvider` conserva `/auth/me`, cuenta, permisos, 401 y simulación. Header con «Ingresar» y «Crear una cuenta» directos, retorno con filtros y fragmento, espera y reintento; a 320px segunda fila de accesos sin desborde y avisos 8px debajo de la altura real del header. `/login` y `/registro` conservan sus acciones en el contenido. Spec `specs/active/integracion-logto-react.md`; permanece activa por la configuración y los acuerdos del back. Lint, formato y build en verde; 475 tests en 36 archivos con un worker; navegador Chromium a 1280 y 320px, foco visible, error sin tenant y flujo simulado SIN_PERFIL (callback, Bienvenida y cierre). No se crearon perfiles ni se modificó la base. Playbook `/impeccable document` aplicado a Navigation y Avisos de DESIGN y al ejemplo de cabecera del sidecar. Pendiente: tenant real, acordar con Facundo `/callback` (su ZIP usa `/logto/callback`) y `VITE_LOGTO_RECURSO` (su ZIP usa `VITE_LOGTO_API_RESOURCE`), contrato `/auth/me`, validación JWT y asociación de perfil por `sub`. No hay endpoint ni app ID configurados: la autenticación real no está verificada.

## Pantallas hechas

- Ingreso y registro sin tenant — hecho. El header abre `/login` o `/registro` con los campos deshabilitados, un mensaje claro y un enlace a proyectos. Ya no muestra el aviso genérico al elegir un acceso. Con tenant o sesión simulada se conserva el recorrido directo. Verificado a 1280 y 320px; lint, formato, 476 tests y build en verde.

`/` (landing pública), `/proyectos`, `/proyectos/:id`, `/login`, `/registro`, `/callback`, `/bienvenida`, `/bienvenida/colectivo`, `/bienvenida/colaboradora`, `/colectivo/perfil`, `/colectivo/proyectos`, `/colectivo/proyectos/nuevo`, `/colectivos/:id`, `/colaboradora/perfil`, `/colaboradoras/:id`, `/habilidades` (ejemplo), `/sin-permiso` y 404.

## Piezas para reusar

- **Datos:** `useAsync` (la tarea siempre memorizada con `useCallback`, y nunca objetos literales como valor por defecto de un hook).
- **Avisos y sesión:** `useAvisos` y `useAuth`.
- **Rutas y navegación:** `ProtectedRoute` y `useAvisoCambiosSinGuardar`.
- **Proyecto y postulación:** `useProyecto`, `usePostulacionesEnProyecto` y `usePostularse` (hooks); `PerfilDelProyecto`, `AccionDePerfil` y `DialogoDePostulacion` en `Components/Proyecto/`. `ConfirmDialog` acepta `children` y `MensajeDePantalla`, `volverA` y `textoVolver`.
- **Componentes de `Components/App/`:**
  - Estructura: `Raiz` y `PieDePagina` para el pie común; no duplicarlo en páginas o layouts internos.
  - Estados: `Skeleton`, `EmptyState`, `ErrorState`, `MensajeDePantalla`.
  - Diálogos y listas: `ConfirmDialog` (con `permanente`), `Paginacion`.
  - Formularios: `Boton`, `Chip`, `Campo`, `Selector`, `GrupoDeOpciones`, `Casilla`.
- **Formularios compartidos:** editores de listas y `SelectorDeHabilidades` en `Components/Formulario/`.
- **Alta de proyecto y listado propio:** `IndicadorDePasos`, `FranjaDeDueno`, `TarjetaProyecto` con `propia`, `useProyectosDelColectivo`, `useCrearProyecto`, `useEsDuenoDelProyecto`, y `validarProyecto`/`formularioProyecto` en `Components/Proyecto/`.
- **Formatos:** en `Presentation/Formatos/` (colectivo, colaboradora, proyecto).
- **Tests:** `src/test/montarRutas.jsx` monta rutas con data router, sesión y avisos.

## Pendientes con el back (resumen)

- `GET /auth/me`, la validación del JWT de Logto y que las altas asocien el perfil al `sub`.
- Un título corto por perfil (`PerfilDto.titulo`).
- El colectivo dentro de `ProyectoDto`, y el estado de la búsqueda por perfil.
- Filtros de proyectos (estado, habilidad, tipo, ubicación, modalidad).
- Que `GET /colectivos/:id` no devuelva los medios de contacto a terceros.
- `GET /colaboradores/:id/medios-de-contacto`, solo para la dueña.
- Que la dueña reciba también sus postulaciones anónimas.
- Que el 409 por postulación repetida sea por perfil y no por proyecto.
- Nombres de provincias, largos máximos y formato de `cuentaGit`.
