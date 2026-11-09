import {
  armarLogro,
  estadoInicialDeLogro,
  LARGO_MAXIMO_DESCRIPCION_DE_LOGRO,
  LARGO_MAXIMO_TITULO_DE_LOGRO,
  validarLogro,
} from "./formularioLogro.js";

test("título y descripción son obligatorios", () => {
  expect(validarLogro({ titulo: " ", descripcion: "" })).toEqual({
    titulo: "Escribí el título del logro.",
    descripcion: "Contá en qué consistió el logro.",
  });
  expect(validarLogro({ titulo: "Primer relevamiento", descripcion: "Listo" })).toEqual(
    {},
  );
});

test("respeta los largos máximos", () => {
  const errores = validarLogro({
    titulo: "a".repeat(LARGO_MAXIMO_TITULO_DE_LOGRO + 1),
    descripcion: "a".repeat(LARGO_MAXIMO_DESCRIPCION_DE_LOGRO + 1),
  });
  expect(Object.keys(errores)).toEqual(["titulo", "descripcion"]);
  expect(
    validarLogro({
      titulo: "a".repeat(LARGO_MAXIMO_TITULO_DE_LOGRO),
      descripcion: "a".repeat(LARGO_MAXIMO_DESCRIPCION_DE_LOGRO),
    }),
  ).toEqual({});
});

test("el estado inicial copia solo título y descripción", () => {
  expect(estadoInicialDeLogro(null)).toEqual({ titulo: "", descripcion: "" });
  expect(
    estadoInicialDeLogro({
      id: "l1",
      titulo: "A",
      descripcion: "B",
      fecha: "2026-11-01",
    }),
  ).toEqual({ titulo: "A", descripcion: "B" });
});

test("el request lleva solo título y descripción, sin espacios sobrantes", () => {
  expect(
    armarLogro({ titulo: " A ", descripcion: " B ", fecha: "2026-11-01", id: "l1" }),
  ).toEqual({ titulo: "A", descripcion: "B" });
});
