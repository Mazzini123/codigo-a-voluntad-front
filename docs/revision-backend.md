# Adaptación a la revisión integral del backend

La rama `codex/revision-integral-backend` acompaña la rama del mismo nombre en el repositorio del backend. Deben actualizarse juntas porque los listados ahora usan resúmenes y páginas en lugar de historiales completos.

- El panel consulta `/colectivos/:id/proyectos` con `page` y `limit`, muestra el total global y permite cambiar de página. Usa `postulacionesPendientes` por proyecto y `meta.perfiles_abiertos` para los indicadores.
- Las postulaciones pendientes de todos los proyectos se obtienen de `/colectivos/:id/postulaciones`; no se deducen de la página de proyectos seleccionada.
- Las postulaciones de un proyecto se paginan y el filtro de estado se manda al servidor. Las decisiones de cupo usan `perfil.cantidadAceptadas`, que cuenta todo el historial.
- Los detalles públicos incorporan una primera página con `proyectosMeta` o `colaboracionesMeta`. “Ver más” consulta las páginas siguientes; cancela pedidos al cambiar de recurso y permite reintentar sin borrar los datos anteriores.
- La propiedad de un proyecto se comprueba con su `colectivo.id` y el perfil activo de la sesión. No depende de encontrarlo en los primeros proyectos del colectivo. La autorización efectiva continúa en el backend.
- Los transportes de demo y de pruebas se adaptan al contrato. Los hooks toleran arrays anteriores para los escenarios que todavía los utilizan.

Los cambios no activan HTML crudo en el renderizado Markdown. La sanitización del backend conserva código y autolinks y la presentación mantiene `react-markdown` con su configuración segura.

Las pruebas agregadas verifican navegación entre resúmenes sin historial, cancelación de pedidos, doble clic y reintento de páginas. Se conservan las pruebas de altas, administración, privacidad y postulaciones.
