import {
  confirmacionDeAceptar,
  nombreDelPostulante,
  selloDePostulacion,
  textoEncajeDelPostulante,
  tituloDelGrupo,
} from "./colaboracion.js";

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

describe("selloDePostulacion", () => {
  test.each([
    ["PENDIENTE", "pendiente", "Pendiente"],
    ["ACEPTADA", "aceptada", "Aceptada"],
    ["RECHAZADA", "rechazada", "Rechazada"],
    ["FINALIZADA", "finalizado", "Finalizada"],
    ["DESVINCULADA", "cerrada", "Desvinculada"],
    ["RETIRADA", "cerrada", "Retirada"],
  ])("%s usa el sello %s", (estado, tipo, texto) => {
    expect(selloDePostulacion(estado)).toEqual({ tipo, texto });
  });
});

describe("tituloDelGrupo", () => {
  test("usa el título, si no la descripción y por último el número", () => {
    expect(tituloDelGrupo({ titulo: "Diseño", descripcion: "Otra" }, 0)).toBe("Diseño");
    expect(tituloDelGrupo({ descripcion: "  Armar   la web " }, 0)).toBe("Armar la web");
    expect(tituloDelGrupo({ descripcion: "" }, 1)).toBe("Perfil 2");
  });
});

describe("textoEncajeDelPostulante", () => {
  test("habla de la persona en tercera persona", () => {
    expect(textoEncajeDelPostulante({ tiene: 1, total: 1 })).toBe(
      "Tiene 1 de 1 habilidad requerida",
    );
    expect(textoEncajeDelPostulante({ tiene: 0, total: 3 })).toBe(
      "Tiene 0 de 3 habilidades requeridas",
    );
  });
});

describe("confirmacionDeAceptar", () => {
  test("nombra a la persona y avisa que se comparten los datos de contacto", () => {
    const { titulo, descripcion } = confirmacionDeAceptar({
      esPublica: true,
      colaborador: { nombre: "Ada" },
    });
    expect(titulo).toBe("¿Aceptar a Ada?");
    expect(descripcion).toMatch(/datos de contacto/);
  });

  test("una postulación anónima no se nombra y aclara que no hay contacto", () => {
    const { titulo, descripcion } = confirmacionDeAceptar({
      esPublica: false,
      colaborador: { nombre: "Ada" },
    });
    expect(titulo).toBe("¿Aceptar la postulación anónima?");
    expect(descripcion).not.toMatch(/Ada/);
    expect(descripcion).toMatch(/no se comparten datos de contacto/);
  });
});
