# Decisiones

| Fecha      | Decisión | Por qué |
| ---------- | -------- | ------- |
|            | Vite + React | CRA está discontinuado; Next.js agrega renderizado en el servidor que el cliente pesado no necesita. Confirmado con el docente: (pendiente) |
|            | Front en un repo propio | Decisión del equipo. Se mantiene el despliegue en un único servidor. |
|            | Capas Presentation → UseCases → HttpClients → Axios (ver `PLAN-ENTIDADES.md`) | Application no depende de React ni de Axios; Presentation solo conoce Infrastructure a través de `Dependencies`. |
|            | Sin clases de dominio en el front: DTOs y requests documentados con JSDoc | La lógica de negocio vive en el back; el front usa las respuestas tal como llegan. |
|            | Casos de uso como funciones con el HttpClient inyectado | Permiten probar con un cliente falso y coordinar varias operaciones si hace falta, sin inventar lógica. |
|            | JSDoc solo en los contratos; sin comentarios explicativos en el resto | Los contratos documentan tipos para el editor; en el resto, nombres claros y funciones chicas. |
| 01/11/2026 | 401 cierra la sesión; 403 muestra "sin permiso"; 429 sin reintento automático | 401 = no sabe quién sos, 403 = sin permiso (§22.4.3). Reintentar ante un límite de tasa gasta más pedidos. |
| 01/11/2026 | Reintento automático solo en GET | Solo es seguro en operaciones idempotentes (§22.3.3). Altas y postulaciones se reintentan a pedido. |
| 01/11/2026 | Errores normalizados en `Infrastructure/Http` (`ApiError`) | La presentación no conoce la forma de los errores de axios; un cambio del back se arregla en un lugar. |
| 01/11/2026 | Token en memoria, no en `localStorage` | `localStorage` queda expuesto a XSS (§22.4.3). Con un proveedor de identidad lo maneja su SDK. |
| 01/11/2026 | Context API para sesión y notificaciones, sin Zustand ni Redux | En una aplicación mediana el contexto alcanza (§21.4.12). Sin dependencias nuevas. |
| 01/11/2026 | `ProtectedRoute` con `cargando`, `replace` y `state.desde`; rol incorrecto → `SinPermisoPage` | Evita expulsar al recargar y quedar atrapado con "atrás" (§22.4.4). Es comodidad, no seguridad. |
| 01/11/2026 | `lazy()` en pantallas privadas, no en `/proyectos` | Carga bajo demanda sin demorar la página de entrada (§21.5.5). |
|            | Proveedor de identidad externo detrás de un adaptador en `Infrastructure/Auth` | Bajo acoplamiento: cambiar de proveedor es cambiar un archivo. Suma el requerimiento adicional 4. Proveedor: Auth0 o Logto (pendiente). |
|            | El rol y el perfil salen del back (`GET /auth/me`), no del proveedor | El proveedor identifica a la persona; qué es en la plataforma es del dominio. |
|            | Convención de estilos (pendiente) | Hoy: CSS global por módulo en `Styles/`. Alternativa: CSS Modules junto a cada componente, sin choque de nombres de clases (§21.4.3). Decidir antes de la primera pantalla. |
|            | Impeccable para auditar y criticar el diseño; `DESIGN.md` como sistema visual | Evita los patrones típicos de diseño hecho por IA y detecta problemas de accesibilidad y formato. Es una herramienta de desarrollo, no una dependencia de la app. |
| 05/11/2026 | `DESIGN.md` como semilla previa a la implementación: paleta coral / verde petróleo / crema con contrastes verificados, Bricolage Grotesque para títulos y Source Sans 3 para texto | Resuelve la propuesta de `plan-front.md` §6. Bricolage y Source Sans 3 evitan las combinaciones genéricas (Space Grotesk, Inter). Se vuelve a generar con `/impeccable document` cuando haya código. |
| 05/11/2026 | Sin JetBrains Mono | Una monoespaciada en chips le habla a quien programa y aleja a los colectivos no técnicos; las cifras tabulares de Source Sans 3 cubren los números. |
| 05/11/2026 | Tipografías servidas desde `public/fonts/` (`woff2` + `@font-face`) | Sin depender de un CDN externo ni sumar paquetes de npm. Pendiente: descargar los archivos al implementar la base. |
| 05/11/2026 | Botón peligroso con contorno en la página; relleno rojo solo dentro del diálogo de confirmación | El coral del botón primario y el rojo de peligro son cercanos: así "Rechazar" nunca se confunde con "Postularme". |
|            | Los hallazgos de Impeccable se convierten en specs y se implementan en otra sesión | Pedirle a la IA que "corrija todo" en la misma sesión tiende a resolver solo lo crítico. Como spec, cada corrección queda documentada y se cierra con el mismo checklist. Si una sugerencia choca con el checklist de accesibilidad, gana el checklist. |
