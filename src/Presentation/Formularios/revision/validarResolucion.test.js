import { ERROR_NOTA_OBLIGATORIA, errorDeNota } from "./validarResolucion.js";

test("una nota obligatoria vacía o con solo espacios es un error", () => {
  expect(errorDeNota("", { obligatoria: true })).toBe(ERROR_NOTA_OBLIGATORIA);
  expect(errorDeNota("   \n ", { obligatoria: true })).toBe(ERROR_NOTA_OBLIGATORIA);
});

test("con texto, la nota obligatoria es válida", () => {
  expect(errorDeNota("Falta la fecha.", { obligatoria: true })).toBeNull();
});

test("una nota opcional puede quedar vacía", () => {
  expect(errorDeNota("", { obligatoria: false })).toBeNull();
  expect(errorDeNota("")).toBeNull();
});

test("el mensaje explica por qué hace falta", () => {
  expect(ERROR_NOTA_OBLIGATORIA).toBe(
    "Escribí qué tiene que cambiar el colectivo: es lo único que va a ver para corregir el proyecto.",
  );
});
