# Contextos simultáneos en una misma cuenta

Origen: spec del back `docs/contextos-simultaneos-de-cuenta.md` (decisiones del equipo del 14/11/2026). Reemplaza la exclusión entre modalidades que asumían las specs 01, 14 y 15.

## Intención

Una cuenta puede tener a la vez un perfil de colaboradora (como máximo uno activo) y varios contextos de colectivo (como líder o miembro), y cambiar entre ellos sin volver a ingresar. Cada pedido sigue operando en un solo contexto, el actual.

## Escenarios

Dada una colaboradora, cuando elige «Crear un colectivo» en «Mi cuenta» y completa el alta, entonces entra al panel del nuevo colectivo, es líder y conserva su perfil de colaboradora.
Dada una cuenta que solo tiene colectivos, cuando elige «Crear mi perfil de colaboradora» en «Mi cuenta», entonces llega a Proyectos con el perfil nuevo como contexto actual y conserva sus colectivos.
Dada una colaboradora, cuando pide ingresar a un colectivo desde su perfil público, entonces ve la solicitud en «Mis solicitudes» sin cambiar su contexto actual.
Dada una cuenta con varios contextos, cuando elige uno en «Cambiar a», entonces llega al inicio de ese contexto: Proyectos para la colaboradora y el panel para un colectivo.
Dada una cuenta que ya tiene perfil de colaboradora, cuando abre el alta de colaboradora, entonces va a su inicio sin crear otro perfil.
Dada una cuenta que lidera un colectivo, cuando abre el alta de colectivo, entonces puede crear otro.
Dada una cuenta que es líder o miembro de un colectivo, cuando mira un proyecto de ese colectivo, entonces «Postularme» está deshabilitado y explica el motivo (ver `POSTULACION_EN_COLECTIVO_PROPIO`).

## Requisitos

- «Mi cuenta» ofrece, solo con el registro terminado, «Crear un colectivo», «Crear mi perfil de colaboradora» (si la cuenta no tiene uno) y «Unirme a un colectivo».
- Bienvenida, cuando la cuenta ya tiene contextos, ofrece crear un colectivo, registrarse como colaboradora (si no tiene perfil) y sumarse a un colectivo; «Mis solicitudes» se ve siempre.
- `puedePedirIngreso` ya no depende del contexto de colaboradora.
- `MODALIDAD_INCOMPATIBLE` no existe; `POSTULACION_EN_COLECTIVO_PROPIO` (422) se informa con mensaje propio.
- Colaboraciones propias: en «Postulaciones recibidas», «Aceptar», «Rechazar» y «Desvincular», y en «Finalizar colaboración» y «Valorar», quedan deshabilitados con el motivo cuando la colaboración es pública y es del perfil de colaboradora de la cuenta; el 422 `COLABORACION_PROPIA` informa el mismo texto. Las postulaciones anónimas propias solo se frenan en el back.
- Las altas con la cuenta ya registrada vuelven con «Volver» al inicio del contexto actual.
- Cambiar de contexto navega con `flushSync` para que la guarda de rol no mande a «Sin permiso» durante el cambio.

## Estados

- Cargando, vacío y sin resultados: sin cambios respecto de las pantallas existentes.
- Con datos: menú de cuenta con la sección «Sumar».
- Error: el alta repite el manejo de `useAltaDePerfil` (recarga la cuenta ante respuesta perdida, 409 o 5xx).

## Fuera de alcance

- Excluir proyectos del colectivo propio en «Para vos», invitaciones y avisos (pregunta A de la spec del back).
- Postulaciones anteriores al ingreso a un colectivo (pregunta B).
- Elegir automáticamente otro contexto tras una baja.
- Pantalla propia «Mis perfiles».

## Criterio de aceptación

- Los tests de `registroObligatorio.test.jsx` (cuentas con los dos tipos de contexto), `Cabecera.test.jsx`, `sesionYContextos.test.jsx` y `proyecto.test.jsx` pasan.
- `npm run lint` y `npm test` en verde.
