---
name: Código a Voluntad
description: Colectivos sociales y colaboradoras de software, en una cartelera clara para cualquiera.
colors:
  crema: "#FFFFFF"
  crema-marca: "#FBF6EE"
  superficie: "#FFFFFF"
  hundido: "#F2EADC"
  linea: "#D5C9B4"
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
  telon: "rgba(22, 40, 43, 0.55)"
  velo-tinta: "rgba(22, 40, 43, 0.08)"
  velo-petroleo: "rgba(15, 76, 79, 0.12)"
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
  pildora: "999px"
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
  button-disabled:
    backgroundColor: "{colors.hundido}"
    textColor: "{colors.tinta-suave}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
    height: "44px"
  chip-requerida:
    backgroundColor: "{colors.petroleo-tenue}"
    textColor: "{colors.petroleo}"
    typography: "{typography.label}"
    rounded: "{rounded.pildora}"
    padding: "4px 12px"
    height: "32px"
  chip-opcional:
    backgroundColor: "{colors.superficie}"
    textColor: "{colors.tinta-suave}"
    typography: "{typography.label}"
    rounded: "{rounded.pildora}"
    padding: "4px 12px"
    height: "32px"
  etiqueta:
    backgroundColor: "{colors.hundido}"
    textColor: "{colors.tinta}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 12px"
    height: "32px"
  etiqueta-busqueda:
    backgroundColor: "{colors.hundido}"
    textColor: "{colors.tinta}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
    height: "44px"
  sello-abierta:
    backgroundColor: "{colors.exito-tenue}"
    textColor: "{colors.exito}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "4px 8px"
  sello-limite:
    backgroundColor: "{colors.aviso-tenue}"
    textColor: "{colors.aviso}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "4px 8px"
  sello-rechazada:
    backgroundColor: "{colors.peligro-tenue}"
    textColor: "{colors.peligro}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "4px 8px"
  sello-cerrada:
    backgroundColor: "{colors.hundido}"
    textColor: "{colors.tinta-suave}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "4px 8px"
  franja-encaje:
    backgroundColor: "{colors.coral-tenue}"
    textColor: "{colors.coral}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
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
  aviso-exito:
    backgroundColor: "{colors.exito-tenue}"
    textColor: "{colors.tinta}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    width: "400px"
  aviso-error:
    backgroundColor: "{colors.peligro-tenue}"
    textColor: "{colors.tinta}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    width: "400px"
  input:
    backgroundColor: "{colors.superficie}"
    textColor: "{colors.tinta}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
    height: "44px"
  cabecera:
    backgroundColor: "{colors.petroleo}"
    textColor: "{colors.crema-marca}"
    height: "64px"
  pie-pagina:
    backgroundColor: "{colors.petroleo}"
    textColor: "{colors.crema-marca}"
    typography: "{typography.body}"
    padding: "16px"
    width: "100%"
  paginacion-actual:
    backgroundColor: "{colors.petroleo-tenue}"
    textColor: "{colors.petroleo}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    size: "44px"
---

# Design System: Código a Voluntad

## Overview

**Creative North Star: "La cartelera comunitaria"**

Código a Voluntad se ve como la cartelera de un centro cultural bien cuidada: cada aviso se lee de un vistazo, dice qué necesita y si todavía está vigente. Quien llega desde un comedor o una cooperativa entiende sin saber de software; quien programa encuentra rápido dónde encaja. La metáfora gobierna la estructura y el tono, no el material: no hay corcho, chinches ni papel envejecido. Lo que se toma de la cartelera es la claridad de cada aviso y el **sello de estado**, que dice en texto si una búsqueda está abierta, completa o cerrada.

Es una superficie para operar: buscar, comparar, postularse, aceptar. La densidad es media, con aire generoso entre bloques y grupos apretados adentro. El crema es el fondo de todo (60 %), el verde petróleo da estructura (cabecera, títulos, chips requeridos, botones secundarios; 30 %) y el coral marca la única acción principal de cada pantalla y poco más (10 %). Tema claro solamente: la escena real es una pantalla compartida en un espacio comunitario o un celular a la luz del día.

Todo valor vive como variable CSS en `src/Presentation/Styles/tokens.css` (`--color-*`, `--espacio-*`, `--radio-*`, `--texto-*`, `--sombra-*`, `--duracion-*`) y cada componente lo toma de ahí, con CSS Modules. Ningún módulo lleva colores ni medidas sueltas.

**Key Characteristics:**

- Fondo blanco, con el crema cálido como color de marca en la cabecera, texto en tinta petróleo casi negra, nunca negro puro ni gris neutro.
- Una sola acción coral por pantalla; todo lo demás es petróleo o neutro.
- Estados siempre con texto e ícono, jamás solo con color.
- Títulos en Bricolage Grotesque con personalidad; texto en Source Sans 3, muy legible.
- Plano en reposo; las sombras aparecen solo como respuesta (hover) o elevación real (diálogo, menús, avisos).

## Colors

Paleta de tres voces vinculante: blanco de fondo, crema de marca, verde petróleo como complementario oscuro y coral como acento, más cuatro colores de estado con significado fijo y tres velos translúcidos. Contrastes verificados con la fórmula de luminancia relativa de WCAG 2.2.

### Primary

- **Coral oscurecido** (`coral`): botón primario y la acción principal de cada pantalla ("Crear perfil", "Guardar cambios", "Enviar postulación"). 5.55:1 sobre crema, 5.88:1 sobre superficie; texto blanco encima, 5.97:1. Hover en **Coral profundo** (`coral-hover`), 8.22:1 con blanco.
- **Coral vivo** (`coral-vivo`): solo decoración. 2.56:1 sobre crema, así que **nunca** lleva texto ni es el único portador de un significado. Sobre petróleo da 3.52:1 y es el subrayado de 3px del ítem activo en la cabecera, siempre junto a `aria-current` y peso 600.
- **Coral tenue** (`coral-tenue`): fondo de la selección de texto y de la franja de encaje ("Tenés 2 de 3 habilidades requeridas"). El coral oscurecido sobre él da 4.98:1.

### Secondary

- **Verde petróleo** (`petroleo`): cabecera, texto de los botones secundarios y de los chips requeridos, título de la tarjeta, enlaces comunes, página actual de la paginación y color de los radios y casillas (`accent-color`). 9.01:1 sobre crema; texto crema o blanco encima, 9.01:1 y 9.69:1.
- **Petróleo profundo** (`petroleo-hover`): hover de enlaces, de botones secundarios y de los botones de la cabecera. 12.98:1 con blanco.
- **Petróleo tenue** (`petroleo-tenue`): fondo de chips requeridos, de la página actual y hover de secundarios y opciones de menú. El petróleo sobre él da 8.08:1; la tinta, 12.76:1.

### Neutral

- **Crema** (`crema`): fondo de la página, blanco puro. Es el 60 %.
- **Crema de marca** (`crema-marca`, `#FBF6EE`): texto y contornos sobre la cabecera petróleo. Nunca de fondo de página.
- **Superficie** (`superficie`): tarjetas, diálogos, campos, menús y paneles. Blanca, igual que el fondo; las tarjetas se separan por la línea y la sombra de tarjeta (`0 1px 2px` y `0 4px 12px` en tinta al 8 % y 6 %).
- **Hundido** (`hundido`): skeletons, botones deshabilitados, etiquetas de tema y sellos neutros. La tinta sobre él da 12.81:1.
- **Línea** (`linea`): bordes de tarjetas, separadores y el borde rayado del estado vacío. Decorativa (1.64:1 sobre blanco): nunca es lo único que delimita un control.
- **Borde de campo** (`borde-campo`): borde de inputs, chips opcionales, etiquetas y sellos neutros. 3.91:1 sobre crema y 4.14:1 sobre superficie, por encima del 3:1 que pide WCAG 1.4.11 para componentes.
- **Tinta** (`tinta`): texto principal. 14.22:1 sobre crema.
- **Tinta suave** (`tinta-suave`): metadatos, ayudas, descripciones y el motivo de un botón deshabilitado. 6.23:1 sobre crema y 5.61:1 sobre hundido. No hay texto más claro que este.

### Estados

Cada uno tiene su color de texto e ícono y un fondo tenue. Todos pasan 4.5:1 sobre su fondo tenue y sobre crema.

- **Éxito** (`exito` sobre `exito-tenue`, 5.58:1): "Abierta hasta el 30/11", "Tu postulación fue aceptada", avisos de éxito.
- **Aviso** (`aviso` sobre `aviso-tenue`, 5.81:1): "Límite alcanzado", postulación pendiente, fechas por vencer.
- **Información** (`info` sobre `info-tenue`, 6.18:1): avisos de privacidad ("Tus datos de contacto se comparten solo si el colectivo acepta tu postulación") y ayuda contextual. También es el color del anillo de foco (6.87:1 sobre crema).
- **Peligro** (`peligro` sobre `peligro-tenue`, 6.48:1): errores, "Tu postulación fue rechazada", desvinculada y confirmaciones peligrosas. Texto blanco sobre peligro, 7.84:1.
- **Neutro** (`tinta-suave` sobre `hundido`, con borde de campo): "Cerrada", "Finalizado".

### Velos

- **Telón** (`telon`): fondo detrás de los diálogos, tinta al 55 %. Sin desenfoque.
- **Velo de tinta** (`velo-tinta`): hover del botón para cerrar un aviso.
- **Velo de petróleo** (`velo-petroleo`): hover de los botones para quitar un chip o una etiqueta en los formularios.

### Named Rules

**La regla de la voz única.** El coral oscurecido aparece en una sola acción por pantalla. Si dos botones coral compiten, uno pasa a secundario. Por eso "Postularme" es secundario en el detalle del proyecto, aunque haya varios perfiles, y el coral queda para "Enviar postulación" dentro del diálogo.

**La regla del coral que no habla.** El coral vivo es decoración: nunca texto, nunca el único indicio de un estado.

**La regla del rojo que no es coral.** El peligro es carmesí (hacia el magenta) y el acento es coral (hacia el naranja). Además, en la página el botón peligroso va con contorno; el relleno rojo existe solo dentro del diálogo de confirmación. Así un "Rechazar" nunca se confunde con un "Postularme".

## Typography

**Display Font:** Bricolage Grotesque (con Segoe UI y system-ui de respaldo)
**Body Font:** Source Sans 3 (con Segoe UI y system-ui de respaldo)

**Character:** Bricolage Grotesque tiene una grotesca con rasgos humanos, algo irregular y cálida, que sostiene la voz comunitaria en los títulos. Source Sans 3 es una sans de trabajo, abierta y muy legible en pantallas chicas, con cifras tabulares para fechas, horas y contadores.

Ambas son variables y se sirven desde el proyecto (`public/fonts/*.woff2`, con `@font-face` y `font-display: swap` en `src/Presentation/Styles/base.css`), sin depender de un CDN ni sumar paquetes. Bricolage usa su eje de tamaño óptico (`opsz`) según el rol. Los títulos usan `text-wrap: balance` y los párrafos `text-wrap: pretty`. No hay monoespaciada: las cifras tabulares de Source Sans 3 cubren los números.

### Hierarchy

- **Display** (700, `clamp(2rem, 1.5rem + 2vw, 2.75rem)`, 1.1): el `h1` de la introducción pública de Inicio y de la búsqueda de proyectos. En Inicio va en petróleo, con un ancho máximo de lectura.
- **Headline** (700, 1.75rem, 1.2): el `h1` de las demás pantallas.
- **Title** (600, 1.25rem, 1.3): `h2` y `h3` (secciones, título de tarjeta, título de diálogo) y la marca de la cabecera, en peso 700.
- **Body** (400, 1.0625rem, 1.55): texto corrido, campos y descripciones, con un ancho máximo de 68ch. Va a 17px porque Source Sans 3 tiene la altura de x baja.
- **Body small** (400, 0.9375rem, 1.5): metadatos de tarjeta, ayudas de campo, motivo de un botón deshabilitado, franja de encaje y "Mostrando X–Y de N".
- **Label** (600, 0.875rem, 1.3, +0.01em): labels de campos, chips, sellos y avisos. Nunca en mayúsculas sostenidas. Es el tamaño mínimo de texto de la app.
- **Button** (600, 1rem, 1.25): texto de botones, en una sola línea.

### Named Rules

**La regla de los 14 píxeles.** Ningún texto baja de 0.875rem. Lo que no entra se resume, no se achica. La única excepción es la marca de la cabecera, que baja a 1rem por debajo de 375px con un solo enlace principal y de 360px con varios, para seguir en una línea.

**La regla sin rótulo.** Ningún título lleva una etiqueta chiquita encima. El título se sostiene solo.

## Layout

- **Ritmo de 8px**, con 4px como medio paso solo dentro de componentes (chips, sellos, íconos con texto). Escala `spacing.1` a `spacing.8`.
- **Contenedor** de hasta 1200px, con 16px de margen lateral en celular y 32px desde 768px. El contenido principal arranca a 48px de la cabecera y deja 64px abajo.
- **Puntos de quiebre:** se escriben con sintaxis de rango y en `rem` (`@media (width >= 48rem)`, `@media (width < 30rem)`), así acompañan a quien agranda la letra del navegador y no hace falta el "menos uno". Escala:
  - `22.5rem` (360px): cabecera y menú de cuenta compactos.
  - `30rem` (480px): diálogos y avisos de celular, botón "Menú" de solo ícono.
  - `40rem` (640px): filas de los editores en una línea, indicador de pasos completo, preguntas de Inicio en dos columnas.
  - `48rem` (768px): la cabecera despliega la navegación del colectivo y los márgenes pasan a 32px.
  - `56.25rem` (900px): dos columnas en el detalle del proyecto, el perfil de la colaboradora y el resumen del panel.
  - `75rem` (1200px): navegación lateral del panel del colectivo, indicadores en una fila y ajustes finales de Inicio.
  - Única excepción: `23.4375rem` (375px) en la cabecera, para compactarla cuando además muestra los enlaces de cuenta.
  - Sin scroll horizontal a 320px ni con zoom al 200 %.
- **Búsqueda de proyectos:** buscador por etiqueta arriba, vistas "Para vos" y "Todos los proyectos" como pestañas subrayadas (colaboradora) y una grilla `repeat(auto-fill, minmax(min(100%, 320px), 1fr))` con 24px de separación. Al cambiar de página, las tarjetas viejas quedan atenuadas a 0.55 de opacidad (`--opacidad-atenuada`) e inertes (`inert` y `aria-hidden`): salen del recorrido por teclado y de las tecnologías de asistencia hasta que llegan las nuevas, con "Cargando página N…" visible arriba de la grilla. Junto al buscador, «Buscá por tema» ofrece las etiquetas únicas de los resultados vigentes; elegir una sincroniza campo y URL y vuelve a la página 1 de «Todos los proyectos». La columna lateral de filtros espera a que el back sume filtros (ver `docs/decisiones.md`).
- **Detalle, perfiles y formularios:** una columna de lectura de hasta 720px. Los perfiles del proyecto van en lista, uno debajo del otro, cada uno con su sello, sus habilidades agrupadas, sus datos en una grilla de dos columnas y su acción al pie.
- **Bienvenida:** opciones en una grilla `auto-fit` de tarjetas de al menos 260px.
- **Inicio público:** introducción tipográfica y secciones separadas por 64px. Los recorridos por rol y las preguntas con sus respuestas usan filas de una columna en celular y dos columnas asimétricas (1:2), con 48px entre ellas, desde 768px. El texto explicativo conserva el ancho de lectura; no se convierte en una grilla de tarjetas.
- **Encabezado de pantalla operativa:** título, una línea de descripción en tinta suave y la acción secundaria alineada a la derecha (abajo del título en celular). Inicio usa la introducción pública descrita en Components.
- **Proximidad:** 8–12px dentro de un grupo, 24px entre grupos, 48px entre secciones. Más espacio arriba de un título que abajo.
- **Zonas de toque** de 44×44px como mínimo en todo lo clickeable (`--toque-minimo`).

## Elevation & Depth

Plano en reposo. La profundidad la dan el cambio de tono (crema → superficie) y la línea de 1px. La sombra aparece solo cuando algo responde (una tarjeta en hover) o se eleva de verdad (diálogo, menú de cuenta, menú de celular, avisos). Las sombras tienen el tinte del petróleo, nunca gris neutro, y siempre desplazamiento con difuminado.

### Shadow Vocabulary

- **Respuesta** (`box-shadow: 0 2px 4px rgba(15, 76, 79, 0.06), 0 8px 20px -6px rgba(15, 76, 79, 0.14)`): hover de la tarjeta de proyecto.
- **Elevación** (`box-shadow: 0 4px 8px rgba(15, 76, 79, 0.08), 0 24px 48px -12px rgba(15, 76, 79, 0.28)`): diálogo de confirmación, menú de cuenta, panel del menú de celular y avisos.
- **Telón** (`::backdrop` en `telon`): fondo detrás del diálogo. Sin desenfoque.

### Named Rules

**La regla del plano por defecto.** Nada tiene sombra quieto. Si una sombra no responde a algo, sobra.

## Shapes

Esquinas amables pero firmes, que crecen con el tamaño del objeto: 4px en skeletons, sellos y etiquetas de tema; 8px en botones, campos, menús, avisos y la franja de encaje; 12px en tarjetas, paneles, estados vacíos y de error; 16px en el diálogo; y forma de píldora solo en los chips de habilidad y en los indicadores circulares. Bordes de 1px; 1.5px en el contorno de los botones secundario y peligroso, en los botones de la cabecera y en el error de un campo, para que se lean como controles. Sin bordes laterales gruesos de color, sin recortes ni formas decorativas.

### Named Rules

**La regla de la píldora.** La forma de píldora es de las habilidades. Una etiqueta de tema ("alimentación") va con esquinas de 4px sobre hundido, para que nadie la confunda con una habilidad requerida.

## Components

### Introducción pública y recorridos por rol

Una entrada de lectura dentro de la cartelera comunitaria. El título display se sostiene sin rótulo superior, seguido por una explicación en tinta suave y una sola acción coral, "Explorar proyectos". La introducción usa 32px de espacio arriba y abajo y 24px entre sus elementos.

Los dos recorridos aparecen uno debajo del otro: título y explicación a la izquierda, pasos en una lista ordenada a la derecha desde 768px; en celular se apilan en ese orden. Los números pertenecen a los pasos del recorrido, no a las secciones de la página. El primer recorrido se abre con una línea fina; el del colectivo se distingue con fondo petróleo tenue, esquinas de 12px y 24px de relleno (32px desde 768px). Su enlace "Publicar un proyecto" es secundario y lleva debajo una ayuda en body small, vinculada con `aria-describedby`, que explica el registro previo.

Las preguntas se presentan como una lista de definición: pregunta en petróleo y peso 600, respuesta siempre visible, separadas de la siguiente fila por una línea fina. Comparten las columnas del recorrido y se apilan en celular. No agregan controles ni estados de apertura.

### Buttons

Táctiles y directos: se reconocen como botones a simple vista. Un solo componente (`Boton`), con `secundario` como variante por defecto.

- **Forma:** esquinas de 8px, alto mínimo de 44px, `padding` 10px 20px, texto en una sola línea. Con ícono: 20px, separado 8px del texto.
- **Primario:** relleno coral oscurecido con texto blanco. Uno solo por pantalla ("Crear perfil", "Guardar cambios", "Enviar postulación").
- **Secundario:** fondo superficie, contorno de 1.5px en petróleo y texto petróleo. Hover: fondo petróleo tenue. Para "Cancelar", "Reintentar", "Limpiar" y "Postularme". Hay una versión enlace (`EnlaceBoton`) con el mismo aspecto, para navegar (por ejemplo, "Postularme" del visitante, que lleva a ingresar).
- **Peligroso:** fondo superficie, contorno de 1.5px en peligro, texto peligro y un ícono que anticipa la acción. Hover: fondo peligro tenue. Nunca ejecuta directo: abre el diálogo de confirmación.
- **Peligroso de confirmación:** relleno peligro con texto blanco. Existe solo dentro del diálogo.
- **Foco:** anillo de 3px en `info` con 3px de separación (`outline-offset`), visible sobre crema y superficie. Sobre la cabecera petróleo, el anillo es crema.
- **Presionado:** el fondo baja al tono hover y el botón se desplaza 1px hacia abajo, en 120ms.
- **Enviando:** el texto cambia a gerundio ("Postulando…", "Cerrando sesión…"), aparece un indicador circular de 16px a la izquierda, `aria-busy="true"` y el botón queda deshabilitado con su color. Mantiene su ancho.
- **Deshabilitado:** fondo `hundido`, texto `tinta-suave`, sin borde de color y `cursor: not-allowed`. **Nunca solo con opacidad.** El motivo va visible debajo, en body small, enlazado con `aria-describedby` ("La búsqueda de este perfil está cerrada.", "No hay cambios para guardar.").

### Chips de habilidades

La habilidad requerida y la opcional se distinguen por **tres señales que no dependen del color**: el grupo con su título, el borde y el peso. El chip no lleva ícono propio (decisión del 06/11/2026, revisión Impeccable 01, R39).

- **Agrupadas siempre que hay lugar:** dos listas con su título en label, "Requeridas" y "Opcionales". La agrupación es la señal principal y la que lee el lector de pantalla.
- **Requerida:** borde continuo de 1px en petróleo, fondo petróleo tenue, texto petróleo en peso 600, alto de 32px, forma de píldora.
- **Opcional:** borde **rayado** (`dashed`) de 1px en `borde-campo`, fondo superficie, texto tinta suave en peso 400.
- **Mezcladas en una sola línea:** la opcional suma el texto visible "· opcional" después del nombre.
- **La tenés:** cuando la colaboradora con sesión tiene la habilidad, el chip suma una tilde de 16px a la izquierda y el texto oculto "La tenés", para lectores de pantalla.
- **En formularios:** los chips elegidos llevan un botón "×" para quitarlos, con `aria-label` ("Quitar etiqueta alimentación") y hover en `velo-petroleo`.
- **Desborde en tarjeta:** como máximo cuatro chips y un "+2 más" en texto, no clickeable. El detalle muestra todas.

### Etiquetas de tema

Las etiquetas de un proyecto o de un colectivo ("alimentación", "textil") son temas, no habilidades, y se ven distintas: alto de 32px, esquinas de 4px, borde de 1px en `borde-campo`, fondo `hundido`, texto tinta en label de peso 400. Sin ícono ni forma de píldora.

Las sugerencias junto al buscador conservan la forma rectangular y usan botones nativos de al menos 44×44px, con `padding` de 8px 12px. Hover y selección pasan a petróleo tenue con borde petróleo; `aria-pressed` comunica la selección y el foco usa el anillo compartido. Las filas se envuelven a 320px. Si no hay etiquetas se conserva el campo de búsqueda escrita.

### Histórico de perfiles

En «Perfiles del proyecto», las búsquedas abiertas aparecen primero. Las cerradas, vencidas, con límite alcanzado o de un proyecto finalizado se consultan en un `details` nativo con el resumen «Perfiles que ya no reciben postulaciones (N)». Conservan su orden y sus postulaciones propias. El resumen usa texto petróleo en peso 600, al menos 44px de alto y 12px de espacio vertical; al abrirlo deja 16px antes de la lista. Enter o Espacio lo despliegan con foco visible. Sin búsquedas abiertas, el estado se explica y el histórico aparece abierto. Si un perfil pasa al histórico al terminar una postulación, se despliega antes de devolver el foco a la confirmación.

### Sello de estado

El aviso de la cartelera: dice en texto si algo está vigente. Label en peso 600 con cifras tabulares, borde de 1px, esquinas de 4px, `padding` 4px 8px e ícono de 16px, en el color de su estado sobre su fondo tenue.

- **Abierta** ("Abierta hasta el 15/12", "Tu postulación fue aceptada"): éxito, con tilde.
- **Límite alcanzado** y postulación pendiente ("Tu postulación está pendiente"): aviso.
- **Rechazada** ("Tu postulación fue rechazada"): peligro, con cruz.
- **Cerrada** y **Finalizado**: neutro, hundido con borde de campo y tinta suave, con un guion.

### Tarjeta de proyecto

Un aviso de la cartelera: todo lo necesario para decidir si vale la pena entrar.

- **Contenedor:** fondo superficie, borde de 1px en línea, esquinas de 12px y `padding` de 24px. Es un `<article>` dentro de un `<li>`, con el mismo alto que sus vecinas de fila.
- **Orden de lectura:** (1) título del proyecto en title, en petróleo; es el único enlace y su área se estira a toda la tarjeta; (2) descripción en body, cortada a tres líneas; (3) chips de habilidades requeridas; (4) el sello de postulación y la franja de encaje, cuando corresponden; (5) pie, separado por una línea, con "N perfiles abiertos", compromiso y modalidad legibles ("5 h por semana · Colaboración sin remuneración") y el sello del perfil más próximo a cerrar. Si el proyecto está finalizado, el pie lleva solo el sello "Finalizado".
- **Postulaciones de la colaboradora:** arriba del pie, un sello con ícono y cantidad de perfiles. Las pendientes llevan aviso, las aceptadas éxito y la mezcla un sello neutro. Solo estos estados cuentan. La franja coral muestra el mejor encaje entre los demás perfiles abiertos cuando coincide al menos una habilidad.
- **Modalidad, en texto:** `GRATUITA` → "Colaboración sin remuneración", `OFRECE_INCENTIVO_ECONOMICO` → "Con incentivo económico", `EXISTE_POSIBILIDAD_DE_CONTRATACION` → "Con posibilidad de contratación". Nunca el código del enum.
- **Pendiente del back:** el colectivo que publica el proyecto (nombre y provincia). `ProyectoDto` no lo trae; cuando el back lo sume, va entre el título y la descripción, en body small tinta suave. Hasta entonces la tarjeta no lo muestra ni lo deduce.
- **Hover:** el borde pasa a petróleo y aparece la sombra de respuesta, en 150ms. El título no se subraya.
- **Foco:** el anillo de foco rodea la tarjeta entera solo con teclado (`:has(a:focus-visible)`); el enlace del título no dibuja anillo propio.
- **Sin** imagen de portada inventada, sin íconos decorativos y sin tarjetas dentro de tarjetas.

### Tarjeta de proyecto propia

La misma tarjeta, vista por el colectivo dueño. El sello de postulación propia y la franja de encaje se reservan para la colaboradora. El pie lleva "N perfiles buscan colaboradoras" (no si está finalizado), "N postulaciones pendientes" solo si hay y el sello del proyecto. El conteo de pendientes sale del listado y se oculta si el back no lo trae.

### Franja de dueño

En `/proyectos/:id`, debajo de "Volver": "Este proyecto es de tu colectivo" sobre fondo `info-tenue`, sin borde lateral, con el enlace "Ver en Mis proyectos". La ven solo los dueños; los demás colectivos leen, en "Perfiles que busca", "Las postulaciones son para colaboradoras." una sola vez.

### Mis proyectos

Encabezado con el título y la acción coral "Publicar proyecto" (se oculta en el estado vacío, donde la acción ya está en el centro). Grilla de tarjetas propias; mismos estados de carga, vacío y error que el resto.

### Indicador de pasos

Lista ordenada con "1 · Proyecto · 2 · Perfiles · 3 · Revisión" desde 640px; el paso actual en peso 600 con `aria-current="step"`. Por debajo, una línea compacta "Paso 2 de 3 · Perfiles". Los separadores se ocultan a lectores de pantalla.

### Alta de proyecto en tres pasos

Cada paso es un panel de superficie con borde de línea; el paso vive en `?paso=`. Una sola acción coral por paso: "Siguiente" en los dos primeros y "Publicar proyecto" en la revisión. "Atrás" y "Volver a editar…" son secundarios. En el paso de perfiles, mientras el formulario está abierto, "Siguiente" pasa a secundario y "Guardar perfil" es el coral; "Siguiente" deshabilitado muestra su motivo ("Sumá al menos un perfil para seguir.").

### Franja de encaje

Solo con sesión de colaboradora: "Tenés 2 de 3 habilidades requeridas" en coral oscurecido, peso 600 y body small, sobre coral tenue, con esquinas de 8px y `padding` 8px 12px. Es el único coral de la tarjeta. Con 0 de N no se muestra.

### Esqueleto

Reproduce la forma real de lo que va a aparecer, para que no haya saltos al cargar.

- **Bloques** en `hundido`, esquinas de 4px, con la altura de la línea de texto que reemplazan (1em), y píldoras de 32px para los chips.
- **Cantidad:** tantos como entran en la primera vista (seis tarjetas en escritorio, dos en celular).
- **Movimiento:** pulso de opacidad entre 1 y 0.55 (`--opacidad-atenuada`) cada 1.6s. Con `prefers-reduced-motion: reduce`, quieto.
- **Accesibilidad:** el contenedor lleva `aria-busy="true"` y un texto oculto "Cargando proyectos…" en una región `aria-live="polite"`; los bloques llevan `aria-hidden="true"`.
- Aparece recién a los 300ms del pedido, para que una respuesta rápida no parpadee.

### Carga de una pantalla diferida

Las altas y las pantallas de edición de perfil se descargan al entrar a una ruta autorizada. Durante la espera aparece un skeleton con el anuncio accesible «Cargando pantalla…». Al navegar, el foco espera al título; si falla la descarga, el estado de error ofrece «Reintentar». La cabecera sigue disponible.

### Estado vacío

Explica por qué no hay nada y ofrece el paso siguiente.

- **Contenedor:** fondo superficie, borde **rayado** (`dashed`) de 1px en línea, esquinas de 12px y `padding` 48px 24px, contenido centrado con un ancho máximo de 48ch (decisión del 06/11/2026, R50).
- **Contenido:** ícono de línea de 32px en petróleo (`aria-hidden`), título en title ("Todavía no hay proyectos que encajen con tus habilidades"), una o dos líneas en tinta suave y una sola acción.
- **Sin resultados** es otra variante: repite lo buscado ("No encontramos proyectos con la etiqueta «python»"), sugiere ampliar y ofrece "Limpiar búsqueda" como botón secundario.
- Sin ilustraciones inventadas.

### Estado de error con "Reintentar"

- **Contenedor:** fondo peligro tenue, borde de 1px en peligro, esquinas de 12px, `padding` de 24px y `role="alert"`. Ocupa el lugar del contenido que falló; el título y el buscador de la pantalla se mantienen.
- **Contenido:** ícono de alerta de 24px en peligro, título en title tinta ("No pudimos cargar los proyectos"), el mensaje en lenguaje de la persona según el error ("Tuvimos un problema en el servidor. Probá de nuevo en unos minutos.") y el botón secundario **"Reintentar"** con ícono de flecha circular.
- **Foco:** en la primera falla va al título del error, salvo que la persona esté escribiendo en un campo; si "Reintentar" vuelve a fallar, siempre va al título.
- Para 429, sin botón: "Hiciste muchos pedidos seguidos. Esperá unos segundos y volvé a intentar."
- Nunca el error crudo, el `message` del back, el status ni un ID técnico.

### Diálogo de confirmación

Protege una acción permanente o una salida con pérdida. `<dialog>` nativo abierto con `showModal()` y centrado (`margin: auto`).

- **Caja:** fondo superficie, esquinas de 16px, `padding` de 32px (24px por debajo de 480px), ancho `min(480px, 100vw - 32px)`, sombra de elevación y telón en tinta al 55 %.
- **Contenido, en orden:** título en title que nombra la acción ("¿Cerrar sesión?", "¿Te postulás a este perfil?"); qué pasa, en body; si la acción es permanente, la línea **"Esta acción no se puede deshacer."** en peso 600 y color peligro, con su ícono; y las acciones.
- **Acciones:** a la derecha, "Cancelar" (secundario) primero y la confirmación con el verbo exacto último. La confirmación es **peligrosa** (relleno peligro) para lo irreversible y para lo que hace perder algo ("Cerrar sesión", "Salir sin guardar"), y **primaria** coral para lo que no lo es ("Enviar postulación"). En "¿Salir sin guardar?", "Cancelar" se llama "Seguir editando".
- **Celular:** por debajo de 480px las acciones se apilan a ancho completo, en el orden del DOM: "Cancelar" arriba y la confirmación abajo, para que el orden de foco coincida con el visual.
- **Foco:** al abrir va a "Cancelar", no a la confirmación; Esc cierra (salvo mientras envía); al cerrar, el foco vuelve al botón que lo abrió o, si ya no existe, al elemento que lo reemplaza. `aria-labelledby` apunta al título y `aria-describedby` a la explicación.
- **Enviando:** la confirmación pasa a gerundio deshabilitada, y "Cancelar" también se deshabilita.
- **Entrada:** opacidad y escala de 0.97 a 1 en 180ms con ease-out; sin animación con `prefers-reduced-motion`.

### Avisos

El mensaje después de cada acción. Una zona fija con dos regiones (`role="status"` para éxito e información, `role="alert"` para errores).

- **Aviso:** borde de 1px y fondo tenue del estado (éxito, error o información), texto tinta en label, ícono del estado, esquinas de 8px y sombra de elevación. Botón "×" de 44×44px para cerrar, con hover en `velo-tinta`. Los de error no se cierran solos.
- **Ubicación:** abajo a la derecha, con 400px de ancho, desde 768px; por debajo de 480px, arriba, 8px debajo de la altura real de la cabecera (medida con `ResizeObserver`), con márgenes de 16px y el texto cortado a tres líneas en body small, para no tapar los accesos de cuenta ni quedar debajo del teclado. La medición acompaña la segunda fila de visitante y los cambios de ancho.
- **Entrada:** sube 8px con opacidad en 180ms.

### Inputs / Fields

- **Estilo:** fondo superficie, borde de 1px en `borde-campo`, esquinas de 8px, alto de 44px (88px en áreas de texto, que crecen solo en vertical) y texto en body. El label va siempre visible arriba, en label tinta; si es obligatorio, lleva "(obligatorio)" en texto.
- **Foco:** el borde pasa a petróleo y aparece el anillo de foco en `info`.
- **Error:** borde de 1.5px en peligro, `aria-invalid="true"`, mensaje debajo con ícono de 16px, en peligro, body small y peso 600, vinculado con `aria-describedby`. Lo cargado se conserva y el foco va al primer campo inválido.
- **Ayuda:** body small tinta suave debajo del campo, vinculada con `aria-describedby`.
- **Búsqueda:** sin la cruz nativa del navegador; se limpia con el botón "Limpiar".
- **Radios y casillas:** nativos, de 20px, con `accent-color` petróleo, en filas de 44px con 12px entre el control y su texto, dentro de un `fieldset` con `legend`.

### Navigation

- **Cabecera:** franja petróleo a todo el ancho, de 64px de alto, con el nombre "Código a Voluntad" en Bricolage 700 crema (como texto, no como logo inventado), en una sola línea; los enlaces principales en crema y el menú de cuenta a la derecha.
- **Enlaces por rol:** "Proyectos" para todos y "Mis proyectos" para el colectivo. "Mi perfil" y "Mi colectivo" se abren desde "Mi cuenta". "Habilidades" no está en la navegación: su pantalla existe solo en desarrollo.
- **Ítem actual:** peso 600 con un subrayado de 3px en coral vivo y `aria-current="page"`. Hover: subrayado de 1px crema.
- **Celular** (por debajo de 768px): con un enlace principal, "Proyectos" queda visible junto a la marca. Sin sesión, los accesos forman una segunda fila alineada a la derecha, con 8px entre botones y 8px de espacio inferior; a 320px la cabecera mide unos 100px. Con sesión se conserva "Mi cuenta". Con dos o más enlaces se usa el botón "Menú" de 44px (solo ícono con texto oculto por debajo de 480px) que despliega debajo de la cabecera un panel petróleo con los mismos ítems en el mismo orden, con sombra de elevación. Esc lo cierra y devuelve el foco al botón.
- **Accesos sin sesión:** "Ingresar" como botón de texto crema de marca y "Crear una cuenta" con contorno crema de 1.5px, ambos transparentes sobre petróleo, esquinas de 8px, texto de 16px en peso 600 y alto mínimo de 44px. Hover petróleo profundo y foco crema. Van a la derecha en escritorio; abren directamente la pantalla de autenticación correspondiente. Durante la apertura, el botón elegido dice "Abriendo…", comunica `aria-busy` y ambos quedan deshabilitados sin opacidad. Si falla, se habilitan y aparece el aviso de error. En `/login` y `/registro` la cabecera conserva los dos accesos como enlaces con el mismo estilo. Las acciones de autenticación quedan en el contenido.
- **Menú de cuenta:** botón "Mi cuenta" con contorno crema de 1.5px; abre una lista de al menos 220px sobre superficie, con borde de línea, esquinas de 8px y sombra de elevación, encabezada por el nombre de la cuenta ("Ingresaste como …") y con "Cerrar sesión".
- **Saltar al contenido:** primer enlace del documento, visible al recibir el foco. Al navegar, el foco va al `h1` de la pantalla nueva, sin anillo.

### Ingreso y registro

Las pantallas locales comparten un panel centrado sobre fondo crema. La acción principal abre el flujo de Logto y la alternativa permite cambiar entre ingreso y registro. Con la configuración incompleta, el panel explica que el acceso no está habilitado y ofrece explorar proyectos. Los formularios de credenciales se presentan en la experiencia alojada por Logto.

### Pie de página compartido

Un único footer en la raíz de la aplicación, con el mismo contenido para todos los roles y rutas, incluidos ingreso, 404 y error de verificación de sesión. Mismo fondo petróleo y texto crema de marca que la cabecera; el nombre usa Bricolage de 20px, peso 700 y tamaño óptico 20, como la marca del header. La referencia académica va en body small. Sin sombra ni esquinas redondeadas.

Usa 16px de espacio vertical y márgenes laterales de 16px en celular y 32px desde 768px, alineados con el contenido principal. En escritorio, presentación, enlace y referencia académica forman una sola fila de tres bloques; la descripción usa body small y 4px de separación con la marca. A 320px se apilan con 8px entre bloques. La altura medida a 1280px es de unos 85px. El enlace «Cómo funciona» tiene 44px de alto y comparte el tratamiento de la cabecera: sin subrayado en reposo, subrayado al pasar el puntero y anillo de foco crema visible sobre petróleo. Apunta a `/#como-empezar`, accesible también con sesión, y lleva el foco al título de la sección. La raíz usa altura mínima de viewport y el main ocupa el espacio disponible: en páginas cortas el pie llega al borde inferior; en páginas largas sigue al contenido, sin fijarse ni superponerse.

### Paginación

Anterior y siguiente como botones secundarios, y hasta tres números alrededor de la página actual, de 44×44px con cifras tabulares. Los números son petróleo sin borde (hover petróleo tenue); la página actual lleva contorno de 1.5px en petróleo, fondo petróleo tenue y `aria-current="page"`. Por debajo de 480px los números pasan a una fila propia, centrada, arriba de anterior y siguiente. El conteo vive en "Mostrando X–Y de N", arriba de la grilla, no en la paginación.

### Superficies del navegador

- Selección de texto en coral tenue con texto tinta; cursor de escritura (`caret-color`) en petróleo.
- Subrayado de enlaces con `text-underline-offset: 0.2em` y 1px de grosor (2px en hover).
- Cifras tabulares (`font-variant-numeric: tabular-nums`) en fechas, sellos y paginación.
- Íconos de línea propios en SVG (`Icono`), 1.75px de trazo y extremos redondeados, en 16, 20, 24 y 32px, con `aria-hidden`. Nada de emojis ni caracteres Unicode como íconos.
- Con `prefers-reduced-motion: reduce`, animaciones y transiciones se reducen a un instante en toda la app.

## Do's and Don'ts

### Do:

- **Do** usar el coral oscurecido (`coral`) en una sola acción principal por pantalla.
- **Do** acompañar cada estado con texto e ícono: el color confirma, no informa solo.
- **Do** mostrar el motivo debajo de todo botón deshabilitado, enlazado con `aria-describedby`.
- **Do** separar las habilidades en "Requeridas" y "Opcionales" y diferenciar los chips con borde continuo o rayado y con el peso.
- **Do** mostrar las etiquetas de tema con esquinas de 4px sobre hundido, nunca como píldora.
- **Do** tomar todo valor de `src/Presentation/Styles/tokens.css`; ningún color, medida ni duración suelta en un módulo.
- **Do** mantener 44×44px en todo lo clickeable y verificar el contraste de todo par de color nuevo antes de usarlo.
- **Do** dar los botones peligrosos con contorno en la página y con relleno solo dentro del diálogo.
- **Do** escribir cada mensaje de error en el front, según el status y la operación.

### Don't:

- **Don't** poner texto sobre el coral vivo ni usarlo como único indicador de nada (2.56:1 sobre crema).
- **Don't** usar texto más claro que la tinta suave, ni grises neutros: los neutros vienen del crema y del petróleo.
- **Don't** deshabilitar con opacidad. La opacidad atenuada es solo para contenido viejo mientras carga el nuevo y para el pulso del skeleton.
- **Don't** usar mayúsculas sostenidas, rótulos encima de los títulos ni numeración de secciones.
- **Don't** usar monoespaciada, ni siquiera en chips o números.
- **Don't** usar bordes laterales gruesos de color en tarjetas, alertas o avisos.
- **Don't** usar sombras sin desplazamiento, sombras duras sin difuminado, vidrio ni degradados en texto.
- **Don't** inventar logos, ilustraciones, fotos de portada ni testimonios para llenar huecos.
- **Don't** usar `window.confirm()`: las acciones permanentes van por el diálogo de confirmación.
- **Don't** mostrar el `message` del back, un status ni un ID técnico en pantalla.
