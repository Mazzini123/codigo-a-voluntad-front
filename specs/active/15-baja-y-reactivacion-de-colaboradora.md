# Baja y reactivación del perfil de colaboradora

Origen: rediseño de autenticación y contextos (10/11/2026). Registro de lo implementado; no pasó por aprobación previa.

## Intención

Que una colaboradora pueda dar de baja su perfil sin perder historial, entienda qué le falta resolver si tiene actividad en curso y pueda reactivarlo.

## Escenarios

Dada una colaboradora sin actividad en curso, cuando confirma «Dar de baja mi perfil», entonces vuelve a Bienvenida con un aviso.
Dada una colaboradora con postulaciones o colaboraciones en curso, cuando confirma, entonces el diálogo lista cada proyecto con su estado y no se da de baja.
Dada una persona con un perfil dado de baja, cuando intenta crear uno nuevo, entonces se le ofrece «Reactivar mi perfil» y, al hacerlo, entra como colaboradora.

## Requisitos

- La acción solo aparece con el permiso `COLABORADOR_BAJA`.
- El front nunca cancela postulaciones ni colaboraciones.

## Estados

- Cargando: botón con «Dando de baja…» / «Reactivando…».
- Con datos: no aplica.
- Vacío: no aplica.
- Sin resultados: no aplica.
- Error: mensaje en el diálogo o bajo el botón.

## Fuera de alcance

- Reactivar desde una opción fija en Bienvenida.

## Criterio de aceptación

- `Pages/colaboradora/bajaDeColaboradora.test.jsx` en verde, lint, suite completa y build en verde.
