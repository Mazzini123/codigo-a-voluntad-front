import { act, renderHook } from "@testing-library/react";
import { useMasResultados } from "./useMasResultados.js";

const meta = { page: 1, per_page: 2, total: 4, total_pages: 2 };

test("carga la página siguiente una sola vez ante doble clic y evita repetir elementos", async () => {
  const iniciales = [{ id: "a" }, { id: "b" }];
  let resolver;
  const tarea = vi.fn(
    () =>
      new Promise((fin) => {
        resolver = fin;
      }),
  );
  const { result } = renderHook(() => useMasResultados(iniciales, meta, tarea));
  let fin;
  act(() => {
    fin = result.current.cargarMas();
    void result.current.cargarMas();
  });
  expect(tarea).toHaveBeenCalledTimes(1);
  expect(tarea.mock.calls[0][0]).toEqual({ page: 2, limit: 2 });
  await act(async () => {
    resolver({ data: [{ id: "b" }, { id: "c" }], meta: { ...meta, page: 2 } });
    await fin;
  });
  expect(result.current.items.map((i) => i.id)).toEqual(["a", "b", "c"]);
  expect(result.current.hayMas).toBe(false);
});

test("cambiar el recurso aborta el pedido y descarta su respuesta tardía", async () => {
  let resolver;
  const tarea = vi.fn(
    () =>
      new Promise((fin) => {
        resolver = fin;
      }),
  );
  const { result, rerender } = renderHook(
    ({ items }) => useMasResultados(items, meta, tarea),
    { initialProps: { items: [{ id: "a" }] } },
  );
  let fin;
  act(() => {
    fin = result.current.cargarMas();
  });
  rerender({ items: [{ id: "nuevo" }] });
  expect(tarea.mock.calls[0][1].aborted).toBe(true);
  await act(async () => {
    resolver({ data: [{ id: "viejo" }], meta: { ...meta, page: 2 } });
    await fin;
  });
  expect(result.current.items).toEqual([{ id: "nuevo" }]);
  expect(result.current.meta.page).toBe(1);
});

test("un error conserva los datos y permite reintentar la misma página", async () => {
  const iniciales = [{ id: "a" }];
  const tarea = vi
    .fn()
    .mockRejectedValueOnce(new Error("sin red"))
    .mockResolvedValueOnce({ data: [{ id: "b" }], meta: { ...meta, page: 2 } });
  const { result } = renderHook(() => useMasResultados(iniciales, meta, tarea));
  await act(async () => {
    await result.current.cargarMas();
  });
  expect(result.current.error.message).toBe("sin red");
  expect(result.current.items).toEqual(iniciales);
  await act(async () => {
    await result.current.cargarMas();
  });
  expect(tarea.mock.calls.map(([query]) => query.page)).toEqual([2, 2]);
  expect(result.current.items).toHaveLength(2);
});
