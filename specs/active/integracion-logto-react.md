# Integración con Logto React y accesos directos

Origen: revisión del ZIP `codigo-a-voluntad-front-feature-Logto.zip`, pedido de dos accesos en el header y aprobación explícita de migrar a `@logto/react` el 06/11/2026. Complementa la spec 01 y reemplaza su elección anterior de SDK.

## Intención

Usar el mismo SDK de React que la integración de Facundo, conservando la consulta de cuenta al backend, permisos y pantallas existentes. El visitante abre directamente ingreso o registro desde el header.

## Escenarios

- Sin sesión, «Ingresar» abre Logto con `firstScreen: "signIn"`; «Crear una cuenta», con `firstScreen: "register"`. Ambos conservan ruta, filtros y fragmento de origen.
- Al volver a `/callback`, el SDK completa la autenticación y recién entonces se consulta `/auth/me`. La cuenta del backend determina el rol y el perfil; una cuenta nueva llega a Bienvenida.
- Al recargar una ruta privada, se espera la inicialización del SDK y la consulta de cuenta antes de resolver los permisos.
- Una falla al abrir el ingreso muestra un aviso genérico y habilita el reintento. Un callback inválido ofrece volver a ingresar.
- Con sesión, se mantiene Mi cuenta y el cierre con confirmación.

## Requisitos

- Un solo `LogtoProvider`; `useLogto` y `useHandleSignInCallback` quedan en `Infrastructure/Auth`, accesibles a Presentation a través de Dependencies.
- `AuthProvider` sigue resolviendo la cuenta de dominio y la expiración por 401; autenticación de Logto no implica perfil ni rol de la plataforma.
- Se mantiene `/callback`, el retorno de salida a `/` y `VITE_LOGTO_RECURSO` como nombre de configuración del recurso. No se integra el router ni el cliente HTTP antiguo del ZIP.
- El header conserva petróleo y crema de marca; ambos accesos a la derecha en escritorio y en una segunda fila en celular. Objetivos de al menos 44px y sin desborde a 320px.
- `/login` y `/registro` conservan la cabecera con ambos accesos como enlaces y presentan las acciones de autenticación en el contenido.
- Configuración incompleta: el header lleva a `/login` o `/registro`. Allí se muestran los campos deshabilitados, el estado del acceso y el enlace a proyectos. No se monta un SDK con valores parciales ni se reciben credenciales. Con tenant o simulación, se mantiene el flujo directo.
- Se conserva la sesión simulada solo en desarrollo y la inyección de dobles para tests.

## Estados

- Cargando sesión: Verificando sesión.
- Abriendo acceso: Abriendo…, ambos botones deshabilitados y sin solicitudes duplicadas.
- Callback: Iniciando sesión, o error con Volver a ingresar.
- Cuenta no disponible: error global de sesión con Reintentar.

## Fuera de alcance

Credenciales del tenant, cambios en el backend, asignación de roles o scopes en Logto, formularios propios de contraseña y acuerdos de datos pendientes de otras specs.

## Criterio de aceptación

- Tests del SDK de React con cliente simulado: recurso y token, inicialización, callback antes de `/auth/me`, retorno, errores y salida.
- Tests de los accesos: pantalla correcta, conservación de contexto, espera sin duplicados y reintento.
- Tests existentes de rutas protegidas, sesión simulada, 401 y menú de cuenta en verde.
- Navegador en escritorio y a 320px, teclado y error de ingreso sin tenant.
- `npm run lint`, `npm run format:check`, `npm test` y `npm run build` sobre el repo completo.
- Actualizar documentación de integración, decisiones, traspaso y diseño tras verificar.

## A acordar con Facundo y el back

- Configurar el tenant y registrar `/callback` y `/` para cada origen usado; no `/logto/callback`.
- Mapear `VITE_LOGTO_API_RESOURCE` del ZIP a `VITE_LOGTO_RECURSO`, con el mismo identificador que valida el backend como audiencia.
- Validación del JWT (emisor, audiencia y JWKS), asociación por `sub`, `/auth/me` → `{ id, rol, perfilId }` y 401 si el token no es válido.
- `rol` y `perfilId` nulos para cuentas sin perfil; altas de perfil asociadas al `sub` y conflicto 409 si ya existe uno.
- Acordar scopes y roles en Logto solo si el backend los requiere. El frontend continúa usando el rol de la cuenta que responde el backend.
- Probar ingreso, registro, recarga, cierre y expiración con tenant y backend reales.

## Implementación y verificación

- Migración a `@logto/react` 4.1.3 y eliminación de la dependencia directa de `@logto/browser` — hecho.
- Provider único, inicialización, callback, cuenta del backend, token del recurso, error y expiración — hecho.
- Accesos directos en header, conservación de contexto, espera sin duplicados, reintento y segunda fila móvil — hecho.
- Pruebas del SDK real de React con cliente simulado, de accesos y de regresión: 475 tests en 36 archivos con un worker — hecho.
- Lint, formato y build de producción sobre el repo completo — hecho.
- Navegador Chromium a 1280 y 320px: controles de 44px, sin desborde, foco visible, error sin tenant y aviso debajo del header — hecho.
- Recorrido con sesión simulada SIN_PERFIL: Crear una cuenta → callback → Bienvenida → confirmación de cierre → portada — hecho. No escribe perfiles ni datos del backend.
- README, spec 01, plan, decisiones y traspaso actualizados; playbook `/impeccable document` aplicado a DESIGN y su sidecar tras la revisión visual — hecho.
- Configuración y recorrido con tenant y backend reales: pendiente; no se sustituyen por la simulación ni por los tests.
- Ajuste posterior: sin configuración, ambos accesos muestran su pantalla local sin emitir el aviso de fallo ni aceptar credenciales — hecho. Verificado en navegador a 1280 y 320px; lint, formato, 476 tests y build en verde.
