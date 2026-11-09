# Revisión Impeccable 03: buscar y elegir un proyecto

Origen: ronda del 06/11/2026 desde la raíz del repo. Primero se ejecutó `/impeccable audit` y después `/impeccable critique` sobre las pantallas implementadas en `src/Presentation`.

- **Audit técnico, 17/20.** Accesibilidad 3/4 (foco en tarjetas obsoletas), rendimiento 3/4 (carga inicial), sistema visual 4/4 (tema claro definido y paleta en tokens), adaptación 3/4 (cabecera verificada en Edge a 320 y 360 px; sin dispositivo físico) e integridad 4/4 (sellos, formularios y navegación compartidos). El detector estático devolvió cero hallazgos. R1 y R2 surgen de la comprobación por teclado y la inspección del build.
- **Critique, 27/40.** Dos evaluaciones independientes. El recorrido público incluyó cuatro proyectos y la ficha del comedor. La superposición del detector en vivo quedó sin verificar. Informe en [la captura de esta ronda](../../.impeccable/critique/2026-11-06T19-44-10Z__src-presentation.md). La ronda anterior de 32/40 profundizó en la experiencia de la colaboradora.

## Intención

Que quien cambia de página con el teclado pueda seguir navegando sin abrir por error un resultado anterior. Que quien entra a buscar proyectos descargue las pantallas de edición y alta recién cuando las necesite.

Que la persona visitante pueda descubrir por qué temas buscar y reconocer qué oportunidades siguen disponibles, a quién ayudaría y en qué condiciones.

## Escenarios

- **Cambio de página con conexión lenta.** Dada la primera página con resultados, cuando la persona elige «Siguiente» y pulsa Tab mientras espera, el foco salta los resultados viejos. Al terminar la carga, puede abrir una tarjeta de la nueva página con el teclado.
- **Primera visita.** Dada una visita a `/proyectos` con caché vacía, el navegador carga lo necesario para buscar. Las pantallas de edición y alta se cargan al entrar por sus rutas.
- **Elegir por tema.** Desde la cartelera, una persona puede buscar por una etiqueta real como «alimentacion». Al abrir una ficha con perfiles abiertos y cerrados, reconoce primero los que reciben postulaciones y entiende si su trabajo tendría remuneración.

## Hallazgos y requisitos

### R1. Impedir la activación de tarjetas anteriores mientras carga otra página — hecho

- **Origen y prioridad.** Audit, P2. En Edge a 320 px, con dos páginas simuladas y la respuesta de la segunda demorada, «Siguiente» seguido de Tab enfocó el enlace de la página 1 mientras se leía «Cargando página 2…».
- **Dónde.** `src/Presentation/Pages/ProyectosPage.jsx` y su CSS Module. La grilla atenuada tiene `pointer-events: none`, que solo bloquea la interacción por puntero.
- **Resultado esperado.** Conservar las tarjetas atenuadas y el foco inicial en el conteo. Mientras llega la respuesta, excluir la grilla vieja del recorrido por teclado y de la activación por tecnologías de asistencia. Al resolverse el pedido, devolver la interacción a los resultados actuales. Mantener operables los controles que están fuera de la grilla.
- **Verificación.** Test con la segunda respuesta controlada y comprobación en navegador con Tab y Enter. Cubrir también un error en la segunda página seguido de «Reintentar».

### R2. Diferir el código de pantallas de alta y edición — hecho

- **Origen y prioridad.** Audit, P2. Las páginas se importan al inicio en `src/Presentation/Routes/RutasDeLaApp.jsx`. El build de referencia entrega un único JavaScript de 556,57 kB minificado (173,49 kB con gzip). El tiempo de descarga en un celular real queda sin medir.
- **Resultado esperado.** Al abrir el listado público, el navegador debe poder mostrarlo sin descargar las pantallas de alta y edición. Resolver su carga al navegar, incluso si la primera visita es un enlace directo a una ruta protegida. Conservar permisos, retorno tras el ingreso y foco al cargar el título de la pantalla.
- **Verificación.** Comparar los pesos antes y después en un build de producción con la misma configuración. En la pestaña de red, con caché vacía, comprobar que el listado no descarga los módulos diferidos y que la ruta correspondiente sí los descarga al entrar. Registrar la diferencia del JavaScript inicial y verificar navegación, acceso directo y recarga.

### R3. Mostrar temas que sirvan para buscar — hecho

- **Origen y prioridad.** Critique, P1. «Buscar por etiqueta» convive con tarjetas que muestran habilidades como React. Las etiquetas reales, como «alimentacion» o «logistica», aparecen recién en el detalle.
- **Propuesta.** Ofrecer junto al buscador etiquetas de tema de los resultados disponibles, sin duplicados, visualmente distintas de las habilidades. Elegir una aplica el filtro existente, actualiza el campo y la URL, y vuelve a la primera página de «Todos los proyectos». El título de cada tarjeta conserva su enlace al detalle.
- **Verificación.** Con resultados que compartan un tema, comprobar que se ofrece una sola vez y que se puede elegir con teclado. Con proyectos sin etiquetas se conserva la búsqueda escrita. Verificar que volver desde el detalle conserva el filtro.

### R4. Distinguir oportunidades abiertas del histórico — hecho

- **Origen y prioridad.** Critique, P2. La cartelera titulada «Proyectos que buscan colaboradoras» incluía un finalizado. En la ficha del comedor, «Perfiles que busca» agrupaba un perfil abierto y dos cerrados.
- **Propuesta.** Usar en la cartelera un encabezado que admita ambos estados. En el detalle, presentar primero los perfiles con búsqueda abierta y separar los demás con un encabezado descriptivo y un control accesible para desplegarlos. Conservar visibles las postulaciones propias al consultar el histórico y respetar el orden relativo dentro de cada grupo.
- **Verificación.** Con perfiles abiertos, cerrados y con límite alcanzado, comprobar agrupación, orden, sellos y acceso por teclado al histórico. Si todos están cerrados o el proyecto finalizó, hacer visible su estado y permitir consultar los perfiles. Con cero perfiles se conserva el vacío correspondiente.

### R5. Aclarar si el trabajo es remunerado — hecho

- **Origen y prioridad.** Critique, P2. «5 h por semana · Gratuita» puede referirse al precio del sistema o a la remuneración de quien trabaja.
- **Propuesta y verificación.** Mostrar «Colaboración sin remuneración» para `GRATUITA`. Probar el texto en el listado, el detalle y la selección y resumen del alta. El valor enviado al back sigue siendo `GRATUITA`. Comprobar que la frase completa se lee a 320 px.

## A acordar con el back

- **Colectivo que publica (critique, P1).** La ficha y la tarjeta carecen del nombre y enlace del colectivo que recibirá la postulación. Acordar identificador y nombre público en el DTO del listado y del detalle. Hasta tener contrato y datos verificables, registrar el hallazgo como bloqueado. No deducir autoría ni sumar un pedido por tarjeta.

## A confirmar — hecho

- R1–R5 aprobados por la persona el 06/11/2026 e implementados. La identificación del colectivo sigue bloqueada por el contrato con el back.

## Estados

- En la primera carga se conserva el skeleton. Durante la paginación se mantiene visible el aviso de carga.
- Con datos, solo los enlaces de resultados vigentes vuelven a estar disponibles. El vacío y «sin resultados» conservan sus mensajes y acciones.
- Ante un error de paginación se ofrece «Reintentar». Durante la carga diferida de una ruta hay una indicación accesible de espera y, si falla, una forma de recuperarse.

## Fuera de alcance

- Administración de un proyecto por su colectivo (04b), seguimiento de postulaciones de la colaboradora (10) y contratos pendientes con el back. Conservar sus specs como fuente de alcance.
- Limpieza de los datos de prueba (proyecto «PRUEBA – borrar» y texto con un carácter de reemplazo). La revisión observó esos datos en la base local.

## Criterio de aceptación

- Verificar los escenarios de cada requisito en escritorio y a 320 px. Registrar por separado datos locales y respuestas simuladas.
- Ejecutar sobre el repo completo `npm run lint`, `npm run format:check`, `npm test` y `npm run build`.
- Implementación y verificación de R1–R5 — hecho. Flujo `/impeccable document` aplicado con la skill local: `DESIGN.md` y `.impeccable/design.json` alineados con el código verificado. Traspaso y decisiones actualizados. La spec queda en `active` por el acuerdo con el back.

## Verificación del 06/11/2026 — hecho

- **Tests:** 439 tests en 34 archivos, con `VITEST_MAX_WORKERS=1`. Cubren grilla inerte durante la paginación, falla y reintento; temas únicos elegidos con teclado y sincronización de campo, URL, vista y página; búsqueda escrita sin etiquetas; agrupación y orden del histórico, ausencia de búsquedas abiertas, proyecto finalizado, postulación propia y foco visible cuando un perfil pasa al histórico después de postularse; carga diferida con espera, error recuperable, foco, entrada directa y permisos; modalidad en tarjeta, detalle, selección y resumen del alta conservando `GRATUITA` en el pedido. El retorno desde detalle conserva el filtro.
- **Checks del repo completo:** `npm run lint`, `npm run format:check`, `npm test` y `npm run build` en verde. Con paralelismo habitual aparecieron dos timeouts de 5 s en el alta y en una ejecución con dos workers y otros checks concurrentes apareció otro. Una corrida anterior con dos workers pasó; la verificación final usa un worker, sin ampliar los tiempos de espera ni cambiar la configuración del proyecto. La suite también emite avisos de React sobre `act(...)` en pruebas existentes de navegación y sesión; no son fallas de aserciones.
- **Navegador:** navegador integrado Chromium, escritorio de 1280×900 y 320×900. Sin desborde horizontal en las pantallas revisadas; controles nuevos con foco visible y áreas de al menos 44px. El histórico se abre con Enter; el texto de remuneración completo se lee en las cuatro ubicaciones.
- **Datos locales (puerto 5173):** cartelera de cuatro proyectos, tema «alimentacion», detalle del comedor con perfiles abiertos y cerrados, apertura del histórico con teclado y vuelta al listado con la etiqueta conservada. No se modificó la base local.
- **Respuestas simuladas:** API de QA con 14 proyectos, página 2 demorada 6 s, primer pedido fallido y reintento exitoso. En escritorio y a 320px, Tab desde el conteo salta las tarjetas antiguas hacia la paginación; después se puede abrir un resultado nuevo con Enter. Se revisaron perfiles abiertos, cerrados, con límite alcanzado y proyecto finalizado. El alta llegó a revisión con un perfil, sin publicar. Los tests cubren además las postulaciones propias del histórico y el vacío sin perfiles.
- **Producción:** `dist/` real servido localmente, sin caché. Registro de pedidos HTTP: al abrir `/proyectos` se descargan solo el módulo inicial y su módulo compartido; no se solicitan las cinco pantallas diferidas. Una entrada privada sin sesión lleva a ingreso sin descargarlas. Para verificar navegación privada, acceso directo y recarga se usó otro build de QA fuera del repo, con identidad y cuenta falsas inyectadas solo en el proceso de build; las rutas, permisos, páginas y carga diferida son los mismos. Allí, `NuevoProyectoPage` se pide recién al abrir la ruta y el foco termina en su h1 tras la espera. No se incorporó la sesión falsa al build entregable.
- **Checklist revisado:** estados, lenguaje, contexto en URL, permisos, foco, teclado, contraste y tokens existentes, consistencia y adaptación móvil. No se midió la descarga en un celular físico ni se ejecutó Lighthouse. El ingreso real con Logto conserva sus dependencias de configuración y acuerdos; los tests verifican el destino al enviar a ingreso.

### R2: comparación de JavaScript inicial en producción — hecho

Mismo comando y configuración: `npm run build`, Vite 8.3.5. Valores redondeados del reporte del build, en kB decimales; gzip es una estimación del build. El total posterior suma el entry **y su módulo compartido precargado**, no solo el archivo llamado `index`.

| JavaScript inicial |     Antes |   Después |        Reducción |
| ------------------ | --------: | --------: | ---------------: |
| Minificado         | 556,57 kB | 506,15 kB | 50,42 kB (9,1 %) |
| Con gzip           | 173,49 kB | 162,32 kB | 11,17 kB (6,4 %) |

Después: entry de 332,36 kB (102,05 kB gzip) más compartido de 173,79 kB (60,27 kB gzip). Se difieren `AltaColectivoPage`, `AltaColaboradoraPage`, `PerfilColectivoPage`, `PerfilColaboradoraPage` y `NuevoProyectoPage`, con sus dependencias que no necesita el recorrido público.
