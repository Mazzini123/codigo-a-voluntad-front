# Baja del perfil de colaboradora

## Intención

Una colaboradora puede dar de baja su perfil y conservar su historial. Si vuelve con la misma cuenta, completa el alta de un perfil nuevo.

## Escenarios

- Si tiene postulaciones pendientes o colaboraciones en curso, el diálogo muestra qué resolver primero.
- Si confirma una baja sin actividad en curso, vuelve a Bienvenida con un aviso y conserva su cuenta.
- Si luego elige «Soy colaboradora» y completa el formulario, el backend crea un perfil y un contexto nuevos. El contexto nuevo pasa a ser el actual. El perfil anterior, su contexto inactivo y sus colaboraciones conservan sus identificadores.

## Requisitos

- La acción requiere el permiso `COLABORADOR_BAJA`.
- El diálogo informa que la baja conserva el historial y que una futura alta crea un perfil nuevo.
- El formulario de alta usa `POST /colaboradores` y presenta sus errores en el propio formulario.
- La baja solo se confirma después de que la persona haya resuelto la actividad pendiente.

## Criterio de aceptación

- La prueba `bajaDeColaboradora.test.jsx` verifica la baja bloqueada, la baja exitosa y el alta posterior de un perfil distinto.
- Las pruebas de integración del backend verifican la conservación del contexto y las colaboraciones anteriores.
