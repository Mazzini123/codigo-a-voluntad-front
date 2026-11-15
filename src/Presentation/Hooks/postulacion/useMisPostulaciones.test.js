import { act, renderHook, waitFor } from "@testing-library/react";
import { useMisPostulaciones } from "./useMisPostulaciones.js";

function registro(proyectoId, id, campos = {}) {
  return {
    proyectoId,
    colaboracion: { id, perfil: "pe1", estado: "PENDIENTE", esPublica: true, ...campos },
  };
}

function armar({ registros, proyectos = {}, desvincular } = {}) {
  const dependencias = {
    colaboraciones: {
      listarColaboracionesDeColaborador: vi.fn(async () => structuredClone(registros)),
      desvincularColaboracion: desvincular ?? vi.fn(async () => ({})),
    },
    proyectos: {
      obtenerProyecto: vi.fn(async (id) => {
        if (!proyectos[id]) throw new Error("falló");
        return proyectos[id];
      }),
    },
  };
  return dependencias;
}

test("ordena de la más reciente a la más antigua y pide cada proyecto una sola vez", async () => {
  const dependencias = armar({
    registros: [
      registro("p1", "a", { fecha: "2026-01-01T00:00:00.000Z" }),
      registro("p2", "b", { fecha: "2026-03-01T00:00:00.000Z" }),
      registro("p1", "c", { fecha: "2026-02-01T00:00:00.000Z" }),
      registro("p2", "d"),
    ],
    proyectos: { p1: { titulo: "Uno" }, p2: { titulo: "Dos" } },
  });
  const { result } = renderHook(() => useMisPostulaciones("ana", dependencias));
  await waitFor(() => expect(result.current.postulaciones).not.toBeNull());
  expect(result.current.postulaciones.map(({ colaboracion }) => colaboracion.id)).toEqual(
    ["b", "c", "a", "d"],
  );
  expect(dependencias.proyectos.obtenerProyecto).toHaveBeenCalledTimes(2);
  expect(
    dependencias.colaboraciones.listarColaboracionesDeColaborador,
  ).toHaveBeenCalledWith("ana", expect.objectContaining({ requiereSesion: true }));
});

test("un proyecto que no carga queda en null sin romper la lista", async () => {
  const dependencias = armar({
    registros: [registro("p1", "a"), registro("p2", "b")],
    proyectos: { p1: { titulo: "Uno" } },
  });
  const { result } = renderHook(() => useMisPostulaciones("ana", dependencias));
  await waitFor(() => expect(result.current.postulaciones).toHaveLength(2));
  expect(result.current.error).toBeNull();
  expect(result.current.postulaciones.map(({ proyecto }) => proyecto?.titulo)).toEqual([
    "Uno",
    undefined,
  ]);
  expect(result.current.postulaciones[1].proyecto).toBeNull();
});

test("si falla la lista informa el error y reintentar la vuelve a pedir", async () => {
  const dependencias = armar({ registros: [] });
  dependencias.colaboraciones.listarColaboracionesDeColaborador
    .mockRejectedValueOnce(new Error("caído"))
    .mockResolvedValueOnce([]);
  const { result } = renderHook(() => useMisPostulaciones("ana", dependencias));
  await waitFor(() => expect(result.current.error).not.toBeNull());
  await act(() => result.current.reintentar());
  expect(result.current.error).toBeNull();
  expect(result.current.postulaciones).toEqual([]);
});

test("darDeBaja desvincula, vuelve a pedir la lista y no repite proyectos ya cargados", async () => {
  const registros = [registro("p1", "a", { estado: "ACEPTADA" })];
  const dependencias = armar({ registros, proyectos: { p1: { titulo: "Uno" } } });
  const { result } = renderHook(() => useMisPostulaciones("ana", dependencias));
  await waitFor(() => expect(result.current.postulaciones).toHaveLength(1));
  dependencias.colaboraciones.listarColaboracionesDeColaborador.mockResolvedValue([
    registro("p1", "a", { estado: "DESVINCULADA" }),
  ]);
  let resultado;
  await act(async () => {
    resultado = await result.current.darDeBaja("p1", "a");
  });
  expect(dependencias.colaboraciones.desvincularColaboracion).toHaveBeenCalledWith(
    "p1",
    "a",
  );
  expect(resultado).toEqual({ fallo: null, actualizado: true });
  expect(result.current.postulaciones[0].colaboracion.estado).toBe("DESVINCULADA");
  expect(dependencias.proyectos.obtenerProyecto).toHaveBeenCalledTimes(1);
});

test("si la baja falla devuelve el error y actualiza igual la lista", async () => {
  const falla = Object.assign(new Error("conflicto"), { status: 409 });
  const dependencias = armar({
    registros: [registro("p1", "a", { estado: "ACEPTADA" })],
    proyectos: { p1: { titulo: "Uno" } },
    desvincular: vi.fn(async () => {
      throw falla;
    }),
  });
  const { result } = renderHook(() => useMisPostulaciones("ana", dependencias));
  await waitFor(() => expect(result.current.postulaciones).toHaveLength(1));
  let resultado;
  await act(async () => {
    resultado = await result.current.darDeBaja("p1", "a");
  });
  expect(resultado.fallo).toBe(falla);
  expect(resultado.actualizado).toBe(true);
  expect(
    dependencias.colaboraciones.listarColaboracionesDeColaborador,
  ).toHaveBeenCalledTimes(2);
});

test("si la baja se confirma pero falla la recarga, lo informa", async () => {
  const dependencias = armar({
    registros: [registro("p1", "a", { estado: "ACEPTADA" })],
    proyectos: { p1: { titulo: "Uno" } },
  });
  const { result } = renderHook(() => useMisPostulaciones("ana", dependencias));
  await waitFor(() => expect(result.current.postulaciones).toHaveLength(1));
  dependencias.colaboraciones.listarColaboracionesDeColaborador.mockRejectedValue(
    new Error("caído"),
  );
  let resultado;
  await act(async () => {
    resultado = await result.current.darDeBaja("p1", "a");
  });
  expect(resultado).toEqual({ fallo: null, actualizado: false });
  expect(result.current.error).not.toBeNull();
});
