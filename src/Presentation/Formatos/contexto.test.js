import { detalleDelContexto, nombreDelContexto } from "./contexto.js";

const ADMINISTRACION = {
  tipo: "ADMINISTRACION",
  rol: "ADMIN",
  colectivo: null,
  colaborador: null,
};

test("el contexto de administración no depende de un colectivo ni de un perfil", () => {
  expect(nombreDelContexto(ADMINISTRACION)).toBe("Administración de la plataforma");
  expect(detalleDelContexto(ADMINISTRACION)).toBe("Plataforma · Administradora");
});

test("los otros contextos conservan sus textos", () => {
  expect(nombreDelContexto({ tipo: "COLECTIVO", colectivo: { nombre: "Huerta" } })).toBe(
    "Huerta",
  );
  expect(detalleDelContexto({ tipo: "COLECTIVO", rol: "LIDER" })).toBe(
    "Colectivo · Coordinadora",
  );
  expect(detalleDelContexto({ tipo: "COLABORADOR" })).toBe("Colaboradora");
});
