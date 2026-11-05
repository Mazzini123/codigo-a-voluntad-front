---
name: pantallas
description: Crea o modifica pantallas y componentes React del frontend de Código a Voluntad. Usar cuando se pida una pantalla, página, vista, formulario, listado, tarjeta o componente visual.
---
# Crear o modificar una pantalla

## Antes de escribir, preguntar
- ¿Qué rol la usa y qué viene a hacer? ¿Cuál es la acción principal?
- ¿Hay una especificación en `specs/active/`? Si no, proponer una con `specs/plantilla.md` antes de codificar.
- ¿Qué operaciones consume? Buscarlas en `docs/PLAN-ENTIDADES.md` y usar el caso de uso que ya existe en `src/Presentation/Dependencies/`. Si falta un endpoint en el back, decirlo; no inventarlo.

## No se negocia
- Página en `src/Presentation/Pages/`, componentes en `src/Presentation/Components/<Modulo>/`, lógica en un hook de `src/Presentation/Hooks/`.
- Estilos con CSS Modules: `X.module.css` al lado de cada componente o página, usando las variables de `src/Styles/tokens.css`. Nada de CSS global nuevo.
- El hook usa los casos de uso de `Dependencies` y `useAsync`; nunca axios ni HttpClients.
- Los requests se arman con la forma exacta de `Application/Domain/Requests`; las respuestas se usan sin transformar.
- Estados de carga (skeleton), vacío, sin resultados y error con "Reintentar".
- Filtros, búsqueda y página en la URL.
- `key` estable en listas, nunca el índice.
- Mensajes en lenguaje de la persona; nunca el error crudo del back.
- Acciones permanentes con el `ConfirmDialog` compartido.
- `<button>`, `<label htmlFor>`, foco visible, contraste 4.5:1, sin información solo por color.
- Reutilizar componentes de `src/Presentation/Components/App/` antes de crear nuevos.
- Sin comentarios explicativos en el código.

## Nunca cerrar sin
- `npm run lint` y `npm test` en verde.
- Haber recorrido el checklist de `docs/criterios-pantallas-web.md`.
- Respetar `DESIGN.md`.
- Un resumen de qué se hizo, qué quedó pendiente y qué decisiones se tomaron.
- Sugerir correr `/impeccable audit` y `/impeccable critique` sobre la pantalla.

## Hallazgos de Impeccable
- No se corrigen en la misma sesión: se convierten en una spec nueva en `specs/active/` con `specs/plantilla.md`, completando "Origen".
- Se incluyen todos los hallazgos, no solo los críticos; los que se descartan van a "Fuera de alcance" con el motivo.
- Si una sugerencia choca con el checklist de accesibilidad o con `DESIGN.md`, gana el checklist.
