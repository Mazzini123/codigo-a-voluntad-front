import {
  ESTADOS_DE_REVISION,
  MOTIVOS_DE_REVISION,
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

describe("revisiones de publicación", () => {
  test("el motivo de publicación se explica y el filtro ofrece los dos motivos", () => {
    expect(textoDeMotivo("PUBLICACION")).toBe("Pidió publicar el proyecto");
    expect(MOTIVOS_DE_REVISION.map(({ valor, texto }) => [valor, texto])).toEqual([
      ["", "Todos"],
      ["PUBLICACION", "Pidió publicar el proyecto"],
      ["SIN_ACTUALIZACIONES", "Sin actualizaciones hace más de 30 días"],
    ]);
  });

  test("las resueltas de publicación dicen Aprobada y Con cambios pedidos", () => {
    expect(textoDeEstadoDeRevision("PENDIENTE", "PUBLICACION")).toBe("Pendiente");
    expect(textoDeEstadoDeRevision("REVISADA", "PUBLICACION")).toBe("Aprobada");
    expect(textoDeEstadoDeRevision("DESCARTADA", "PUBLICACION")).toBe(
      "Con cambios pedidos",
    );
    expect(textoDeEstadoDeRevision("REVISADA", "SIN_ACTUALIZACIONES")).toBe("Revisada");
  });

  test("los fallos de resolver una publicación tienen textos propios", () => {
    expect(mensajeDeRevision({ status: 409 }, "PUBLICACION")).toBe(
      "Esta publicación ya fue resuelta.",
    );
    expect(mensajeDeRevision({ status: 422 }, "PUBLICACION")).toBe(
      "La fecha de cierre del proyecto ya pasó. Pedí cambios con una nota para que el colectivo la corrija.",
    );
    expect(
      mensajeDeRevision({ status: 422, codigo: "CONFLICTO_DE_INTERESES" }, "PUBLICACION"),
    ).toBe("No podés resolver la publicación de un proyecto de tu propio colectivo.");
    expect(mensajeDeRevision({ status: 403 }, "PUBLICACION")).toBe(
      "No tenés permiso para hacer esto.",
    );
  });

  test("el conflicto de intereses también se explica en las otras revisiones", () => {
    expect(
      mensajeDeRevision(
        { status: 422, codigo: "CONFLICTO_DE_INTERESES" },
        "SIN_ACTUALIZACIONES",
      ),
    ).toBe("No podés resolver una revisión de un proyecto de tu propio colectivo.");
  });
});
