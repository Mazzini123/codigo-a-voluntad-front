# Revisión Impeccable 01: pantallas hechas

Origen: audit y critique de las pantallas hechas del 06/11/2026

## Intención

Corregir lo que encontraron `/impeccable audit` y `/impeccable critique` en las pantallas ya construidas (specs 01, 02, 03, 05 y 06 y las bases cerradas), para que cumplan `DESIGN.md`, `docs/criterios-pantallas-web.md` y "No se negocia" de `CLAUDE.md` antes de sumar pantallas nuevas. Lo más importante: el foco con teclado se pierde en varios recorridos, los diálogos aparecen pegados arriba a la izquierda, llegan mensajes crudos del back a la pantalla, las etiquetas se confunden con las habilidades requeridas y "Habilidades" (la pantalla de ejemplo, con alta) aparece en la navegación de todos los roles.

Es para todos los roles: visitante, colaboradora, colectivo y cuenta sin perfil.

Cómo se hizo la revisión:

- **Navegador:** cada pantalla con la sesión que le corresponde, en escritorio (1280 px) y a 320 px, con teclado (Tab, Shift+Tab, Enter, Esc) y en los estados que se pudieron ver (con datos, vacío, sin resultados, error con el back apagado, validación de formularios, diálogos y avisos).
- **Critique en dos evaluaciones aisladas:** A revisó el diseño contra el código; B corrió el detector de Impeccable (`impeccable detect`, **0 hallazgos**) y un barrido técnico. `npm run lint` dio verde.
- **Puntajes:** audit 17/20 (Bueno); critique 27/40 en Nielsen (Aceptable, en el límite con Bueno).
- **Fuente de cada hallazgo:** "audit" (técnico: accesibilidad, rendimiento, theming, responsive), "critique" (diseño y heurísticas) o los dos. "En navegador" significa que se reprodujo en pantalla; "en código" significa que se detectó leyendo el código y no se pudo reproducir con los datos de prueba.

## Escenarios

Dado que una persona usa solo el teclado en `/proyectos`,
cuando abre un proyecto desde una tarjeta con Enter,
entonces el foco queda en el título del proyecto apenas termina de cargar, y no en el `body`.

Dado que una colaboradora está en el detalle de un proyecto,
cuando abre "Postularme" en cualquier ancho,
entonces el diálogo aparece centrado, el título del diálogo se lee entero sin desplazarse y Esc lo cierra devolviendo el foco a "Postularme".

Dado que una colaboradora se postula con éxito,
cuando el diálogo se cierra,
entonces el foco va al sello "Tu postulación está pendiente" (o al título del perfil) y no se pierde.

Dado que el back responde un 400 o un 409 con un `message` propio,
cuando la persona ve el error,
entonces lee un texto escrito por el front según el status o el código, nunca el texto del back.

Dado un visitante en el detalle de un proyecto,
cuando mira las etiquetas y las habilidades requeridas,
entonces las distingue a simple vista: las etiquetas no tienen la forma de los chips de habilidad.

Dado un visitante, una colaboradora o un colectivo,
cuando mira la cabecera,
entonces no ve "Habilidades" ni ninguna opción para crear habilidades.

Dado un visitante en `/proyectos`,
cuando escribe una etiqueta que no tiene resultados,
entonces el lector de pantalla anuncia "No encontramos proyectos con la etiqueta «…»" sin que tenga que ir a buscarlo.

## Requisitos

Cada hallazgo indica dónde (URL, ancho y elemento), qué pasa, severidad, comando que lo detectó, corrección propuesta y cómo se verifica. Las rutas de archivo son relativas a `src/`.

### Por pantalla

#### `/proyectos` (búsqueda)

**R1. "Sin resultados" no se anuncia. — hecho** Severidad: **mayor**. Detectó: audit (en navegador).

- **Dónde:** `/proyectos?etiqueta=python`, escritorio y 320 px, región de resultados.
- **Qué pasa:** al escribir en el buscador cambia la lista (o aparece "No encontramos proyectos con la etiqueta «python».") y "Mostrando X–Y de N" desaparece, pero ninguna región `aria-live` lo dice. La única `role="status"` de la página es la de avisos y queda vacía. Quien usa lector de pantalla escribe y no sabe qué pasó.
- **Corrección:** una región `role="status"` propia de los resultados con el conteo ("2 proyectos", "No encontramos proyectos con la etiqueta «python»"), que se actualice cuando llega la respuesta, no en cada tecla.
- **Verificación:** test que escribe una etiqueta y espera el texto dentro de `role="status"`; con NVDA, se oye el conteo después del debounce.
- **Respaldo:** criterios §13 "Accesibilidad en React" (`aria-live` para cambios dinámicos).

**R2. Tres controles para limpiar la búsqueda. — hecho** Severidad: **menor**. Detectó: critique (en navegador).

- **Dónde:** `/proyectos?etiqueta=…`, escritorio: la cruz nativa del `input type="search"`, el botón "Limpiar" al lado del campo y "Limpiar búsqueda" en el estado sin resultados.
- **Qué pasa:** tres controles con el mismo destino, y la cruz nativa no sigue el sistema de diseño.
- **Corrección:** ocultar la cruz nativa (`::-webkit-search-cancel-button`) y dejar "Limpiar" junto al campo; en "sin resultados", mantener "Limpiar búsqueda" como la única acción del estado.
- **Verificación:** con una etiqueta escrita, solo se ven "Limpiar" y, si no hay resultados, "Limpiar búsqueda".
- **Respaldo:** criterios §4 "Una acción, un lugar".

**R3. Estados vacíos incompletos. — hecho** Severidad: **menor**. Detectó: critique (vacío general en código; "Para vos" en navegador).

- **Dónde:**
  - `/proyectos` sin proyectos: "Todavía no hay proyectos publicados." no tiene descripción ni acción (`Pages/ProyectosPage.jsx:232`).
  - `/proyectos` en "Para vos" vacío (colaboradora, 320 px): ofrece dos acciones con forma de enlace, "Ver todos los proyectos" y "Sumar habilidades" (`ProyectosPage.jsx:221-228`, clase `.enlaceBoton`).
  - Los títulos de los tres vacíos terminan con punto (`ProyectosPage.jsx:207, 218, 232`).
- **Corrección:**
  - Vacío general: una línea que explique ("Cuando un colectivo publique un proyecto, va a aparecer acá.").
  - "Para vos": una sola acción con forma de botón secundario ("Ver todos los proyectos") y "Sumar habilidades" como enlace en el texto.
  - Títulos sin punto final.
- **Verificación:** test de cada vacío con su título, su texto y una sola acción con `role="button"` o enlace con clase de botón.
- **Respaldo:** `DESIGN.md` → "Estado vacío" (una sola acción); criterios §2 "Vacío".

**R4. El conteo aparece dos veces y la paginación no tiene números. — hecho** Severidad: **menor**. Detectó: critique (en código; con 3 proyectos no hay segunda página).

- **Dónde:** `Pages/ProyectosPage.jsx:180-182` ("Mostrando X–Y de N proyectos") y `Components/App/Paginacion.jsx:23-25` ("· N proyectos").
- **Corrección:** dejar el conteo solo arriba de la grilla, y en la paginación anterior, siguiente y pocos números alrededor de la página actual, con la actual resaltada y `aria-current="page"`.
- **Verificación:** test de `Paginacion` con 5 páginas en la 3: se ven 2, 3 y 4, con la 3 marcada.
- **Respaldo:** criterios §8 "Paginación".

**R5. Al cambiar de página no se ve que está cargando, y el foco va a un título oculto. — hecho** Severidad: **menor**. Detectó: critique (en código).

- **Dónde:** `Pages/ProyectosPage.jsx:102-103, 120-127, 142, 178` y `ProyectosPage.module.css:95-102`.
- **Qué pasa:**
  - La consulta no incluye la página, así que al tocar "Siguiente" quedan las tarjetas viejas solo con `aria-busy`, sin ninguna señal visible.
  - El foco va al `h2` "Resultados", que está visualmente oculto: el anillo no se ve.
- **Corrección:** atenuar la grilla y mostrar "Cargando página N…" visible mientras llega la respuesta; llevar el foco al texto visible "Mostrando X–Y de N".
- **Verificación:** con la red lenta (DevTools), "Siguiente" muestra el indicador y el foco queda visible sobre el conteo.
- **Respaldo:** criterios §2 "Cargando o enviando"; §9 "foco visible y nunca tapado".

**R6. Escribir en el buscador saca de "Para vos" sin avisar. — hecho** Severidad: **menor**. Detectó: critique (en código).

- **Dónde:** `Hooks/useParametrosDeBusqueda.js:17-20, 40`, colaboradora.
- **Corrección:** una ayuda debajo del campo cuando la vista es "Para vos": "La búsqueda por etiqueta se hace sobre todos los proyectos."
- **Verificación:** en "Para vos" se ve la ayuda, vinculada con `aria-describedby`.

**R7. La tarjeta muestra el encaje en proyectos a los que la colaboradora ya se postuló. — hecho** Severidad: **menor**. Detectó: critique (en navegador).

- **Dónde:** `/proyectos?vista=todos`, colaboradora, tarjeta "Sistema de turnos y stock para el comedor": dice "Tenés 1 de 1 habilidad requerida" aunque su postulación a ese perfil está pendiente.
- **Corrección:** si la colaboradora ya tiene una postulación en el proyecto, la franja dice "Ya te postulaste" (en lugar del encaje), con los datos que el front ya tiene de sus colaboraciones públicas.
- **Verificación:** test de la tarjeta con una postulación pendiente.

#### `/proyectos/:id` (detalle y postulación)

**R8. El foco se pierde después de una postulación exitosa. — hecho** Severidad: **mayor**. Detectó: critique (en código; en navegador no se envió la postulación para no crear más datos).

- **Dónde:** `Components/App/DialogoDeConfirmacion.jsx:31-34`, `Pages/ProyectoPage.jsx:112-115` y `Components/Proyecto/AccionDePerfil.jsx:38-39`.
- **Qué pasa:** después de postularse, "Postularme" se reemplaza por el sello, y el diálogo devuelve el foco al botón que ya no existe: el foco cae en `body`.
- **Corrección:** que `DialogoDeConfirmacion` acepte un destino de foco al cerrar, y llevarlo al sello "Tu postulación está pendiente" o al `h3` del perfil.
- **Verificación:** test que se postula con teclado y espera `document.activeElement` en el sello; prueba manual con Tab después del aviso.
- **Respaldo:** criterios §9 Teclado y §13 "Llevá el foco con `useRef`"; spec 06, criterio de aceptación del diálogo.

**R9. A 320 px el título del diálogo de postulación queda fuera de la vista. — hecho** Severidad: **mayor**. Detectó: audit y critique (en navegador).

- **Dónde:** `/proyectos/:id`, 320 × 700, diálogo "¿Te postulás a «…»?".
- **Qué pasa:** el título repite la descripción completa del perfil ("¿Te postulás a «Desarrollo de la API de donaciones con Node.js y su documentación para que otras voluntarias puedan seguirla.»?"). El diálogo mide 660 px de alto con 716 px de contenido, abre con scroll propio y el foco en "Cancelar", abajo, así que el título queda cortado arriba. Lo mismo pasa con el `h3` de cada perfil, que es la descripción entera.
- **Corrección:** título corto ("¿Te postulás a este perfil?") con la descripción del perfil debajo, cortada a dos líneas; en el `h3` del perfil, cortar la descripción a dos líneas con el texto completo debajo.
- **Verificación:** a 320 × 700, al abrir el diálogo se leen el título y los botones sin desplazar.

**R10. "Tu postulación fue rechazada" sale en neutro. — hecho** Severidad: **menor**. Detectó: critique (en código).

- **Dónde:** `Components/Proyecto/AccionDePerfil.jsx:20-23` usa el tipo `CERRADA`.
- **Corrección:** un tipo "rechazada" con el color `peligro`, fondo `peligro-tenue` e ícono de cruz.
- **Verificación:** test del sello con una postulación `RECHAZADA`.
- **Respaldo:** `DESIGN.md` → Estados (peligro para "rechazada"); spec 06.

**R11. La pantalla no tiene acción destacada. — hecho** Severidad: **menor**. Detectó: critique (en navegador).

- **Dónde:** `/proyectos/:id`, todos los roles: "Postularme" es secundario (`AccionDePerfil.jsx:44, 67`), como decidió la spec 06. `DESIGN.md` → Buttons lo nombra como primario y `PRODUCT.md` pide que sea "bien visible".
- **Corrección:** **Decidido (06/11):** mantener todos secundarios y actualizar `DESIGN.md` → Buttons para que diga que "Postularme" es secundario y que el coral queda para "Enviar postulación" dentro del diálogo. Queda escrito en `docs/decisiones.md`.
- **Verificación:** la pantalla tiene a lo sumo un botón coral, y `DESIGN.md` coincide con el código.
- **Respaldo:** criterios §1 "Elegí una acción principal por pantalla" y §6 "Un solo elemento destacado".

**R12. "Postularme" del visitante lleva a ingresar sin explicación. — hecho** Severidad: **menor**. Detectó: critique (en navegador).

- **Dónde:** `/proyectos/:id`, visitante: "Postularme" es un enlace a `/login` (`AccionDePerfil.jsx:49-58`). El colectivo no ve nada en ese lugar (línea 37).
- **Corrección:** debajo del enlace, en body small: "Ingresá como colaboradora para postularte." Para el colectivo: "Las postulaciones son para colaboradoras."
- **Verificación:** test por rol del texto debajo de la acción.
- **Respaldo:** `PRODUCT.md`, principio 3 ("El estado siempre explicado").

**R13. Fecha de publicación sin año. — hecho** Severidad: **menor**. Detectó: audit (en navegador).

- **Dónde:** `/proyectos/:id`, "Abierto · Publicado el 6/11" (`Pages/ProyectoPage.jsx:130-136`); la fecha larga está solo en `title`.
- **Corrección:** "Publicado el 6 de noviembre de 2026" con `Intl.DateTimeFormat("es-AR", { dateStyle: "long" })`. Los sellos de los perfiles siguen con la fecha corta.
- **Verificación:** test del formato.
- **Respaldo:** criterios §8 "Formateá para personas".

**R14. El estado del proyecto va en texto plano y el avance muestra 0 % sin avances. — hecho** Severidad: **menor**. Detectó: critique (en navegador).

- **Dónde:** `/proyectos/:id`, escritorio y 320 px.
- **Qué pasa:**
  - "Abierto" va como texto suelto, mientras que los perfiles usan el sello de estado.
  - Con `avances` vacío se muestra "Avance: 0 %" con una barra vacía, que parece un proyecto parado.
- **Corrección:**
  - El estado del proyecto con el mismo sello de los perfiles ("Abierto", "Finalizado").
  - Sin avances cargados: "Todavía no cargó avances", sin barra.
  - De paso, `block-size: 12px` de `ProyectoPage.module.css:23` pasa a `var(--espacio-3)` (único px suelto del repo, audit).
- **Verificación:** test con un proyecto sin avances.

**R15. La acción del perfil desaparece mientras cargan las postulaciones. — hecho** Severidad: **menor**. Detectó: critique (en código).

- **Dónde:** `Pages/ProyectoPage.jsx:99-100, 184`.
- **Qué pasa:** el botón se monta tarde y la página salta.
- **Corrección:** reservar el alto de la acción con un skeleton de botón de 44 px.
- **Verificación:** con la red lenta, la tarjeta del perfil no cambia de alto.

**R16. Perfiles largos y densos en celular, y sin encaje en el detalle. — hecho** Severidad: **menor**. Detectó: critique (en navegador).

- **Dónde:** `/proyectos/:id`, 320 px, cada perfil (`Components/Proyecto/PerfilDelProyecto.jsx:33-93`).
- **Qué pasa:** sello, requeridas, opcionales, cuatro pares de datos apilados, "Quiénes colaboran" y la acción al pie: unos 900 px por perfil. Además, el encaje ("Tenés 2 de 3"), que sí está en la tarjeta, no aparece en el detalle.
- **Corrección:** los cuatro datos (compromiso, modalidad, límite y aceptación) en una grilla de dos columnas desde 320 px; el encaje del perfil arriba de la acción, con la misma franja de la tarjeta.
- **Verificación:** a 320 px, un perfil entra en menos de 1,5 pantallas y la colaboradora ve su encaje.

#### `/colectivos/:id` y `/colaboradoras/:id` (perfiles públicos)

**R17. Los proyectos del colectivo no tienen enlace. — hecho** Severidad: **mayor**. Detectó: critique (en navegador).

- **Dónde:** `/colectivos/:id`, sección "Proyectos" (`Pages/ColectivoPage.jsx:110-115`): cada proyecto es un `<span>`.
- **Qué pasa:** la spec 02 lo dejó así "hasta la spec 06", que ya está hecha.
- **Corrección:** enlazar cada proyecto a `/proyectos/:id` y mostrar su estado con el sello.
- **Verificación:** test de que cada proyecto es un enlace al detalle.
- **Respaldo:** criterios §8 "clickeables completas si tienen detalle".

**R18. Los perfiles públicos no tienen forma de volver. — hecho** Severidad: **menor**. Detectó: critique (en navegador).

- **Dónde:** `/colectivos/:id` y `/colaboradoras/:id`, escritorio y 320 px (`ColectivoPage.jsx:69-77`, `ColaboradoraPage.jsx:58-67`).
- **Corrección:** "← Volver" al detalle del proyecto si se llegó desde ahí (`location.state`), o a `/proyectos` si se entró por enlace directo.
- **Verificación:** desde "Quiénes colaboran" en un proyecto, "Volver" regresa a ese proyecto.
- **Respaldo:** criterios §4 "Siempre hay forma de volver atrás".

**R19. El perfil público de la colaboradora no explica lo que falta. — hecho** Severidad: **menor**. Detectó: critique (en navegador).

- **Dónde:** `/colaboradoras/:id`, escritorio y 320 px (`Pages/ColaboradoraPage.jsx:61-84`).
- **Qué pasa:**
  - Los pronombres van sin rótulo ("ella, elle" suelto debajo del nombre).
  - "Cuenta de Git" es jerga para un colectivo; en el alta se llama "Cuenta de GitHub o GitLab".
  - No dice por qué no se ven los datos de contacto.
- **Corrección:**
  - "Pronombres: ella, elle".
  - Un solo nombre para el dato en toda la app ("Cuenta de GitHub o GitLab").
  - Una línea en `info`: "Sus datos de contacto se comparten cuando un colectivo acepta su postulación."
- **Verificación:** test de los textos.
- **Respaldo:** `PRODUCT.md`, principio 2 ("La privacidad se ve"); criterios §3 "El mismo vocabulario en toda la app".

#### `/login`

**R20. El texto nombra al proveedor de identidad. — hecho** Severidad: **menor**. Detectó: critique (en navegador).

- **Dónde:** `/login`, "El ingreso se hace en una pantalla segura de Logto y después volvés acá." (`Pages/LoginPage.jsx:75`).
- **Corrección:** "El ingreso se hace en una pantalla segura y después volvés acá."
- **Verificación:** test de que la página no menciona "Logto".
- **Respaldo:** criterios §3 "No reveles la implementación".

**R21. El aviso de "ingreso no configurado" es técnico. — hecho** Severidad: **menor**. Detectó: audit (en navegador).

- **Dónde:** `/login` sin `VITE_LOGTO_*` ni sesión simulada, aviso de error: "El ingreso no está configurado. Completá las variables VITE_LOGTO_* o usá VITE_SESION_SIMULADA (ver README)." (`Infrastructure/Auth/crearIdentidad.js:4`).
- **Qué pasa:** solo aparece con la configuración incompleta, pero si un despliegue queda mal configurado la persona ve nombres de variables.
- **Corrección:** en pantalla, "No pudimos iniciar el ingreso. Probá de nuevo más tarde."; el detalle técnico, en `console.warn`.
- **Verificación:** test del adaptador sin configuración: el mensaje visible no contiene "VITE_".
- **Respaldo:** criterios §3; "No se negocia" de `CLAUDE.md` ("Mensajes en lenguaje de la persona").

**R22. "Ingresar" aparece dos veces en `/login`. — hecho** Severidad: **menor**. Detectó: critique (en navegador).

- **Dónde:** `/login`, escritorio y 320 px: el "Ingresar" de la cabecera y el de la página.
- **Corrección:** en `/login`, el de la cabecera queda marcado como actual (`aria-current="page"`) o no se muestra.
- **Verificación:** en `/login` hay un solo botón "Ingresar" accionable.
- **Respaldo:** criterios §4 "Una acción, un lugar".

#### `/colaboradora/perfil`

**R23. Dos formas de guardar en la misma pantalla. — hecho** Severidad: **menor**. Detectó: critique (en navegador).

- **Dónde:** `/colaboradora/perfil`, escritorio y 320 px (`Pages/PerfilColaboradoraPage.jsx:57-81`).
- **Qué pasa:** "Cómo te presentás" se guarda con "Guardar cambios", pero las habilidades "se guardan en el momento en que las marcás". A 320 px, "Guardar cambios" queda en la primera tarjeta y las habilidades abajo, y parece que el botón las incluye.
- **Corrección:** **Decidido (06/11):** las habilidades siguen guardándose de a una, y se suma al lado de cada cambio un aviso breve ("Guardamos tus habilidades"). No pasan al "Guardar cambios".
- **Verificación:** marcar una habilidad muestra la confirmación; no queda ninguna duda sobre qué guarda el botón.

**R24. El subtítulo no corresponde a una pantalla de edición. — hecho** Severidad: **menor**. Detectó: critique (en navegador).

- **Dónde:** `/colaboradora/perfil` y `/colectivo/perfil`: "Así te ven los colectivos." y "Así se presentan en la plataforma.", arriba de un formulario.
- **Corrección:** "Editá cómo te ven los colectivos. Tus medios de contacto no son públicos." (y su par para el colectivo).
- **Verificación:** test del texto.

**R25. La lista de habilidades tiene scroll propio dentro de la página. — hecho** Severidad: **menor**. Detectó: audit (en navegador).

- **Dónde:** `/colaboradora/perfil` y `/bienvenida/colaboradora`, 320 px: lista de 286 px de alto con 457 px de contenido (`Formulario/SelectorDeHabilidades`).
- **Corrección:** a menos de 768 px, sin alto máximo: la lista crece y el buscador filtra.
- **Verificación:** a 320 px, la lista no tiene scroll propio.

#### `/bienvenida`, `/bienvenida/colectivo` y `/bienvenida/colaboradora`

**R26. Las opciones de bienvenida no parecen clickeables. — hecho** Severidad: **menor**. Detectó: critique (en navegador).

- **Dónde:** `/bienvenida`, escritorio y 320 px: "Soy un colectivo" y "Soy colaboradora" son enlaces con forma de tarjeta, sin flecha ni otra señal.
- **Corrección:** un ícono de flecha de 20 px a la derecha del título y el hover de la tarjeta de proyecto (borde petróleo y sombra de respuesta).
- **Verificación:** captura en escritorio y 320 px.
- **Respaldo:** criterios §6 "Que botones, links y campos se reconozcan a simple vista".

**R27. Las altas no permiten volver a elegir el tipo de cuenta. — hecho** Severidad: **menor**. Detectó: critique (en navegador).

- **Dónde:** `/bienvenida/colectivo` y `/bienvenida/colaboradora`.
- **Corrección:** "← Elegir otro tipo de cuenta" arriba del título, a `/bienvenida`, con el aviso de cambios sin guardar si ya hay datos.
- **Verificación:** test del enlace.
- **Respaldo:** criterios §4 "Siempre hay forma de volver atrás".

**R28. "Ubicación" pide elegir entre cinco opciones a la vez. — hecho** Severidad: **menor**. Detectó: critique (en navegador).

- **Dónde:** `/bienvenida/colectivo` y `/colectivo/perfil`, "¿Dónde trabajan?" (`Colectivo/ColectivoForm.jsx:31-37`).
- **Corrección:** ordenar las opciones de lo más común a lo menos ("Una provincia", "Una ciudad o barrio", "Ciudad de Buenos Aires", "Todo el país", "Prefiero no indicarla") y mostrar el campo de nombre solo al elegir la que lo necesita (ya es así).
- **Verificación:** captura del grupo.
- **Respaldo:** criterios §5 "Lo más usado, al principio o al final".

#### `/sin-permiso`

**R29. El texto habla de un rol que no existe. — hecho** Severidad: **menor**. Detectó: critique (en navegador).

- **Dónde:** `/sin-permiso`, todos los roles: "pedile acceso a quien administra el colectivo" (`Pages/SinPermisoPage.jsx:9-10`).
- **Corrección:** "Esta sección es para otro tipo de cuenta." y "Volver al inicio" a la pantalla de inicio del rol.
- **Verificación:** test del texto.

### Por pieza compartida

#### Cabecera

**R30. "Habilidades" está en la navegación de todos los roles, con un formulario de alta. — hecho** Severidad: **mayor**. Detectó: critique (en navegador).

- **Dónde:** cabecera de visitante, colaboradora, colectivo y cuenta sin perfil, escritorio y menú de 320 px (`Routes/navegacion.js:3`). `/habilidades` permite crear habilidades a cualquiera (`Pages/HabilidadesPage.jsx:43`).
- **Qué pasa:** es la pantalla de ejemplo de la arquitectura. Las habilidades las administra la administración, según `PRODUCT.md`.
- **Corrección:** sacar "Habilidades" de la navegación; la ruta queda solo para desarrollo o detrás del rol de administración cuando exista.
- **Verificación:** test de la cabecera por rol sin "Habilidades".
- **Respaldo:** criterios §1 "Respetá los permisos" y §4 "Borrá las pantallas que no tienen propósito".

**R31. Al cancelar "¿Cerrar sesión?" el foco se pierde. — hecho** Severidad: **mayor**. Detectó: audit (en navegador).

- **Dónde:** cabecera, "Mi cuenta" → "Cerrar sesión" → Esc o "Cancelar", escritorio (colectivo).
- **Qué pasa:** el diálogo devuelve el foco a "Cerrar sesión", que ya no se ve porque el menú se cerró (`MenuDeCuenta.jsx:77-80`); el foco queda en `body`.
- **Corrección:** al cancelar, devolver el foco al botón "Mi cuenta".
- **Verificación:** test que cancela y espera el foco en "Mi cuenta".
- **Respaldo:** criterios §9 Teclado.

**R32. Los menús no se cierran al salir de ellos. — hecho** Severidad: **menor**. Detectó: audit (menú de cuenta en navegador; menú de celular en código).

- **Dónde:** cabecera.
  - "Mi cuenta" queda abierto (`aria-expanded="true"`) al salir con Tab (`MenuDeCuenta.jsx:16-32`).
  - El menú de celular no se cierra al tocar afuera ni al usar el enlace del nombre (`Cabecera.jsx:15-24, 29`).
- **Corrección:** cerrar los dos con `focusout` fuera del contenedor y con clic afuera.
- **Verificación:** tests de Tab fuera del menú y clic afuera.

**R33. "Mi perfil" y "Mi colectivo" están en la navegación principal y "Mi cuenta" no muestra quién ingresó. — hecho** Severidad: **menor**. Detectó: critique (en navegador).

- **Dónde:** cabecera de colaboradora y colectivo, escritorio y 320 px. El menú "Mi cuenta" solo tiene "Cerrar sesión" (y la marca de sesión simulada en desarrollo) (`MenuDeCuenta.jsx:56-65`).
- **Corrección:** mover "Mi perfil" / "Mi colectivo" al menú "Mi cuenta", encabezado por el nombre de la persona o del colectivo.
- **Verificación:** test de los ítems de cada menú por rol.
- **Respaldo:** criterios §4 "El menú de cuenta es solo para lo personal (perfil, configuración, cerrar sesión)" y "Una acción, un lugar".

**R34. La marca a 320 px y en escritorio. — hecho** Severidad: **menor**. Detectó: audit (en navegador).

- **Dónde:** "Código a Voluntad".
  - A 320 px se parte en dos líneas y la cabecera pasa a 64 px de alto.
  - En escritorio el enlace mide 175 × 31 px, debajo de los 44 px de zona de toque.
- **Corrección:** `white-space: nowrap` con el tamaño de la marca bajando a `1.125rem` debajo de 360 px; `min-block-size: var(--toque-minimo)` en el enlace.
- **Verificación:** a 320 px, la marca va en una línea, sin scroll horizontal, y el enlace mide 44 px de alto.

**R35. Clase CSS inexistente en la cabecera. — hecho** Severidad: **menor**. Detectó: audit (en código).

- **Dónde:** `Components/App/Cabecera.jsx:32` usa `estilos.navegacion`, que `Cabecera.module.css` no define.
- **Corrección:** quitar el `className` o definir la clase.
- **Verificación:** `grep` sin referencias a clases que no existen.

#### Tarjeta de proyecto

**R36. El anillo de foco de la tarjeta aparece también con el mouse. — hecho** Severidad: **menor**. Detectó: audit (en código).

- **Dónde:** `Components/Proyecto/TarjetaProyecto.module.css:21-24` usa `:focus-within`.
- **Corrección:** `.tarjeta:has(a:focus-visible)`.
- **Verificación:** clic en el título sin anillo; Tab con anillo.

**R37. Al skeleton de la tarjeta le faltan las líneas de metadato. — hecho** Severidad: **menor**. Detectó: audit (en código).

- **Dónde:** `Components/Proyecto/TarjetaProyecto.jsx:80-93`.
- **Corrección:** las dos líneas al 40 % que pide `DESIGN.md` → Esqueleto.
- **Verificación:** captura del skeleton contra la tarjeta real, sin salto al cargar.

#### Chips y etiquetas

**R38. Las etiquetas se ven igual que los chips de habilidad requerida. — hecho** Severidad: **mayor**. Detectó: critique (en navegador).

- **Dónde:** `/proyectos/:id`, `/colectivos/:id` y `/colaboradoras/:id`, escritorio y 320 px (`Pages/Perfil.module.css:93-104`). En `/colaboradoras/:id` las habilidades usan esa misma clase `.etiqueta` en vez de `<Chip>` (`ColaboradoraPage.jsx:78-84`).
- **Qué pasa:** "alimentacion" y "logistica" arriba tienen la misma píldora petróleo con borde que "React" en "Requeridas" abajo. Un colectivo no distingue temas de habilidades.
- **Corrección:** etiquetas con estilo neutro (fondo `hundido`, borde `borde-campo`, radio `sm`, sin forma de píldora) y `<Chip>` para las habilidades en todas las pantallas.
- **Verificación:** captura del detalle; test de que las habilidades del perfil público usan `Chip`.
- **Respaldo:** `DESIGN.md` → Chips ("forma de píldora solo en los chips de habilidad"); criterios §6 "Un solo estilo".

**R39. El chip no lleva ícono como cuarta señal. — hecho** Severidad: **menor**. Detectó: audit (en código).

- **Dónde:** `Components/App/Chip.jsx:12-17`.
- **Qué pasa:** `DESIGN.md` enumera el ícono entre las cuatro señales que no dependen del color, pero el chip no lo tiene (salvo la tilde de "La tenés").
- **Corrección:** **Decidido (06/11):** el chip no lleva ícono; se corrige `DESIGN.md` para que las señales sean grupo, borde y peso.
- **Verificación:** `DESIGN.md` y `Chip.jsx` dicen lo mismo.

**R40. Los botones para quitar un chip miden 44 × 32 px. — hecho** Severidad: **menor**. Detectó: audit (en navegador y en código).

- **Dónde:** `/colaboradora/perfil`, `/colectivo/perfil` y las altas: "×" de pronombres, etiquetas y habilidades (`Formulario/Editores.module.css:52-53`, `Formulario/SelectorDeHabilidades.module.css:46-47`).
- **Qué pasa:** cumple WCAG 2.5.8 (24 px), pero no los 44 px del proyecto.
- **Corrección:** ampliar el área de toque con un `::before` con `inset` negativo hasta 44 px de alto, sin cambiar el tamaño visible del chip.
- **Verificación:** el área de toque mide 44 × 44 px en las DevTools.
- **Respaldo:** `DESIGN.md` → Layout ("Zonas de toque de 44×44px"); criterios §9.

**R41. Colores de hover sueltos, fuera de los tokens. — hecho** Severidad: **menor**. Detectó: audit (en código).

- **Dónde:** `color-mix` en `ProveedorDeAvisos.module.css:89`, `Formulario/Editores.module.css:62` y `Formulario/SelectorDeHabilidades.module.css:57`.
- **Corrección:** usar `--color-peligro-tenue` o `--color-petroleo-tenue`, o crear el token y documentarlo en `DESIGN.md`.
- **Verificación:** `grep color-mix src` vacío o solo dentro de `tokens.css`.

#### Formularios

**R42. Los errores de campo no se anuncian al enviar. — hecho** Severidad: **menor**. Detectó: audit (en navegador).

- **Dónde:** `/bienvenida/colectivo`, `/bienvenida/colaboradora`, `/colectivo/perfil` y `/colaboradora/perfil`, al enviar con errores.
- **Qué pasa:** cada error tiene `aria-invalid="true"`, mensaje con ícono y `aria-describedby`, y el foco va al primer campo inválido, pero ningún mensaje tiene `role="alert"` y no hay un resumen. Quien usa lector de pantalla oye el primer error y no sabe cuántos más hay.
- **Corrección:** al enviar con errores, un resumen arriba del botón con `role="alert"`: "Revisá 3 campos: Nombre, Tipo de colectivo y Descripción", con enlaces a cada campo. El foco sigue yendo al primer campo inválido.
- **Verificación:** test de que al enviar vacío aparece el resumen en `role="alert"` con la cantidad correcta.
- **Respaldo:** criterios §9 "Errores de formulario: `aria-invalid="true"`, el mensaje vinculado al campo y `role="alert"`". Choca con la decisión actual de no usar `role="alert"` por campo; **gana el checklist**, resuelto con un único resumen para no anunciar cada error dos veces.

#### Mensajes de error

**R43. Llegan mensajes crudos del back a la pantalla. — hecho** Severidad: **mayor**. Detectó: audit y critique (en código, con evidencia del back local).

- **Dónde:**
  - `Infrastructure/Http/mensajesDeError.js:25-27, 37`: en 400, 404, 409 y 422 muestra `data.message` tal cual. El back local responde, por ejemplo, `No existe una habilidad con el código "diseno_ux_ui"` o "TODO_SUMA solo se puede usar si no hay limite de vacantes".
  - `Components/Formulario/formulario.js:91-92` (usado en `ColaboradoraForm.jsx:56` y `ColectivoForm.jsx:64`): pone `issues[].message` debajo de cada campo.
  - El texto propio del 409, "La operación entra en conflicto con el estado actual.", también es técnico.
  - El del 429 habla de "búsquedas" aunque se use al postularse o guardar.
- **Corrección:**
  - Textos propios por status y por operación (por ejemplo, 409 al postularse: "Ya te postulaste a este proyecto."; 409 al crear perfil: "Tu cuenta ya tiene un perfil."), con el texto genérico por status como respaldo.
  - `issues`: traducir por `path` y `code` a los mensajes de cada campo que ya tiene el front; si no hay traducción, "Revisá este dato."
  - 429: "Hiciste muchos pedidos seguidos. Esperá unos segundos y volvé a intentar."
- **Verificación:** tests de `describirError` y de `formulario.js` con un `message` del back: el texto visible nunca es el del back.
- **Respaldo:** "No se negocia" de `CLAUDE.md` ("nunca el error crudo del back"), criterios §3 y §14 ("Mostrar el mensaje crudo del back"). Choca con `docs/plan-front.md` §5.2 ("Resto: el `message` del back"); **gana el checklist**, y `plan-front.md` se actualiza en la misma implementación.

#### Diálogo y avisos

**R44. Los diálogos aparecen pegados arriba a la izquierda. — hecho** Severidad: **mayor**. Detectó: audit (en navegador).

- **Dónde:** todos los `DialogoDeConfirmacion` ("¿Te postulás…?", "¿Cerrar sesión?", "¿Salir sin guardar?"), escritorio (1280 px): el diálogo queda en `left: 0; top: 0`.
- **Qué pasa:** el reset de `Styles/base.css:10-12` (`* { margin: 0 }`) le quita al `<dialog>` el `margin: auto` con que el navegador lo centra. En celular casi no se nota porque ocupa todo el ancho.
- **Corrección:** `margin: auto` en `.dialogo` (`DialogoDeConfirmacion.module.css`), o excluir `dialog` del reset.
- **Verificación:** a 1280 px y a 320 px el diálogo queda centrado en los dos ejes; test visual o de estilo calculado.
- **Respaldo:** `DESIGN.md` → Diálogo de confirmación.

**R45. "Cerrar sesión" y "Salir sin guardar" confirman en coral, y "Cancelar" es ambiguo. — hecho** Severidad: **menor**. Detectó: critique (en navegador).

- **Dónde:** "¿Cerrar sesión?" (`MenuDeCuenta.jsx:88`) y "¿Salir sin guardar?" (`ColectivoForm.jsx:232-240`, `ColaboradoraForm.jsx:255-263`), escritorio.
- **Qué pasa:**
  - El botón que confirma usa el coral primario, el mismo de "Postularme" o "Crear perfil".
  - En "¿Salir sin guardar?", "Cancelar" puede leerse como "cancelar la edición".
- **Corrección:**
  - "Cerrar sesión" y "Salir sin guardar" con el peligroso de confirmación (`peligro`, texto blanco).
  - "Cancelar" pasa a "Seguir editando" en "¿Salir sin guardar?".
- **Verificación:** captura de los dos diálogos; test del texto del botón.
- **Respaldo:** criterios §3 "Lo irreversible pide confirmación (borrar, dar de baja, cerrar sesión) […] y el botón peligroso va en rojo"; `DESIGN.md` → "La regla del rojo que no es coral".

**R46. En celular el orden de foco del diálogo no sigue el orden visual. — hecho** Severidad: **menor**. Detectó: audit (en navegador).

- **Dónde:** diálogo de postulación, 320 px: "Enviar postulación" se ve arriba de "Cancelar", pero en el DOM "Cancelar" va primero.
- **Corrección:** **Decidido (06/11):** en celular se apila con "Cancelar" arriba y la acción principal abajo, sin cambiar el orden del DOM. El foco inicial sigue en "Cancelar".
- **Verificación:** a 320 px, Tab recorre los botones de arriba hacia abajo.
- **Respaldo:** WCAG 2.4.3 (orden del foco); criterios §9 Teclado.

**R47. En celular los avisos tapan una parte grande de la pantalla. — hecho** Severidad: **menor**. Detectó: audit (en navegador).

- **Dónde:** `/login`, 320 × 700: el aviso de error ocupa abajo cerca de un cuarto de la pantalla, y en formularios largos tapa "Guardar cambios" o "Crear perfil" (`ProveedorDeAvisos.module.css:1-10`).
- **Corrección:** a menos de 480 px, el aviso va arriba, debajo de la cabecera, con el texto en body small y alto máximo de tres líneas.
- **Verificación:** a 320 px, con un aviso abierto, el botón de envío sigue visible.

#### Estados de carga, vacío y error

**R48. "Reintentando…" nunca se ve. — hecho** Severidad: **menor**. Detectó: audit y critique (en navegador).

- **Dónde:** `/proyectos` con el back apagado: al tocar "Reintentar" no cambia nada en pantalla hasta que vuelve el error (`Hooks/useConsulta.js:16`; la prop `reintentando` de `EstadoDeError` no se usa).
- **Corrección:** mantener `EstadoDeError` montado mientras reintenta, con el botón en "Reintentando…" deshabilitado.
- **Verificación:** test que toca "Reintentar" y ve "Reintentando…" antes de la respuesta.
- **Respaldo:** `DESIGN.md` → Estado de error; criterios §2 "Mostrá siempre el estado del sistema".

**R49. `EstadoDeError` roba el foco en la primera carga. — hecho** Severidad: **menor**. Detectó: audit (en navegador).

- **Dónde:** `/proyectos` con el back apagado: al cargar, el foco va al título del error (`Components/App/EstadoDeError.jsx:20-22`); si falla una búsqueda mientras la persona escribe, el foco salta del buscador al error.
- **Corrección:** enfocar el título solo después de un reintento que vuelve a fallar, como dice `DESIGN.md`; en la primera carga alcanza con `role="alert"`.
- **Verificación:** test de que la primera falla no mueve el foco y un reintento fallido sí.

**R50. Borde del vacío rayado en vez de punteado. — hecho** Severidad: **menor**. Detectó: audit (en navegador).

- **Dónde:** estados vacío y sin resultados: `border-style: dashed`. `DESIGN.md` pide borde **punteado** (`dotted`).
- **Corrección:** **Decidido (06/11):** se mantiene el rayado (`dashed`) y se corrige `DESIGN.md` para que lo diga.
- **Verificación:** estilo calculado del contenedor.

**R51. La región `aria-live` del skeleton nace con su texto. — hecho** Severidad: **menor**. Detectó: audit (en código; a verificar con NVDA).

- **Dónde:** `Components/App/Esqueleto.jsx:19`.
- **Qué pasa:** si la región se monta junto con "Cargando proyectos…", algunos lectores no lo anuncian.
- **Corrección:** región montada desde el inicio de la página y el texto agregado cuando aparece el skeleton.
- **Verificación:** con NVDA, se oye "Cargando proyectos…" con la red lenta.

#### Foco y navegación

**R52. El foco no llega al título en pantallas que cargan datos. — hecho** Severidad: **mayor**. Detectó: audit y critique (en navegador).

- **Dónde:** de `/proyectos` a `/proyectos/:id` con un clic o Enter en una tarjeta, escritorio y 320 px; lo mismo al llegar a `/colectivos/:id` y `/colaboradoras/:id`, y al volver del ingreso a `/colectivo/perfil` o `/bienvenida`.
- **Qué pasa:** `Hooks/useFocoAlNavegar.js:15` busca el `h1` una sola vez, cuando todavía está el skeleton, que no tiene `h1`. El foco queda en `body`. Al volver a `/proyectos` sí funciona, porque el `h1` está desde el principio. La navegación con `replace` (el regreso del ingreso) no mueve el foco.
- **Corrección:** si no hay `h1`, enfocar `main` (ya tiene `tabIndex={-1}`) y, cuando aparece el `h1` de la pantalla pendiente, pasarle el foco. Alternativa: que el skeleton de cada pantalla tenga su `h1`.
- **Verificación:** test de navegación de tarjeta a detalle con el back simulado lento: el foco termina en el `h1` del proyecto.
- **Respaldo:** criterios §9 Teclado y §13; base transversal ("foco al cambiar de pantalla").

**R53. El anillo de foco no es el mismo en todos los controles. — hecho** Severidad: **menor**. Detectó: audit (en navegador).

- **Dónde:**
  - Buscador de `/proyectos`: anillo de 3 px en `tinta` sin separación.
  - Botones: anillo en `info` con 3 px de separación.
  - Cabecera: crema con 3 px en la marca y sin separación en los enlaces.
  - `h1` con `tabIndex={-1}`: muestra un recuadro al recibir el foco por teclado (por ejemplo, "Tu perfil").
- **Corrección:** un solo anillo (`info`, 3 px, separación de 3 px; crema sobre la cabecera); en los campos, borde petróleo más el anillo, como dice `DESIGN.md`; en los `h1` enfocados por código, sin anillo (`[tabindex="-1"]:focus { outline: none }`), porque no son controles.
- **Verificación:** recorrida con Tab por cabecera, buscador, tarjetas y botones.
- **Respaldo:** `DESIGN.md` → Buttons ("Foco") e Inputs ("Foco").

#### Base de la página

**R54. Las fuentes no se precargan. — hecho** Severidad: **menor**. Detectó: audit (en código).

- **Dónde:** `index.html`: las dos `woff2` de `public/fonts/` se declaran con `font-display: swap`, pero sin `<link rel="preload">`. Los títulos cambian de fuente después de pintar.
- **Corrección:** `<link rel="preload" as="font" type="font/woff2" crossorigin href="/fonts/…">` al menos para Bricolage Grotesque.
- **Verificación:** en la pestaña Red, la fuente se pide antes que el CSS de los módulos; sin salto visible en el título al recargar.

## Estados

Estados que se revisaron y lo que tienen que cumplir después de las correcciones:

- **Cargando:** skeleton con la forma real (R37), anunciado (R51), sin saltos (R15) y con indicador visible al cambiar de página (R5). No se pudo ver en el navegador con el back local, porque responde en menos de 300 ms.
- **Con datos:** cada estado de búsqueda y de postulación con su sello y su color (R10, R14), etiquetas distintas de las habilidades (R38) y el foco en el título al llegar (R52).
- **Vacío:** una explicación y una sola acción (R3), con el borde que diga `DESIGN.md` (R50).
- **Sin resultados:** anunciado (R1), con una sola forma clara de limpiar (R2).
- **Error:** `EstadoDeError` con "Reintentar", que muestra "Reintentando…" (R48) y no roba el foco en la primera falla (R49); errores de formulario con resumen (R42); nunca el texto del back (R43).

## Fuera de alcance

- Lo que ya figura en "A acordar con el back" de las specs 01, 02, 03, 05 y 06 y en los pendientes de `docs/traspaso.md`. Por ejemplo, el colectivo en `ProyectoDto`, el estado de la búsqueda por perfil (con el back actual, el perfil con el límite alcanzado se cierra y se ve "Cerrada", no "Límite alcanzado"), los filtros, los medios de contacto en `GET /colectivos/:id` y el formato de `cuentaGit`.
- El paso siguiente del colectivo después del alta ("Publicar proyecto", "Mis proyectos"): es la spec 04.
- **Problemas de la base local del back, que no son del front:**
  - Las habilidades precargadas no tienen el campo `codigo` (están guardadas con el código como `_id`), así que el back no las encuentra al crear perfiles ni proyectos.
  - "Fundación Verde" y "Asamblea" devuelven `id: null`.
  - El back guarda las etiquetas sin tildes ("alimentacion", "logistica").
- Rediseño de la composición (la metáfora de la cartelera en el layout del detalle): queda como pregunta para una ronda de `/impeccable shape`, no para esta spec.
- La paginación con varias páginas y el skeleton no se pudieron ver en pantalla con los datos de prueba. R4, R5, R37 y R51 salen del código.

## Datos de prueba creados (06/11/2026)

Todo se creó con `POST` contra el back local (`http://localhost:8000`) y no se modificó ni borró nada existente.

- **Habilidades** (`POST /habilidades`, usuario `seed-revision`), porque las precargadas no se pueden usar (ver "Fuera de alcance"):
  - `react` (React);
  - `node_js` (Node.js);
  - `dise_o_de_interfaces` ("Diseño de interfaces": se guardó con la ñ dañada por la codificación de la terminal);
  - `bases_de_datos_relacionales` (Bases de datos relacionales).
- **Colectivos:**
  - `6aedcefbd9d7673bdc42144f`: "Comedor Los Gurises de Villa Fiorito", asociación barrial de Buenos Aires, con Instagram y un email.
  - `6aedcefbd9d7673bdc421450`: "Cooperativa de Trabajo Textil Mujeres Organizadas del Barrio Ejército de los Andes Limitada", ONG de "Ciudadela, Partido de Tres de Febrero", con una descripción larga.
- **Colaboradoras:**
  - `6aedcf29d9d7673bdc421457`: Ana Laura Fernández (`analaura-dev`, ella), con React, Node.js y Diseño de interfaces.
  - `6aedcf29d9d7673bdc421458`: María de los Ángeles Guadalupe Rodríguez Etcheverry Bustamante, con nombre de fantasía "Marian, la que modela bases de datos para la economía popular" y una presentación larga, con Node.js y Bases de datos relacionales, sin mensajería.
- **Proyectos:**
  - `6aedcf34d9d7673bdc421459`: "Sistema de turnos y stock para el comedor" (del comedor), abierto, con tres perfiles:
    - `…45a`: búsqueda abierta hasta el 15/12, revisión manual;
    - `…45b`: búsqueda cerrada;
    - `…45c`: límite de 1, "hasta llenar vacantes", ya alcanzado (el back lo cerró).
  - `6aedcf34d9d7673bdc42145e`: "Tienda en línea para vender guardapolvos, ropa de trabajo y bolsas reutilizables sin intermediarios" (de la cooperativa), **finalizado**.
  - `6aedd067d370bbe4c93274d0`: "Registro de donaciones del comedor", abierto, con un perfil de Node.js abierto hasta el 20/11. Se sumó para poder abrir el diálogo de postulación con Ana.
- **Postulaciones:**
  - `6aedcf34d9d7673bdc421465`: Ana al perfil `…45a`, **pendiente**.
  - `6aedcf34d9d7673bdc42146b`: Marian al perfil `…45c`, **aceptada**.
  - `6aedcf34d9d7673bdc42146e`: Ana a la tienda, **anónima** (aceptada y después finalizada con el proyecto).

Sesiones usadas: visitante en el `npm run dev` de siempre (5173). Colaboradora (Ana, `…457`), colectivo (comedor, `…44f`) y `SIN_PERFIL` en servidores de Vite aparte (5174, 5175 y 5176), con `VITE_SESION_SIMULADA` y `VITE_SESION_SIMULADA_PERFIL_ID` como variables de entorno, sin editar `.env`.

## Criterio de aceptación

- Cada requisito R1 a R54 está corregido y verificado como dice su "Verificación", y las decisiones de R11, R23, R39, R46 y R50 (tomadas el 06/11) están reflejadas en `docs/decisiones.md` y, donde corresponde, en `DESIGN.md`.
- Los tests nuevos cubren al menos R1, R8, R31, R42, R43, R48 y R52.
- `docs/plan-front.md` §5.2 queda alineado con R43, y `DESIGN.md` con lo que se decida en R11, R39 y R50. Después, `/impeccable document` para actualizar `DESIGN.md`.
- Se vuelven a correr `/impeccable audit` y `/impeccable critique`, y no reaparece ningún hallazgo mayor de esta lista.
- `npm run lint`, `npm run format:check`, `npm test` y `npm run build` en verde sobre el repo completo, y el checklist de `docs/criterios-pantallas-web.md` revisado (§12), en escritorio y a 320 px, con cada rol y con el back apagado.
