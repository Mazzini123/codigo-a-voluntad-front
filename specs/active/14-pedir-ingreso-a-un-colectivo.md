# Pedir el ingreso a un colectivo

Origen: rediseño de autenticación y contextos (10/11/2026). Registro de lo implementado; no pasó por aprobación previa.

## Intención

Que una persona con sesión y sin perfil de colaboradora pueda pedir sumarse a un colectivo existente y seguir o cancelar sus pedidos.

## Escenarios

Dada una persona con sesión en el perfil público de un colectivo del que no es parte, cuando elige «Pedir sumarme», entonces ve que la solicitud se envió y un enlace a «Mis solicitudes».
Dada una solicitud pendiente, cuando la persona vuelve a pedir, entonces ve «Ya tenés una solicitud pendiente para este colectivo».
Dada una persona en «Mis solicitudes», cuando cancela una pendiente y confirma, entonces deja de poder cancelarla y ve un aviso.

## Requisitos

- El botón no aparece sin sesión, con perfil de colaboradora, si ya es parte del colectivo o si el colectivo está dado de baja.
- «Mis solicitudes» ordena primero las pendientes y muestra nombre del colectivo, estado y fecha.
- Accesos: menú de cuenta y Bienvenida (opción «Quiero sumarme a un colectivo» y enlace a «Mis solicitudes»).

## Estados

- Cargando: skeleton.
- Con datos: lista de tarjetas.
- Vacío: «Todavía no pediste sumarte a ningún colectivo» con «Explorar proyectos».
- Sin resultados: no aplica (sin filtros).
- Error: `EstadoDeError` con «Reintentar».

## Fuera de alcance

- Listado público de colectivos.

## Criterio de aceptación

- `Pages/ingreso/solicitudesDeIngreso.test.jsx` en verde, lint y suite completa en verde.
