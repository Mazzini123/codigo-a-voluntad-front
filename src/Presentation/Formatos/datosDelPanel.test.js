import {
  filasDelPanel,
  filasParaElResumen,
  postulacionesPorRevisar,
  proyectosActivos,
  totalSiCompleto,
} from "./datosDelPanel.js";

const HOY = new Date("2026-11-08T12:00:00Z");

const perfil = (id, cambios = {}) => ({
  id,
  busquedaAbierta: true,
  fechaCierreBusqueda: null,
  limiteColaboraciones: null,
  ...cambios,
});

const proyecto = (id, estado, cambios = {}) => ({
  id,
  estado,
  perfiles: [perfil(`${id}-1`)],
  colaboraciones: [],
  ...cambios,
});

const pendiente = (id, perfilId, fecha) => ({
  id,
  perfil: perfilId,
  estado: "PENDIENTE",
  fecha,
});

describe("filasDelPanel", () => {
  test("cuenta perfiles abiertos y postulaciones pendientes de cada proyecto", () => {
    const filas = filasDelPanel(
      [
        proyecto("a", "ABIERTO", {
          perfiles: [perfil("a-1"), perfil("a-2", { busquedaAbierta: false })],
          colaboraciones: [pendiente("c1", "a-1", "2026-11-01")],
        }),
      ],
      HOY,
    );
    expect(filas).toMatchObject([{ abiertos: 1, pendientes: 1 }]);
  });

  test("no inventa los conteos que el listado no trae", () => {
    const filas = filasDelPanel(
      [proyecto("a", "ABIERTO", { perfiles: undefined, colaboraciones: undefined })],
      HOY,
    );
    expect(filas).toMatchObject([{ abiertos: null, pendientes: null }]);
  });

  test("sin listado devuelve undefined", () => {
    expect(filasDelPanel(undefined, HOY)).toBeUndefined();
  });
});

describe("totales", () => {
  test("suma si todas las filas tienen el dato y devuelve null si falta alguno", () => {
    expect(totalSiCompleto([{ pendientes: 2 }, { pendientes: 1 }], "pendientes")).toBe(3);
    expect(totalSiCompleto([{ pendientes: 2 }, { pendientes: null }], "pendientes")).toBe(
      null,
    );
  });

  test("cuenta como activos solo los proyectos abiertos", () => {
    const filas = [
      { proyecto: { estado: "ABIERTO" } },
      { proyecto: { estado: "FINALIZADO" } },
      { proyecto: { estado: "ABIERTO" } },
    ];
    expect(proyectosActivos(filas)).toBe(2);
  });
});

describe("filasParaElResumen", () => {
  test("pone primero los proyectos abiertos y respeta el máximo", () => {
    const filas = ["FINALIZADO", "ABIERTO", "FINALIZADO", "ABIERTO", "ABIERTO"].map(
      (estado, indice) => ({ proyecto: { id: String(indice), estado } }),
    );
    expect(filasParaElResumen(filas, 3).map(({ proyecto }) => proyecto.id)).toEqual([
      "1",
      "3",
      "4",
    ]);
  });
});

describe("postulacionesPorRevisar", () => {
  test("ordena de la más reciente a la más antigua y vincula el perfil pedido", () => {
    const filas = filasDelPanel(
      [
        proyecto("a", "ABIERTO", {
          colaboraciones: [
            pendiente("c1", "a-1", "2026-10-01T00:00:00Z"),
            { ...pendiente("c2", "a-1", "2026-11-05T00:00:00Z"), estado: "ACEPTADA" },
            pendiente("c3", "a-1", "2026-11-03T00:00:00Z"),
          ],
        }),
      ],
      HOY,
    );
    const { completo, postulaciones } = postulacionesPorRevisar(filas);
    expect(completo).toBe(true);
    expect(postulaciones.map(({ colaboracion }) => colaboracion.id)).toEqual([
      "c3",
      "c1",
    ]);
    expect(postulaciones[0].perfil.id).toBe("a-1");
  });

  test("avisa que el resultado es parcial si algún proyecto no trae postulaciones", () => {
    const filas = filasDelPanel(
      [
        proyecto("a", "ABIERTO", { colaboraciones: [pendiente("c1", "a-1", null)] }),
        proyecto("b", "ABIERTO", { colaboraciones: undefined }),
      ],
      HOY,
    );
    const { completo, postulaciones } = postulacionesPorRevisar(filas);
    expect(completo).toBe(false);
    expect(postulaciones).toHaveLength(1);
  });
});
