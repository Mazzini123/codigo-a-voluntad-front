# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Colectivos:** organizaciones sociales sin formación técnica (comedores, cooperativas, ONG, asambleas barriales) que necesitan software y no hablan la jerga. Publican proyectos, definen los perfiles que buscan, revisan postulaciones y contactan colaboradoras. La interfaz les explica los términos técnicos; no los da por sabidos.
- **Colaboradoras:** personas del ámbito del desarrollo de software que donan su tiempo. Arman su perfil con habilidades del catálogo, buscan proyectos que encajen, se postulan a perfiles y siguen sus postulaciones y colaboraciones.
- **Visitantes:** sin sesión, buscan y ven proyectos, colectivos y avances.
- **Administración** (si se implementa): habilidades precargadas y moderación.

## Product Purpose

Código a Voluntad conecta colectivos sociales con colaboradoras de software que trabajan de forma voluntaria. El éxito es que un colectivo sin conocimientos técnicos consiga publicar un proyecto claro y cubrir sus perfiles, y que una colaboradora encuentre rápido dónde sus habilidades sirven y se postule sin fricción.

Es la tercera entrega del TP Integrador de Desarrollo de Software (DDSO, UTN FRBA, 2C 2026). Se diseña primero como producto real para colectivos y colaboradoras; los requisitos de la consigna (patrones de e-commerce, justificación de los requerimientos no funcionales, test de integración, despliegue con Docker y NGINX) son restricciones duras por encima de eso.

## Positioning

Voluntariado de software orientado a organizaciones sociales, con la privacidad de la colaboradora como regla visible: los datos de contacto se comparten solo cuando el colectivo acepta la postulación, las contribuciones pueden ser anónimas y la colaboradora decide si acepta recibir mensajes. El compromiso se expresa en horas, y la modalidad de cada perfil puede ser gratuita, con incentivo económico o con posibilidad de contratación.

## Operating Context

- Flujo central tipo e-commerce: buscador arriba, proyectos como tarjetas, filtros al costado, detalle con "Postularme" por perfil bien visible.
- Cada proyecto tiene perfiles con habilidades requeridas y opcionales, compromiso, modalidad, límite de colaboraciones, modo de aceptación y búsqueda abierta o cerrada con fecha límite.
- Postulaciones con estados (pendiente, aceptada, rechazada, finalizada, desvinculada); los colectivos aceptan, rechazan o desvinculan.
- Avance del proyecto público: porcentaje, logros, repositorio y sistema en producción.
- Mensajes internos entre ambos roles.
- Ingreso con un proveedor de identidad externo; al primer ingreso se elige el tipo de cuenta y se completa el perfil.

## Capabilities and Constraints

- Cliente pesado en React + Vite que consume la API JSON del back (otro repo). Las reglas (límites, estados, permisos, modos de aceptación) las decide el back; el front muestra el estado y vuelve a consultar lo afectado tras cada acción.
- Contrato con el back: `docs/PLAN-ENTIDADES.md` y el Swagger del back. Pantallas, rutas y base transversal: `docs/plan-front.md`. Specs por pantalla en `specs/`.
- Sin librería de componentes; sin dependencias nuevas sin consultarlo.
- Las opciones de filtros salen de los catálogos del back (habilidades, tipos de colectivo, provincias).
- La identidad usa Logto. El frontend llama a `POST /auth/registro` antes de `GET /auth/me`.
- Pendientes: rutas con `:id` o `?id=` según el docente y convención de archivos de estilos.

## Brand Commitments

- **Nombre:** Código a Voluntad. No hay logo ni assets de marca; no inventar uno como si fuera oficial.
- **Voz:** español rioplatense con voseo (tenés, buscá, postulate). Lenguaje de la persona, nunca el error crudo del back.
- **Femenino genérico:** "colaboradora" como genérico inclusivo para toda persona que colabora.
- **Paleta (vinculante):** acento naranja o coral vivo (≈10 %), verde petróleo oscuro como complementario (≈30 %) y crema claro de fondo (≈60 %). El coral vivo no llega a 4.5:1 sobre crema: para texto y botones va una variante oscurecida y el coral vivo queda como decoración.
- **Tipografías:** Bricolage Grotesque para títulos y Source Sans 3 para texto (detalle en `DESIGN.md`).

## Evidence on Hand

No hay proyectos, colectivos, testimonios, métricas ni capturas reales. Toda pantalla usa datos del back o estados vacíos honestos; no fabricar casos, cifras ni testimonios.

## Product Principles

1. **Claro para quien no es técnico.** Si un colectivo no entiende un término, la interfaz lo explica o lo reemplaza: "5 h por mes · Gratuita", no códigos.
2. **La privacidad se ve.** Siempre se dice por qué un dato no está ("Se comparten cuando aceptes su postulación", "Contribución anónima").
3. **El estado siempre explicado.** Un botón deshabilitado dice el motivo; cada búsqueda de perfil muestra su estado con texto ("Abierta hasta el 30/11", "Límite alcanzado", "Cerrada").
4. **El back decide, el front muestra.** Sin reglas de negocio duplicadas; tras cada acción se vuelve a consultar.
5. **Lo permanente se confirma.** Desanotar, darse de baja y rechazar van con confirmación y aviso de que no se deshace.

## Accessibility & Inclusion

WCAG 2.2 AA: HTML semántico, labels reales, foco visible, navegación con teclado, contraste mínimo 4.5:1, zonas de toque de 44 px, información que no depende solo del color (habilidades requeridas y opcionales distinguidas con texto). Lenguaje inclusivo con el femenino genérico. Verificación con `eslint-plugin-jsx-a11y`, Lighthouse y axe.
