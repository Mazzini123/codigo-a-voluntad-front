# Descripciones en Markdown

Origen: requerimiento adicional 38 del enunciado. El back guarda el texto tal cual y saca todo el HTML (`sanitizar.js`); según su README, "el renderizado es del frontend".

## Intención

Que las descripciones de colectivos y proyectos puedan tener formato (párrafos, listas, enlaces, negrita, código) y se vean bien, sin abrir la puerta a contenido peligroso.

## Escenarios

Dado un proyecto cuya descripción tiene una lista en Markdown,
cuando alguien entra a su detalle,
entonces ve la lista con viñetas.

Dado una descripción con un enlace en Markdown,
cuando se muestra,
entonces el enlace abre en otra pestaña y lo avisa, y solo si es `http` o `https` (`EnlaceExterno`).

Dado una descripción con HTML escrito a mano,
cuando se muestra,
entonces el HTML no se interpreta: se ignora (el back ya le saca las etiquetas al guardar).

Dado alguien que carga una descripción,
cuando escribe en el campo,
entonces ve una ayuda breve con la sintaxis admitida; en el alta de proyecto, el paso de revisión funciona como vista previa.

## Requisitos

- Un solo componente, `TextoConFormato`, usado en las descripciones de proyecto y colectivo (las únicas que el back marca como Markdown): detalle del proyecto, página del colectivo, administración y revisión del alta.
- En tarjetas y listados se muestra el texto sin las marcas (`sinMarcas`, en `Formatos/markdown.js`) y recortado, como antes.
- Elementos admitidos: párrafos, listas, enlaces, negrita, cursiva, código, citas y separadores. Las imágenes muestran solo su texto alternativo. Los títulos de Markdown se muestran con el nivel que corresponde a la página (sin saltar niveles ni competir con el `h1`).
- Nunca se interpreta HTML crudo.

## Estados

- No consulta al back: usa el texto que ya trajo la pantalla.
- Mientras se baja la biblioteca, se muestra el texto tal cual, sin saltos.

## Fuera de alcance

- Imágenes y tablas en Markdown.
- Editor con botones de formato.

## Decisiones tomadas

- Biblioteca: `react-markdown` (aprobada por el equipo el 08/11/2026), sin `rehype-raw` y con `skipHtml`, así no interpreta HTML. Arma elementos de React y no usa `dangerouslySetInnerHTML`.
- Se carga con `lazy` en `MarkdownSeguro.jsx`: es un fragmento propio de unos 36 KB comprimidos que no entra en la carga inicial.

## Criterio de aceptación

- Las descripciones con Markdown se ven con formato en el detalle y en las páginas públicas, el HTML escrito a mano no se interpreta y los enlaces pasan por `EnlaceExterno`.
