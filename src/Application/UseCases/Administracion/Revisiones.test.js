import { crearListarRevisiones } from "./ListarRevisiones.js";
import { crearResolverRevision } from "./ResolverRevision.js";

test("listar revisiones devuelve la página adaptada", async () => {
  const listarRevisiones = vi.fn(async () => ({
    data: [{ id: "r1" }],
    meta: { page: 2, per_page: 20, total: 21, total_pages: 2 },
  }));
  const signal = new AbortController().signal;
  const pagina = await crearListarRevisiones({ listarRevisiones })(
    { page: 2, limit: 20, estado: "PENDIENTE" },
    { signal },
  );
  expect(listarRevisiones).toHaveBeenCalledWith(
    { page: 2, limit: 20, estado: "PENDIENTE" },
    { signal },
  );
  expect(pagina).toEqual({
    items: [{ id: "r1" }],
    pagina: 2,
    porPagina: 20,
    total: 21,
    totalPaginas: 2,
  });
});

test("resolver manda el estado y la nota sin espacios sobrantes", async () => {
  const resolverRevision = vi.fn(async () => ({ id: "r1" }));
  const resolver = crearResolverRevision({ resolverRevision });
  await resolver("r1", { estado: "REVISADA", nota: "  Hablé con ellas.  " });
  expect(resolverRevision).toHaveBeenCalledWith(
    "r1",
    { estado: "REVISADA", nota: "Hablé con ellas." },
    {},
  );
});

test("resolver sin nota no la manda", async () => {
  const resolverRevision = vi.fn(async () => ({ id: "r1" }));
  const resolver = crearResolverRevision({ resolverRevision });
  await resolver("r1", { estado: "DESCARTADA", nota: "   " });
  expect(resolverRevision).toHaveBeenCalledWith("r1", { estado: "DESCARTADA" }, {});
});
