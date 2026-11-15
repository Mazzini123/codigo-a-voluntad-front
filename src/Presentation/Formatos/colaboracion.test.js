import { nombreDelPostulante } from "./colaboracion.js";

describe("nombreDelPostulante", () => {
  test("una postulación anónima no muestra el nombre", () => {
    expect(
      nombreDelPostulante({ esPublica: false, colaborador: { nombre: "Ada" } }),
    ).toBe("Postulación anónima");
  });

  test("muestra el nombre aunque la postulación no aclare si es pública", () => {
    expect(nombreDelPostulante({ colaborador: { nombre: "Ada" } })).toBe("Ada");
    expect(nombreDelPostulante({ esPublica: true, colaborador: { nombre: "Ada" } })).toBe(
      "Ada",
    );
  });

  test("sin nombre cargado usa un texto que no parece un error", () => {
    expect(nombreDelPostulante({ esPublica: true, colaborador: null })).toBe(
      "Persona sin nombre",
    );
  });
});
