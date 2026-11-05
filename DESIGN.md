---
name: Código a Voluntad
description: Colectivos sociales y colaboradoras de software, en una cartelera clara para cualquiera.
colors:
  crema: "#FBF6EE"
  superficie: "#FFFDF8"
  hundido: "#F2EADC"
  linea: "#E3D8C6"
  borde-campo: "#857A6A"
  tinta: "#16282B"
  tinta-suave: "#4E5F61"
  blanco: "#FFFFFF"
  petroleo: "#0F4C4F"
  petroleo-hover: "#0A3739"
  petroleo-tenue: "#E1EDEB"
  coral-vivo: "#FF6F4D"
  coral: "#B23A1C"
  coral-hover: "#8F2D14"
  coral-tenue: "#FCE6DE"
  peligro: "#A3122A"
  peligro-hover: "#7F0D20"
  peligro-tenue: "#FBE4E6"
  exito: "#1F6B3A"
  exito-tenue: "#E3F1E6"
  aviso: "#8A4B00"
  aviso-tenue: "#FBEBD3"
  info: "#1D5794"
  info-tenue: "#E2ECF7"
typography:
  display:
    fontFamily: "'Bricolage Grotesque', 'Segoe UI', system-ui, sans-serif"
    fontSize: "clamp(2rem, 1.5rem + 2vw, 2.75rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
    fontVariation: "'opsz' 48"
  headline:
    fontFamily: "'Bricolage Grotesque', 'Segoe UI', system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.015em"
    fontVariation: "'opsz' 32"
  title:
    fontFamily: "'Bricolage Grotesque', 'Segoe UI', system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.005em"
    fontVariation: "'opsz' 20"
  body:
    fontFamily: "'Source Sans 3', 'Segoe UI', system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.55
  body-sm:
    fontFamily: "'Source Sans 3', 'Segoe UI', system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "'Source Sans 3', 'Segoe UI', system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.01em"
  button:
    fontFamily: "'Source Sans 3', 'Segoe UI', system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.25
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  pill: "999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "24px"
  "6": "32px"
  "7": "48px"
  "8": "64px"
components:
  button-primary:
    backgroundColor: "{colors.coral}"
    textColor: "{colors.blanco}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.coral-hover}"
    textColor: "{colors.blanco}"
  button-secondary:
    backgroundColor: "{colors.superficie}"
    textColor: "{colors.petroleo}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
    height: "44px"
  button-secondary-hover:
    backgroundColor: "{colors.petroleo-tenue}"
    textColor: "{colors.petroleo-hover}"
  button-danger:
    backgroundColor: "{colors.superficie}"
    textColor: "{colors.peligro}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
    height: "44px"
  button-danger-hover:
    backgroundColor: "{colors.peligro-tenue}"
    textColor: "{colors.peligro-hover}"
  button-danger-confirm:
    backgroundColor: "{colors.peligro}"
    textColor: "{colors.blanco}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
    height: "44px"
  button-danger-confirm-hover:
    backgroundColor: "{colors.peligro-hover}"
    textColor: "{colors.blanco}"
  chip-requerida:
    backgroundColor: "{colors.petroleo-tenue}"
    textColor: "{colors.petroleo}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "4px 12px"
    height: "32px"
  chip-opcional:
    backgroundColor: "{colors.superficie}"
    textColor: "{colors.tinta-suave}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "4px 12px"
    height: "32px"
  card-proyecto:
    backgroundColor: "{colors.superficie}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.lg}"
    padding: "24px"
  skeleton:
    backgroundColor: "{colors.hundido}"
    rounded: "{rounded.sm}"
  empty-state:
    backgroundColor: "{colors.superficie}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.lg}"
    padding: "48px 24px"
  error-state:
    backgroundColor: "{colors.peligro-tenue}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.lg}"
    padding: "24px"
  dialog-confirmacion:
    backgroundColor: "{colors.superficie}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.xl}"
    padding: "32px"
    width: "min(480px, calc(100vw - 32px))"
  input:
    backgroundColor: "{colors.superficie}"
    textColor: "{colors.tinta}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
    height: "44px"
---

<!-- SEED: establecido con el equipo antes de implementar, a partir de la paleta vinculante de PRODUCT.md y las tipografías de docs/plan-front.md §6. Volver a correr /impeccable document cuando exista el código, para registrar los tokens y componentes reales y generar .impeccable/design.json. -->

# Design System: Código a Voluntad

## Overview

**Creative North Star: "La cartelera comunitaria"**

Código a Voluntad se ve como la cartelera de un centro cultural bien cuidada: cada aviso se lee de un vistazo, dice qué necesita y si todavía está vigente. Quien llega desde un comedor o una cooperativa entiende sin saber de software; quien programa encuentra rápido dónde encaja. La metáfora gobierna la estructura y el tono, no el material: no hay corcho, chinches ni papel envejecido. Lo que se toma de la cartelera es la claridad de cada aviso y el **sello de estado**, que dice en texto si una búsqueda está abierta, completa o cerrada.

Es una superficie para operar: buscar, comparar, postularse, aceptar. La densidad es media, con aire generoso entre bloques y grupos apretados adentro. El crema es el fondo de todo (60 %), el verde petróleo da estructura (cabecera, títulos, chips requeridos, botones secundarios; 30 %) y el coral marca la única acción principal de cada pantalla y poco más (10 %). Tema claro solamente: la escena real es una pantalla compartida en un espacio comunitario o un celular a la luz del día.

**Key Characteristics:**

- Fondo crema cálido, texto en tinta petróleo casi negra, nunca negro puro ni gris neutro.
- Una sola acción coral por pantalla; todo lo demás es petróleo o neutro.
- Estados siempre con texto e ícono, jamás solo con color.
- Títulos en Bricolage Grotesque con personalidad; texto en Source Sans 3, muy legible.
- Plano en reposo; las sombras aparecen solo como respuesta (hover) o elevación real (diálogo).

## Colors

Paleta de tres voces vinculante: crema de fondo, verde petróleo como complementario oscuro y coral como acento, más cuatro colores de estado con significado fijo. Contrastes verificados con la fórmula de luminancia relativa de WCAG 2.2.

### Primary

- **Coral oscurecido** (`coral`): botón primario, enlaces destacados y la acción principal de cada pantalla. 5.55:1 sobre crema, 5.88:1 sobre superficie; texto blanco encima, 5.97:1. Hover en **Coral profundo** (`coral-hover`), 8.22:1 con blanco.
- **Coral vivo** (`coral-vivo`): solo decoración. 2.56:1 sobre crema, así que **nunca** lleva texto ni es el único portador de un significado. Sobre petróleo da 3.52:1 y sirve como subrayado del ítem activo en la cabecera, siempre junto a `aria-current` y peso 600.
- **Coral tenue** (`coral-tenue`): fondo de la selección de texto y del indicador de encaje ("Tenés 2 de 3 habilidades requeridas"). El coral oscurecido sobre él da 4.98:1.

### Secondary

- **Verde petróleo** (`petroleo`): cabecera, títulos de sección, texto de los botones secundarios y de los chips requeridos, enlaces comunes. 9.01:1 sobre crema; texto crema o blanco encima, 9.01:1 y 9.69:1.
- **Petróleo profundo** (`petroleo-hover`): hover de enlaces y botones secundarios. 12.98:1 con blanco.
- **Petróleo tenue** (`petroleo-tenue`): fondo de chips requeridos y hover de secundarios. El petróleo sobre él da 8.08:1; la tinta, 12.76:1.

### Neutral

- **Crema** (`crema`): fondo de la página. Es el 60 %.
- **Superficie** (`superficie`): tarjetas, diálogos, campos y paneles. Apenas más clara que el crema; la separación la hace la línea, no la sombra.
- **Hundido** (`hundido`): skeletons y zonas secundarias (barra de filtros en celular). La tinta sobre él da 12.81:1.
- **Línea** (`linea`): bordes de tarjetas y separadores. Decorativa (1.31:1): nunca es lo único que delimita un control.
- **Borde de campo** (`borde-campo`): borde de inputs, selects y chips opcionales. 3.91:1 sobre crema y 4.14:1 sobre superficie, por encima del 3:1 que pide WCAG 1.4.11 para componentes.
- **Tinta** (`tinta`): texto principal. 14.22:1 sobre crema.
- **Tinta suave** (`tinta-suave`): metadatos, ayudas y descripciones. 6.23:1 sobre crema y 5.61:1 sobre hundido. No hay texto más claro que este.

### Estados

Cada uno tiene su color de texto e ícono y un fondo tenue. Todos pasan 4.5:1 sobre su fondo tenue y sobre crema.

- **Éxito** (`exito` sobre `exito-tenue`, 5.58:1): "Abierta hasta el 30/11", postulación aceptada, avisos de éxito.
- **Aviso** (`aviso` sobre `aviso-tenue`, 5.81:1): "Límite alcanzado", postulación pendiente, fechas por vencer.
- **Información** (`info` sobre `info-tenue`, 6.18:1): avisos de privacidad ("Se comparten cuando aceptes su postulación") y ayuda contextual. También es el color del anillo de foco (6.87:1 sobre crema).
- **Peligro** (`peligro` sobre `peligro-tenue`, 6.48:1): errores, rechazada, desvinculada y acciones permanentes. Texto blanco sobre peligro, 7.84:1.
- **Neutro** (`tinta-suave` sobre `hundido`): "Cerrada", finalizada.

### Named Rules

**La regla de la voz única.** El coral oscurecido aparece en una sola acción por pantalla. Si dos botones coral compiten, uno pasa a secundario.

**La regla del coral que no habla.** El coral vivo es decoración: nunca texto, nunca el único indicio de un estado.

**La regla del rojo que no es coral.** El peligro es carmesí (hacia el magenta) y el acento es coral (hacia el naranja). Además, en la página el botón peligroso va con contorno; el relleno rojo existe solo dentro del diálogo de confirmación. Así un "Rechazar" nunca se confunde con un "Postularme".

## Typography

**Display Font:** Bricolage Grotesque (con Segoe UI y system-ui de respaldo)
**Body Font:** Source Sans 3 (con Segoe UI y system-ui de respaldo)

**Character:** Bricolage Grotesque tiene una grotesca con rasgos humanos, algo irregular y cálida, que sostiene la voz comunitaria en los títulos. Source Sans 3 es una sans de trabajo, abierta y muy legible en pantallas chicas, con cifras tabulares para fechas, horas y contadores.

Ambas son variables y se sirven desde el proyecto (`woff2` en `public/fonts/` con `@font-face` y `font-display: swap`), sin depender de un CDN ni sumar paquetes. Bricolage usa su eje de tamaño óptico (`opsz`) según el rol. **JetBrains Mono, opcional en §6, queda descartada:** una monoespaciada en los chips le habla a quien programa y aleja al colectivo, y las cifras tabulares de Source Sans 3 cubren los números.

### Hierarchy

- **Display** (700, `clamp(2rem, 1.5rem + 2vw, 2.75rem)`, 1.1): solo el `h1` de la búsqueda de proyectos, que es la entrada.
- **Headline** (700, 1.75rem, 1.2): el `h1` de las demás pantallas.
- **Title** (600, 1.25rem, 1.3): `h2` de sección, título de tarjeta y del diálogo.
- **Body** (400, 1.0625rem, 1.55): texto corrido, campos y descripciones, con un ancho máximo de 68ch. Va a 17px porque Source Sans 3 tiene la altura de x baja.
- **Body small** (400, 0.9375rem, 1.5): metadatos de tarjeta, ayudas de campo y "Mostrando X de Y".
- **Label** (600, 0.875rem, 1.3, +0.01em): chips, sellos de estado y labels de filtros. Nunca en mayúsculas sostenidas. Es el tamaño mínimo de texto de la app.
- **Button** (600, 1rem, 1.25): texto de botones.

### Named Rules

**La regla de los 14 píxeles.** Ningún texto baja de 0.875rem. Lo que no entra se resume, no se achica.

**La regla sin rótulo.** Ningún título lleva una etiqueta chiquita encima. El título se sostiene solo.

## Layout

- **Ritmo de 8 px**, con 4 px como medio paso solo dentro de componentes (chips, íconos con texto). Tokens `spacing.1` a `spacing.8`.
- **Contenedor** de hasta 1200px, con 16px de margen lateral en celular y 32px desde 768px.
- **Búsqueda de proyectos:** filtros en una columna lateral de 280px a la izquierda desde 1024px. Por debajo, un botón "Filtros (n)" abre un panel con los mismos campos. La grilla de tarjetas es `repeat(auto-fill, minmax(320px, 1fr))` con 24px de separación.
- **Detalle y formularios:** una columna de lectura de hasta 720px. Los perfiles del proyecto van en lista, uno debajo del otro, cada uno con su sello y su "Postularme".
- **Encabezado de pantalla** igual en todas: título, una línea de descripción en tinta suave y la acción principal alineada a la derecha (abajo del título en celular).
- **Proximidad:** 8–12px dentro de un grupo, 24px entre grupos, 48px entre secciones. Más espacio arriba de un título que abajo.
- **Puntos de quiebre:** 480px, 768px, 1024px y 1280px. Sin scroll horizontal a 320px ni con zoom al 200 %.
- **Zonas de toque** de 44×44px como mínimo en todo lo clickeable.

## Elevation & Depth

Plano en reposo. La profundidad la dan el cambio de tono (crema → superficie) y la línea de 1px. La sombra aparece solo cuando algo responde (una tarjeta en hover) o se eleva de verdad (diálogo, menú abierto). Las sombras tienen el tinte del petróleo, nunca gris neutro, y siempre desplazamiento con difuminado.

### Shadow Vocabulary

- **Respuesta** (`box-shadow: 0 2px 4px rgba(15, 76, 79, 0.06), 0 8px 20px -6px rgba(15, 76, 79, 0.14)`): hover de tarjeta de proyecto.
- **Elevación** (`box-shadow: 0 4px 8px rgba(15, 76, 79, 0.08), 0 24px 48px -12px rgba(15, 76, 79, 0.28)`): diálogo de confirmación, menú de cuenta y panel de filtros en celular.
- **Telón** (`::backdrop { background: rgba(22, 40, 43, 0.55); }`): fondo detrás del diálogo. Sin desenfoque.

### Named Rules

**La regla del plano por defecto.** Nada tiene sombra quieto. Si una sombra no responde a algo, sobra.

## Shapes

Esquinas amables pero firmes, que crecen con el tamaño del objeto: 4px en skeletons y sellos, 8px en botones y campos, 12px en tarjetas y paneles, 16px en el diálogo y forma de píldora solo en los chips de habilidad. Bordes de 1px; 1.5px en el contorno de los botones secundario y peligroso para que se lean como controles. Sin bordes laterales gruesos de color, sin recortes ni formas decorativas.

## Components

### Buttons

Táctiles y directos: se reconocen como botones a simple vista.

- **Forma:** esquinas de 8px (`rounded.md`), alto mínimo de 44px, `padding` 10px 20px, texto en una sola línea. Con ícono: 20px, separado 8px del texto.
- **Primario:** relleno coral oscurecido con texto blanco. Uno solo por pantalla ("Postularme", "Publicar proyecto", "Guardar perfil").
- **Secundario:** fondo superficie, contorno de 1.5px en petróleo y texto petróleo. Hover: fondo petróleo tenue. Para "Cancelar", "Reintentar", "Ver avance".
- **Peligroso:** fondo superficie, contorno de 1.5px en peligro, texto peligro y un ícono que anticipa la acción (cruz para rechazar, puerta para darse de baja). Hover: fondo peligro tenue. Nunca ejecuta directo: abre el diálogo de confirmación.
- **Peligroso de confirmación:** relleno peligro con texto blanco. Existe solo dentro del diálogo.
- **Foco:** anillo de 3px en `info` con 3px de separación (`outline-offset`), visible sobre crema y superficie. Sobre la cabecera petróleo, el anillo es crema.
- **Presionado:** el fondo baja al tono hover y el botón se desplaza 1px hacia abajo, en 120ms.
- **Enviando:** el texto cambia a gerundio ("Postulando…"), aparece un indicador circular de 16px a la izquierda, `aria-busy="true"` y el botón queda deshabilitado. Mantiene su ancho.
- **Deshabilitado:** fondo `hundido`, texto `tinta-suave`, sin borde de color y `cursor: not-allowed`. **Nunca solo con opacidad.** El motivo va visible debajo, en body small, enlazado con `aria-describedby` ("La búsqueda de este perfil cerró el 30/11").

### Chips de habilidades

La habilidad requerida y la opcional se distinguen por **cuatro señales que no dependen del color**: el grupo con su título, el borde, el peso y el ícono.

- **Agrupadas siempre que hay lugar:** dos listas con su título en label, "Requeridas" y "Opcionales". La agrupación es la señal principal y la que lee el lector de pantalla.
- **Requerida:** borde continuo de 1px en petróleo, fondo petróleo tenue, texto petróleo en peso 600, alto de 32px, forma de píldora.
- **Opcional:** borde **punteado** de 1px en `borde-campo`, fondo superficie, texto tinta suave en peso 400.
- **Mezcladas en una sola línea** (por ejemplo, en el perfil de una colaboradora comparado con un perfil): la opcional suma el texto visible "opcional" después del nombre ("Figma · opcional").
- **La tenés:** cuando la colaboradora con sesión tiene la habilidad, el chip suma una tilde de 16px a la izquierda y el texto oculto "La tenés", para lectores de pantalla.
- **Como filtro** (barra lateral): son checkboxes reales con su label con forma de chip; marcado = relleno petróleo con texto blanco y tilde. Nunca un `div` clickeable.
- **Desborde en tarjeta:** como máximo cuatro chips y un "+2 más" en texto, no clickeable. El detalle muestra todas.

### Tarjeta de proyecto

Un aviso de la cartelera: todo lo necesario para decidir si vale la pena entrar.

- **Contenedor:** fondo superficie, borde de 1px en línea, esquinas de 12px y `padding` de 24px. Es un `<article>` dentro de un `<li>`.
- **Orden de lectura:** (1) título del proyecto en title, en petróleo; es el único enlace y su área se estira a toda la tarjeta; (2) descripción en body, cortada a tres líneas; (3) chips de habilidades requeridas; (4) pie con compromiso y modalidad legibles ("5 h por mes · Gratuita") y el sello del perfil más próximo a cerrar.
- **Modalidad, en texto:** `GRATUITA` → "Gratuita", `OFRECE_INCENTIVO_ECONOMICO` → "Con incentivo económico", `EXISTE_POSIBILIDAD_DE_CONTRATACION` → "Con posibilidad de contratación". Nunca el código del enum.
- **Pendiente del back:** el colectivo que publica el proyecto (nombre y provincia). `ProyectoDto` no lo trae; cuando el back lo sume, va entre el título y la descripción, en body small tinta suave. Hasta entonces la tarjeta no lo muestra ni lo deduce.
- **Encaje:** con sesión de colaboradora, una franja de coral tenue arriba del pie con "Tenés 2 de 3 habilidades requeridas" en coral oscurecido, peso 600. Es el único coral de la tarjeta.
- **Sello de estado:** label con borde de 1px, esquinas de 4px, ícono de 16px y texto en el color de su estado sobre su fondo tenue ("Abierta hasta el 30/11", "Límite alcanzado", "Cerrada").
- **Hover:** el borde pasa a petróleo y aparece la sombra de respuesta, en 150ms. El título no se subraya.
- **Foco:** el anillo de foco rodea la tarjeta entera (`:focus-within` con el enlace del título).
- **Sin** imagen de portada inventada, sin íconos decorativos y sin tarjetas dentro de tarjetas.

### Skeleton

Reproduce la forma real de lo que va a aparecer, para que no haya saltos al cargar.

- **Bloques** en `hundido`, esquinas de 4px, con la altura de la línea de texto que reemplazan: un título al 60 % del ancho, dos líneas de metadato al 40 %, tres líneas de descripción al 100 %, 100 % y 70 %, y tres píldoras de 32px para los chips.
- **Cantidad:** tantos como entran en la primera vista (seis tarjetas en escritorio, dos en celular).
- **Movimiento:** pulso de opacidad entre 1 y 0.55 cada 1.6s. Con `prefers-reduced-motion: reduce`, quieto.
- **Accesibilidad:** el contenedor lleva `aria-busy="true"` y un texto oculto "Cargando proyectos…" en una región `aria-live="polite"`; los bloques llevan `aria-hidden="true"`.
- Aparece recién a los 300ms del pedido, para que una respuesta rápida no parpadee.

### Estado vacío

Explica por qué no hay nada y ofrece el paso siguiente.

- **Contenedor:** fondo superficie, borde **punteado** de 1px en línea, esquinas de 12px y `padding` 48px 24px, contenido centrado con un ancho máximo de 48ch.
- **Contenido:** ícono de línea de 32px en petróleo (`aria-hidden`), título en title ("Todavía no publicaste proyectos"), una o dos líneas en tinta suave y una sola acción: primaria si es la tarea natural ("Publicar el primero"), si no, secundaria.
- **Sin resultados** es otra variante: repite lo buscado ("No hay proyectos para «Python»"), sugiere ampliar y ofrece "Limpiar filtros" como botón secundario.
- Sin ilustraciones inventadas.

### Estado de error con "Reintentar"

- **Contenedor:** fondo peligro tenue, borde de 1px en peligro, esquinas de 12px, `padding` de 24px y `role="alert"`. Ocupa el lugar del contenido que falló; el título de la pantalla se mantiene.
- **Contenido:** ícono de alerta de 24px en peligro, título en title tinta ("No pudimos cargar los proyectos"), el mensaje en lenguaje de la persona según el `ApiError` ("No pudimos conectarnos con el servidor. Revisá tu conexión.") y el botón secundario **"Reintentar"** con ícono de flecha circular.
- Al reintentar, el botón pasa a "Reintentando…" deshabilitado; si vuelve a fallar, el foco va al título del error.
- Para 429, sin botón: "Hiciste muchas búsquedas seguidas. Esperá unos segundos y volvé a intentar."
- Nunca el error crudo, el status ni un ID técnico.

### Diálogo de confirmación

Protege una acción permanente. `<dialog>` nativo abierto con `showModal()`.

- **Caja:** fondo superficie, esquinas de 16px, `padding` de 32px (24px en celular), ancho `min(480px, 100vw - 32px)`, sombra de elevación y telón en tinta al 55 %.
- **Contenido, en orden:** título en title que nombra la acción y el objeto ("¿Rechazar la postulación de Ana?"); qué pasa, en body ("Ana va a ver que su postulación fue rechazada."); la línea **"Esta acción no se puede deshacer."** en peso 600 y color peligro, con su ícono; y las acciones.
- **Acciones:** a la derecha, "Cancelar" (secundario) primero y el peligroso de confirmación con el verbo exacto ("Rechazar postulación") último. En celular se apilan a ancho completo, con el peligroso arriba.
- **Foco:** al abrir va a "Cancelar", no al botón peligroso; Esc cierra; al cerrar, el foco vuelve al botón que lo abrió. `aria-labelledby` apunta al título y `aria-describedby` a la explicación.
- **Enviando:** el botón peligroso pasa a "Rechazando…" deshabilitado, y "Cancelar" también se deshabilita.
- **Entrada:** opacidad y escala de 0.97 a 1 en 180ms con ease-out; sin animación con `prefers-reduced-motion`.

### Inputs / Fields

- **Estilo:** fondo superficie, borde de 1px en `borde-campo`, esquinas de 8px, alto de 44px y texto en body. El label va siempre visible arriba, en label tinta; si es obligatorio, lleva "(obligatorio)" en texto.
- **Foco:** el borde pasa a petróleo y aparece el anillo de foco en `info`.
- **Error:** borde de 1.5px en peligro, `aria-invalid="true"`, mensaje debajo con ícono, en peligro y vinculado con `aria-describedby`. Lo cargado se conserva.
- **Ayuda:** body small tinta suave debajo del campo, vinculada con `aria-describedby`.

### Navigation

- **Cabecera:** franja petróleo a todo el ancho con el nombre "Código a Voluntad" en Bricolage 700 crema (como texto, no como logo inventado), dos o tres enlaces principales en crema y el menú de cuenta a la derecha.
- **Ítem actual:** peso 600 con un subrayado de 3px en coral vivo y `aria-current="page"`. Hover: subrayado de 1px crema.
- **Celular:** botón "Menú" de 44px que abre un panel con los mismos ítems en el mismo orden.
- **Saltar al contenido:** primer enlace del documento, visible al recibir el foco.

### Superficies del navegador

- Selección de texto en coral tenue con texto tinta; cursor de escritura (`caret-color`) en petróleo.
- Subrayado de enlaces con `text-underline-offset: 0.2em` y 1px de grosor (2px en hover).
- Cifras tabulares (`font-variant-numeric: tabular-nums`) en fechas, horas, porcentajes y paginación.
- Íconos de línea propios en SVG, 1.75px de trazo y extremos redondeados, en 16, 20, 24 y 32px. Nada de emojis ni caracteres Unicode como íconos.

## Do's and Don'ts

### Do:

- **Do** usar el coral oscurecido (`coral`) en una sola acción principal por pantalla.
- **Do** acompañar cada estado con texto e ícono: el color confirma, no informa solo.
- **Do** mostrar el motivo debajo de todo botón deshabilitado, enlazado con `aria-describedby`.
- **Do** separar las habilidades en "Requeridas" y "Opcionales" y diferenciar los chips con borde continuo o punteado y con el peso.
- **Do** usar los tokens de color y espaciado; ningún valor suelto en un componente.
- **Do** mantener 44×44px en todo lo clickeable y verificar el contraste de todo par de color nuevo antes de usarlo.
- **Do** dar los botones peligrosos con contorno en la página y con relleno solo dentro del diálogo.

### Don't:

- **Don't** poner texto sobre el coral vivo ni usarlo como único indicador de nada (2.56:1 sobre crema).
- **Don't** usar texto más claro que la tinta suave, ni grises neutros: los neutros vienen del crema y del petróleo.
- **Don't** deshabilitar con opacidad.
- **Don't** usar mayúsculas sostenidas, rótulos encima de los títulos ni numeración de secciones.
- **Don't** usar monoespaciada, ni siquiera en chips o números.
- **Don't** usar bordes laterales gruesos de color en tarjetas, alertas o avisos.
- **Don't** usar sombras sin desplazamiento, sombras duras sin difuminado, vidrio ni degradados en texto.
- **Don't** inventar logos, ilustraciones, fotos de portada ni testimonios para llenar huecos.
- **Don't** usar `window.confirm()`: las acciones permanentes van por el diálogo de confirmación.
