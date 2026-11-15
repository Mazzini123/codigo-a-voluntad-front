import {
  estaLeido,
  extractoDelMensaje,
  idsDeProyectosDelMensaje,
  textoDelEnlaceAlProyecto,
  textoDelMensaje,
  tituloDelMensaje,
} from "./mensaje.js";

describe("título y texto del mensaje", () => {
  test("usa el asunto y el contenido del back cuando vienen", () => {
    const mensaje = { tipo: "INVITACION", asunto: " Te invitan ", contenido: " Hola " };
    expect(tituloDelMensaje(mensaje)).toBe("Te invitan");
    expect(textoDelMensaje(mensaje)).toBe("Hola");
  });

  test("sin texto del back los arma según el tipo", () => {
    const mensaje = { tipo: "POSTULACION_ACEPTADA" };
    expect(tituloDelMensaje(mensaje)).toBe("Aceptaron tu postulación");
    expect(textoDelMensaje(mensaje)).toMatch(/aceptó tu postulación/);
  });

  test("un tipo desconocido tiene título genérico y texto vacío", () => {
    expect(tituloDelMensaje({ tipo: "OTRO" })).toBe("Mensaje");
    expect(textoDelMensaje({ tipo: "OTRO" })).toBe("");
  });
});

describe("extracto", () => {
  test("toma la primera línea", () => {
    expect(extractoDelMensaje({ contenido: "Primera\nSegunda" })).toBe("Primera");
  });

  test("recorta las líneas largas", () => {
    const extracto = extractoDelMensaje({ contenido: "a".repeat(300) });
    expect(extracto).toHaveLength(121);
    expect(extracto.endsWith("…")).toBe(true);
  });
});

describe("estaLeido", () => {
  test.each([
    [{ esLeida: true }, true],
    [{ leida: true }, true],
    [{ esLeida: false }, false],
    [{}, false],
  ])("%j → %s", (mensaje, esperado) => {
    expect(estaLeido(mensaje)).toBe(esperado);
  });
});

describe("proyectos del mensaje", () => {
  test("junta proyectoId y proyectoIds sin repetir", () => {
    expect(
      idsDeProyectosDelMensaje({
        referencias: { proyectoId: "p1", proyectoIds: ["p1", "p2"] },
      }),
    ).toEqual(["p1", "p2"]);
  });

  test("sin referencias no hay proyectos", () => {
    expect(idsDeProyectosDelMensaje({})).toEqual([]);
  });

  test("numera los enlaces solo si hay más de uno", () => {
    expect(textoDelEnlaceAlProyecto(1, 1)).toBe("Ver el proyecto");
    expect(textoDelEnlaceAlProyecto(2, 3)).toBe("Ver el proyecto 2");
  });
});
