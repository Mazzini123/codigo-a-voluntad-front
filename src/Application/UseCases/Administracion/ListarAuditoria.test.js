import { crearListarAuditoria } from "./ListarAuditoria.js";

test("listar la auditoría devuelve la página adaptada", async () => {
  const listarAuditoria = vi.fn(async () => ({
    data: [{ id: "a1" }],
    meta: { page: 1, per_page: 20, total: 1, total_pages: 1 },
  }));
  const signal = new AbortController().signal;
  const pagina = await crearListarAuditoria({ listarAuditoria })(
    { page: 1, limit: 20, accion: "REVISION_RESUELTA" },
    { signal },
  );
  expect(listarAuditoria).toHaveBeenCalledWith(
    { page: 1, limit: 20, accion: "REVISION_RESUELTA" },
    { signal },
  );
  expect(pagina.items).toEqual([{ id: "a1" }]);
  expect(pagina.totalPaginas).toBe(1);
});
