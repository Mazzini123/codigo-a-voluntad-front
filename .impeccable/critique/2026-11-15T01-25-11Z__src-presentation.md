---
target: todas las pantallas (src/Presentation)
total_score: 24
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 6
target_identity: "file:C:\\Users\\lucio\\Desktop\\codigo-a-voluntad-front\\src\\Presentation"
timestamp: 2026-11-15T01-25-11Z
slug: src-presentation
---
# Revisión Impeccable 05: todas las pantallas

Origen: `/impeccable audit` y `/impeccable critique` del 14/11/2026 sobre las 36 pantallas del front, a 1280 y 320 px, en la rama `feature/contextos-simultaneos` con los cambios sin commitear de ese día. No se implementó nada: este documento junta los hallazgos para decidir qué se toma.

- **Audit técnico, 14/20 (bueno).**
  - Accesibilidad 3/4: el nombre de la cuenta es invisible en el menú de cuenta (1.07:1) y hay un nombre accesible que no contiene el texto visible.
  - Rendimiento 3/4: 17 pantallas diferidas, Markdown diferido, sin animaciones de layout. El apagado global de movimiento deja quietos el spinner y el esqueleto.
  - Sistema visual 3/4: cero colores ni espaciados fuera de tokens. Hay seis tamaños de letra fuera de la escala, cuatro de ellos en Inicio.
  - Adaptación 3/4: no hay desborde horizontal. A 320 px el menú de cuenta se abre fuera de la pantalla y la barra del panel corta palabras.
  - Integridad 2/4: dos marcos visuales, la regla de la voz única rota y ilustraciones que `DESIGN.md` prohíbe.
- **Critique, 24/40 (aceptable).** Dos evaluaciones independientes: una revisión de diseño que miró capturas y código sin ver el detector, y otra con el detector, axe y medidas en el navegador. Coinciden en los saltos de encabezado, la barra del panel a 320 px y el estado sin sello. El detector sumó lo que la revisión no vio: el contraste del menú de cuenta y el nombre accesible de «Pasar el liderazgo».
- **Detector.** El CLI sobre `src/Presentation` dio 4 hallazgos `design-system-font-size`, todos verdaderos y todos en `InicioPage.module.css`. El overlay en página corrió en 7 pantallas a 1280 y solo marcó `tight-leading` en Inicio.
- **axe (WCAG 2.2 AA).** Se corrió en 72 pasadas y 18 estados interactivos: menús abiertos, diálogos de confirmación y formulario enviado vacío. Dio dos violaciones: `label-content-name-mismatch` en Miembros y `color-contrast` en el menú de cuenta. No hubo errores ni warnings de React en consola.

## Cómo se relevó

- El front de 5173 corría con Logto y el back real no tenía proyectos. Por eso se levantaron cuatro `vite` aparte con `VITE_SESION_SIMULADA`: visitante (5181), sin perfil (5182), colaboradora (5183) y colectivo (5184), igual que `playwright.config.js`.
- Los datos salieron del back en memoria de `tests/e2e/apoyo/backFalso.js`, con más proyectos y colaboraciones. Se sumaron respuestas para los endpoints que no cubre: destacados, logros, avances, `GET /colectivos`, solicitudes de ingreso, miembros, mensajes, medios de contacto, candidatas y contacto.
- Las capturas son de Playwright con Chromium y viewport emulado.
- **Límites de la evidencia:**
  - el filtro no filtra, así que no se vio el estado «sin resultados»;
  - no se forzaron errores 500 ni demoras;
  - no se probaron gestos táctiles reales, zoom al 200 % ni el orden de tabulación completo;
  - Mensajes del colectivo lleva a sin permiso, como corresponde.
- **Hallazgos que dependen de los datos falsos.** «Identidad no disponible», «TELEGRAM» y «Perfil 1» aparecen porque al seed le faltan campos. El texto de respaldo, en cambio, es del front.

## Intención

Que un comedor sin formación técnica pueda decidir una postulación desde una sola pantalla y sepa siempre si está en su panel o en el sitio público. Que cada pantalla tenga una sola acción coral. Que `DESIGN.md` describa lo que se ve.

## Escenarios

Dado un colectivo con una postulación pendiente,
cuando abre Postulaciones recibidas,
entonces ve el nombre del perfil, las habilidades de la persona contra las requeridas, la fecha y el estado con sello, y «Aceptar» es la acción destacada.

Dado un colectivo que acepta una postulación,
cuando se abre la confirmación,
entonces el diálogo nombra a la persona y avisa que desde ese momento se comparten los datos de contacto.

Dada una colaboradora en el listado de proyectos,
cuando recorre nueve tarjetas,
entonces lo único coral en cada tarjeta es la franja de encaje.

Dada una persona del colectivo en «Administrar proyecto»,
cuando mira la cabecera,
entonces ve resaltado «Panel del colectivo» y el mismo marco que en Mis proyectos.

Dada una persona con sesión en un celular de 320 px,
cuando abre «Mi cuenta»,
entonces el menú entra completo en la pantalla y su nombre se lee.

## Hallazgos y requisitos

Ordenados por prioridad. Cada uno indica de dónde salió (A: revisión de diseño; B: detector y navegador; audit) y el punto de `docs/criterios-pantallas-web.md` que lo respalda.

### R1. El nombre de la cuenta es invisible en el menú de cuenta (P1, B y audit)

- **Dónde.** `MenuDeCuenta.module.css:81-83` (`.nombreDeLaCuenta`) y `MenuDeCuenta.jsx:238`. Se ve en todos los roles con sesión, a 1280 y 320 px.
- **Problema.** El `<strong>` debajo de «Ingresaste como» no tiene color propio y hereda el crema de la cabecera (`#FBF6EE` sobre `#FFFFFF`, contraste 1.07:1). axe lo marca como `color-contrast` serio y en la captura no se lee.
- **Resultado esperado.** El nombre en tinta, con contraste de 4.5:1 o más. axe sin violaciones con el menú abierto.
- **Respaldo.** §9 «Contraste mínimo de 4.5:1 en el texto»; §12 «Lighthouse no marca problemas importantes».

### R2. Postulaciones recibidas: decidir sin información (P1, A)

- **Dónde.** `PostulacionesRecibidasPage.jsx`:
  - `:278`: el estado es un `<strong>`;
  - `:69`: «Perfil N»;
  - `:304-321`: «Aceptar» y «Rechazar».

  También afecta al diálogo de aceptar. Ambos anchos.
- **Problema.**
  - La tarjeta muestra el nombre y «Pendiente» en negrita, sin sello, habilidades, encaje ni horas.
  - El grupo se titula «Perfil 1».
  - «Aceptar» y «Rechazar» pesan casi igual.
  - En una postulación aceptada, «Ver datos de contacto», «Finalizar colaboración» y «Desvincular» quedan en filas sueltas.
  - «¿Aceptar la postulación?» no dice a quién acepta ni que se comparten los datos de contacto.

  Es la decisión de más peso para un comedor y la pantalla con menos información.
- **Resultado esperado.**
  - Estado con el sello compartido (texto e ícono).
  - Habilidades de la persona contra las requeridas del perfil, y la fecha.
  - Grupo titulado con el nombre o la descripción del perfil.
  - «Aceptar» como acción destacada.
  - Las acciones de una postulación aceptada en una sola fila.
  - El diálogo nombra a la persona y avisa del contacto.
- **Pendiente de la ronda 04.** `SolicitudesDeIngresoPage.jsx:184` sigue con el estado en `<strong>`.
- **Respaldo.**
  - §1 «Elegí una acción principal por pantalla y que se note»;
  - §8 «Que filas y tarjetas muestren lo necesario para decidir»;
  - §9 «No comuniques nada solo con color»;
  - §5 «No hagas recordar datos de una pantalla a otra».
- **Comando.** `/impeccable clarify` y `/impeccable layout`.

### R3. La regla de la voz única está rota (P1, A)

- **Dónde.**
  - `AccionDePerfil.jsx:80`: «Postularme» con `variante="primario"`, aunque `DESIGN.md:323` y `:413` lo definen como secundario.
  - `TarjetaProyecto.jsx:136-138`: «Ver proyecto →» en coral en cada tarjeta.
  - Resumen: «Publicar proyecto» y dos «Revisar» en coral.
  - Login: «Ingresar» y «Crear una cuenta» en coral.

  Ambos anchos.
- **Problema.**
  - Con nueve tarjetas, la colaboradora ve unos 17 elementos coral.
  - En el detalle hay un coral por perfil abierto.
  - La franja «Tenés 1 de 1 habilidad requerida» deja de destacar.
- **Resultado esperado.**
  - «Postularme» secundario.
  - «Ver proyecto» fuera de la tarjeta (el título ya la cubre) o en petróleo.
  - En el Resumen, coral solo para «Publicar proyecto».
  - En Login, el enlace alternativo en petróleo.
- **Respaldo.** §6 «Un solo elemento destacado por pantalla»; §6 Identidad de marca: «El acento se usa poco (10 %)».
- **Comando.** `/impeccable quieter` y `/impeccable polish`.

### R4. Dos marcos y una cabecera que no dice dónde está la persona (P1, A y B)

- **Dónde.**
  - Administrar, Postulaciones recibidas, Colaboradoras para este perfil y Contacto: resaltan «Proyectos», van sin barra lateral y en fondo blanco.
  - Nuevo proyecto: resalta el panel, pero sin barra lateral.
  - Resumen, Mis proyectos y Postulaciones: crema, con barra lateral y h1 display.
  - Dentro del panel, Miembros y Solicitudes usan h1 headline.
  - A 320 px, `Raiz.module.css:30-33` oculta el enlace actual (`--mostrar-enlace-actual-cabecera: none`) y el menú del colectivo queda con un solo ítem.
- **Problema.** Pasar de Mis proyectos a Administrar se siente como cambiar de sitio. Un menú de celular con un solo ítem parece roto.
- **Resultado esperado.**
  - Un solo marco (fondo, contenedor y escala del h1) para todo lo que cuelga del panel.
  - «Panel del colectivo» resaltado en toda subpantalla de un proyecto propio.
  - En celular, todos los ítems con el actual marcado.
- **Respaldo.**
  - §4 «Las subpantallas resaltan su sección»;
  - §4 «En celular van los mismos ítems y en el mismo orden»;
  - §6 «El mismo encabezado en todas las pantallas».
- **Comando.** `/impeccable layout` y `/impeccable adapt`.

### R5. Jerga dirigida a quien no es técnico (P1, A)

- **Dónde.** Ambos anchos.
  - «liderazgo»: `BienvenidaPage.jsx:28`, `UnirmeAColectivoPage.jsx:76`, Miembros («Pasar el liderazgo») y `PerfilColectivoPage.jsx:35`.
  - «Dejás de operar como parte del colectivo»: `AbandonarColectivo.jsx:45` y `MiembrosPage.jsx:30`.
  - La ayuda de Markdown con «\*\*negrita\*\*» y asteriscos visibles al editar.
  - «Identidad no disponible»: `FilaDePostulacion.jsx:10-15`.
  - «Visualizaciones» y «Avance promedio».
  - «Lo guardamos nosotros, no tu cuenta de ingreso» en Tu nombre.
- **Problema.** `PRODUCT.md` pide explicar los términos técnicos. La R3 de la ronda 04 sacó «liderazgo» de la espera, pero sigue en las dos pantallas anteriores.
- **Inconsistencia de datos.** `FilaDePostulacion` exige `esPublica === true` para mostrar el nombre. `PostulacionesRecibidasPage.jsx:256` acepta `undefined`. La misma postulación se ve como «Ada» en una pantalla y como «Identidad no disponible» en la otra.
- **Resultado esperado.**
  - «quien coordina el colectivo» o una expresión equivalente.
  - Ayuda de formato en lenguaje llano.
  - Un solo criterio para mostrar la identidad.
  - Un texto de respaldo que no parezca un error.
- **Respaldo.** §1 «Usá sus palabras, no las técnicas»; §3 «No reveles la implementación»; §3 «El mismo vocabulario en toda la app».
- **Comando.** `/impeccable clarify`.

### R6. Menú de cuenta fuera de la pantalla a 320 px (P1, B)

- **Dónde.** `MenuDeCuenta.module.css`: `.lista` usa `inset-inline-end: 0` y `min-inline-size: var(--ancho-menu-cuenta)`.
- **Problema.**
  - A 320 px, «Mi cuenta» baja a una segunda fila a la izquierda y la cabecera mide unos 96 px en vez de 64.
  - El menú se ancla al borde derecho del botón y se abre en parte fuera de la pantalla, por la izquierda.
  - La medida de `scrollWidth` no lo detecta porque desborda hacia la izquierda.
  - «Crear mi perfil de colaboradora» ocupa dos renglones en ambos anchos.
- **Resultado esperado.** A 320 px, la cabecera en una fila y el menú completo dentro de la pantalla, con 16 px de margen.
- **Respaldo.** §9 «foco visible y nunca tapado»; §12 «bien en celular, sin botones partidos ni scroll horizontal».
- **Comando.** `/impeccable adapt`.

### R7. Palabras cortadas al medio (P2, A y B)

- **Dónde.**
  - `Estadistica/Estadisticas.module.css:55`: `overflow-wrap: anywhere` en `th` y `td`. A 1280 px aparecen «Esta / do», «Visualizaci / ones» y «Logr / os». El `@media (max-width: 700px)` de la línea 75 no usa la sintaxis de rango de `DESIGN.md`.
  - `Colectivo/MarcoDelPanelDelColectivo.module.css:36`: «Postulacio / nes» en la barra del panel a 320 px.
- **Resultado esperado.** `anywhere` solo en columnas de texto libre. Encabezados y enlaces de la barra sin cortes dentro de una palabra.
- **Respaldo.** §7 «Nada de botones partidos en dos renglones ni espaciados raros».
- **Comando.** `/impeccable polish`.

### R8. Resumen del colectivo: densidad y destinos repetidos (P2, A)

- **Dónde.** `/colectivo/resumen`. A 320 px mide unos 3.800 px.
- **Problema.**
  - Hay 8 indicadores y una tabla que repite los proyectos.
  - «Perfiles abiertos» aparece suelto.
  - «Tus proyectos» repite Mis proyectos.
  - «Postulaciones pendientes» repite su pantalla.
  - «Acciones rápidas» repite destinos que ya están.
  - Hay unas 12 acciones visibles, y lo urgente (postulaciones por revisar) queda a mitad de página.
- **Resultado esperado.**
  - Arriba, lo que espera respuesta, con su acción.
  - Después, los proyectos con su estado.
  - Las estadísticas en un bloque plegable.
  - Cada destino una sola vez.
- **Respaldo.** §4 «Una acción, un lugar»; §5 «primero lo urgente»; §7 «Sacá lo que no aporta».
- **Comando.** `/impeccable distill`.

### R9. Inicio y Proyectos contradicen `DESIGN.md` (P2, A y detector)

- **Dónde.**
  - `InicioPage.jsx:5-6` y `ProyectosPage.jsx:3`: ilustraciones contra `DESIGN.md:511` y `:605`.
  - FAQ en acordeón, contra `DESIGN.md:405` («respuesta siempre visible»).
  - Marca `</>` que funciona como logo, contra `PRODUCT.md` («No hay logo»).
  - Detector, todo en `InicioPage.module.css`: tamaños fuera de escala en `:32`, `:44`, `:58` y `:168`, y `line-height: 1.25` en `:161`, que el overlay marca como `tight-leading`. Lo mismo pasa en `:259`.
  - A 320 px, el enlace «Proyectos» de la cabecera del visitante toca el borde derecho.
- **Problema.** La fuente de verdad no describe lo que se ve.
- **Resultado esperado.** Decidir una de dos:
  - adoptar las ilustraciones y actualizar `DESIGN.md` y `docs/decisiones.md`;
  - volver a la introducción tipográfica.

  En los dos casos, tamaños de la escala y 16 px de margen en la cabecera.
- **Respaldo.** §6 «Si se vuelve a un diseño anterior, se recupera el estilo»; §6 «Colores y espacios desde variables… del sistema de diseño».
- **Comando.** `/impeccable document` (si se adoptan) o `/impeccable distill`.

### R10. Acciones análogas con tratamientos distintos (P2, A)

- **Dónde.** Ambos anchos, salvo donde se indica.
  - «Retirar postulación» es secundario y «Cancelar la solicitud» es peligroso, y las dos acciones son reversibles.
  - «Dar de baja mi perfil», «Dar de baja el colectivo» y «Salir del colectivo» van a ancho completo a 1280.
  - La píldora «Pendiente» de Mis postulaciones no tiene ícono.
  - La etiqueta «educación» es una píldora petróleo en Perfil del colectivo.
  - «Contactar» deshabilitado va corrido respecto del habilitado en Colaboradoras para este perfil.
  - «Volver al proyecto» no tiene chevron en Administrar ni en Recibidas.
  - El detalle dice «Abierto» y la tarjeta dice «Abierta».
- **Resultado esperado.**
  - Lo reversible es secundario y lo permanente, peligroso.
  - Los botones peligrosos tienen ancho natural.
  - El sello compartido en Mis postulaciones.
  - La etiqueta con su componente.
  - Un solo «Volver».
- **Respaldo.** §6 «Un solo estilo de… botones… con el mismo tamaño en todas las pantallas»; §3 «El mismo vocabulario en toda la app».
- **Comando.** `/impeccable polish`.

### R11. Encabezados y nombres accesibles (P2, B y audit)

- **Dónde.**
  - Salto de H1 a H3 en `MiembrosPage.jsx:152`, `SolicitudesDeIngresoPage.jsx:182` y `MisSolicitudesPage.jsx:169` (ambos anchos). La R4 de la ronda 04 ya lo marcaba en la espera.
  - H2 vacío en `DialogoDeConfirmacion.jsx` mientras el diálogo está cerrado, porque `MiembrosPage.jsx:102`, `SolicitudesDeIngresoPage.jsx:132` y `PostulacionesRecibidasPage.jsx:202` le pasan `titulo={accion?.…}` con `accion = null`.
  - `MiembrosPage.jsx:163`: el `aria-label` «Pasarle el liderazgo a …» no contiene el texto visible «Pasar el liderazgo» (`label-content-name-mismatch`, WCAG 2.5.3).
  - `HabilidadForm.jsx:51`: `aria-describedby="ayuda-descripcion"` apunta a un id que no existe, el placeholder hace de ayuda (`:38` y `:52`) y los ids son fijos.
- **Resultado esperado.**
  - Sin saltos de nivel.
  - Ningún encabezado vacío.
  - Nombres accesibles que empiecen con el texto visible.
  - Ayuda de campo vinculada a un id que exista.
- **Respaldo.** §9 «Un solo `<h1>` por página y sin saltar niveles»; §9 «ayuda con `aria-describedby`»; §9 «el placeholder nunca reemplaza al label».
- **Comando.** `/impeccable harden`.

### R12. Unirme a un colectivo y Bienvenida: pendientes de la ronda 04 (P2, A)

- **Dónde.** `TarjetaParaUnirse.jsx:23` y `:33-41`, y `BienvenidaPage`.
- **Problema.** Siguen sin resolver estos requisitos de la ronda 04:
  - **R6:** la ubicación no aparece junto al tipo.
  - **R7:** «Pedir sumarme» sigue como primario.
  - **R10:** Bienvenida se ve en 2 + 1, con una celda vacía a 1280.
  - **R13:** queda el ejemplo «Villa Fiorito, Lomas de Zamora».
  - **R14:** las tarjetas tienen sombra en reposo.
- **Resultado esperado.** Lo que pide la ronda 04.
- **Respaldo.** §5 «Pocas opciones o bien agrupadas cuando hay que decidir»; §6 «Un solo elemento destacado por pantalla».
- **Comando.** `/impeccable clarify` y `/impeccable layout`.

### R13. Movimiento reducido sin señal de carga (P2, audit)

- **Dónde.** `Styles/base.css:136-144`.
- **Problema.** El apagado global lleva toda animación y transición a 0.01ms con una sola iteración. El spinner de `Boton` (`Boton.module.css:91`) y el pulso del `Esqueleto` quedan quietos, y la única señal de carga es el texto «Guardando…».
- **Resultado esperado.** Con movimiento reducido, una alternativa que siga mostrando que algo está cargando, como un esqueleto estático con texto o un indicador sin rotación.
- **Respaldo.** §2 «Mostrá siempre el estado del sistema».
- **Comando.** `/impeccable animate`.

### R14. Códigos y nombres de relleno que se filtran (P3, A)

- **Dónde.**
  - «Perfil N»: `Formatos/colaboracion.js:54` y `PostulacionesRecibidasPage.jsx:69`.
  - El código del medio tal cual llega (por ejemplo «TELEGRAM»): `Formatos/contacto.js:24-26`.
- **Resultado esperado.** La descripción del perfil como respaldo y un texto genérico para un medio desconocido.
- **Respaldo.** §8 «estados legibles en vez de códigos».
- **Comando.** `/impeccable harden`.

### R15. Tamaños y claves sueltos (P3, B y audit)

- **Dónde.**
  - `Estadisticas.module.css:26` (`font: 700 1.75rem` en vez del token de Headline).
  - `TextoConFormato.module.css:44` (`code { font-size: 0.9em }`, que da 13.5 px contra el piso de 14).
  - `EstadisticasDelColectivo.jsx:83` (`<td key={i}>`).
  - Objetivos táctiles menores a 44 px pero mayores a 24, en ambos anchos:
    - «Quitar habilidad» y «Quitar etiqueta»: 44×32;
    - enlaces de nombre en Recibidas: 35×44;
    - enlace de proyecto en la tabla del Resumen: 235×24.
- **Respaldo.** §6 «Colores y espacios desde variables… del sistema de diseño»; §9 «Zonas de toque de 44×44 px»; §13 «la `key` es un ID estable».
- **Comando.** `/impeccable polish`.

## Observaciones menores (A)

- **Tarjeta de proyecto:** la descripción en lista se pega sin separadores («Turnos por familia Avisos por WhatsApp»), porque `sinMarcas` conserva los saltos y el `<p>` los colapsa.
- **Detalle:**
  - «¿Te gustaría colaborar? Ver perfiles disponibles» sigue visible para quien ya se postuló.
  - La franja del dueño tiene tres enlaces y `DESIGN.md` describe uno.
- **Colectivo y colaboradora públicos:** «Historia» y «Valoraciones recibidas» usan otra escala que el resto de los títulos. «ada-dev» no es enlace.
- **Habilidades:** el visitante ve «Nueva habilidad». Hay que confirmar que la ruta no existe en el build.
- **Sin permiso:** al visitante sin sesión le dice «Esta sección es para otro tipo de cuenta» y no le ofrece «Ingresar».
- **Perfil de la colaboradora:** conviven «Guardar cambios» y el guardado inmediato de las habilidades. El título dice «Tu perfil» y el menú dice «Mi perfil».
- **Mensajes:** «Te invitaron a…» no lleva al proyecto y no indica que el mensaje se despliega.
- **Miembros:** la persona actual no se distingue con «vos».
- **Colaboradoras para este perfil:** dice «Tiene 1 de 1 habilidad opcional» y nada sobre las requeridas.
- **Proyectos a 320 px:** el buscador, «Buscá por tema» y 5 selects ocupan unos 1.000 px antes de la primera tarjeta.

## Lo que funciona

- **El estado explicado.** `SelloDeBusqueda` («Abierta hasta el 30/11», «Límite / 1 vacante disponible») y los botones deshabilitados con su motivo («La búsqueda de este perfil está cerrada.», «No recibe mensajes internos.»).
- **La privacidad se ve.** Aparece en el diálogo de postulación («Con mi nombre / Contribución anónima» y el aviso de aceptación automática), en las altas y en la pantalla de contacto.
- **Formularios y diálogos.**
  - «(obligatorio)» en texto.
  - Error con ícono, borde y foco en el primer campo.
  - Diálogos que apilan «Cancelar» a 320 px y avisan «Esta acción no se puede deshacer.».
  - Pasos visibles en Nuevo proyecto.
- **Sistema técnico.**
  - Cero colores y espaciados fuera de tokens.
  - No hay `dangerouslySetInnerHTML`, `div` con `onClick` ni inputs sin label.
  - No hay desborde horizontal en ninguna pantalla ni estado.
  - Cumple WCAG 2.5.8 (24 px) en todas las pantallas.
  - Todas las páginas tienen título.
  - Landmarks únicos y `nav` con nombre.
  - Mis solicitudes ya tiene sellos y un camino ante el rechazo (ronda 04).

## Heurísticas (critique)

| # | Heurística | Puntaje | Problema clave |
|---|---|---|---|
| 1 | Visibilidad del estado | 3 | El estado va en `<strong>` en Recibidas y Solicitudes, y sin ícono en Mis postulaciones. |
| 2 | Coincidencia con el mundo real | 2 | «liderazgo», Markdown crudo, «Identidad no disponible», «Perfil 1». |
| 3 | Control y libertad | 3 | La cabecera marca «Proyectos» en el panel y el menú de celular queda con un ítem. |
| 4 | Consistencia | 2 | Dos marcos, varios corales y acciones análogas con estilos distintos. |
| 5 | Prevención de errores | 3 | Aceptar no nombra a la persona ni avisa del contacto. |
| 6 | Reconocer antes que recordar | 2 | Hay que decidir una postulación sin ver las habilidades. |
| 7 | Flexibilidad | 2 | Filtros en la URL; las acciones rápidas repiten destinos. |
| 8 | Estética y minimalismo | 2 | Resumen sobrecargado y coral repetido en tarjetas. |
| 9 | Recuperación de errores | 3 | Errores de campo claros y «Reintentar». |
| 10 | Ayuda | 2 | No hay ayuda para «Modo de aceptación», «Límite» ni «Contribución pública». |
| **Total** | | **24/40** | **Aceptable** |

Carga cognitiva alta: fallan 5 de los 8 puntos (foco único, agrupamiento, jerarquía, pocas opciones y memoria). Los puntos de decisión con más de cuatro opciones son Proyectos (siete controles de filtro), Resumen (unas 12 acciones) y Administrar proyecto (13 botones con tres perfiles).

## A definir

- **Ilustraciones de Inicio y Proyectos (R9).** ¿Se adoptan y se cambia `DESIGN.md`, o se vuelve a la introducción tipográfica?
- **Resumen del colectivo (R8).** ¿Pasa a ser una bandeja de «lo que te espera», con las estadísticas plegadas, o se mantiene el tablero?
- **Postulaciones recibidas (R2).** ¿El back devuelve las habilidades de la persona en la colaboración, o hace falta otra consulta? Hay que revisarlo contra `docs/PLAN-ENTIDADES.md` antes de prometerlo.
- **Orden de trabajo.** La propuesta es hacer primero los P1 de corrección directa (R1, R6, R3) y después los de diseño (R2, R4, R5).
