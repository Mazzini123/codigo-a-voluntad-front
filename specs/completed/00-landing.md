# Landing pública: presentar Código a Voluntad — hecho

Origen: propuesta solicitada después de la revisión Impeccable 03. Alcance aprobado por la persona el 06/11/2026, implementado y verificado.

## Intención

Que una persona que llega por primera vez entienda qué es Código a Voluntad, reconozca si puede colaborar o presentar una necesidad de su colectivo y encuentre cómo empezar.

La portada presenta el producto; la búsqueda sigue en `/proyectos`. Se reutiliza la identidad de `DESIGN.md`, la cabecera y los componentes compartidos.

## Escenarios

- **Primera visita:** dada una persona sin sesión que entra a `/`, ve qué conecta la plataforma y puede explorar proyectos sin registrarse.
- **Quiero colaborar:** al elegir «Explorar proyectos», llega a `/proyectos`. El listado y el detalle siguen siendo públicos; postularse conserva el flujo de ingreso existente.
- **Tengo una necesidad en mi colectivo:** encuentra una explicación breve del recorrido y la acción «Publicar un proyecto». Esa entrada lleva a `/registro`, con una aclaración visible de que primero debe crear una cuenta y completar el perfil de su colectivo. No asigna un rol por anticipado.
- **Ya tengo cuenta:** puede usar «Ingresar» en la cabecera. Al terminar el ingreso conserva el comportamiento actual de retorno e inicio por rol.
- **Ya estoy usando la plataforma:** si entra a `/` con sesión, se deriva con `replace` al inicio de su rol: colectivo a `/colectivo/proyectos`, colaboradora a `/proyectos`, cuenta sin perfil a `/bienvenida`.

## Requisitos

### R1. Ruta y navegación — hecho

- `/` presenta la landing a visitantes; `/proyectos` conserva el buscador y sus parámetros.
- La cabecera mantiene el enlace «Proyectos» y el acceso a ingreso. No se agrega otro menú ni se duplica «Ingresar» en el contenido.
- La marca conserva su destino `/`. Con sesión confirmada, la marca lleva al inicio operativo del rol mediante la raíz.
- Revisar los enlaces existentes a `/` —incluidos 404 y cierre de sesión— para que el resultado sea coherente con la nueva portada. No se modifican los destinos explícitos de regreso a la búsqueda.

### R2. Mensaje inicial y acción principal — hecho

- Un único h1 explica la propuesta. Texto inicial aprobado: «Conectamos colectivos sociales con personas que desarrollan software».
- Bajada aprobada: «Un espacio para compartir lo que tu colectivo necesita y encontrar proyectos a los que aportar tus habilidades».
- Una única acción principal coral: «Explorar proyectos», enlace a `/proyectos`.
- La lectura inicial permite identificar a ambos públicos sin exigir que conozcan términos técnicos.
- Estos textos fueron aprobados sin agregar afirmaciones sobre resultados, alcance o impacto.

### R3. Explicar los dos recorridos — hecho

- **Para colaborar:** completar el perfil con habilidades, explorar proyectos y revisar sus perfiles, postularse al que corresponda. La ficha indica el compromiso, la remuneración y la forma de aceptación.
- **Para colectivos:** crear el perfil del colectivo, publicar el proyecto con los perfiles necesarios y gestionar las postulaciones según su forma de aceptación.
- La sección de colectivos incluye «Publicar un proyecto» como acción secundaria a `/registro`, con la aclaración sobre cuenta y perfil previos.
- No se promete que siempre haya revisión manual: hay perfiles con aceptación automática.
- No se promete disponibilidad de funcionalidades pendientes ni resultados como conseguir colaboradoras o cubrir una búsqueda.

### R4. Resolver dudas básicas con información cierta — hecho

Tres preguntas breves, con respuestas visibles sin interacción adicional:

- **¿Necesito una cuenta para explorar?** No para buscar y consultar proyectos. Para postularse o publicar hace falta ingresar y completar el perfil correspondiente.
- **¿Todas las colaboraciones son sin remuneración?** Cada perfil informa si la colaboración es sin remuneración, con incentivo económico o con posibilidad de contratación.
- **¿Cuándo se comparten mis datos de contacto?** Según la forma de aceptación del perfil. Antes de enviar la postulación se informa cuándo se comparten; en aceptación automática puede ser al enviarla.

### R5. Identidad, adaptación y carga — hecho

- Respetar las superficies blancas, petróleo, coral y las tipografías del sistema actual de `DESIGN.md`, con una jerarquía clara y una sola acción principal.
- Definir la composición visual dentro de esa identidad al implementar la spec aprobada; no incorporar una nueva marca ni un sistema visual distinto.
- Contenido y acciones legibles en escritorio y a 320px, con áreas de interacción de al menos 44px, contraste suficiente y foco visible.
- Encabezados semánticos en orden, un h1 y navegación completa por teclado. El título de pestaña identifica el inicio de Código a Voluntad.
- No consultar al back para mostrar el contenido de la landing ni añadir dependencias.
- No adelantar la descarga de las pantallas de alta y edición diferidas en la revisión 03.

## Estados

- **Verificación de sesión:** mantener el contenido público disponible; no sustituirlo por un skeleton de datos inexistentes. Una sesión confirmada aplica el comportamiento aprobado para `/`.
- **Visitante:** contenido completo, «Explorar proyectos», entrada de colectivos y acceso a ingreso.
- **Con sesión:** derivación al inicio por rol con `replace`.
- **Back sin conexión:** el contenido de la landing sigue siendo legible. El listado y el ingreso conservan sus propios estados de error al visitarlos.
- **Vacío y sin resultados:** no aplican a una portada de contenido estático. Los resuelve `/proyectos`.

## Decisiones aprobadas — hecho

1. **Alcance:** landing estática en `/`, con la cartelera en `/proyectos` y sin nuevos datos del back.
2. **Prioridad y contenido:** «Explorar proyectos» como acción principal; entrada secundaria de colectivos a registro; mensaje inicial, dos recorridos y tres preguntas propuestos.
3. **Personas con sesión:** derivarlas desde `/` al inicio de su rol, en lugar de mostrarles la landing. La marca funciona como regreso al inicio operativo de cada rol.

## A acordar con el back

- Esta versión no requiere nuevos endpoints ni contratos.
- La identificación del colectivo en tarjetas y detalle sigue pendiente en `revision-impeccable-03.md`; no bloquea esta portada.

## Fuera de alcance

- Métricas, testimonios, logotipos de organizaciones, casos de éxito, fotografías o proyectos inventados.
- Proyectos destacados o recientes, nuevas consultas al back y reproducción del buscador dentro de la landing.
- Cambios en registro, elección de rol, permisos, contratos de sesión o reglas de postulación.
- Formularios de contacto, newsletter, analítica, dependencias nuevas y publicación o despliegue.
- Repetir audit o critique antes de aprobar e implementar la spec.

## Criterio de aceptación

- Un visitante puede ir de `/` al listado y a un detalle sin ingresar.
- La entrada de colectivos lleva a registro y explica el paso previo; no cambia el rol ni publica nada por sí sola.
- Tests del comportamiento de `/` para visitante, colectivo, colaboradora y cuenta sin perfil, según lo aprobado.
- Se conservan los destinos de retorno tras ingresar y los parámetros al volver desde un detalle al listado.
- Tests de los destinos de las acciones, jerarquía semántica y ausencia de consultas de proyectos originadas por la landing.
- Revisar en navegador a 1280 y 320px, y solo con teclado: contenido completo, foco, navegación, acciones y ausencia de scroll horizontal.
- Comprobar en producción que visitar la landing no solicita módulos de alta o edición.
- Ejecutar sobre el repo completo `npm run lint`, `npm run format:check`, `npm test` y `npm run build`; registrar limitaciones o inestabilidad de la suite.
- Después de implementar y verificar: alinear `DESIGN.md` mediante `/impeccable document`, registrar las decisiones aprobadas y actualizar `docs/traspaso.md`.

## Verificación del 06/11/2026 — hecho

- **Repo completo:** `npm run lint`, `npm run format:check`, `npm test` y `npm run build` en verde. Suite final: 447 tests en 35 archivos, con `VITEST_MAX_WORKERS=1` y `--maxWorkers=1`, sin ampliar timeouts ni cambiar configuración.
- **Tests nuevos:** ocho escenarios de portada y rutas reales: visitante sin consultas a proyectos, sesión pendiente sin ocultar el contenido, tres tipos de cuenta con redirección `replace`, entrada de colectivos a registro, exploración de listado y detalle sin sesión y regreso por la marca, y cierre de sesión hacia la portada. La prueba de 404 espera ahora la landing; dos selectores antiguos de habilidades se alinearon con el label existente «Nombre de la habilidad». Los tests existentes verifican retorno tras ingreso y parámetros de búsqueda.
- **Cierre de sesión:** navegación a `/` con `flushSync` para evitar que una ruta protegida mande a login entre la actualización de sesión y el cambio de pantalla. Cubierto desde una ruta real de colectivo.
- **Navegador:** portada completa a 1280×900 y 320×900, sin desborde horizontal. Ambos enlaces de contenido tienen 44px de alto; encabezados en orden, foco visible y preguntas completas. Tab desde el título alcanza «Explorar proyectos» y luego «Publicar un proyecto»; Enter en la segunda acción abre registro y enfoca su título. El listado público se abre desde la portada. El recorrido al detalle y la vuelta se verifican con tests de rutas reales y respuestas simuladas.
- **Producción con back indisponible:** servidor estático de QA sobre `dist`, con caché desactivada y API respondiendo 503 si se la solicita. Al entrar y recargar `/`, el contenido permanece completo; el registro HTTP no contiene pedidos a `/api` ni descargas de pantallas de alta/edición. Solo carga el entry y su módulo compartido. Consola de producción sin warnings ni errores en el recorrido de portada y registro. No se envió ningún registro ni se modificó la base.
- **Identidad:** se conserva el sistema actual del repo, con fondo y superficies blancos, petróleo y coral, sin revertir los cambios de marca previos a esta implementación. El detector estático sobre los dos archivos de la landing devolvió `[]`. Revisión final de Impeccable: `ship`, sin correcciones materiales; no se repitieron audit ni critique.
- **Documentación:** flujo `/impeccable document` aplicado después de la revisión; actualizados `DESIGN.md` y `.impeccable/design.json` con el patrón de Inicio, manteniendo los tokens y las decisiones existentes. Actualizados traspaso y decisiones.
- **Límites:** no se ejecutó Lighthouse ni se probó un celular físico o el registro real con Logto. La landing no requiere acuerdos nuevos con el back; los pendientes de otras specs siguen en ellas.
