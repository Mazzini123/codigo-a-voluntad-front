import { crearListarDestacadosDeAdministracion } from "./ListarDestacadosDeAdministracion.js";
import { crearListarProyectosParaBaja } from "./ListarProyectosParaBaja.js";

test("listar proyectos para dar de baja manda la query y adapta la página", async () => {
  const listarProyectos = vi.fn(async () => ({
    data: [{ id: "p1", titulo: "Huerta", conflictoDeIntereses: false }],
    meta: { page: 2, per_page: 12, total: 13, total_pages: 2 },
  }));
  const signal = new AbortController().signal;
  const query = { page: 2, limit: 12, q: "huerta", estado: "BORRADOR" };
  const resultado = await crearListarProyectosParaBaja({ listarProyectos })(query, {
    signal,
  });
  expect(listarProyectos).toHaveBeenCalledWith(query, { signal });
  expect(resultado).toEqual({
    items: [{ id: "p1", titulo: "Huerta", conflictoDeIntereses: false }],
    pagina: 2,
    porPagina: 12,
    total: 13,
    totalPaginas: 2,
  });
});

test("listar destacados de administración devuelve el array tal cual y tolera otra forma", async () => {
  const destacados = [
    { id: "p1", destacado: { desde: "2026-11-01", hasta: "2026-12-15" } },
  ];
  const signal = new AbortController().signal;
  const listarDestacados = vi.fn(async () => destacados);
  expect(
    await crearListarDestacadosDeAdministracion({ listarDestacados })({ signal }),
  ).toEqual(destacados);
  expect(listarDestacados).toHaveBeenCalledWith({ signal });
  expect(
    await crearListarDestacadosDeAdministracion({ listarDestacados: async () => null })(),
  ).toEqual([]);
});
