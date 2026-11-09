import {
  busquedaVencida,
  esPostulacionActiva,
  limiteAlcanzado,
  MOTIVO_DE_CIERRE,
  motivoDeCierre,
  perfilesAbiertos,
  postulacionesPendientes,
  recibePostulaciones,
} from "./busquedaDePerfil.js";

const HOY = new Date("2026-11-05T15:00:00Z");

function unPerfil(cambios = {}) {
  return {
    id: "pe1",
    busquedaAbierta: true,
    fechaCierreBusqueda: null,
    limiteColaboraciones: null,
    ...cambios,
  };
}

function unProyecto(perfiles, cambios = {}) {
  return { estado: "ABIERTO", perfiles, colaboraciones: [], ...cambios };
}

const aceptada = (perfil) => ({ perfil, estado: "ACEPTADA" });

describe("busquedaVencida", () => {
  test("vence en el instante de cierre, no antes", () => {
    const cierre = "2026-11-05T15:00:00Z";
    expect(busquedaVencida(unPerfil({ fechaCierreBusqueda: cierre }), HOY)).toBe(true);
    expect(
      busquedaVencida(
        unPerfil({ fechaCierreBusqueda: cierre }),
        new Date("2026-11-05T14:59:59Z"),
      ),
    ).toBe(false);
  });

  test("sin fecha de cierre nunca vence", () => {
    expect(busquedaVencida(unPerfil(), HOY)).toBe(false);
  });
});

test("el límite se alcanza contando solo las colaboraciones aceptadas del perfil", () => {
  const perfil = unPerfil({ limiteColaboraciones: 2 });
  const colaboraciones = [
    aceptada("pe1"),
    aceptada("otro"),
    { perfil: "pe1", estado: "PENDIENTE" },
  ];
  expect(limiteAlcanzado(perfil, unProyecto([perfil], { colaboraciones }))).toBe(false);
  colaboraciones.push(aceptada("pe1"));
  expect(limiteAlcanzado(perfil, unProyecto([perfil], { colaboraciones }))).toBe(true);
});

test.each([
  [
    "proyecto finalizado",
    unPerfil(),
    { estado: "FINALIZADO" },
    MOTIVO_DE_CIERRE.PROYECTO_FINALIZADO,
  ],
  [
    "búsqueda cerrada a mano",
    unPerfil({ busquedaAbierta: false }),
    {},
    MOTIVO_DE_CIERRE.BUSQUEDA_CERRADA,
  ],
  [
    "búsqueda vencida",
    unPerfil({ fechaCierreBusqueda: "2026-11-01T02:59:59Z" }),
    {},
    MOTIVO_DE_CIERRE.BUSQUEDA_VENCIDA,
  ],
  [
    "límite alcanzado",
    unPerfil({ limiteColaboraciones: 1 }),
    { colaboraciones: [aceptada("pe1")] },
    MOTIVO_DE_CIERRE.LIMITE_ALCANZADO,
  ],
  ["abierta", unPerfil(), {}, null],
])("motivo de cierre: %s", (_, perfil, cambios, motivo) => {
  expect(motivoDeCierre(perfil, unProyecto([perfil], cambios), HOY)).toBe(motivo);
});

test("el proyecto finalizado gana sobre los demás motivos", () => {
  const perfil = unPerfil({ busquedaAbierta: false });
  expect(
    motivoDeCierre(perfil, unProyecto([perfil], { estado: "FINALIZADO" }), HOY),
  ).toBe(MOTIVO_DE_CIERRE.PROYECTO_FINALIZADO);
});

test("los perfiles abiertos son los que reciben postulaciones", () => {
  const abierto = unPerfil({ id: "a" });
  const cerrado = unPerfil({ id: "b", busquedaAbierta: false });
  const proyecto = unProyecto([abierto, cerrado]);
  expect(perfilesAbiertos(proyecto, HOY)).toEqual([abierto]);
  expect(recibePostulaciones(cerrado, proyecto, HOY)).toBe(false);
});

test("una postulación activa está pendiente o aceptada", () => {
  expect(esPostulacionActiva("PENDIENTE")).toBe(true);
  expect(esPostulacionActiva("ACEPTADA")).toBe(true);
  expect(esPostulacionActiva("RECHAZADA")).toBe(false);
});

test("cuenta las pendientes y no inventa el conteo sin colaboraciones", () => {
  expect(
    postulacionesPendientes(
      unProyecto([], { colaboraciones: [{ estado: "PENDIENTE" }, aceptada("x")] }),
    ),
  ).toBe(1);
  expect(postulacionesPendientes({ estado: "ABIERTO" })).toBeNull();
});
