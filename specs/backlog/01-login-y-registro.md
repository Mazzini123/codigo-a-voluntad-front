# Login y registro

## Intención

Que colectivos y personas colaboradoras puedan ingresar y completar su cuenta para usar las funciones privadas.

## Escenarios

Dado un visitante,
cuando toca "Ingresar",
entonces va a la pantalla del proveedor de identidad (Auth0 o Logto) y, al volver, queda con la sesión iniciada.

Dada una persona que ingresa por primera vez,
cuando vuelve del proveedor,
entonces elige "Soy un colectivo" o "Soy colaboradora" y completa su perfil antes de seguir.

Dada una cuenta con perfil,
cuando ingresa,
entonces vuelve a la pantalla desde la que venía (o a su inicio según el rol).

Dada una sesión vencida,
cuando hace una acción privada,
entonces se le pide ingresar de nuevo con el aviso "Tu sesión venció".

## Requisitos

- El SDK del proveedor solo se usa en `Infrastructure/Auth/` (ver `plan-front.md` §5.3).
- El rol y el perfil salen de `GET /auth/me` del back (pendiente en el back).
- El tipo de cuenta se elige una vez y no se cambia después.
- Cerrar sesión desde el menú de cuenta, con confirmación.
- Proveedor: A definir (Auth0 o Logto).

## Estados

- Volviendo del proveedor: "Iniciando sesión…".
- Verificando sesión al recargar: "Verificando sesión…".
- Error del sistema: mensaje genérico y reintentar.

## Fuera de alcance

- Pantallas propias de contraseña, recuperación y verificación de email (las resuelve el proveedor).

## Criterio de aceptación

- Los cuatro escenarios funcionan, se usa solo con teclado y las rutas privadas no son accesibles sin sesión.
