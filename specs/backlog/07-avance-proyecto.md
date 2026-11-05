# Avance del proyecto (logros)

## Intención

Dar trazabilidad pública de cómo avanza cada proyecto.

## Escenarios

Dado un proyecto con logros,
cuando alguien entra a su avance,
entonces ve el porcentaje de concreción, los logros ordenados del más reciente al más viejo y los enlaces al repositorio y al sistema en producción.

Dado el colectivo dueño,
cuando carga, edita o elimina un logro o registra un avance,
entonces el cambio se ve inmediatamente con un mensaje de confirmación.

Dado un proyecto sin logros,
cuando se entra a su avance,
entonces ve "Todavía no se cargaron avances" (y, para el dueño, "Cargar el primer logro").

## Requisitos

- Porcentaje entre 0 y 100, mostrado con barra y texto. Cada avance nuevo tiene que superar al anterior (lo valida el back).
- Un avance lleva porcentaje y los enlaces al sistema y al repositorio.
- Logro: título, descripción y fecha.
- Enlaces externos abren en pestaña nueva y lo avisan.
- Eliminar un logro pide confirmación.

## Estados

- Cargando, vacío, error, guardando.

## Fuera de alcance

- Publicación en LinkedIn, diagrama de Gantt.

## Criterio de aceptación

- Visitantes ven el avance; solo el dueño lo edita; la barra tiene texto equivalente para lectores de pantalla.
