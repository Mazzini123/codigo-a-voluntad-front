# Detalle del proyecto y postularse a un perfil

Origen: `specs/backlog/06-detalle-proyecto.md` y `specs/active/postularse-a-un-perfil.md`, que se unen acá (el botón "Postularme" vive en el detalle). También `docs/plan-front.md` §3 y §4, `DESIGN.md` (chips, sellos y diálogo) y `docs/PLAN-ENTIDADES.md` (Proyecto y Colaboracion). Destraba el despliegue de la 05.

## Intención

Que cualquiera entienda de qué se trata un proyecto, qué perfiles busca y cómo sumarse, y que una colaboradora se postule a un perfil en pocos pasos y sabiendo qué datos comparte. Es la pantalla del test de integración del front que pide la consigna.

## Escenarios

### Ver el proyecto

Dado un proyecto,
cuando alguien entra a `/proyectos/:id`,
entonces ve el título, el estado, las etiquetas, la descripción, el avance y los enlaces al sistema y al repositorio si existen. Ve también cada perfil con su sello, las habilidades requeridas y opcionales agrupadas y con nombre, el compromiso, la modalidad, el límite, el modo de aceptación y quién lo ocupa.

Dado un perfil con personas aceptadas,
cuando se lo mira,
entonces se ve el nombre de cada una, que enlaza a su perfil; si la contribución es anónima, "Contribución anónima".

Dado alguien que llegó desde la búsqueda,
cuando toca "Volver a la búsqueda",
entonces vuelve a `/proyectos` con la misma etiqueta, página y vista.

Dado un proyecto que no existe,
cuando se abre su URL,
entonces ve "No encontramos este proyecto" y un enlace a la búsqueda.

### Postularse

Dado una colaboradora y un perfil con la búsqueda abierta,
cuando toca "Postularme",
entonces se abre un diálogo que le pregunta si quiere que se vea su nombre o que sea una contribución anónima. Le aclara que sus datos de contacto solo se comparten si el colectivo acepta la postulación.

Dado ese diálogo,
cuando confirma con "Enviar postulación",
entonces el botón pasa a "Enviando…". Al terminar se cierra y aparece "Te postulaste. El colectivo va a revisar tu postulación." (o "Listo: ya sos parte de este perfil." si el modo del perfil la aceptó sola), y en el perfil se ve el estado de su postulación en lugar del botón.

Dado un perfil con la búsqueda cerrada, vencida o con el límite alcanzado,
cuando la colaboradora lo mira,
entonces "Postularme" está deshabilitado y debajo dice el motivo ("La búsqueda de este perfil cerró el 30/11.", "Este perfil ya completó su límite de colaboraciones." o "La búsqueda de este perfil está cerrada.").

Dado que ya se postuló a un perfil,
cuando vuelve a entrar,
entonces ve "Tu postulación está pendiente", "aceptada" o "rechazada" en ese perfil. En los demás perfiles del proyecto sigue viendo "Postularme" si están abiertos: puede postularse a más de un perfil.

Dado un visitante sin sesión,
cuando toca "Postularme",
entonces va a `/login` y, al volver, sigue en el mismo proyecto.

Dado que el back rechaza la postulación (409: ya postulada o búsqueda cerrada; 400: no cumple las habilidades requeridas),
cuando responde,
entonces el diálogo sigue abierto, muestra el mensaje con `role="alert"` y permite volver a intentar o cancelar.

## Requisitos

### Datos

- **Proyecto:** `ObtenerProyecto` (`GET /proyectos/:id`) trae los perfiles, las colaboraciones (para saber quién ocupa cada perfil), las URLs, `porcentajeConcrecion` y las etiquetas. El back registra una visualización con cada `GET`, y en desarrollo StrictMode lo duplica (`plan-front.md` §5.4).
- **Postulaciones de la colaboradora:** `ListarColaboracionesDeColaborador` (`GET /colaboradores/:perfilId/colaboraciones`), para saber a qué perfiles de este proyecto ya se postuló y en qué estado está.
- **Postularse:** `RegistrarColaboracion` (`POST /proyectos/:id/colaboraciones`) con `{ colaboradorId, perfilId, esPublica }`. Después se vuelven a pedir el proyecto y las postulaciones.
- **Quién ocupa un perfil:** las colaboraciones `ACEPTADA` del proyecto cuyo `perfil` es ese perfil. Se muestra el nombre con `nombreVisible`, enlazado a `/colaboradoras/:id`, o "Contribución anónima" si `colaborador` es `null`.

### Pantalla (`Pages/ProyectoPage.jsx`, ruta `/proyectos/:id`, pública)

- **Volver:**
  - "Volver a la búsqueda", con la flecha, es el primer elemento.
  - La tarjeta de la 05 pasa en `state.busqueda` el `search` de la búsqueda, y el enlace vuelve a `/proyectos` con ese `search`.
  - Si se entró directo, vuelve a `/proyectos`.
- **Encabezado:**
  - `h1` con el título.
  - Una línea en tinta suave con el estado ("Abierto" o "Finalizado") y "Publicado el 3/11".
  - Las etiquetas como chips y la descripción, respetando los saltos de línea.
- **Avance:**
  - "Avance: 40 %", con una barra `<progress>` que tiene su label.
  - Los enlaces externos "Ver el sistema" y "Ver el repositorio", si existen, con el aviso oculto "(se abre en otra pestaña)".
  - El enlace a la página de avance se suma con la spec 07.
- **Perfiles:**
  - `h2` "Perfiles que busca", con un `<article>` por perfil.
  - Cada perfil lleva como `h3` su descripción y el `SelloDeBusqueda` de la 05.
  - Las habilidades en dos grupos con título, "Requeridas" y "Opcionales", como pide `DESIGN.md` → Chips. Con sesión de colaboradora, las que tiene llevan la tilde.
  - Una lista de datos:
    - Compromiso: "5 h por mes".
    - Modalidad: "Gratuita".
    - Límite: "Hasta 3 colaboraciones" o "Sin límite".
    - Aceptación:
      - `REVISION_MANUAL`: "El colectivo revisa cada postulación".
      - `TODO_SUMA`: "Se acepta a todas las personas que se postulan".
      - `HASTA_LLENAR_VACANTES`: "Se acepta automáticamente hasta completar el límite".
  - "Quiénes colaboran" con la lista de personas aceptadas. Si no hay ninguna: "Todavía nadie ocupa este perfil.".
  - La acción del perfil (ver abajo).
- **Formatos nuevos** (`Formatos/proyecto.js`): `textoLimite`, `textoModoAceptacion`, `fechaLarga` ("3/11/2026") y `motivoNoPostulable(perfil, proyecto, hoy)`.

### Acción de cada perfil (`Components/Proyecto/AccionDePerfil.jsx`)

| Quién mira                                | Qué ve                                                                                                                                      |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Visitante sin sesión                      | "Postularme", que lleva a `/login` con `state.desde` en este proyecto.                                                                      |
| Cuenta sin perfil                         | "Postularme", que lleva a `/bienvenida`.                                                                                                    |
| Colectivo                                 | Nada. Las postulaciones son de colaboradoras.                                                                                               |
| Colaboradora con postulación a ese perfil | El estado de la postulación ("Tu postulación está pendiente", "aceptada" o "rechazada") con el `SelloDeBusqueda` del color que corresponde. |
| Colaboradora y perfil no postulable       | "Postularme" deshabilitado, con el motivo debajo enlazado por `aria-describedby`.                                                           |
| Colaboradora y perfil abierto             | "Postularme", que abre el diálogo.                                                                                                          |

- **Botón secundario:** "Postularme" es secundario en todos los perfiles. Con varios perfiles, el coral en cada botón rompería la regla de una sola voz de `DESIGN.md`. El coral queda para "Enviar postulación", dentro del diálogo.

### Diálogo de postulación

- **`DialogoDeConfirmacion` con `children`:** suma la prop `children`, que se renderiza entre la descripción y las acciones. Lo demás no cambia.
- **Contenido:**
  - Título: "¿Te postulás a «Desarrolladora frontend»?".
  - Descripción: "Proyecto: Sistema de turnos del comedor.".
  - `GrupoDeOpciones` "¿Cómo querés aparecer en el proyecto?", con "Con mi nombre" (`esPublica: true`, por defecto) y "Contribución anónima". La ayuda dice: "Si elegís anónima, en el proyecto se va a ver «Contribución anónima» en lugar de tu nombre.".
  - El aviso en `info`: "Tus datos de contacto se comparten solo si el colectivo acepta tu postulación.".
- **Botones:** "Cancelar" y el primario "Enviar postulación", que pasa a "Enviando…". Es `permanente={false}`.
- **Si falla:** el mensaje del `ApiError` aparece dentro del diálogo con `role="alert"` y el diálogo sigue abierto.
- **Hook `usePostularse(proyectoId)`:** expone `postularse(perfil, esPublica)`, `enviando` y `error`, y decide el aviso según el `estado` de la respuesta.

### Rutas

- `/proyectos/:id` en `RutasDeLaApp`.
- `MensajeDePantalla` suma `volverA` y `textoVolver` (por defecto `/` y "Volver al inicio"). El 404 del proyecto usa "Volver a la búsqueda".

## Estados

- **Cargando:** skeleton del encabezado y de dos perfiles.
- **Con datos:** todo lo anterior. Un proyecto sin perfiles muestra "Este proyecto todavía no cargó perfiles.".
- **No encontrado:** "No encontramos este proyecto", con "Volver a la búsqueda".
- **Error:** `EstadoDeError` "No pudimos cargar el proyecto" con "Reintentar". Si solo fallan las postulaciones de la colaboradora, los botones se muestran igual y el back responde 409 si ya se postuló.
- **Enviando:** "Enviando…", con "Cancelar" deshabilitado. Esc no cierra el diálogo mientras envía.
- **Finalizado:** el sello "Finalizado" en cada perfil y ningún "Postularme".

## A acordar con el back

- **El colectivo en `ProyectoDto`** (id, nombre). Sin él no se puede mostrar quién publica ni reconocer al colectivo dueño para mostrarle "Editar", "Postulaciones recibidas" y "Buscar colaboradoras" (specs 04, 08 y 09).
- **Postulación repetida.** El 409 por "ya postulada" debe ser por perfil, no por proyecto: el enunciado permite postularse a varios perfiles del mismo proyecto. Hay que confirmarlo con el back.
- **Postulaciones anónimas propias.** `GET /colaboradores/:id/colaboraciones` no incluye las contribuciones anónimas de la persona, así que el front no sabe si ya se postuló de forma anónima. Propongo que se las devuelva a la dueña (es su propio historial).
- **El estado de la búsqueda por perfil** (igual que en la 05).

## Fuera de alcance

- Las acciones del colectivo dueño (specs 04, 08 y 09) y la página de avance (spec 07).
- Darse de baja de una postulación (spec 10).
- Comentarios públicos y valoraciones.

## Criterio de aceptación

- Los escenarios funcionan contra el back, y con sesión simulada en desarrollo.
- La información se entiende sin color: requeridas y opcionales, sellos y estado de la postulación siempre con texto.
- Un solo `h1`, los niveles de título en orden y cada rol ve solo sus acciones.
- El diálogo se usa con teclado: foco inicial en "Cancelar", Esc para cerrar y el foco vuelve a "Postularme".
- Es la pantalla del test de integración de la consigna: un test recorre la búsqueda, el detalle y la postulación con el back simulado en axios.
- `npm run lint`, `npm run format:check`, `npm test` y `npm run build` en verde sobre el repo completo, y el checklist de `docs/criterios-pantallas-web.md` revisado.
