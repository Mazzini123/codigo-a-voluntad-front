import { renderHook, waitFor } from "@testing-library/react";
import { usePublicacionesSinPublicar } from "./usePublicacionesSinPublicar.js";

const rechazo = { nota: "Falta la fecha.", fecha: "2026-11-12T15:00:00.000Z" };
const baja = { motivo: "Publica datos personales.", fecha: "2026-11-16T15:00:00.000Z" };

test("pide el detalle de los borradores y los proyectos en revisión que no traen la publicación", async () => {
  const obtenerProyecto = vi.fn(async (id) => ({
    id,
    publicacion: id === "b1" ? { rechazo } : null,
  }));
  const proyectos = [
    { id: "a1", estado: "ABIERTO" },
    { id: "b1", estado: "BORRADOR" },
    { id: "b2", estado: "BORRADOR" },
    { id: "b3", estado: "BORRADOR", publicacion: { rechazo: null }, baja: null },
    { id: "r1", estado: "EN_REVISION" },
  ];
  const dependencias = { obtenerProyecto };
  const { result } = renderHook(() =>
    usePublicacionesSinPublicar(proyectos, dependencias),
  );
  await waitFor(() =>
    expect(result.current.get("b1")).toEqual({ publicacion: { rechazo }, baja: null }),
  );
  expect(obtenerProyecto.mock.calls.map(([id]) => id).sort()).toEqual(["b1", "b2", "r1"]);
  expect(result.current.get("b2")).toEqual({ publicacion: null, baja: null });
});

test("cuando el listado ya trae publicacion y baja, no pide ningún detalle", () => {
  const obtenerProyecto = vi.fn();
  const proyectos = [
    { id: "b1", estado: "BORRADOR", publicacion: { rechazo }, baja: null },
    { id: "r1", estado: "EN_REVISION", publicacion: { solicitadaEn: "x" }, baja: null },
    { id: "d1", estado: "DADO_DE_BAJA", publicacion: null, baja },
  ];
  const dependencias = { obtenerProyecto };
  const { result } = renderHook(() =>
    usePublicacionesSinPublicar(proyectos, dependencias),
  );
  expect(obtenerProyecto).not.toHaveBeenCalled();
  expect(result.current.size).toBe(0);
});

test("un proyecto dado de baja que trae publicacion pero no baja todavía pide el detalle", async () => {
  const obtenerProyecto = vi.fn(async (id) => ({ id, publicacion: null, baja }));
  const proyectos = [{ id: "d1", estado: "DADO_DE_BAJA", publicacion: null }];
  const dependencias = { obtenerProyecto };
  const { result } = renderHook(() =>
    usePublicacionesSinPublicar(proyectos, dependencias),
  );
  await waitFor(() =>
    expect(result.current.get("d1")).toEqual({ publicacion: null, baja }),
  );
});

test("de un proyecto dado de baja trae el motivo", async () => {
  const obtenerProyecto = vi.fn(async (id) => ({ id, publicacion: null, baja }));
  const proyectos = [{ id: "d1", estado: "DADO_DE_BAJA" }];
  const dependencias = { obtenerProyecto };
  const { result } = renderHook(() =>
    usePublicacionesSinPublicar(proyectos, dependencias),
  );
  await waitFor(() =>
    expect(result.current.get("d1")).toEqual({ publicacion: null, baja }),
  );
});

test("si falla un detalle, ese borrador queda sin publicación y no rompe", async () => {
  const obtenerProyecto = vi.fn(async (id) => {
    if (id === "b1") throw new Error("Sin conexión");
    return { id, publicacion: { rechazo } };
  });
  const proyectos = [
    { id: "b1", estado: "BORRADOR" },
    { id: "b2", estado: "BORRADOR" },
  ];
  const dependencias = { obtenerProyecto };
  const { result } = renderHook(() =>
    usePublicacionesSinPublicar(proyectos, dependencias),
  );
  await waitFor(() =>
    expect(result.current.get("b2")).toEqual({ publicacion: { rechazo }, baja: null }),
  );
  expect(result.current.has("b1")).toBe(false);
});

test("sin borradores no pide nada", () => {
  const obtenerProyecto = vi.fn();
  const dependencias = { obtenerProyecto };
  const abiertos = [{ id: "a1", estado: "ABIERTO" }];
  renderHook(() => usePublicacionesSinPublicar(abiertos, dependencias));
  renderHook(() => usePublicacionesSinPublicar(null, dependencias));
  expect(obtenerProyecto).not.toHaveBeenCalled();
});
