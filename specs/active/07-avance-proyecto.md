# Avance del proyecto (logros y avances)

Origen: borrador del backlog, contrastado con `docs/PLAN-ENTIDADES.md` (módulos Logro y Avance), la spec 06 (el detalle ya muestra un panel de avance de solo lectura y deja el enlace a esta página para la 07), la spec 04b (administración del proyecto) y `docs/plan-front.md` (ruta pública `/proyectos/:id/avance`).

Estado: borrador para aprobar (09/11/2026). Falta leer «A confirmar» y «A acordar con el back»; se implementa en una sesión nueva.

## Intención

Dar trazabilidad pública de cómo avanza cada proyecto y que el colectivo dueño pueda mantenerla: cargar, editar y eliminar logros, y registrar avances (porcentaje de concreción y enlaces al sistema y al repositorio).

## Escenarios

Dado un proyecto con avances y logros,
cuando cualquier persona (también una visitante) entra a `/proyectos/:id/avance`,
entonces ve el porcentaje de concreción con barra y texto, los enlaces al sistema y al repositorio, los logros del más reciente al más viejo y el historial de avances.

Dado un proyecto sin ningún avance registrado,
cuando se entra a su avance,
entonces no hay barra y se lee «Todavía no se registraron avances».

Dado un proyecto sin logros,
cuando se entra a su avance,
entonces se lee «Todavía no se cargaron logros» y, solo para el colectivo dueño, aparece «Cargar el primer logro».

Dado el colectivo dueño de un proyecto abierto,
cuando carga un logro con título y descripción y confirma el formulario,
entonces el logro aparece en la lista, se anuncia «Cargamos el logro.» y el foco vuelve al botón «Cargar un logro».

Dado el colectivo dueño y un logro existente,
cuando lo edita (título y descripción) y guarda,
entonces la lista muestra los cambios y se anuncia «Guardamos los cambios del logro.».

Dado el colectivo dueño y un logro existente,
cuando toca «Eliminar» y confirma en el diálogo,
entonces el logro desaparece de la lista, se anuncia «Eliminamos el logro.» y el foco va al título de la página. Si cancela, no se envía nada.

Dado el colectivo dueño de un proyecto abierto,
cuando registra un avance con un porcentaje mayor al actual y los dos enlaces, y confirma el diálogo,
entonces la barra, los enlaces y el historial se actualizan y se anuncia «Registramos el avance: 60 %.».

Dado un porcentaje igual o menor al actual,
cuando el dueño intenta registrarlo,
entonces el formulario lo marca como error («Tiene que superar el avance actual: 40 %») y no se envía nada. Si el back igual lo rechaza, se muestra el mensaje de la operación, sin el error crudo.

Dado un título de logro repetido,
cuando el back responde 409,
entonces el formulario muestra «Ya hay un logro con ese título» en el campo y conserva lo escrito.

Dado un proyecto finalizado,
cuando el dueño entra a su avance,
entonces ve toda la información y una nota «El proyecto está finalizado: ya no se pueden cargar cambios», sin ninguna acción de edición.

Dada una persona que no es el colectivo dueño (visitante, colaboradora u otro colectivo),
cuando entra a la página,
entonces ve la información y ninguna acción de edición. El back igual valida cada operación.

## Requisitos

- Ruta pública `/proyectos/:id/avance` con su constante `RUTA_AVANCE_DEL_PROYECTO` y `rutaAvanceDelProyecto(id)` en `Routes/rutas.js`, declarada con `handle: { tipoDePantalla }` como el detalle. Pantalla `AvancePage` en `Pages/publicas/`, con carga diferida.
- Operaciones del contrato (`docs/PLAN-ENTIDADES.md`): `ObtenerProyecto`, `ListarLogros`, `ListarAvances`, `CrearLogro`, `ActualizarLogro`, `EliminarLogro` y `RegistrarAvance`. Los casos de uso, HttpClients y Dependencies ya existen; no se agregan rutas.
- Hooks (la página no llama a casos de uso): `useAvanceDelProyecto(proyectoId)` en `Hooks/proyecto/` (una `useConsulta` con proyecto, logros y avances, con `{ proyecto, logros, avances, error, cargando, reintentar }`), `useGestionarLogros(proyectoId, alCambiar)` y `useRegistrarAvance(proyectoId, alRegistrar)`, estos dos sobre `useMutacion` con `mensajes` por status. Tras una operación exitosa se vuelve a pedir la consulta; si esa recarga falla, el aviso de éxito igual se muestra y aparece el error con «Reintentar» (mismo criterio que la 09).
- Porcentaje actual: el del proyecto (`porcentajeConcrecion`); si no viene, el del avance más reciente; si no hay ninguno, no se muestra la barra. Entre 0 y 100, con `<progress>` y `label` («Avance: 40 %»), igual que el panel del detalle. Se extrae una pieza compartida `BarraDeAvance` en `Components/Proyecto/avance/` y el detalle la reutiliza.
- Enlaces al sistema y al repositorio con `EnlaceExterno` (abre en pestaña nueva y lo avisa); si falta uno o no es una URL válida, no se muestra.
- Logros: título, descripción y fecha (solo lectura, la pone el back), ordenados por fecha del más reciente al más viejo en el front. La descripción es texto plano que respeta los saltos de línea. Tarjeta `TarjetaDeLogro` con `h3` por título.
- Historial de avances visible en la página (lista, del más reciente al más viejo) con fecha, porcentaje y los dos enlaces de ese avance.
- Formulario de logro en un diálogo (`DialogoDeLogro`, alta y edición): título y descripción obligatorios, con los largos máximos del back; validación pura en `Formularios/proyecto/formularioLogro.js`. La edición envía solo `titulo` y `descripcion` (ambos son obligatorios en el `PUT`, nunca el DTO entero).
- Formulario de avance (`FormularioDeAvance`): porcentaje numérico, URL del sistema y URL del repositorio, las dos obligatorias y con `http:` o `https:`; precargado con las URLs actuales. Validación pura en `Formularios/proyecto/formularioAvance.js`: el porcentaje tiene que superar el actual (aviso previo; el back decide). Al enviar con error, el foco va al primer campo con error (`useEnfocarPrimerError`).
- Registrar un avance se confirma con `DialogoDeConfirmacion` (`permanente`): no hay edición ni baja de avances y cada nuevo avance tiene que superar al anterior, así que un error de tipeo no se puede deshacer.
- Eliminar un logro se confirma con `DialogoDeConfirmacion` (`permanente`). Cancelar deja el foco en «Eliminar».
- Las acciones del dueño aparecen solo si `useEsDuenoDelProyecto` da `esDueno === true` y el proyecto está `ABIERTO`; mientras se verifica, la información pública se muestra igual y las acciones aparecen después, sin saltos de foco. Con proyecto finalizado se muestra la nota del escenario.
- Mensajes por status definidos por los hooks: 409 en logros → «Ya hay un logro con ese título»; 409 o 422 en avance → mensaje por campo traducido desde `issues` o, si no hay, «No pudimos registrar el avance. Revisá el porcentaje y los enlaces.»; 403 → «Solo el colectivo dueño puede hacer este cambio»; 404 del proyecto → pantalla «No encontramos este proyecto» con enlace a `/proyectos`. Nunca el error crudo ni el status.
- Accesibilidad: un solo `h1` («Avance de» + título del proyecto, con foco al entrar), `h2` para «Logros» y «Historial de avances», listas semánticas, controles de al menos 44 px, foco visible, contraste 4.5:1, sin scroll horizontal a 320 px, y texto equivalente de la barra para lectores de pantalla.
- Enlace «Ver el avance completo» desde el panel de avance del detalle (spec 06), con `estadoParaVolver` para regresar. La página lleva «Volver al proyecto».
- Componentes nuevos en `Components/Proyecto/avance/` (subcarpeta de `Proyecto/`, junto a `alta/`, `detalle/` y `listado/`); textos y formatos en `Presentation/Formatos/avance.js`.

## Estados

- Cargando: esqueleto «Cargando el avance del proyecto…».
- Con datos: barra, enlaces, logros e historial.
- Sin avances: sin barra, «Todavía no se registraron avances».
- Sin logros: «Todavía no se cargaron logros» (y, para el dueño, «Cargar el primer logro»).
- Sin resultados: no aplica (no hay filtros ni paginación).
- Error: `EstadoDeError` con «Reintentar»; 404 con la pantalla de proyecto inexistente.
- Guardando: botón del diálogo con `enviando` y «Guardando…»; el resto de las acciones deshabilitadas mientras dura.
- Proyecto finalizado: información completa y nota, sin acciones.

## A confirmar

- Una sola página pública con las acciones del dueño en línea, en lugar de una pantalla de administración aparte. Evita duplicar la vista y deja una URL compartible.
- Confirmar antes de registrar un avance (el borrador no lo pedía): no se puede editar ni borrar un avance, así que un porcentaje mal tipeado trabaría el progreso.
- Textos de vacío: el borrador decía «Todavía no se cargaron avances» para el proyecto sin logros; se separa en «avances» y «logros» porque son dos listas distintas.
- El enlace a esta página sale del panel de avance del detalle; no se suma otro en la administración (04b). Se puede agregar después.
- La descripción del logro es texto plano (no Markdown), con saltos de línea. Las descripciones con Markdown son solo las de proyecto y colectivo.
- La fecha del logro es de solo lectura: el request de alta y de edición no la lleva.
- El formulario de avance viene precargado con las URLs actuales: las URLs solo se actualizan registrando un avance (no hay otro endpoint).

## A acordar con el back

1. Forma de `LogroDto` (`id`, `titulo`, `descripcion`, `fecha`) y de `AvanceDto` (`id`, `porcentajeConcrecion`, `urlSistema`, `urlRepositorio`, `fecha`). Los nombres de los requests salen de los tests de contrato (`porcentajeConcrecion`, `urlSistema`, `urlRepositorio`); el resto está sin verificar.
2. Fuente de verdad: el detalle lee `porcentajeConcrecion`, `logros` y `avances` dentro de `ProyectoDto`. Confirmar si realmente vienen ahí; esta spec usa los listados (`ListarLogros`, `ListarAvances`) y toma del proyecto solo título, estado, porcentaje y enlaces.
3. Orden de los listados (el front ordena por fecha, del más reciente al más viejo) y si `fecha` viene siempre.
4. Porcentaje: entero o decimal, si el primer avance puede ser 0, si 100 es válido y qué pasa al llegar a 100 (¿finaliza el proyecto?). Código de error cuando no supera al actual (400, 409 o 422).
5. Autorización: que el back valide que quien crea, edita o elimina logros y registra avances es el colectivo dueño (hoy los pedidos solo exigen sesión).
6. Títulos repetidos: código (¿409?) y si se compara sin distinguir mayúsculas y espacios.
7. Largos máximos de título y descripción de logro.
8. Código de las mutaciones sobre un proyecto finalizado (¿409 o 403?).
9. Los avances no tienen edición ni baja: confirmar que es intencional (el front no ofrece corregirlos).

## Fuera de alcance

- Publicación en LinkedIn y diagrama de Gantt.
- Editar o eliminar avances (no existen en el contrato).
- Paginación o filtros de logros y avances (los listados son simples).
- Notificaciones por nuevos logros o avances.
- La línea de tiempo del colectivo (spec 15), aunque use estos mismos eventos.

## Criterio de aceptación

- Visitantes y cualquier rol ven el avance; solo el colectivo dueño de un proyecto abierto ve y usa las acciones, y el front no hace ningún pedido de escritura sin pasar por el diálogo o el formulario.
- La barra tiene texto equivalente, los enlaces externos avisan que abren en otra pestaña y el error nunca expone detalles técnicos.
- Se prueban: datos, sin avances, sin logros (con y sin dueño), proyecto finalizado, error con reintento y 404; crear, editar y eliminar logro (con cancelación y 409 por título repetido); registrar avance con porcentaje inválido, con éxito y con rechazo del back; que una visitante y una colaboradora no vean acciones; que la recarga fallida tras guardar muestre el error sin perder el aviso; y el enlace desde el detalle con vuelta.
- Se verifican escritorio, 320 px y teclado (foco al `h1`, diálogos, foco tras crear y tras eliminar). Pasan lint, formato, tests y build.
