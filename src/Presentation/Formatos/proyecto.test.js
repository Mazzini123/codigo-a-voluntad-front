import {
  encajeCon,
  estadoDeBusqueda,
  fechaLarga,
  habilidadesBuscadas,
  motivoNoPostulable,
  perfilDestacado,
  postulacionesPendientes,
  textoCompromiso,
  textoEncaje,
  textoLimite,
  textoModalidad,
  textoModoAceptacion,
  textoPrivacidadDePostulacion,
  textoPerfilesQueBuscan,
  textoPostulacionesPendientes,
} from "./proyecto.js";

const HOY = new Date("2026-11-05T15:00:00Z");

function perfil(cambios = {}) {
  return {
    id: "pe1",
    busquedaAbierta: true,
    fechaCierreBusqueda: null,
    limiteColaboraciones: null,
    habilidadesRequeridas: [],
    compromiso: { cantidadHoras: 5, periodo: "HS_MENSUALES" },
    modalidadColaboracion: "GRATUITA",
    ...cambios,
  };
}

function proyecto(perfiles, cambios = {}) {
  return { id: "p1", estado: "ABIERTO", perfiles, colaboraciones: [], ...cambios };
}

test("compromiso y modalidad legibles", () => {
  expect(textoCompromiso({ cantidadHoras: 5, periodo: "HS_MENSUALES" })).toBe(
    "5 h por mes",
  );
  expect(textoCompromiso({ cantidadHoras: 10, periodo: "HS_SEMANALES" })).toBe(
    "10 h por semana",
  );
  expect(textoCompromiso({ cantidadHoras: 20, periodo: "HS_TOTALES" })).toBe(
    "20 h en total",
  );
  expect(textoModalidad("OFRECE_INCENTIVO_ECONOMICO")).toBe("Con incentivo económico");
});

test.each([
  [perfil(), {}, "abierta", "Abierta"],
  [
    perfil({ fechaCierreBusqueda: "2026-11-30T23:00:00Z" }),
    {},
    "abierta",
    "Abierta hasta el 30/11",
  ],
  [perfil({ fechaCierreBusqueda: "2026-11-01T12:00:00Z" }), {}, "cerrada", "Cerrada"],
  [perfil({ busquedaAbierta: false }), {}, "cerrada", "Cerrada"],
  [perfil(), { estado: "FINALIZADO" }, "finalizado", "Finalizado"],
])("estado de búsqueda %#", (unPerfil, cambiosDelProyecto, tipo, texto) => {
  expect(
    estadoDeBusqueda(unPerfil, proyecto([unPerfil], cambiosDelProyecto), HOY),
  ).toEqual({
    tipo,
    texto,
  });
});

test("con el límite de colaboraciones aceptadas alcanzado dice Límite alcanzado", () => {
  const unPerfil = perfil({ limiteColaboraciones: 1 });
  const conUna = proyecto([unPerfil], {
    colaboraciones: [
      { perfil: "pe1", estado: "ACEPTADA" },
      { perfil: "pe1", estado: "PENDIENTE" },
    ],
  });
  expect(estadoDeBusqueda(unPerfil, conUna, HOY).texto).toBe("Límite alcanzado");
});

test("el perfil destacado es el abierto que cierra antes", () => {
  const sinFecha = perfil({ id: "a" });
  const cierraPronto = perfil({ id: "b", fechaCierreBusqueda: "2026-11-10T00:00:00Z" });
  const cerrado = perfil({ id: "c", busquedaAbierta: false });
  expect(perfilDestacado(proyecto([sinFecha, cierraPronto, cerrado]), HOY).id).toBe("b");
});

test("las habilidades buscadas salen solo de perfiles abiertos y sin repetir", () => {
  const react = { codigo: "react", titulo: "React" };
  const python = { codigo: "python", titulo: "Python" };
  const unProyecto = proyecto([
    perfil({ id: "a", habilidadesRequeridas: [react] }),
    perfil({ id: "b", habilidadesRequeridas: [react] }),
    perfil({ id: "c", busquedaAbierta: false, habilidadesRequeridas: [python] }),
  ]);
  expect(habilidadesBuscadas(unProyecto, HOY)).toEqual([react]);
});

test("el encaje toma el perfil con mejor proporción y no se muestra con cero", () => {
  const unProyecto = proyecto([
    perfil({
      id: "a",
      habilidadesRequeridas: [{ codigo: "x" }, { codigo: "react" }, { codigo: "y" }],
    }),
    perfil({ id: "b", habilidadesRequeridas: [{ codigo: "react" }, { codigo: "z" }] }),
  ]);
  expect(encajeCon(unProyecto, new Set(["react"]), HOY)).toEqual({ tiene: 1, total: 2 });
  expect(encajeCon(unProyecto, new Set(["cobol"]), HOY)).toBeNull();
  expect(textoEncaje({ tiene: 2, total: 3 })).toBe("Tenés 2 de 3 habilidades requeridas");
  expect(textoEncaje({ tiene: 1, total: 1 })).toBe("Tenés 1 de 1 habilidad requerida");
});

test("límite, modo de aceptación y fecha larga legibles", () => {
  expect(textoLimite(null)).toBe("Sin límite");
  expect(textoLimite(1)).toBe("Hasta 1 colaboración");
  expect(textoLimite(3)).toBe("Hasta 3 colaboraciones");
  expect(textoModoAceptacion("REVISION_MANUAL")).toBe(
    "El colectivo revisa cada postulación",
  );
  expect(textoModoAceptacion("TODO_SUMA")).toBe(
    "Se acepta a todas las personas que se postulan",
  );
  expect(textoModoAceptacion("HASTA_LLENAR_VACANTES")).toBe(
    "Se acepta automáticamente hasta completar el límite",
  );
  expect(fechaLarga("2026-11-03T15:00:00Z")).toBe("3 de noviembre de 2026");
});

test.each([
  [perfil(), {}, null],
  [perfil({ busquedaAbierta: false }), {}, "La búsqueda de este perfil está cerrada."],
  [
    perfil({ fechaCierreBusqueda: "2026-11-01T12:00:00Z" }),
    {},
    "La búsqueda de este perfil cerró el 1/11.",
  ],
  [perfil({ fechaCierreBusqueda: "2026-11-30T23:00:00Z" }), {}, null],
  [perfil(), { estado: "FINALIZADO" }, "Este proyecto ya finalizó."],
  [
    perfil({ limiteColaboraciones: 1 }),
    { colaboraciones: [{ perfil: "pe1", estado: "ACEPTADA" }] },
    "Este perfil ya completó su límite de colaboraciones.",
  ],
  [
    perfil({ limiteColaboraciones: 1 }),
    { colaboraciones: [{ perfil: "pe1", estado: "PENDIENTE" }] },
    null,
  ],
])("motivo por el que no se puede postular %#", (unPerfil, cambios, motivo) => {
  expect(motivoNoPostulable(unPerfil, proyecto([unPerfil], cambios), HOY)).toBe(motivo);
});

describe("lo que ve el dueño en Mis proyectos", () => {
  test("cuenta las postulaciones pendientes del listado", () => {
    expect(
      postulacionesPendientes({
        colaboraciones: [
          { estado: "PENDIENTE" },
          { estado: "ACEPTADA" },
          { estado: "PENDIENTE" },
          { estado: "RECHAZADA" },
        ],
      }),
    ).toBe(2);
    expect(postulacionesPendientes({ colaboraciones: [] })).toBe(0);
  });

  test("sin colaboraciones en el listado no inventa el conteo", () => {
    expect(postulacionesPendientes({})).toBeNull();
  });

  test.each([
    [0, "Ningún perfil busca gente"],
    [1, "1 perfil busca gente"],
    [3, "3 perfiles buscan gente"],
  ])("perfiles que buscan: %i", (cantidad, texto) => {
    expect(textoPerfilesQueBuscan(cantidad)).toBe(texto);
  });

  test.each([
    [1, "1 postulación pendiente"],
    [4, "4 postulaciones pendientes"],
  ])("postulaciones pendientes: %i", (cantidad, texto) => {
    expect(textoPostulacionesPendientes(cantidad)).toBe(texto);
  });
});

test.each([
  [
    "REVISION_MANUAL",
    "Tus datos de contacto se comparten solo si el colectivo acepta tu postulación.",
  ],
  ...["TODO_SUMA", "HASTA_LLENAR_VACANTES", "DESCONOCIDO", undefined].map((modo) => [
    modo,
    "Este perfil acepta automáticamente: al enviar, el colectivo va a ver tus datos de contacto.",
  ]),
])("privacidad para el modo %s", (modoAceptacion, esperado) => {
  expect(textoPrivacidadDePostulacion({ modoAceptacion })).toBe(esperado);
});
