import { validarValoracion } from "./validarValoracion.js";

test.each(["", "0", "6", "2.5", "texto"])("rechaza puntaje inválido %s", (puntaje) => {
  expect(validarValoracion(puntaje, "")).toBe("Elegí un puntaje de 1 a 5.");
});
test("el comentario es opcional y admite hasta 280 caracteres", () => {
  expect(validarValoracion("1", "")).toBeNull();
  expect(validarValoracion("5", "a".repeat(280))).toBeNull();
  expect(validarValoracion("5", "a".repeat(281))).toBe(
    "El comentario puede tener hasta 280 caracteres.",
  );
});
