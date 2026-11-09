import { act, renderHook } from "@testing-library/react";
import { useMutacion } from "./useMutacion.js";

function promesaControlada() {
  let resolver;
  let rechazar;
  const promesa = new Promise((ok, falla) => {
    resolver = ok;
    rechazar = falla;
  });
  return { promesa, resolver, rechazar };
}

test("informa el envío y devuelve los datos al terminar bien", async () => {
  const pedido = promesaControlada();
  const tarea = vi.fn(() => pedido.promesa);
  const { result } = renderHook(() => useMutacion(tarea));

  let ejecucion;
  act(() => {
    ejecucion = result.current.ejecutar("a", 2);
  });
  expect(result.current.enviando).toBe(true);
  expect(tarea).toHaveBeenCalledWith(expect.any(AbortSignal), "a", 2);

  await act(async () => pedido.resolver({ id: "p1" }));

  await expect(ejecucion).resolves.toEqual({
    ok: true,
    ignorada: false,
    datos: { id: "p1" },
    error: null,
  });
  expect(result.current).toMatchObject({
    enviando: false,
    error: null,
    datos: { id: "p1" },
  });
});

test("guarda el error y lo borra al reiniciar", async () => {
  const falla = new Error("No pudimos");
  const { result } = renderHook(() => useMutacion(() => Promise.reject(falla)));

  let resultado;
  await act(async () => {
    resultado = await result.current.ejecutar();
  });

  expect(resultado).toEqual({ ok: false, ignorada: false, datos: null, error: falla });
  expect(result.current.error).toBe(falla);

  act(() => result.current.reiniciar());
  expect(result.current.error).toBeNull();
});

test("ignora una segunda ejecución mientras la primera está en curso", async () => {
  const pedido = promesaControlada();
  const tarea = vi.fn(() => pedido.promesa);
  const { result } = renderHook(() => useMutacion(tarea));

  let segunda;
  act(() => {
    result.current.ejecutar();
    segunda = result.current.ejecutar();
  });

  await expect(segunda).resolves.toMatchObject({ ok: false, ignorada: true });
  expect(tarea).toHaveBeenCalledTimes(1);
  await act(async () => pedido.resolver(null));
});

test("al desmontar cancela el pedido y no informa el resultado", async () => {
  const pedido = promesaControlada();
  let senal;
  const { result, unmount } = renderHook(() =>
    useMutacion((signal) => {
      senal = signal;
      return pedido.promesa;
    }),
  );

  let ejecucion;
  act(() => {
    ejecucion = result.current.ejecutar();
  });
  unmount();
  pedido.resolver({ id: "tarde" });

  expect(senal.aborted).toBe(true);
  await expect(ejecucion).resolves.toMatchObject({ ignorada: true });
});

test("usa el mensaje propio de la operación para el status que lo tiene", async () => {
  const conMensaje = vi.fn((mensaje) => ({ status: 409, mensaje }));
  const falla = { status: 409, mensaje: "Genérico", conMensaje };
  const mensajes = { 409: "Ya te postulaste a este proyecto." };
  const { result } = renderHook(() =>
    useMutacion(() => Promise.reject(falla), { mensajes }),
  );

  let resultado;
  await act(async () => {
    resultado = await result.current.ejecutar();
  });

  expect(conMensaje).toHaveBeenCalledWith("Ya te postulaste a este proyecto.");
  expect(resultado.error.mensaje).toBe("Ya te postulaste a este proyecto.");
  expect(result.current.error.mensaje).toBe("Ya te postulaste a este proyecto.");
});

test("sin mensaje propio para ese status deja el error como vino", async () => {
  const falla = { status: 500, mensaje: "Servidor", conMensaje: vi.fn() };
  const { result } = renderHook(() =>
    useMutacion(() => Promise.reject(falla), { mensajes: { 409: "Otro" } }),
  );

  await act(async () => {
    await result.current.ejecutar();
  });

  expect(falla.conMensaje).not.toHaveBeenCalled();
  expect(result.current.error).toBe(falla);
});
