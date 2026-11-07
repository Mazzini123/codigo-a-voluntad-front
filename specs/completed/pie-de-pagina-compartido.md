# Pie de página compartido — hecho

Origen: la persona aprobó agregar el footer propuesto y pidió que fuera igual en todas las páginas del sitio el 06/11/2026.

## Intención

Dar un cierre visual consistente y un lugar para información secundaria, sin agregar acciones principales ni consultas al back.

## Escenarios

- En cualquier ruta, pública o privada, aparece el mismo pie, una sola vez.
- En una página corta, queda al borde inferior del viewport; en una larga, después del contenido. No tapa controles ni se fija a la pantalla.
- «Cómo funciona» abre `/#como-empezar` y enfoca «Dos formas de empezar», incluso con una cuenta de colectivo, colaboradora o sin perfil.
- El acceso habitual a `/` con sesión conserva la redirección al inicio del rol. La excepción corresponde únicamente a la explicación enlazada por el pie.
- Una falla de verificación de sesión conserva el pie visible, porque este no depende del proveedor de sesión.

## Requisitos — hecho

- Un único `PieDePagina` en `Raiz`, fuera de `AuthProvider`, compartido por todas las rutas: landing, listado, detalle, ingreso, registro, páginas privadas y 404.
- Nombre «Código a Voluntad», descripción «Colectivos sociales y colaboradoras de software», enlace «Cómo funciona» y referencia «Proyecto académico de Desarrollo de Software · UTN FRBA», respaldada por `PRODUCT.md`.
- Contenido y aspecto idénticos para todos los roles. Sin dependencias nuevas, pedidos al back, contactos inventados o enlaces a páginas inexistentes.
- Misma identidad que el header: fondo petróleo, texto crema de marca y nombre con Bricolage en peso 700. Enlaces claros, sin subrayado en reposo, con subrayado al pasar el puntero y anillo de foco crema. En escritorio se distribuye en columnas y a 320px se apila. Enlace de al menos 44px de alto y foco visible.
- La navegación a fragmentos enfoca su destino dentro del contenido principal. Cambiar solo filtros o página en la URL sigue sin mover el foco.

## Estados

- El contenido del pie es estático y no necesita carga, vacío ni error propios.
- Permanece visible mientras carga una página y ante el error global de sesión. La recuperación de ese error sigue a cargo del estado de sesión existente.

## Fuera de alcance

- Nuevas páginas legales, contacto, redes sociales, formularios y cambios en los contratos del back.
- Cambiar el inicio operativo de los roles o el flujo de registro.
- Despliegue, commits y comandos de git.

## Criterio de aceptación y verificación — hecho

- `npm run lint`, `npm run format:check`, `npm test` y `npm run build` sobre el repo completo en verde. Suite: 458 tests en 35 archivos, con un worker y sin ampliar timeouts.
- Once casos añadidos a las pruebas de rutas reales: un único pie con el mismo contenido en landing, login, registro, detalle y 404; enlace funcional con los cuatro estados de cuenta; foco al enlazar dentro de la landing; persistencia ante error de sesión. Las pruebas de foco existentes siguen pasando.
- Navegador integrado a 1280×900 y 320×900: login, landing y 404; contenido completo, pie al borde inferior en login y después del contenido en la landing, sin desborde horizontal. «Cómo funciona» se activa con Enter desde login y deja el foco en la sección correcta.
- En móvil, el enlace mide 44px de alto y el pie aparece una sola vez. La consola solo registra la advertencia de desarrollo por Logto sin configurar; no aparecieron errores de React durante el recorrido.
- Actualizados `DESIGN.md`, su sidecar, decisiones y traspaso. No se modificaron tokens globales ni se enviaron datos al back.
- Roles y error de sesión verificados con tests; no se ejecutó Lighthouse ni se probó un dispositivo físico.

## Ajuste visual solicitado el 06/11/2026 — hecho

La persona pidió que el footer fuera consistente con el header. Se igualaron fondo `petroleo`, texto `crema-marca`, tipografía y peso de la marca, estados de enlace y anillo de foco claro. Se retiró el separador propio de la versión clara. Se verificaron en navegador los colores computados iguales en header y footer (`rgb(15, 76, 79)` y `rgb(251, 246, 238)`), el foco de teclado y la vista a 320px sin desborde, manteniendo el enlace de 44px de alto.

## Compactación solicitada el 06/11/2026 — hecho

A partir de la referencia horizontal aportada por la persona, el espacio vertical baja a 16px y los tres bloques comparten una fila en escritorio, conservando todos los textos. La descripción usa body small y el espacio entre marca y descripción baja a 4px. Altura medida a 1280×900: 85,25px, frente a unos 173px anteriores. A 320×900, se apila con 8px entre bloques, sin desborde, con 215px de alto y el enlace de 44px. La paleta sigue coincidiendo con el header.

La propuesta de agregar ambos accesos de cuenta al header queda pendiente de revisar primero la integración de Logto de la rama del compañero, según indicó la persona. No se modifica el flujo de ingreso en este ajuste.
