# Criterios para pantallas web

29/10/2026

> **Pregunta resumen:** «¿Qué espera hacer la persona acá, qué datos reales tenemos y qué verá después de cada acción?»
>
> **Método:** revisá cada pantalla desde el rol y el recorrido del usuario, conectala con datos reales y después comparala con el resto de la aplicación para corregir comportamiento, mensajes y diseño.

## 1. Antes de diseñar

- **Partí del requisito real:** qué tiene que poder hacer cada tipo de usuario. Lo que nadie pidió no se agrega, aunque quede lindo.
- **Revisá la pantalla desde cada rol que la usa:** cómo llega, qué hace, qué necesita ver primero y adónde va después.
- **Hacé una ficha por pantalla** con objetivo, quién la usa, qué datos muestra, qué acciones permite y sus estados. Validala antes de construir.
- **Elegí una acción principal por pantalla** y que se note como tal.
- **Mirá cómo resuelven lo mismo otros sitios** (benchmark) antes de inventar.
- **Ordená menús y secciones como piensa el usuario, no como está armado el sistema.** Usá sus palabras, no las técnicas.
- **Mostrá primero lo esencial y el detalle a demanda** (divulgación progresiva).
- **Identificá la fuente de cada dato** y verificá que exista el endpoint u operación necesaria. Si no tiene fuente, no se muestra.
- **Las opciones de un filtro salen de los valores válidos del sistema**, no de los datos que casualmente existen hoy.
- **Identificá las cosas por el dato que es único de verdad** (email, ID), no por el que "parece" único.
- **Respetá los permisos:** cada rol ve y hace solo lo que le corresponde.
- **Cada acción visible tiene que funcionar.** Un botón que no hace nada es peor que no tenerlo.

## 2. Estados de cada pantalla

- **Con datos:** el caso normal, y también con muchos resultados (paginación) y con uno solo (preselección).
- **Vacío:** explicá por qué no hay nada y qué se puede hacer ("Todavía no registraste donaciones. Registrar la primera →").
- **Sin resultados:** un mensaje distinto del vacío, que repita lo buscado y ofrezca limpiar el filtro.
- **Error al cargar:** el título y un aviso claro, y nada más. No dejes listas vacías ni "—" que confundan.
- **Cargando o enviando:** "Guardando…" con el botón deshabilitado, para evitar el doble envío. Mostrá siempre el estado del sistema.
- **Estado final de un flujo:** qué pasó y adónde ir ahora.
- **Nunca inventes datos** para llenar huecos.

## 3. Mensajes al usuario

- **No reveles la implementación:** nada de servicios, base de datos, tokens, IDs técnicos, endpoints ni trazas.
- **Cuando falla el sistema:** un mensaje genérico con una salida ("Intentá nuevamente más tarde").
- **Cuando se equivoca el usuario:** decile exactamente qué corregir, sin culparlo, y si se puede con un atajo para resolverlo ahí mismo.
- **Prevení el error antes de que pase:** validá y avisá antes de enviar.
- **Después de cada acción:** un mensaje de éxito o de error, visible apenas vuelve la pantalla.
- **Lo irreversible pide confirmación** (borrar, dar de baja, cerrar sesión) con un diálogo propio, no el `confirm()` del navegador, y el botón peligroso va en rojo. Cuando se pueda, ofrecé deshacer.
- **Separá lo implementado de lo pendiente:** lo que no existe se indica claramente o no se muestra. Nunca parece operativo.
- **El mismo vocabulario en toda la app.**

## 4. Navegación

- **La misma estructura para todas las pantallas y roles:** logo, 2 o 3 links principales, "Más ⌄" con el resto y el menú de cuenta.
- **Seguí las convenciones** (ley de Jakob): lupa = buscar, campana = notificaciones, cuenta arriba a la derecha. Innová en el contenido, no en dónde va cada botón.
- **Mostrá siempre dónde está la persona:** el ítem actual resaltado y con `aria-current="page"`. Las subpantallas resaltan su sección.
- **Las pestañas no cambian de lugar** y la activa se distingue claramente.
- **Siempre hay forma de volver atrás** desde un detalle o subnivel: "← Volver" o migas de pan.
- **El menú de cuenta es solo para lo personal** (perfil, configuración, cerrar sesión).
- **En celular van los mismos ítems y en el mismo orden**, en un menú que funcione de verdad.
- **Una acción, un lugar:** no repitas el mismo destino en varios menús.
- **Conservá el contexto:** filtros, búsqueda, página y elemento seleccionado, al ir a un detalle y volver y después de cada acción.
- **Los enlaces directos tienen que funcionar** sin haber pasado por las pantallas anteriores.
- **Paginación antes que scroll infinito.**
- **Borrá las pantallas que no tienen propósito.**

## 5. Interacción

- **Definí el resultado de cada interacción antes de construirla:** qué cambia, dónde se guarda y qué ve la persona después.
- **Que el sistema absorba la complejidad, no el usuario** (Tesler): preseleccioná la opción única u obvia, autocompletá, calculá.
- **No hagas recordar datos de una pantalla a otra ni pidas el mismo dato dos veces.**
- **Pocas opciones o bien agrupadas cuando hay que decidir** (Hick y Miller): de 5 a 9 por grupo.
- **Lo importante, grande y cerca** (Fitts).
- **Lo más usado, al principio o al final** de listas y menús (posición serial).
- **Los filtros y selectores se aplican al cambiarlos**, sin un botón "Aplicar" extra.
- **Ordená por lo más útil:** primero lo urgente, y si no hay urgencia, lo más reciente. Que nada quede olvidado al fondo.
- **Ubicá buscadores y filtros donde resulten naturales para la tarea.**
- **Partí las tareas largas en pasos visibles,** con un indicador ("1. Elegir · 2. Confirmar · 3. Finalizar").
- **Un botón queda deshabilitado hasta que se puede usar**, en vez de dejar apretar y mostrar un error.
- **Atajos para usuarios frecuentes**, sin complicar a los nuevos.
- **Si hay arrastrar y soltar, que tenga alternativa con clic.**

## 6. Consistencia visual

- **El mismo encabezado en todas las pantallas:** título, descripción y acción principal.
- **Un solo estilo** de paginación, tablas, tarjetas, botones, diálogos, avisos, estados vacíos e íconos, con el mismo tamaño en todas las pantallas.
- **Un solo elemento destacado por pantalla** (von Restorff). Si cinco compiten, no se destaca ninguno.
- **Que botones, links y campos se reconozcan a simple vista** (affordance).
- **Colores con significado fijo:** verde éxito, rojo error, azul información, siempre con texto o ícono. Paleta 60-30-10: 60 % neutro, 30 % complementario, 10 % acento.
- **Espaciados en múltiplos de 8.** El espacio agrupa: lo relacionado va junto (proximidad).
- **Colores y espacios desde variables o clases del sistema de diseño.** Antes de usar una clase, comprobá que exista en el CSS.
- **La ayuda, siempre en el mismo lugar.**
- **Fotos reales que combinen con la identidad visual**, sin repetir la misma imagen donde no corresponde.
- **Si se vuelve a un diseño anterior, se recupera el estilo y se mantiene la funcionalidad.**

### Identidad de marca

- **Dos tipografías: una para títulos, con personalidad, y otra para texto, muy legible.** Evitá las combinaciones genéricas que hoy usan todos los sitios hechos con IA.
- **Un color de acento propio que identifique a la marca,** más un complementario oscuro y otro claro que combinen con él (podés armarlos con la rueda de colores de Canva o Coolors).
- **El acento se usa poco (10 %):** acciones principales y puntos clave. Si está en todos lados, deja de destacar.
- **Probá si es memorable:** si le sacás el logo, ¿se sigue reconociendo la marca?

## 7. Limpieza visual

- **Sacá lo que no aporta:** etiquetas decorativas, íconos duplicados, secciones repetidas. No le tengas miedo al espacio en blanco.
- **Lo importante arriba y a la izquierda:** la gente escanea en forma de F, no lee todo.
- **Jerarquía clara:** una acción principal destacada y las secundarias más discretas.
- **Tipografía:** jerarquía por tamaño y peso, interlineado generoso, nunca texto justificado.
- **Nada de botones partidos en dos renglones** ni espaciados raros.
- **Después de cambiar una sección, revisá la pantalla completa:** alineación, menú, footer y versión móvil.
- **Tendencias con cuidado:** muchas fallan en accesibilidad.
- **Good enough:** está terminado cuando el usuario hace lo que necesita sin fricción, no cuando está "perfecto".

## 8. Datos y listas

- **Paginá en el servidor.**
- **Paginación:** anterior y siguiente, pocos números alrededor de la página actual, la actual resaltada y "Mostrando X de Y". Si la página pedida ya no existe, mostrá la última que sí existe.
- **Búsqueda por los campos que la gente realmente recuerda.**
- **Formateá para personas:** "11 de octubre de 2026", "DNI 30.111.222", "CUIT 30-12345678-9", decimales con coma, estados legibles en vez de códigos.
- **Que filas y tarjetas muestren lo necesario para decidir**, y que sean clickeables completas si tienen detalle.
- **No repitas columnas con el mismo dato.**
- **Debounce en los buscadores** que consultan mientras se escribe.

## 9. Accesibilidad

- **No comuniques nada solo con color:** siempre con texto o ícono.
- **HTML semántico:** `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`. Un solo `<h1>` por página y sin saltar niveles.
- **Elementos nativos antes que inventados:** `<dialog>`, `<details>`, `<button>`, tablas con `<caption>` y `scope`. ARIA solo cuando el HTML no alcanza.
- **Formularios:**
  - labels reales (el placeholder nunca reemplaza al label);
  - obligatorios marcados;
  - ayuda con `aria-describedby`;
  - si hay error, se conserva lo que la persona ya cargó.
- **Errores de formulario:** `aria-invalid="true"`, el mensaje vinculado al campo y `role="alert"`, con un ícono además del color.
- **Botones de solo ícono con `aria-label`;** íconos y emojis decorativos con `aria-hidden="true"`.
- **Teclado:** enlace para saltar al contenido, foco visible y nunca tapado, Enter que envía y diálogos que cierran con Esc.
- **Contraste mínimo de 4.5:1 en el texto.** Zonas de toque de 44×44 px (la WCAG pide mínimo 24).
- **Pasá Lighthouse y HeadingsMap** y corregí lo que marquen.
- **Probá con zoom al 200 % y con un lector de pantalla real** (NVDA o VoiceOver), además de axe o WAVE: las herramientas automáticas detectan solo una parte de los problemas.

## 10. Código

- **No dupliques:** fragmentos para navbar, pie, `<head>`, paginación, avisos y formularios repetidos, y helpers comunes para formatos y errores.
- **Nada de JavaScript dentro del HTML:** comportamientos con `data-*` y un `.js` propio.
- **Versioná el CSS y el JS** (`app.css?v=…`) y recargá con Ctrl+F5.
- **Un formato de código común para todo el equipo**, aplicado con una herramienta.
- **Cambios chicos y enfocados.** Commiteá antes de un cambio masivo y hacelo en un commit separado.
- **Linter, formateador y ganchos de Git** (husky) para que la calidad sea automática.
- **Variables de entorno para la URL de la API;** nunca hardcodeada.
- **Tests de accesibilidad automáticos:** jest-axe en unitarios y @axe-core/playwright en end to end.
- **Sin comentarios en el código:** nombres claros de variables, funciones y componentes, y funciones chicas que se expliquen solas.

## 11. Forma de trabajo

- **Primero proponé y explicá por qué;** implementá cuando haya acuerdo.
- **Cambiá exactamente lo pedido:** no extiendas un ajuste a otras pantallas sin consultarlo.
- **Probá con el flujo completo:** cargá los datos necesarios de punta a punta, no solo la pantalla aislada.
- **Antes de atribuir algo a un error visual, descartá otras causas:** que falten datos, que haya un proceso programado pendiente o que no se haya reconstruido un servicio.
- **Evaluá con las 10 heurísticas de Nielsen** y, si podés, hacé que alguien que no la diseñó la use sin ayuda.
- **Cada cambio va con cómo probarlo:** URL, datos de prueba y pasos (reconstruir, reiniciar, Ctrl+F5).

## 12. Antes de dar una pantalla por terminada

- [ ] Probé los estados: con datos, muchos, uno, vacío, sin resultados, error (backend apagado) y enviando.
- [ ] Probé con datos largos, varias páginas, cada rol y entrando por enlace directo.
- [ ] Cada rol ve solo lo que le corresponde.
- [ ] El navbar resalta bien la pantalla, el menú de celular funciona y desde un detalle puedo volver sin perder dónde estaba.
- [ ] Los filtros, la búsqueda y la página se mantienen al navegar.
- [ ] Los mensajes no mencionan nada técnico y lo pendiente no parece operativo.
- [ ] Toda acción visible funciona y las destructivas piden confirmación.
- [ ] Hay una sola cosa destacada y la jerarquía se entiende de un vistazo.
- [ ] Se ve igual que las demás pantallas y bien en celular, sin botones partidos ni scroll horizontal.
- [ ] Encabezados en orden, landmarks presentes, ningún campo depende del placeholder y los errores están vinculados a su campo.
- [ ] Se puede usar solo con teclado, se entiende sin ver los colores y Lighthouse no marca problemas importantes.
- [ ] Revisé las 10 heurísticas de Nielsen.
- [ ] El cambio no alteró otras pantallas.
- [ ] Sin errores ni warnings de React en consola (keys, hooks, efectos).
- [ ] Recargando la página o compartiendo la URL se ve lo mismo (filtros y página en la URL).
- [ ] Probé con la red lenta o con el backend caído: se ven el indicador de carga, el error y el botón "Reintentar".

## 13. React

### Estructura del proyecto

- **Acordá la estructura de carpetas desde el principio:** `components/` para las piezas reutilizables (cada una con su CSS) y `features/` con una carpeta por pantalla.
- **Las llamadas a la API van en servicios del front,** nunca sueltas dentro de los componentes.
- **Traducí lo que llega del backend con un adaptador** (`aProducto(dto)`), así un cambio en la API se arregla en un solo archivo.
- **Mientras la API no esté lista, trabajá con `mockdata/`** detrás del mismo servicio.

### Estado

- **Guardá lo mínimo.** Si un valor se puede calcular a partir de las props o de otro estado, se calcula: no va en `useState` ni en un `useEffect`.
- **No modifiques el estado directamente,** creá uno nuevo. Nada de `items.push()`.
- **Levantá el estado al ancestro común** cuando dos componentes lo comparten. Usá contexto para algo global y simple (tema, usuario) y Zustand o un reducer cuando crece.
- **Si las reglas para cambiar un estado se repiten, centralizalas en un reducer** que se pueda probar sin el navegador.
- **Formularios controlados:** el estado es la única fuente de verdad del campo.

### Reglas de React

- **En las listas, la `key` es un ID estable, nunca el índice del array.**
- **Los hooks se llaman siempre en el nivel superior** del componente, nunca dentro de un `if` o de un bucle. Activá el linter de React.
- **`useEffect` es solo para sincronizar con algo externo** (API, timers), no para calcular valores derivados. Limpiá en el `return` lo que el efecto abre.
- **`useMemo` solo para cálculos realmente costosos,** y midiendo antes.

### URL y rutas

- **Filtros, búsqueda y página van en la URL** con `useSearchParams`. Así se conserva el contexto, funcionan los enlaces directos y el botón "atrás".
- **Los parámetros de la URL siempre llegan como texto:** convertilos (`Number(id)`) antes de comparar.
- **En los buscadores que actualizan la URL, aplicá debounce.**
- **Cargá con `lazy()` las pantallas pesadas o poco usadas** (por ejemplo, el panel de administración), pero no la página inicial.
- **Las rutas protegidas se controlan en el router,** y además el backend valida siempre.

### Datos del backend

- **Usá un estado `cargando` propio y otro `error`,** y mostrá indicador de carga, mensaje de error con botón "Reintentar" y estado vacío.
- **Los errores se traducen a lenguaje del usuario:** sin respuesta del servidor, 4xx o 5xx muestran mensajes distintos.
- **Deshabilitá los botones mientras se envía.**
- **Reintento automático solo para operaciones idempotentes (GET),** con timeout y espera creciente. Un pago o un alta se reintentan solo si el usuario lo pide.
- **Para procesos largos, usá un ID de operación y consultá el estado periódicamente (polling),** en vez de dejar al usuario esperando con la pantalla bloqueada.

### Accesibilidad en React

- **`<button>` y no `<div onClick>`.** `htmlFor` en lugar de `for`.
- **Llevá el foco con `useRef`** al abrir un modal o al mostrar un error.
- **Usá `aria-live`, `aria-expanded` y `aria-hidden`** para los cambios dinámicos.
- **Preferí librerías ya accesibles** (Radix UI, React Aria, Headless UI) e instalá `eslint-plugin-jsx-a11y`.

### Seguridad

- **Nada de `dangerouslySetInnerHTML` con contenido del usuario,** porque abre la puerta a ataques XSS.
- **No guardes tokens de sesión en `localStorage`;** preferí cookies `HttpOnly`, `Secure` y `SameSite`.

### Rendimiento

- **Medí antes de optimizar,** con las DevTools y las Core Web Vitals.
- **Para listas enormes, usá virtualización o paginación.**
- **Imágenes:** `loading="lazy"` fuera de la primera pantalla, con `width` y `height` para que la página no salte al cargar.
- **Cada dependencia tiene un costo:** antes de instalar una librería, preguntate si la necesitás.

## 14. Base de un proyecto React (patrones probados)

> Guía general, tomada de otros proyectos. En este repo la estructura concreta (capas, carpetas y dónde va cada cosa) es la de `PLAN-ENTIDADES.md` y `plan-front.md`: donde acá dice `services/`, en este proyecto son los casos de uso de `Presentation/Dependencies`.

### Estructura

- **`pages/`** con una pantalla por archivo y **`components/`** agrupado por funcionalidad (`search/`, `settings/`…), más `shared/` (Layout, Navbar, RutaProtegida) y `common/` (piezas genéricas).
- **`services/`** con un archivo por recurso (`donacion.service.js`…): funciones cortas que devuelven `r.data`. Los componentes nunca llaman a axios directamente.
- **`hooks/`** con la lógica de cada pantalla separada de la vista (`useBuscarDonaciones`, `usePerfilForm`).
- **`enums/` con `Object.freeze`** para estados y roles, en vez de strings sueltos.
- **`utils/formatters.js`** con `Intl.NumberFormat('es-AR')` / `Intl.DateTimeFormat('es-AR')` y funciones que traducen códigos a texto legible.
- **Componentes chicos:** si un archivo pasa las ~300 líneas, partilo.

### Cliente HTTP (`services/api.js`)

- **Una sola instancia de axios con `baseURL` desde `import.meta.env.VITE_API_URL`.**
- **Interceptor de request** que agrega la autenticación; **interceptor de response** que ante un 401 cierra la sesión y navega con el router (no con `window.location`) avisando "Tu sesión venció".
- **`paramsSerializer` que omite `null` y `undefined`** y une arrays con coma, para mandar filtros sin ensuciar la URL.

### Autenticación y rutas

- **`ContextoDeSesion` + `useSesion()`**, que lanza un error si se usa fuera del provider. Al iniciar, verifica si la sesión sigue vigente.
- **`RutaProtegida` con `<Outlet />`**, con un estado de carga accesible (`role="status"`) mientras se verifica la sesión.
- **Rutas anidadas:** `RutaProtegida` → `Layout` (navbar una sola vez) → páginas.
- **Las rutas de landing y login redirigen al inicio** si ya hay sesión; un `*` final redirige a la home o a una página 404.
- **URLs legibles en castellano** (`/mis-donaciones`, `/buscar`).

### Diseño con MUI (u otra librería de componentes)

- **Un `theme.js` centralizado:** paleta, tipografía, radios, sombras, transiciones y overrides de botones y tarjetas. Es el sistema de diseño en un solo archivo.
- **Botón deshabilitado con `cursor: not-allowed`** y un estilo propio bien visible.
- **`textTransform: 'none'` en los botones** (MUI los pone en mayúsculas por defecto).

### Patrones útiles

- **Patrón strategy para selectores que cambian según un tipo:** cada opción define su etiqueta y de dónde trae sus datos.
- **Bandera `ignore` en el `useEffect`** para que una respuesta vieja no pise a una nueva (o `AbortController`).
- **Contexto de notificaciones con un Snackbar global** (`showNotification(msg, 'success')`) para el mensaje posterior a cada acción. Si el back lo permite, notificaciones en tiempo real con WebSocket.
- **Skeletons mientras carga**, con la forma del contenido, en vez de un spinner solo.
- **Paginación simple:** la del backend, con la página en la URL. Nada de precargas ni cachés manuales salvo que se mida que hace falta.

### Errores frecuentes a evitar

- **Filtros y página fuera de la URL:** al recargar o compartir se pierden. Usá `useSearchParams`.
- **Errores que solo van a `console.error`:** si algo falla, el usuario lo tiene que ver en pantalla.
- **Mostrar el mensaje crudo del back** (`err.response.data.message`) sin revisar que sea entendible.
- **`key={index}` en listas dinámicas** (solo se tolera en listas fijas).
- **Proyecto sin ESLint ni `eslint-plugin-jsx-a11y`.**

### Despliegue y tests

- **Servidor con fallback a `index.html`** para que funcionen las rutas de React al recargar: en nginx `try_files $uri $uri/ /index.html;`, en Netlify `_redirects` con `/* /index.html 200`.
- **Caché larga para `/assets/`** (los archivos llevan hash) y nunca para `index.html`.
- **Dockerfile en dos etapas:** build con Node y servir con nginx.
- **Tests end to end con Playwright** que esperan la respuesta real de la API (`waitForResponse`), verifican la URL final y cubren el caso de éxito y el de error.
