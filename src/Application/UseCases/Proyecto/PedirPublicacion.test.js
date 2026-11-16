import { crearPedirPublicacion } from "./PedirPublicacion.js";

test("pedir la publicación delega en el cliente con el id y la señal", async () => {
  const pedirPublicacion = vi.fn(async () => ({ id: "p1", estado: "EN_REVISION" }));
  const signal = new AbortController().signal;
  const proyecto = await crearPedirPublicacion({ pedirPublicacion })("p1", { signal });
  expect(pedirPublicacion).toHaveBeenCalledWith("p1", { signal });
  expect(proyecto).toEqual({ id: "p1", estado: "EN_REVISION" });
});
