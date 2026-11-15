import { opcionesDeProvincias, sinTildes } from "./colectivo.js";

test("sinTildes quita los acentos", () => {
  expect(sinTildes("Río Negro")).toBe("Rio Negro");
});

test("con el catálogo del back usa sus nombres como valor y muestra las tildes", () => {
  expect(opcionesDeProvincias(["Cordoba", "Tierra del Fuego"])).toEqual([
    { valor: "Cordoba", texto: "Córdoba" },
    { valor: "Tierra del Fuego", texto: "Tierra del Fuego" },
  ]);
});

test("sin catálogo usa la lista local con los mismos valores que el back", () => {
  const opciones = opcionesDeProvincias(null);
  expect(opciones).toHaveLength(23);
  expect(opciones).toContainEqual({ valor: "Tucuman", texto: "Tucumán" });
  expect(opcionesDeProvincias([])).toEqual(opciones);
});
