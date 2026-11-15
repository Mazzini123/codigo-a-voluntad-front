# Proyectos destacados

Origen: adicional 18 de la consigna (proyectos destacados), `docs/administracion-de-plataforma.md` del back, `docs/PLAN-ENTIDADES.md` (`GET /proyectos/destacados`, `destacado: true`), `specs/active/05-buscar-proyectos.md` (que dejaba "Mapa y proyectos destacados" fuera de alcance), `DESIGN.md` (sello de estado, tarjeta de proyecto) y `docs/criterios-pantallas-web.md` (un solo elemento destacado por pantalla).

## Intención

Que quien explora vea primero un puñado de proyectos que la administración de la plataforma eligió, y que entienda por qué están ahí. La administración los marca desde el back (la pantalla para marcarlos es otra spec); acá solo se muestran.

## Escenarios

Dado cualquier persona sin sesión,
cuando entra a `/`,
entonces ve, después de la presentación, la sección "Proyectos destacados" con una tarjeta por proyecto vigente y el enlace "Ver todos los proyectos".

Dado que no hay proyectos destacados vigentes,
cuando se carga `/`,
entonces la sección no aparece y la portada queda como hoy; no se muestra un vacío ni un error por algo que es opcional.

Dado que falla la consulta de destacados,
cuando se carga `/`,
entonces la sección muestra "No pudimos cargar los proyectos destacados" con "Reintentar", y el resto de la portada sigue funcionando.

Dado cualquier persona,
cuando entra a `/proyectos`,
entonces los destacados vigentes aparecen primero (el orden lo da el back) y cada tarjeta lleva el sello "Destacado".

Dado un proyecto destacado en la página 1 de `/proyectos`,
cuando se filtra por etiqueta o se pasa de página,
entonces el sello aparece solo en las tarjetas cuyo resumen trae `destacado: true`; el front no deduce ni reordena.

Dado una persona que usa lector de pantalla,
cuando recorre una tarjeta destacada,
entonces el sello se lee como texto ("Destacado") dentro de la tarjeta, no como color ni ícono sueltos.

## Requisitos

- Contrato: `GET /proyectos/destacados` devuelve un arreglo simple de resúmenes (máximo 6); los resúmenes traen `destacado: true` solo si está vigente. Se agrega `ListarProyectosDestacados` a `docs/PLAN-ENTIDADES.md`; ninguna otra ruta.
- Capas: `ProyectoHttpClient.listarDestacados` → caso de uso `ListarProyectosDestacados` (usa un adaptador solo si la vista lo necesita) → `proyectoDependencies` → hook `useProyectosDestacados` (con `useConsulta`) → componente.
- `TarjetaProyecto` muestra `SelloDeDestacado` cuando `proyecto.destacado === true`. No se calcula vigencia en el front.
- La sección de portada reutiliza `TarjetaProyecto` en una grilla; no se crea una tarjeta nueva.
- Sin dependencias nuevas.

## Estados

- Portada: cargando (esqueleto de tarjetas, sin saltos de layout), con destacados, vacío (la sección no se muestra), error (con "Reintentar").
- Listado: sin estados nuevos; solo cambia la tarjeta.
- Un destacado cuyo proyecto no está abierto no llega del back; no hay estado para eso.

## Fuera de alcance

- Marcar o quitar destacados, ver revisiones y auditoría (pantallas de administración, spec aparte).
- Selector de contexto con el tipo `ADMINISTRACION` y guarda de ruta `/admin` (spec aparte).
- Carrusel, mapa, orden por el front o destacados distintos por persona.
- Mostrar hasta cuándo dura el destacado (el resumen no lo trae).

## Decisiones a tomar antes de implementar

1. **Dónde va la portada de destacados.** `InicioPage` redirige a quien tiene sesión, así que la sección solo la ve el visitante. Propuesta: sección entre la presentación y "Dos formas de empezar", y que las personas con sesión los vean arriba en `/proyectos` (ya lo da el back).
2. **Cómo se ve el sello.** Con hasta 6 destacados en la misma página, un sello llamativo rompe "un solo elemento destacado por pantalla". Propuesta: sello discreto con la misma forma que el de estado (4px, 1px de borde, 16px de ícono), color de información tenue y texto "Destacado", sin coral, que está reservado a la acción principal. Se agrega a `DESIGN.md` (Sello de estado) al implementarlo.
3. **Posición en la tarjeta.** Propuesta: arriba del título, en su propia línea, para no competir con el sello de estado que va al costado.
4. **Etiquetas y filtros.** El back ubica los destacados vigentes primero aunque haya filtro activo. Propuesta: aceptarlo tal cual; no se agrega encabezado "Destacados" dentro de `/proyectos`.

## Criterio de aceptación

- `npm run lint` y `npm test` en verde.
- Tests: hook (carga, vacío, error y reintento), `TarjetaProyecto` (con y sin `destacado`), `InicioPage` (con, sin y con error), `ProyectosPage` (sello presente solo donde `destacado: true`), y que ninguna capa ordene o calcule vigencia.
- Checklist de `docs/criterios-pantallas-web.md` revisado (contraste 4.5:1 del sello, foco, estados) y pasada de `impeccable` sobre la portada y la tarjeta.
