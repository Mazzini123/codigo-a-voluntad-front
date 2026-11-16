import {
  ESTADOS_DE_REVISION,
  mensajeDeRevision,
  textoDeEstadoDeRevision,
  textoDeMotivo,
} from "./revision.js";

test("el motivo se explica en lenguaje claro y un motivo desconocido no muestra el código", () => {
  expect(textoDeMotivo("SIN_ACTUALIZACIONES")).toBe(
    "Sin actualizaciones hace más de 30 días",
  );
  expect(textoDeMotivo("OTRO_MOTIVO")).toBe("Requiere revisión");
});

test("cada estado tiene su texto y los filtros empiezan por pendientes", () => {
  expect(textoDeEstadoDeRevision("PENDIENTE")).toBe("Pendiente");
  expect(textoDeEstadoDeRevision("REVISADA")).toBe("Revisada");
  expect(textoDeEstadoDeRevision("DESCARTADA")).toBe("Descartada");
  expect(ESTADOS_DE_REVISION.map(({ texto }) => texto)).toEqual([
    "Pendientes",
    "Revisadas",
    "Descartadas",
  ]);
});

test("los fallos de resolver se explican sin mostrar el error del back", () => {
  expect(mensajeDeRevision({ status: 409 })).toBe("Esta revisión ya fue resuelta.");
  expect(mensajeDeRevision({ status: 404 })).toBe(
    "No encontramos esa revisión. Actualizamos la lista.",
  );
  expect(mensajeDeRevision({ status: 403 })).toBe("No tenés permiso para hacer esto.");
  expect(mensajeDeRevision({ status: 500 })).toBe(
    "No pudimos guardar la revisión. Probá de nuevo.",
  );
});
