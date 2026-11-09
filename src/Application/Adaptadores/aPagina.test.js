import { aPagina } from "./aPagina.js";

test("traduce el sobre paginado del back a nombres del front", () => {
  const proyecto = { id: "p1" };
  expect(
    aPagina({
      data: [proyecto],
      meta: { page: 2, per_page: 12, total: 13, total_pages: 2 },
    }),
  ).toEqual({ items: [proyecto], pagina: 2, porPagina: 12, total: 13, totalPaginas: 2 });
});

test("sin datos devuelve una lista vacía", () => {
  expect(
    aPagina({ meta: { page: 1, per_page: 10, total: 0, total_pages: 0 } }).items,
  ).toEqual([]);
  expect(aPagina(undefined).items).toEqual([]);
});

test("conserva el total de no leídos cuando el back lo informa", () => {
  expect(
    aPagina({
      data: [],
      meta: { page: 1, per_page: 10, total: 0, total_pages: 0, unread: 3 },
    }).noLeidas,
  ).toBe(3);
  expect(aPagina({ data: [], meta: { page: 1 } })).not.toHaveProperty("noLeidas");
});
