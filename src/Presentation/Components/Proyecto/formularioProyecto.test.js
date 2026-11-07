import {
  datosARevisar,
  esFechaFutura,
  finDelDia,
  hoyEnArgentina,
  itemsDelResumenDelAlta,
  perfilARequest,
  perfilEstaVacio,
  perfilParaVista,
  perfilVacio,
  proyectoARequest,
  proyectoEstaVacio,
  proyectoVacio,
} from "./formularioProyecto.js";

const REACT = { codigo: "react", titulo: "React" };
const FIGMA = { codigo: "figma", titulo: "Figma" };

function unPerfil(cambios = {}) {
  return {
    ...perfilVacio(),
    descripcion: "  Desarrolladora frontend  ",
    requeridas: [REACT],
    opcionales: [FIGMA],
    horas: "5",
    ...cambios,
  };
}

describe("fechas", () => {
  test("hoy es el día en Argentina, no en UTC", () => {
    expect(hoyEnArgentina(new Date("2026-11-07T01:30:00Z"))).toBe("2026-11-06");
    expect(hoyEnArgentina(new Date("2026-11-06T15:00:00Z"))).toBe("2026-11-06");
  });

  test("una fecha es futura solo si es posterior a hoy", () => {
    const ahora = new Date("2026-11-06T15:00:00Z");
    expect(esFechaFutura("2026-11-06", ahora)).toBe(false);
    expect(esFechaFutura("2026-11-05", ahora)).toBe(false);
    expect(esFechaFutura("2026-11-07", ahora)).toBe(true);
  });

  test("el cierre es al final de ese día en Argentina", () => {
    expect(finDelDia("2026-12-15")).toBe("2026-12-15T23:59:59-03:00");
  });
});

describe("estado vacío", () => {
  test("el proyecto y el perfil vacíos se reconocen y cualquier dato los cambia", () => {
    expect(proyectoEstaVacio(proyectoVacio())).toBe(true);
    expect(proyectoEstaVacio({ ...proyectoVacio(), titulo: " Hola " })).toBe(false);
    expect(perfilEstaVacio(perfilVacio())).toBe(true);
    expect(perfilEstaVacio({ ...perfilVacio(), horas: "3" })).toBe(false);
    expect(
      perfilEstaVacio({ ...perfilVacio(), modalidad: "OFRECE_INCENTIVO_ECONOMICO" }),
    ).toBe(false);
  });
});

describe("request", () => {
  test("un perfil que revisa cada postulación va sin límite", () => {
    expect(perfilARequest(unPerfil())).toEqual({
      descripcion: "Desarrolladora frontend",
      codigosHabilidadesRequeridas: ["react"],
      codigosHabilidadesOpcionales: ["figma"],
      compromiso: { cantidadHoras: 5, periodo: "HS_SEMANALES" },
      modalidadColaboracion: "GRATUITA",
      modoAceptacion: "REVISION_MANUAL",
      limiteColaboraciones: null,
    });
  });

  test("con revisión manual el límite es opcional", () => {
    expect(perfilARequest(unPerfil({ limite: "4" })).limiteColaboraciones).toBe(4);
  });

  test("aceptar a todas nunca manda límite, aunque haya quedado uno escrito", () => {
    const pedido = perfilARequest(unPerfil({ modoAceptacion: "TODO_SUMA", limite: "9" }));
    expect(pedido.modoAceptacion).toBe("TODO_SUMA");
    expect(pedido.limiteColaboraciones).toBeNull();
  });

  test("hasta completar lugares manda el límite", () => {
    const pedido = perfilARequest(
      unPerfil({ modoAceptacion: "HASTA_LLENAR_VACANTES", limite: "3" }),
    );
    expect(pedido.modoAceptacion).toBe("HASTA_LLENAR_VACANTES");
    expect(pedido.limiteColaboraciones).toBe(3);
  });

  test("la fecha de cierre de la búsqueda solo va si se eligió", () => {
    expect(perfilARequest(unPerfil())).not.toHaveProperty("fechaCierreBusqueda");
    expect(
      perfilARequest(unPerfil({ fechaCierreBusqueda: "2026-12-15" })).fechaCierreBusqueda,
    ).toBe("2026-12-15T23:59:59-03:00");
  });

  test("el proyecto lleva todos sus perfiles en un solo pedido", () => {
    const pedido = proyectoARequest(
      {
        titulo: " Turnos ",
        descripcion: " Una app ",
        etiquetas: ["salud"],
        fechaCierre: "",
      },
      [unPerfil(), unPerfil({ descripcion: "Tester" })],
    );
    expect(pedido).toMatchObject({
      titulo: "Turnos",
      descripcion: "Una app",
      etiquetas: ["salud"],
    });
    expect(pedido.perfiles.map((perfil) => perfil.descripcion)).toEqual([
      "Desarrolladora frontend",
      "Tester",
    ]);
    expect(pedido).not.toHaveProperty("fechaCierre");
  });
});

describe("vista previa", () => {
  test("arma un perfil con la forma que muestra el detalle", () => {
    const vista = perfilParaVista(
      unPerfil({ modoAceptacion: "HASTA_LLENAR_VACANTES", limite: "2" }),
    );
    expect(vista).toMatchObject({
      descripcion: "Desarrolladora frontend",
      compromiso: { cantidadHoras: 5, periodo: "HS_SEMANALES" },
      habilidadesRequeridas: [REACT],
      habilidadesOpcionales: [FIGMA],
      busquedaAbierta: true,
      limiteColaboraciones: 2,
      modoAceptacion: "HASTA_LLENAR_VACANTES",
    });
  });
});

describe("errores del back", () => {
  test("los issues se traducen a datos que la persona entiende, sin repetir", () => {
    expect(
      datosARevisar([
        {
          path: ["titulo"],
          code: "too_small",
          message: "String must contain at least 1",
        },
        { path: ["perfiles", 1, "codigosHabilidadesRequeridas"] },
        { path: ["perfiles", 1, "compromiso", "cantidadHoras"] },
        { path: ["perfiles", 1, "limiteColaboraciones"] },
        { path: ["perfiles", 1, "modoAceptacion"] },
        { path: [] },
        { path: ["algoRaro"] },
      ]),
    ).toEqual([
      "El título del proyecto",
      "Perfil 2: las habilidades requeridas",
      "Perfil 2: las horas de compromiso",
      "Perfil 2: cómo sumar colaboradoras",
    ]);
  });

  test("sin issues no hay nada que listar", () => {
    expect(datosARevisar(undefined)).toEqual([]);
  });

  test("el resumen enlaza cada campo con error, en orden y sin términos del back", () => {
    expect(
      itemsDelResumenDelAlta(
        { "perfil.horas": "x", titulo: "y", "perfil.limite": "z" },
        "f",
      ),
    ).toEqual([
      { id: "f-titulo", etiqueta: "Título" },
      { id: "f-perfil.horas", etiqueta: "Cuántas horas" },
      { id: "f-perfil.limite", etiqueta: "Cuántas personas" },
    ]);
  });
});
