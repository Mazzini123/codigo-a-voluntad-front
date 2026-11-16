import { crearDestacarProyecto } from "./DestacarProyecto.js";
import { crearQuitarDestacado } from "./QuitarDestacado.js";

test("destacar manda la fecha de fin al HttpClient y devuelve su cuerpo", async () => {
  const destacar = vi.fn(async () => ({ id: "p1", destacado: { hasta: "2026-12-15" } }));
  const signal = new AbortController().signal;
  const resultado = await crearDestacarProyecto({ destacar })("p1", "2026-12-15", {
    signal,
  });
  expect(destacar).toHaveBeenCalledWith("p1", { hasta: "2026-12-15" }, { signal });
  expect(resultado.destacado.hasta).toBe("2026-12-15");
});

test("quitar el destacado delega en el HttpClient", async () => {
  const quitar = vi.fn(async () => undefined);
  await crearQuitarDestacado({ quitar })("p1", { signal: undefined });
  expect(quitar).toHaveBeenCalledWith("p1", { signal: undefined });
});
