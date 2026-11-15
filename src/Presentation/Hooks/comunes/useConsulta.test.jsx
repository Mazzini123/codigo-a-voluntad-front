import { act, renderHook, waitFor } from "@testing-library/react";
import { useConsulta } from "./useConsulta.js";

function diferida() {
  let resolver;
  let rechazar;
  const promesa = new Promise((resolve, reject) => {
    resolver = resolve;
    rechazar = reject;
  });
  return { promesa, resolver, rechazar };
}

test("arranca cargando y entrega los datos", async () => {
  const tarea = vi.fn(async () => ["React"]);
  const { result } = renderHook(() => useConsulta(tarea));
  expect(result.current.cargando).toBe(true);
  expect(result.current.datos).toBeNull();
  await waitFor(() => expect(result.current.cargando).toBe(false));
  expect(result.current.datos).toEqual(["React"]);
  expect(result.current.error).toBeNull();
});

test("guarda el error y deja de cargar", async () => {
  const falla = { mensaje: "No pudimos conectarnos con el servidor." };
  const tarea = vi.fn(async () => Promise.reject(falla));
  const { result } = renderHook(() => useConsulta(tarea));
  await waitFor(() => expect(result.current.cargando).toBe(false));
  expect(result.current.error).toBe(falla);
  expect(result.current.datos).toBeNull();
});

test("aborta el pedido al desmontar y no actualiza el estado", async () => {
  const pendiente = diferida();
  let signal;
  const tarea = vi.fn((s) => {
    signal = s;
    return pendiente.promesa;
  });
  const { result, unmount } = renderHook(() => useConsulta(tarea));
  unmount();
  expect(signal.aborted).toBe(true);
  await act(async () => pendiente.resolver(["tarde"]));
  expect(result.current.datos).toBeNull();
});

test("ignora la respuesta vieja cuando cambia la tarea", async () => {
  const pedidos = { 1: diferida(), 2: diferida() };
  const signals = {};
  const { result, rerender } = renderHook(
    ({ pagina }) => {
      const tarea = useCallbackDePagina(pagina, pedidos, signals);
      return useConsulta(tarea);
    },
    { initialProps: { pagina: 1 } },
  );
  rerender({ pagina: 2 });
  expect(signals[1].aborted).toBe(true);
  await act(async () => pedidos[2].resolver("página 2"));
  await act(async () => pedidos[1].resolver("página 1"));
  expect(result.current.datos).toBe("página 2");
});

const tareasPorPagina = new Map();
function useCallbackDePagina(pagina, pedidos, signals) {
  if (!tareasPorPagina.has(pagina)) {
    tareasPorPagina.set(pagina, (signal) => {
      signals[pagina] = signal;
      return pedidos[pagina].promesa;
    });
  }
  return tareasPorPagina.get(pagina);
}

test("con inmediato: false no pide hasta ejecutar", async () => {
  const tarea = vi.fn(async (signal, titulo) => ({ titulo }));
  const { result } = renderHook(() => useConsulta(tarea, { inmediato: false }));
  expect(result.current.cargando).toBe(false);
  expect(tarea).not.toHaveBeenCalled();
  let salioBien;
  await act(async () => {
    salioBien = await result.current.ejecutar("Vue");
  });
  expect(salioBien).toBe(true);
  expect(tarea).toHaveBeenCalledWith(expect.any(AbortSignal), "Vue");
  expect(result.current.datos).toEqual({ titulo: "Vue" });
});

test("ejecutar devuelve false si falla, sin rechazar", async () => {
  const falla = { mensaje: "Ya existe esa habilidad" };
  const tarea = async () => Promise.reject(falla);
  const { result } = renderHook(() => useConsulta(tarea, { inmediato: false }));
  let salioBien;
  await act(async () => {
    salioBien = await result.current.ejecutar();
  });
  expect(salioBien).toBe(false);
  expect(result.current.error).toBe(falla);
});

test("mientras ejecuta, cargando es true", async () => {
  const pendiente = diferida();
  const tarea = () => pendiente.promesa;
  const { result } = renderHook(() => useConsulta(tarea, { inmediato: false }));
  let ejecucion;
  act(() => {
    ejecucion = result.current.ejecutar();
  });
  expect(result.current.cargando).toBe(true);
  await act(async () => {
    pendiente.resolver("listo");
    await ejecucion;
  });
  expect(result.current.cargando).toBe(false);
});

test("reintentar repite el último pedido con los mismos argumentos", async () => {
  const tarea = vi
    .fn()
    .mockRejectedValueOnce({ mensaje: "Sin conexión" })
    .mockResolvedValueOnce("ok");
  const { result } = renderHook(() => useConsulta(tarea, { inmediato: false }));
  await act(async () => {
    await result.current.ejecutar("proyecto-1", { esPublica: true });
  });
  expect(result.current.error).toEqual({ mensaje: "Sin conexión" });
  await act(async () => {
    await result.current.reintentar();
  });
  expect(tarea).toHaveBeenLastCalledWith(expect.any(AbortSignal), "proyecto-1", {
    esPublica: true,
  });
  expect(result.current.datos).toBe("ok");
  expect(result.current.error).toBeNull();
});

test("conserva los datos anteriores mientras recarga", async () => {
  const segunda = diferida();
  const tarea = vi
    .fn()
    .mockResolvedValueOnce("primera")
    .mockReturnValueOnce(segunda.promesa);
  const { result } = renderHook(() => useConsulta(tarea));
  await waitFor(() => expect(result.current.datos).toBe("primera"));
  act(() => {
    result.current.reintentar();
  });
  expect(result.current.cargando).toBe(true);
  expect(result.current.datos).toBe("primera");
  await act(async () => segunda.resolver("segunda"));
  expect(result.current.datos).toBe("segunda");
});

test("reintentar conserva el error mientras vuelve a cargar", async () => {
  const falla = { mensaje: "No pudimos conectarnos." };
  const segunda = diferida();
  let llamadas = 0;
  const tarea = vi.fn(() => (++llamadas === 1 ? Promise.reject(falla) : segunda.promesa));
  const { result } = renderHook(() => useConsulta(tarea));
  await waitFor(() => expect(result.current.error).toBe(falla));
  act(() => {
    result.current.reintentar();
  });
  expect(result.current.cargando).toBe(true);
  expect(result.current.error).toBe(falla);
  await act(async () => segunda.resolver(["ok"]));
  expect(result.current.error).toBeNull();
  expect(result.current.datos).toEqual(["ok"]);
});
