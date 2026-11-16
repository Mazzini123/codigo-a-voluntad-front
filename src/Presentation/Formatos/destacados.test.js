import { mensajeDeDestacado, textoDeCupo, textoDeVigencia } from "./destacados.js";

test("el cupo se explica con singular y plural", () => {
  expect(textoDeCupo(0)).toBe("Ningún lugar usado de 6");
  expect(textoDeCupo(1)).toBe("1 lugar usado de 6");
  expect(textoDeCupo(3)).toBe("3 lugares usados de 6");
});

test("cada fallo de destacar tiene un mensaje en lenguaje de la persona", () => {
  expect(mensajeDeDestacado({ status: 409 }, "destacar")).toBe(
    "Ya hay 6 proyectos destacados. Quitá uno para sumar otro.",
  );
  expect(
    mensajeDeDestacado({ status: 422, codigo: "CONFLICTO_DE_INTERESES" }, "destacar"),
  ).toBe("No podés destacar un proyecto de un colectivo del que sos parte.");
  expect(mensajeDeDestacado({ status: 422 }, "destacar")).toBe(
    "Solo se pueden destacar proyectos abiertos de colectivos activos.",
  );
  expect(mensajeDeDestacado({ status: 404 }, "destacar")).toBe(
    "No encontramos ese proyecto. Actualizamos la lista.",
  );
  expect(mensajeDeDestacado({ status: 500 }, "destacar")).toBe(
    "No pudimos destacar el proyecto. Probá de nuevo.",
  );
});

test("sin permiso se informa igual al destacar y al quitar", () => {
  expect(mensajeDeDestacado({ status: 403 }, "destacar")).toBe(
    "No tenés permiso para hacer esto.",
  );
  expect(mensajeDeDestacado({ status: 403 }, "quitar")).toBe(
    "No tenés permiso para hacer esto.",
  );
});

test("quitar un destacado que ya no lo es se informa sin alarma", () => {
  expect(mensajeDeDestacado({ status: 404 }, "quitar")).toBe(
    "Ese proyecto ya no estaba destacado. Actualizamos la lista.",
  );
  expect(mensajeDeDestacado({ status: 500 }, "quitar")).toBe(
    "No pudimos quitar el destacado. Probá de nuevo.",
  );
});

test("la vigencia de un destacado se lee como fecha de fin, si el back la manda", () => {
  expect(textoDeVigencia({ hasta: "2026-12-16T02:59:59.999Z" })).toBe(
    "Hasta el 15 de diciembre de 2026",
  );
  expect(textoDeVigencia(true)).toBeNull();
  expect(textoDeVigencia(undefined)).toBeNull();
});
