import { act, renderHook } from "@testing-library/react";
import { ApiError } from "@/Infrastructure/Http/ApiError.js";
import { AvisosContext } from "@/Presentation/Context/AvisosContext.js";
import { AVISO_PUBLICACION_PEDIDA, usePedirPublicacion } from "./usePedirPublicacion.js";

function armar(pedirPublicacion) {
  const avisos = { exito: vi.fn(), error: vi.fn(), info: vi.fn() };
  const alCambiar = vi.fn(async () => {});
  const dependencias = { pedirPublicacion };
  const wrapper = ({ children }) => (
    <AvisosContext.Provider value={avisos}>{children}</AvisosContext.Provider>
  );
  const hook = renderHook(() => usePedirPublicacion("p1", alCambiar, dependencias), {
    wrapper,
  });
  return { ...hook, avisos, alCambiar, dependencias };
}

function fallaCon(datos) {
  return vi.fn(async () => {
    throw new ApiError({ mensaje: "crudo del back", ...datos });
  });
}

test("pide la publicación, avisa y recarga el proyecto", async () => {
  const { result, avisos, alCambiar, dependencias } = armar(
    vi.fn(async () => ({ id: "p1", estado: "EN_REVISION" })),
  );
  let ok;
  await act(async () => {
    ok = await result.current.pedir();
  });
  expect(ok).toBe(true);
  expect(dependencias.pedirPublicacion).toHaveBeenCalledWith("p1", {
    signal: expect.any(AbortSignal),
  });
  expect(avisos.exito).toHaveBeenCalledWith(AVISO_PUBLICACION_PEDIDA);
  expect(alCambiar).toHaveBeenCalled();
  expect(result.current.error).toBeNull();
});

test("si ya no es un borrador explica el conflicto y recarga", async () => {
  const { result, alCambiar, avisos } = armar(fallaCon({ status: 409 }));
  await act(() => result.current.pedir());
  expect(result.current.error.mensaje).toBe(
    "Este proyecto ya no es un borrador. Actualizamos su estado.",
  );
  expect(alCambiar).toHaveBeenCalled();
  expect(avisos.exito).not.toHaveBeenCalled();
});

test("si la fecha de cierre ya pasó pide cambiarla y no recarga", async () => {
  const { result, alCambiar } = armar(fallaCon({ status: 422 }));
  await act(() => result.current.pedir());
  expect(result.current.error.mensaje).toBe(
    "La fecha de cierre ya pasó. Cambiala en el borrador y volvé a pedir la publicación.",
  );
  expect(alCambiar).not.toHaveBeenCalled();
});

test("limpiar borra el error", async () => {
  const { result } = armar(fallaCon({ status: 422 }));
  await act(() => result.current.pedir());
  act(() => result.current.limpiar());
  expect(result.current.error).toBeNull();
});
