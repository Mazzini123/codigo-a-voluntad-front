# Perfil de colaboradora (alta, edición y vista pública)

Origen: `specs/backlog/03-perfil-colaboradora.md`, `docs/plan-front.md` §3 y §4, `docs/PLAN-ENTIDADES.md` (Colaborador) y las specs 01 y 02.

## Intención

Que una persona colaboradora muestre lo que sabe hacer y controle cómo se la identifica y cómo se la contacta. Con esta spec, la opción "Soy colaboradora" de `/bienvenida` lleva a una pantalla real, y la 01 queda en condiciones de desplegarse.

## Escenarios

### Alta

Dado una cuenta sin perfil en `/bienvenida`,
cuando elige "Soy colaboradora", indica cómo quiere que la vean, elige al menos una habilidad del catálogo y toca "Crear perfil",
entonces ve "Creando…", después el aviso "Perfil creado." y llega a la edición de su perfil, con la cabecera del rol colaboradora.

Dado el selector de habilidades,
cuando la persona escribe "rea",
entonces la lista se filtra mientras escribe ("React", "Realidad aumentada"…), y las marca con Espacio, sin usar el mouse.

Dado el alta sin identificación o sin habilidades,
cuando toca "Crear perfil",
entonces cada problema aparece en su campo, el foco va al primero y no se envía nada.

### Edición

Dado una colaboradora en `/colaboradora/perfil`,
cuando cambia la presentación o los pronombres, o si acepta mensajes internos, y toca "Guardar cambios",
entonces se manda solo lo que cambió y ve "Cambios guardados.".

Dado la sección "Habilidades" de la edición,
cuando agrega o quita una habilidad,
entonces el cambio se guarda en el momento, con el aviso "Habilidad agregada." o "Habilidad quitada.", y el botón de esa habilidad queda en "Quitando…" mientras se envía.

Dado su única habilidad,
cuando intenta quitarla,
entonces el botón está deshabilitado con el motivo "Necesitás al menos una habilidad.".

### Vista pública

Dado cualquier persona,
cuando abre `/colaboradoras/:id`,
entonces ve el nombre con el que se identifica, sus pronombres, la presentación, la cuenta de Git, las habilidades y las redes, pero nunca los medios de contacto.

Dado un id que no existe,
cuando se abre la página,
entonces ve "No encontramos esta colaboradora" y un enlace para volver.

## Requisitos

### Datos (ya existen en Application e Infrastructure)

- **Alta:** `CrearColaborador` (`POST /colaboradores`) con todo junto: identificación, `presentacion`, `pronombres`, `codigosHabilidades`, `recibeMensajeriaInterna`, `mediosDeContacto` y `redesSociales`.
- **Edición:** `ActualizarColaborador` (`PUT`) solo con los campos que cambiaron entre `pronombres`, `presentacion`, `recibeMensajeriaInterna` y `redesSociales`.
  - La identidad (nombre de fantasía, nombre y apellido, cuenta de Git) no se edita: lo dice el back y se muestra como texto con "No se puede cambiar.".
  - Los pronombres van dentro del `PUT` y no por los endpoints de a uno: así se guardan junto con el resto del formulario.
- **Habilidades en la edición:** `AgregarHabilidadAColaborador` y `QuitarHabilidadDeColaborador`, de a una y en el momento. La respuesta (`ColaboradorDto`) reemplaza los datos en pantalla.
- **Catálogo:** `ListarHabilidades` con `limit: 100`, pidiendo todas las páginas, una vez por pantalla. Se ofrecen solo las `activo: true`, ordenadas por título.

### Componentes de formulario que se comparten

- **Mudanza a `Components/Formulario/`:** los editores de medios de contacto, redes sociales y etiquetas de la spec 02 se mudan ahí, junto con sus validaciones (`validarMedio`, `validarRed` y `validarTexto`) y `crearClave`. `ColectivoForm` pasa a usarlos desde ahí, sin cambiar su comportamiento.
- **El editor de etiquetas se generaliza en `ListaDeTextos`:** recibe `etiqueta`, `ayuda`, `maximo`, `largoMaximo` y `textoQuitar`. Lo usan las etiquetas del colectivo y los pronombres.
- **`Casilla`** (`Components/App/`): un checkbox con label, ayuda y 44px de alto.
- **`SelectorDeHabilidades`** (`Components/Formulario/`):
  - Un campo de búsqueda ("Buscar habilidad") y debajo una lista de casillas filtrada por título, sin distinguir mayúsculas ni tildes, con un alto máximo y scroll propio.
  - Arriba, las elegidas como chips con "Quitar".
  - Es un patrón de casillas y no un combobox ARIA: se usa con Tab y Espacio, sin dependencias nuevas (`plan-front.md` §5.5).
  - La cantidad de resultados se anuncia en una región `aria-live` ("12 habilidades").
  - Si nada coincide: "No hay habilidades que coincidan con «xyz».".
  - En la edición, marcar o desmarcar llama a agregar o quitar en el momento. En el alta, solo cambia el estado del formulario.

### Formulario (`Components/Colaboradora/ColaboradoraForm.jsx`)

Campos, en este orden:

1. **"¿Cómo querés que te vean? (obligatorio)":** grupo de opciones entre "Con un nombre de fantasía" y "Con mi nombre y apellido". Según la opción, aparece "Nombre de fantasía (obligatorio)" o "Nombre (obligatorio)" y "Apellido (obligatorio)". Solo se manda lo de la opción elegida.
2. **"Cuenta de GitHub o GitLab":** opcional, con la ayuda "Tu usuario o la dirección de tu perfil.".
3. **Pronombres:** `ListaDeTextos`, hasta 5, cada uno de 1 a 20 caracteres, con la ayuda "Por ejemplo: ella, elle.".
4. **Presentación:** opcional, `textarea`, con la ayuda "Contá en pocas líneas qué te gusta hacer.".
5. **Habilidades (obligatorio, al menos una):** `SelectorDeHabilidades`. En la edición es una sección aparte, fuera del formulario, porque se guarda en el momento.
6. **Mensajería interna:** la `Casilla` "Acepto que me contacten por mensajería interna cuando haya proyectos para mis habilidades.". Arranca desmarcada.
7. **Medios de contacto** (solo en el alta): el mismo editor y el mismo aviso de privacidad que en el colectivo.
8. **Redes sociales:** el mismo editor que en el colectivo.

**Validación, errores, foco y cambios sin guardar:** iguales que en la spec 02 (mismos componentes, `issues` mapeados por `path` y `useAvisoCambiosSinGuardar` en la edición).

### Pantallas y rutas

- **`/bienvenida/colaboradora`** (privada, `permitirSinPerfil`), `AltaColaboradoraPage`:
  - Título "Creá tu perfil de colaboradora" y el botón "Crear perfil".
  - Al crear: `asociarPerfil`, aviso "Perfil creado." y `recargarCuenta`, que lleva al inicio del rol.
- **`/colaboradora/perfil`** (privada, rol `COLABORADORA`), `PerfilColaboradoraPage`:
  - Título "Tu perfil" y el enlace "Ver perfil público".
  - El formulario con "Guardar cambios" y, debajo, la sección "Habilidades", que se guarda en el momento.
- **`/colaboradoras/:id`** (pública), `ColaboradoraPage`:
  - El `h1` es el nombre visible: nombre de fantasía; si no tiene, nombre y apellido; si no tiene, la cuenta de Git.
  - Después: pronombres en tinta suave, presentación, cuenta de Git, habilidades como chips y redes como enlaces externos.
  - 404: "No encontramos esta colaboradora".
- **Inicio de la colaboradora:** `/colaboradora/perfil`, hasta que exista `/proyectos` (spec 05).
- **Cabecera:** enlace "Mi perfil" (`roles: ["COLABORADORA"]`).
- **Plan:** se suman las rutas a la tabla de `plan-front.md`.
- **Nombre visible:** `Formatos/colaboradora.js` exporta `nombreVisible(colaboradora)`. Lo van a usar también las specs 08 y 09.

## Estados

- Cargando: skeleton del formulario o de la página. El catálogo de habilidades muestra un skeleton de la lista de casillas.
- Error del catálogo: `EstadoDeError` dentro del selector, "No pudimos cargar las habilidades", con "Reintentar". El resto del formulario se puede seguir completando.
- Catálogo vacío: "Todavía no hay habilidades cargadas.". El alta no se puede enviar y lo explica.
- Enviando: "Creando…", "Guardando…", y "Agregando…" o "Quitando…" en la habilidad que se está guardando.
- Error al enviar: errores por campo, o error general con lo cargado intacto. Si falla agregar o quitar una habilidad, el aviso de error dice cuál y la casilla vuelve a su estado anterior.

## A acordar con el back

- **Medios de contacto en la edición.** `ColaboradorDto` no los trae (es público), así que la dueña no puede ver ni quitar los que cargó. Propongo `GET /colaboradores/:id/medios-de-contacto`, solo para la dueña. Hasta entonces, los medios se cargan en el alta y su edición queda fuera de alcance.
- **Formato de `cuentaGit`:** ¿usuario (`ana-dev`) o URL? Define cómo se muestra y si se puede enlazar.
- **Largo máximo** de `presentacion`, `nombreFantasia`, `nombre`, `apellido` y de cada pronombre.
- **`POST /colaboradores`:** que asocie el perfil al `sub` del token y responda 409 si la cuenta ya tiene perfil (como en la 02).
- **Habilidades obligatorias:** si el back exige al menos una.

## A confirmar

- **Al menos una habilidad obligatoria.** El backlog lo dejaba "A definir". La propongo porque sin habilidades no hay encaje con los proyectos (`plan-front.md` §4).
- **Historial de colaboraciones fuera de esta spec.** El endpoint devuelve solo `proyectoId`, y mostrar los títulos obliga a pedir cada proyecto. Lo propongo para cuando exista el detalle de proyecto (spec 06) o "Mis postulaciones" (spec 10).
- **Los editores compartidos van a `Components/Formulario/`.** El colectivo los sigue usando igual.

## Fuera de alcance

- Editar los medios de contacto después del alta (ver "A acordar con el back").
- Historial de colaboraciones (ver "A confirmar").
- Años de experiencia por habilidad e importación desde LinkedIn.
- Dar de baja la cuenta.

## Criterio de aceptación

- Los escenarios funcionan con el back, y con sesión simulada en desarrollo.
- El selector de habilidades se usa solo con teclado: buscar, marcar con Espacio, quitar desde los chips.
- Los medios de contacto nunca aparecen en la vista pública. Lo verifica un test.
- Los tests de la spec 02 siguen pasando después de mudar los editores.
- A 320px no hay scroll horizontal.
- `npm run lint`, `npm run format:check`, `npm test` y `npm run build` en verde sobre el repo completo, y el checklist de `docs/criterios-pantallas-web.md` revisado.
